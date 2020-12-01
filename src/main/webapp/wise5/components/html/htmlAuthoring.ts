'use strict';

import { Directive } from '@angular/core';
import * as angular from 'angular';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class HTMLAuthoringController extends EditComponentController {
  html: string = '';

  static $inject = [
    '$filter',
    '$mdDialog',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    private $mdDialog: any,
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

  $onInit(): void {
    super.$onInit();
    this.html = this.UtilService.replaceWISELinks(this.componentContent.html);
  }

  htmlChanged(): void {
    this.authoringComponentContent.html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.html)
    );
    this.authoringViewComponentChanged();
  }
}

const HTMLAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: HTMLAuthoringController,
  controllerAs: 'htmlController',
  templateUrl: 'wise5/components/html/authoring.html'
}

export default HTMLAuthoring;

