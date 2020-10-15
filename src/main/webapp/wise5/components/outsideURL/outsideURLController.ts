'use strict';

import ComponentController from '../componentController';
import { OutsideURLService } from './outsideURLService';

class OutsideURLController extends ComponentController {
  $sce: any;
  OutsideURLService: OutsideURLService;
  url: string;
  info: string;
  outsideURLIFrameId: string;
  width: string;
  height: string;

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
    this.$sce = $sce;
    this.OutsideURLService = OutsideURLService;
    this.url = null;
    this.info = null;
    this.outsideURLIFrameId = 'outsideResource_' + this.componentId;

    if (this.componentContent != null) {
      this.setURL(this.componentContent.url);
      this.setInfo(this.componentContent.info);
    }
    this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);
    this.broadcastDoneRenderingComponent();
  }

  setWidthAndHeight(width, height) {
    this.width = width ? width + 'px' : '100%';
    this.height = height ? height + 'px' : '600px';
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
}

export default OutsideURLController;
