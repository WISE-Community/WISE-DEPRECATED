'use strict';

import { ComponentAuthoringController } from '../componentAuthoringController';
import { OutsideURLService } from './outsideURLService';

class OutsideURLAuthoringController extends ComponentAuthoringController {
  height: string;
  info: string;
  isShowOERs: boolean;
  openEducationalResources: any[];
  outsideURLIFrameId: string;
  subjects: any[];
  searchText: string;
  selectedSubjects: any[];
  url: string;
  width: string;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$sce',
    '$scope',
    '$state',
    '$stateParams',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'OutsideURLService',
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $sce,
    $scope,
    $state,
    $stateParams,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    private OutsideURLService: OutsideURLService,
    ProjectAssetService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $q,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      $sce,
      $filter,
      $mdDialog,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
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

    $scope.$watch(
      () => {
        return this.authoringComponentContent;
      },
      (newValue, oldValue) => {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.setURL(this.authoringComponentContent.url);
        this.setInfo(this.authoringComponentContent.info);
        this.setWidthAndHeight(
          this.authoringComponentContent.width,
          this.authoringComponentContent.height
        );
      },
      true
    );
    this.OutsideURLService.getOpenEducationalResources().then((openEducationalResources: any) => {
      this.openEducationalResources = openEducationalResources.sort((a, b) =>
        a.metadata.title > b.metadata.title ? 1 : -1
      );
    });
  }

  setURL(url) {
    if (url == null || url === '') {
      this.url = ' ';
    } else {
      this.url = this.$sce.trustAsResourceUrl(url);
    }
  }

  setInfo(info) {
    if (info == null || info === '') {
      this.info = this.url;
    } else {
      this.info = this.$sce.trustAsResourceUrl(info);
    }
  }

  setWidthAndHeight(width, height) {
    this.width = width ? width + 'px' : '100%';
    this.height = height ? height + 'px' : '600px';
  }

  assetSelected({ nodeId, componentId, assetItem, target }) {
    const fileName = assetItem.fileName;
    const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
    if (target === 'rubric') {
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
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
    const iframe: any = document.getElementById(this.outsideURLIFrameId);
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

export default OutsideURLAuthoringController;
