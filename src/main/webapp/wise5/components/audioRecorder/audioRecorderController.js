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
        
        // the component id of this component
        this.componentId = null;
        
        // field that will hold the component content
        this.componentContent = null;
        
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
            
            // get the component from the scope
            var component = $scope.component;
            
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
            
            // register this component with the parent node
            $scope.$parent.registerComponentController($scope, component);
            
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
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */
        this.setStudentWork = function(componentState) {
            
            if (componentState != null) {
                
                // get the student data from the component state
                var studentData = componentState.studentData;
                
                if (studentData != null) {
                    
                    // get the student response
                    var studentResponse = studentData.response;
                    
                    // set the student response into the controller
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
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
            
            $scope.$emit('componentSubmitClicked');
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
            $scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
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
            
            // create a new component state
            var componentState = NodeService.createNewComponentState();
            
            // get the text the student typed
            var response = this.getStudentResponse();
            
            // set the response into the component state
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
                            var populatedComponentState = AudioRecorderService.populateComponentState(importWorkComponentState);
                            
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
            
            if ($scope.audioRecorderController.isDirty) {
                // create a component state populated with the student data
                componentState = $scope.audioRecorderController.createComponentState();
                
                // set isDirty to false since this student work is about to be saved
                $scope.audioRecorderController.isDirty = false;
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