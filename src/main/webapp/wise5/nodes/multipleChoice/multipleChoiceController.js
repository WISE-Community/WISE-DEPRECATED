define(['app'], function(app) {
    app.$controllerProvider.register('MultipleChoiceController', 
        function($rootScope,
            $scope, 
            $state, 
            $stateParams, 
            ConfigService,
            CurrentNodeService,
            NodeService,
            ProjectService, 
            SessionService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // holds the ids of the choices the student has chosen
        this.studentChoices = [];
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        /**
         * Perform setup of the node
         */
        this.setup = function() {
            // get the current node and node id
            var currentNode = CurrentNodeService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }
            
            // check if the node is part of another node
            if ($scope.part != null) {
                // the node is part of another node
                this.isNodePart = true;
                
                // set the content
                this.nodeContent = $scope.part;
                
                // get the latest node state
                var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                
                // populate the student work into this node
                this.setStudentWork(nodeState);
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                // get the part
                var part = $scope.part;
                
                /*
                 * register this node with the parent node which will most  
                 * likely be a Questionnaire node
                 */
                $scope.$parent.registerPartController($scope, part);
            } else {
                // this is a regular standalone node
                var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
                
                // get the node content for this node
                NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
                    
                    this.nodeContent = nodeContent;
                    
                    // get the latest node state
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    // populate the student work into this node
                    this.setStudentWork(nodeState);
                    
                    // check if we need to lock this node
                    this.calculateDisabled();
                    
                    //this.importWork();
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                    
                    // start the auto save interval
                    this.startAutoSaveInterval();
                    
                    // register this controller to listen for the exit event
                    this.registerExitListener();
                }));
            }
        };
        
        /**
         * Populate the student work into the node
         * @param nodeState the node state to populate into the node
         */
        this.setStudentWork = function(nodeState) {
            
            /*
             * check if the part student data has been passed. this will be
             * used when the node is part of a Questionnaire node
             */
            if ($scope.partStudentData != null) {
                // set the part student data as the node state
                nodeState = $scope.partStudentData;
            }
            
            if (nodeState != null) {
                // get the student data
                var studentData = nodeState.studentData;
                
                // get the choice ids the student previously chose
                var choiceIds = this.getChoiceIdsFromStudentData(studentData);
                
                // set the choice(s) the student previously chose
                if (this.isRadio()) {
                    this.studentChoices = choiceIds[0];
                } else if (this.isCheckbox()) {
                    this.studentChoices = choiceIds;
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
            
            if (studentData != null) {
                
                // loop through all the choice objects in the student data
                for (var x = 0; x < studentData.length; x++) {
                    // get a choice object
                    var studentDataChoice = studentData[x];
                    
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
                this.studentChoiceChanged();
            }
        };
        
        /**
         * Check if this multiple choice node is using radio buttons
         * @return whether this multiple choice node is using radio buttons
         */
        this.isRadio = function() {
            return this.isChoiceType('radio');
        };
        
        /**
         * Check if this multiple choice node is using checkboxes
         * @return whether this multiple choice node is using checkboxes
         */
        this.isCheckbox = function() {
            return this.isChoiceType('checkbox');
        };
        
        /**
         * Check if the node is authored to use the given choice type
         * @param choiceType the choice type ('radio' or 'checkbox')
         * @return whether the node is authored to use the given
         * choice type
         */
        this.isChoiceType = function(choiceType) {
            var result = false;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                // get the choice type from the node content
                var nodeContentChoiceType = nodeContent.choiceType;
                
                if (choiceType === nodeContentChoiceType) {
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
            var saveTriggeredBy = 'saveButton';
            
            // create and add the node state to the node visit
            this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            var saveTriggeredBy = 'submitButton';
            
            // create and add the node state to the node visit
            this.createAndAddNodeState(saveTriggeredBy);
            
            // save the node visit to the server
            this.saveNodeVisitToServer();
        };
        
        /**
         * Check if the student has answered correctly
         * @return whether the student has answered correctly
         */
        this.isCorrect = function() {
            var result = false;
            
            if (this.isRadio()) {
                // get the correct choice
                var correctChoice = this.getCorrectChoice();
                
                // check if the correct choice is chosen
                if (this.isChecked(correctChoice)) {
                    // the student has checked the correct choice
                    result = true;
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
                                break;
                            }
                        }
                    }
                    
                    result = correctSoFar;
                }
            }
            
            return result;
        };
        
        /**
         * Get the correct choice for a radio button node
         * @return a choice id string
         */
        this.getCorrectChoice = function() {
            var correctChoice = null;
            
            if (this.nodeContent != null) {
                correctChoice = this.nodeContent.correctChoice;
            }
            
            return correctChoice;
        };
        
        /**
         * Get the correct choices for a checkbox node
         * @return an array of correct choice ids
         */
        this.getCorrectChoices = function() {
            var correctChoices = null;
            
            if (this.nodeContent != null) {
                correctChoices = this.nodeContent.correctChoices;
            }
            
            return correctChoices;
        };
        
        /**
         * Called when the student changes a choice
         */
        this.studentChoiceChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            if (this.isNodePart) {
                /*
                 * this step is a node part so we will tell its parent that
                 * the student work is dirty and will need to be saved
                 */
                $scope.$emit('isDirty');
            }
        };
        
        /**
         * Create a node state and add it to the latest node visit
         * @param saveTriggeredBy the reason why we are saving a new node state
         * e.g.
         * 'autoSave'
         * 'saveButton'
         * 'submitButton'
         * 'nodeOnExit'
         * 'logOut'
         */
        this.createAndAddNodeState = function(saveTriggeredBy) {
            /*
             * check if this node is part of another node such as a
             * Questionnaire node. if it is part of a Questionnaire node
             * we do not need to create a node state or save anything
             * since the parent Questionnaire node will handle that.
             */
            if (!this.isNodePart) {
                // this is a standalone node
                
                if (saveTriggeredBy != null) {
                    
                    /*
                     * check if the save was triggered by the submit button
                     * or if the student data is dirty
                     */
                    if (saveTriggeredBy === 'submitButton' || this.isDirty) {
                        
                        // check if the student has answered correctly
                        var hasCorrect = this.hasCorrectChoices();
                        
                        // get the choices the student chose
                        var studentChoices = this.getStudentChoiceObjects();
                        
                        // create the node state
                        var nodeState = NodeService.createNewNodeState();
                        
                        //set the values into the node state
                        nodeState.studentData = studentChoices;
                        nodeState.saveTriggeredBy = saveTriggeredBy;
                        
                        if (saveTriggeredBy === 'submitButton') {
                            nodeState.isSubmit = true;
                        } 
                        
                        if (hasCorrect) {
                            /*
                             * check if the student has chosen all the correct
                             * choices
                             */
                            var isCorrect = this.isCorrect();
                            
                            // set the isCorrect value into the node state
                            nodeState.isCorrect = isCorrect;
                        }
                        
                        // add the node state to the latest node visit
                        $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                    }
                }
            }
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function() {
                
                // check if we need to lock this node
                this.calculateDisabled();
                
                /*
                 * set the isDirty flag to false because the student work has 
                 * been saved to the server
                 */
                this.isDirty = false;
            }));
        };
        
        /**
         * Check if we need to lock the node
         */
        this.calculateDisabled = function() {
            
            var nodeId = this.nodeId;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent) {
                var lockAfterSubmit = nodeContent.lockAfterSubmit;
                
                if (lockAfterSubmit) {
                    // we need to lock the step after the student has submitted
                    
                    // get the node visits for the node
                    var nodeVisits = StudentDataService.getNodeVisitsByNodeId(nodeId);
                    
                    // check if the student has ever submitted work for this node
                    var isSubmitted = NodeService.isWorkSubmitted(nodeVisits);
                    
                    if (isSubmitted) {
                        // the student has submitted work for this node
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
                    // this is a radio button node
                    
                    // get the choice object
                    var choiceObject = this.getChoiceById(studentChoices);
                    
                    // create a student choice object and set the id and text
                    var studentChoiceObject = {};
                    studentChoiceObject.id = choiceObject.id;
                    studentChoiceObject.text = choiceObject.text;
                    
                    // add the student choice object to our array
                    studentChoiceObjects.push(studentChoiceObject)
                } else if (this.isCheckbox()) {
                    // this is a checkbox node
                    
                    // loop through all the choices the student chose
                    for (var x = 0; x < studentChoices.length; x++) {
                        
                        // get a choice id that the student chose
                        var studentChoiceId = studentChoices[x];
                        
                        // get the choice object
                        var choiceObject = this.getChoiceById(studentChoiceId);
                        
                        // create a student choice object and set the id and text
                        var studentChoiceObject = {};
                        studentChoiceObject.id = choiceObject.id;
                        studentChoiceObject.text = choiceObject.text;
                        
                        // add the student choice object to our array
                        studentChoiceObjects.push(studentChoiceObject)
                    }
                }
            }
            
            return studentChoiceObjects;
        };
        
        /**
         * Check if the node has been authored with a correct choice
         * @return whether the node has been authored with a correct choice
         */
        this.hasCorrectChoices = function() {
            var result = false;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                // get the choice type
                var choiceType = nodeContent.choiceType;
                
                if (choiceType === 'radio') {
                    
                    // get the correct choice id
                    var correctChoice = nodeContent.correctChoice;
                    
                    if (correctChoice != null) {
                        result = true;
                    }
                } else if (choiceType === 'checkbox') {
                    
                    // get the correct choice ids
                    var correctChoices = nodeContent.correctChoices;
                    
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
                // get the node content
                var nodeContent = this.nodeContent;
                
                if (nodeContent != null) {
                    
                    // get the choices
                    var choices = nodeContent.choices;
                    
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
         * Get the choice type for this node ('radio' or 'checkbox')
         * @return the choice type for this node
         */
        this.getChoiceType = function() {
            var choiceType = null;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                // get the choice type
                choiceType = nodeContent.choiceType;
            }
            
            return choiceType;
        };
        
        /**
         * Get the available choices from node content
         * @return the available choices from the node content
         */
        this.getChoices = function() {
            var choices = null;
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                // get the choices
                choices = nodeContent.choices;
            }
            
            return choices;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            // check if this is a node part
            if (!this.isNodePart) {
                // this is not a node part so we will show the save button
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
            
            if (this.nodeContent != null) {
                
                // check the showSubmitButton field in the node content
                if (this.nodeContent.showSubmitButton) {
                    show = true;
                }
            }
            
            return show;
        };
        
        /**
         * Start the auto save interval for this node
         */
        this.startAutoSaveInterval = function() {
            this.autoSaveIntervalId = setInterval(angular.bind(this, function() {
                // check if the student work is dirty
                if (this.isDirty) {
                    // the student work is dirty so we will save
                    
                    var saveTriggeredBy = 'autoSave';
                    
                    // create and add a node state to the node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // save the node visit to the server
                    this.saveNodeVisitToServer();
                }
            }), $scope.$parent.nodeController.autoSaveInterval);
        };
        
        /**
         * Stop the auto save interval for this node
         */
        this.stopAutoSaveInterval = function() {
            clearInterval(this.autoSaveIntervalId);
        };
        
        /**
         * Get the student work object that will contain the student
         * work for the node. This is only used when this node is
         * part of another node such as a Questionnaire node.
         * The Questionnaire node will call this function to obtain
         * the student work.
         * @return an object containing the student work
         */
        $scope.getStudentWorkObject = function() {
            var studentWork = {};
            
            // get the choice objects the student chose
            var studentChoices = $scope.multipleChoiceController.getStudentChoiceObjects();
            
            /*
             * set the choice objects into the student data field in the
             * student work
             */
            studentWork.studentData = studentChoices;
            
            return studentWork;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            /*
             * Check if this node is part of another node such as a
             * Questionnaire node. If this is part of another node we do
             * not need to perform any saving because the parent will
             * handle the saving.
             */
            if (!this.isNodePart) {
                // this is a standalone node so we will save
                
                // get the node that is exiting
                var nodeToExit = args.nodeToExit;
                
                /*
                 * make sure the node id of the node that is exiting is
                 * this node
                 */
                if (nodeToExit.id === this.nodeId) {
                    var saveTriggeredBy = 'nodeOnExit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                }
            }
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
                
                /*
                 * Check if this node is part of another node such as a
                 * Questionnaire node. If this is part of another node we do
                 * not need to perform any saving because the parent will
                 * handle the saving.
                 */
                if (!this.isNodePart) {
                    // this is a standalone node so we will save
                    
                    var saveTriggeredBy = 'exit';
                    
                    // create and add a node state to the latest node visit
                    this.createAndAddNodeState(saveTriggeredBy);
                    
                    // stop the auto save interval for this node
                    this.stopAutoSaveInterval();
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                    
                    // call this function to remove the listener
                    this.exitListener();
                    
                    /*
                     * tell the session service that this listener is done
                     * performing everything it needs to do before exiting
                     */
                    $rootScope.$broadcast('doneExiting');
                }
            }));
        };
        
        // perform setup of this node
        this.setup();
    });
});