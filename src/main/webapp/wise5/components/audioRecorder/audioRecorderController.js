define(['app'], function(app) {
    app.$controllerProvider.register('AudioRecorderController', 
        function($scope,
            $rootScope,
            $state, 
            $stateParams,
            AudioRecorderService,
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

        // whether the student work is for a submit
        this.isSubmit = false;

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
                this.statusMessage = 'Recording...';
                this.isRecording = true;
            } else {
                // stop recording requested
                this.recorder && this.recorder.stop();
                this.__log('Stopped recording.');
                this.statusMessage = 'Saving...';

                // convert audio to mp3 and upload to student assets
                this.recorder && this.recorder.exportMP3(angular.bind(this, function(blob) {
                    var now = new Date().getTime();

                    var mp3Name = encodeURIComponent('audio_recording_' + now + '.mp3');
                    var mp3File = new File([blob], mp3Name, {
                        lastModified: now, // optional - default = now
                        type: 'audio/mp3' // optional - default = ''
                    });

                    // Now upload the audio that was just recorded
                    StudentAssetService.uploadAsset(mp3File).then(angular.bind(this, function(studentAsset) {
                        // make a request to copy asset for reference and save for current node visit
                        StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                            if (copiedAsset != null) {
                                if (this.studentResponse == null) {
                                    this.studentResponse = [];
                                }
                                this.studentResponse.push(copiedAsset);
                                this.studentDataChanged();
                                this.statusMessage = '';
                            }
                        }));
                        $rootScope.$broadcast('studentAssetsUpdated');
                    }));
                }));
                
                this.recorder.clear();
                toggleRecordingButton.innerHTML = 'Start Recording';
                this.isRecording = false;
            }
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
            
            if (this.componentContent != null) {
                
                // get the component id
                this.componentId = this.componentContent.id;

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
                $scope.$parent.registerComponentController($scope, this.componentContent);
                
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

            // tell the parent node that this component wants to save
            $scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        };
        
        /**
         * Called when the student clicks the submit button
         */
        this.submitButtonClicked = function() {
            this.isSubmit = true;
            
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }

            // tell the parent node that this component wants to submit
            $scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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

            if (this.isSubmit) {
                // the student submitted this work
                studentData.isSubmit = this.isSubmit;

                /*
                 * reset the isSubmit value so that the next component state
                 * doesn't maintain the same value
                 */
                this.isSubmit = false;
            }
            
            // set the student data into the component state
            componentState.studentData = studentData;

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
        
        // perform setup of this component
        this.setup();
    });
});