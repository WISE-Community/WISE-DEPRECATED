'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MatchController = function () {
    function MatchController($rootScope, $scope, MatchService, NodeService, ProjectService, StudentDataService, UtilService) {
        _classCallCheck(this, MatchController);

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.MatchService = MatchService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // the choices
        this.choices = [];

        // the buckets
        this.buckets = [];

        // the number of times the student has submitted
        this.numberOfSubmits = 0;

        // whether the student has correctly placed the choices
        this.isCorrect = null;

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
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    /*
                     * initialize the choices and buckets with the values from the
                     * component content
                     */
                    this.initializeChoices();
                    this.initializeBuckets();
                }.bind(this), true);
            }

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            if (showPreviousWorkNodeId != null) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                /*
                 * initialize the choices and buckets with the values from the
                 * component content
                 */
                this.initializeChoices();
                this.initializeBuckets();

                // get the component state for the show previous work
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                // populate the student work into this component
                this.setStudentWork(componentState);

                // disable the component since we are just showing previous work
                this.isDisabled = true;

                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            } else {
                // this is a regular component

                /*
                 * initialize the choices and buckets with the values from the
                 * component content
                 */
                this.initializeChoices();
                this.initializeBuckets();

                // get the component state from the scope
                var componentState = this.$scope.componentState;

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

        this.$scope.options = {
            accept: function (sourceNode, destNodes, destIndex) {
                var result = false;

                // get the value of the source node
                var data = sourceNode.$modelValue;

                // get the type of the nodes in the destination
                var destType = destNodes.$element.attr('data-type');

                if (data != null) {

                    // check if the types match
                    if (data.type === destType) {
                        // the types match so we will accept it
                        result = true;
                    }
                }

                return result;
            }.bind(this),
            dropped: function (event) {
                var sourceNode = event.source.nodeScope;
                var destNodes = event.dest.nodesScope;

                // tell the controller that the student data has changed
                this.$scope.matchController.studentDataChanged();
            }.bind(this)
        };

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function () {

            var componentState = null;

            if (this.$scope.matchController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.matchController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.matchController.isDirty = false;
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

                    // check if the student answered correctly
                    this.checkAnswer();
                    this.numberOfSubmits++;
                }
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {
            // do nothing
        }));
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

    _createClass(MatchController, [{
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {

                // get the student data from the component state
                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the buckets and number of submits
                    var componentStateBuckets = studentData.buckets;
                    var componentStateNumberOfSubmits = studentData.numberOfSubmits;

                    // set the buckets
                    if (componentStateBuckets != null) {
                        this.buckets = componentStateBuckets;
                    }

                    // set the number of submits
                    if (componentStateNumberOfSubmits != null) {
                        this.numberOfSubmits = componentStateNumberOfSubmits;
                    }
                }
            }
        }
    }, {
        key: 'initializeChoices',

        /**
         * Initialize the available choices from the component content
         */
        value: function initializeChoices() {

            this.choices = [];

            if (this.componentContent != null && this.componentContent.choices != null) {
                this.choices = this.componentContent.choices;
            }
        }
    }, {
        key: 'getChoices',

        /**
         * Get the choices
         */
        value: function getChoices() {
            return this.choices;
        }
    }, {
        key: 'initializeBuckets',

        /**
         * Initialize the available buckets from the component content
         */
        value: function initializeBuckets() {

            this.buckets = [];

            if (this.componentContent != null && this.componentContent.buckets != null) {

                // get the buckets from the component content
                var buckets = this.componentContent.buckets;

                /*
                 * create a bucket that will contain the choices when
                 * the student first starts working
                 */
                var originBucket = {};
                originBucket.id = 0;
                originBucket.value = 'Choices';
                originBucket.type = 'bucket';
                originBucket.items = [];

                var choices = this.getChoices();

                // add all the choices to the origin bucket
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    originBucket.items.push(choice);
                }

                // add the origin bucket to our array of buckets
                this.buckets.push(originBucket);

                // add all the other buckets to our array of buckets
                for (var b = 0; b < buckets.length; b++) {
                    var bucket = buckets[b];

                    bucket.items = [];

                    this.buckets.push(bucket);
                }
            }
        }
    }, {
        key: 'getBuckets',

        /**
         * Get the buckets
         */
        value: function getBuckets() {
            return this.buckets;
        }
    }, {
        key: 'getCopyOfBuckets',

        /**
         * Create a copy of the buckets for cases when we want to make
         * sure we don't accidentally change a bucket and have it also
         * change previous versions of the buckets.
         * @return a copy of the buckets
         */
        value: function getCopyOfBuckets() {
            var buckets = this.getBuckets();

            // get a JSON string representation of the buckets
            var bucketsJSONString = angular.toJson(buckets);

            // turn the JSON string back into a JSON array
            var copyOfBuckets = angular.fromJson(bucketsJSONString);

            return copyOfBuckets;
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

            // check if the student answered correctly
            this.checkAnswer();
            this.numberOfSubmits++;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'checkAnswer',

        /**
         * Check if the student has answered correctly
         */
        value: function checkAnswer() {
            var isCorrect = true;

            // get the buckets
            var buckets = this.getBuckets();

            if (buckets != null) {

                // loop through all the buckets
                for (var b = 0; b < buckets.length; b++) {

                    // get a bucket
                    var bucket = buckets[b];

                    if (bucket != null) {
                        var bucketId = bucket.id;
                        var items = bucket.items;

                        if (items != null) {

                            // loop through all the items in the bucket
                            for (var i = 0; i < items.length; i++) {
                                var item = items[i];
                                var position = i + 1;

                                if (item != null) {
                                    var choiceId = item.id;

                                    // get the feedback object for the bucket and choice
                                    var feedbackObject = this.getFeedbackObject(bucketId, choiceId);

                                    if (feedbackObject != null) {
                                        var feedback = feedbackObject.feedback;

                                        var feedbackPosition = feedbackObject.position;
                                        var feedbackIsCorrect = feedbackObject.isCorrect;

                                        // set the default feedback if none is authored
                                        if (feedback == null || feedback == '') {
                                            if (feedbackIsCorrect) {
                                                feedback = 'Correct';
                                            } else {
                                                feedback = 'Incorrect';
                                            }
                                        }

                                        if (!this.componentContent.ordered || feedbackPosition == null) {
                                            /*
                                             * position does not matter and the choice may be
                                             * in the correct or incorrect bucket
                                             */

                                            // set the feedback into the item
                                            item.feedback = feedback;

                                            // set whether the choice is in the correct bucket
                                            item.isCorrect = feedbackIsCorrect;

                                            /*
                                             * there is no feedback position in the feeback object so
                                             * position doesn't matter
                                             */
                                            item.isIncorrectPosition = false;

                                            // update whether the student has answered the step correctly
                                            isCorrect = isCorrect && feedbackIsCorrect;
                                        } else {
                                            /*
                                             * position does matter and the choice is in a correct
                                             * bucket. we know this because a feedback object will
                                             * only have a non-null position value if the choice is
                                             * in the correct bucket. if the feedback object is for
                                             * a choice that is in an incorrect bucket, the position
                                             * value will be null.
                                             */

                                            if (position === feedbackPosition) {
                                                // the item is in the correct position

                                                // set the feedback into the item
                                                item.feedback = feedback;

                                                // set whether the choice is in the correct bucket
                                                item.isCorrect = feedbackIsCorrect;

                                                // the choice is in the correct position
                                                item.isIncorrectPosition = false;

                                                // update whether the student has answered the step correctly
                                                isCorrect = isCorrect && feedbackIsCorrect;
                                            } else {
                                                // item is in the correct bucket but wrong position

                                                /*
                                                 * get the feedback for when the choice is in the correct
                                                 * bucket but wrong position
                                                 */
                                                var incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;

                                                // set the default feedback if none is authored
                                                if (incorrectPositionFeedback == null || incorrectPositionFeedback == '') {
                                                    incorrectPositionFeedback = 'Correct bucket but wrong position';
                                                }

                                                item.feedback = incorrectPositionFeedback;

                                                /*
                                                 * the choice is in the incorrect position so it isn't correct
                                                 */
                                                item.isCorrect = false;

                                                // the choice is in the incorrect position
                                                item.isIncorrectPosition = true;

                                                // the student has answered incorrectly
                                                isCorrect = false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            /*
             * set the isCorrect value into the controller
             * so we can read it later
             */
            this.isCorrect = isCorrect;
        }
    }, {
        key: 'getFeedbackObject',

        /**
         * Get the feedback object for the combination of bucket and choice
         * @param bucketId the bucket id
         * @param choiceId the choice id
         * @return the feedback object for the combination of bucket and choice
         */
        value: function getFeedbackObject(bucketId, choiceId) {
            var feedbackObject = null;

            var componentContent = this.componentContent;

            if (componentContent != null) {

                // get the feedback
                var feedback = componentContent.feedback;

                if (feedback != null) {

                    /*
                     * loop through the feedback. each element in the feedback represents
                     * a bucket
                     */
                    for (var f = 0; f < feedback.length; f++) {

                        // get a bucket feedback object
                        var bucketFeedback = feedback[f];

                        if (bucketFeedback != null) {

                            // get the bucket id
                            var tempBucketId = bucketFeedback.bucketId;

                            if (bucketId === tempBucketId) {
                                // we have found the bucket we are looking for

                                var choices = bucketFeedback.choices;

                                if (choices != null) {

                                    // loop through all the choice feedback
                                    for (var c = 0; c < choices.length; c++) {
                                        var choiceFeedback = choices[c];

                                        if (choiceFeedback != null) {
                                            var tempChoiceId = choiceFeedback.choiceId;

                                            if (choiceId === tempChoiceId) {
                                                // we have found the choice we are looking for
                                                feedbackObject = choiceFeedback;
                                                break;
                                            }
                                        }
                                    }

                                    if (feedbackObject != null) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return feedbackObject;
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

                // set the buckets into the student data
                studentData.buckets = this.getCopyOfBuckets();

                // set the number of submits into the student data
                studentData.numberOfSubmits = this.numberOfSubmits;

                if (this.isCorrect != null) {
                    // set whether the student was correct
                    studentData.isCorrect = this.isCorrect;
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

                //set the student data into the component state
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
        key: 'showSaveButton',

        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            var show = false;

            if (this.componentContent != null) {

                // check the showSaveButton field in the component content
                if (this.componentContent.showSaveButton) {
                    show = true;
                }
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
                            var populatedComponentState = this.MatchService.populateComponentState(importWorkComponentState);

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
        key: 'authoringViewComponentChanged',

        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            // save the project to the server
            this.ProjectService.saveProject();
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
                var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

                // set the new authoring component content
                this.authoringComponentContent = authoringComponentContent;

                // set the component content
                this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

                // save the project to the server
                this.ProjectService.saveProject();
            } catch (e) {}
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
        key: 'authoringAddChoice',

        /**
         * Add a choice
         */
        value: function authoringAddChoice() {

            // create a new choice
            var newChoice = {};
            newChoice.id = this.UtilService.generateKey(10);
            newChoice.value = '';
            newChoice.type = 'choice';

            // add the choice to the array of choices
            this.authoringComponentContent.choices.push(newChoice);

            // add the choice to the feedback
            this.addChoiceToFeedback(newChoice.id);

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Add a bucket
         */

    }, {
        key: 'authoringAddBucket',
        value: function authoringAddBucket() {

            // create a new bucket
            var newBucket = {};
            newBucket.id = this.UtilService.generateKey(10);
            newBucket.value = '';
            newBucket.type = 'bucket';

            // add the bucket to the array of buckets
            this.authoringComponentContent.buckets.push(newBucket);

            // add the bucket to the feedback
            this.addBucketToFeedback(newBucket.id);

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Delete a choice
         * @param index the index of the choice in the choice array
         */

    }, {
        key: 'authoringDeleteChoice',
        value: function authoringDeleteChoice(index) {

            // confirm with the user that they want to delete the choice
            var answer = confirm('Are you sure you want to delete this choice?');

            if (answer) {

                // remove the choice from the array
                var deletedChoice = this.authoringComponentContent.choices.splice(index, 1);

                if (deletedChoice != null && deletedChoice.length > 0) {

                    // splice returns an array so we need to get the element out of it
                    deletedChoice = deletedChoice[0];

                    // get the choice id
                    var choiceId = deletedChoice.id;

                    // remove the choice from the feedback
                    this.removeChoiceFromFeedback(choiceId);
                }

                // save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Delete a bucket
         * @param index the index of the bucket in the bucket array
         */

    }, {
        key: 'authoringDeleteBucket',
        value: function authoringDeleteBucket(index) {

            // confirm with the user tha tthey want to delete the bucket
            var answer = confirm('Are you sure you want to delete this bucket?');

            if (answer) {

                // remove the bucket from the array
                var deletedBucket = this.authoringComponentContent.buckets.splice(index, 1);

                if (deletedBucket != null && deletedBucket.length > 0) {

                    // splice returns an array so we need to get the element out of it
                    deletedBucket = deletedBucket[0];

                    // get the bucket id
                    var bucketId = deletedBucket.id;

                    // remove the bucket from the feedback
                    this.removeBucketFromFeedback(bucketId);
                }

                // save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Get the choice by id from the authoring component content
         * @param id the choice id
         * @returns the choice object from the authoring component content
         */

    }, {
        key: 'getChoiceById',
        value: function getChoiceById(id) {

            var choice = null;

            // get the choices
            var choices = this.authoringComponentContent.choices;

            // loop through all the choices
            for (var c = 0; c < choices.length; c++) {
                // get a choice
                var tempChoice = choices[c];

                if (tempChoice != null) {
                    if (id === tempChoice.id) {
                        // we have found the choice we want
                        choice = tempChoice;
                        break;
                    }
                }
            }

            return choice;
        }

        /**
         * Get the bucket by id from the authoring component content
         * @param id the bucket id
         * @returns the bucket object from the authoring component content
         */

    }, {
        key: 'getBucketById',
        value: function getBucketById(id) {

            var bucket = null;

            // get the buckets
            var buckets = this.authoringComponentContent.buckets;

            // loop through the buckets
            for (var b = 0; b < buckets.length; b++) {
                var tempBucket = buckets[b];

                if (tempBucket != null) {
                    if (id === tempBucket.id) {
                        // we have found teh bucket we want
                        bucket = tempBucket;
                        break;
                    }
                }
            }

            return bucket;
        }

        /**
         * Get the choice value by id from the authoring component content
         * @param id the choice id
         * @returns the choice value from the authoring component content
         */

    }, {
        key: 'getChoiceValueById',
        value: function getChoiceValueById(id) {

            var value = null;

            // get the choice
            var choice = this.getChoiceById(id);

            if (choice != null) {
                // get the value
                value = choice.value;
            }

            return value;
        }

        /**
         * Get the bucket value by id from the authoring component content
         * @param id the bucket id
         * @returns the bucket value from the authoring component content
         */

    }, {
        key: 'getBucketValueById',
        value: function getBucketValueById(id) {

            var value = null;

            // get the bucket
            var bucket = this.getBucketById(id);

            if (bucket != null) {
                // get the value
                value = bucket.value;
            }

            return value;
        }

        /**
         * Add a choice to the feedback
         * @param choiceId the choice id
         */

    }, {
        key: 'addChoiceToFeedback',
        value: function addChoiceToFeedback(choiceId) {

            // get the feedback array
            var feedback = this.authoringComponentContent.feedback;

            if (feedback != null) {

                /*
                 * loop through all the elements in the feedback. each element
                 * represents a bucket.
                 */
                for (var f = 0; f < feedback.length; f++) {
                    // get a bucket
                    var bucketFeedback = feedback[f];

                    if (bucketFeedback != null) {

                        // get the choices in the bucket
                        var choices = bucketFeedback.choices;

                        var feedbackText = '';
                        var isCorrect = false;

                        // create a feedback object
                        var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

                        // add the feedback object
                        choices.push(feedbackObject);
                    }
                }
            }
        }

        /**
         * Add a bucket to the feedback
         * @param bucketId the bucket id
         */

    }, {
        key: 'addBucketToFeedback',
        value: function addBucketToFeedback(bucketId) {

            // get the feedback array. each element in the array represents a bucket.
            var feedback = this.authoringComponentContent.feedback;

            if (feedback != null) {

                // create a new bucket feedback object
                var bucket = {};
                bucket.bucketId = bucketId;
                bucket.choices = [];

                // get all the choices
                var choices = this.authoringComponentContent.choices;

                // loop through all the choices and add a choice feedback object to the bucket
                for (var c = 0; c < choices.length; c++) {
                    var choice = choices[c];

                    if (choice != null) {

                        var choiceId = choice.id;
                        var feedbackText = '';
                        var isCorrect = false;

                        // create a feedback object
                        var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

                        // add the feedback object
                        bucket.choices.push(feedbackObject);
                    }
                }

                // add the feedback bucket
                feedback.push(bucket);
            }
        }

        /**
         * Create a feedback object
         * @param choiceId the choice id
         * @param feedback the feedback
         * @param isCorrect whether the choice is correct
         * @param position (optional) the position
         * @param incorrectPositionFeedback (optional) the feedback for when the
         * choice is in the correct but wrong position
         * @returns the feedback object
         */

    }, {
        key: 'createFeedbackObject',
        value: function createFeedbackObject(choiceId, feedback, isCorrect, position, incorrectPositionFeedback) {

            var feedbackObject = {};
            feedbackObject.choiceId = choiceId;
            feedbackObject.feedback = feedback;
            feedbackObject.isCorrect = isCorrect;
            feedbackObject.position = position;
            feedbackObject.incorrectPositionFeedback = incorrectPositionFeedback;

            return feedbackObject;
        }

        /**
         * Remove a choice from the feedback
         * @param choiceId the choice id to remove
         */

    }, {
        key: 'removeChoiceFromFeedback',
        value: function removeChoiceFromFeedback(choiceId) {

            // get the feedback array. each element in the array represents a bucket.
            var feedback = this.authoringComponentContent.feedback;

            if (feedback != null) {

                /*
                 * loop through each bucket feedback and remove the choice from each
                 * bucket feedback object
                 */
                for (var f = 0; f < feedback.length; f++) {
                    var bucketFeedback = feedback[f];

                    if (bucketFeedback != null) {

                        var choices = bucketFeedback.choices;

                        // loop through all the choices
                        for (var c = 0; c < choices.length; c++) {
                            var choice = choices[c];

                            if (choice != null) {
                                if (choiceId === choice.choiceId) {
                                    // we have found the choice we want to remove

                                    // remove the choice feedback object
                                    choices.splice(c, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Remove a bucket from the feedback
         * @param bucketId the bucket id to remove
         */

    }, {
        key: 'removeBucketFromFeedback',
        value: function removeBucketFromFeedback(bucketId) {

            // get the feedback array. each element in the array represents a bucket.
            var feedback = this.authoringComponentContent.feedback;

            if (feedback != null) {

                // loop through all the bucket feedback objects
                for (var f = 0; f < feedback.length; f++) {
                    var bucketFeedback = feedback[f];

                    if (bucketFeedback != null) {

                        if (bucketId === bucketFeedback.bucketId) {
                            // we have found the bucket feedback object we want to remove

                            // remove the bucket feedback object
                            feedback.splice(f, 1);
                            break;
                        }
                    }
                }
            }
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
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {

                // do nothing
                this.$rootScope.$broadcast('doneExiting');
            }));
        }
    }]);

    return MatchController;
}();

MatchController.$inject = ['$rootScope', '$scope', 'MatchService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = MatchController;

//# sourceMappingURL=matchController.js.map