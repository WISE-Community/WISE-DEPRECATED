'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MultipleChoiceController = function () {
    function MultipleChoiceController($scope, MultipleChoiceService, NodeService, ProjectService, StudentDataService) {
        _classCallCheck(this, MultipleChoiceController);

        this.$scope = $scope;
        this.MultipleChoiceService = MultipleChoiceService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // whether the component should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // holds the ids of the choices the student has chosen
        this.studentChoices = [];

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // holds whether the student answered correctly if there is a correct answer
        this.isCorrect = null;

        // keep track of the number of submits
        this.numberOfAttempts = 0;

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

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.component;

        this.mode = this.$scope.mode;

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

            // get the component type
            this.componentType = this.componentContent.type;

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            var componentState = null;

            if (false) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                // get the component state for the show previous work
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                // populate the student work into this component
                this.setStudentWork(componentState);

                // disable the component since we are just showing previous work
                this.isDisabled = true;

                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            } else {
                // this is a regular component

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
        }

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function () {

            var componentState = null;

            if (this.$scope.multipleChoiceController.isDirty || this.$scope.multipleChoiceController.isSubmit) {
                // create a component state populated with the student data
                componentState = this.$scope.multipleChoiceController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.multipleChoiceController.isDirty = false;
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function (event, args) {

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
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));
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

            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }

            this.checkAnswer();

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

            if (this.numberOfAttempts == null) {
                this.numberOfAttempts = 0;
            }

            this.numberOfAttempts++;
        }
    }, {
        key: 'checkAnswer',

        /**
         * Check the answer the student has submitted and display feedback
         * for the choices the student has checked
         */
        value: function checkAnswer() {
            var isCorrect = false;

            this.incrementNumberOfAttempts();
            this.hideAllFeedback();

            if (this.isRadio()) {

                // get the choice the student chose
                var studentChoice = this.studentChoices;

                var choiceObject = this.getChoiceById(studentChoice);

                // show the feedback for the choice if there is any
                if (choiceObject.feedback != null && choiceObject !== '') {
                    choiceObject.showFeedback = true;
                    choiceObject.feedbackToShow = choiceObject.feedback;
                }

                // get the correct choice
                var correctChoice = this.getCorrectChoice();

                // check if the correct choice is chosen
                if (this.isChecked(correctChoice)) {
                    // the student has checked the correct choice
                    isCorrect = true;
                }
            } else if (this.isCheckbox()) {

                // get the correct choices
                var correctChoices = this.getCorrectChoices();

                // get all the choices
                var choices = this.getChoices();

                if (choices != null) {

                    var correctSoFar = true;

                    // check if only the correct choices are chosen
                    for (var c = 0; c < choices.length; c++) {
                        var choice = choices[c];

                        if (choice != null) {
                            var choiceId = choice.id;

                            var isChoiceCorrect = false;

                            // check if the choice is correct
                            if (correctChoices.indexOf(choiceId) != -1) {
                                isChoiceCorrect = true;
                            }

                            // check if the student checked the choice
                            var isChecked = this.isChecked(choiceId);

                            // show the feedback if it exists and the student checked it
                            if (isChecked && choice.feedback != null && choice.feedback !== '') {
                                choice.showFeedback = true;
                                choice.feedbackToShow = choice.feedback;
                            }

                            if (isChecked && isChoiceCorrect || !isChecked && !isChoiceCorrect) {
                                /*
                                 * the choice is correct and the student has checked it or
                                 * the choice is incorrect and the student has not checked it
                                 */
                            } else {
                                    /*
                                     * the choice is correct and the student has not checked it or
                                     * the choice is incorrect and the student has checked it
                                     */
                                    correctSoFar = false;
                                }
                        }
                    }

                    isCorrect = correctSoFar;
                }
            }

            this.isCorrect = isCorrect;
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
        key: 'studentDataChanged',

        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            /*
             * set the dirty flag so we will know we need to save the
             * student work later
             */
            this.isDirty = true;

            /*
             * reset these values so that they don't accidentally persist
             * between component states
             */
            this.isSubmit = null;
            this.isCorrect = null;

            // get this component id
            var componentId = this.getComponentId();

            // create a component state populated with the student data
            var componentState = this.createComponentState();

            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved.
             * this will also notify connected parts that this component's student
             * data has changed.
             */
            this.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
        }
    }, {
        key: 'createComponentState',

        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        value: function createComponentState() {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            if (componentState != null) {

                var studentData = {};

                // set the student choices into the component state
                studentData.studentChoices = this.getStudentChoiceObjects();

                // check if the student has answered correctly
                var hasCorrect = this.hasCorrectChoices();

                if (hasCorrect) {
                    /*
                     * check if the student has chosen all the correct
                     * choices
                     */
                    if (this.isCorrect != null) {
                        // set the isCorrect value into the student data
                        studentData.isCorrect = this.isCorrect;
                    }

                    if (this.isSubmit != null) {
                        componentState.isSubmit = this.isSubmit;
                    }

                    // set the number of attempts the student has made
                    studentData.numberOfAttempts = this.numberOfAttempts;
                }

                if (this.isSubmit) {
                    // the student submitted this work
                    componentState.isSubmit = this.isSubmit;

                    /*
                     * reset the isSubmit value so that the next component state
                     * doesn't maintain the same value
                     */
                    this.isSubmit = false;
                }

                componentState.studentData = studentData;
            }

            return componentState;
        }
    }, {
        key: 'calculateDisabled',

        /**
         * Check if we need to lock the component
         */
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

                // get the choice type
                var choiceType = componentContent.choiceType;

                if (choiceType === 'radio') {

                    // get the correct choice id
                    var correctChoice = componentContent.correctChoice;

                    if (correctChoice != null) {
                        result = true;
                    }
                } else if (choiceType === 'checkbox') {

                    // get the correct choice ids
                    var correctChoices = componentContent.correctChoices;

                    if (correctChoices != null && correctChoices.length > 0) {
                        result = true;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getChoiceById',

        /**
         * Get a choice object by choice id
         * @param choiceId the choice id
         * @return the choice object with the given choice id
         */
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
        key: 'getChoiceType',

        /**
         * Get the choice type for this component ('radio' or 'checkbox')
         * @return the choice type for this component
         */
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
        key: 'showPrompt',

        /**
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        value: function showPrompt() {
            var show = false;

            if (this.isPromptVisible) {
                show = true;
            }

            return show;
        }
    }, {
        key: 'showSaveButton',

        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            var show = false;

            // check the showSaveButton field in the component content
            if (this.componentContent.showSaveButton) {
                show = true;
            }

            return show;
        }
    }, {
        key: 'showSubmitButton',

        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            var show = false;

            if (this.componentContent != null) {

                // check the showSubmitButton field in the component content
                if (this.componentContent.showSubmitButton) {
                    show = true;
                }
            }

            return show;
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

            if (this.componentContent != null) {
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
                            var populatedComponentState = this.MultipleChoiceService.populateComponentState(importWorkComponentState);

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
            var componentId = this.componentContent.id;

            return componentId;
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
    }]);

    return MultipleChoiceController;
}();

;

MultipleChoiceController.$inject = ['$scope', 'MultipleChoiceService', 'NodeService', 'ProjectService', 'StudentDataService'];

exports.default = MultipleChoiceController;