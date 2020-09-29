'use strict';

import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import OutsideURLController from './outsideURLController';

class OutsideURLAuthoringController extends OutsideURLController {
  ProjectAssetService: ProjectAssetService;
  isShowOERs: boolean;
  subjects: any[];
  searchText: string;
  selectedSubjects: any[];
  openEducationalResources: any[];

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$sce',
    '$scope',
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
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    OutsideURLService,
    ProjectAssetService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $sce,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      OutsideURLService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.ProjectAssetService = ProjectAssetService;
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

  openAssetChooser(params: any) {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
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
