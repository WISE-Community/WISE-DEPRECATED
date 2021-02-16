'use strict';

import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import * as angular from 'angular';

class ComponentRevisionsInfoController {
  $translate: any;
  active: boolean;
  componentId: string;
  componentState: any;
  componentStates: any;
  latestComponentStateIsSubmit: boolean;
  latestComponentStateTime: any;
  nodeId: string;
  periodId: number;
  runId: number;
  fromWorkgroupId: number;
  toWorkgroupId: number;
  usernames: any;

  static $inject = ['$filter', '$mdDialog', 'ConfigService', 'TeacherDataService'];

  constructor(
    $filter: any,
    private $mdDialog: any,
    private ConfigService: ConfigService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = $filter('translate');
  }

  $onInit() {
    this.runId = this.ConfigService.getRunId();
    let toUserInfo = this.ConfigService.getUserInfoByWorkgroupId(this.toWorkgroupId);
    if (toUserInfo) {
      this.periodId = toUserInfo.periodId;
    }
    this.usernames = this.ConfigService.getDisplayNamesByWorkgroupId(this.toWorkgroupId);
  }

  $onChanges(changes) {
    let latest = null;

    if (this.active) {
      // get all the componentStates for this workgroup
      this.componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(
        this.toWorkgroupId,
        this.componentId
      );
      let total = this.componentStates.length;

      if (total > 0) {
        latest = this.componentStates[total - 1];
      }
    } else if (this.componentState) {
      // we're only showing info for a single component state
      latest = this.componentState;
      this.componentStates = [];
      this.componentStates.push(latest);
    }

    if (latest) {
      this.latestComponentStateTime = this.ConfigService.convertToClientTimestamp(
        latest.serverSaveTime
      );
      this.latestComponentStateIsSubmit = latest.isSubmit;
    }
  }

  showRevisions($event) {
    let workgroupId = this.toWorkgroupId;
    let fromWorkgroupId = this.fromWorkgroupId;
    let componentId = this.componentId;
    let nodeId = this.nodeId;
    let usernames = this.usernames;
    let componentStates = this.componentStates;

    this.$mdDialog.show({
      multiple: true,
      parent: angular.element(document.body),
      targetEvent: $event,
      fullscreen: true,
      template: `<md-dialog aria-label="{{ ::'revisionsForTeam' | translate:{teamNames: usernames} }}" class="dialog--wider">
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                            <h2 class="overflow--ellipsis">{{ ::'revisionsForTeam' | translate:{teamNames: usernames} }}</h2>
                        </div>
                    </md-toolbar>
                    <md-dialog-content>
                        <div class="md-dialog-content gray-lighter-bg">
                            <workgroup-component-revisions component-states="componentStates"
                                                           node-id="{{ nodeId }}"
                                                           component-id="{{ componentId }}"
                                                           from-workgroup-id="{{ fromWorkgroupId }}"
                                                           workgroup-id="{{ workgroupId }}"></workgroup-component-revisions>
                        </div>
                    </md-dialog-content>
                    <md-dialog-actions layout="row" layout-align="end center">
                        <md-button class="md-primary" ng-click="close()" aria-label="{{ ::'close' | translate }}">{{ ::'close' | translate }}</md-button>
                    </md-dialog-actions>
                </md-dialog>`,
      locals: {
        workgroupId: workgroupId,
        fromWorkgroupId: fromWorkgroupId,
        componentId: componentId,
        nodeId: nodeId,
        usernames: usernames,
        componentStates: componentStates
      },
      controller: RevisionsController
    });
    function RevisionsController(
      $scope,
      $mdDialog,
      workgroupId,
      fromWorkgroupId,
      componentId,
      nodeId,
      usernames,
      componentStates
    ) {
      $scope.workgroupId = workgroupId;
      $scope.fromWorkgroupId = fromWorkgroupId;
      $scope.componentId = componentId;
      $scope.nodeId = nodeId;
      $scope.usernames = usernames;
      $scope.componentStates = componentStates;
      $scope.close = () => {
        $mdDialog.hide();
      };
    }
    RevisionsController.$inject = [
      '$scope',
      '$mdDialog',
      'workgroupId',
      'fromWorkgroupId',
      'componentId',
      'nodeId',
      'usernames',
      'componentStates'
    ];
  }
}

const ComponentRevisionsInfo = {
  bindings: {
    active: '<',
    componentId: '<',
    componentState: '<',
    nodeId: '<',
    fromWorkgroupId: '<',
    toWorkgroupId: '<'
  },
  template: `<div class="component__actions__info component--grading__actions__info md-caption">
            <span ng-if="$ctrl.componentStates.length > 0">
                <span ng-if="$ctrl.latestComponentStateIsSubmit">{{ ::'SUBMITTED' | translate }} </span>
                <span ng-if="!$ctrl.latestComponentStateIsSubmit">{{ ::'SAVED' | translate }} </span>
                <span ng-if="$ctrl.active">
                    <span class="component__actions__more" am-time-ago="$ctrl.latestComponentStateTime"></span>
                    <md-tooltip md-direction="top">{{ $ctrl.latestComponentStateTime | amDateFormat:'ddd MMM D YYYY, h:mm a' }}</md-tooltip>
                </span>
                <span ng-if="!$ctrl.active">{{ $ctrl.latestComponentStateTime | amDateFormat:'ddd MMM D YYYY, h:mm a' }}</span>
            </span>
            <span ng-if="$ctrl.componentStates.length === 0">{{ ::'TEAM_HAS_NOT_SAVED_ANY_WORK' | translate }}</span>
            <span ng-if="$ctrl.active && $ctrl.componentStates.length > 1">
                &#8226;&nbsp;<a ng-click="$ctrl.showRevisions($event)" translate="seeRevisions"></a>
           </span>
    </div>`,
  controller: ComponentRevisionsInfoController
};

export default ComponentRevisionsInfo;
