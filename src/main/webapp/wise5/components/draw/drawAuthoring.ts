'use strict';

import * as angular from 'angular';
import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class DrawAuthoringController extends EditComponentController {
  width: number;
  height: number;

  static $inject = [
    '$filter',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  addStampButtonClicked() {
    this.initializeAuthoringComponentContentStampsIfNecessary();
    this.authoringComponentContent.stamps.Stamps.push('');
    this.componentChanged();
  }

  initializeAuthoringComponentContentStampsIfNecessary() {
    if (this.authoringComponentContent != null) {
      if (this.authoringComponentContent.stamps == null) {
        this.authoringComponentContent.stamps = {};
      }
      if (this.authoringComponentContent.stamps.Stamps == null) {
        this.authoringComponentContent.stamps.Stamps = [];
      }
    }
  }

  moveStampUp(index) {
    if (index != 0) {
      const stamp = this.authoringComponentContent.stamps.Stamps[index];
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.authoringComponentContent.stamps.Stamps.splice(index - 1, 0, stamp);
      this.componentChanged();
    }
  }

  moveStampDown(index) {
    if (index != this.authoringComponentContent.stamps.Stamps.length - 1) {
      const stamp = this.authoringComponentContent.stamps.Stamps[index];
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.authoringComponentContent.stamps.Stamps.splice(index + 1, 0, stamp);
      this.componentChanged();
    }
  }

  deleteStampClicked(index) {
    if (
      confirm(
        this.$translate('draw.areYouSureYouWantToDeleteThisStamp') +
          '\n\n' +
          this.authoringComponentContent.stamps.Stamps[index]
      )
    ) {
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.componentChanged();
    }
  }

  enableAllToolsButtonClicked() {
    if (this.authoringComponentContent.tools == null) {
      this.authoringComponentContent.tools = {};
    }
    this.authoringComponentContent.tools.select = true;
    this.authoringComponentContent.tools.line = true;
    this.authoringComponentContent.tools.shape = true;
    this.authoringComponentContent.tools.freeHand = true;
    this.authoringComponentContent.tools.text = true;
    this.authoringComponentContent.tools.stamp = true;
    this.authoringComponentContent.tools.strokeColor = true;
    this.authoringComponentContent.tools.fillColor = true;
    this.authoringComponentContent.tools.clone = true;
    this.authoringComponentContent.tools.strokeWidth = true;
    this.authoringComponentContent.tools.sendBack = true;
    this.authoringComponentContent.tools.sendForward = true;
    this.authoringComponentContent.tools.undo = true;
    this.authoringComponentContent.tools.redo = true;
    this.authoringComponentContent.tools.delete = true;
    this.componentChanged();
  }

  disableAllToolsButtonClicked() {
    if (this.authoringComponentContent.tools == null) {
      this.authoringComponentContent.tools = {};
    }
    this.authoringComponentContent.tools.select = false;
    this.authoringComponentContent.tools.line = false;
    this.authoringComponentContent.tools.shape = false;
    this.authoringComponentContent.tools.freeHand = false;
    this.authoringComponentContent.tools.text = false;
    this.authoringComponentContent.tools.stamp = false;
    this.authoringComponentContent.tools.strokeColor = false;
    this.authoringComponentContent.tools.fillColor = false;
    this.authoringComponentContent.tools.clone = false;
    this.authoringComponentContent.tools.strokeWidth = false;
    this.authoringComponentContent.tools.sendBack = false;
    this.authoringComponentContent.tools.sendForward = false;
    this.authoringComponentContent.tools.undo = false;
    this.authoringComponentContent.tools.redo = false;
    this.authoringComponentContent.tools.delete = false;
    this.componentChanged();
  }

  saveStarterDrawData() {
    if (confirm(this.$translate('draw.areYouSureYouWantToSaveTheStarterDrawing'))) {
      this.NodeService.requestStarterState({ nodeId: this.nodeId, componentId: this.componentId });
    }
  }

  saveStarterState(starterState) {
    this.authoringComponentContent.starterDrawData = starterState;
    this.componentChanged();
  }

  deleteStarterDrawData() {
    if (confirm(this.$translate('draw.areYouSureYouWantToDeleteTheStarterDrawing'))) {
      this.authoringComponentContent.starterDrawData = null;
      this.componentChanged();
    }
  }

  viewWidthChanged() {
    this.width = this.authoringComponentContent.width;
    this.updateStarterDrawDataWidth();
    this.componentChanged();
  }

  updateStarterDrawDataWidth() {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(
        this.authoringComponentContent.starterDrawData
      );
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        starterDrawDataJSONObject.dt.width = this.width;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  viewHeightChanged() {
    this.height = this.authoringComponentContent.height;
    this.updateStarterDrawDataHeight();
    this.componentChanged();
  }

  updateStarterDrawDataHeight() {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(
        this.authoringComponentContent.starterDrawData
      );
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        starterDrawDataJSONObject.dt.height = this.height;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  toolClicked() {
    this.componentChanged();
  }

  chooseBackgroundImage() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.openAssetChooser(params);
  }

  chooseStampImage(stampIndex) {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'stamp',
      targetObject: stampIndex
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }) {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    const fileName = assetItem.fileName;
    if (target === 'background') {
      this.authoringComponentContent.background = fileName;
      this.backgroundChanged();
    } else if (target === 'stamp') {
      const stampIndex = targetObject;
      this.setStampImage(stampIndex, fileName);
      this.backgroundChanged();
    }
  }

  backgroundChanged() {
    this.updateStarterDrawDataBackground();
    this.componentChanged();
  }

  updateStarterDrawDataBackground() {
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

  setStampImage(index, fileName) {
    this.authoringComponentContent.stamps.Stamps[index] = fileName;
  }
}

const DrawAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: DrawAuthoringController,
  controllerAs: 'drawController',
  templateUrl: 'wise5/components/draw/authoring.html'
};

export default DrawAuthoring;
