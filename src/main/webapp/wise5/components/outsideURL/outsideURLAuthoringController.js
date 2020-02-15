'use strict';

import OutsideURLController from './outsideURLController';

class OutsideURLAuthoringController extends OutsideURLController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $sce,
              $scope,
              AnnotationService,
              ConfigService,
              NodeService,
              NotebookService,
              OutsideURLService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $sce,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      OutsideURLService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);
    this.isShowOERs = this.componentContent.url === '';

    $scope.$watch(() => {
      return this.authoringComponentContent;
    }, (newValue, oldValue) => {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.setURL(this.authoringComponentContent.url);
      this.setInfo(this.authoringComponentContent.info);
      this.setWidthAndHeight(
          this.authoringComponentContent.width, this.authoringComponentContent.height);
    }, true);
    this.OutsideURLService.getOpenEducationalResources().then((openEducationalResources) => {
      this.openEducationalResources = openEducationalResources;
    });
    this.registerAssetListener();
  }

  registerAssetListener() {
    this.$scope.$on('assetSelected', (event, {nodeId, componentId, assetItem, target}) => {
      if (nodeId === this.nodeId && componentId === this.componentId) {
        const fileName = assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        if (target === 'rubric') {
          this.UtilService.insertFileInSummernoteEditor(
              `summernoteRubric_${this.nodeId}_${this.componentId}`, fullFilePath, fileName);
        }
      }
      this.$mdDialog.hide();
    });
  }

  urlInputChanged() {
    this.authoringComponentContent.info = null;
    this.authoringViewComponentChanged();
  }

  populateOpenEducationalResourceURL(openEducationalResource) {
    this.authoringComponentContent.url = openEducationalResource.url;
    this.authoringComponentContent.info = openEducationalResource.info;
    this.authoringViewComponentChanged();
  }

  isResourceSelected(resourceUrl) {
    return resourceUrl === this.authoringComponentContent.url;
  }

  reloadResource() {
    const iframe = document.getElementById(this.outsideURLIFrameId);
    iframe.src = '';
    iframe.src = this.authoringComponentContent.url;
  }
}

OutsideURLAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$sce',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'OutsideURLService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default OutsideURLAuthoringController;
