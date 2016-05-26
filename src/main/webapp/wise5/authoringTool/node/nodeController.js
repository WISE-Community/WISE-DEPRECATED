'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = function () {
    function NodeController($anchorScroll, $location, $scope, $state, $stateParams, $timeout, $translate, ConfigService, ProjectService, UtilService) {
        _classCallCheck(this, NodeController);

        this.$anchorScroll = $anchorScroll;
        this.$location = $location;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;
        this.showCreateComponent = false;
        this.showEditTransitions = false;
        this.selectedComponent = null;
        this.nodeCopy = null;
        this.undoStack = [];
        this.howToChooseAmongAvailablePathsOptions = [null, "random", "workgroupId", "firstAvailable", "lastAvailable"];
        this.whenToChoosePathOptions = [null, "enterNode", "exitNode", "studentDataChanged"];
        this.canChangePathOptions = [null, true, false];

        // the array of component types that can be created
        this.componentTypes = [{ componentType: 'AudioOscillator', componentName: 'Audio Oscillator' }, { componentType: 'Discussion', componentName: 'Discussion' }, { componentType: 'Draw', componentName: 'Draw' }, { componentType: 'Embedded', componentName: 'Embedded' }, { componentType: 'Graph', componentName: 'Graph' }, { componentType: 'HTML', componentName: 'HTML' }, { componentType: 'Label', componentName: 'Label' }, { componentType: 'Match', componentName: 'Match' }, { componentType: 'MultipleChoice', componentName: 'Multiple Choice' }, { componentType: 'OpenResponse', componentName: 'Open Response' }, { componentType: 'OutsideURL', componentName: 'Outside URL' }, { componentType: 'Table', componentName: 'Table' }];

        // set the drop down to the first item
        this.selectedComponent = this.componentTypes[0].componentType;

        // get the node
        this.node = this.ProjectService.getNodeById(this.nodeId);

        // get the components in the node
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

        /*
         * remember a copy of the node at the beginning of this node authoring
         * session in case we need to roll back if the user decides to
         * cancel/revert all the changes.
         */
        this.originalNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

        /*
         * remember the current version of the node. this will be updated each
         * time the user makes a change.
         */
        this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    }

    /**
     * Launch VLE with this current step as the initial step
     */


    _createClass(NodeController, [{
        key: "previewStep",
        value: function previewStep() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            var previewStepURL = previewProjectURL + "#/vle/" + this.nodeId;
            window.open(previewStepURL);
        }
    }, {
        key: "previewStepWithoutConstraints",


        /**
         * Launch VLE with this current step as the initial step without constraints
         */
        value: function previewStepWithoutConstraints() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            var previewStepURL = previewProjectURL + "?constraints=false" + "#/vle/" + this.nodeId;
            window.open(previewStepURL);
        }
    }, {
        key: "close",


        /**
         * Close the node authoring view
         */
        value: function close() {
            // perform any node cleanup if necessary
            this.$scope.$broadcast('exitNode', { nodeToExit: this.node });

            this.$state.go('root.project', { projectId: this.projectId });
        }
    }, {
        key: "cancel",


        /**
         * The author has clicked the cancel button which will revert all
         * the recent changes since they opened the node.
         */
        value: function cancel() {
            var _this = this;

            // check if the user has made any changes
            if (!angular.equals(this.node, this.originalNodeCopy)) {
                // the user has made changes

                this.$translate('confirmUndo').then(function (confirmUndo) {
                    var result = confirm(confirmUndo);

                    if (result) {
                        // revert the node back to the previous version
                        _this.ProjectService.replaceNode(_this.nodeId, _this.originalNodeCopy);

                        // save the project
                        _this.ProjectService.saveProject();

                        // close the node authoring view
                        _this.close();
                    }
                });
            } else {
                // the user has not made any changes

                //close the node authoring view
                this.close();
            }
        }

        /**
         * Add a new transition for this node.
         */

    }, {
        key: "addNewTransition",
        value: function addNewTransition() {
            if (this.node.transitionLogic.transitions == null) {
                this.node.transitionLogic.transitions = [];
            }
            var nodeTransitions = this.node.transitionLogic.transitions;
            if (nodeTransitions.length > 0) {
                // If this node already has transitions, copy the last one.
                var lastNodeTransition = nodeTransitions[nodeTransitions.length - 1];
                var newTransition = {
                    "to": lastNodeTransition.to
                };
                nodeTransitions.push(newTransition);
            } else {
                // Otherwise set the new transition to the current nodeId
                var _newTransition = {
                    "to": this.nodeId
                };
                nodeTransitions.push(_newTransition);
            }
        }

        /**
         * Add a new transition for the specified transition.
         */

    }, {
        key: "addNewTransitionCriteria",
        value: function addNewTransitionCriteria(transition) {
            var nodeTransitions = this.node.transitionLogic.transitions;
            for (var n = 0; n < nodeTransitions.length; n++) {
                var nodeTransition = nodeTransitions[n];
                if (nodeTransition == transition) {
                    if (nodeTransition.criteria == null) {
                        nodeTransition.criteria = [];
                    }
                    var newTransitionCriteria = {
                        "nodeId": "",
                        "componentId": "",
                        "function": {}
                    };
                    nodeTransition.criteria.push(newTransitionCriteria);
                }
            }
        }

        /**
         * Deletes the specified transition from this node
         */

    }, {
        key: "deleteTransition",
        value: function deleteTransition(transition) {
            var nodeTransitions = this.node.transitionLogic.transitions;

            var index = nodeTransitions.indexOf(transition);
            if (index > -1) {
                nodeTransitions.splice(index, 1);
            }
        }

        /**
         * Save transitions for this node
         */

    }, {
        key: "saveTransitions",
        value: function saveTransitions() {

            // save the project
            this.ProjectService.saveProject();

            // hide the create component elements
            this.showEditTransitions = false;
        }

        /**
         * Create a component in this node
         */

    }, {
        key: "createComponent",
        value: function createComponent() {
            var _this2 = this;

            // create a component and add it to this node
            this.ProjectService.createComponent(this.nodeId, this.selectedComponent);

            // save the project
            this.ProjectService.saveProject();

            // hide the create component elements
            this.showCreateComponent = false;

            // Scroll to the bottom of the page where the new component was added
            this.$timeout(function () {
                _this2.$location.hash('bottom');
                _this2.$anchorScroll();
            });
        }

        /**
         * Move a component up within this node
         * @param componentId the component id
         */

    }, {
        key: "moveComponentUp",
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
        key: "moveComponentDown",
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
        key: "deleteComponent",
        value: function deleteComponent(componentId) {
            var _this3 = this;

            this.$translate('confirmDeleteComponent').then(function (confirmDeleteComponent) {

                // ask the user to confirm the delete
                var answer = confirm(confirmDeleteComponent);

                if (answer) {
                    // the user confirmed yes

                    // delete the component from the node
                    _this3.ProjectService.deleteComponent(_this3.nodeId, componentId);

                    // save the project
                    _this3.ProjectService.saveProject();
                }
            });
        }

        /**
         * The node has changed in the authoring view
         */

    }, {
        key: "authoringViewNodeChanged",
        value: function authoringViewNodeChanged() {
            // put the previous version of the node on to the undo stack
            this.undoStack.push(this.currentNodeCopy);

            // save the project
            this.ProjectService.saveProject();

            // update the current node copy
            this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
        }

        /**
         * Undo the last change by reverting the node to the previous version
         */

    }, {
        key: "undo",
        value: function undo() {
            var _this4 = this;

            if (this.undoStack.length === 0) {
                // the undo stack is empty so there are no changes to undo
                this.$translate('noUndoAvailable').then(function (noUndoAvailable) {
                    alert(noUndoAvailable);
                });
            } else if (this.undoStack.length > 0) {
                // the undo stack has elements

                this.$translate('confirmUndoLastChange').then(function (confirmUndoLastChange) {

                    // ask the user to confirm the delete
                    var result = confirm(confirmUndoLastChange);

                    if (result) {
                        // perform any node cleanup if necessary
                        _this4.$scope.$broadcast('exitNode', { nodeToExit: _this4.node });

                        // get the previous version of the node
                        var nodeCopy = _this4.undoStack.pop();

                        // revert the node back to the previous version
                        _this4.ProjectService.replaceNode(_this4.nodeId, nodeCopy);

                        // get the node
                        _this4.node = _this4.ProjectService.getNodeById(_this4.nodeId);

                        // get the components in the node
                        _this4.components = _this4.ProjectService.getComponentsByNodeId(_this4.nodeId);

                        // save the project
                        _this4.ProjectService.saveProject();
                    }
                });
            }
        }
    }]);

    return NodeController;
}();

;

NodeController.$inject = ['$anchorScroll', '$location', '$scope', '$state', '$stateParams', '$timeout', '$translate', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = NodeController;
//# sourceMappingURL=nodeController.js.map