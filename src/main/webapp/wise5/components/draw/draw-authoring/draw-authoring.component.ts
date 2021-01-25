'use strict';

import * as angular from 'angular';
import { Component } from '@angular/core';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'draw-authoring',
  templateUrl: 'draw-authoring.component.html',
  styleUrls: ['draw-authoring.component.scss']
})
export class DrawAuthoring extends ComponentAuthoring {
  allToolNames: string[] = [
    'select',
    'line',
    'shape',
    'freeHand',
    'text',
    'stamp',
    'strokeColor',
    'fillColor',
    'clone',
    'strokeWidth',
    'sendBack',
    'sendForward',
    'undo',
    'redo',
    'delete'
  ];
  width: number;
  height: number;
  defaultWidth: number = 800;
  defaultHeight: number = 600;
  stamps: any[] = [];

  inputChange: Subject<string> = new Subject<string>();
  backgroundImageChange: Subject<string> = new Subject<string>();
  canvasWidthChange: Subject<string> = new Subject<string>();
  canvasHeightChange: Subject<string> = new Subject<string>();
  stampImageChange: Subject<string> = new Subject<string>();

  inputChangeSubscription: Subscription;
  backgroundImageChangeSubscription: Subscription;
  canvasWidthChangeSubscription: Subscription;
  canvasHeightChangeSubscription: Subscription;
  stampImageChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.backgroundImageChangeSubscription = this.backgroundImageChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.updateStarterDrawDataBackgroundAndSave();
      });
    this.canvasWidthChangeSubscription = this.canvasWidthChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.canvasWidthChanged();
      });
    this.canvasHeightChangeSubscription = this.canvasHeightChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.canvasHeightChanged();
      });
    this.stampImageChangeSubscription = this.stampImageChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.updateAuthoringComponentContentStampsAndSave();
      });
  }

  ngOnInit() {
    super.ngOnInit();
    this.stamps = this.convertStampStringsToStampObjects(
      this.authoringComponentContent.stamps.Stamps
    );
  }

  ngOnDestroy() {
    this.inputChangeSubscription.unsubscribe();
    this.backgroundImageChangeSubscription.unsubscribe();
    this.canvasWidthChangeSubscription.unsubscribe();
    this.canvasHeightChangeSubscription.unsubscribe();
    this.stampImageChangeSubscription.unsubscribe();
  }

  enableAllTools(doEnable: boolean) {
    if (this.authoringComponentContent.tools == null) {
      this.authoringComponentContent.tools = {};
    }
    this.allToolNames.map((toolName) => {
      this.authoringComponentContent.tools[toolName] = doEnable;
    });
    this.componentChanged();
  }

  saveStarterDrawData(): void {
    if (confirm($localize`Are you sure you want to save the starter drawing?`)) {
      this.NodeService.requestStarterState({ nodeId: this.nodeId, componentId: this.componentId });
    }
  }

  saveStarterState(starterState: any): void {
    this.authoringComponentContent.starterDrawData = starterState;
    this.componentChanged();
  }

  deleteStarterDrawData(): void {
    if (confirm($localize`Are you sure you want to delete the starter drawing?`)) {
      this.authoringComponentContent.starterDrawData = null;
      this.componentChanged();
    }
  }

  canvasWidthChanged(): void {
    this.width = this.authoringComponentContent.width;
    this.updateStarterDrawDataWidth();
    this.componentChanged();
  }

  updateStarterDrawDataWidth(): void {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(
        this.authoringComponentContent.starterDrawData
      );
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        if (this.width == null) {
          starterDrawDataJSONObject.dt.width = this.defaultWidth;
        } else {
          starterDrawDataJSONObject.dt.width = this.width;
        }
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  canvasHeightChanged(): void {
    this.height = this.authoringComponentContent.height;
    this.updateStarterDrawDataHeight();
    this.componentChanged();
  }

  updateStarterDrawDataHeight(): void {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(
        this.authoringComponentContent.starterDrawData
      );
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        if (this.height == null) {
          starterDrawDataJSONObject.dt.height = this.defaultHeight;
        } else {
          starterDrawDataJSONObject.dt.height = this.height;
        }
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  toolClicked(): void {
    this.componentChanged();
  }

  chooseStampImage(stampIndex: number): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'stamp',
      targetObject: stampIndex
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    const fileName = assetItem.fileName;
    if (target === 'background') {
      this.authoringComponentContent.background = fileName;
      this.updateStarterDrawDataBackgroundAndSave();
    } else if (target === 'stamp') {
      const stampIndex = targetObject;
      this.setStampImage(stampIndex, fileName);
      this.updateAuthoringComponentContentStampsAndSave();
    }
  }

  updateStarterDrawDataBackgroundAndSave(): void {
    this.updateStarterDrawDataBackground();
    this.componentChanged();
  }

  updateStarterDrawDataBackground(): void {
    const starterDrawData = this.authoringComponentContent.starterDrawData;
    if (starterDrawData != null) {
      const starterDrawDataJSON = angular.fromJson(starterDrawData);
      if (
        starterDrawDataJSON != null &&
        starterDrawDataJSON.canvas != null &&
        starterDrawDataJSON.canvas.backgroundImage != null &&
        starterDrawDataJSON.canvas.backgroundImage.src != null
      ) {
        const projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath(true);
        const background = this.authoringComponentContent.background;
        const newSrc = projectAssetsDirectoryPath + '/' + background;
        starterDrawDataJSON.canvas.backgroundImage.src = newSrc;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSON);
      }
    }
  }

  addStamp(): void {
    this.initializeAuthoringComponentContentStampsIfNecessary();
    this.stamps.push(this.createStamp());
    this.updateAuthoringComponentContentStampsAndSave();
  }

  initializeAuthoringComponentContentStampsIfNecessary(): void {
    if (this.authoringComponentContent.stamps == null) {
      this.authoringComponentContent.stamps = {};
    }
    if (this.authoringComponentContent.stamps.Stamps == null) {
      this.authoringComponentContent.stamps.Stamps = [];
    }
  }

  createStamp(image: string = ''): any {
    return { image: image };
  }

  updateAuthoringComponentContentStampsAndSave(): void {
    this.updateAuthoringComponentContentStamps();
    this.componentChanged();
  }

  updateAuthoringComponentContentStamps(): void {
    this.authoringComponentContent.stamps.Stamps = this.convertStampObjectsToStampStrings(
      this.stamps
    );
  }

  moveStampUp(index: number): void {
    if (index != 0) {
      const stamp = this.stamps[index];
      this.stamps.splice(index, 1);
      this.stamps.splice(index - 1, 0, stamp);
      this.updateAuthoringComponentContentStampsAndSave();
    }
  }

  moveStampDown(index: number): void {
    if (index != this.authoringComponentContent.stamps.Stamps.length - 1) {
      const stamp = this.stamps[index];
      this.stamps.splice(index, 1);
      this.stamps.splice(index + 1, 0, stamp);
      this.updateAuthoringComponentContentStampsAndSave();
    }
  }

  deleteStamp(index: number): void {
    if (
      confirm(
        $localize`Are you sure you want to delete this stamp?\n\n${this.authoringComponentContent.stamps.Stamps[index]}`
      )
    ) {
      this.stamps.splice(index, 1);
      this.updateAuthoringComponentContentStampsAndSave();
    }
  }

  setStampImage(index: number, fileName: string): void {
    this.stamps[index].image = fileName;
  }

  stampChanged(stampImage: string, index: number): void {
    this.stampImageChange.next(`${index}-${stampImage}`);
  }

  convertStampStringsToStampObjects(stampStrings: string[]): any[] {
    const stampObjects: any[] = [];
    for (let stampString of stampStrings) {
      stampObjects.push(this.createStamp(stampString));
    }
    return stampObjects;
  }

  convertStampObjectsToStampStrings(stampObjects: any[]): string[] {
    const stampStrings: string[] = [];
    for (let stampObject of stampObjects) {
      stampStrings.push(stampObject.image);
    }
    return stampStrings;
  }
}
