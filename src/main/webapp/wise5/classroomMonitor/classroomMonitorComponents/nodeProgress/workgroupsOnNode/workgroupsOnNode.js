"use strict";

class WorkgroupsOnNodeController {
    constructor($filter,
                $mdDialog) {
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;

        this.$translate = this.$filter('translate');

        this.$onChanges = () => {
            this.type = this.isGroup ? this.$translate('activity') : this.$translate('step');
        }

        this.parent = this;
    };

    showWorkgroupsOnNode(ev) {
        this.$mdDialog.show({
            ariaLabel: this.$translate('teamsOnItem'),
            parent: angular.element(document.body),
            targetEvent: ev,
            templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/nodeProgress/workgroupsOnNode/workgroupsOnNodeDialog.html',
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

            $scope.onlineFilter = object => {
                return object.online === true;
            };
        }
        DialogController.$inject = ["$scope", "$mdDialog", "parent"];
    };
}

WorkgroupsOnNodeController.$inject = [
    '$filter',
    '$mdDialog'
];

const WorkgroupsOnNode = {
    bindings: {
        isGroup: '<',
        nodeTitle: '<',
        workgroups: '<',
        online: '<'
    },
    template:
        `<md-button class="badge nav-item__users" tabindex="0"
              ng-class="{'success-bg': $ctrl.online}"
              ng-click="$ctrl.showWorkgroupsOnNode($event)">
            <md-icon>people</md-icon>{{$ctrl.workgroups.length}}
        </md-button>`,
    controller: WorkgroupsOnNodeController
};

export default WorkgroupsOnNode;
