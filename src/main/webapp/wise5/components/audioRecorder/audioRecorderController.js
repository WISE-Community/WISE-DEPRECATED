define(['app'], function(app) {
    app.$controllerProvider.register('AudioRecorderController', 
        function($scope,
            $rootScope,
            $state, 
            $stateParams,
            AudioRecorderService,
            AnnotationService,
            ConfigService,
            CurrentNodeService,
            NodeService,
            ProjectService,
            SessionService,
            StudentAssetService,
            StudentDataService) {
        
        // the node id of the current node
        this.nodeId = null;
        
        // field that will hold the node content
        this.nodeContent = null;
        
        // holds the text that the student has typed
        this.studentResponse = null;
        
        // whether the step should be disabled
        this.isDisabled = false;
        
        // whether the student work is dirty and needs saving
        this.isDirty = false;
        
        // whether this is part of another node such as a Questionnaire node
        this.isNodePart = false;
        
        // recorder object
        this.recorder;
        
        // are we currently recording?
        this.isRecording = false;
        
        this.__log = function(e, data) {
            //log.innerHTML += '\n' + e + ' ' + (data || '');
        };
        
        this.startUserMedia = function(stream) {
            this.recorder = new Recorder(stream, this);
        };
        
        this.toggleRecording = function() {
            if (!this.isRecording) {
                // start recording requested
                this.recorder && this.recorder.record();
                this.__log('Recording...');
                toggleRecordingButton.innerHTML = 'Stop Recording';
                recordingMsg.style.display = 'initial';
                this.isRecording = true;
            } else {
                // stop recording requested
                this.recorder && this.recorder.stop();
                this.__log('Stopped recording.');
                
                // convert audio to mp3 and upload to student assets
                this.recorder && this.recorder.exportMP3(angular.bind(this, function(blob) {
                    var now = new Date().getTime();

                    var mp3Name = encodeURIComponent('audio_recording_' + now + '.mp3');
                    var mp3file = new File([blob], mp3Name, {
                        lastModified: now, // optional - default = now
                        type: 'audio/mp3' // optional - default = ''
                    });
                    this.uploadAudioAsset(mp3file).then(angular.bind(this, function(mp3file) {
                        // make a request to copy asset for reference and save for current node visit
                        var mp3filename = mp3file.name;
                        var studentUploadsBaseURL = ConfigService.getStudentUploadsBaseURL();
                        var runId = ConfigService.getRunId();
                        var workgroupId = ConfigService.getWorkgroupId();
                        var assetBaseURL = studentUploadsBaseURL + '/' + runId + '/' + workgroupId + '/unreferenced/';
                        var asset = {};
                        asset.name = mp3filename;
                        asset.url = assetBaseURL + mp3filename;
                        asset.type = 'audio';
                        asset.iconURL = asset.url;
                        
                        StudentAssetService.copyAssetForReference(asset).then(angular.bind(this, function(copiedAsset) {
                            if (copiedAsset != null) {
                                if (this.studentResponse == null) {
                                    this.studentResponse = [];
                                }
                                this.studentResponse.push(copiedAsset);
                                this.studentResponseChanged();
                            }
                        }));
                        $rootScope.$broadcast('studentAssetsUpdated');
                    }, mp3file));                    
                }));
                
                this.recorder.clear();
                toggleRecordingButton.innerHTML = 'Start Recording';
                recordingMsg.style.display = 'none';
                this.isRecording = false;
            }
        };
        
        this.uploadAudioAsset = function(mp3File) {
            return StudentAssetService.uploadAsset(mp3File);
        };
        
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
                    
                    // import any work if necessary
                    this.importWork();
                    
                    // tell the parent controller that this node has loaded
                    $scope.$parent.nodeController.nodeLoaded(this.nodeId);
                    
                    // start the auto save interval
                    this.startAutoSaveInterval();
                }));
            };
            
            try {
                // webkit shim
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                navigator.getUserMedia = ( navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia);
                window.URL = window.URL || window.webkitURL;
                
                this.__log('Audio context set up.');
                this.__log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
                navigator.getUserMedia({audio: true}, angular.bind(this,this.startUserMedia), function(e) {
                    this.__log('No live audio input: ' + e);
                });
            } catch (e) {
                alert('No web audio support in this browser!');
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
                // populate the text the student previously typed
                this.studentResponse = nodeState.studentData;
            }
        };
        
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
         * Called when the student changes their text response
         */
        this.studentResponseChanged = function() {
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
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
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
            
            var nodeState = null;
            
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
                        
                        // create the node state
                        nodeState = NodeService.createNewNodeState();
                        
                        // set the values into the node state
                        nodeState.studentData = this.getStudentResponse();
                        nodeState.saveTriggeredBy = saveTriggeredBy;
                        
                        if (saveTriggeredBy === 'submitButton') {
                            nodeState.isSubmit = true;
                        } 
                        
                        // add the node state to the latest node visit
                        $scope.$parent.nodeController.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
                    }
                }
            }
            
            return nodeState;
        };
        
        /**
         * Save the node visit to the server
         */
        this.saveNodeVisitToServer = function() {
            // save the node visit to the server
            return $scope.$parent.nodeController.saveNodeVisitToServer(this.nodeId).then(angular.bind(this, function(nodeVisit) {
                
                /*
                 * set the isDirty flag to false because the student work has 
                 * been saved to the server
                 */
                this.isDirty = false;
            }));
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
         * Get the prompt to show to the student
         */
        this.getPrompt = function() {
            var prompt = null;
            
            if (this.nodeContent != null) {
                prompt = this.nodeContent.prompt;
            }
            
            return prompt;
        };
        
        /**
         * Import work from another node
         */
        this.importWork = function() {
            
            // get the node content
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                
                var importWork = nodeContent.importWork;
                
                if (importWork != null) {
                    
                    // get the latest node state for this node
                    var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
                    
                    /*
                     * we will only import work into this node if the student
                     * has not done any work for this node
                     */
                    if(nodeState == null) {
                        // the student has not done any work for this node
                        
                        var importWorkNodeId = importWork.nodeId;
                        
                        if (importWorkNodeId != null) {
                            
                            // get the node that we want to import work from
                            var importWorkNode = ProjectService.getNodeById(importWorkNodeId);
                            
                            if (importWorkNode != null) {
                                
                                // get the node type of the node we are importing from
                                var importWorkNodeType = importWorkNode.type;
                                
                                // get the latest node state from the node we are importing from
                                var importWorkNodeState = StudentDataService.getLatestNodeStateByNodeId(importWorkNodeId);
                                
                                if (importWorkNodeState != null) {
                                    /*
                                     * populate a new node state with the work from the 
                                     * imported node state
                                     */
                                    var populatedNodeState = OpenResponseService.populateNodeState(importWorkNodeState, importWorkNodeType);
                                    
                                    // populate the node state into this node
                                    this.setStudentWork(populatedNodeState);
                                }
                            }
                        }
                    }
                }
            }
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
            
            // get the text the student typed
            var studentResponse = $scope.openResponseController.studentResponse;
            
            if (studentResponse != null) {
                /*
                 * set the student response into the student data field in the
                 * student work
                 */
                studentWork.studentData = studentResponse;
            }
            
            return studentWork;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            this.recorder.close();
            
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
                    
                    /*
                     * tell the parent that this node is done performing
                     * everything it needs to do before exiting
                     */
                    $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                }
            }
        }));
        
        /**
         * Listen for the 'logOut' event which is fired when the student logs
         * out of the VLE. This will perform saving when 
         */
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            
            /*
             * Check if this node is part of another node such as a
             * Questionnaire node. If this is part of another node we do
             * not need to perform any saving because the parent will
             * handle the saving.
             */
            if (!this.isNodePart) {
                // this is a standalone node so we will save
                
                var saveTriggeredBy = 'logOut';
                
                // create and add a node state to the latest node visit
                this.createAndAddNodeState(saveTriggeredBy);
                
                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before logging out
                 */
                $scope.$parent.nodeController.nodeUnloaded(this.nodeId);
                
                // call this function to remove the listener
                this.logOutListener();
                
                /*
                 * tell the session service that this listener is done
                 * performing everything it needs to do before logging out
                 */
                SessionService.logOut();
            }
        }));
        
        // perform setup of this node
        this.setup();
    });
});