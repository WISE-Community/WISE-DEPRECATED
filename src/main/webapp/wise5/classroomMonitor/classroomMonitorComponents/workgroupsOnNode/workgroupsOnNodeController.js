"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupsOnNodeController = function () {
    function WorkgroupsOnNodeController($mdDialog) {
        _classCallCheck(this, WorkgroupsOnNodeController);

        this.$mdDialog = $mdDialog;

        this.parent = this;
    }

    _createClass(WorkgroupsOnNodeController, [{
        key: 'showWorkgroupsOnNode',
        value: function showWorkgroupsOnNode(ev) {
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
                this.close = function () {
                    $mdDialog.hide();
                };

                $scope.onlineFilter = function (object) {
                    return object.online === true;
                };
            }
            DialogController.$inject = ["$scope", "$mdDialog", "parent"];
        }
    }]);

    return WorkgroupsOnNodeController;
}();

WorkgroupsOnNodeController.$inject = ['$mdDialog'];

exports.default = WorkgroupsOnNodeController;
//# sourceMappingURL=workgroupsOnNodeController.js.map