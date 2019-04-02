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
    if (component.type === 'Discussion') {
      this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent);
    }
    this.authoringViewComponentChanged();
  }

  changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent) {
    for (const tempConnectedComponent of this.authoringComponentContent.connectedComponents) {
      const tempComponent = this.ProjectService.getComponentByNodeIdAndComponentId(
        tempConnectedComponent.nodeId, tempConnectedComponent.componentId);
      if (tempComponent.type === 'Discussion') {
        tempConnectedComponent.type = connectedComponent.type;
      }
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
