'use strict';

import DiscussionController from './discussionController';

class DiscussionAuthoringController extends DiscussionController {
  allowedConnectedComponentTypes: any[];

  static $inject = [
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
    'UtilService',
    '$mdMedia'
  ];

  constructor(
    $filter,
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
    UtilService,
    $mdMedia
  ) {
    super(
      $filter,
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
      UtilService,
      $mdMedia
    );
    this.allowedConnectedComponentTypes = [{ type: 'Discussion' }];
  }

  authoringConnectedComponentTypeChanged(connectedComponent) {
    this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent.type);
    this.authoringViewComponentChanged();
  }

  changeAllDiscussionConnectedComponentTypesToMatch(connectedComponentType) {
    for (const connectedComponent of this.authoringComponentContent.connectedComponents) {
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

export default DiscussionAuthoringController;
