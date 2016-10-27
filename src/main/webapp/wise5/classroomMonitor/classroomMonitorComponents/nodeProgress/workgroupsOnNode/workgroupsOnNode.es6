"use strict";

class WorkgroupsOnNodeController {
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;

        this.parent = this;
    };

    showWorkgroupsOnNode(ev) {
        this.$mdDialog.show({
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
    '$mdDialog'
];

const WorkgroupsOnNode = {
    bindings: {
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
