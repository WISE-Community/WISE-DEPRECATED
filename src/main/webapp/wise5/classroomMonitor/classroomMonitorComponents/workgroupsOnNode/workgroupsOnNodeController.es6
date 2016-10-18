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
            templateUrl: 'wise5/classroomMonitor/classroomMonitorComponents/workgroupsOnNode/workgroupsOnNodeDialog.html',
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

export default WorkgroupsOnNodeController;
