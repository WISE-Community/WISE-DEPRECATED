'use strict';

import * as angular from 'angular';

class WorkgroupsOnNodeController {
  $translate: any;
  isGroup: boolean;
  parent: any;
  type: any;

  static $inject = ['$filter', '$mdDialog'];

  constructor(private $filter: any, private $mdDialog: any) {
    this.$translate = this.$filter('translate');
    this.parent = this;
  }

  $onChanges() {
    this.type = this.isGroup ? this.$translate('activity') : this.$translate('step');
  }

  showWorkgroupsOnNode(ev) {
    this.$mdDialog.show({
      ariaLabel: this.$translate('teamsOnItem'),
      parent: angular.element(document.body),
      targetEvent: ev,
      templateUrl:
        '/wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/workgroupsOnNode/workgroupsOnNodeDialog.html',
      locals: {
        data: this.parent
      },
      controller: DialogController,
      controllerAs: '$ctrl',
      bindToController: true
    });
    function DialogController($scope, $mdDialog, parent) {
      this.close = () => {
        $mdDialog.hide();
      };
    }
    DialogController.$inject = ['$scope', '$mdDialog', 'parent'];
  }
}

const WorkgroupsOnNode = {
  bindings: {
    isGroup: '<',
    nodeTitle: '<',
    workgroups: '<'
  },
  template: `<md-button class="badge nav-item__users" tabindex="0"
              ng-click="$ctrl.showWorkgroupsOnNode($event)">
            <md-icon>people</md-icon>{{$ctrl.workgroups.length}}
        </md-button>`,
  controller: WorkgroupsOnNodeController
};

export default WorkgroupsOnNode;
