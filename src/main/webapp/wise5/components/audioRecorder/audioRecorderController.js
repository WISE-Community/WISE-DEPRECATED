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
        
        // used to hold a string that declares what triggered the save
        this.saveTriggeredBy = null;
        
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
                                this.studentDataChanged();
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
            
            // set the content
            this.nodeContent = $scope.part;
            
            var componentState = null;
            
            if ($scope.partStudentData != null) {
                // set the part student data as the component state
                componentState = $scope.partStudentData;
            }
            
            // populate the student work into this node
            this.setStudentWork(componentState);
            
            // get the part
            var part = $scope.part;
            
            /*
             * register this node with the parent node which will most  
             * likely be a Questionnaire node
             */
            $scope.$parent.registerPartController($scope, part);
            
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
         * @param componentState the node state to populate into the node
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    var studentResponse = studentData.response;
                    
                    // populate the text the student previously typed
                    this.studentResponse = studentResponse;
                }
            }
        };
        
        /**
         * Called when the student clicks the save button
         */
        this.saveButtonClicked = function() {
            this.saveTriggeredBy = 'saveButton';
            
            $scope.$emit('componentSaveClicked');
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.saveTriggeredBy = 'submitButton';
            
            $scope.$emit('componentSubmitClicked');
        };
        
        /**
         * Called when the student changes their text response
         */
        this.studentDataChanged = function() {
            /*
             * set the dirty flag so we will know we need to save the 
             * student work later
             */
            this.isDirty = true;
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved
             */
            
            // get this part id
            var componentId = this.getComponentId();
            
            // create a component state populated with the student data
            var componentState = this.createComponentState();
            
            /*
             * this step is a node part so we will tell its parent that
             * the student work has changed and will need to be saved.
             * this will also notify connected parts that this part's
             * student data has changed.
             */
            $scope.$emit('partStudentDataChanged', {componentId: componentId, componentState: componentState});
        };
        
        /**
         * Get the student response
         */
        this.getStudentResponse = function() {
            return this.studentResponse;
        };
        
        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        this.createComponentState = function() {
            
            // create a new node state
            var componentState = NodeService.createNewComponentState();
            
            // get the text the student typed
            var response = this.getStudentResponse();
            
            // set the response into the node state
            var studentData = {}
            studentData.response = response;
            
            // set the student data into the component state
            componentState.studentData = studentData;
            
            if(this.saveTriggeredBy != null) {
                // set the saveTriggeredBy value
                componentState.saveTriggeredBy = this.saveTriggeredBy;
            }
            
            return componentState;
        };
        
        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        this.showSaveButton = function() {
            var show = false;
            
            if (this.nodeContent != null) {
                
                // check the showSaveButton field in the node content
                if (this.nodeContent.showSaveButton) {
                    show = true;
                }
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
         * Get the component id
         * @return the component id
         */
        this.getComponentId = function() {
            var componentId = this.nodeContent.id;
            
            return componentId;
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
            var componentState = null;
            
            if ($scope.audioRecorderController.isDirty) {
                // create a node state populated with the student data
                componentState = $scope.audioRecorderController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.audioRecorderController.isDirty = false;
            }
            
            return componentState;
        };
        
        /**
         * Listen for the 'nodeOnExit' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        $scope.$on('nodeOnExit', angular.bind(this, function(event, args) {
            
            this.recorder.close();
        }));
        
        /**
         * Listen for the 'logOut' event which is fired when the student logs
         * out of the VLE. This will perform saving when 
         */
        this.logOutListener = $scope.$on('logOut', angular.bind(this, function(event, args) {
            
        }));
        
        // perform setup of this node
        this.setup();
    });
});