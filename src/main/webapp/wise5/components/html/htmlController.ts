'use strict';

import ComponentController from '../componentController';

class HTMLController extends ComponentController {
  $state: any;
  $stateParams: any;
  $sce: any;
  html: string;

  static $inject = [
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$sce',
    '$filter',
    '$mdDialog',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
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
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$sce = $sce;

    if (this.mode === 'authoring') {
    } else if (this.mode === 'grading') {
    } else if (this.mode === 'student') {
      if (this.componentContent != null) {
        this.html = this.componentContent.html;
      }
    }

    this.$rootScope.$broadcast('doneRenderingComponent', {
      nodeId: this.nodeId,
      componentId: this.componentId
    });
  }
}

export default HTMLController;
