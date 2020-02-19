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
    this.$translate = this.$filter('translate');
    this.isShowOERs = this.componentContent.url === '';
    this.subjects = [
      {
        value: 'Earth and Space Sciences', 
        label: this.$translate('outsideURL.ESS')
      },
      {
        value: 'Life Sciences', 
        label: this.$translate('outsideURL.LS')
      },
      {
        value: 'Physical Sciences', 
        label: this.$translate('outsideURL.PS')
      },
      {
        value: 'Engineering, Technology, and Applications of Science', 
        label: this.$translate('outsideURL.ETS')
      }
    ];
    this.searchText = '';
    this.selectedSubjects = [];

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
      this.openEducationalResources = 
          openEducationalResources.sort((a, b) => (a.metadata.title > b.metadata.title) ? 1 : -1);
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

  isSubjectMatch(resource) {
    for (const subject of this.selectedSubjects) {
      if (resource.metadata.subjects.includes(subject)) {
        return true;
      }
    }
    return false;
  }

  clearFilters() {
    this.searchText = '';
    this.selectedSubjects = [];
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
