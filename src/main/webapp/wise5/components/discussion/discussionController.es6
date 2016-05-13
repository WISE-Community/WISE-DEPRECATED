class DiscussionController {
    constructor($injector,
                $rootScope,
                $scope,
                ConfigService,
                DiscussionService,
                NodeService,
                ProjectService,
                StudentAssetService,
                StudentDataService,
                StudentWebSocketService,
                UtilService,
                $mdMedia) {

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.ConfigService = ConfigService;
        this.DiscussionService = DiscussionService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.UtilService = UtilService;
        this.$mdMedia = $mdMedia;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

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

        // the latest annotations
        this.latestAnnotations = null;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

        this.workgroupId = null;

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            this.mode = this.$scope.mode;

            if (this.$scope.workgroupId != null) {
                this.workgroupId = this.$scope.workgroupId;
            }

            if (this.$scope.nodeId != null) {
                this.nodeId = this.$scope.nodeId;
            }

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            if (false) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the node content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                // get the component state for the show previous work
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                // populate the student work into this component
                this.setStudentWork(componentState);

                // disable the component since we are just showing previous work
                this.isDisabled = true;
            } else {
                // this is a regular component

                if (this.mode === 'student') {
                    if (this.ConfigService.isPreview()) {
                        // we are in preview mode, so get all posts
                        var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                        this.setClassResponses(componentStates);
                    } else {
                        // we are in regular student run mode

                        if (this.isClassmateResponsesGated()) {
                            /*
                             * classmate responses are gated so we will not show them if the student
                             * has not submitted a response
                             */

                            // get the component state from the scope
                            var componentState = this.$scope.componentState;

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

                        // get the latest annotations
                        // TODO: watch for new annotations and update accordingly
                        this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
                    }

                    // check if we need to lock this component
                    this.calculateDisabled();
                } else if (this.mode === 'grading') {

                    /*
                     * get all the posts that this workgroup id is part of. if the student
                     * posted a top level response we will get the top level response and
                     * all the replies. if the student replied to a top level response we
                     * will get the top level response and all the replies.
                     */
                    var componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);

                    this.setClassResponses(componentStates);

                    this.isDisabled = true;
                } else if (this.mode === 'onlyShowWork') {
                    this.isDisabled = true;
                } else if (this.mode === 'showPreviousWork') {
                    this.isPromptVisible = true;
                    this.isSaveButtonVisible = false;
                    this.isSubmitButtonVisible = false;
                    this.isDisabled = true;
                } else if (this.mode === 'authoring') {
                    this.updateAdvancedAuthoringView();

                    $scope.$watch(function() {
                        return this.authoringComponentContent;
                    }.bind(this), function(newValue, oldValue) {
                        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    }.bind(this), true);
                }
            }

            this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            if (this.$scope.$parent.registerComponentController != null) {
                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * The submit button was clicked
         * @param response the response object related to the submit button
         */
        this.$scope.submitbuttonclicked = function(response) {

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
                    this.$scope.discussionController.studentResponse = componentState.replyText;
                    this.$scope.discussionController.componentStateIdReplyingTo = componentStateId;

                    // clear the reply input
                    response.replyText = null;

                    this.$scope.discussionController.isSubmit = true;
                    this.$scope.discussionController.isDirty = true;
                }
            } else {
                // the submit button was clicked for the new post

                /*
                 * set the response from the top textarea into the
                 * studentResponse field that we will read from later
                 * when the student data is saved
                 */
                this.$scope.discussionController.studentResponse = this.$scope.discussionController.newResponse;

                this.$scope.discussionController.isSubmit = true;
            }

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', {nodeId: this.$scope.discussionController.nodeId, componentId: this.$scope.discussionController.componentId});
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function() {
            var componentState = null;

            // check if the student work is dirty and the student clicked the submit button
            if (this.$scope.discussionController.isDirty && this.$scope.discussionController.isSubmit) {
                // create a component state populated with the student data
                componentState = this.$scope.discussionController.createComponentState();

                /*
                 * clear the component values so they aren't accidentally used again
                 * later
                 */
                this.$scope.discussionController.clearComponentValues();

                // set isDirty to false since this student work is about to be saved
                this.$scope.discussionController.isDirty = false;
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {

            // do nothing
        }));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

            let componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId
                && this.componentId === componentState.componentId) {

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

                    // add the component state to our collection of class responses
                    this.addClassResponse(componentState);
                }

                this.submit();

                // send the student post to web sockets so all the classmates receive it in real time
                this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(componentState);
            }

            this.isSubmit = null;
        }));

        this.$scope.studentdatachanged = function() {
            this.$scope.discussionController.studentDataChanged();
        };

        /**
         * We have recived a web socket message
         */
        this.$rootScope.$on('webSocketMessageRecieved', angular.bind(this, function(event, args) {
            if (args != null) {
                var data = args.data;

                var componentState = data.data;

                if (componentState != null) {

                    // check that the web socket message is for this step
                    if (componentState.nodeId === this.nodeId) {

                        // get the sender of the message
                        var componentStateWorkgroupId = componentState.workgroupId;

                        // get the workgroup id of the signed in student
                        var workgroupId = this.ConfigService.getWorkgroupId();

                        /*
                         * check if the signed in student sent the message. if the
                         * signed in student sent the message we can ignore it.
                         */
                        if (workgroupId !== componentStateWorkgroupId) {

                            if (this.retrievedClassmateResponses) {
                                // display the classmate post
                                this.addClassResponse(componentState);
                            }
                        }
                    }
                }
            }
        }));

        var scope = this;
        var themePath = this.ProjectService.getThemePath();

        // TODO: make toolbar items and plugins customizable by authors?
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
            content_css: themePath + "/style/tinymce.css",
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

        this.$scope.$watch(function() { return $mdMedia('gt-sm'); }, function(md) {
            $scope.mdScreen = md;
        });

    }

    /**
     * Get the classmate responses
     */
    getClassmateResponses() {
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var nodeId = this.nodeId;
        var componentId = this.componentId;

        // make the request for the classmate responses
        this.DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then(angular.bind(this, function(result) {

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
    setStudentWork(componentState) {

        if (componentState != null) {
            // populate the text the student previously typed
            var studentData = componentState.studentData;
        }
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        this.isSubmit = true;

        // check if we need to lock the component after the student submits
        if (this.isLockAfterSubmit()) {
            this.isDisabled = true;
        }

        // handle the submit button click
        this.$scope.submitbuttonclicked();
    };

    submit() {
        if (this.isLockAfterSubmit()) {
            // disable the component if it was authored to lock after submit
            this.isDisabled = true;
        }
    };

    /**
     * Called when the student changes their work
     */
    studentDataChanged() {
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
        this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
    };

    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    createComponentState() {

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

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

            if (this.ConfigService.isPreview() && !this.componentStateIdReplyingTo) {
                // create a dummy component state id if we're in preview mode and posting a new response
                componentState.id = this.UtilService.generateKey();
            }

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
    clearComponentValues() {

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
    calculateDisabled() {

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
                var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                // check if any of the component states were submitted
                var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

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
    showSaveButton() {
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
    showSubmitButton() {
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
    isLockAfterSubmit() {
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
    isClassmateResponsesGated() {
        var result = false;

        if (this.componentContent != null) {

            // check the gateClassmateResponses field in the component content
            if (this.componentContent.gateClassmateResponses) {
                result = true;
            }
        }

        return result;
    };

    removeAttachment(attachment) {
        if (this.newAttachments.indexOf(attachment) != -1) {
            this.newAttachments.splice(this.newAttachments.indexOf(attachment), 1);
            this.studentDataChanged();
        }
    };

    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
    attachStudentAsset(studentAsset) {
        if (studentAsset != null) {
            this.StudentAssetService.copyAssetForReference(studentAsset).then( (copiedAsset) => {
                if (copiedAsset != null) {
                    var attachment = {
                        studentAssetId: copiedAsset.id,
                        iconURL: copiedAsset.iconURL
                    };

                    this.newAttachments.push(attachment);
                    this.studentDataChanged();
                }
            });
        }
    };

    /**
     * Get the prompt to show to the student
     */
    getPrompt() {
        var prompt = null;

        if (this.originalComponentContent != null) {
            // this is a show previous work component
            
            if (this.originalComponentContent.showPreviousWorkPrompt) {
                // show the prompt from the previous work component
                prompt = this.componentContent.prompt;
            } else {
                // show the prompt from the original component
                prompt = this.originalComponentContent.prompt;
            }
        } else if (this.componentContent != null) {
            prompt = this.componentContent.prompt;
        }

        return prompt;
    };

    /**
     * Get the number of rows for the textarea
     */
    getNumRows() {
        var numRows = null;

        if (this.componentContent != null) {
            numRows = this.componentContent.numRows;
        }

        return numRows;
    };

    /**
     * Import work from another component
     */
    importWork() {

        // get the component content
        var componentContent = this.componentContent;

        if (componentContent != null) {

            var importWorkNodeId = componentContent.importWorkNodeId;
            var importWorkComponentId = componentContent.importWorkComponentId;

            if (importWorkNodeId != null && importWorkComponentId != null) {

                // get the latest component state for this component
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                /*
                 * we will only import work into this component if the student
                 * has not done any work for this component
                 */
                if(componentState == null) {
                    // the student has not done any work for this component

                    // get the latest component state from the component we are importing from
                    var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                    if (importWorkComponentState != null) {
                        /*
                         * populate a new component state with the work from the
                         * imported component state
                         */
                        var populatedComponentState = this.DiscussionService.populateComponentState(importWorkComponentState);

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
    getComponentId() {
        return this.componentContent.id;
    };

    /**
     * Set the class responses into the controller
     * @param componentStates the class component states
     */
    setClassResponses(componentStates) {

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
                            let userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
                            componentState.userNames = userNames.map(function(obj) { return obj.name; }).join(', ');

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
    processResponses(componentStates) {

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
    addClassResponse(componentState) {

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
                        let userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
                        componentState.userNames = userNames.map(function(obj) { return obj.name; }).join(', ');

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
    getClassResponses() {
        return this.classResponses;
    };

    /**
     * Get the level 1 responses which are posts that are not a
     * reply to another response.
     * @return an array of responses that are not a reply to another
     * response
     */
    getLevel1Responses() {
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
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // update the JSON string in the advanced authoring view textarea
        this.updateAdvancedAuthoringView();

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeController.authoringViewNodeChanged();
    };

    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    advancedAuthoringViewComponentChanged() {

        try {
            /*
             * create a new component by converting the JSON string in the advanced
             * authoring view into a JSON object
             */
            var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

            // replace the component in the project
            this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

            // set the new component into the controller
            this.componentContent = editedComponentContent;

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        } catch(e) {

        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {

        /*
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before the VLE exits.
         */
        this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

            // do nothing
            this.$rootScope.$broadcast('doneExiting');
        }));
    };
}

DiscussionController.$inject = [
    '$injector',
    '$rootScope',
    '$scope',
    'ConfigService',
    'DiscussionService',
    'NodeService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'StudentWebSocketService',
    'UtilService',
    '$mdMedia'
];

export default DiscussionController;
