"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupsOnNodeController = function () {
    function WorkgroupsOnNodeController($filter, $mdDialog) {
        var _this = this;

        _classCallCheck(this, WorkgroupsOnNodeController);

        this.$filter = $filter;
        this.$mdDialog = $mdDialog;

        this.$translate = this.$filter('translate');

        this.$onChanges = function () {
            _this.type = _this.isGroup ? _this.$translate('activity') : _this.$translate('step');
        };

        this.parent = this;
    }

    _createClass(WorkgroupsOnNodeController, [{
        key: 'showWorkgroupsOnNode',
        value: function showWorkgroupsOnNode(ev) {
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

WorkgroupsOnNodeController.$inject = ['$filter', '$mdDialog'];

var WorkgroupsOnNode = {
    bindings: {
        isGroup: '<',
        nodeTitle: '<',
        workgroups: '<',
        online: '<'
    },
    template: '<md-button class="badge nav-item__users" tabindex="0"\n              ng-class="{\'success-bg\': $ctrl.online}"\n              ng-click="$ctrl.showWorkgroupsOnNode($event)">\n            <md-icon>people</md-icon>{{$ctrl.workgroups.length}}\n        </md-button>',
    controller: WorkgroupsOnNodeController
};

exports.default = WorkgroupsOnNode;
//# sourceMappingURL=workgroupsOnNode.js.map