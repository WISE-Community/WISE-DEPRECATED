import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import * as angular from 'angular';
import { NotificationService } from '../../../../services/notificationService';
import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  templateUrl: 'node-advanced-json-authoring.component.html'
})
export class NodeAdvancedJsonAuthoringComponent {
  node: any;
  nodeContentJSONString: string;
  nodeContentChanged: Subject<string> = new Subject<string>();
  nodeContentChangedSubscription: Subscription;
  nodeId: string;

  constructor(
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {}

  ngOnInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.nodeContentJSONString = angular.toJson(this.node, 4);
    this.NotificationService.showJSONValidMessage();
    this.nodeContentChangedSubscription = this.nodeContentChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((newText) => {
        this.nodeContentJSONString = newText;
        this.autoSaveJSON();
      });
  }

  ngOnDestroy() {
    this.nodeContentChangedSubscription.unsubscribe();
  }

  autoSaveJSON() {
    try {
      const updatedNode = angular.fromJson(this.nodeContentJSONString);
      this.node = updatedNode;
      this.ProjectService.setNode(this.nodeId, updatedNode);
      this.ProjectService.saveProject().then(() => {
        this.ProjectService.refreshProject();
      });
      this.NotificationService.showJSONValidMessage();
    } catch (e) {
      this.NotificationService.showJSONInvalidMessage();
    }
  }
}
