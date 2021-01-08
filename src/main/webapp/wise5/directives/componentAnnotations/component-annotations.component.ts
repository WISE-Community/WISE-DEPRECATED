'use strict';

import { Component, Input } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/configService';
import { StudentDataService } from '../../services/studentDataService';
import { VLEProjectService } from '../../vle/vleProjectService';

@Component({
  selector: 'component-annotations',
  styleUrls: ['component-annotations.component.scss'],
  templateUrl: 'component-annotations.component.html'
})
export class ComponentAnnotationsComponent {
  @Input()
  annotations: any;
  maxScoreDisplay: string;
  nodeId: string = null;
  componentId: string = null;
  latestAnnotationTime: any = null;
  isNew: boolean;
  label: string = '';

  @Input()
  maxScore: string;
  icon: string = 'person';
  showScore: boolean = true;
  showComment: boolean = true;
  studentWorkSavedToServerSubscription: Subscription;

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private ProjectService: VLEProjectService,
    private StudentDataService: StudentDataService
  ) {}

  ngOnInit() {
    this.maxScoreDisplay = parseInt(this.maxScore) > 0 ? '/' + this.maxScore : '';
    this.studentWorkSavedToServerSubscription = this.StudentDataService.studentWorkSavedToServer$.subscribe(
      ({ studentWork }) => {
        if (studentWork.nodeId === this.nodeId && studentWork.componentId === this.componentId) {
          this.isNew = false;
        }
      }
    );
  }

  ngOnChanges() {
    this.processAnnotations();
  }

  ngOnDestroy() {
    this.studentWorkSavedToServerSubscription.unsubscribe();
  }

  processAnnotations() {
    if (this.annotations.comment || this.annotations.score) {
      this.nodeId = this.annotations.comment
        ? this.annotations.comment.nodeId
        : this.annotations.score.nodeId;
      this.componentId = this.annotations.comment
        ? this.annotations.comment.componentId
        : this.annotations.score.nodeId;
      this.showScore =
        this.annotations.score != null &&
        this.ProjectService.displayAnnotation(this.annotations.score);
      this.showComment =
        this.annotations.comment != null &&
        this.ProjectService.displayAnnotation(this.annotations.comment);
      this.setLabelAndIcon();
    }
  }

  getLatestAnnotation() {
    let latest = null;
    if (this.annotations.comment || this.annotations.score) {
      let commentSaveTime = this.annotations.comment ? this.annotations.comment.serverSaveTime : 0;
      let scoreSaveTime = this.annotations.score ? this.annotations.score.serverSaveTime : 0;
      if (commentSaveTime >= scoreSaveTime) {
        latest = this.annotations.comment;
      } else if (scoreSaveTime > commentSaveTime) {
        latest = this.annotations.score;
      }
    }
    return latest;
  }

  getLatestAnnotationTime() {
    const latest = this.getLatestAnnotation();
    if (latest) {
      return this.ConfigService.convertToClientTimestamp(latest.serverSaveTime);
    }
    return null;
  }

  getLatestVisitTime() {
    let nodeEvents = this.StudentDataService.getEventsByNodeId(this.nodeId);
    let n = nodeEvents.length - 1;
    let visitTime = null;
    for (let i = n; i > 0; i--) {
      let event = nodeEvents[i];
      if (event.event === 'nodeExited') {
        visitTime = this.ConfigService.convertToClientTimestamp(event.serverSaveTime);
        break;
      }
    }
    return visitTime;
  }

  getLatestSaveTime() {
    const latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    let saveTime = null;
    if (latestState) {
      saveTime = this.ConfigService.convertToClientTimestamp(latestState.serverSaveTime);
    }
    return saveTime;
  }

  isNewAnnotation() {
    let latestVisitTime = this.getLatestVisitTime();
    let latestSaveTime = this.getLatestSaveTime();
    let latestAnnotationTime = this.getLatestAnnotationTime();
    let isNew = true;
    if (latestVisitTime && latestVisitTime > latestAnnotationTime) {
      isNew = false;
    }
    if (latestSaveTime && latestSaveTime > latestAnnotationTime) {
      isNew = false;
    }
    return isNew;
  }

  setLabelAndIcon() {
    const latest = this.getLatestAnnotation();
    if (latest) {
      if (latest.type === 'autoComment' || latest.type === 'autoScore') {
        this.label = this.upgrade.$injector.get('$filter')('translate')('automatedFeedbackLabel');
        this.icon = 'keyboard';
      } else {
        this.label = this.upgrade.$injector.get('$filter')('translate')('teacherFeedbackLabel');
        this.icon = 'person';
      }
    }
  }
}
