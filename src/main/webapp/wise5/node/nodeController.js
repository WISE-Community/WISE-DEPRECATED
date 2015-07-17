define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
            function($rootScope,
                    $scope,
                    $state, 
                    $stateParams, 
                    ConfigService,
                    CurrentNodeService,
                    NodeService,
                    OpenResponseService,
                    ProjectService,
                    SessionService,
                    StudentAssetService,
                    StudentDataService) {
        
        // the auto save interval in milliseconds
        this.autoSaveInterval = 30000;
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        /*
         * an object that holds the mappings with the key being the component
         * and the value being the scope object from the child controller
         */
        $scope.componentToScope = {};
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the source for the node content
            var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
            
            // get the node content for this node
            NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                this.nodeContent = nodeContent;
                
                // populate the student work into this node
                //this.setStudentWork();
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                //this.importWork();
                
                // tell the parent controller that this node has loaded
                //this.nodeLoaded(this.nodeId);
                
                // start the auto save interval
                this.startAutoSaveInterval();
                
                // register this controller to listen for the exit event
                this.registerExitListener();
            }));
        };
        
        /**
         * Populate the student work into the node
         */
        this.setStudentWork = function() {
            
        };
        
        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.nodeContent != null) {
                prompt = this.nodeContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Import work from another node
         */
        this.importWork = function() {
            
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            
            // notify the child components that the save button was clicked
            $rootScope.$broadcast('nodeSaveClicked', {nodeId: this.nodeId});
            
            var saveTriggeredBy = 'saveButton';
            
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentStates(saveTriggeredBy);
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            
            // notify the child components that the submit button was clicked
            $rootScope.$broadcast('nodeSubmitClicked', {nodeId: this.nodeId});
            
            var saveTriggeredBy = 'submitButton';
            
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentStates(saveTriggeredBy);
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the component states for the node
                    var componentStates = StudentDataService.getComponentStatesByNodeId(nodeId);
                    
                    // check if any of the component states were submitted
                    var isSubmitted = NodeService.isWorkSubmitted(componentStates);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this node
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        /**
         * Get the components for this node.
         * @return an array that contains the content for the components
         */
        this.getComponents = function() {
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
                for (var c = 0; c < components.length; c++) {
                    var component = components[c];
                    
                    component.lockAfterSubmit = true;
                }
            }
            
            return components;
        };
        
        /**
         * Get the part given the part id
         * @param partId the part id we want
         * @return the part object with the given part id
         */
        this.getPartByPartId = function(partId) {
            
            var part = null;
            
            if (partId != null) {
                
                // get all the parts
                var parts = this.getComponents();
                
                // loop through all the parts
                for (var p = 0; p < parts.length; p ++) {
                    
                    // get a part
                    var tempPart = parts[p];
                    
                    if (tempPart != null) {
                        var tempPartId = tempPart.id;
                        
                        // check if the part id matches the one we want
                        if (tempPartId === partId) {
                            // the part id matches
                            part = tempPart;
                            break;
                        }
                    }
                }
            }
            
            return part;
        };
        
        /**
         * Get the component given the component id
         * @param componentId the component id we want
         * @return the component object with the given component id
         */
        this.getComponentById = function(componentId) {
            
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
        };
        
        /**
         * Get the html template for the component
         * @param componentType the component type
         * @return the path to the html template for the component
         */
        this.getComponentTypeHTML = function(componentType) {
            
            if (componentType == null) {
                // error
            } else if (NodeService.isStringUpperCase(componentType)) {
                /*
                 * the component type is all uppercase so we will convert it to all
                 * lowercase
                 */
                componentType = componentType.toLowerCase();
            } else {
                // get the component type in camel case
                componentType = NodeService.toCamelCase(componentType);
            }
            
            var componentTypeHTML = 'wise5/components/' + componentType + '/index.html';
            
            return componentTypeHTML;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var result = false;
            
            if (this.nodeContent != null && this.nodeContent.showSaveButton) {
                result = true;
            }
            
            return result;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var result = false;
            
            if (this.nodeContent != null && this.nodeContent.showSubmitButton) {
                result = true;
            }
            
            return result;
        };
        
        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        this.isLockAfterSubmit = function() {
            var result = false;
            
            if (this.componentContent != null) {
                
                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }
            
            return result;
        };
        
        /**
         * Start the auto save interval for this node
         */
        this.startAutoSaveInterval = function() {
            this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
                // check if the student work is dirty
                if (this.isDirty) {
                    // the student work is dirty so we will save
                    
                    var saveTriggeredBy = 'autoSave';
                    
                    /*
                     * obtain the component states from the children and save them
                     * to the server
                     */
                    this.createAndSaveComponentStates(saveTriggeredBy);
                }
            }), this.autoSaveInterval);
        };
        
        /**
         * Stop the auto save interval for this node
         */
        this.stopAutoSaveInterval = function() {
            clearInterval(this.autoSaveIntervalId);
        };
        
        /**
         * Obtain the component states from the children and save them
         * to the server
         * @param saveTriggeredBy the reason why the save was triggered
         */
        this.createAndSaveComponentStates = function(saveTriggeredBy) {
            
            // obtain the component states from the children
            var componentStates = this.createComponentStates(saveTriggeredBy);
            
            if (componentStates != null) {
                // save the component states to the server
                StudentDataService.saveComponentStatesToServer(componentStates);
            }
        };
        
        this.createComponentStates = function(saveTriggeredBy) {
            var componentStates = [];
            
            // get the components for this node
            var components = this.getComponents();
            
            if (components != null) {
                
                var runId = ConfigService.getRunId();
                var periodId = ConfigService.getPeriodId();
                var workgroupId = ConfigService.getWorkgroupId();
                
                // loop through all the components
                for (var c = 0; c < components.length; c++) {
                    
                    // get a component
                    var component = components[c];
                    
                    var studentWorkObject = null;
                    
                    if (component != null) {
                        // get the component id
                        var componentId = component.id;
                        
                        // get the scope for the component
                        var childScope = $scope.componentToScope[componentId];
                        
                        var componentState = null;
                        
                        if (childScope.getComponentState != null) {
                            // get the student work object from the child scope
                            componentState = childScope.getComponentState();
                        }
                        
                        if (componentState != null) {
                            
                            componentState.runId = runId;
                            componentState.periodId = periodId;
                            componentState.workgroupId = workgroupId;
                            
                            // set the node id
                            componentState.nodeId = this.nodeId;
                            
                            // set the component id into the student work object
                            componentState.componentId = componentId;
                            
                            // set the component type
                            componentState.componentType = component.componentType;
                            
                            // set the save triggered by value
                            componentState.saveTriggeredBy = saveTriggeredBy;
                            
                            if (saveTriggeredBy === 'submitButton') {
                                componentState.isSubmit = true;
                            }
                            
                            // add the student work object to our components array
                            componentStates.push(componentState);
                        }
                    }
                }
            }
            
            return componentStates;
        };
        
        /**
         * The function that child component controllers will call to register
         * themselves with this node
         * @param childScope the child scope object
         * @param component the component content for the component
         */
        $scope.registerComponentController = function(childScope, component) {
            
            if ($scope != null && component != null) {
                // get the component id
                var componentId = component.id;
                
                // add the component id to child scope mapping
                $scope.componentToScope[componentId] = childScope;
            }
        }
        
        /**
         * Listen for the componentSaveClicked event which occurs when a 
         * component has had its save button clicked
         */
        $scope.$on('componentSaveClicked', angular.bind(this, function(event, args) {
            var saveTriggeredBy = 'saveButton';
            
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentStates(saveTriggeredBy);
        }));
        
        /**
         * Listen for the componentSubmitClicked event which occurs when a
         * component has had its submit button clicked
         */
        $scope.$on('componentSubmitClicked', angular.bind(this, function(event, args) {
            var saveTriggeredBy = 'submitButton';
            
            /*
             * obtain the component states from the children and save them
             * to the server
             */
            this.createAndSaveComponentStates(saveTriggeredBy);
        }));
        
        /**
         * Listen for the componentStudentDataChanged event that will come from 
         * child component scopes
         * @param event
         * @param args the arguments provided when the event is fired
         */
        $scope.$on('componentStudentDataChanged', angular.bind(this, function(event, args) {
            /*
             * the student data in one of our child scopes has changed so
             * we will need to save
             */
            this.isDirty = true;
            
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
                    this.notifyConnectedParts(componentId, componentState);
                }
            }
        }));
        
        /**
         * Notify any connected components that the student data has changed
         * @param componentId the component id that has changed
         * @param componentState the new component state
         */
        this.notifyConnectedParts = function(changedComponentId, componentState) {
            
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
                                        
                                        // get the connected component id
                                        var connectedComponentId = connectedComponentParams.id;
                                        
                                        // check if the component id matches the one that has changed
                                        if (connectedComponentId === changedComponentId) {
                                            
                                            var connectedComponent = this.getComponentById(connectedComponentId);
                                            
                                            // get the scope for the listening component
                                            var componentScope = $scope.componentToScope[tempComponentId];
                                            
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
        };
        
        /**
         * Get the student data for a specific part
         * @param the node content for the part
         * @return the student data for the given part
         */
        this.getComponentStateByComponent = function(component) {
            
            var componentState = null;
            
            if (component != null) {
                // get the component id
                var componentId = component.id;
                
                if (componentId != null) {
                    
                    // get the latest component state for the component
                    componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, componentId);
                }
            }
            
            return componentState;
        };
        
        this.nodeLoaded = function(nodeId) {
            //var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
        };
        
        this.nodeUnloaded = function(nodeId) {
            var saveTriggeredBy = 'exitNode';
            
            this.createAndSaveComponentStates(saveTriggeredBy);
        };
        
        this.setCurrentNodeByNodeId = function(nodeId) {
            var node = ProjectService.getNodeById(nodeId);
            CurrentNodeService.setCurrentNode(node);
        };
        
        this.addNodeVisitItemToPortfolio = function() {
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var currentNodeVisit = StudentDataService.getLatestNodeVisitByNodeId(currentNodeId)
                if (currentNodeVisit != null) {
                    var portfolioItem = {};
                    portfolioItem.type = 'nodeVisit';
                    portfolioItem.nodeId = currentNode.id;
                    portfolioItem.nodeVisitId = currentNodeVisit.id;
                    portfolioItem.nodeVisit = currentNodeVisit;
                    PortfolioService.addItem(portfolioItem);
                }
            }
        };
        
        this.closeNode = function() {
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                var currentNodeId = currentNode.id;
                var parentNode = ProjectService.getParentGroup(currentNodeId);
                CurrentNodeService.setCurrentNode(parentNode);
            }
        };
        
        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('exitNode', angular.bind(this, function(event, args) {
            
            // get the node that is exiting
            var nodeToExit = args.nodeToExit;
            
            /*
             * make sure the node id of the node that is exiting is
             * this node
             */
            if (nodeToExit.id === this.nodeId) {
                var saveTriggeredBy = 'exitNode';
                
                // stop the auto save interval for this node
                this.stopAutoSaveInterval();
                
                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                this.nodeUnloaded(this.nodeId);
            }
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            /**
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before exiting.
             */
            this.logOutListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
                var saveTriggeredBy = 'exit';
                
                // stop the auto save interval for this node
                this.stopAutoSaveInterval();
                
                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                this.nodeUnloaded(this.nodeId);
                
                // call this function to remove the listener
                this.logOutListener();
                
                /*
                 * tell the session service that this listener is done
                 * performing everything it needs to do before exiting
                 */
                $rootScope.$broadcast('doneExiting');
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});