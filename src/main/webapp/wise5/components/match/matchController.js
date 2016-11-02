'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MatchController = function () {
    function MatchController($injector, $q, $rootScope, $scope, dragulaService, ConfigService, MatchService, NodeService, ProjectService, StudentDataService, UtilService, $mdMedia) {
        var _this = this;

        _classCallCheck(this, MatchController);

        this.$injector = $injector;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.dragulaService = dragulaService;
        this.ConfigService = ConfigService;
        this.MatchService = MatchService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.$mdMedia = $mdMedia;
        this.idToOrder = this.ProjectService.idToOrder;
        this.autoScroll = require('dom-autoscroller');

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

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

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

        // the flex (%) width for displaying the buckets
        this.bucketWidth = 100;

        // the number of columns for displaying the choices
        this.choiceColumns = 1;

        // whether to orient the choices and buckets side-by-side
        this.horizontal = false;

        // css style for the choice items
        this.choiceStyle = '';

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

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
            this.horizontal = this.componentContent.horizontal;

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

                    /*
                     * initialize the choices and buckets with the values from the
                     * component content
                     */
                    this.initializeChoices();
                    this.initializeBuckets();
                }.bind(this), true);
            }

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

        var dragId = 'match_' + this.componentId;
        // handle choice drop events
        var dropEvent = dragId + '.drop-model';
        this.$scope.$on(dropEvent, function (e, el, container, source) {
            // choice item has been dropped in new location, so run studentDataChanged function
            _this.$scope.matchController.studentDataChanged();
        });

        // drag and drop options
        this.dragulaService.options(this.$scope, dragId, {
            moves: function moves(el, source, handle, sibling) {
                return !_this.$scope.matchController.isDisabled;
            }
        });

        // provide visual indicator when choice is dragged over a new bucket
        var drake = dragulaService.find(this.$scope, dragId).drake;
        drake.on('over', function (el, container, source) {
            if (source !== container) {
                container.className += ' match-bucket__contents--over';
            }
        }).on('out', function (el, container, source) {
            if (source !== container) {
                container.className = container.className.replace('match-bucket__contents--over', '');;
            }
        });

        // support scroll while dragging
        var scroll = this.autoScroll([document.querySelector('#content')], {
            margin: 30,
            pixels: 50,
            scrollWhenOutside: true,
            autoScroll: function autoScroll() {
                // Only scroll when the pointer is down, and there is a child being dragged
                return this.down && drake.dragging;
            }
        });

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
                if (this.$scope.matchController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.matchController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.matchController.createComponentState(action).then(function (componentState) {
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
                this.incrementNumberOfSubmits();

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

                // set isDirty to false because the component state was just saved
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
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
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

        this.$scope.$watch(function () {
            return $mdMedia('gt-sm');
        }, function (md) {
            $scope.mdScreen = md;
        });
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
                        var bucketIds = this.buckets.map(function (b) {
                            return b.id;
                        });
                        var choiceIds = this.choices.map(function (c) {
                            return c.id;
                        });

                        for (var i = 0, l = componentStateBuckets.length; i < l; i++) {
                            var componentStateBucketId = componentStateBuckets[i].id;
                            if (componentStateBucketId !== 0) {
                                // componentState bucket is a valid bucket, so process choices
                                if (bucketIds.indexOf(componentStateBucketId) > -1) {
                                    var currentBucket = componentStateBuckets[i];
                                    var currentChoices = currentBucket.items;

                                    for (var x = 0, len = currentChoices.length; x < len; x++) {
                                        var currentChoice = currentChoices[x];
                                        var currentChoiceId = currentChoice.id;
                                        var currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
                                        if (currentChoiceLocation > -1) {
                                            // choice is valid and used by student in a valid bucket, so add it to that bucket
                                            var bucket = this.getBucketById(componentStateBucketId);
                                            // content for choice with this id may have change, so get updated content
                                            var updatedChoice = this.getChoiceById(currentChoiceId);
                                            bucket.items.push(updatedChoice);
                                            choiceIds.splice(currentChoiceLocation, 1);
                                        }
                                    }
                                }
                            }
                        }

                        // add unused choices to default choices bucket
                        var choicesBucket = this.getBucketById(0);
                        choicesBucket.items = [];
                        for (var _i = 0, _l = choiceIds.length; _i < _l; _i++) {
                            choicesBucket.items.push(this.getChoiceById(choiceIds[_i]));
                        }
                    }

                    // set the number of submits
                    if (componentStateNumberOfSubmits) {
                        this.numberOfSubmits = componentStateNumberOfSubmits;
                    }

                    if (this.numberOfSubmits > 0) {
                        componentState.isSubmit ? this.checkAnswer() : this.processLatestSubmit(true);
                    } else {
                        this.processLatestSubmit(true);
                    }
                }
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Get the latest submitted componentState and check answer for choices that haven't changed since
         * @param onload boolean whether this function is being executed on the initial component load or not
         */
        value: function processLatestSubmit(onload) {
            var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
            var numStates = componentStates.length;
            var latestSubmitState = null;

            for (var l = numStates - 1; l > -1; l--) {
                var componentState = componentStates[l];
                if (componentState.isSubmit) {
                    latestSubmitState = componentState;
                    break;
                }
            }

            if (latestSubmitState && latestSubmitState.studentData) {
                var latestBucketIds = this.buckets.map(function (b) {
                    return b.id;
                });
                var latestChoiceIds = this.choices.map(function (c) {
                    return c.id;
                });
                var excludeIds = [];
                var latestSubmitStateBuckets = latestSubmitState.studentData.buckets;

                for (var b = 0, _l2 = latestSubmitStateBuckets.length; b < _l2; b++) {
                    var submitBucket = latestSubmitStateBuckets[b];
                    var submitBucketId = submitBucket.id;

                    if (latestBucketIds.indexOf(submitBucketId) > -1) {
                        var latestBucket = this.getBucketById(submitBucketId);
                        if (latestBucket) {
                            var submitChoiceIds = submitBucket.items.map(function (c) {
                                return c.id;
                            });
                            var latestBucketChoiceIds = latestBucket.items.map(function (c) {
                                return c.id;
                            });
                            for (var c = 0, len = submitChoiceIds.length; c < len; c++) {
                                var submitChoiceId = submitChoiceIds[c];
                                var latestBucketChoiceId = latestBucketChoiceIds[c];
                                if (submitChoiceId !== latestBucketChoiceId) {
                                    excludeIds.push(submitChoiceId);
                                }
                            }
                        }
                    }
                }

                if (excludeIds.length) {
                    // state has changed since last submit, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                } else {
                    // state has not changed since last submit, so set isSubmitDirty to false and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                }
                this.checkAnswer(excludeIds);
            } else {
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
            }

            if (onload && numStates) {
                var latestState = componentStates[numStates - 1];

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

                if (this.horizontal) {
                    this.bucketWidth = 100;
                    this.choiceColumns = 1;
                } else {
                    if (this.componentContent.bucketWidth) {
                        this.bucketWidth = this.componentContent.bucketWidth;
                        this.choiceColumns = Math.round(100 / this.componentContent.bucketWidth);
                    } else {
                        var n = buckets.length;
                        if (n % 3 === 0 || n > 4) {
                            this.bucketWidth = Math.round(100 / 3);
                            this.choiceColumns = 3;
                        } else if (n % 2 === 0) {
                            this.bucketWidth = 100 / 2;
                            this.choiceColumns = 2;
                        }
                    }

                    this.choiceStyle = {
                        '-moz-column-count': this.choiceColumns,
                        '-webkit-column-count': this.choiceColumns,
                        'column-count': this.choiceColumns
                    };
                }

                /*
                 * create a bucket that will contain the choices when
                 * the student first starts working
                 */
                var originBucket = {};
                originBucket.id = 0;
                originBucket.value = this.componentContent.choicesLabel ? this.componentContent.choicesLabel : 'Choices';
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
            // TODO: add confirmation dialog if lock after submit is enabled on this component
            this.isSubmit = true;
            this.incrementNumberOfSubmits();

            // set saveFailed to true; will be set to false on save success response from server
            this.saveFailed = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submit',


        /**
        * Called when either the component or node is submitted
        */
        value: function submit() {
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }

            // check if the student answered correctly
            this.processLatestSubmit();
        }

        /**
         * Increment the number of attempts the student has made
         */

    }, {
        key: 'incrementNumberOfSubmits',
        value: function incrementNumberOfSubmits() {
            if (!this.saveFailed) {
                if (this.numberOfSubmits == null) {
                    this.numberOfSubmits = 0;
                }

                this.numberOfSubmits++;
            }
        }
    }, {
        key: 'checkAnswer',


        /**
         * Check if the student has answered correctly
         * @param ids array of choice ids to exclude
         */
        value: function checkAnswer(ids) {
            var isCorrect = true;

            // get the buckets
            var buckets = this.getBuckets();
            var excludeIds = ids ? ids : [];

            if (buckets != null) {

                // loop through all the buckets
                for (var b = 0, l = buckets.length; b < l; b++) {

                    // get a bucket
                    var bucket = buckets[b];

                    if (bucket != null) {
                        var bucketId = bucket.id;
                        var items = bucket.items;

                        if (items != null) {

                            // loop through all the items in the bucket
                            for (var i = 0, len = items.length; i < len; i++) {
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
                                        if (feedback) {
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

                                    if (excludeIds.indexOf(choiceId) > -1) {
                                        // don't show feedback for choices that should be excluded
                                        item.feedback = null;
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
            var _this2 = this;

            /*
             * set the dirty flag so we will know we need to save the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

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

                _this2.processLatestSubmit();
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
                            var populatedComponentState = this.MatchService.populateComponentState(importWorkComponentState);

                            /*
                             * update the choice ids so that it uses the choice ids
                             * from this component. we need to do this because the choice
                             * ids are likely to be different. we update the choice ids
                             * by matching the choice text.
                             */
                            this.updateIdsFromImportedWork(populatedComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'updateIdsFromImportedWork',


        /**
         * Update the choice ids and bucket ids to use the ids from this component.
         * We will use the choice text and bucket text to perform matching.
         * @param componentState the component state
         */
        value: function updateIdsFromImportedWork(componentState) {

            if (componentState != null) {

                // get the student data
                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the buckets from the student data
                    var studentBuckets = studentData.buckets;

                    if (studentBuckets != null) {

                        // loop through all the student buckets
                        for (var b = 0; b < studentBuckets.length; b++) {

                            // get a student bucket
                            var studentBucket = studentBuckets[b];

                            if (studentBucket != null) {

                                // get the text of the student bucket
                                var tempStudentBucketText = studentBucket.value;

                                // get the bucket from this component that has the matching text
                                var bucket = this.getBucketByText(tempStudentBucketText);

                                if (bucket != null) {
                                    // change the id of the student bucket
                                    studentBucket.id = bucket.id;
                                }

                                // get the choices the student put into this bucket
                                var studentChoices = studentBucket.items;

                                if (studentChoices != null) {

                                    // loop through the choices in the bucket
                                    for (var c = 0; c < studentChoices.length; c++) {

                                        // get a student choice
                                        var studentChoice = studentChoices[c];

                                        if (studentChoice != null) {

                                            // get the text of the student choice
                                            var tempStudentChoiceText = studentChoice.value;

                                            // get the choice from this component that has the matching text
                                            var choice = this.getChoiceByText(tempStudentChoiceText);

                                            if (choice != null) {
                                                // change the id of the student choice
                                                studentChoice.id = choice.id;
                                            }
                                        }
                                    }
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
                var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

                // set the new authoring component content
                this.authoringComponentContent = authoringComponentContent;

                // set the component content
                this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

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
                    var answer = confirm('Are you sure you want to change this component type?');

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
         * Add a choice
         */

    }, {
        key: 'authoringAddChoice',
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
            var choices = this.componentContent.choices;

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
         * Get the choice by text
         * @param text look for a choice with this text
         * @returns the choice with the given text
         */

    }, {
        key: 'getChoiceByText',
        value: function getChoiceByText(text) {

            var choice = null;

            if (text != null) {

                // get the choices from the component content
                var choices = this.componentContent.choices;

                if (choices != null) {

                    // loop through all the choices
                    for (var c = 0; c < choices.length; c++) {
                        var tempChoice = choices[c];

                        if (tempChoice != null) {
                            if (text == tempChoice.value) {
                                // we have found the choice we want
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
         * Get the bucket by id from the authoring component content
         * @param id the bucket id
         * @returns the bucket object from the authoring component content
         */

    }, {
        key: 'getBucketById',
        value: function getBucketById(id) {

            var bucket = null;

            // get the buckets
            var buckets = this.buckets ? this.buckets : this.authoringComponentContent.buckets;

            // loop through the buckets
            for (var b = 0; b < buckets.length; b++) {
                var tempBucket = buckets[b];

                if (tempBucket != null) {
                    if (id === tempBucket.id) {
                        // we have found the bucket we want
                        bucket = tempBucket;
                        break;
                    }
                }
            }

            return bucket;
        }

        /**
         * Get the bucket by text
         * @param text look for a bucket with this text
         * @returns the bucket with the given text
         */

    }, {
        key: 'getBucketByText',
        value: function getBucketByText(text) {

            var bucket = null;

            if (text != null) {

                // get the buckets from the component content
                var buckets = this.componentContent.buckets;

                if (buckets != null) {

                    // loop throgh all the buckets
                    for (var b = 0; b < buckets.length; b++) {
                        var tempBucket = buckets[b];

                        if (tempBucket != null) {
                            if (text == tempBucket.value) {
                                // we have found the bucket we want
                                bucket = tempBucket;
                                break;
                            }
                        }
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
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {

                // do nothing
                this.$rootScope.$broadcast('doneExiting');
            }));
        }
    }, {
        key: 'componentHasWork',


        /**
         * Check if a component generates student work
         * @param component the component
         * @return whether the component generates student work
         */
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
    }]);

    return MatchController;
}();

MatchController.$inject = ['$injector', '$q', '$rootScope', '$scope', 'dragulaService', 'ConfigService', 'MatchService', 'NodeService', 'ProjectService', 'StudentDataService', 'UtilService', '$mdMedia'];

exports.default = MatchController;
//# sourceMappingURL=matchController.js.map