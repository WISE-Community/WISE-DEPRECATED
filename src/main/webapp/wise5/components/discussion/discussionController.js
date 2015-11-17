define(['app', 'angular'], function(app, angular) {
    app.$controllerProvider.register('DiscussionController',
        function(
            $injector,
            $rootScope,
            $scope,
            $state,
            $stateParams,
            ConfigService,
            DiscussionService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService,
            $mdMedia) {

            // the node id of the current node
            this.nodeId = null;

            // the component id
            this.componentId = null;

            // field that will hold the component content
            this.componentContent = null;

            // holds the text that the student has typed
            this.studentResponse = '';

            // holds the text for a new response (not a reply)
            this.newResponse = '';

            // holds student attachments like assets
            this.newAttachments = [];

            // whether the step should be disabled
            this.isDisabled = false;

            // whether the student work is dirty and needs saving
            this.isDirty = false;

            // whether this part is showing previous work
            this.isShowPreviousWork = false;

            // whether the student work is for a submit
            this.isSubmit = false;

            // will hold the class responses
            this.classResponses = [];

            // will hold the top level responses
            this.topLevelResponses = [];

            // the text that is being submitted
            this.submitText = null;

            // map from component state id to response
            this.responsesMap = {};

            // whether rich text is enabled
            this.isRichTextEnabled = false;

            // whether students can attach files to their work
            this.isStudentAttachmentEnabled = false;

            // whether we have retrieved the classmate responses
            this.retrievedClassmateResponses = false;

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

                if (this.componentContent != null) {

                    // get the component id
                    this.componentId = this.componentContent.id;


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
                    } else {
                        // this is a regular component

                        // populate the student work into this component
                        //this.setStudentWork(componentState);

                        if (ConfigService.isPreview()) {
                            // we are in preview mode
                        } else {
                            // we are in regular student run mode

                            if (this.isClassmateResponsesGated()) {
                                /*
                                 * classmate responses are gated so we will not show them if the student
                                 * has not submitted a response
                                 */

                                // get the component state from the scope
                                var componentState = $scope.componentState;

                                if (componentState != null) {
                                    /*
                                     * the student has already submitted a response so we will
                                     * display the classmate responses
                                     */
                                    this.getClassmateResponses();
                                }
                            } else {
                                // classmate responses are not gated so we will show them
                                this.getClassmateResponses();
                            }
                        }

                        // check if we need to lock this component
                        this.calculateDisabled();
                    }

                    this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

                    // set whether studentAttachment is enabled
                    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                }
            };

            /**
             * Get the classmate responses
             */
            this.getClassmateResponses = function() {
                var runId = ConfigService.getRunId();
                var periodId = ConfigService.getPeriodId();
                var nodeId = this.nodeId;
                var componentId = this.componentId;

                // make the request for the classmate responses
                DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then(angular.bind(this, function(result) {

                    if (result != null) {
                        var componentStates = result.studentWorkList;

                        // set the classmate responses
                        this.setClassResponses(componentStates);
                    }
                }));
            };

            /**
             * Populate the student work into the component
             * @param componentState the component state to populate into the component
             */
            this.setStudentWork = function(componentState) {

                if (componentState != null) {
                    // populate the text the student previously typed
                    var studentData = componentState.studentData;
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

                // handle the submit button click
                $scope.submitbuttonclicked();
            };

            $scope.studentdatachanged = function() {
                $scope.discussionController.studentDataChanged();
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

                    // set the response into the component state
                    studentData.response = this.studentResponse;

                    studentData.attachments = this.newAttachments;

                    if (this.componentStateIdReplyingTo != null) {
                        // if this step is replying, set the component state id replying to
                        studentData.componentStateIdReplyingTo = this.componentStateIdReplyingTo;
                    }

                    componentState.studentData = studentData;

                    if (this.isSubmit) {
                        // the student submitted this work
                        componentState.studentData.isSubmit = this.isSubmit;

                        /*
                         * reset the isSubmit value so that the next component state
                         * doesn't maintain the same value
                         */
                        this.isSubmit = false;
                    }
                }

                return componentState;
            };

            /**
             * Clear the component values so they aren't accidentally used again
             */
            this.clearComponentValues = function() {

                // clear the student response
                this.studentResponse = '';

                // clear the new response input
                this.newResponse = '';

                // clear new attachments input
                this.newAttachments = [];

                // clear the component state id replying to
                this.componentStateIdReplyingTo = null;
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
             * @return whether to lock the component after the student submits
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
             * Check whether we need to gate the classmate responses
             * @return whether to gate the classmate responses
             */
            this.isClassmateResponsesGated = function() {
                var result = false;

                if (this.componentContent != null) {

                    // check the gateClassmateResponses field in the component content
                    if (this.componentContent.gateClassmateResponses) {
                        result = true;
                    }
                }

                return result;
            };

            this.removeAttachment = function(attachment) {
                if (this.newAttachments.indexOf(attachment) != -1) {
                    this.newAttachments.splice(this.newAttachments.indexOf(attachment), 1);
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

                            this.newAttachments.push(attachment);
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

            this.dropCallback_NOLONGER_USED = angular.bind(this, function(event, ui, title, $index) {
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
                        StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function (copiedAsset) {
                            if (copiedAsset != null) {
                                var copiedAssetImg = '<img notebookItemId="' + notebookItem.id + '" studentAssetId="' + copiedAsset.id + '" id="studentAsset_' + copiedAsset.id + '" class="studentAssetReference" src="' + copiedAsset.iconURL + '"></img>';
                                this.newResponse += copiedAssetImg;
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
                                    this.newResponse += studentWorkHTML;
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
                                var populatedComponentState = DiscussionService.populateComponentState(importWorkComponentState);

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
             * Set the class responses into the controller
             * @param componentStates the class component states
             */
            this.setClassResponses = function(componentStates) {

                this.classResponses = [];

                if (componentStates != null) {

                    // loop through all the component states
                    for (var c = 0; c < componentStates.length; c++) {
                        var componentState = componentStates[c];

                        if (componentState != null) {

                            // get the component state id
                            var id = componentState.id;

                            // get the workgroup id
                            var workgroupId = componentState.workgroupId;

                            // get the student data
                            var studentData = componentState.studentData;

                            if (studentData != null) {

                                if (componentState.studentData.isSubmit) {

                                    // add the user names to the component state so we can display next to the response
                                    componentState.userNames = ConfigService.getUserNamesByWorkgroupId(workgroupId, true).join(', ');

                                    // add a replies array to the component state that we will fill with component state replies later
                                    componentState.replies = [];

                                    // add the component state to our array
                                    this.classResponses.push(componentState);
                                }
                            }
                        }
                    }
                }

                // process the class responses
                this.processResponses(this.classResponses);

                this.retrievedClassmateResponses = true;
            };

            /**
             * Process the class responses. This will put responses into the
             * replies arrays.
             * @param classResponses an array of component states
             */
            this.processResponses = function(componentStates) {

                if (componentStates) {
                    var componentState;

                    // loop through all the component states
                    for (var i = 0; i < componentStates.length; i++) {
                        componentState = componentStates[i];

                        if (componentState) {
                            var componentStateId = componentState.id;

                            // set the component state into the map
                            this.responsesMap[componentStateId] = componentState;
                        }
                    }

                    // loop through all the component states
                    for (var c = 0; c < componentStates.length; c++) {
                        componentState = componentStates[c];

                        if (componentState && componentState.studentData) {

                            // get the student data
                            var studentData = componentState.studentData;

                            // get the component state id replying to if any
                            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

                            if (componentStateIdReplyingTo) {

                                if (this.responsesMap[componentStateIdReplyingTo] &&
                                    this.responsesMap[componentStateIdReplyingTo].replies) {
                                    /*
                                     * add this component state to the replies array of the
                                     * component state that was replied to
                                     */
                                    this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
                                }
                            }
                        }
                    }

                    this.topLevelResponses = this.getLevel1Responses();
                }
            };

            /**
             * Add a class response to our model
             * @param componentState the component state to add to our model
             */
            this.addClassResponse = function(componentState) {

                if (componentState != null) {

                    // get the student data
                    var studentData = componentState.studentData;

                    if (studentData != null) {

                        // check if the student data was a submit
                        var isSubmit = componentState.studentData.isSubmit;

                        if (isSubmit) {
                            // this component state is a submit so we will add it

                            if (componentState != null) {

                                // get the workgroup id
                                var workgroupId = componentState.workgroupId;

                                // add the user names to the component state so we can display next to the response
                                componentState.userNames = ConfigService.getUserNamesByWorkgroupId(workgroupId, true).join(', ');

                                // add a replies array to the component state that we will fill with component state replies later
                                componentState.replies = [];

                                // add the component state to our array of class responses
                                this.classResponses.push(componentState);

                                // get the component state id
                                var componentStateId = componentState.id;

                                // add the response to our map
                                this.responsesMap[componentStateId] = componentState;

                                // get the component state id replying to if any
                                var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

                                if (componentStateIdReplyingTo != null) {

                                    // check if we have the component state that was replied to
                                    if (this.responsesMap[componentStateIdReplyingTo] != null &&
                                        this.responsesMap[componentStateIdReplyingTo].replies != null) {
                                        /*
                                         * add this response to the replies array of the response
                                         * that was replied to
                                         */
                                        this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
                                    }
                                }

                                this.topLevelResponses = this.getLevel1Responses();
                            }
                        }
                    }
                }
            };

            /**
             * Get the class responses
             */
            this.getClassResponses = function() {
                return this.classResponses;
            };

            /**
             * Get the level 1 responses which are posts that are not a
             * reply to another response.
             * @return an array of responses that are not a reply to another
             * response
             */
            this.getLevel1Responses = function() {
                var level1Responses = [];
                var classResponses = this.classResponses;

                if (classResponses != null) {

                    // loop through all the class responses
                    for (var r = 0; r < classResponses.length; r++) {
                        var tempClassResponse = classResponses[r];

                        if (tempClassResponse != null && tempClassResponse.studentData) {

                            // get the student data
                            var studentData = tempClassResponse.studentData;

                            // get the component state id replying to if any
                            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

                            if (componentStateIdReplyingTo == null) {
                                /*
                                 * this response was not a reply to another post so it is a
                                 * level 1 response
                                 */
                                level1Responses.push(tempClassResponse);
                            }
                        }
                    }
                }

                return level1Responses;
            };

            /**
             * The reply button was clicked so we will show or hide the textarea
             * used to reply to the specific component state
             * @param componentState the component state that the student wants to reply to
             */
            $scope.replybuttonclicked = function(componentState) {

                /*
                 * get the value for whether the textarea is currently shown
                 * or not
                 */
                var previousValue = componentState.showReplyTextarea;

                // change the value to the opposite of what it was previously
                componentState.showReplyTextarea = !previousValue;
            };

            /**
             * The submit button was clicked
             * @param response the response object related to the submit button
             */
            $scope.submitbuttonclicked = function(response) {

                if (response) {
                    // this submit button was clicked for a reply

                    if(response.replyText){
                        var componentState = response;

                        // get the component state id
                        var componentStateId = componentState.id;

                        /*
                         * remember the values in the controller so we can read
                         * from them later when the student data is saved
                         */
                        $scope.discussionController.studentResponse = componentState.replyText;
                        $scope.discussionController.componentStateIdReplyingTo = componentStateId;

                        // clear the reply input
                        response.replyText = null;

                        $scope.discussionController.isSubmit = true;
                        $scope.discussionController.isDirty = true;
                    }
                } else {
                    // the submit button was clicked for the new post

                    /*
                     * set the response from the top textarea into the
                     * studentResponse field that we will read from later
                     * when the student data is saved
                     */
                    $scope.discussionController.studentResponse = $scope.discussionController.newResponse;

                    $scope.discussionController.isSubmit = true;
                }

                // tell the parent node that this component wants to submit
                $scope.$emit('componentSubmitTriggered', {nodeId: $scope.discussionController.nodeId, componentId: $scope.discussionController.componentId});
            };

            /**
             * Get the component state from this component. The parent node will
             * call this function to obtain the component state when it needs to
             * save student data.
             * @return a component state containing the student data
             */
            $scope.getComponentState = function() {
                var componentState = null;

                // check if the student work is dirty and the student clicked the submit button
                if ($scope.discussionController.isDirty && $scope.discussionController.isSubmit) {
                    // create a component state populated with the student data
                    componentState = $scope.discussionController.createComponentState();

                    /*
                     * clear the component values so they aren't accidentally used again
                     * later
                     */
                    $scope.discussionController.clearComponentValues();

                    // set isDirty to false since this student work is about to be saved
                    $scope.discussionController.isDirty = false;
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

                // do nothing
            }));

            /**
             * Listen for the 'studentWorkSavedToServer' event which is fired when
             * we receive the response from saving a component state to the server
             */
            $scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

                var componentState = args.studentWork;

                if (componentState != null) {

                    // check if the classmate responses are gated
                    if (this.isClassmateResponsesGated() && !this.retrievedClassmateResponses) {
                        /*
                         * the classmate responses are gated and we haven't retrieved
                         * them yet so we will obtain them now and show them since the student
                         * has just submitted a response. getting the classmate responses will
                         * also get the post the student just saved to the server.
                         */
                        this.getClassmateResponses();
                    } else {
                        /*
                         * the classmate responses are not gated or have already been retrieved
                         * which means they are already being displayed. we just need to add the
                         * new response in this case.
                         */
                        var nodeId = componentState.nodeId;
                        var componentId = componentState.componentId;

                        // check that the component state is for this component
                        if (this.nodeId === nodeId && this.componentId === componentId) {

                            // add the component state to our collection of class responses
                            this.addClassResponse(componentState);
                        }
                    }
                }

                this.isSubmit = null;
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

                    // do nothing
                    $rootScope.$broadcast('doneExiting');
                }));
            };

            var scope = this;
            var themePath = "/wise/wise5/vle/themes/" + ProjectService.getTheme();

            // TODO: make toolbar items and plugins customizable by authors
            // Rich text editor options
            this.tinymceOptions = {
                //onChange: function(e) {
                //scope.studentDataChanged();
                //},
                menubar: false,
                plugins: 'link autoresize',
                toolbar: 'superscript subscript',
                autoresize_bottom_margin: "0",
                autoresize_min_height: "100",
                image_advtab: true,
                content_css: themePath + "/style/css/tinymce.css",
                statusbar: false,
                forced_root_block: false,
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

            $scope.$watch(function() { return $mdMedia('gt-md'); }, function(lg) {
                $scope.lgScreen = lg;
            });

            // perform setup of this component
            this.setup();
        });

    app.$compileProvider.directive('classResponse', function($compile) {
        return {
            restrict: 'E',
            scope: {
                response: '=',
                //replybuttonclicked: '&',
                submitbuttonclicked: '&',
                studentdatachanged: '&'
            },
            templateUrl: 'wise5/components/discussion/classResponse.html',
            controller: function($scope, $state, $stateParams) {

                // handle the submit button click
                $scope.submitButtonClicked = function(response) {
                    $scope.submitbuttonclicked({r: response});
                };

                $scope.expanded = false;

                $scope.toggleExpanded = function () {
                    $scope.expanded = !$scope.expanded;
                }
            }
        };
    });

});