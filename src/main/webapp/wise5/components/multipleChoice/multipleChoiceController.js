'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MultipleChoiceController = function () {
    function MultipleChoiceController($filter, $injector, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, MultipleChoiceService, NodeService, ProjectService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, MultipleChoiceController);

        this.$filter = $filter;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.MultipleChoiceService = MultipleChoiceService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;
        this.$translate = this.$filter('translate');

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether the component should be disabled
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

        // whether the advanced authoring textarea is displayed
        this.showAdvancedAuthoring = false;

        // holds the ids of the choices the student has chosen
        this.studentChoices = [];

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // holds whether the student answered correctly if there is a correct answer
        this.isCorrect = null;

        // keep track of the number of submits
        this.numberOfAttempts = null;

        // whether the latest work was submitted or not
        this.isSubmit = null;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = null;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether to show the feedback or not
        this.showFeedback = true;

        // the latest annotations
        this.latestAnnotations = null;

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
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
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
                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('html.insertAsset');

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
                    toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertAssetButton: InsertAssetButton
                    }
                };

                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            this.showFeedback = this.componentContent.showFeedback;

            // get the component type
            this.componentType = this.componentContent.type;

            var componentState = null;

            // get the component state from the scope
            componentState = this.$scope.componentState;

            if (componentState == null) {
                /*
                 * only import work if the student does not already have
                 * work for this component
                 */

                // check if we need to import work
                var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
                    // import the work from the other component
                    this.importWork();
                }
            } else {
                // populate the student work into this component
                this.setStudentWork(componentState);
            }

            // check if we need to lock this component
            this.calculateDisabled();

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

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
                if (this.$scope.multipleChoiceController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.multipleChoiceController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.multipleChoiceController.createComponentState(action).then(function (componentState) {
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
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
                this.incrementNumberOfAttempts();

                // set saveFailed to true; will be set to false on save success response from server
                this.saveFailed = true;
            }
        }));

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

                // set saveFailed to false because the save was successful
                this.saveFailed = false;

                var isAutoSave = componentState.isAutoSave;
                var isSubmit = componentState.isSubmit;
                var serverSaveTime = componentState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // set save message
                if (isSubmit) {
                    this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
                } else {
                    this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
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
                        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', function (event, args) {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
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
                            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'prompt') {
                                // the target is the summernote prompt element
                                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
                            } else if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
                            }

                            if (summernoteId != '') {
                                if (_this.UtilService.isImage(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // add the image html
                                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                } else if (_this.UtilService.isVideo(fileName)) {
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
            _this.$mdDialog.hide();
        });
    }

    _createClass(MultipleChoiceController, [{
        key: 'setStudentWork',


        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        value: function setStudentWork(componentState) {

            if (componentState != null) {

                // get the student data
                var studentData = componentState.studentData;

                if (studentData != null) {
                    // get the choice ids the student previously chose
                    var choiceIds = this.getChoiceIdsFromStudentData(studentData);

                    // set the choice(s) the student previously chose
                    if (this.isRadio()) {
                        this.studentChoices = choiceIds[0];
                    } else if (this.isCheckbox()) {
                        this.studentChoices = choiceIds;
                    }

                    if (studentData.isCorrect != null) {
                        this.isCorrect = studentData.isCorrect;
                    }

                    if (componentState.isSubmit) {
                        // the previous work was a submit so we will show the feedback
                        this.showFeedbackForChoiceIds(choiceIds);
                    }

                    var numberOfAttempts = studentData.numberOfAttempts;

                    if (numberOfAttempts != null) {
                        // show the number of attempts
                        this.numberOfAttempts = numberOfAttempts;
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
                    this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
                } else {
                    // latest state is not a submission, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                    // set save message
                    this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
                }
            }
        }
    }, {
        key: 'showFeedbackForChoiceIds',
        value: function showFeedbackForChoiceIds(choiceIds) {

            if (choiceIds != null) {
                for (var c = 0; c < choiceIds.length; c++) {
                    var choiceId = choiceIds[c];

                    var choiceObject = this.getChoiceById(choiceId);

                    if (choiceObject != null) {
                        choiceObject.showFeedback = true;
                        choiceObject.feedbackToShow = choiceObject.feedback;
                    }
                }
            }
        }
    }, {
        key: 'isChecked',


        /**
         * Determine if the choice id has been checked
         * @param the choice id to look at
         * @return whether the choice id was checked
         */
        value: function isChecked(choiceId) {
            var result = false;

            // get the choices the student chose
            var studentChoices = this.studentChoices;

            if (studentChoices != null) {
                if (this.isRadio()) {
                    // this is a radio button step

                    if (choiceId === studentChoices) {
                        // the student checked the choice id
                        result = true;
                    }
                } else if (this.isCheckbox()) {
                    // this is a checkbox step

                    if (studentChoices.indexOf(choiceId) != -1) {
                        // the student checked the choice id
                        result = true;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getChoiceIdsFromStudentData',


        /**
         * Get the choice ids from the student data
         * @param studentData an array that contains the objects of the
         * choices the student chose
         * @return an array containing the choice id(s) the student chose
         */
        value: function getChoiceIdsFromStudentData(studentData) {
            var choiceIds = [];

            if (studentData != null && studentData.studentChoices != null) {

                // get the choices the student chose
                var studentChoices = studentData.studentChoices;

                // loop through all the choice objects in the student data
                for (var x = 0; x < studentChoices.length; x++) {
                    // get a choice object
                    var studentDataChoice = studentChoices[x];

                    if (studentDataChoice != null) {
                        // get the choice id
                        var studentDataChoiceId = studentDataChoice.id;

                        // add the choice id to our array
                        choiceIds.push(studentDataChoiceId);
                    }
                }
            }

            return choiceIds;
        }
    }, {
        key: 'radioChoiceSelected',


        /**
         * The student clicked on one of the radio button choices
         * @param choiceId the choice id of the radio button the student clicked
         */
        value: function radioChoiceSelected(choiceId) {
            // notify this node that the student choice has changed
            this.studentDataChanged();

            if (choiceId != null) {
                // log this event
                var category = "StudentInteraction";
                var event = "choiceSelected";
                var data = {};
                data.selectedChoiceId = choiceId;
                this.StudentDataService.saveComponentEvent(this, category, event, data);
            }
        }
    }, {
        key: 'toggleSelection',


        /**
         * The student clicked on one of the check box choices
         * @param choiceId the choice id of the checkbox the student clicked
         */
        value: function toggleSelection(choiceId) {

            if (choiceId != null) {
                /*
                 * get the array of choice ids that were checked before the
                 * student clicked the most current check box
                 */
                var studentChoices = this.studentChoices;

                if (studentChoices != null) {
                    /*
                     * check if the newest check is in the array of checked
                     * choices
                     */
                    var index = studentChoices.indexOf(choiceId);

                    if (index == -1) {
                        /*
                         * the choice was not previously checked so we will add
                         * the choice id to the array
                         */
                        studentChoices.push(choiceId);
                    } else {
                        /*
                         * the choice was previously checked so we will remove
                         * the choice id from the array
                         */
                        studentChoices.splice(index, 1);
                    }
                }

                // notify this node that the student choice has changed
                this.studentDataChanged();

                // log this event
                var category = "StudentInteraction";
                var event = "choiceSelected";
                var data = {};
                data.selectedChoiceId = choiceId;
                data.choicesAfter = studentChoices;
                this.StudentDataService.saveComponentEvent(this, category, event, data);
            }
        }
    }, {
        key: 'isRadio',


        /**
         * Check if this multiple choice component is using radio buttons
         * @return whether this multiple choice component is using radio buttons
         */
        value: function isRadio() {
            return this.isChoiceType('radio');
        }
    }, {
        key: 'isCheckbox',


        /**
         * Check if this multiple choice component is using checkboxes
         * @return whether this multiple choice component is using checkboxes
         */
        value: function isCheckbox() {
            return this.isChoiceType('checkbox');
        }
    }, {
        key: 'isChoiceType',


        /**
         * Check if the component is authored to use the given choice type
         * @param choiceType the choice type ('radio' or 'checkbox')
         * @return whether the component is authored to use the given
         * choice type
         */
        value: function isChoiceType(choiceType) {
            var result = false;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {
                // get the choice type from the component content
                var componentContentChoiceType = componentContent.choiceType;

                if (choiceType === componentContentChoiceType) {
                    // the choice type matches
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'saveButtonClicked',


        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {
            this.isSubmit = false;
            this.isCorrect = null;
            this.hideAllFeedback();

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',


        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            // TODO: add confirmation dialog if lock after submit is enabled on this component
            this.isSubmit = true;
            this.isCorrect = null;
            this.hideAllFeedback();
            this.incrementNumberOfAttempts();

            // set saveFailed to true; will be set to false on save success response from server
            this.saveFailed = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'hideAllFeedback',


        /**
         * Hide all the feedback
         */
        value: function hideAllFeedback() {

            // get all the choices
            var choices = this.getChoices();

            // loop through all the choices
            for (var c = 0; c < choices.length; c++) {
                var choice = choices[c];

                if (choice != null) {
                    // hide all the feedback
                    choice.showFeedback = false;
                }
            }
        }
    }, {
        key: 'incrementNumberOfAttempts',


        /**
         * Increment the number of attempts the student has made
         */
        value: function incrementNumberOfAttempts() {
            if (!this.saveFailed) {
                if (this.numberOfAttempts == null) {
                    this.numberOfAttempts = 0;
                }

                this.numberOfAttempts++;
            }
        }
    }, {
        key: 'checkAnswer',


        /**
         * Check the answer the student has submitted and display feedback
         * for the choices the student has checked
         */
        value: function checkAnswer() {
            var isCorrect = false;

            // check if any correct choices have been authored
            if (this.hasFeedback() || this.hasCorrectChoices()) {

                var isCorrectSoFar = true;

                // get all the authored choices
                var choices = this.getChoices();

                // loop through all the choices and check if each should be checked or not

                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        var choiceId = choice.id;

                        // whether the choice is correct
                        var isChoiceCorrect = choice.isCorrect;

                        // whether the student checked the choice
                        var isChoiceChecked = this.isChecked(choiceId);

                        if (isChoiceCorrect != isChoiceChecked) {
                            // the student answered this choice incorrectly
                            isCorrectSoFar = false;
                        }

                        // show the feedback if it exists and the student checked it
                        if (this.showFeedback && isChoiceChecked && choice.feedback != null && choice.feedback !== '') {
                            choice.showFeedback = true;
                            choice.feedbackToShow = choice.feedback;
                        }
                    }
                }

                isCorrect = isCorrectSoFar;
            }

            if (this.hasCorrectChoices()) {
                this.isCorrect = isCorrect;
            }
        }
    }, {
        key: 'getCorrectChoice',


        /**
         * Get the correct choice for a radio button component
         * @return a choice id string
         */
        value: function getCorrectChoice() {
            var correctChoice = null;

            if (this.componentContent != null) {
                correctChoice = this.componentContent.correctChoice;
            }

            return correctChoice;
        }
    }, {
        key: 'getCorrectChoices',


        /**
         * Get the correct choices for a checkbox component
         * @return an array of correct choice ids
         */
        value: function getCorrectChoices() {
            var correctChoices = null;

            if (this.componentContent != null) {
                correctChoices = this.componentContent.correctChoices;
            }

            return correctChoices;
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
             * set the dirty flag so we will know we need to save the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

            // clear out the save message
            this.setSaveMessage('', null);

            // get this component id
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
        key: 'createComponentState',


        /**
         * Create a new component state populated with the student data
         * @param action the action that is triggering creating of this component state
         * e.g. 'submit', 'save', 'change'
         * @return a promise that will return a component state
         */
        value: function createComponentState(action) {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            if (componentState != null) {

                var studentData = {};

                // set the student choices into the component state
                studentData.studentChoices = this.getStudentChoiceObjects();

                if (action === 'submit' || action === 'save') {
                    /*
                     * the student has clicked submit or save so we will
                     * check if the student has chosen all the correct choices.
                     * the isCorrect value will be stored in this.isCorrect.
                     */
                    this.checkAnswer();

                    if (this.isCorrect != null) {
                        // set the isCorrect value into the student data
                        studentData.isCorrect = this.isCorrect;
                    }
                } else {
                    /*
                     * the student data has changed but the student has not
                     * clicked on the submit or save button so we will not
                     * check the answer yet.
                     */
                }

                if (action === 'submit') {
                    if (this.isSubmit) {
                        // the student submitted this work
                        componentState.isSubmit = this.isSubmit;

                        /*
                         * reset the isSubmit value so that the next component state
                         * doesn't maintain the same value
                         */
                        this.isSubmit = false;
                    }
                }

                if (this.numberOfAttempts != null) {
                    // set the number of attempts the student has made
                    studentData.numberOfAttempts = this.numberOfAttempts;
                }

                componentState.studentData = studentData;
            }

            var deferred = this.$q.defer();

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
            /*
             * we don't need to perform any additional processing so we can resolve
             * the promise immediately
             */
            deferred.resolve(componentState);
        }

        /**
         * Check if we need to lock the component
         */

    }, {
        key: 'calculateDisabled',
        value: function calculateDisabled() {

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
        }
    }, {
        key: 'getStudentChoiceObjects',


        /**
         * Get the choices the student has chosen as objects. The objects
         * will contain the choice id and the choice text.
         */
        value: function getStudentChoiceObjects() {
            var studentChoiceObjects = [];

            /*
             * get the choices the student has chosen. this will be an
             * array of choice ids.
             */
            var studentChoices = this.studentChoices;
            var choiceObject = null;
            var studentChoiceObject = null;

            if (studentChoices != null) {

                if (this.isRadio()) {
                    // this is a radio button component

                    // get the choice object
                    choiceObject = this.getChoiceById(studentChoices);

                    if (choiceObject != null) {
                        // create a student choice object and set the id and text
                        studentChoiceObject = {};
                        studentChoiceObject.id = choiceObject.id;
                        studentChoiceObject.text = choiceObject.text;

                        // add the student choice object to our array
                        studentChoiceObjects.push(studentChoiceObject);
                    }
                } else if (this.isCheckbox()) {
                    // this is a checkbox component

                    // loop through all the choices the student chose
                    for (var x = 0; x < studentChoices.length; x++) {

                        // get a choice id that the student chose
                        var studentChoiceId = studentChoices[x];

                        // get the choice object
                        choiceObject = this.getChoiceById(studentChoiceId);

                        if (choiceObject != null) {
                            // create a student choice object and set the id and text
                            studentChoiceObject = {};
                            studentChoiceObject.id = choiceObject.id;
                            studentChoiceObject.text = choiceObject.text;

                            // add the student choice object to our array
                            studentChoiceObjects.push(studentChoiceObject);
                        }
                    }
                }
            }

            return studentChoiceObjects;
        }
    }, {
        key: 'hasCorrectChoices',


        /**
         * Check if the component has been authored with a correct choice
         * @return whether the component has been authored with a correct choice
         */
        value: function hasCorrectChoices() {
            var result = false;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                var choices = componentContent.choices;

                if (choices != null) {

                    // loop through all the authored choices
                    for (var c = 0; c < choices.length; c++) {
                        var choice = choices[c];

                        if (choice != null) {
                            if (choice.isCorrect) {
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'hasFeedback',


        /**
         * Check if there is any feedback
         * @returns whether there is any feedback
         */
        value: function hasFeedback() {
            var result = false;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                var choices = componentContent.choices;

                if (choices != null) {

                    // loop through all the authored choices
                    for (var c = 0; c < choices.length; c++) {
                        var choice = choices[c];

                        if (choice != null) {
                            if (choice.feedback != null && choice.feedback != '') {
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        }

        /**
         * Get a choice object by choice id
         * @param choiceId the choice id
         * @return the choice object with the given choice id
         */

    }, {
        key: 'getChoiceById',
        value: function getChoiceById(choiceId) {
            var choice = null;

            if (choiceId != null) {
                // get the component content
                var componentContent = this.componentContent;

                if (componentContent != null) {

                    // get the choices
                    var choices = componentContent.choices;

                    // loop through all the choices
                    for (var c = 0; c < choices.length; c++) {
                        // get a choice
                        var tempChoice = choices[c];

                        if (tempChoice != null) {
                            // get a choice id
                            var tempChoiceId = tempChoice.id;

                            // check if the choice id matches
                            if (choiceId === tempChoiceId) {
                                /*
                                 * the choice id matches so we will return this
                                 * choice
                                 */
                                choice = tempChoice;
                                break;
                            }
                        }
                    }
                }
            }

            return choice;
        }
    }, {
        key: 'getChoiceByText',


        /**
         * Get a choice by choice text
         * @param text the choice text
         * @return the choice with the given text
         */
        value: function getChoiceByText(text) {

            var choice = null;

            if (text != null) {
                // get the component content
                var componentContent = this.componentContent;

                if (componentContent != null) {

                    // get the choices
                    var choices = componentContent.choices;

                    // loop through all the choices
                    for (var c = 0; c < choices.length; c++) {
                        // get a choice
                        var tempChoice = choices[c];

                        if (tempChoice != null) {
                            // get a choice text
                            var tempChoiceText = tempChoice.text;

                            // check if the choice text matches
                            if (text == tempChoiceText) {
                                /*
                                 * the choice text matches so we will return this
                                 * choice
                                 */
                                choice = tempChoice;
                                break;
                            }
                        }
                    }
                }
            }

            return choice;
        }

        /**
         * Get the choice type for this component ('radio' or 'checkbox')
         * @return the choice type for this component
         */

    }, {
        key: 'getChoiceType',
        value: function getChoiceType() {
            var choiceType = null;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {
                // get the choice type
                choiceType = componentContent.choiceType;
            }

            return choiceType;
        }
    }, {
        key: 'getChoices',


        /**
         * Get the available choices from component content
         * @return the available choices from the component content
         */
        value: function getChoices() {
            var choices = null;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // get the choices
                choices = componentContent.choices;
            }

            return choices;
        }
    }, {
        key: 'getAuthoringChoices',


        /**
         * Get the available choices from component content
         * @return the available choices from the component content
         */
        value: function getAuthoringChoices() {
            var choices = null;

            // get the component content
            var authoringComponentContent = this.authoringComponentContent;

            if (authoringComponentContent != null) {

                // get the choices
                choices = authoringComponentContent.choices;
            }

            return choices;
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
        key: 'importWork',


        /**
         * Import work from another component
         */
        value: function importWork() {

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // get the import previous work node id and component id
                var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
                        importPreviousWorkNodeId = componentContent.importWorkNodeId;
                    }
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
                        importPreviousWorkComponentId = componentContent.importWorkComponentId;
                    }
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

                    // get the latest component state for this component
                    var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.MultipleChoiceService.populateComponentState(importWorkComponentState);

                            /*
                             * update the choice ids so that it uses the choice ids
                             * from this component. we need to do this because the choice
                             * ids are likely to be different. we update the choice ids
                             * by matching the choice text.
                             */
                            this.updateChoiceIdsFromImportedWork(populatedComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'updateChoiceIdsFromImportedWork',


        /**
         * Update the choice ids to use the choice ids from this component.
         * We will use the choice text to match the choices.
         * @param componentState the component state
         */
        value: function updateChoiceIdsFromImportedWork(componentState) {

            if (componentState != null) {

                // get the student data
                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the choices the student chose
                    var studentChoices = studentData.studentChoices;

                    if (studentChoices != null) {

                        // loop through all the choices the student chose
                        for (var s = 0; s < studentChoices.length; s++) {

                            // get a choice the student chose
                            var studentChoice = studentChoices[s];

                            if (studentChoice != null) {

                                // get the choice text
                                var studentChoiceText = studentChoice.text;

                                // get the choice in this component with the given tetxt
                                var choice = this.getChoiceByText(studentChoiceText);

                                if (choice != null) {

                                    // get the choice id
                                    var choiceId = choice.id;

                                    // update the id to have the id from this component
                                    studentChoice.id = choiceId;
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Get the component id
         * @return the component id
         */

    }, {
        key: 'getComponentId',
        value: function getComponentId() {
            return this.componentContent.id;
        }
    }, {
        key: 'authoringViewFeedbackChanged',


        /**
         * The author has changed the feedback so we will enable the submit button
         */
        value: function authoringViewFeedbackChanged() {

            // enable the submit button
            this.authoringComponentContent.showSubmitButton = true;

            // save the component
            this.authoringViewComponentChanged();
        }

        /**
         * The component has changed in the regular authoring view so we will save the project
         */

    }, {
        key: 'authoringViewComponentChanged',
        value: function authoringViewComponentChanged() {

            // clean up the choices by removing fields injected by the controller during run time
            //this.cleanUpChoices();

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
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
                this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
            } catch (e) {
                this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
            }
        }
    }, {
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        }
    }, {
        key: 'getStepNodeIds',


        /**
         * Get all the step node ids in the project
         * @returns all the step node ids
         */
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
         * Add a choice from within the authoring tool
         */

    }, {
        key: 'addChoice',
        value: function addChoice() {

            // get the authored choices
            var choices = this.authoringComponentContent.choices;

            // make the new choice
            var newChoice = {};
            newChoice.id = this.UtilService.generateKey(10);
            newChoice.text = '';
            newChoice.feedback = '';
            newChoice.isCorrect = false;

            // add the new choice
            choices.push(newChoice);

            // save the component
            this.authoringViewComponentChanged();
        }

        /**
         * Delete a choice from within the authoring tool
         * @param choiceId
         */

    }, {
        key: 'deleteChoice',
        value: function deleteChoice(choiceId) {

            // get the authored choices
            var choices = this.authoringComponentContent.choices;

            if (choices != null) {

                // loop through all the authored choices
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        var tempChoiceId = choice.id;

                        if (choiceId === tempChoiceId) {
                            // we have found the choice that we want to delete so we will remove it
                            choices.splice(c, 1);
                            break;
                        }
                    }
                }
            }

            this.authoringViewComponentChanged();
        }

        /**
         * Clean up the choice objects. In the authoring tool this is required
         * because we use the choice objects as ng-model values and inject
         * fields into the choice objects such as showFeedback and feedbackToShow.
         */

    }, {
        key: 'cleanUpChoices',
        value: function cleanUpChoices() {

            // get the authored choices
            var choices = this.getAuthoringChoices();

            if (choices != null) {

                // loop through all the authored choices
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {
                        // remove the fields we don't want to be saved
                        delete choice.showFeedback;
                        delete choice.feedbackToShow;
                    }
                }
            }
        }

        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */

    }, {
        key: 'setSaveMessage',
        value: function setSaveMessage(message, time) {
            this.saveMessage.text = message;
            this.saveMessage.time = time;
        }
    }, {
        key: 'registerExitListener',


        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
        }
    }, {
        key: 'authoringShowPreviousWorkClicked',


        /**
         * The show previous work checkbox was clicked
         */
        value: function authoringShowPreviousWorkClicked() {

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

    }, {
        key: 'authoringShowPreviousWorkNodeIdChanged',
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
         * The show previous work component id has changed
         */

    }, {
        key: 'authoringShowPreviousWorkComponentIdChanged',
        value: function authoringShowPreviousWorkComponentIdChanged() {

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

    }, {
        key: 'componentHasWork',
        value: function componentHasWork(component) {
            var result = true;

            if (component != null) {
                result = this.ProjectService.componentHasWork(component);
            }

            return result;
        }
        /**
         * The import previous work checkbox was clicked
         */

    }, {
        key: 'authoringImportPreviousWorkClicked',
        value: function authoringImportPreviousWorkClicked() {

            if (!this.authoringComponentContent.importPreviousWork) {
                /*
                 * import previous work has been turned off so we will clear the
                 * import previous work node id, and import previous work
                 * component id
                 */
                this.authoringComponentContent.importPreviousWorkNodeId = null;
                this.authoringComponentContent.importPreviousWorkComponentId = null;

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * The import previous work node id has changed
         */

    }, {
        key: 'authoringImportPreviousWorkNodeIdChanged',
        value: function authoringImportPreviousWorkNodeIdChanged() {

            if (this.authoringComponentContent.importPreviousWorkNodeId == null || this.authoringComponentContent.importPreviousWorkNodeId == '') {

                /*
                 * the import previous work node id is null so we will also set the
                 * import previous component id to null
                 */
                this.authoringComponentContent.importPreviousWorkComponentId = '';
            }

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The import previous work component id has changed
         */

    }, {
        key: 'authoringImportPreviousWorkComponentIdChanged',
        value: function authoringImportPreviousWorkComponentIdChanged() {

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * The author has changed the rubric
         */

    }, {
        key: 'summernoteRubricHTMLChanged',
        value: function summernoteRubricHTMLChanged() {

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
    }]);

    return MultipleChoiceController;
}();

;

MultipleChoiceController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'MultipleChoiceService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = MultipleChoiceController;
//# sourceMappingURL=multipleChoiceController.js.map