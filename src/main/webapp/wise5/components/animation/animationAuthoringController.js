'use strict';

import AnimationController from './animationController';

class AnimationAuthoringController extends AnimationController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnimationService,
              AnnotationService,
              ConfigService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnimationService,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'Graph' }
    ];
  }

  handleAuthoringComponentContentChanged(newValue, oldValue) {
    super.handleAuthoringComponentContentChanged(newValue, oldValue);
    this.refreshContentInAuthoringPreview();
  }

  refreshContentInAuthoringPreview() {
    this.removeAllObjectsFromSVG();
    this.initializeCoordinates();
    this.setupSVG();
  }

  assetSelected(event, args) {
    if (this.isEventTargetThisComponent(args)) {
      const fileName = args.assetItem.fileName;
      if (args.target === 'rubric') {
        const summernoteId = this.getSummernoteId(args);
        this.restoreSummernoteCursorPosition(summernoteId);
        const fullAssetPath = this.getFullAssetPath(fileName);
        if (this.UtilService.isImage(fileName)) {
          this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      } else if (args.target === 'image') {
        args.targetObject.image = fileName;
        this.authoringViewComponentChanged();
      } else if (args.target === 'imageMovingLeft') {
        args.targetObject.imageMovingLeft = fileName;
        this.authoringViewComponentChanged();
      } else if (args.target === 'imageMovingRight') {
        args.targetObject.imageMovingRight = fileName;
        this.authoringViewComponentChanged();
      }
    }
    this.$mdDialog.hide();
  }

  removeAllObjectsFromSVG() {
    const ids = Object.keys(this.idToSVGObject);
    for (let id of ids) {
      const svgObject = this.idToSVGObject[id];
      svgObject.remove();
    }
  }

  authoringAddObject() {
    if (this.authoringComponentContent.objects == null) {
      this.authoringComponentContent.objects = [];
    }
    const newObject = {
      id: this.UtilService.generateKey(10),
      type: 'image'
    };
    this.authoringComponentContent.objects.push(newObject);
    this.authoringViewComponentChanged();
  }

  authoringAddDataPointToObject(authoredObject) {
    if (this.authoredObjectHasDataSource(authoredObject)) {
      if (this.askIfWantToDeleteDataSource()) {
        delete authoredObject.dataSource;
        this.addNewDataPoint(authoredObject);
      }
    } else {
      this.addNewDataPoint(authoredObject);
    }
    this.authoringViewComponentChanged();
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

  authoringConfirmDeleteAnimationObjectDataPoint(animationObject, index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'))) {
      this.authoringDeleteAnimationObjectDataPoint(animationObject, index);
    }
  }

  authoringDeleteAnimationObjectDataPoint(animationObject, index) {
    animationObject.data.splice(index, 1);
    this.authoringViewComponentChanged();
  }

  authoringMoveAnimationObjectDataPointUp(object, index) {
    if (this.canMoveUp(index)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index - 1, 0, dataPoint);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAuthoredObjectDataPointDown(object, index) {
    if (this.canMoveDown(index, object.data.length)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index + 1, 0, dataPoint);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAuthoredObjectUp(index) {
    if (this.canMoveUp(index)) {
      const object = this.authoringComponentContent.objects[index];
      objects.splice(index, 1);
      objects.splice(index - 1, 0, object);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAuthoredObjectDown(index) {
    const objects = this.authoringComponentContent.objects;
    if (this.canMoveDown(index, objects.length)) {
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index + 1, 0, object);
      this.authoringViewComponentChanged();
    }
  }

  canMoveUp(index) {
    return index > 0;
  }

  canMoveDown(index, length) {
    return index < length - 1;
  }

  authoringConfirmDeleteAnimationObject(index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'))) {
      this.authoringDeleteAnimationObject(index);
    }
  }

  authoringDeleteAnimationObject(index) {
    this.authoringComponentContent.objects.splice(index, 1);
    this.authoringViewComponentChanged();
  }

  authoringAddDataSource(authoredObject) {
    if (this.authoredObjectHasData(authoredObject)) {
      if (confirm(this.$translate('animation.areYouSureYouWantToAddADataSource'))) {
        this.deleteDataAndAddDataSource(authoredObject);
      }
    } else {
      this.deleteDataAndAddDataSource(authoredObject);
    }
    this.authoringViewComponentChanged();
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

  authoringConfirmDeleteDataSource(animationObject) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteTheDataSource'))) {
      this.authoringDeleteDataSource(animationObject);
    }
  }

  authoringDeleteDataSource(animationObject) {
    delete animationObject.dataSource;
    this.authoringViewComponentChanged();
  }

  dataSourceNodeChanged(authoredObject) {
    const nodeId = authoredObject.dataSource.nodeId;
    // clear the dataSource object except for the node id
    authoredObject.dataSource = {
      nodeId: nodeId
    }
    this.authoringViewComponentChanged();
  }

  dataSourceComponentChanged(authoredObject) {
    const nodeId = authoredObject.dataSource.nodeId;
    const componentId = authoredObject.dataSource.componentId;
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    authoredObject.dataSource = {
      nodeId: nodeId,
      componentId: componentId
    };

    if (component.type == 'Graph') {
      this.setDefaultParamsForGraphDataSource(authoredObject);
    }
    this.authoringViewComponentChanged();
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
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  chooseImageMovingLeft(authoredObject) {
    const targetString = 'imageMovingLeft';
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  chooseImageMovingRight(authoredObject) {
    const targetString = 'imageMovingRight';
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.$rootScope.$broadcast('openAssetChooser', params);
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

  authoringAuthoredObjectTypeChanged(authoredObject) {
    if (authoredObject.type == 'image') {
      this.removeTextFromAuthoredObject(authoredObject);
    } else if (authoredObject.type == 'text') {
      this.removeImageFromAuthoredObject(authoredObject);
    }
    this.authoringViewComponentChanged();
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
}

AnimationAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnimationService',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default AnimationAuthoringController;
