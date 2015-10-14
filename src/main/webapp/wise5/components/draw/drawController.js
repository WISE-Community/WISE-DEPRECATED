define(['app', 'drawingTool', 'vendor'], function(app) {
    app.$controllerProvider.register('DrawController', 
        function(
            $injector,
            $rootScope,
            $scope,
            $state, 
            $stateParams,
            ConfigService,
            DrawService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;
        
        // will hold the drawing tool object
        this.drawingTool = null;
        
        /**
         * Perform setup of the component
         */
        this.setup = function() {
            
            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            this.drawingTool = new DrawingTool("#drawing-tool", {
                stamps: {
                    'fun': [
                        'https://upload.wikimedia.org/wikipedia/commons/3/31/Ice_Cream_dessert_02.jpg',
                        'https://popcorntime.io/images/logo-valentines.png',

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

            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;

                // get the component type
                this.componentType = this.componentContent.componentType;
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the node content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    // get the component state for the show previous work
                    var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                    // populate the student work into this component
                    this.setStudentWork(componentState);

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
                    if (componentState == null) {
                        /*
                         * only import work if the student does not already have
                         * work for this component
                         */
                        
                        // check if we need to import work
                        var importWorkNodeId = this.componentContent.importWorkNodeId;
                        var importWorkComponentId = this.componentContent.importWorkComponentId;
                        
                        if (importWorkNodeId != null && importWorkComponentId != null) {
                            // import the work from the other component
                            this.importWork();
                        }
                    } else {
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                    }
                    
                    // check if we need to lock this component
                    this.calculateDisabled();
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                    
                    // listen for the drawing changed event
                    this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));

                    // listen for selected tool changed event
                    this.drawingTool.on('tool:changed', function (toolName) {
                        // log this event
                        var category = "Tool";
                        var event = "toolSelected";
                        var data = {};
                        data.selectedToolName = toolName;
                        StudentDataService.saveComponentEvent(this, category, event, data);
                    }.bind(this));
                }
            }
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data from the component state
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    
                    // get the draw data
                    var drawData = studentData.drawData;
                    
                    if (drawData != null) {
                        // set the draw data into the drawing tool
                        this.drawingTool.load(drawData);
                    }
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {

            // tell the parent node that this component wants to save
            $scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }

            // tell the parent node that this component wants to submit
            $scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
            
            // create a component state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved. 
             * this will also notify connected parts that this component's student 
             * data has changed.
             */
            $scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
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
                
                // set the draw JSON string into the draw data
                studentData.drawData = studentDataJSONString;

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }
                
                // set the student data into the component state
                componentState.studentData = studentData;
            }
            
            return componentState;
        };
        
        /**
         * Check if we need to lock the component
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the component states for this component
                    var componentStates = StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    // check if any of the component states were submitted
                    var isSubmitted = NodeService.isWorkSubmitted(componentStates);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this component
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
            
            if (this.componentContent != null) {
                
                // check the showSaveButton field in the component content
                if (this.componentContent.showSaveButton) {
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
            
            if (this.componentContent != null) {
                
                // check the showSubmitButton field in the component content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
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

        this.dropCallback = angular.bind(this, function(event, ui, title, $index) {
            if (this.isDisabled) {
                // don't import if step is disabled/locked
                return;
            }

            var objectType = $(ui.helper.context).data('objectType');
            if (objectType === 'NotebookItem') {
                var notebookItem = $(ui.helper.context).data('objectData');
                if (notebookItem.studentAsset != null) {
                    // we're importing a StudentAssetNotebookItem
                    var studentAsset = notebookItem.studentAsset;
                    StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                        if (copiedAsset != null) {
                            fabric.Image.fromURL(copiedAsset.url, angular.bind(this, function(oImg) {
                                oImg.scaleToWidth(200);  // set max width and have height scale relatively
                                // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
                                //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
                                //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
                                //oImg.center();
                                oImg.studentAssetId = copiedAsset.id;  // keep track of this asset id
                                this.drawingTool.canvas.add(oImg);   // add copied asset image to canvas
                            }));
                        }
                    }));
                } else if (notebookItem.studentWork != null) {
                    // we're importing a StudentWorkNotebookItem
                    var studentWork = notebookItem.studentWork;

                    var componentType = studentWork.componentType;

                    if (componentType != null) {
                        var childService = $injector.get(componentType + 'Service');

                        if (childService != null) {
                            if (componentType === 'Draw') {
                                var studentWorkJPEG = childService.getStudentWorkJPEG(studentWork);
                                fabric.Image.fromURL(studentWorkJPEG, angular.bind(this, function(oImg) {
                                    oImg.scaleToWidth(200);  // set max width and have height scale relatively
                                    // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
                                    //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
                                    //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
                                    //oImg.center();
                                    oImg.studentWorkId = studentWork.id;  // keep track of this asset id
                                    this.drawingTool.canvas.add(oImg);   // add copied asset image to canvas
                                    this.studentDataChanged();
                                }));
                            } else {
                                return;
                                // the rest (non-draw step import) doesn't work quite yet. TODO
                                /*
                                var studentWorkHTML = childService.getStudentWorkAsHTML(studentWork);

                                if (studentWorkHTML != null) {
                                    // references:
                                    // 1. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
                                    // 2. http://stackoverflow.com/questions/27652694/inserting-html-into-canvas-without-creating-cors-restriction
                                    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
                                        '<foreignObject width="100%" height="100%">' +
                                        '<div xmlns="http://www.w3.org/1999/xhtml">' +
                                        studentWorkHTML +
                                        '</div>' +
                                        '</foreignObject>' +
                                        '</svg>';

                                    var DOMURL = window.URL || window.webkitURL || window;

                                    var img = new Image();
                                    img.crossOrigin = "Anonymous";  // avoids CORS
                                    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
                                    //var url = DOMURL.createObjectURL(svg);
                                    var url = 'data:image/svg+xml;base64,' + btoa(data);

                                    fabric.Image.fromURL(url, angular.bind(this, function(oImg) {
                                        //oImg.scaleToWidth(200);  // set max width and have height scale relatively
                                        // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
                                        //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
                                        //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
                                        //oImg.center();
                                        oImg.studentWorkId = studentWork.id;  // keep track of this asset id
                                        this.drawingTool.canvas.add(oImg);   // add copied asset image to canvas
                                    }), { crossOrigin: '' });

                                    this.studentDataChanged();
                                }
                                */
                            }
                        }
                    }
                }
            };
        });

        /**
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
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
         * Import work from another component
         */
        this.importWork = function() {
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                var importWorkNodeId = componentContent.importWorkNodeId;
                var importWorkComponentId = componentContent.importWorkComponentId;
                
                if (importWorkNodeId != null && importWorkComponentId != null) {
                    
                    // get the latest component state for this component
                    var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
                    
                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if(componentState == null) {
                        // the student has not done any work for this component
                        
                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);
                        
                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the 
                             * imported component state
                             */
                            var populatedComponentState = DrawService.populateComponentState(importWorkComponentState);
                            
                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
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
            var componentId = this.componentContent.id;
            
            return componentId;
        };
        
        /**
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
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
         * The parent node submit button was clicked
         */
        $scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {
            
            // get the node id of the node
            var nodeId = args.nodeId;
            
            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                
                if (this.isLockAfterSubmit()) {
                    // disable the component if it was authored to lock after submit
                    this.isDisabled = true;
                }
            }
        }));
        
        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        $scope.$on('exitNode', angular.bind(this, function(event, args) {
            
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
        
        // perform setup of this component
        this.setup();
    });
});