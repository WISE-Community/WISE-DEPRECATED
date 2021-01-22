'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class AnimationAuthoringController extends EditComponentController {
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

  addObject() {
    if (this.authoringComponentContent.objects == null) {
      this.authoringComponentContent.objects = [];
    }
    const newObject = {
      id: this.UtilService.generateKey(10),
      type: 'image'
    };
    this.authoringComponentContent.objects.push(newObject);
    this.componentChanged();
  }

  addDataPointToObject(authoredObject) {
    if (this.authoredObjectHasDataSource(authoredObject)) {
      if (this.askIfWantToDeleteDataSource()) {
        delete authoredObject.dataSource;
        this.addNewDataPoint(authoredObject);
      }
    } else {
      this.addNewDataPoint(authoredObject);
    }
    this.componentChanged();
  }

  authoredObjectHasDataSource(authoredObject) {
    return authoredObject.dataSource != null;
  }

  askIfWantToDeleteDataSource() {
    return confirm(this.$translate('animation.areYouSureYouWantToAddADataPoint'));
  }

  initializeAuthoredObjectDataIfNecessary(authoredObject) {
    if (authoredObject.data == null) {
      authoredObject.data = [];
    }
  }

  addNewDataPoint(authoredObject) {
    this.initializeAuthoredObjectDataIfNecessary(authoredObject);
    const newDataPoint = {};
    authoredObject.data.push(newDataPoint);
  }

  confirmDeleteAnimationObjectDataPoint(animationObject, index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'))) {
      this.deleteAnimationObjectDataPoint(animationObject, index);
    }
  }

  deleteAnimationObjectDataPoint(animationObject, index) {
    animationObject.data.splice(index, 1);
    this.componentChanged();
  }

  authoringMoveAnimationObjectDataPointUp(object, index) {
    if (this.canMoveUp(index)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index - 1, 0, dataPoint);
      this.componentChanged();
    }
  }

  moveAuthoredObjectDataPointUp(object, index) {
    if (this.canMoveUp(index)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index - 1, 0, dataPoint);
      this.componentChanged();
    }
  }

  moveAuthoredObjectDataPointDown(object, index) {
    if (this.canMoveDown(index, object.data.length)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index + 1, 0, dataPoint);
      this.componentChanged();
    }
  }

  moveAuthoredObjectUp(index) {
    if (this.canMoveUp(index)) {
      const objects = this.authoringComponentContent.objects;
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index - 1, 0, object);
      this.componentChanged();
    }
  }

  moveAuthoredObjectDown(index) {
    const objects = this.authoringComponentContent.objects;
    if (this.canMoveDown(index, objects.length)) {
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index + 1, 0, object);
      this.componentChanged();
    }
  }

  canMoveUp(index) {
    return index > 0;
  }

  canMoveDown(index, length) {
    return index < length - 1;
  }

  confirmDeleteAnimationObject(index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'))) {
      this.deleteAnimationObject(index);
    }
  }

  deleteAnimationObject(index) {
    this.authoringComponentContent.objects.splice(index, 1);
    this.componentChanged();
  }

  addDataSource(authoredObject) {
    if (this.authoredObjectHasData(authoredObject)) {
      if (confirm(this.$translate('animation.areYouSureYouWantToAddADataSource'))) {
        this.deleteDataAndAddDataSource(authoredObject);
      }
    } else {
      this.deleteDataAndAddDataSource(authoredObject);
    }
    this.componentChanged();
  }

  authoredObjectHasData(authoredObject) {
    return authoredObject.data != null && authoredObject.data.length > 0;
  }

  deleteDataAndAddDataSource(authoredObject) {
    this.deleteDataFromAuthoredObject(authoredObject);
    this.addDataSourceToAuthoredObject(authoredObject);
  }

  deleteDataFromAuthoredObject(authoredObject) {
    delete authoredObject.data;
  }

  addDataSourceToAuthoredObject(authoredObject) {
    authoredObject.dataSource = {};
  }

  confirmDeleteDataSource(animationObject) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteTheDataSource'))) {
      this.authoringDeleteDataSource(animationObject);
    }
  }

  authoringDeleteDataSource(animationObject) {
    delete animationObject.dataSource;
    this.componentChanged();
  }

  dataSourceNodeChanged(authoredObject) {
    const nodeId = authoredObject.dataSource.nodeId;
    authoredObject.dataSource = {
      nodeId: nodeId
    };
    this.componentChanged();
  }

  dataSourceComponentChanged(authoredObject) {
    const nodeId = authoredObject.dataSource.nodeId;
    const componentId = authoredObject.dataSource.componentId;
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    authoredObject.dataSource = {
      nodeId: nodeId,
      componentId: componentId
    };
    if (component.type === 'Graph') {
      this.setDefaultParamsForGraphDataSource(authoredObject);
    }
    this.componentChanged();
  }

  setDefaultParamsForGraphDataSource(authoredObject) {
    authoredObject.dataSource.trialIndex = 0;
    authoredObject.dataSource.seriesIndex = 0;
    authoredObject.dataSource.tColumnIndex = 0;
    authoredObject.dataSource.xColumnIndex = 1;
  }

  chooseImage(authoredObject) {
    const targetString = 'image';
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.openAssetChooser(params);
  }

  chooseImageMovingLeft(authoredObject) {
    const targetString = 'imageMovingLeft';
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.openAssetChooser(params);
  }

  chooseImageMovingRight(authoredObject) {
    const targetString = 'imageMovingRight';
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.openAssetChooser(params);
  }

  /**
   * @param {string} targetString Can be 'image', 'imageMovingLeft', or 'imageMovingRight'.
   * @param {object} authoredObject
   * @returns {object}
   */
  createOpenAssetChooserParamsObject(targetString, authoredObject) {
    return {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: targetString,
      targetObject: authoredObject
    };
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }) {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'image') {
      targetObject.image = assetItem.fileName;
    } else if (target === 'imageMovingLeft') {
      targetObject.imageMovingLeft = assetItem.fileName;
    } else if (target === 'imageMovingRight') {
      targetObject.imageMovingRight = assetItem.fileName;
    }
    this.componentChanged();
  }

  authoredObjectTypeChanged(authoredObject) {
    if (authoredObject.type === 'image') {
      this.removeTextFromAuthoredObject(authoredObject);
    } else if (authoredObject.type === 'text') {
      this.removeImageFromAuthoredObject(authoredObject);
    }
    this.componentChanged();
  }

  removeTextFromAuthoredObject(authoredObject) {
    delete authoredObject.text;
  }

  removeImageFromAuthoredObject(authoredObject) {
    delete authoredObject.image;
    delete authoredObject.width;
    delete authoredObject.height;
    delete authoredObject.imageMovingLeft;
    delete authoredObject.imageMovingRight;
    delete authoredObject.imageMovingUp;
    delete authoredObject.imageMovingDown;
  }

  getComponentByNodeIdAndComponentId(nodeId: string, componentId: string) {
    return this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
  }
}

const AnimationAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: AnimationAuthoringController,
  controllerAs: 'animationController',
  templateUrl: 'wise5/components/animation/authoring.html'
};

export default AnimationAuthoring;
