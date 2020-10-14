'use strict';

import { ComponentAuthoringController } from '../componentAuthoringController';

class DiscussionAuthoringController extends ComponentAuthoringController {

  allowedConnectedComponentTypes: any[] = [{ type: 'Discussion' }];

  static $inject = [
    '$scope',
    '$filter',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService',
  ];

  constructor(
    $scope,
    $filter,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $scope,
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService,
    );
  }

  connectedComponentTypeChanged(connectedComponent) {
    this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent.type);
    super.connectedComponentTypeChanged(connectedComponent);
  }

  changeAllDiscussionConnectedComponentTypesToMatch(connectedComponentType) {
    for (const connectedComponent of this.authoringComponentContent.connectedComponents) {
      connectedComponent.type = connectedComponentType;
    }
  }

  automaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      const firstConnectedComponent = this.authoringComponentContent.connectedComponents[0];
      connectedComponent.type = firstConnectedComponent.type;
    }
  }
}

export default DiscussionAuthoringController;
