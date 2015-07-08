define(['app', 'drawingTool', 'vendor'], function(app) {
    app.$controllerProvider.register('DrawController', 
        function($rootScope,
            $scope,
            $state, 
            $stateParams,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            CRaterService,
            DrawService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;
        
        // will hold the drawing tool object
        this.drawingTool = null;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            this.drawingTool = new DrawingTool("#drawing-tool", {
                stamps: {
                    'Molecules': [
                                  'https://interactions-resources.concord.org/stamps/simple-atom.svg',
                                  'https://interactions-resources.concord.org/stamps/diatomic.svg',
                                  'https://interactions-resources.concord.org/stamps/diatomic-red.svg',
                                  'https://interactions-resources.concord.org/stamps/triatomic.svg',
                                  'https://interactions-resources.concord.org/stamps/positive-charge-symbol.svg',
                                  'https://interactions-resources.concord.org/stamps/negative-charge-symbol.svg',
                                  'https://interactions-resources.concord.org/stamps/positive-atom.svg',
                                  'https://interactions-resources.concord.org/stamps/negative-atom.svg',
                                  'https://interactions-resources.concord.org/stamps/slow-particle.svg',
                                  'https://interactions-resources.concord.org/stamps/medium-particle.svg',
                                  'https://interactions-resources.concord.org/stamps/fast-particle.svg',
                                  'https://interactions-resources.concord.org/stamps/low-density-particles.svg'
                                  ]
                },
                parseSVG: true
            });
            var state = null;
            $("#set-background").on("click", angular.bind(this, function () {
                this.drawingTool.setBackgroundImage($("#background-src").val());
            }));
            $("#resize-background").on("click", angular.bind(this, function () {
                this.drawingTool.resizeBackgroundToCanvas();
            }));
            $("#resize-canvas").on("click", angular.bind(this, function () {
                this.drawingTool.resizeCanvasToBackground();
            }));
            $("#shrink-background").on("click", angular.bind(this, function () {
                this.drawingTool.shrinkBackgroundToCanvas();
            }));
            $("#clear").on("click", angular.bind(this, function () {
                this.drawingTool.clear(true);
            }));
            $("#save").on("click", angular.bind(this, function () {
                state = drawingTool.save();
                $("#load").removeAttr("disabled");
            }));
            $("#load").on("click", angular.bind(this, function () {
                if (state === null) return;
                this.drawingTool.load(state);
            }));
            
            // set the content
            this.nodeContent = $scope.part;
            
            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.nodeContent.showPreviousWorkNodeId;
            
            if (showPreviousWorkNodeId != null) {
                // this part is showing previous work
                this.isShowPreviousWork = true;
                
                // get the node src for the node we want previous work from
                var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                
                // get the show previous work part id if it is provided
                var showPreviousWorkPartId = this.nodeContent.showPreviousWorkPartId;
                
                // get the node content for the show previous work node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                    
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(showPreviousWorkNodeId);
                    
                    // check if we are show previous work from a part
                    if (showPreviousWorkPartId != null) {
                        // we are showing previous work from a part
                        
                        // get the part from the node content
                        this.nodeContent = NodeService.getNodeContentPartById(showPreviousWorkNodeContent, showPreviousWorkPartId);
                        
                        // get the part from the node state
                        nodeState = NodeService.getNodeStateByPartId(nodeState, showPreviousWorkPartId);
                    } else {
                        // set the show previous work node content
                        this.nodeContent = showPreviousWorkNodeContent;
                    }
                    
                    // populate the student work into this node
                    this.setStudentWork(nodeState);
                    
                    // disable the node since we are just showing previous work
                    this.isDisabled = true;
                    
                    // get the part
                    var part = $scope.part;
                    
                    /*
                     * register this node with the parent node which will most  
                     * likely be a Questionnaire node
                     */
                    $scope.$parent.registerPartController($scope, part);
                }));
            } else {
                // this is a node part
                
                // get the latest node state
                var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                if ($scope.partStudentData != null) {
                    // set the part student data as the node state
                    nodeState = $scope.partStudentData;
                }
                
                // populate the student work into this node
                this.setStudentWork(nodeState);
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                // get the part
                var part = $scope.part;
                
                /*
                 * register this node with the parent node which will most  
                 * likely be a Questionnaire node
                 */
                $scope.$parent.registerPartController($scope, part);
                
                // listen for the drawing changed event
                this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));
            }
        };
        
        /**
         * Populate the student work into the node
         * @param componentState the node state to populate into the node
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    var drawData = studentData.drawData;
                    
                    if (drawData != null) {
                        this.drawingTool.load(drawData);
                    }
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            this.saveTriggeredBy = 'saveButton';
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.saveTriggeredBy = 'submitButton';
            
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Called when the student changes their work
         */
        this.studentDataChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a node state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved.
             * this will also notify connected parts that this part's
             * student data has changed.
             */
            $scope.$emit('partStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            if (componentState != null) {
                var studentData = {};
                
                // get the draw JSON string
                var studentDataJSONString = this.getDrawData();
                studentData.drawData = studentDataJSONString;
                
                componentState.studentData = studentData;
                
                if(this.saveTriggeredBy != null) {
                    // set the saveTriggeredBy value
                    componentState.saveTriggeredBy = this.saveTriggeredBy;
                }
            }
            
            return componentState;
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
                    
                    // get the node visits for the node
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    
                    // check if the student has ever submitted work for this node
                    var isSubmitted = NodeService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this node
                        this.isDisabled = true;
                    }
                }
            }
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            if (this.nodeContent != null) {
                
                // check the showSaveButton field in the node content
                if (this.nodeContent.showSaveButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            var show = false;
            
            if (this.nodeContent != null) {
                
                // check the showSubmitButton field in the node content
                if (this.nodeContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
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
         * Get the draw data
         * @return the draw data from the drawing tool as a JSON string
         */
        this.getDrawData = function() {
            var drawData = null;
            
            drawData = this.drawingTool.save();
            
            return drawData;
        };
        
        /**
         * Import work from another node
         */
        this.importWork = function() {
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    
                    // get the latest node state for this node
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    /*
                     * we will only import work into this node if the student
                     * has not done any work for this node
                     */
                    if(nodeState == null) {
                        // the student has not done any work for this node
                        
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            
                            // get the node that we want to import work from
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                
                                // get the node type of the node we are importing from
                                var importWorkNodeType = importWorkNode.type;
                                
                                // get the latest node state from the node we are importing from
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                if (importWorkNodeState != null) {
                                    /*
                                     * populate a new node state with the work from the 
                                     * imported node state
                                     */
                                    var populatedNodeState = DrawService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
                                    // populate the node state into this node
                                    this.setStudentWork(populatedNodeState);
                                }
                            }
                        }
                    }
                }
            }
        };
        
        /**
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.nodeContent.id;
            
            return componentId;
        };
        
        /**
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            
            var componentState = null;
            
            if ($scope.drawController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.drawController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.drawController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
        }));
        
        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        this.registerExitListener = function() {
            
            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = $scope.$on('exit', angular.bind(this, function(event, args) {
                
                $rootScope.$broadcast('doneExiting');
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});