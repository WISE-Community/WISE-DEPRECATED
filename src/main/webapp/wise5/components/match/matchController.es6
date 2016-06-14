
class MatchController {
    constructor($q,
                $rootScope,
                $scope,
                MatchService,
                NodeService,
                ProjectService,
                StudentDataService,
                UtilService,
                $mdMedia) {

        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.MatchService = MatchService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.$mdMedia = $mdMedia;
        this.idToOrder = this.ProjectService.idToOrder;

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

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
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

        this.$scope.options = {
            accept: (sourceNode, destNodes, destIndex) => {
                var result = false;

                // get the value of the source node
                var data = sourceNode.$modelValue;

                // get the type of the nodes in the destination
                var destType = destNodes.$element.attr('data-type');

                if (data != null) {

                    // check if the types match
                    if (data.type === destType) {
                        // the types match so we will accept it
                        result = true
                    }
                }

                return result;
            },
            dropped: event => {
                if (event.source.nodesScope.$id !== event.dest.nodesScope.$id || event.source.index !== event.dest.index) {
                    // TODO: not sure why this check is necessary, as angular-ui-tree is not supposed to fire the dropped event unless position has changed
                    // tell the controller that the student data has changed
                    this.$scope.matchController.studentDataChanged();
                }
            }
        };

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a promise of a component state containing the student data
         */
        this.$scope.getComponentState = function(isSubmit) {
            var deferred = this.$q.defer();
            let getState = false;
            let action = 'change';

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
                this.$scope.matchController.createComponentState(action).then((componentState) => {
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
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {

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
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

            let componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId
                && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved
                this.isDirty = false;
                this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

                // set saveFailed to false because the save was successful
                this.saveFailed = false;

                let isAutoSave = componentState.isAutoSave;
                let isSubmit = componentState.isSubmit;
                let clientSaveTime = componentState.clientSaveTime;

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
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
            // do nothing
        }));

        this.$scope.$watch(function() { return $mdMedia('gt-sm'); }, function(md) {
            $scope.mdScreen = md;
        });
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    setStudentWork(componentState) {
        if (componentState != null) {

            // get the student data from the component state
            let studentData = componentState.studentData;

            if (studentData != null) {

                // get the buckets and number of submits
                let componentStateBuckets = studentData.buckets;
                let componentStateNumberOfSubmits = studentData.numberOfSubmits;

                // set the buckets
                if (componentStateBuckets != null) {
                    let bucketIds = this.buckets.map(b => { return b.id; });
                    let choiceIds = this.choices.map(c => { return c.id; });

                    for (let i = 0, l = componentStateBuckets.length; i < l; i++) {
                        let componentStateBucketId = componentStateBuckets[i].id;
                        if (componentStateBucketId !== 0) {
                            // componentState bucket is a valid bucket, so process choices
                            if (bucketIds.indexOf(componentStateBucketId) > -1) {
                                let currentBucket = componentStateBuckets[i];
                                let currentChoices = currentBucket.items;

                                for (let x = 0, len = currentChoices.length; x < len; x++) {
                                    let currentChoice = currentChoices[x];
                                    let currentChoiceId = currentChoice.id;
                                    let currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
                                    if (currentChoiceLocation > -1) {
                                        // choice is valid and used by student in a valid bucket, so add it to that bucket
                                        let bucket = this.getBucketById(componentStateBucketId);
                                        // content for choice with this id may have change, so get updated content
                                        let updatedChoice = this.getChoiceById(currentChoiceId);
                                        bucket.items.push(updatedChoice);
                                        choiceIds.splice(currentChoiceLocation, 1);
                                    }
                                }
                            }
                        }
                    }

                    // add unused choices to default choices bucket
                    let choicesBucket = this.getBucketById(0);
                    choicesBucket.items = [];
                    for (let i = 0, l = choiceIds.length; i < l; i++) {
                        choicesBucket.items.push(this.getChoiceById(choiceIds[i]));
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
    };

    /**
     * Get the latest submitted componentState and check answer for choices that haven't changed since
     * @param onload boolean whether this function is being executed on the initial component load or not
     */
    processLatestSubmit(onload) {
        let componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        let numStates = componentStates.length
        let latestSubmitState = null;

        for (let l = numStates-1; l > -1; l--) {
            let componentState = componentStates[l];
            if (componentState.isSubmit) {
                latestSubmitState = componentState;
                break;
            }
        }

        if (latestSubmitState && latestSubmitState.studentData) {
            let latestBucketIds = this.buckets.map(b => { return b.id; });
            let latestChoiceIds = this.choices.map(c => { return c.id; });
            let excludeIds = [];
            let latestSubmitStateBuckets = latestSubmitState.studentData.buckets;

            for (let b = 0, l = latestSubmitStateBuckets.length; b < l; b++) {
                let submitBucket = latestSubmitStateBuckets[b];
                let submitBucketId = submitBucket.id;

                if (latestBucketIds.indexOf(submitBucketId) > -1) {
                    let latestBucket = this.getBucketById(submitBucketId);
                    if (latestBucket) {
                        let submitChoiceIds = submitBucket.items.map(c => { return c.id; });
                        let latestBucketChoiceIds = latestBucket.items.map(c => { return c.id; });
                        for (let c = 0, len = submitChoiceIds.length; c < len; c++) {
                            let submitChoiceId = submitChoiceIds[c];
                            let latestBucketChoiceId = latestBucketChoiceIds[c];
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
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
            } else {
                // state has not changed since last submit, so set isSubmitDirty to false and notify node
                this.isSubmitDirty = false;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
            }
            this.checkAnswer(excludeIds);
        } else {
            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        }

        if (onload && numStates) {
            let latestState = componentStates[numStates-1];

            if (latestState.isSubmit) {
                // latest state is a submission, so set isSubmitDirty to false and notify node
                this.isSubmitDirty = false;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                // set save message
                this.setSaveMessage('Last submitted', latestState.clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage('Last saved', latestState.clientSaveTime);
            }
        }
    };

    /**
     * Initialize the available choices from the component content
     */
    initializeChoices() {

        this.choices = [];

        if(this.componentContent != null && this.componentContent.choices != null) {
            this.choices = this.componentContent.choices;
        }
    };

    /**
     * Get the choices
     */
    getChoices() {
        return this.choices;
    };

    /**
     * Initialize the available buckets from the component content
     */
    initializeBuckets() {

        this.buckets = [];

        if(this.componentContent != null && this.componentContent.buckets != null) {

            // get the buckets from the component content
            var buckets = this.componentContent.buckets;

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
    };

    /**
     * Get the buckets
     */
    getBuckets() {
        return this.buckets;
    };

    /**
     * Create a copy of the buckets for cases when we want to make
     * sure we don't accidentally change a bucket and have it also
     * change previous versions of the buckets.
     * @return a copy of the buckets
     */
    getCopyOfBuckets() {
        var buckets = this.getBuckets();

        // get a JSON string representation of the buckets
        var bucketsJSONString = angular.toJson(buckets);

        // turn the JSON string back into a JSON array
        var copyOfBuckets = angular.fromJson(bucketsJSONString);

        return copyOfBuckets;
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {
        this.isSubmit = false;

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        // TODO: add confirmation dialog if lock after submit is enabled on this component
        this.isSubmit = true;
        this.incrementNumberOfSubmits();

        // set saveFailed to true; will be set to false on save success response from server
        this.saveFailed = true;

        // tell the parent node that this component wants to submit
        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
    * Called when either the component or node is submitted
    */
    submit() {
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
    incrementNumberOfSubmits() {
        if (!this.saveFailed) {
            if (this.numberOfSubmits == null) {
                this.numberOfSubmits = 0;
            }

            this.numberOfSubmits++;
        }
    };

    /**
     * Check if the student has answered correctly
     * @param ids array of choice ids to exclude
     */
    checkAnswer(ids) {
        let isCorrect = true;

        // get the buckets
        let buckets = this.getBuckets();
        let excludeIds = ids ? ids : [];

        if (buckets != null) {

            // loop through all the buckets
            for(let b = 0, l = buckets.length; b < l; b++) {

                // get a bucket
                let bucket = buckets[b];

                if (bucket != null) {
                    let bucketId = bucket.id;
                    let items = bucket.items;

                    if (items != null) {

                        // loop through all the items in the bucket
                        for (let i = 0, len = items.length; i < len; i++) {
                            let item = items[i];
                            let position = i + 1;

                            if (item != null) {
                                let choiceId = item.id;

                                // get the feedback object for the bucket and choice
                                let feedbackObject = this.getFeedbackObject(bucketId, choiceId);

                                if (feedbackObject != null) {
                                    let feedback = feedbackObject.feedback;

                                    let feedbackPosition = feedbackObject.position;
                                    let feedbackIsCorrect = feedbackObject.isCorrect;

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
                                            let incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;

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
    };

    /**
     * Get the feedback object for the combination of bucket and choice
     * @param bucketId the bucket id
     * @param choiceId the choice id
     * @return the feedback object for the combination of bucket and choice
     */
    getFeedbackObject(bucketId, choiceId) {
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
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

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
        this.createComponentState(action).then((componentState) => {

            this.processLatestSubmit();
            this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
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
                        var populatedComponentState = this.MatchService.populateComponentState(importWorkComponentState);

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
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
    getStepNodeIds() {
        var stepNodeIds = this.ProjectService.getNodeIds();
        
        return stepNodeIds;
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
     * Add a choice
     */
    authoringAddChoice() {

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
    authoringAddBucket() {

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
    authoringDeleteChoice(index) {

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
    authoringDeleteBucket(index) {

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
    getChoiceById(id) {

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
     * Get the bucket by id from the authoring component content
     * @param id the bucket id
     * @returns the bucket object from the authoring component content
     */
    getBucketById(id) {

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
     * Get the choice value by id from the authoring component content
     * @param id the choice id
     * @returns the choice value from the authoring component content
     */
    getChoiceValueById(id) {

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
    getBucketValueById(id) {

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
    addChoiceToFeedback(choiceId) {

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
    addBucketToFeedback(bucketId) {

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
    createFeedbackObject(choiceId, feedback, isCorrect, position, incorrectPositionFeedback) {

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
    removeChoiceFromFeedback(choiceId) {

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
    removeBucketFromFeedback(bucketId) {

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
    setSaveMessage(message, time) {
        this.saveMessage.text = message;
        this.saveMessage.time = time;
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

MatchController.$inject = [
    '$q',
    '$rootScope',
    '$scope',
    'MatchService',
    'NodeService',
    'ProjectService',
    'StudentDataService',
    'UtilService',
    '$mdMedia'
];

export default MatchController;
