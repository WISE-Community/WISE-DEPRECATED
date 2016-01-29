'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = function () {
    function NodeController($scope, $state, $stateParams, ProjectService) {
        _classCallCheck(this, NodeController);

        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ProjectService = ProjectService;
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;

        // get the node
        this.node = this.ProjectService.getNodeById(this.nodeId);

        // get the components in the node
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
    }

    _createClass(NodeController, [{
        key: 'showNormal',
        value: function showNormal() {
            this.$state.go('root.node.normal', { nodeId: this.nodeId });
        }
    }, {
        key: 'showPreview',
        value: function showPreview() {
            this.$state.go('root.node.preview', { nodeId: this.nodeId });
        }
    }, {
        key: 'showAdvanced',
        value: function showAdvanced() {
            this.$state.go('root.node.advanced', { nodeId: this.nodeId });
        }
    }, {
        key: 'close',
        value: function close() {
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }, {
        key: 'authoringViewNodeChanged',

        /**
         * The node has changed in the authoring view
         */
        value: function authoringViewNodeChanged() {
            this.ProjectService.saveProject();
        }
    }]);

    return NodeController;
}();

NodeController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService'];

exports.default = NodeController;

//# sourceMappingURL=nodeController.js.map