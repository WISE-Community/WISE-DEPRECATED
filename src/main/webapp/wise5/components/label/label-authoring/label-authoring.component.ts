'use strict';

import { Component } from '@angular/core';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'label-authoring',
  templateUrl: 'label-authoring.component.html',
  styleUrls: ['label-authoring.component.scss']
})
export class LabelAuthoring extends ComponentAuthoring {
  numberInputChange: Subject<number> = new Subject<number>();
  textInputChange: Subject<string> = new Subject<string>();

  numberInputChangeSubscription: Subscription;
  textInputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.numberInputChangeSubscription = this.numberInputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.textInputChangeSubscription = this.textInputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.authoringComponentContent.enableCircles == null) {
      // If this component was created before enableCircles was implemented, we will default it to
      // true in the authoring so that the "Enable Dots" checkbox is checked.
      this.authoringComponentContent.enableCircles = true;
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.numberInputChangeSubscription.unsubscribe();
    this.textInputChangeSubscription.unsubscribe();
  }

  addLabel(): void {
    const newLabel = {
      text: $localize`Enter text here`,
      color: 'blue',
      pointX: 100,
      pointY: 100,
      textX: 200,
      textY: 200,
      canEdit: false,
      canDelete: false
    };
    this.authoringComponentContent.labels.push(newLabel);
    this.componentChanged();
  }

  deleteLabel(index: number, label: any): void {
    if (confirm($localize`Are you sure you want to delete this label?\n\n${label.text}`)) {
      this.authoringComponentContent.labels.splice(index, 1);
      this.componentChanged();
    }
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    const fileName = assetItem.fileName;
    if (target === 'background') {
      this.authoringComponentContent.backgroundImage = fileName;
      this.componentChanged();
    }
  }

  saveStarterLabels(): void {
    if (confirm($localize`Are you sure you want to save the starter labels?`)) {
      this.NodeService.requestStarterState({ nodeId: this.nodeId, componentId: this.componentId });
    }
  }

  saveStarterState(starterState: any): void {
    this.authoringComponentContent.labels = starterState;
    this.componentChanged();
  }

  compareTextAlphabetically(stringA: string, stringB: string) {
    if (stringA < stringB) {
      return -1;
    } else if (stringA > stringB) {
      return 1;
    } else {
      return 0;
    }
  }

  deleteStarterLabels(): void {
    if (confirm($localize`label.areYouSureYouWantToDeleteAllTheStarterLabels`)) {
      this.authoringComponentContent.labels = [];
      this.componentChanged();
    }
  }

  openColorViewer(): void {
    window.open('http://www.javascripter.net/faq/colornam.htm');
  }
}
