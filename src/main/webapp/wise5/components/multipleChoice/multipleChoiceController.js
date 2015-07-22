define(['app'], function(app) {
    app.$controllerProvider.register('MultipleChoiceController', 
        function($rootScope,
            $scope, 
            $state, 
            $stateParams, 
            ConfigService,
            CurrentNodeService,
            MultipleChoiceService,
            NodeService,
            ProjectService, 
            SessionService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // the component id
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
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
        
        /**
         * Perform setup of the component
         */
        this.setup = function() {
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // get the component content from the scope
            this.componentContent = $scope.component;
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;

                // get the component type
                this.componentType = this.componentContent.componentType;
                
                // get the show previous work node id if it is provided
                var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;
                
                if (showPreviousWorkNodeId != null) {
                    // this component is showing previous work
                    this.isShowPreviousWork = true;
                    
                    // get the node src for the node we want previous work from
                    var nodeSrc = ProjectService.getNodeSrcByNodeId(showPreviousWorkNodeId);
                    
                    // get the show previous work component id if it is provided
                    var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;
                    
                    // get the node content for the show previous work node
                    NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(showPreviousWorkNodeContent) {
                        
                        // get the component content for the component we are showing previous work for
                        this.componentContent = NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);
                        
                        // get the component state for the show previous work
                        var componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);
                        
                        // populate the student work into this component
                        this.setStudentWork(componentState);
                        
                        // disable the component since we are just showing previous work
                        this.isDisabled = true;

                        // register this component with the parent node
                        $scope.$parent.registerComponentController($scope, this.componentContent);
                    }));
                } else {
                    // this is a regular component

                    // get the component state from the scope
                    var componentState = $scope.componentState;
                    
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
                    
                    // register this component with the parent node
                    $scope.$parent.registerComponentController($scope, this.componentContent);
                }
            }
        };
        
        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
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
                    
                    if (studentData.isSubmit) {
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
        };
        
        this.showFeedbackForChoiceIds = function(choiceIds) {
            
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
        };
        
        /**
         * Determine if the choice id has been checked
         * @param the choice id to look at
         * @return whether the choice id was checked
         */
        this.isChecked = function(choiceId) {
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
                } else if(this.isCheckbox()) {
                    // this is a checkbox step
                    
                    if (studentChoices.indexOf(choiceId) != -1) {
                        // the student checked the choice id
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        /**
         * Get the choice ids from the student data
         * @param studentData an array that contains the objects of the
         * choices the student chose
         * @return an array containing the choice id(s) the student chose
         */
        this.getChoiceIdsFromStudentData = function(studentData) {
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
        };
        
        /**
         * The student has clicked on one of the check box choices
         * @param choiceId the choice id of the checkbox the student clicked
         */
        this.toggleSelection = function(choiceId) {
            
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
                StudentDataService.saveComponentEvent(this, category, event, data);
            }
        };
        
        /**
         * Check if this multiple choice component is using radio buttons
         * @return whether this multiple choice component is using radio buttons
         */
        this.isRadio = function() {
            return this.isChoiceType('radio');
        };
        
        /**
         * Check if this multiple choice component is using checkboxes
         * @return whether this multiple choice component is using checkboxes
         */
        this.isCheckbox = function() {
            return this.isChoiceType('checkbox');
        };
        
        /**
         * Check if the component is authored to use the given choice type
         * @param choiceType the choice type ('radio' or 'checkbox')
         * @return whether the component is authored to use the given
         * choice type
         */
        this.isChoiceType = function(choiceType) {
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
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            this.saveTriggeredBy = 'saveButton';
            
            this.isSubmit = false;
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.saveTriggeredBy = 'submitButton';
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
            
            this.checkAnswer();
            
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Hide all the feedback
         */
        this.hideAllFeedback = function() {
            
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
        };
        
        /**
         * Increment the number of attempts the student has made
         */
        this.incrementNumberOfAttempts = function() {
            
            if (this.numberOfAttempts == null) {
                this.numberOfAttempts = 0;
            }
            
            this.numberOfAttempts++;
        };
        
        /**
         * Check the answer the student has submitted and display feedback
         * for the choices the student has checked
         */
        this.checkAnswer = function() {
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
                            
                            if ((isChecked && isChoiceCorrect) ||
                                    (!isChecked && !isChoiceCorrect)) {
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
        };
        
        /**
         * Get the correct choice for a radio button component
         * @return a choice id string
         */
        this.getCorrectChoice = function() {
            var correctChoice = null;
            
            if (this.componentContent != null) {
                correctChoice = this.componentContent.correctChoice;
            }
            
            return correctChoice;
        };
        
        /**
         * Get the correct choices for a checkbox component
         * @return an array of correct choice ids
         */
        this.getCorrectChoices = function() {
            var correctChoices = null;
            
            if (this.componentContent != null) {
                correctChoices = this.componentContent.correctChoices;
            }
            
            return correctChoices;
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
                
                // set the student choices into the component state
                studentData.studentChoices = this.getStudentChoiceObjects();
                
                // check if the student has answered correctly
                var hasCorrect = this.hasCorrectChoices();
                
                if (hasCorrect) {
                    /*
                     * check if the student has chosen all the correct
                     * choices
                     */
                    var isCorrect = this.isCorrect;
                    
                    // set the isCorrect value into the student data
                    studentData.isCorrect = isCorrect;
                    
                    if (this.isSubmit != null) {
                        studentData.isSubmit = this.isSubmit;
                    }
                    
                    // set the number of attempts the student has made
                    studentData.numberOfAttempts = this.numberOfAttempts;
                }
                
                componentState.studentData = studentData;
                
                if(this.saveTriggeredBy != null) {
                    // set the saveTriggeredBy value
                    componentState.saveTriggeredBy = this.saveTriggeredBy;
                }
            }
            
            return componentState;
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
         * Get the choices the student has chosen as objects. The objects
         * will contain the choice id and the choice text.
         */
        this.getStudentChoiceObjects = function() {
            var studentChoiceObjects = [];
            
            /*
             * get the choices the student has chosen. this will be an
             * array of choice ids.
             */
            var studentChoices = this.studentChoices;
            
            if (studentChoices != null) {
                
                if (this.isRadio()) {
                    // this is a radio button component
                    
                    // get the choice object
                    var choiceObject = this.getChoiceById(studentChoices);
                    
                    if (choiceObject != null) {
                        // create a student choice object and set the id and text
                        var studentChoiceObject = {};
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
                        var choiceObject = this.getChoiceById(studentChoiceId);
                        
                        if (choiceObject != null) {
                            // create a student choice object and set the id and text
                            var studentChoiceObject = {};
                            studentChoiceObject.id = choiceObject.id;
                            studentChoiceObject.text = choiceObject.text;
                            
                            // add the student choice object to our array
                            studentChoiceObjects.push(studentChoiceObject);
                        }
                    }
                }
            }
            
            return studentChoiceObjects;
        };
        
        /**
         * Check if the component has been authored with a correct choice
         * @return whether the component has been authored with a correct choice
         */
        this.hasCorrectChoices = function() {
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
        };
        
        /**
         * Get a choice object by choice id
         * @param choiceId the choice id
         * @return the choice object with the given choice id
         */
        this.getChoiceById = function(choiceId) {
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
        };
        
        /**
         * Get the choice type for this component ('radio' or 'checkbox')
         * @return the choice type for this component
         */
        this.getChoiceType = function() {
            var choiceType = null;
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                // get the choice type
                choiceType = componentContent.choiceType;
            }
            
            return choiceType;
        };
        
        /**
         * Get the available choices from component content
         * @return the available choices from the component content
         */
        this.getChoices = function() {
            var choices = null;
            
            // get the component content
            var componentContent = this.componentContent;
            
            if (componentContent != null) {
                
                // get the choices
                choices = componentContent.choices;
            }
            
            return choices;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            // check the showSaveButton field in the component content
            if (this.componentContent.showSaveButton) {
                show = true;
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
                            var populatedComponentState = MultipleChoiceService.populateComponentState(importWorkComponentState);
                            
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
         * Get the component state from this component. The parent node will 
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        $scope.getComponentState = function() {
            
            var componentState = null;
            
            if ($scope.multipleChoiceController.isDirty || $scope.multipleChoiceController.isSubmit) {
                // create a component state populated with the student data
                componentState = $scope.multipleChoiceController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.multipleChoiceController.isDirty = false;
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
        
        // perform setup of this component
        this.setup();
    });
});