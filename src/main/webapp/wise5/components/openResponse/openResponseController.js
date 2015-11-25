define(['app'], function(app) {
    app.$controllerProvider.register('OpenResponseController', 
        function(
            $injector,
            $rootScope,
            $scope,
            $state,
            $stateParams,
            ConfigService,
            NodeService,
            OpenResponseService,
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
        
        // holds the text that the student has typed
        this.studentResponse = '';

        // holds student attachments like assets
        this.attachments = [];
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this component is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether rich text editing is enabled
        this.isRichTextEnabled = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        /**
         * Perform setup of the component
         */
        this.setup = function() {

            // get the current node and node id
            var currentNode = StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;

            this.mode = $scope.mode;

            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;

                if (this.mode === 'student') {
                    this.isPromptVisible = true;
                    this.isSaveButtonVisible = this.componentContent.showSaveButton;
                    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                } else if (this.mode === 'grading') {
                    this.isPromptVisible = true;
                    this.isSaveButtonVisible = false;
                    this.isSubmitButtonVisible = false;
                    this.isDisabled = true;
                } else if (this.mode === 'onlyShowWork') {
                    this.isPromptVisible = false;
                    this.isSaveButtonVisible = false;
                    this.isSubmitButtonVisible = false;
                    this.isDisabled = true;
                }
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

                var componentState = null;
                
                if (false) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;

                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                    // get the node content for the other node
                    var showPreviousWorkNodeContent = ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                    // get the component content for the component we are showing previous work for
                    this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                    // get the component state for the show previous work
                    componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                    // populate the student work into this component
                    this.setStudentWork(componentState);

                    // disable the component since we are just showing previous work
                    this.isDisabled = true;

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                } else {
                    // this is a regular component

                    // set whether rich text is enabled
                    this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

                    // set whether studentAttachment is enabled
                    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                    // get the component state from the scope
                    componentState = $scope.componentState;
                    
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
                        } else if (this.componentContent.starterSentence != null) {
                            /*
                             * the student has not done any work and there is a starter sentence
                             * so we will populate the textarea with the starter sentence
                             */
                            this.studentResponse = this.componentContent.starterSentence;
                        }
                    } else {
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                    }
                    
                    // check if we need to lock this component
                    this.calculateDisabled();

                    if ($scope.$parent.registerComponentController != null) {
                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, this.componentContent);
                    }
                }
            }
            
            $('.openResponse').off('dragover').off('drop');
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    var response = studentData.response;
                    
                    if (response != null) {
                        // populate the text the student previously typed
                        this.studentResponse = response;
                    }

                    var attachments = studentData.attachments;

                    if (attachments != null) {
                        this.attachments = attachments;
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
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            // get the text the student typed
            var response = this.getStudentResponse();
            
            // set the response into the component state
            var studentData = {};
            studentData.response = response;
            studentData.attachments = this.attachments;

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

            return componentState;
        };
        
        /**
         * Check if we need to lock the component
         */
        this.calculateDisabled = function() {
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the component after the student has submitted
                    
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
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        this.showPrompt = function() {
            return this.isPromptVisible;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            return this.isSaveButtonVisible;
        };
        
        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        this.showSubmitButton = function() {
            return this.isSubmitButtonVisible;
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

        this.removeAttachment = function(attachment) {
            if (this.attachments.indexOf(attachment) != -1) {
                this.attachments.splice(this.attachments.indexOf(attachment), 1);
                this.studentDataChanged();
            }
        };

        this.attachNotebookItemToComponent = angular.bind(this, function(notebookItem) {
            if (notebookItem.studentAsset != null) {
                // we're importing a StudentAssetNotebookItem
                var studentAsset = notebookItem.studentAsset;
                StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            notebookItemId: notebookItem.id,
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        this.attachments.push(attachment);
                        this.studentDataChanged();
                    }
                }));
            } else if (notebookItem.studentWork != null) {
                // we're importing a StudentWorkNotebookItem
                var studentWork = notebookItem.studentWork;

                var componentType = studentWork.componentType;

                if (componentType != null) {
                    var childService = $injector.get(componentType + 'Service');

                    if (childService != null) {
                        var studentWorkHTML = childService.getStudentWorkAsHTML(studentWork);

                        if (studentWorkHTML != null) {
                            this.studentResponse += studentWorkHTML;
                            this.studentDataChanged();
                        }
                    }
                }
            }
        });
        
        this.startCallback_NO_LONGER_USED = function(event, ui, title) {
        };
        
        this.dropCallback_NO_LONGER_USED = angular.bind(this, function(event, ui, title, $index) {
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
                            var copiedAssetImg = '<img notebookItemId="' + notebookItem.id + '" studentAssetId="' + copiedAsset.id + '" id="studentAsset_' + copiedAsset.id + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                            this.studentResponse += copiedAssetImg;
                            this.studentDataChanged();
                        }
                    }));
                } else if (notebookItem.studentWork != null) {
                    // we're importing a StudentWorkNotebookItem
                    var studentWork = notebookItem.studentWork;

                    var componentType = studentWork.componentType;

                    if (componentType != null) {
                        var childService = $injector.get(componentType + 'Service');

                        if (childService != null) {
                            var studentWorkHTML = childService.getStudentWorkAsHTML(studentWork);

                            if (studentWorkHTML != null) {
                                this.studentResponse += studentWorkHTML;
                                this.studentDataChanged();
                            }
                        }
                    }
                }
            }
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
         * Get the number of rows for the textarea
         */
        this.getNumRows = function() {
            var numRows = null;
            
            if (this.componentContent != null) {
                numRows = this.componentContent.numRows;
            }
            
            return numRows;
        };
        
        /**
         * Get the number of columns for the textarea
         */
        this.getNumColumns = function() {
            var numColumns = null;
            
            if (this.componentContent != null) {
                numColumns = this.componentContent.numColumns;
            }
            
            return numColumns;
        };
        
        /**
         * Get the text the student typed
         */
        this.getResponse = function() {
            var response = null;
            
            if (this.studentResponse != null) {
                response = this.studentResponse;
            }
            
            return response;
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
                            var populatedComponentState = OpenResponseService.populateComponentState(importWorkComponentState);
                            
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
         * Returns true iff there is student work that hasn't been saved yet
         */
        $scope.isDirty = function() {
            return $scope.openResponseController.isDirty;
        };

        /**
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
            var componentState = null;
            
            if ($scope.openResponseController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.openResponseController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.openResponseController.isDirty = false;
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
                
            }));
        };

        //var scope = this;
        var themePath = "/wise/" + ProjectService.getThemePath();

        // TODO: make toolbar items and plugins customizable by authors
        // Rich text editor options
        this.tinymceOptions = {
            //onChange: function(e) {
                //scope.studentDataChanged();
            //},
            menubar: false,
            plugins: 'link image media autoresize', //imagetools
            toolbar: 'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
            autoresize_bottom_margin: "0",
            autoresize_min_height: "100",
            image_advtab: true,
            content_css: themePath + "/style/css/tinymce.css",
            setup: function (ed) {
                ed.on("focus", function (e) {
                    $(e.target.editorContainer).addClass('input--focused').parent().addClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
                });

                ed.on("blur", function (e) {
                    $(e.target.editorContainer).removeClass('input--focused').parent().removeClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
                });
            }
        };

        // perform setup of this component
        this.setup();

    });
});