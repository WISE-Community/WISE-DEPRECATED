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
              CRaterService,
              NodeService,
              NotebookService,
              NotificationService,
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
      CRaterService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'Graph' }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.refreshContentInAuthoringPreview();
    }.bind(this), true);

    this.$scope.$on('assetSelected', (event, args) => {
      if (this.isEventTargetThisComponent(args)) {
        const fileName = args.assetItem.fileName;

        if (args.target == 'rubric') {
          const summernoteId = this.createSummernoteRubricId();
          this.restoreSummernoteCursorPosition(summernoteId);
          const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
          const fullAssetPath = assetsDirectoryPath + '/' + fileName;
          if (this.UtilService.isImage(fileName)) {
            this.insertImageIntoSummernote(fullAssetPath, fileName);
          } else if (this.UtilService.isVideo(fileName)) {
            this.insertVideoIntoSummernote(fullAssetPath);
          }
        } else if (args.target == 'image') {
          args.targetObject.image = fileName;
        } else if (args.target == 'imageMovingLeft') {
          args.targetObject.imageMovingLeft = fileName;
        } else if (args.target == 'imageMovingRight') {
          args.targetObject.imageMovingRight = fileName;
        }
      }

      this.authoringViewComponentChanged();
      this.$mdDialog.hide();
    });
  }

  refreshContentInAuthoringPreview() {
    this.submitCounter = 0;
    this.latestAnnotations = null;
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.removeAllObjects();
    this.initializeCoordinates();
    this.setup();
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

  authoringAddDataPointToObject(animationObject) {
    if (this.animationObjectHasDataSource(animationObject)) {
      if (this.askIfWantToDeleteDataSource()) {
        delete animationObject.dataSource;
        this.addNewDataPoint(animationObject);
      }
    } else {
      this.addNewDataPoint(animationObject);
    }

    this.authoringViewComponentChanged();
  }

  animationObjectHasDataSource(animationObject) {
    return animationObject.dataSource != null;
  }

  askIfWantToDeleteDataSource() {
    return confirm(this.$translate('animation.areYouSureYouWantToAddADataPoint'));
  }

  initializeAnimationObjectDataIfNecessary(animationObject) {
    if (animationObject.data == null) {
      animationObject.data = [];
    }
  }

  addNewDataPoint(animationObject) {
    this.initializeAnimationObjectDataIfNecessary(animationObject);
    const newDataPoint = {};
    animationObject.data.push(newDataPoint);
  }

  authoringDeleteAnimationObjectDataPointClicked(animationObject, index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'))) {
      animationObject.data.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAnimationObjectDataPointUp(object, index) {
    if (this.canMoveUp(index)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index - 1, 0, dataPoint);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAnimationObjectDataPointDown(object, index) {
    if (this.canMoveDown(index, object.data.length)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index + 1, 0, dataPoint);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAnimationObjectUp(index) {
    if (this.canMoveUp(index)) {
      const object = this.authoringComponentContent.objects[index];
      objects.splice(index, 1);
      objects.splice(index - 1, 0, object);
      this.authoringViewComponentChanged();
    }
  }

  authoringMoveAnimationObjectDown(index) {
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

  authoringDeleteAnimationObjectClicked(index) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'))) {
      this.authoringComponentContent.objects.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringAddDataSource(animationObject) {
    if (this.animationObjectHasData(animationObject)) {
      if (confirm(this.$translate('animation.areYouSureYouWantToAddADataSource'))) {
        this.deleteDataAndAddDataSource(animationObject);
      }
    } else {
      this.deleteDataAndAddDataSource(animationObject);
    }
    this.authoringViewComponentChanged();
  }

  deleteDataAndAddDataSource(animationObject) {
    this.deleteDataFromAnimationObject(animationObject);
    this.addDataSourceToAnimationObject(animationObject);
  }

  deleteDataFromAnimationObject(animationObject) {
    delete animationObject.data;
  }

  addDataSourceToAnimationObject(animationObject) {
    animationObject.dataSource = {};
  }

  animationObjectHasData(animationObject) {
    return animationObject.data != null && animationObject.data.length > 0;
  }

  authoringDeleteDataSourceClicked(animationObject) {
    if (confirm(this.$translate('animation.areYouSureYouWantToDeleteTheDataSource'))) {
      delete animationObject.dataSource;
      this.authoringViewComponentChanged();
    }
  }

  dataSourceNodeChanged(animationObject) {
    const nodeId = animationObject.dataSource.nodeId;
    animationObject.dataSource = {
      nodeId: nodeId
    }
    this.authoringViewComponentChanged();
  }

  dataSourceComponentChanged(animationObject) {
    const nodeId = animationObject.dataSource.nodeId;
    const componentId = animationObject.dataSource.componentId;
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    animationObject.dataSource = {
      nodeId: nodeId,
      componentId: componentId
    };

    if (component.type == 'Graph') {
      this.setDefaultParamsForGraphDataSource(animationObject);
    }

    this.authoringViewComponentChanged();
  }

  setDefaultParamsForGraphDataSource(animationObject) {
    animationObject.dataSource.trialIndex = 0;
    animationObject.dataSource.seriesIndex = 0;
    animationObject.dataSource.tColumnIndex = 0;
    animationObject.dataSource.xColumnIndex = 1;
  }

  chooseImage(animationObject) {
    const targetString = 'image';
    const params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  chooseImageMovingLeft(animationObject) {
    const targetString = 'imageMovingLeft';
    const params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  chooseImageMovingRight(animationObject) {
    const targetString = 'imageMovingRight';
    const params = this.createOpenAssetChooserParamsObject(targetString, animationObject);
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * @param {string} targetString Can be 'image', 'imageMovingLeft', or 'imageMovingRight'.
   * @param {object} animationObject
   * @returns {object}
   */
  createOpenAssetChooserParamsObject(targetString, animationObject) {
    return {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: targetString,
      targetObject: animationObject
    };
  }

  authoringAnimationObjectTypeChanged(animationObject) {
    if (animationObject.type == 'image') {
      this.removeTextFromAnimationObject(animationObject);
    } else if (animationObject.type == 'text') {
      this.removeImageFromAnimationObject(animationObject);
    }

    this.authoringViewComponentChanged();
  }

  removeTextFromAnimationObject(animationObject) {
    delete animationObject.text;
  }

  removeImageFromAnimationObject(animationObject) {
    delete animationObject.image;
    delete animationObject.width;
    delete animationObject.height;
    delete animationObject.imageMovingLeft;
    delete animationObject.imageMovingRight;
    delete animationObject.imageMovingUp;
    delete animationObject.imageMovingDown;
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
  'CRaterService',
  'NodeService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default AnimationAuthoringController;
