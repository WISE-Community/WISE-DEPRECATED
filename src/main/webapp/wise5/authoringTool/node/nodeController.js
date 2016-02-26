'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = function () {
    function NodeController($scope, $state, $stateParams, ProjectService, ConfigService) {
        _classCallCheck(this, NodeController);

        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ProjectService = ProjectService;
        this.ConfigService = ConfigService;
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;
        this.showCreateComponent = false;
        this.selectedComponent = null;

        // the array of component types that can be created
        this.componentTypes = [{ componentType: 'Discussion', componentName: 'Discussion' }, { componentType: 'Draw', componentName: 'Draw' }, { componentType: 'Embedded', componentName: 'Embedded' }, { componentType: 'Graph', componentName: 'Graph' }, { componentType: 'HTML', componentName: 'HTML' }, { componentType: 'Label', componentName: 'Label' }, { componentType: 'Match', componentName: 'Match' }, { componentType: 'MultipleChoice', componentName: 'Multiple Choice' }, { componentType: 'OpenResponse', componentName: 'Open Response' }, { componentType: 'OutsideURL', componentName: 'Outside URL' }, { componentType: 'Table', componentName: 'Table' }];

        // set the drop down to the first item
        this.selectedComponent = this.componentTypes[0].componentType;

        // get the node
        this.node = this.ProjectService.getNodeById(this.nodeId);

        // get the components in the node
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
    }

    /**
     * Launch VLE with this current step as the initial step
     */

    _createClass(NodeController, [{
        key: 'previewStep',
        value: function previewStep() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            var previewStepURL = previewProjectURL + "#/vle/" + this.nodeId;
            window.open(previewStepURL);
        }
    }, {
        key: 'close',
        value: function close() {
            this.$state.go('root.project', { projectId: this.projectId });
        }
    }, {
        key: 'createComponent',

        /**
         * Create a component in this node
         */
        value: function createComponent() {

            // create a component and add it to this node
            this.ProjectService.createComponent(this.nodeId, this.selectedComponent);

            // save the project
            this.ProjectService.saveProject();

            // hide the create component elements
            this.showCreateComponent = false;
        }

        /**
         * Move a component up within this node
         * @param componentId the component id
         */

    }, {
        key: 'moveComponentUp',
        value: function moveComponentUp(componentId) {

            // move the component up within the node
            this.ProjectService.moveComponentUp(this.nodeId, componentId);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Move a component up within this node
         * @param componentId the component id
         */

    }, {
        key: 'moveComponentDown',
        value: function moveComponentDown(componentId) {

            // move the component down within the node
            this.ProjectService.moveComponentDown(this.nodeId, componentId);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Delete the component from this node
         * @param componentId the component id
         */

    }, {
        key: 'deleteComponent',
        value: function deleteComponent(componentId) {

            // ask the user to confirm the delete
            var answer = confirm('Are you sure you want to delete this component?');

            if (answer) {
                // the user confirmed yes

                // delete the component from the node
                this.ProjectService.deleteComponent(this.nodeId, componentId);

                // save the project
                this.ProjectService.saveProject();
            }
        }

        /**
         * The node has changed in the authoring view
         */

    }, {
        key: 'authoringViewNodeChanged',
        value: function authoringViewNodeChanged() {
            this.ProjectService.saveProject();
        }
    }]);

    return NodeController;
}();

;

NodeController.$inject = ['$scope', '$state', '$stateParams', 'ProjectService', 'ConfigService'];

exports.default = NodeController;
//# sourceMappingURL=nodeController.js.map