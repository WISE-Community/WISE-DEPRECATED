'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpenResponseController = function () {
    function OpenResponseController($injector, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService) {
        var _this = this;

        _classCallCheck(this, OpenResponseController);

        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.CRaterService = CRaterService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
        this.OpenResponseService = OpenResponseService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.idToOrder = this.ProjectService.idToOrder;

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

        // holds student attachments like assets
        this.attachments = [];

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

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

        // the latest annotations
        this.latestAnnotations = null;

        // used to hold a message dialog if we need to use one
        this.messageDialog = null;

        // counter to keep track of the number of submits
        this.submitCounter = 0;

        //var scope = this;
        var themePath = this.ProjectService.getThemePath();

        // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
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
            content_css: themePath + "/style/tinymce.css",
            setup: function setup(ed) {
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

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
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
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            var componentState = null;

            // set whether rich text is enabled
            this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            // get the component state from the scope
            componentState = this.$scope.componentState;

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

            if (this.$scope.$parent.registerComponentController != null) {
                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            }
        }

        //$('.openResponse').off('dragover').off('drop');

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function () {
            return this.$scope.openResponseController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a promise of a component state containing the student data
         */
        this.$scope.getComponentState = function (isSubmit) {
            var deferred = this.$q.defer();
            var getState = false;
            var action = 'change';

            if (isSubmit) {
                if (this.$scope.openResponseController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.openResponseController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.openResponseController.createComponentState(action).then(function (componentState) {
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
        this.$scope.$on('nodeSubmitClicked', function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }.bind(this));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

            var componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

                var isAutoSave = componentState.isAutoSave;
                var isSubmit = componentState.isSubmit;
                var serverSaveTime = componentState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }
            }
        }));

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$scope.$on('annotationSavedToServer', function (event, args) {

            if (args != null) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        _this.latestAnnotations = _this.$scope.$parent.nodeController.getLatestComponentAnnotations(_this.componentId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', function (event, args) {}.bind(this));
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */


    _createClass(OpenResponseController, [{
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {
                var studentData = componentState.studentData;

                if (studentData != null) {
                    var response = studentData.response;

                    if (response != null) {
                        // populate the text the student previously typed
                        this.studentResponse = response;
                    }

                    var submitCounter = studentData.submitCounter;

                    if (submitCounter != null) {
                        // populate the submit counter
                        this.submitCounter = submitCounter;
                    }

                    var attachments = studentData.attachments;

                    if (attachments != null) {
                        this.attachments = attachments;
                    }

                    this.processLatestSubmit();
                }
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Check if latest component state is a submission and set isSubmitDirty accordingly
         */
        value: function processLatestSubmit() {
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

            if (latestState) {
                var serverSaveTime = latestState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
                if (latestState.isSubmit) {
                    // latest state is a submission, so set isSubmitDirty to false and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                    // set save message
                    this.setSaveMessage('Last submitted', clientSaveTime);
                } else {
                    // latest state is not a submission, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                    // set save message
                    this.setSaveMessage('Last saved', clientSaveTime);
                }
            }
        }
    }, {
        key: 'saveButtonClicked',


        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {
            this.isSubmit = false;

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',


        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            this.isSubmit = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submit',
        value: function submit() {
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
        }
    }, {
        key: 'studentDataChanged',


        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            var _this2 = this;

            /*
             * set the dirty flags so we will know we need to save or submit the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

            // clear out the save message
            this.setSaveMessage('', null);

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
            this.createComponentState(action).then(function (componentState) {
                _this2.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
            });
        }
    }, {
        key: 'getStudentResponse',


        /**
         * Get the student response
         */
        value: function getStudentResponse() {
            return this.studentResponse;
        }
    }, {
        key: 'createComponentState',


        /**
         * Create a new component state populated with the student data
         * @param action the action that is triggering creating of this component state
         * e.g. 'submit', 'save', 'change'
         * @return a promise that will return a component state
         */
        value: function createComponentState(action) {

            var deferred = this.$q.defer();

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            // get the text the student typed
            var response = this.getStudentResponse();

            // set the response into the component state
            var studentData = {};
            studentData.response = response;
            studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

            if (this.isSubmit) {
                // the student submitted this work
                componentState.isSubmit = this.isSubmit;

                // increment the submit counter
                this.submitCounter++;

                /*
                 * reset the isSubmit value so that the next component state
                 * doesn't maintain the same value
                 */
                this.isSubmit = false;
            }

            // set the submit counter
            studentData.submitCounter = this.submitCounter;

            // set the student data into the component state
            componentState.studentData = studentData;

            /*
             * perform any additional processing that is required before returning
             * the component state
             */
            this.createComponentStateAdditionalProcessing(deferred, componentState, action);

            return deferred.promise;
        }
    }, {
        key: 'createComponentStateAdditionalProcessing',


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
        value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
            var _this3 = this;

            var performCRaterScoring = false;

            // determine if we need to perform CRater scoring
            if (action == 'submit') {
                if (this.isCRaterScoreOnSubmit(this.componentContent)) {
                    performCRaterScoring = true;
                }
            } else if (action == 'save') {
                if (this.isCRaterScoreOnSave(this.componentContent)) {
                    performCRaterScoring = true;
                }
            } else if (action == 'change' || action == null) {
                if (this.isCRaterScoreOnChange(this.componentContent)) {
                    performCRaterScoring = true;
                }
            }

            if (performCRaterScoring) {
                // we need to perform CRater scoring

                var cRaterItemType = this.CRaterService.getCRaterItemType(this.componentContent);
                var cRaterItemId = this.CRaterService.getCRaterItemId(this.componentContent);
                var cRaterRequestType = 'scoring';
                var cRaterResponseId = new Date().getTime();
                var studentData = this.studentResponse;

                /*
                 * display a dialog message while the student waits for their work
                 * to be scored by CRater
                 */
                this.messageDialog = this.$mdDialog.show({
                    template: '<md-dialog aria-label="Please Wait"><md-dialog-content><div class="md-dialog-content">Please wait, we are scoring your work.</div></md-dialog-content></md-dialog>',
                    escapeToClose: false
                });

                // make the CRater request to score the student data
                this.CRaterService.makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData).then(function (result) {

                    if (result != null) {

                        // get the CRater response
                        var data = result.data;

                        if (data != null) {

                            /*
                             * annotations we put in the component state will be
                             * removed from the component state and saved separately
                             */
                            componentState.annotations = [];

                            // get the CRater score
                            var score = data.score;
                            var concepts = data.concepts;

                            if (score != null) {

                                // create the auto score annotation
                                var autoScoreAnnotationData = {};
                                autoScoreAnnotationData.value = score;
                                autoScoreAnnotationData.maxAutoScore = _this3.ProjectService.getMaxScoreForComponent(_this3.nodeId, _this3.componentId);
                                autoScoreAnnotationData.concepts = concepts;
                                autoScoreAnnotationData.autoGrader = 'cRater';

                                var autoScoreAnnotation = _this3.createAutoScoreAnnotation(autoScoreAnnotationData);
                                componentState.annotations.push(autoScoreAnnotation);

                                var autoComment = null;

                                // get the submit counter
                                var submitCounter = _this3.submitCounter;

                                if (_this3.componentContent.cRater.enableMultipleAttemptScoringRules && submitCounter > 1) {
                                    /*
                                     * this step has multiple attempt scoring rules and this is
                                     * a subsequent submit
                                     */

                                    // get the previous score and comment annotations
                                    var latestAnnotations = _this3.$scope.$parent.nodeController.getLatestComponentAnnotations(_this3.componentId);

                                    var previousScore = null;

                                    if (latestAnnotations != null && latestAnnotations.score != null && latestAnnotations.score.data != null) {

                                        // get the previous score annotation value
                                        previousScore = latestAnnotations.score.data.value;
                                    }

                                    // get the feedback based upon the previous score and current score
                                    autoComment = _this3.CRaterService.getMultipleAttemptCRaterFeedbackTextByScore(_this3.componentContent, previousScore, score);
                                } else {
                                    // get the feedback text
                                    autoComment = _this3.CRaterService.getCRaterFeedbackTextByScore(_this3.componentContent, score);
                                }

                                if (autoComment != null) {
                                    // create the auto comment annotation
                                    var autoCommentAnnotationData = {};
                                    autoCommentAnnotationData.value = autoComment;
                                    autoCommentAnnotationData.concepts = concepts;
                                    autoCommentAnnotationData.autoGrader = 'cRater';

                                    var autoCommentAnnotation = _this3.createAutoCommentAnnotation(autoCommentAnnotationData);
                                    componentState.annotations.push(autoCommentAnnotation);
                                }

                                // get the notification
                                var notificationsForScore = _this3.CRaterService.getNotificationsByScore(_this3.componentContent, score);

                                if (notificationsForScore != null) {
                                    for (var n = 0; n < notificationsForScore.length; n++) {
                                        var notificationForScore = notificationsForScore[n];
                                        notificationForScore.score = score;
                                        notificationForScore.nodeId = _this3.nodeId;
                                        notificationForScore.componentId = _this3.componentId;
                                        _this3.NotificationService.sendNotificationForScore(notificationForScore);
                                    }
                                }
                            }
                        }
                    }

                    if (_this3.messageDialog != null) {
                        /*
                         * hide the dialog that tells the student to wait since
                         * the work has been scored.
                         */
                        _this3.$mdDialog.hide(_this3.messageDialog);
                    }

                    // resolve the promise now that we are done performing additional processing
                    deferred.resolve(componentState);
                });
            } else {
                /*
                 * we don't need to perform any additional processing so we can resolve
                 * the promise immediately
                 */
                deferred.resolve(componentState);
            }
        }

        /**
         * Create an auto score annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto score annotation
         */

    }, {
        key: 'createAutoScoreAnnotation',
        value: function createAutoScoreAnnotation(data) {

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var toWorkgroupId = this.ConfigService.getWorkgroupId();

            // create the auto score annotation
            var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

            return annotation;
        }

        /**
         * Create an auto comment annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto comment annotation
         */

    }, {
        key: 'createAutoCommentAnnotation',
        value: function createAutoCommentAnnotation(data) {

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var toWorkgroupId = this.ConfigService.getWorkgroupId();

            // create the auto comment annotation
            var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

            return annotation;
        }

        /**
         * Check if we need to lock the component
         */

    }, {
        key: 'calculateDisabled',
        value: function calculateDisabled() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the component after the student has submitted

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
        }
    }, {
        key: 'showPrompt',


        /**
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        value: function showPrompt() {
            return this.isPromptVisible;
        }
    }, {
        key: 'showSaveButton',


        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            return this.isSaveButtonVisible;
        }
    }, {
        key: 'showSubmitButton',


        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            return this.isSubmitButtonVisible;
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
        key: 'removeAttachment',
        value: function removeAttachment(attachment) {
            if (this.attachments.indexOf(attachment) != -1) {
                this.attachments.splice(this.attachments.indexOf(attachment), 1);
                this.studentDataChanged();
                // YOU ARE NOW FREEEEEEEEE!
            }
        }
    }, {
        key: 'attachStudentAsset',


        /**
         * Attach student asset to this Component's attachments
         * @param studentAsset
         */
        value: function attachStudentAsset(studentAsset) {
            var _this4 = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        _this4.attachments.push(attachment);
                        _this4.studentDataChanged();
                    }
                });
            }
        }
    }, {
        key: 'getPrompt',


        /**
         * Get the prompt to show to the student
         */
        value: function getPrompt() {
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
        }
    }, {
        key: 'getNumRows',


        /**
         * Get the number of rows for the textarea
         */
        value: function getNumRows() {
            var numRows = null;

            if (this.componentContent != null) {
                numRows = this.componentContent.numRows;
            }

            return numRows;
        }
    }, {
        key: 'getNumColumns',


        /**
         * Get the number of columns for the textarea
         */
        value: function getNumColumns() {
            var numColumns = null;

            if (this.componentContent != null) {
                numColumns = this.componentContent.numColumns;
            }

            return numColumns;
        }
    }, {
        key: 'getResponse',


        /**
         * Get the text the student typed
         */
        value: function getResponse() {
            var response = null;

            if (this.studentResponse != null) {
                response = this.studentResponse;
            }

            return response;
        }
    }, {
        key: 'importWork',


        /**
         * Import work from another component
         */
        value: function importWork() {

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
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.OpenResponseService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'getComponentId',


        /**
         * Get the component id
         * @return the component id
         */
        value: function getComponentId() {
            return this.componentContent.id;
        }
    }, {
        key: 'authoringViewComponentChanged',


        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        }
    }, {
        key: 'advancedAuthoringViewComponentChanged',


        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        value: function advancedAuthoringViewComponentChanged() {

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
            } catch (e) {}
        }
    }, {
        key: 'authoringShowPreviousWorkNodeIdChanged',


        /**
         * The show previous work node id has changed
         */
        value: function authoringShowPreviousWorkNodeIdChanged() {

            if (this.authoringComponentContent.showPreviousWorkNodeId == null || this.authoringComponentContent.showPreviousWorkNodeId == '') {

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
         * Get all the step node ids in the project
         * @returns all the step node ids
         */

    }, {
        key: 'getStepNodeIds',
        value: function getStepNodeIds() {
            var stepNodeIds = this.ProjectService.getNodeIds();

            return stepNodeIds;
        }

        /**
         * Get the step number and title
         * @param nodeId get the step number and title for this node
         * @returns the step number and title
         */

    }, {
        key: 'getNodePositionAndTitleByNodeId',
        value: function getNodePositionAndTitleByNodeId(nodeId) {
            var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

            return nodePositionAndTitle;
        }

        /**
         * Get the components in a step
         * @param nodeId get the components in the step
         * @returns the components in the step
         */

    }, {
        key: 'getComponentsByNodeId',
        value: function getComponentsByNodeId(nodeId) {
            var components = this.ProjectService.getComponentsByNodeId(nodeId);

            return components;
        }

        /**
         * Check if a node is a step node
         * @param nodeId the node id to check
         * @returns whether the node is an application node
         */

    }, {
        key: 'isApplicationNode',
        value: function isApplicationNode(nodeId) {
            var result = this.ProjectService.isApplicationNode(nodeId);

            return result;
        }

        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */

    }, {
        key: 'updateAdvancedAuthoringView',
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
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
        key: 'isCRaterEnabled',


        /**
         * Check if CRater is enabled for this component
         * @returns whether CRater is enabled for this component
         */
        value: function isCRaterEnabled() {
            var result = false;

            if (this.CRaterService.isCRaterEnabled(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on save
         * @returns whether CRater is set to score on save
         */

    }, {
        key: 'isCRaterScoreOnSave',
        value: function isCRaterScoreOnSave() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on submit
         * @returns whether CRater is set to score on submit
         */

    }, {
        key: 'isCRaterScoreOnSubmit',
        value: function isCRaterScoreOnSubmit() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on change
         * @returns whether CRater is set to score on change
         */

    }, {
        key: 'isCRaterScoreOnChange',
        value: function isCRaterScoreOnChange() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score when the student exits the step
         * @returns whether CRater is set to score when the student exits the step
         */

    }, {
        key: 'isCRaterScoreOnExit',
        value: function isCRaterScoreOnExit() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */

    }, {
        key: 'registerExitListener',
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', function (event, args) {});
        }
    }]);

    return OpenResponseController;
}();

;

OpenResponseController.$inject = ['$injector', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotificationService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = OpenResponseController;
//# sourceMappingURL=openResponseController.js.map