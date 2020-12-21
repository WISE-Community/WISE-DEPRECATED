'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';
import { CRaterService } from '../../services/cRaterService';

@Directive()
class OpenResponseAuthoringController extends EditComponentController {

  static $inject = [
    '$filter',
    'ConfigService',
    'CRaterService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    ConfigService,
    protected CRaterService: CRaterService,
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

}

const OpenResponseAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: OpenResponseAuthoringController,
  controllerAs: 'openResponseController',
  templateUrl: 'wise5/components/openResponse/authoring.html'
}

export default OpenResponseAuthoring;
