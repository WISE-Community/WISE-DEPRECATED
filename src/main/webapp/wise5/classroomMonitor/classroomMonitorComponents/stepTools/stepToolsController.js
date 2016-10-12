"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepToolsCtrl = function () {
    function StepToolsCtrl($scope, NodeService, ProjectService, TeacherDataService, $mdSidenav) {
        var _this = this;

        _classCallCheck(this, StepToolsCtrl);

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.TeacherDataService = TeacherDataService;
        //this.$mdSidenav = $mdSidenav;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.$scope.$on('currentNodeChanged', function (event, args) {
            _this.updateModel();
        });
    }

    /*toggleStepNav() {
        this.$mdSidenav('stepNav').toggle();
    }*/

    _createClass(StepToolsCtrl, [{
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
                this.icon = this.getIcon(this.nodeId);

                this.prevId = this.NodeService.getPrevNodeId();
                this.nextId = null;
                this.NodeService.getNextNodeId().then(function (nodeId) {
                    _this2.nextId = nodeId;
                });

                // model variable for selected node id
                this.toNodeId = this.nodeId;
            }
        }
    }, {
        key: 'getIcon',
        value: function getIcon(nodeId) {
            return this.ProjectService.getNodeIconByNodeId(nodeId);
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
        key: 'goToPrevNode',
        value: function goToPrevNode() {
            this.NodeService.goToPrevNode();
        }
    }, {
        key: 'goToNextNode',
        value: function goToNextNode() {
            this.NodeService.goToNextNode();
        }
    }, {
        key: 'closeNode',
        value: function closeNode() {
            this.NodeService.closeNode();
        }
    }]);

    return StepToolsCtrl;
}();

StepToolsCtrl.$inject = ['$scope', 'NodeService', 'ProjectService', 'TeacherDataService', '$mdSidenav'];

exports.default = StepToolsCtrl;
//# sourceMappingURL=stepToolsController.js.map