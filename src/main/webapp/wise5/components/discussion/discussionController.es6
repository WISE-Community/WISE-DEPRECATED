class DiscussionController {
    constructor($filter,
                $injector,
                $mdDialog,
                $q,
                $rootScope,
                $scope,
                AnnotationService,
                ConfigService,
                DiscussionService,
                NodeService,
                NotificationService,
                ProjectService,
                StudentAssetService,
                StudentDataService,
                StudentWebSocketService,
                UtilService,
                $mdMedia) {

        this.$filter = $filter;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.DiscussionService = DiscussionService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.StudentWebSocketService = StudentWebSocketService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;
        this.$mdMedia = $mdMedia;

        this.$translate = this.$filter('translate');

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

        // flag for whether to show the advanced authoring
        this.showAdvancedAuthoring = false;

        // whether the JSON authoring is displayed
        this.showJSONAuthoring = false;

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

        // the options for when to update this component from a connected component
        this.connectedComponentUpdateOnOptions = [
            {
                value: 'change',
                text: 'Change'
            },
            {
                value: 'submit',
                text: 'Submit'
            }
        ];

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
                    this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                }

                // check if we need to lock this component
                this.calculateDisabled();
            } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {

                /*
                 * get all the posts that this workgroup id is part of. if the student
                 * posted a top level response we will get the top level response and
                 * all the replies. if the student replied to a top level response we
                 * will get the top level response and all the replies.
                 */
                var componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);

                // get the innappropriate flag annotations for the component states
                var annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);

                // show the posts
                this.setClassResponses(componentStates, annotations);

                this.isDisabled = true;

                if (this.mode === 'grading') {
                    // get the latest annotations
                    this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                }
            } else if (this.mode === 'onlyShowWork') {
                this.isDisabled = true;
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('INSERT_ASSET');

                /*
                 * create the custom button for inserting WISE assets into
                 * summernote
                 */
                var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

                /*
                 * the options that specifies the tools to display in the
                 * summernote prompt
                 */
                this.summernoteRubricOptions = {
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['link', 'video']],
                        ['view', ['fullscreen', 'codeview', 'help']],
                        ['customButton', ['insertAssetButton']]
                    ],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertAssetButton: InsertAssetButton
                    }
                };

                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * The submit button was clicked
         * @param response the response object related to the submit button
         */
        this.$scope.submitbuttonclicked = function(response) {

            if (response) {
                // this submit button was clicked for a reply

                if (response.replyText){
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

            if (this.mode === 'authoring') {
                this.createComponentState('submit');
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
            var deferred = this.$q.defer();

            // check if the student work is dirty and the student clicked the submit button
            if (this.$scope.discussionController.isDirty && this.$scope.discussionController.isSubmit) {

                var action = 'submit';

                // create a component state populated with the student data
                this.$scope.discussionController.createComponentState(action).then((componentState) => {
                    /*
                     * clear the component values so they aren't accidentally used again
                     * later
                     */
                    this.$scope.discussionController.clearComponentValues();

                    // set isDirty to false since this student work is about to be saved
                    this.$scope.discussionController.isDirty = false;

                    deferred.resolve(componentState);
                });
            } else {
                /*
                 * the student does not have any unsaved changes in this component
                 * so we don't need to save a component state for this component.
                 * we will immediately resolve the promise here.
                 */
                deferred.resolve();
            }

            return deferred.promise;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', (event, args) => {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        });

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$scope.$on('annotationSavedToServer', (event, args) => {

            if (args != null ) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (this.nodeId === annotationNodeId &&
                        this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', (event, args) => {

            // do nothing
        });

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', (event, args) => {

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
                let messageType = "studentData";
                this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, componentState);

                // next, send notifications to students who have posted a response in the same thread as this post
                let studentData = componentState.studentData;
                if (studentData != null && this.responsesMap != null) {
                    let componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
                    if (componentStateIdReplyingTo != null) {
                        // populate fields of the notification
                        let fromWorkgroupId = componentState.workgroupId;
                        let notificationType = "DiscussionReply";
                        let nodeId = componentState.nodeId;
                        let componentId = componentState.componentId;
                        // add the user names to the component state so we can display next to the response
                        let userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(fromWorkgroupId);
                        let userNames = userNamesArray.map( (obj) => {
                            return obj.name;
                        }).join(', ');
                        let notificationMessage = this.$translate('discussion.repliedToADiscussionYouWereIn', { userNames: userNames });

                        let workgroupsNotifiedSoFar = [];  // keep track of workgroups we've already notified, in case a workgroup posts twice on a thread we only want to notify once.
                        // check if we have the component state that was replied to
                        if (this.responsesMap[componentStateIdReplyingTo] != null) {
                            let originalPostComponentState = this.responsesMap[componentStateIdReplyingTo];
                            let toWorkgroupId = originalPostComponentState.workgroupId; // notify the workgroup who posted this reply
                            if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId) {
                                let notification = this.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
                                this.NotificationService.saveNotificationToServer(notification).then((savedNotification) => {
                                    let messageType = "notification";
                                    this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                                });
                                workgroupsNotifiedSoFar.push(toWorkgroupId);  // make sure we don't notify this workgroup again.
                            }

                            // also notify repliers to this thread, if any.
                            if (this.responsesMap[componentStateIdReplyingTo].replies != null) {
                                let replies = this.responsesMap[componentStateIdReplyingTo].replies;

                                for (let r = 0; r < replies.length; r++) {
                                    let reply = replies[r];
                                    let toWorkgroupId = reply.workgroupId; // notify the workgroup who posted this reply
                                    if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId && workgroupsNotifiedSoFar.indexOf(toWorkgroupId) == -1) {
                                        let notification = this.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
                                        this.NotificationService.saveNotificationToServer(notification).then((savedNotification) => {
                                            let messageType = "notification";
                                            this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                                        });
                                        workgroupsNotifiedSoFar.push(toWorkgroupId);  // make sure we don't notify this workgroup again.
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.isSubmit = null;
        });

        this.$scope.studentdatachanged = function() {
            this.$scope.discussionController.studentDataChanged();
        };

        /**
         * We have recived a web socket message
         */
        this.$rootScope.$on('webSocketMessageRecieved', (event, args) => {
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
        });

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

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', (event, args) => {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'prompt') {
                                // the target is the summernote prompt element
                                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
                            } else if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
                            }

                            if (summernoteId != '') {
                                if (this.UtilService.isImage(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // add the image html
                                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                } else if (this.UtilService.isVideo(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // insert the video element
                                    var videoElement = document.createElement('video');
                                    videoElement.controls = 'true';
                                    videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                    $('#' + summernoteId).summernote('insertNode', videoElement);
                                }
                            }
                        }
                    }
                }
            }

            // close the popup
            this.$mdDialog.hide();
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
        this.DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then((result) => {

            if (result != null) {
                var componentStates = result.studentWorkList;

                /*
                 * get the annotations in case there are any that have
                 * inappropriate flags
                 */
                var annotations = result.annotations;

                // set the classmate responses
                this.setClassResponses(componentStates, annotations);
            }
        });
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

        // get this part id
        var componentId = this.getComponentId();

        /*
         * the student work in this component has changed so we will tell
         * the parent node that the student data will need to be saved.
         * this will also notify connected parts that this component's student
         * data has changed.
         */
        var action = 'change';

        // create a component state populated with the student data
        this.createComponentState(action).then((componentState) => {
            this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: componentId, componentState: componentState});
        });
    };

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    createComponentState(action) {

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

            if ((this.ConfigService.isPreview() && !this.componentStateIdReplyingTo) || this.mode === 'authoring') {
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

                if (this.mode === 'authoring') {
                    if (this.StudentDataService.studentData == null) {
                        /*
                         * initialize the student data since this usually doesn't
                         * occur in the authoring mode
                         */
                        this.StudentDataService.studentData = {};
                        this.StudentDataService.studentData.componentStates = [];
                    }

                    /*
                     * set the node id and component id into the component state.
                     * this is usually performed in the nodeController but since
                     * we are in the authoring mode, the nodeController never gets
                     * called
                     */
                    componentState.nodeId = this.nodeId;
                    componentState.componentId = this.componentId;

                    // add the component state to the StudentDataService studentData
                    this.StudentDataService.studentData.componentStates.push(componentState);

                    // get the component states for this component
                    var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                    // set the component states into the component
                    this.setClassResponses(componentStates);

                    /*
                     * clear the input where the user has entered the text they
                     * are posting
                     */
                    this.clearComponentValues();
                    this.isDirty = false;
                }
            }
        }

        var deferred = this.$q.defer();

        /*
         * perform any additional processing that is required before returning
         * the component state
         */
        this.createComponentStateAdditionalProcessing(deferred, componentState, action);

        return deferred.promise;
    };

    /**
     * Perform any additional processing that is required before returning the
     * component state
     * Note: this function must call deferred.resolve() otherwise student work
     * will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */
    createComponentStateAdditionalProcessing(deferred, componentState, action) {
        /*
         * we don't need to perform any additional processing so we can resolve
         * the promise immediately
         */
        deferred.resolve(componentState);
    }

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
     * @param annotations the inappropriate flag annotations
     */
    setClassResponses(componentStates, annotations) {

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

                            // get the latest inappropriate flag for this compnent state
                            var latestInappropriateFlagAnnotation = this.getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, componentState.id);

                            // add the user names to the component state so we can display next to the response
                            let userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
                            componentState.userNames = userNames.map(function(obj) { return obj.name; }).join(', ');

                            // add a replies array to the component state that we will fill with component state replies later
                            componentState.replies = [];

                            if (this.mode == 'grading' || this.mode == 'gradingRevision') {

                                if (latestInappropriateFlagAnnotation != null) {
                                    /*
                                     * Set the inappropriate flag annotation into
                                     * the component state. This is used for the
                                     * grading tool to determine whether to show
                                     * the 'Delete' button or the 'Undo Delete'
                                     * button.
                                     */
                                    componentState.latestInappropriateFlagAnnotation = latestInappropriateFlagAnnotation;
                                }

                                // add the component state to our array
                                this.classResponses.push(componentState);
                            } else if (this.mode == 'student') {

                                if (latestInappropriateFlagAnnotation != null &&
                                    latestInappropriateFlagAnnotation.data != null &&
                                    latestInappropriateFlagAnnotation.data.action == 'Delete') {

                                    // do not show this post because the teacher has deleted it
                                } else {
                                    // add the component state to our array
                                    this.classResponses.push(componentState);
                                }
                            }
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
     * Get the latest inappropriate flag annotation for a student work id
     * @param annotations an array of annotations
     * @param studentWorkId a student work id
     * @return the latest inappropriate flag annotation for the given student
     * work id
     */
    getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, studentWorkId) {

        if (annotations != null) {

            // loop through all the annotations from newest to oldest
            for (var a = annotations.length - 1; a >= 0; a--) {
                var annotation = annotations[a];

                if (annotation != null) {
                    if (studentWorkId == annotation.studentWorkId && annotation.type == 'inappropriateFlag') {
                        /*
                         * we have found an inappropriate flag annotation for
                         * the student work id we are looking for
                         */
                        return annotation;
                    }
                }
            }
        }

        return null;
    }

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

                if (componentState.studentData.isSubmit) {
                    // this component state is a submit, so we will add it

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
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
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
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        } catch(e) {
            this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
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
        this.exitListener = this.$scope.$on('exit', (event, args) => {
            // do nothing
            this.$rootScope.$broadcast('doneExiting');
        });
    };

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */
    getComponentsByNodeId(nodeId) {
        var components = this.ProjectService.getComponentsByNodeId(nodeId);

        return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */
    isApplicationNode(nodeId) {
        var result = this.ProjectService.isApplicationNode(nodeId);

        return result;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */
    getNodePositionAndTitleByNodeId(nodeId) {
        var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

        return nodePositionAndTitle;
    }

    /**
     * The show previous work checkbox was clicked
     */
    authoringShowPreviousWorkClicked() {

        if (!this.authoringComponentContent.showPreviousWork) {
            /*
             * show previous work has been turned off so we will clear the
             * show previous work node id, show previous work component id, and
             * show previous work prompt values
             */
            this.authoringComponentContent.showPreviousWorkNodeId = null;
            this.authoringComponentContent.showPreviousWorkComponentId = null;
            this.authoringComponentContent.showPreviousWorkPrompt = null;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }

    /**
     * The show previous work node id has changed
     */
    authoringShowPreviousWorkNodeIdChanged() {

        if (this.authoringComponentContent.showPreviousWorkNodeId == null ||
            this.authoringComponentContent.showPreviousWorkNodeId == '') {

            /*
             * the show previous work node id is null so we will also set the
             * show previous component id to null
             */
            this.authoringComponentContent.showPreviousWorkComponentId = '';
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * The show previous work component id has changed
     */
    authoringShowPreviousWorkComponentIdChanged() {

        // get the show previous work node id
        var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;

        // get the show previous work prompt boolean value
        var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;

        // get the old show previous work component id
        var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

        // get the new show previous work component id
        var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;

        // get the new show previous work component
        var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

        if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
            // the new show previous work component is empty

            // save the component
            this.authoringViewComponentChanged();
        } else if (newShowPreviousWorkComponent != null) {

            // get the current component type
            var currentComponentType = this.componentContent.type;

            // get the new component type
            var newComponentType = newShowPreviousWorkComponent.type;

            // check if the component types are different
            if (newComponentType != currentComponentType) {
                /*
                 * the component types are different so we will need to change
                 * the whole component
                 */

                // make sure the author really wants to change the component type
                var answer = confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'));

                if (answer) {
                    // the author wants to change the component type

                    /*
                     * get the component service so we can make a new instance
                     * of the component
                     */
                    var componentService = this.$injector.get(newComponentType + 'Service');

                    if (componentService != null) {

                        // create a new component
                        var newComponent = componentService.createComponent();

                        // set move over the values we need to keep
                        newComponent.id = this.authoringComponentContent.id;
                        newComponent.showPreviousWork = true;
                        newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
                        newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
                        newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

                        /*
                         * update the authoring component content JSON string to
                         * change the component
                         */
                        this.authoringComponentContentJSONString = JSON.stringify(newComponent);

                        // update the component in the project and save the project
                        this.advancedAuthoringViewComponentChanged();
                    }
                } else {
                    /*
                     * the author does not want to change the component type so
                     * we will rollback the showPreviousWorkComponentId value
                     */
                    this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
                }
            } else {
                /*
                 * the component types are the same so we do not need to change
                 * the component type and can just save
                 */
                this.authoringViewComponentChanged();
            }
        }
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */
    componentHasWork(component) {
        var result = true;

        if (component != null) {
            result = this.ProjectService.componentHasWork(component);
        }

        return result;
    }

    /**
     * The author has changed the rubric
     */
    summernoteRubricHTMLChanged() {

        // get the summernote rubric html
        var html = this.summernoteRubricHTML;

        /*
         * remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         */
        html = this.ConfigService.removeAbsoluteAssetPaths(html);

        /*
         * replace <a> and <button> elements with <wiselink> elements when
         * applicable
         */
        html = this.UtilService.insertWISELinks(html);

        // update the component rubric
        this.authoringComponentContent.rubric = html;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * Add a connected component
     */
    addConnectedComponent() {

        /*
         * create the new connected component object that will contain a
         * node id and component id
         */
        var newConnectedComponent = {};
        newConnectedComponent.nodeId = this.nodeId;
        newConnectedComponent.componentId = null;
        newConnectedComponent.updateOn = 'change';

        // initialize the array of connected components if it does not exist yet
        if (this.authoringComponentContent.connectedComponents == null) {
            this.authoringComponentContent.connectedComponents = [];
        }

        // add the connected component
        this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */
    deleteConnectedComponent(index) {

        if (this.authoringComponentContent.connectedComponents != null) {
            this.authoringComponentContent.connectedComponents.splice(index, 1);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * The teacher has clicked the delete button to delete a post. We won't
     * actually delete the student work, we'll just create an inappropriate
     * flag annotation which prevents the students in the class from seeing
     * the post.
     * @param componentState the student component state the teacher wants to
     * delete.
     */
    deletebuttonclicked(componentState) {

        if (componentState != null) {

            var toWorkgroupId = componentState.workgroupId;

            var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);

            var periodId = null;

            if (userInfo != null) {
                periodId = userInfo.periodId;
            }

            var teacherUserInfo = this.ConfigService.getMyUserInfo();

            var fromWorkgroupId = null;

            if (teacherUserInfo != null) {
                fromWorkgroupId = teacherUserInfo.workgroupId;
            }

            var runId = this.ConfigService.getRunId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var studentWorkId = componentState.id;
            var data = {};
            data.action = "Delete";

            // create the inappropriate flag 'Delete' annotation
            var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);

            // save the annotation to the server
            this.AnnotationService.saveAnnotation(annotation).then(() => {

                // get the component states made by the student
                var componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);

                // get the annotations for the component states
                var annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);

                // refresh the teacher view of the posts
                this.setClassResponses(componentStates, annotations);
            });
        }
    }

    /**
     * The teacher has clicked the 'Undo Delete' button to undo a previous
     * deletion of a post. This function will create an inappropriate flag
     * annotation with the action set to 'Undo Delete'. This will make the
     * post visible to the students.
     * @param componentState the student component state the teacher wants to
     * show again.
     */
    undodeletebuttonclicked(componentState) {

        if (componentState != null) {

            var toWorkgroupId = componentState.workgroupId;

            var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);

            var periodId = null;

            if (userInfo != null) {
                periodId = userInfo.periodId;
            }

            var teacherUserInfo = this.ConfigService.getMyUserInfo();

            var fromWorkgroupId = null;

            if (teacherUserInfo != null) {
                fromWorkgroupId = teacherUserInfo.workgroupId;
            }

            var runId = this.ConfigService.getRunId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var studentWorkId = componentState.id;
            var data = {};
            data.action = "Undo Delete";

            // create the inappropriate flag annotation
            var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);

            // save the annotation to the server
            this.AnnotationService.saveAnnotation(annotation).then(() => {

                // get the component states made by the student
                var componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);

                // get the annotations for the component states
                var annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);

                // refresh the teacher view of the posts
                this.setClassResponses(componentStates, annotations);
            });
        }
    }

    /**
     * Get the inappropriate flag annotations for these component states
     * @param componentStates an array of component states
     * @return an array of inappropriate flag annotations that are associated
     * with the component states
     */
    getInappropriateFlagAnnotationsByComponentStates(componentStates) {
        var annotations = [];

        if (componentStates != null) {

            // loop through all the component states
            for (var c = 0; c < componentStates.length; c++) {

                var componentState = componentStates[c];

                if (componentState != null) {

                    /*
                     * get the latest inappropriate flag annotation for the
                     * component state
                     */
                    var latestInappropriateFlagAnnotation = this.AnnotationService.getLatestAnnotationByStudentWorkIdAndType(componentState.id, 'inappropriateFlag');

                    if (latestInappropriateFlagAnnotation != null) {
                        annotations.push(latestInappropriateFlagAnnotation);
                    }
                }
            }
        }

        return annotations;
    }
}

DiscussionController.$inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'ConfigService',
    'DiscussionService',
    'NodeService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'StudentWebSocketService',
    'UtilService',
    '$mdMedia'
];

export default DiscussionController;
