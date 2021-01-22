'use strict';

import { Directive } from '@angular/core';
import { StudentStatusService } from '../../../../services/studentStatusService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

@Directive()
class NodeProgressViewController {
  $translate: any;
  currentGroup: any;
  currentGroupId: string;
  currentWorkgroup: any;
  items: any;
  maxScore: any;
  nodeId: string;
  rootNode: any;
  showRubricButton: boolean;
  currentNodeChangedSubscription: any;
  currentWorkgroupChangedSubscription: any;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    '$state',
    '$transitions',
    'ProjectService',
    'StudentStatusService',
    'TeacherDataService'
  ];

  constructor(
    $filter: any,
    private $mdDialog: any,
    private $scope: any,
    private $state: any,
    private $transitions: any,
    private ProjectService: TeacherProjectService,
    private StudentStatusService: StudentStatusService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = $filter('translate');
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.currentNodeChangedSubscription.unsubscribe();
    this.currentWorkgroupChangedSubscription.unsubscribe();
  }

  $onInit() {
    this.currentGroup = null;
    this.currentWorkgroup = null;
    this.items = this.ProjectService.idToOrder;
    this.maxScore = this.ProjectService.getMaxScore();
    this.nodeId = null;
    let stateParams = null;
    let stateParamNodeId = null;

    if (this.$state != null) {
      stateParams = this.$state.params;
    }

    if (stateParams != null) {
      stateParamNodeId = stateParams.nodeId;
    }

    if (stateParamNodeId != null && stateParamNodeId !== '') {
      this.nodeId = stateParamNodeId;
    }

    if (this.nodeId == null || this.nodeId === '') {
      this.nodeId = this.ProjectService.rootNode.id;
    }

    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);
    let startNodeId = this.ProjectService.getStartNodeId();
    this.rootNode = this.ProjectService.getRootNode(startNodeId);
    this.currentGroup = this.rootNode;
    if (this.currentGroup != null) {
      this.currentGroupId = this.currentGroup.id;
      this.$scope.currentgroupid = this.currentGroupId;
    }
    this.showRubricButton = false;
    if (this.projectHasRubric()) {
      this.showRubricButton = true;
    }

    this.currentNodeChangedSubscription = this.TeacherDataService.currentNodeChanged$.subscribe(
      ({ currentNode }) => {
        this.nodeId = currentNode.id;
        this.TeacherDataService.setCurrentNode(currentNode);
        if (this.isGroupNode(this.nodeId)) {
          this.currentGroup = currentNode;
          this.currentGroupId = this.currentGroup.id;
          this.$scope.currentgroupid = this.currentGroupId;
        }
        this.$state.go('root.cm.unit.node', { nodeId: this.nodeId });
      }
    );

    this.currentWorkgroupChangedSubscription = this.TeacherDataService.currentWorkgroupChanged$.subscribe(
      ({ currentWorkgroup }) => {
        this.currentWorkgroup = currentWorkgroup;
      }
    );

    this.$transitions.onSuccess({}, ($transition) => {
      const toNodeId = $transition.params('to').nodeId;
      const fromNodeId = $transition.params('from').nodeId;
      if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
        this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
      }

      if ($transition.name === 'root.cm.unit.node') {
        if (this.ProjectService.isApplicationNode(toNodeId)) {
          document.getElementById('content').scrollTop = 0;
        }
      }
    });
    if (!this.isShowingNodeGradingView()) {
      this.saveNodeProgressViewDisplayedEvent();
    }
  }

  isShowingNodeGradingView() {
    return this.isApplicationNode(this.nodeId);
  }

  saveNodeProgressViewDisplayedEvent() {
    const context = 'ClassroomMonitor',
      nodeId = this.nodeId,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      event = 'nodeProgressViewDisplayed',
      data = { nodeId: this.nodeId };
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data
    );
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  isApplicationNode(nodeId) {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  getCurrentPeriod() {
    return this.TeacherDataService.getCurrentPeriod();
  }

  getNumberOfStudentsOnNode(nodeId) {
    var currentPeriod = this.getCurrentPeriod();
    var periodId = currentPeriod.periodId;
    var count = this.StudentStatusService.getWorkgroupIdsOnNode(nodeId, periodId).length;
    return count;
  }

  getNodeCompletion(nodeId) {
    var currentPeriod = this.getCurrentPeriod();
    var periodId = currentPeriod.periodId;
    var completionPercentage = this.StudentStatusService.getNodeCompletion(nodeId, periodId)
      .completionPct;
    return completionPercentage;
  }

  projectHasRubric() {
    var projectRubric = this.ProjectService.getProjectRubric();
    if (projectRubric != null && projectRubric != '') {
      return true;
    }
    return false;
  }

  showRubric($event) {
    let projectTitle = this.ProjectService.getProjectTitle();
    let rubricTitle = this.$translate('projectInfo');
    let dialogHeader = `<md-toolbar>
                <div class="md-toolbar-tools">
                    <h2 class="overflow--ellipsis">${projectTitle}</h2>
                    <span flex>&nbsp;</span>
                    <span class="md-subhead">${rubricTitle}</span>
                </div>
            </md-toolbar>`;

    let dialogActions = `<md-dialog-actions layout="row" layout-align="end center">
                <md-button class="md-primary" ng-click="openInNewWindow()" aria-label="{{ ::'openInNewWindow' | translate }}">{{ ::'openInNewWindow' | translate }}</md-button>
                <md-button class="md-primary" ng-click="close()" aria-label="{{ ::'close' | translate }}">{{ ::'close' | translate }}</md-button>
            </md-dialog-actions>`;

    let windowHeader = `<md-toolbar class="layout-row">
                <div class="md-toolbar-tools" style="color: #ffffff;">
                    <h2>${projectTitle}</h2>
                    <span class="flex">&nbsp;</span>
                    <span class="md-subhead">${rubricTitle}</span>
                </div>
            </md-toolbar>`;

    let rubricContent =
      '<md-content class="md-whiteframe-1dp md-padding" style="background-color: #ffffff;">';
    let rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());
    if (rubric != null) {
      rubricContent += rubric + '</md-content>';
    }
    let dialogContent = `<md-dialog-content class="gray-lighter-bg">
                <div class="md-dialog-content">${rubricContent}</div>
            </md-dialog-content>`;
    let dialogString = `<md-dialog class="dialog--wider" aria-label="${projectTitle} - ${rubricTitle}">${dialogHeader}${dialogContent}${dialogActions}</md-dialog>`;
    let windowString = `<link rel='stylesheet' href='/wise5/themes/default/style/monitor.css'>
            <link rel='stylesheet' href='/wise5/themes/default/style/angular-material.css'>
            <body class="layout-column">
                <div class="layout-column">${windowHeader}<md-content class="md-padding">${rubricContent}</div></md-content></div>
            </body>`;

    this.$mdDialog.show({
      template: dialogString,
      fullscreen: true,
      controller: [
        '$scope',
        '$mdDialog',
        function DialogController($scope, $mdDialog) {
          $scope.openInNewWindow = function () {
            let w = window.open('', '_blank');
            w.document.write(windowString);
            $mdDialog.hide();
          };
          $scope.close = () => {
            $mdDialog.hide();
          };
        }
      ],
      targetEvent: $event,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }
}

const NodeProgressView = {
  bindings: {
    nodeId: '<'
  },
  controller: NodeProgressViewController,
  templateUrl:
    '/wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/nodeProgressView/nodeProgressView.html'
};

export default NodeProgressView;
