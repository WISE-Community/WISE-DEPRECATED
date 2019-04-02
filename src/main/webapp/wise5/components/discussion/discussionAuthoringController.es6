'use strict';

import DiscussionController from "./discussionController";

class DiscussionAuthoringController extends DiscussionController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              AnnotationService,
              ConfigService,
              DiscussionService,
              NodeService,
              NotebookService,
              NotificationService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              StudentWebSocketService,
              UtilService,
              $mdMedia) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      DiscussionService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      StudentWebSocketService,
      UtilService,
      $mdMedia);
    this.allowedConnectedComponentTypes = [
      { type: 'Discussion' }
    ];
  }

  authoringConnectedComponentTypeChanged(connectedComponent) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        connectedComponent.nodeId, connectedComponent.componentId);
    this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent.type);
    this.authoringViewComponentChanged();
  }

  changeAllDiscussionConnectedComponentTypesToMatch(connectedComponentType) {
    for (const connectedComponent of this.authoringComponentContent.connectedComponents) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(
          connectedComponent.nodeId, connectedComponent.componentId);
      connectedComponent.type = connectedComponentType;
    }
  }

  authoringAutomaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      const firstConnectedComponent = this.authoringComponentContent.connectedComponents[0];
      connectedComponent.type = firstConnectedComponent.type;
    }
  }
}

DiscussionAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'DiscussionService',
  'NodeService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'StudentWebSocketService',
  'UtilService',
  '$mdMedia'
];

export default DiscussionAuthoringController;
