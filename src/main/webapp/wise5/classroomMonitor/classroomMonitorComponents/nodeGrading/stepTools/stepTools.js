"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepToolsController = function () {
    function StepToolsController($scope, NodeService, ProjectService, TeacherDataService, $mdSidenav) {
        var _this = this;

        _classCallCheck(this, StepToolsController);

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.$scope.$on('currentNodeChanged', function (event, args) {
            _this.updateModel();
        });
    }

    _createClass(StepToolsController, [{
        key: 'toNodeIdChanged',
        value: function toNodeIdChanged() {
            // selected node id has changed, so open new node
            this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.toNodeId);
        }
    }, {
        key: 'updateModel',
        value: function updateModel() {
            var _this2 = this;

            var nodeId = this.TeacherDataService.getCurrentNodeId();
            if (!this.ProjectService.isGroupNode(nodeId)) {
                this.nodeId = nodeId;
                this.prevId = this.NodeService.getPrevNodeIdWithWork();
                this.nextId = null;
                this.NodeService.getNextNodeIdWithWork().then(function (nextNodeId) {
                    _this2.nextId = nextNodeId;
                });

                // model variable for selected node id
                this.toNodeId = this.nodeId;
            }
        }
    }, {
        key: 'getSelectedText',
        value: function getSelectedText() {
            return (this.showPosition && this.getNodePositionById(this.nodeId) ? this.getNodePositionById(this.nodeId) + ': ' : '') + this.getNodeTitleByNodeId(this.nodeId);
        }
    }, {
        key: 'getNodeTitleByNodeId',
        value: function getNodeTitleByNodeId(nodeId) {
            return this.ProjectService.getNodeTitleByNodeId(nodeId);
        }
    }, {
        key: 'getNodePositionById',
        value: function getNodePositionById(nodeId) {
            return this.ProjectService.getNodePositionById(nodeId);
        }
    }, {
        key: 'isGroupNode',
        value: function isGroupNode(nodeId) {
            return this.ProjectService.isGroupNode(nodeId);
        }
    }, {
        key: 'showNode',
        value: function showNode(nodeId) {
            return this.isGroupNode(nodeId) || this.ProjectService.nodeHasWork(nodeId);
        }
    }, {
        key: 'goToPrevNode',
        value: function goToPrevNode() {
            this.NodeService.goToPrevNodeWithWork();
        }
    }, {
        key: 'goToNextNode',
        value: function goToNextNode() {
            this.NodeService.goToNextNodeWithWork();
        }
    }]);

    return StepToolsController;
}();

StepToolsController.$inject = ['$scope', 'NodeService', 'ProjectService', 'TeacherDataService', '$mdSidenav'];

var StepTools = {
    bindings: {
        showPosition: '<'
    },
    template: '<div layout="row" layout-align="center center">\n            <node-icon node-id="$ctrl.nodeId" size="18"></node-icon>\n            <md-select id="stepSelectMenu" md-theme="default" class="node-select md-subhead"\n                       aria-label="{{ \'selectAStep\' | translate }}"\n                       ng-model="$ctrl.toNodeId"\n                       ng-change="$ctrl.toNodeIdChanged()"\n                       md-selected-text="$ctrl.getSelectedText()">\n                <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : \'order\'"\n                           ng-if="item.order !== 0 && $ctrl.showNode(item.$key)"\n                           value="{{ item.$key }}"\n                           ng-class="{\'node-select-option--group\': $ctrl.isGroupNode(item.$key), \'node-select-option--node\': !$ctrl.isGroupNode(item.$key)}">\n                    <div layout="row" layout-align="start center">\n                        <node-icon node-id="item.$key" size="18" custom-class="\'node-select__icon\'"></node-icon>\n                        <span class="node-select__text">{{ $ctrl.showPosition && $ctrl.getNodePositionById(item.$key) ? $ctrl.getNodePositionById(item.$key) + \': \' : \'\' }}{{ $ctrl.getNodeTitleByNodeId(item.$key) }}</span>\n                    </div>\n                </md-option>\n            </md-select>\n            <span flex></span>\n            <md-button aria-label="{{\'previousStep\' | translate }}" class="md-icon-button node-nav"\n                       ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">\n                <md-icon> arrow_back </md-icon>\n            </md-button>\n            <md-button aria-label="{{ \'nextStep\' | translate }}" class="md-icon-button node-nav"\n                       ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()">\n                <md-icon> arrow_forward </md-icon>\n            </md-button>\n        </div>',
    controller: StepToolsController
};

exports.default = StepTools;
//# sourceMappingURL=stepTools.js.map
