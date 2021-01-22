'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class DiscussionAuthoringController extends EditComponentController {
  static $inject = [
    '$filter',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
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
}

const DiscussionAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: DiscussionAuthoringController,
  controllerAs: 'discussionController',
  templateUrl: 'wise5/components/discussion/authoring.html'
};

export default DiscussionAuthoring;
