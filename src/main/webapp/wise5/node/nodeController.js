'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeController = function () {
    function NodeController($filter, $q, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, NodeController);

        this.$filter = $filter;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        // the auto save interval in milliseconds
        this.autoSaveInterval = 60000;

        // the node id of the current node
        this.nodeId = null;

        // field that will hold the node content
        this.nodeContent = null;

        // field that will hold the node status
        this.nodeStatus = null;

        // field that will hold the node title
        this.nodeTitle = null;

        // array to hold ids of dirty component
        this.dirtyComponentIds = [];

        // array to hold ids of components where student work has changed since last submission
        this.dirtySubmitComponentIds = [];

        // whether the student work has changed since last submit
        this.submit = false;

        this.workgroupId = this.ConfigService.getWorkgroupId();

        this.teacherWorkgroupId = this.ConfigService.getTeacherWorkgroupId();

        /*
         * an object that holds the mappings with the key being the component
         * and the value being the scope object from the child controller
         */
        this.componentToScope = {};

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // perform setup of this node only if the current node is not a group.
        if (this.StudentDataService.getCurrentNode() && this.ProjectService.isApplicationNode(this.StudentDataService.getCurrentNodeId())) {
            // get the current node and node id
            var currentNode = this.StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }

            // get the node content
            this.nodeContent = this.ProjectService.getNodeById(this.nodeId);

            this.nodeTitle = this.ProjectService.getNodeTitleByNodeId(this.nodeId);

            this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];

            // populate the student work into this node
            //this.setStudentWork();

            // check if we need to lock this node
            this.calculateDisabled();

            //this.importWork();

            // start the auto save interval
            this.startAutoSaveInterval();

            // register this controller to listen for the exit event
            this.registerExitListener();

            if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('enterNode')) {
                this.NodeService.evaluateTransitionLogic();
            }

            // set save message with last save/submission
            // for now, we'll use the latest component state (since we don't currently keep track of node-level saves)
            // TODO: use node states once we implement node state saving
            var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId);
            if (latestComponentState) {
                var latestClientSaveTime = latestComponentState.clientSaveTime;
                if (latestComponentState.isSubmit) {
                    this.setSaveMessage(this.$translate('LAST_SUBMITTED'), latestClientSaveTime);
                } else {
                    this.setSaveMessage(this.$translate('LAST_SAVED'), latestClientSaveTime);
                }
            }

            // save nodeEntered event
            var nodeId = this.nodeId;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "nodeEntered";
            var eventData = {};
            eventData.nodeId = nodeId;
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        }

        /**
         * Listen for the componentSaveTriggered event which occurs when a
         * component is requesting student data to be saved
         */
        this.$scope.$on('componentSaveTriggered', function (event, args) {
            var isAutoSave = false;

            if (args != null) {
                var nodeId = args.nodeId;
                var componentId = args.componentId;

                if (nodeId != null && componentId != null) {
                    if (_this.nodeId == nodeId && _this.nodeContainsComponent(componentId)) {
                        /*
                         * obtain the component states from the children and save them
                         * to the server
                         */
                        _this.createAndSaveComponentData(isAutoSave, componentId);
                    }
                }
            }
        });

        /**
         * Listen for the componentSubmitTriggered event which occurs when a
         * component is requesting student data to be submitted
         */
        this.$scope.$on('componentSubmitTriggered', function (event, args) {
            var isAutoSave = false;
            var isSubmit = true;

            if (args != null) {
                var nodeId = args.nodeId;
                var componentId = args.componentId;

                if (nodeId != null && componentId != null) {
                    if (_this.nodeId == nodeId && _this.nodeContainsComponent(componentId)) {
                        /*
                         * obtain the component states from the children and save them
                         * to the server
                         */
                        _this.createAndSaveComponentData(isAutoSave, componentId, isSubmit);
                    }
                }
            }
        });

        /**
         * Listen for the componentStudentDataChanged event that will come from
         * child component scopes
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentStudentDataChanged', function (event, args) {
            /*
             * the student data in one of our child scopes has changed so
             * we will need to save
             */
            if (args != null) {

                // get the part id
                var componentId = args.componentId;

                // get the new component state
                var componentState = args.componentState;

                if (componentId != null && componentState != null) {

                    /*
                     * notify the parts that are connected that the student
                     * data has changed
                     */
                    _this.notifyConnectedParts(componentId, componentState);

                    if (componentState.nodeId == null) {

                        if (args.nodeId != null) {
                            /*
                             * set the node id into the component state because
                             * the component state hasn't had it set at this
                             * point.
                             */
                            componentState.nodeId = args.nodeId;
                        }
                    }

                    if (componentState.componentId == null) {

                        if (args.componentId != null) {
                            /*
                             * set the component id into the component state
                             * because the component state hasn't had it set at
                             * this point.
                             */
                            componentState.componentId = args.componentId;
                        }
                    }

                    _this.$scope.$broadcast('siblingComponentStudentDataChanged', args);
                }
            }
        });

        /**
         * Listen for the componentDirty event that will come from child component
         * scopes; notifies node that component has/doesn't have unsaved work
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentDirty', function (event, args) {
            var componentId = args.componentId;

            if (componentId) {
                var isDirty = args.isDirty;
                var index = _this.dirtyComponentIds.indexOf(componentId);

                if (isDirty && index === -1) {
                    // add component id to array of dirty components
                    _this.dirtyComponentIds.push(componentId);
                } else if (!isDirty && index > -1) {
                    // remove component id from array of dirty components
                    _this.dirtyComponentIds.splice(index, 1);
                }
            }
        });

        /**
         * Listen for the componentSubmitDirty event that will come from child
         * component scopes; notifies node that work has/has not changed for a
         * component since last submission
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentSubmitDirty', function (event, args) {
            var componentId = args.componentId;

            if (componentId) {
                var isDirty = args.isDirty;
                var index = _this.dirtySubmitComponentIds.indexOf(componentId);

                if (isDirty && index === -1) {
                    // add component id to array of dirty submit components
                    _this.dirtySubmitComponentIds.push(componentId);
                } else if (!isDirty && index > -1) {
                    // remove component id from array of dirty submit components
                    _this.dirtySubmitComponentIds.splice(index, 1);
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        this.$scope.$on('exitNode', function (event, args) {
            // get the node that is exiting
            var nodeToExit = args.nodeToExit;

            /*
             * make sure the node id of the node that is exiting is
             * this node
             */
            if (nodeToExit.id === _this.nodeId) {
                var saveTriggeredBy = 'exitNode';

                // stop the auto save interval for this node
                _this.stopAutoSaveInterval();

                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                _this.nodeUnloaded(_this.nodeId);

                // check if this node has transition logic that should be run when the student exits the node
                if (_this.NodeService.hasTransitionLogic() && _this.NodeService.evaluateTransitionLogicOn('exitNode')) {
                    // this node has transition logic
                    _this.NodeService.evaluateTransitionLogic();
                }
            }
        });

        // load script for this node, if any
        var script = this.nodeContent.script;
        if (script != null) {
            this.ProjectService.retrieveScript(script).then(function (script) {
                new Function(script).call(_this);
            });
        }
    }

    /**
     * The function that child component controllers will call to register
     * themselves with this node
     * @param childScope the child scope object
     * @param component the component content for the component
     */


    _createClass(NodeController, [{
        key: 'registerComponentController',
        value: function registerComponentController(childScope, component) {
            if (childScope != null && component != null) {
                // get the component id
                var componentId = component.id;

                // add the component id to child scope mapping
                this.componentToScope[componentId] = childScope;
            }
        }

        /**
         * Populate the student work into the node
         */

    }, {
        key: 'setStudentWork',
        value: function setStudentWork() {}
    }, {
        key: 'importWork',


        /**
         * Import work from another node
         */
        value: function importWork() {}
    }, {
        key: 'getRevisions',


        /**
         * Returns all the revisions made by this user for the specified component
         */
        value: function getRevisions(componentId) {
            var revisions = [];
            // get the component states for this component
            var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, componentId);
            return componentStates;
        }
    }, {
        key: 'showRevisions',
        value: function showRevisions($event, componentId, isComponentDisabled) {
            var revisions = this.getRevisions(componentId);
            var allowRevert = !isComponentDisabled;

            // get the scope for the component
            var childScope = this.componentToScope[componentId];

            // TODO: generalize for other controllers
            var componentController = null;

            if (childScope.openResponseController) {
                componentController = childScope.openResponseController;
            } else if (childScope.drawController) {
                componentController = childScope.drawController;
            }

            // broadcast showRevisions event
            this.$rootScope.$broadcast('showRevisions', { revisions: revisions, componentController: componentController, allowRevert: allowRevert, $event: $event });
        }
    }, {
        key: 'showStudentAssets',


        /**
         * Show student assets
         * @param $event
         * @param componentId
         */
        value: function showStudentAssets($event, componentId) {

            // get the scope for the component
            var childScope = this.componentToScope[componentId];

            // TODO: generalize for other controllers
            var componentController = null;

            if (childScope.openResponseController) {
                componentController = childScope.openResponseController;
            } else if (childScope.drawController) {
                componentController = childScope.drawController;
            } else if (childScope.discussionController) {
                componentController = childScope.discussionController;
            } else if (childScope.tableController) {
                componentController = childScope.tableController;
            } else if (childScope.graphController) {
                componentController = childScope.graphController;
            }

            this.$rootScope.$broadcast('showStudentAssets', { componentController: componentController, $event: $event });
        }
    }, {
        key: 'saveButtonClicked',


        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {

            // notify the child components that the save button was clicked
            this.$rootScope.$broadcast('nodeSaveClicked', { nodeId: this.nodeId });

            var isAutoSave = false;

            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentData(isAutoSave);
        }
    }, {
        key: 'submitButtonClicked',


        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {

            // notify the child components that the submit button was clicked
            this.$rootScope.$broadcast('nodeSubmitClicked', { nodeId: this.nodeId });

            var isAutoSave = false;
            var isSubmit = true;

            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentData(isAutoSave, null, isSubmit);
        }
    }, {
        key: 'calculateDisabled',


        /**
         * Check if we need to lock the node
         */
        value: function calculateDisabled() {

            var nodeId = this.nodeId;

            // get the node content
            var nodeContent = this.nodeContent;

            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;

                if (lockAfterSubmit) {
                    // we need to lock the step after the student has submitted

                    // get the component states for the node
                    var componentStates = this.StudentDataService.getComponentStatesByNodeId(nodeId);

                    // check if any of the component states were submitted
                    var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                    if (isSubmitted) {
                        // the student has submitted work for this node
                        this.isDisabled = true;
                    }
                }
            }
        }
    }, {
        key: 'getComponents',


        /**
         * Get the components for this node.
         * @return an array that contains the content for the components.
         */
        value: function getComponents() {
            var components = null;

            if (this.nodeContent != null) {
                components = this.nodeContent.components;
            }

            if (components != null && this.isDisabled) {
                for (var c = 0; c < components.length; c++) {
                    var component = components[c];

                    component.isDisabled = true;
                }
            }

            if (components != null && this.nodeContent.lockAfterSubmit) {
                for (c = 0; c < components.length; c++) {
                    component = components[c];

                    component.lockAfterSubmit = true;
                }
            }

            return components;
        }
    }, {
        key: 'getComponentById',


        /**
         * Get the component given the component id
         * @param componentId the component id we want
         * @return the component object with the given component id
         */
        value: function getComponentById(componentId) {

            var component = null;

            if (componentId != null) {

                // get all the components
                var components = this.getComponents();

                // loop through all the components
                for (var c = 0; c < components.length; c++) {

                    // get a component
                    var tempComponent = components[c];

                    if (tempComponent != null) {
                        var tempComponentId = tempComponent.id;

                        // check if the component id matches the one we want
                        if (tempComponentId === componentId) {
                            // the component id matches
                            component = tempComponent;
                            break;
                        }
                    }
                }
            }

            return component;
        }
    }, {
        key: 'nodeContainsComponent',


        /**
         * Check if this node contains a given component id
         * @param componentId the component id
         * @returns whether this node contains the component
         */
        value: function nodeContainsComponent(componentId) {
            var result = false;

            if (componentId != null) {

                // get all the components
                var components = this.getComponents();

                // loop through all the components
                for (var c = 0; c < components.length; c++) {

                    // get a component
                    var tempComponent = components[c];

                    if (tempComponent != null) {
                        var tempComponentId = tempComponent.id;

                        // check if the component id matches the one we want
                        if (tempComponentId === componentId) {
                            // the component id matches
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getComponentTemplatePath',


        /**
         * Get the html template for the component
         * @param componentType the component type
         * @return the path to the html template for the component
         */
        value: function getComponentTemplatePath(componentType) {
            return this.NodeService.getComponentTemplatePath(componentType);
        }
    }, {
        key: 'showSaveButton',


        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            var result = false;

            if (this.nodeContent != null && this.nodeContent.showSaveButton) {
                result = true;
            }

            return result;
        }
    }, {
        key: 'showSubmitButton',


        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            var result = false;

            if (this.nodeContent != null && this.nodeContent.showSubmitButton) {
                result = true;
            }

            return result;
        }
    }, {
        key: 'isLockAfterSubmit',


        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        value: function isLockAfterSubmit() {
            var result = false;

            if (this.componentContent != null) {

                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'setSaveMessage',


        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */
        value: function setSaveMessage(message, time) {
            this.saveMessage.text = message;
            this.saveMessage.time = time;
        }
    }, {
        key: 'startAutoSaveInterval',


        /**
         * Start the auto save interval for this node
         */
        value: function startAutoSaveInterval() {
            var _this2 = this;

            this.autoSaveIntervalId = setInterval(function () {
                // check if the student work is dirty
                if (_this2.dirtyComponentIds.length) {
                    // the student work is dirty so we will save

                    var isAutoSave = true;

                    /*
                     * obtain the component states from the children and save them
                     * to the server
                     */
                    _this2.createAndSaveComponentData(isAutoSave);
                }
            }, this.autoSaveInterval);
        }
    }, {
        key: 'stopAutoSaveInterval',


        /**
         * Stop the auto save interval for this node
         */
        value: function stopAutoSaveInterval() {
            clearInterval(this.autoSaveIntervalId);
        }
    }, {
        key: 'createAndSaveComponentData',


        /**
         * Obtain the componentStates and annotations from the children and save them
         * to the server
         * @param isAutoSave whether the component states were auto saved
         * @param componentId (optional) the component id of the component
         * that triggered the save
         * @param isSubmit (optional) whether this is a sumission or not
         * @returns a promise that will save all the component states for the step
         * that need saving
         */
        value: function createAndSaveComponentData(isAutoSave, componentId, isSubmit) {
            var _this3 = this;

            // obtain the component states from the children
            return this.createComponentStates(isAutoSave, componentId, isSubmit).then(function (componentStates) {
                var componentAnnotations = [];
                var componentEvents = null;
                var nodeStates = null;

                if (componentStates != null && componentStates.length || componentAnnotations != null && componentAnnotations.length || componentEvents != null && componentEvents.length) {

                    // get the annotations from the components
                    for (var c = 0; c < componentStates.length; c++) {
                        var componentState = componentStates[c];

                        if (componentState != null) {
                            var annotations = componentState.annotations;

                            if (annotations != null) {
                                /*
                                 * add the annotations to our array of annotations that will
                                 * be saved to the server
                                 */
                                componentAnnotations = componentAnnotations.concat(annotations);
                            }

                            // remove the annotations from the component state
                            delete componentState.annotations;
                        }
                    }

                    // save the component states to the server
                    return _this3.StudentDataService.saveToServer(componentStates, nodeStates, componentEvents, componentAnnotations).then(function (savedStudentDataResponse) {
                        if (savedStudentDataResponse) {
                            // check if this node has transition logic that should be run when the student data changes
                            if (_this3.NodeService.hasTransitionLogic() && _this3.NodeService.evaluateTransitionLogicOn('studentDataChanged')) {
                                // this node has transition logic
                                _this3.NodeService.evaluateTransitionLogic();
                            }

                            // check if this node has transition logic that should be run when the student score changes
                            if (_this3.NodeService.hasTransitionLogic() && _this3.NodeService.evaluateTransitionLogicOn('scoreChanged')) {

                                if (componentAnnotations != null && componentAnnotations.length > 0) {
                                    var evaluateTransitionLogic = false;

                                    // loop through all the annotations and check if any were score annotations
                                    for (var c = 0; c < componentAnnotations.length; c++) {
                                        var componentAnnotation = componentAnnotations[c];

                                        if (componentAnnotation != null) {
                                            if (componentAnnotation.type === 'autoScore') {
                                                evaluateTransitionLogic = true;
                                            }
                                        }
                                    }

                                    if (evaluateTransitionLogic) {
                                        // the student score has changed so we will evaluate the transition logic
                                        _this3.NodeService.evaluateTransitionLogic();
                                    }
                                }
                            }

                            var studentWorkList = savedStudentDataResponse.studentWorkList;
                            if (!componentId && studentWorkList && studentWorkList.length) {
                                // this was a step save or submission and student work was saved, so set save message
                                var latestStudentWork = studentWorkList[studentWorkList.length - 1];
                                var serverSaveTime = latestStudentWork.serverSaveTime;
                                var clientSaveTime = _this3.ConfigService.convertToClientTimestamp(serverSaveTime);

                                if (isAutoSave) {
                                    _this3.setSaveMessage(_this3.$translate('AUTO_SAVED'), clientSaveTime);
                                } else if (isSubmit) {
                                    _this3.setSaveMessage(_this3.$translate('SUBMITTED'), clientSaveTime);
                                } else {
                                    _this3.setSaveMessage(_this3.$translate('SAVED'), clientSaveTime);
                                }
                            } else {
                                _this3.setSaveMessage('', null);
                            }
                        }

                        return savedStudentDataResponse;
                    });
                }
            });
        }
    }, {
        key: 'createComponentStates',


        /**
         * Loop through this node's components and get/create component states
         * @param isAutoSave whether the component states were auto saved
         * @param componentId (optional) the component id of the component
         * that triggered the save
         * @param isSubmit (optional) whether this is a submission or not
         * @returns an array of promises that will return component states
         */
        value: function createComponentStates(isAutoSave, componentId, isSubmit) {
            var components = [];
            var componentStatePromises = [];

            // get the components for this node
            if (componentId) {
                var component = this.getComponentById(componentId);
                if (component) {
                    components.push(component);
                }
            } else {
                components = this.getComponents();
            }

            if (components.length) {

                var runId = this.ConfigService.getRunId();
                var periodId = this.ConfigService.getPeriodId();
                var workgroupId = this.ConfigService.getWorkgroupId();
                var nodeId = this.nodeId;

                // loop through all the components
                for (var c = 0; c < components.length; c++) {

                    // get a component
                    var component = components[c];

                    if (component != null) {
                        // get the component id
                        var tempComponentId = component.id;
                        var componentType = component.type;

                        // get the scope for the component
                        var childScope = this.componentToScope[tempComponentId];

                        if (childScope != null) {
                            if (childScope.getComponentState) {
                                // get the component state promise from the child scope
                                var componentStatePromise = this.getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit);
                                componentStatePromises.push(componentStatePromise);
                            }
                        }
                    }
                }
            }

            return this.$q.all(componentStatePromises);
        }
    }, {
        key: 'getComponentStateFromChildScope',


        /**
         * Get the component state from the child scope
         * @param childScope the child scope
         * @param runId the run id
         * @param periodId the period id
         * @param workgroupId the workgroup id
         * @param nodeId the node id
         * @param componentId the component id that has triggered the save
         * @param tempComponentId the component id of the component we are obtaining
         * a component state for
         * @param componentType the component type
         * @param isAutoSave whether this save was triggered by an auto save
         * @param isSubmit whether this save was triggered by a submit
         */
        value: function getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit) {
            var _this4 = this;

            return childScope.getComponentState(isSubmit).then(function (componentState) {
                if (componentState != null) {

                    componentState.runId = runId;
                    componentState.periodId = periodId;
                    componentState.workgroupId = workgroupId;
                    componentState.nodeId = _this4.nodeId;

                    // set the component id into the student work object
                    componentState.componentId = tempComponentId;

                    // set the component type
                    componentState.componentType = componentType;

                    if (componentId == null) {
                        /*
                         * the node has triggered the save so all the components will
                         * either have isAutoSave set to true or false; if this is a
                         * submission, all the components will have isSubmit set to true
                         */
                        componentState.isAutoSave = isAutoSave;

                        if (isSubmit) {
                            /*
                             * set the isSubmit value in the component state if
                             * it wasn't set by the component
                             */
                            if (componentState.isSubmit == null) {
                                componentState.isSubmit = true;
                            }
                        }
                    } else {
                        /*
                         * a component has triggered the save so only that component will
                         * have isAutoSave set to false; if this is a submission,
                         * component will have isSubmit set to true
                         */

                        if (componentId === tempComponentId) {
                            // this component triggered the save
                            componentState.isAutoSave = false;

                            if (isSubmit) {
                                /*
                                 * set the isSubmit value in the component state if
                                 * it wasn't set by the component
                                 */
                                if (componentState.isSubmit == null) {
                                    componentState.isSubmit = true;
                                }
                            }
                        }
                    }

                    return componentState;
                }
            });
        }

        /**
         * Get the latest annotations for a given component
         * TODO: move to a parent component class in the future?
         * @param componentId the component's id
         * @return object containing the component's latest score and comment annotations
         */

    }, {
        key: 'getLatestComponentAnnotations',
        value: function getLatestComponentAnnotations(componentId) {
            var latestScoreAnnotation = null;
            var latestCommentAnnotation = null;

            var nodeId = this.nodeId;
            var workgroupId = this.workgroupId;

            // get the latest score annotation for this component
            latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, workgroupId, 'any');

            // get the latest comment annotation for this component
            latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(nodeId, componentId, workgroupId, 'any');

            return {
                'score': latestScoreAnnotation,
                'comment': latestCommentAnnotation
            };
        }
    }, {
        key: 'notifyConnectedParts',


        /**
         * Notify any connected components that the student data has changed
         * @param componentId the component id that has changed
         * @param componentState the new component state
         */
        value: function notifyConnectedParts(changedComponentId, componentState) {

            if (changedComponentId != null && componentState != null) {

                // get all the components
                var components = this.getComponents();

                if (components != null) {

                    /*
                     * loop through all the components and look for components
                     * that are listening for the given component id to change.
                     * only notify components that are listening for changes
                     * from the specific component id.
                     */
                    for (var c = 0; c < components.length; c++) {

                        // get a component
                        var tempComponent = components[c];

                        if (tempComponent != null) {

                            // get this component id
                            var tempComponentId = tempComponent.id;

                            /*
                             * get the connected components that this component is
                             * listening for
                             */
                            var connectedComponents = tempComponent.connectedComponents;

                            if (connectedComponents != null) {

                                // loop through all the connected components
                                for (var cc = 0; cc < connectedComponents.length; cc++) {

                                    // get a connected component
                                    var connectedComponentParams = connectedComponents[cc];

                                    if (connectedComponentParams != null) {

                                        // get the node id
                                        var nodeId = connectedComponentParams.nodeId;

                                        // get the component id
                                        var componentId = connectedComponentParams.componentId;

                                        /*
                                         * get the id which is the old field that we used to store
                                         * the component id in. this is here to maintain backwards
                                         * compatibility.
                                         */
                                        var id = connectedComponentParams.id;

                                        if (nodeId != null && componentId != null) {
                                            // the node id and component id was provided
                                            var connectedComponentId = componentId;
                                            var connectedNodeId = nodeId;

                                            // check if the component id matches the one that has changed
                                            if (connectedNodeId == this.nodeId && connectedComponentId === changedComponentId) {

                                                var connectedComponent = this.getComponentById(connectedComponentId);

                                                // get the scope for the listening component
                                                var componentScope = this.componentToScope[tempComponentId];

                                                // check if the listening component has a handler function
                                                if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                    // tell the listening part to handle the student data changing
                                                    componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                                }
                                            }
                                        } else if (componentId != null) {
                                            /*
                                             * the node id was not provided but the component id was provided
                                             * so we will assume the component id is in the current node
                                             */
                                            var connectedComponentId = componentId;

                                            // check if the component id matches the one that has changed
                                            if (connectedComponentId === changedComponentId) {

                                                var connectedComponent = this.getComponentById(connectedComponentId);

                                                // get the scope for the listening component
                                                var componentScope = this.componentToScope[tempComponentId];

                                                // check if the listening component has a handler function
                                                if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                    // tell the listening part to handle the student data changing
                                                    componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                                }
                                            }
                                        } else if (id != null) {
                                            /*
                                             * the node id and component id were not provided but the
                                             * id was provided which is the old field we used to set
                                             * the component id in. this is here to maintain backwards
                                             * compatibility.
                                             */
                                            var connectedComponentId = id;

                                            // check if the component id matches the one that has changed
                                            if (connectedComponentId === changedComponentId) {

                                                var connectedComponent = this.getComponentById(connectedComponentId);

                                                // get the scope for the listening component
                                                var componentScope = this.componentToScope[tempComponentId];

                                                // check if the listening component has a handler function
                                                if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                    // tell the listening part to handle the student data changing
                                                    componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: 'getComponentStateByComponentId',


        /**
         * Get the student data for a specific part
         * @param the componentId
         * @return the student data for the given component
         */
        value: function getComponentStateByComponentId(componentId) {
            var componentState = null;

            if (componentId != null) {

                // get the latest component state for the component
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, componentId);
            }

            return componentState;
        }
    }, {
        key: 'getComponentStateByNodeIdAndComponentId',


        /**
         * Get the student data for a specific part
         * @param the nodeId
         * @param the componentId
         * @return the student data for the given component
         */
        value: function getComponentStateByNodeIdAndComponentId(nodeId, componentId) {
            var componentState = null;

            if (nodeId != null && componentId != null) {

                // get the latest component state for the component
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            }

            return componentState;
        }
    }, {
        key: 'nodeUnloaded',
        value: function nodeUnloaded(nodeId) {
            var isAutoSave = true;

            this.createAndSaveComponentData(isAutoSave);

            // save nodeExited event
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "nodeExited";
            var eventData = {};
            eventData.nodeId = nodeId;
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
        }
    }, {
        key: 'getSubmitDirty',


        /**
         * Checks whether any of the node's components have unsubmitted work
         * @return boolean whether or not there is unsubmitted work
         */
        value: function getSubmitDirty() {
            var submitDirty = false;
            var components = this.getComponents();

            if (components != null) {
                for (var c = 0, l = components.length; c < l; c++) {
                    var id = components[c].id;
                    var latestState = this.getComponentStateByComponentId(id);

                    if (latestState && !latestState.isSubmit) {
                        submitDirty = true;
                        break;
                    }
                }
            }

            return submitDirty;
        }
    }, {
        key: 'registerExitListener',


        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        value: function registerExitListener() {
            var _this5 = this;

            /**
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before exiting.
             */
            this.logOutListener = this.$scope.$on('exit', function (event, args) {

                // stop the auto save interval for this node
                _this5.stopAutoSaveInterval();

                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                _this5.nodeUnloaded(_this5.nodeId);

                // call this function to remove the listener
                _this5.logOutListener();

                /*
                 * tell the session service that this listener is done
                 * performing everything it needs to do before exiting
                 */
                _this5.$rootScope.$broadcast('doneExiting');
            });
        }
    }]);

    return NodeController;
}();

NodeController.$inject = ['$filter', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService'];

exports.default = NodeController;
//# sourceMappingURL=nodeController.js.map