'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioOscillatorController = function () {
    function AudioOscillatorController($injector, $q, $rootScope, $scope, $timeout, ConfigService, NodeService, AudioOscillatorService, ProjectService, StudentAssetService, StudentDataService) {
        var _this2 = this;

        _classCallCheck(this, AudioOscillatorController);

        this.$injector = $injector;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.AudioOscillatorService = AudioOscillatorService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.idToOrder = this.ProjectService.idToOrder;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // holds the text that the student has typed
        this.studentResponse = '';

        // holds student attachments like assets
        this.attachments = [];

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // whether this component is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // the latest annotations
        this.latestAnnotations = null;

        // whether the audio is playing
        this.isPlaying = false;

        // default oscillator type to sine
        this.oscillatorType = "sine";

        // default frequency is 440
        this.frequency = 440;

        // holds the oscillator types the student can choose
        this.oscillatorTypes = [];

        // the default dimensions of the oscilloscope
        this.oscilloscopeId = 'oscilloscope';
        this.oscilloscopeWidth = 800;
        this.oscilloscopeHeight = 400;
        this.gridCellSize = 50;

        // create the audio context
        this.audioContext = new AudioContext();

        // whether we should stop drawing after a good draw
        this.stopAfterGoodDraw = true;

        this.showOscillatorTypeChooser = false;
        this.availableOscillatorTypes = ['sine', 'square', 'triangle', 'sawtooth'];
        this.oscillatorTypeToAdd = 'sine';

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

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
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
                    var _this = this;

                    // stop the audio if it is playing
                    this.stop();

                    // inject asset paths if necessary
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    // load the parameters into the component
                    this.setParametersFromComponentContent();

                    // draw the oscilloscope gride after the view has rendered
                    $timeout(function () {
                        _this.drawOscilloscopeGrid();
                    }, 0);
                }.bind(this), true);
            }

            this.oscilloscopeId = 'oscilloscope' + this.componentId;

            // load the parameters into the component
            this.setParametersFromComponentContent();

            var componentState = null;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

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
                } else if (this.componentContent.starterSentence != null) {
                    /*
                     * the student has not done any work and there is a starter sentence
                     * so we will populate the textarea with the starter sentence
                     */
                    this.studentResponse = this.componentContent.starterSentence;
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

            /*
             * draw the oscilloscope grid after angular has finished rendering
             * the view. we need to wait until after angular has set the
             * canvas width and height to draw the grid because setting the
             * dimensions of the canvas will erase it.
             */
            $timeout(function () {
                _this2.drawOscilloscopeGrid();
            }, 0);
        }

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function () {
            return this.$scope.audioOscillatorController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function (isSubmit) {
            var deferred = this.$q.defer();
            var getState = false;
            var action = 'change';

            if (isSubmit) {
                if (this.$scope.audioOscillatorController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.audioOscillatorController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.audioOscillatorController.createComponentState(action).then(function (componentState) {
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
        this.$scope.$on('nodeSubmitClicked', function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }.bind(this));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

            var componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

                var isAutoSave = componentState.isAutoSave;
                var isSubmit = componentState.isSubmit;
                var serverSaveTime = componentState.serverSaveTime;
                var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }
            }
        }));

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$scope.$on('annotationSavedToServer', function (event, args) {

            if (args != null) {

                // get the annotation that was saved to the server
                var annotation = args.annotation;

                if (annotation != null) {

                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;

                    // make sure the annotation was for this component
                    if (_this2.nodeId === annotationNodeId && _this2.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        _this2.latestAnnotations = _this2.$scope.$parent.nodeController.getLatestComponentAnnotations(_this2.componentId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', function (event, args) {
            // stop playing the audio if the student leaves the step
            this.stop();
            this.audioContext.close();
        }.bind(this));
    }

    /**
     * Load the parameters from the component content object
     */


    _createClass(AudioOscillatorController, [{
        key: 'setParametersFromComponentContent',
        value: function setParametersFromComponentContent() {
            if (this.componentContent.startingFrequency != null) {
                this.frequency = this.componentContent.startingFrequency;
            }

            if (this.componentContent.oscillatorTypes != null) {
                this.oscillatorTypes = this.componentContent.oscillatorTypes;

                if (this.componentContent.oscillatorTypes.length > 0) {
                    this.oscillatorType = this.componentContent.oscillatorTypes[0];
                }
            }

            if (this.componentContent.oscilloscopeWidth != null) {
                this.oscilloscopeWidth = this.componentContent.oscilloscopeWidth;
            }

            if (this.componentContent.oscilloscopeHeight != null) {
                this.oscilloscopeHeight = this.componentContent.oscilloscopeHeight;
            }

            if (this.componentContent.gridCellSize != null) {
                this.gridCellSize = this.componentContent.gridCellSize;
            }

            if (this.componentContent.stopAfterGoodDraw != null) {
                this.stopAfterGoodDraw = this.componentContent.stopAfterGoodDraw;
            }
        }

        /**
         * Populate the student work into the component
         * @param componentState the component state to populate into the component
         */

    }, {
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {
                var studentData = componentState.studentData;

                if (studentData != null) {
                    var response = studentData.response;

                    if (response != null) {
                        // populate the text the student previously typed
                        this.studentResponse = response;
                    }

                    var attachments = studentData.attachments;

                    if (attachments != null) {
                        this.attachments = attachments;
                    }

                    this.processLatestSubmit();
                }
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Check if latest component state is a submission and set isSubmitDirty accordingly
         */
        value: function processLatestSubmit() {
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

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
            this.isSubmit = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submit',
        value: function submit() {
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
        }
    }, {
        key: 'studentDataChanged',


        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            var _this3 = this;

            /*
             * set the dirty flags so we will know we need to save or submit the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

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
                _this3.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
            });
        }
    }, {
        key: 'getStudentResponse',


        /**
         * Get the student response
         */
        value: function getStudentResponse() {
            return this.studentResponse;
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

            // get the text the student typed
            var response = this.getStudentResponse();

            // set the response into the component state
            var studentData = {};
            studentData.response = response;
            studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

            if (this.isSubmit) {
                // the student submitted this work
                componentState.isSubmit = this.isSubmit;

                /*
                 * reset the isSubmit value so that the next component state
                 * doesn't maintain the same value
                 */
                this.isSubmit = false;
            }

            // set the student data into the component state
            componentState.studentData = studentData;

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

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // check if the parent has set this component to disabled
                if (componentContent.isDisabled) {
                    this.isDisabled = true;
                } else if (componentContent.lockAfterSubmit) {
                    // we need to lock the component after the student has submitted

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
        key: 'showPrompt',


        /**
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        value: function showPrompt() {
            return this.isPromptVisible;
        }
    }, {
        key: 'showSaveButton',


        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            return this.isSaveButtonVisible;
        }
    }, {
        key: 'showSubmitButton',


        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            return this.isSubmitButtonVisible;
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
        key: 'removeAttachment',
        value: function removeAttachment(attachment) {
            if (this.attachments.indexOf(attachment) != -1) {
                this.attachments.splice(this.attachments.indexOf(attachment), 1);
                this.studentDataChanged();
                // YOU ARE NOW FREEEEEEEEE!
            }
        }
    }, {
        key: 'attachStudentAsset',


        /**
         * Attach student asset to this Component's attachments
         * @param studentAsset
         */
        value: function attachStudentAsset(studentAsset) {
            var _this4 = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        _this4.attachments.push(attachment);
                        _this4.studentDataChanged();
                    }
                });
            }
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
        key: 'getResponse',


        /**
         * Get the text the student typed
         */
        value: function getResponse() {
            var response = null;

            if (this.studentResponse != null) {
                response = this.studentResponse;
            }

            return response;
        }
    }, {
        key: 'playStopClicked',


        /**
         * The play/stop button was clicked
         */
        value: function playStopClicked() {

            if (this.isPlaying) {
                // the audio is playing so we will now stop it
                this.stop();
            } else {
                // the audio is not playing so we will not play it
                this.play();
            }
        }
    }, {
        key: 'play',


        /**
         * Start playing the audio and draw the oscilloscope
         */
        value: function play() {

            // create the oscillator
            this.oscillator = this.audioContext.createOscillator();
            this.oscillator.type = this.oscillatorType;
            this.oscillator.frequency.value = this.frequency;

            this.gain = this.audioContext.createGain();
            this.gain.gain.value = 0.5;
            this.destination = this.audioContext.destination;
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            // connect the audio components together
            this.oscillator.connect(this.gain);
            this.gain.connect(this.destination);
            this.gain.connect(this.analyser);

            this.oscillator.start();

            /*
             * reset the goodDraw boolean value to false because we need
             * to find a good draw again
             */
            this.goodDraw = false;

            // draw the oscilloscope
            this.drawOscilloscope(this.analyser);

            this.isPlaying = true;
        }

        /**
         * Stop the audio
         */

    }, {
        key: 'stop',
        value: function stop() {
            if (this.oscillator != null) {
                this.oscillator.stop();
            }

            this.isPlaying = false;
        }

        /**
         * Draw the oscilloscope
         */

    }, {
        key: 'drawOscilloscope',
        value: function drawOscilloscope() {
            var _this5 = this;

            // get the analyser to obtain the oscillator data
            var analyser = this.analyser;

            // get the oscilloscope canvas context
            var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');

            var width = ctx.canvas.width;
            var height = ctx.canvas.height;

            // get the number of samples, this will be half the fftSize
            var bufferLength = analyser.frequencyBinCount;

            // create an array to hold the oscillator data
            var timeData = new Uint8Array(bufferLength);

            // populate the oscillator data into the timeData array
            analyser.getByteTimeDomainData(timeData);

            // draw the grid
            this.drawOscilloscopeGrid();

            // start drawing the audio signal line from the oscillator
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(0, 200, 0)'; // green
            ctx.beginPath();

            var sliceWidth = width * 1.0 / bufferLength;
            var x = 0;
            var v = 0;
            var y = 0;

            /*
             * we want to start drawing the audio signal such that the first point
             * is at 0,0 on the oscilloscope and the signal rises after that.
             * e.g. pretend the ascii below is a sine wave
             *   _      _
             *  / \    / \
             * -------------------
             *     \_/    \_/
             */
            var foundFirstRisingZeroCrossing = false;
            var firstRisingZeroCrossingIndex = null;
            var firstPointDrawn = false;

            /*
             * loop through all the points and draw the signal from the first
             * rising zero crossing to the end of the buffer
             */
            for (var i = 0; i < bufferLength; i++) {
                var currentY = timeData[i] - 128;
                var nextY = timeData[i + 1] - 128;

                // check if the current data point is the first rising zero crossing
                if (!foundFirstRisingZeroCrossing && (currentY < 0 || currentY == 0) && nextY > 0) {

                    // the point is the first rising zero crossing
                    foundFirstRisingZeroCrossing = true;
                    firstRisingZeroCrossingIndex = i;
                }

                if (foundFirstRisingZeroCrossing) {
                    /*
                     * we have found the first rising zero crossing so we can start
                     * drawing the points.
                     */

                    /*
                     * get the height of the point. we need to perform this
                     * subtraction of 128 to flip the value since canvas
                     * positioning is relative to the upper left corner being 0,0.
                     */
                    v = (128 - (timeData[i] - 128)) / 128.0;
                    y = v * height / 2;

                    if (firstPointDrawn) {
                        // this is not the first point to be drawn
                        ctx.lineTo(x, y);
                    } else {
                        // this is the first point to be drawn
                        ctx.moveTo(x, y);
                        firstPointDrawn = true;
                    }

                    // update the x position we are drawing at
                    x += sliceWidth;
                }
            }

            if (firstRisingZeroCrossingIndex > 0 && firstRisingZeroCrossingIndex < 10) {
                /*
                 * we want the first rising zero crossing index to be close to zero
                 * so that the graph spans almost the whole width of the canvas.
                 * if first rising zero crossing index was close to bufferLength
                 * then we would see a cut off graph.
                 */
                this.goodDraw = true;
            }

            // draw the lines on the canvas
            ctx.stroke();

            if (!this.stopAfterGoodDraw || this.stopAfterGoodDraw && !this.goodDraw) {
                /*
                 * the draw was not good so we will try to draw it again by
                 * sampling the oscillator again and drawing again. if the
                 * draw was good we will stop drawing.
                 */
                requestAnimationFrame(function () {
                    _this5.drawOscilloscope();
                });
            }
        }

        /**
         * Draw the oscilloscope gride
         */

    }, {
        key: 'drawOscilloscopeGrid',
        value: function drawOscilloscopeGrid() {
            // get the oscilliscope canvas context
            var ctx = document.getElementById(this.oscilloscopeId).getContext('2d');

            var width = ctx.canvas.width;
            var height = ctx.canvas.height;
            var gridCellSize = this.gridCellSize;

            // draw a white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'lightgrey';
            ctx.beginPath();

            var x = 0;

            // draw the vertical lines
            while (x < width) {

                // draw a vertical line
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);

                // move the x position to the right
                x += gridCellSize;
            }

            // start by drawing the line in the middle
            var y = height / 2;

            // draw the horizontal lines above and including the middle line
            while (y >= 0) {

                // draw a horizontal line
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);

                // move the y position up (this is up because of canvas positioning)
                y -= gridCellSize;
            }

            y = height / 2;

            // draw the horizontal lines below the middle line
            while (y <= height) {

                // draw a horizontal line
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);

                // move the y position down (this is down because of canvas positioning)
                y += gridCellSize;
            }

            // draw the lines on the canvas
            ctx.stroke();
        }

        /**
         * The oscillator type changed
         */

    }, {
        key: 'oscillatorTypeChanged',
        value: function oscillatorTypeChanged() {

            // clear the grid
            this.drawOscilloscopeGrid();

            if (this.isPlaying) {
                this.restartPlayer();
            }
        }

        /**
         * The frequency changed
         */

    }, {
        key: 'frequencyChanged',
        value: function frequencyChanged() {

            // clear the grid
            this.drawOscilloscopeGrid();

            if (this.isPlaying) {
                this.restartPlayer();
            }
        }

        /**
         * Restart the player
         */

    }, {
        key: 'restartPlayer',
        value: function restartPlayer() {
            this.stop();
            this.play();
        }

        /**
         * Show the controls for adding an oscillator type
         */

    }, {
        key: 'authoringOpenAddOscillatorType',
        value: function authoringOpenAddOscillatorType() {
            this.showOscillatorTypeChooser = true;
        }

        /**
         * The author has clicked the add button to add an oscillator type
         */

    }, {
        key: 'authoringAddOscillatorTypeClicked',
        value: function authoringAddOscillatorTypeClicked() {
            var oscillatorTypeToAdd = this.oscillatorTypeToAdd;

            if (this.authoringComponentContent.oscillatorTypes.indexOf(oscillatorTypeToAdd) != -1) {
                // the oscillator type is already in the array of oscillator types

                alert('Error: You have already added ' + oscillatorTypeToAdd);
            } else {
                // the oscillator type is not already in the array of oscillator types
                this.authoringComponentContent.oscillatorTypes.push(oscillatorTypeToAdd);

                // hide the oscillator type chooser
                this.showOscillatorTypeChooser = false;

                // perform preview updating and project saving
                this.authoringViewComponentChanged();
            }
        }

        /**
         * The author has clicked the cancel button for adding an oscillator type
         */

    }, {
        key: 'authoringCancelOscillatorTypeClicked',
        value: function authoringCancelOscillatorTypeClicked() {
            // hide the oscillator type chooser
            this.showOscillatorTypeChooser = false;
        }

        /**
         * The author has clicked the delete button for removing an oscillator type
         * @param index the index of the oscillator type to remove
         */

    }, {
        key: 'authoringDeleteOscillatorTypeClicked',
        value: function authoringDeleteOscillatorTypeClicked(index) {

            // remove the oscillator type at the given index
            this.authoringComponentContent.oscillatorTypes.splice(index, 1);

            // perform preview updating and project saving
            this.authoringViewComponentChanged();
        }

        /**
         * Import work from another component
         */

    }, {
        key: 'importWork',
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
                            var populatedComponentState = this.AudioOscillatorService.populateComponentState(importWorkComponentState);

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
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
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
                var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

                // set the new component into the controller
                this.componentContent = editedComponentContent;

                /*
                 * notify the parent node that the content has changed which will save
                 * the project to the server
                 */
                this.$scope.$parent.nodeController.authoringViewNodeChanged();
            } catch (e) {}
        }
    }, {
        key: 'authoringShowPreviousWorkNodeIdChanged',


        /**
         * The show previous work node id has changed
         */
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
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */

    }, {
        key: 'updateAdvancedAuthoringView',
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        }
    }, {
        key: 'setSaveMessage',


        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */
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
            exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
        }
    }]);

    return AudioOscillatorController;
}();

;

AudioOscillatorController.$inject = ['$injector', '$q', '$rootScope', '$scope', '$timeout', 'ConfigService', 'NodeService', 'AudioOscillatorService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = AudioOscillatorController;
//# sourceMappingURL=audioOscillatorController.js.map