'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _drawingTool = require('lib/drawingTool/drawing-tool');

var _drawingTool2 = _interopRequireDefault(_drawingTool);

var _vendor = require('lib/drawingTool/vendor.min');

var _vendor2 = _interopRequireDefault(_vendor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DrawController = function () {
    function DrawController($injector, $q, $rootScope, $scope, $timeout, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, DrawController);

        this.$injector = $injector;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ConfigService = ConfigService;
        this.DrawService = DrawService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
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

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the reset button is visible or not
        this.isResetButtonVisible = false;

        // whether the snip drawing button is shown or not
        this.isSnipDrawingButtonVisible = true;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // whether this part is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // will hold the drawing tool object
        this.drawingTool = null;

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

        this.latestConnectedComponentState = null;
        this.latestConnectedComponentParams = null;

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // get the component type
            this.componentType = this.componentContent.type;

            if (this.mode === "student") {
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                this.isResetButtonVisible = true;

                this.drawingToolId = "drawingtool_" + this.nodeId + "_" + this.componentId;

                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
            } else if (this.mode === 'grading' || this.mode === "onlyShowWork") {
                // get the component state from the scope
                var componentState = this.$scope.componentState;
                if (componentState != null) {
                    this.drawingToolId = "drawingtool_" + componentState.id;
                }
                this.isSnipDrawingButtonVisible = false;
            } else if (this.mode === 'showPreviousWork') {
                // get the component state from the scope
                var componentState = this.$scope.componentState;
                if (componentState != null) {
                    this.drawingToolId = "drawingtool_" + componentState.id;
                }
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipDrawingButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                this.drawingToolId = "drawingtool_" + this.nodeId + "_" + this.componentId;
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            this.$timeout(angular.bind(this, function () {
                // running this in side a timeout ensures that the code only runs after the markup is rendered.
                // maybe there's a better way to do this, like with an event?

                // initialize the drawing tool
                this.drawingTool = new DrawingTool("#" + this.drawingToolId, {
                    stamps: this.componentContent.stamps || {},
                    parseSVG: true
                });
                var state = null;
                $("#set-background").on("click", angular.bind(this, function () {
                    this.drawingTool.setBackgroundImage($("#background-src").val());
                }));
                $("#resize-background").on("click", angular.bind(this, function () {
                    this.drawingTool.resizeBackgroundToCanvas();
                }));
                $("#resize-canvas").on("click", angular.bind(this, function () {
                    this.drawingTool.resizeCanvasToBackground();
                }));
                $("#shrink-background").on("click", angular.bind(this, function () {
                    this.drawingTool.shrinkBackgroundToCanvas();
                }));
                $("#clear").on("click", angular.bind(this, function () {
                    this.drawingTool.clear(true);
                }));
                $("#save").on("click", angular.bind(this, function () {
                    state = _drawingTool2.default.save();
                    $("#load").removeAttr("disabled");
                }));
                $("#load").on("click", angular.bind(this, function () {
                    if (state === null) return;
                    this.drawingTool.load(state);
                }));

                var componentState = null;

                // get the component state from the scope
                componentState = this.$scope.componentState;

                // set whether studentAttachment is enabled
                this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                if (this.componentContent.background != null) {
                    // set the background from the component content
                    this.drawingTool.setBackgroundImage(this.componentContent.background);
                }

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
                if (this.$scope.$parent && this.$scope.$parent.registerComponentController) {
                    this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                }

                // listen for the drawing changed event
                this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));

                // listen for selected tool changed event
                this.drawingTool.on('tool:changed', function (toolName) {
                    // log this event
                    var category = "Tool";
                    var event = "toolSelected";
                    var data = {};
                    data.selectedToolName = toolName;
                    this.StudentDataService.saveComponentEvent(this, category, event, data);
                }.bind(this));

                if (this.mode === 'grading' || this.mode === 'onlyShowWork') {
                    // we're in show student work mode, so hide the toolbar and make the drawing non-editable
                    $(".dt-tools").hide();
                }

                // show or hide the draw tools
                this.setupTools();
            }));
        }

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
                if (this.$scope.drawController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.drawController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.drawController.createComponentState(action).then(function (componentState) {
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

            // check if the component state is from a connected component
            if (this.ProjectService.isConnectedComponent(this.nodeId, this.componentId, componentState.componentId)) {

                // get the connected component params
                var connectedComponentParams = this.ProjectService.getConnectedComponentParams(this.componentContent, componentState.componentId);

                if (connectedComponentParams != null) {

                    if (connectedComponentParams.updateOn === 'save' || connectedComponentParams.updateOn === 'submit' && componentState.isSubmit) {

                        var performUpdate = false;

                        /*
                         * make a copy of the component state so we don't accidentally
                         * change any values in the referenced object
                         */
                        componentState = this.UtilService.makeCopyOfJSONObject(componentState);

                        /*
                         * check if the the canvas is empty which means the student has
                         * not drawn anything yet
                         */
                        if (this.isCanvasEmpty()) {
                            performUpdate = true;
                        } else {
                            /*
                             * the student has drawn on the canvas so we
                             * will ask them if they want to update it
                             */
                            var answer = confirm('Do you want to update the connected drawing?');

                            if (answer) {
                                // the student answered yes
                                performUpdate = true;
                            }
                        }

                        if (performUpdate) {

                            if (!connectedComponentParams.includeBackground) {
                                // remove the background from the draw data
                                this.DrawService.removeBackgroundFromComponentState(componentState);
                            }

                            // update the draw data
                            this.setDrawData(componentState);

                            // the table has changed
                            this.$scope.drawController.isDirty = true;
                            this.$scope.drawController.isSubmitDirty = true;
                        }

                        /*
                         * remember the component state and connected component params
                         * in case we need to use them again later
                         */
                        this.latestConnectedComponentState = componentState;
                        this.latestConnectedComponentParams = connectedComponentParams;
                    }
                }
            }
        }));

        /*
         * Listen for the requestImage event which is fired when something needs
         * an image representation of the student data from a specific
         * component.
         */
        this.$scope.$on('requestImage', function (event, args) {
            // get the node id and component id from the args
            var nodeId = args.nodeId;
            var componentId = args.componentId;

            // check if the image is being requested from this component
            if (_this.nodeId === nodeId && _this.componentId === componentId) {

                // obtain the image blob
                var imageObject = _this.getImageObject();

                if (imageObject != null) {
                    var args = {};
                    args.nodeId = nodeId;
                    args.componentId = componentId;
                    args.imageObject = imageObject;

                    // fire an event that contains the image object
                    _this.$scope.$emit('requestImageCallback', args);
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));
    } // end of constructor

    /**
     * Setup the tools that we will make available to the student
     */


    _createClass(DrawController, [{
        key: 'setupTools',
        value: function setupTools() {

            // get the tools values from the authored content
            var tools = this.componentContent.tools;

            if (tools == null) {
                // we will display all the tools
            } else {
                    // we will only display the tools the authored specified to show

                    // the title for the select button
                    var selectTitle = "Select tool";

                    if (tools.select) {
                        $('#' + this.componentId).find('[title="' + selectTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + selectTitle + '"]').hide();
                    }

                    // the title for the line button
                    var lineTitle = "Line tool (click and hold to show available line types)";

                    if (tools.line) {
                        $('#' + this.componentId).find('[title="' + lineTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + lineTitle + '"]').hide();
                    }

                    // the title for the shape button
                    var shapeTitle = "Basic shape tool (click and hold to show available shapes)";

                    if (tools.shape) {
                        $('#' + this.componentId).find('[title="' + shapeTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + shapeTitle + '"]').hide();
                    }

                    // the title for the free hand button
                    var freeHandTitle = "Free hand drawing tool";

                    if (tools.freeHand) {
                        $('#' + this.componentId).find('[title="' + freeHandTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + freeHandTitle + '"]').hide();
                    }

                    // the title for the text button
                    var textTitle = "Text tool (click and hold to show available font sizes)";

                    if (tools.text) {
                        $('#' + this.componentId).find('[title="' + textTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + textTitle + '"]').hide();
                    }

                    // the title for the stamp button
                    var stampTitle = "Stamp tool (click and hold to show available categories)";

                    if (tools.stamp) {
                        $('#' + this.componentId).find('[title="' + stampTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + stampTitle + '"]').hide();
                    }

                    // the title for the clone button
                    var cloneTitle = "Clone tool";

                    if (tools.clone) {
                        $('#' + this.componentId).find('[title="' + cloneTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + cloneTitle + '"]').hide();
                    }

                    // the title for the stroke color button
                    var strokeColorTitle = "Stroke color (click and hold to show available colors)";

                    if (tools.strokeColor) {
                        $('#' + this.componentId).find('[title="' + strokeColorTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + strokeColorTitle + '"]').hide();
                    }

                    // the title for the fill color button
                    var fillColorTitle = "Fill color (click and hold to show available colors)";

                    if (tools.fillColor) {
                        $('#' + this.componentId).find('[title="' + fillColorTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + fillColorTitle + '"]').hide();
                    }

                    // the title for the stroke width button
                    var strokeWidthTitle = "Stroke width (click and hold to show available options)";

                    if (tools.strokeWidth) {
                        $('#' + this.componentId).find('[title="' + strokeWidthTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + strokeWidthTitle + '"]').hide();
                    }

                    // the title for the send back button
                    var sendBackTitle = "Send selected objects to back";

                    if (tools.sendBack) {
                        $('#' + this.componentId).find('[title="' + sendBackTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + sendBackTitle + '"]').hide();
                    }

                    // the title for the send forward button
                    var sendForwardTitle = "Send selected objects to front";

                    if (tools.sendForward) {
                        $('#' + this.componentId).find('[title="' + sendForwardTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + sendForwardTitle + '"]').hide();
                    }

                    // the title for the undo button
                    var undoTitle = "Undo";

                    if (tools.undo) {
                        $('#' + this.componentId).find('[title="' + undoTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + undoTitle + '"]').hide();
                    }

                    // the title for the redo button
                    var redoTitle = "Redo";

                    if (tools.redo) {
                        $('#' + this.componentId).find('[title="' + redoTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + redoTitle + '"]').hide();
                    }

                    // the title for the delete button
                    var deleteTitle = "Delete selected objects";

                    if (tools.delete) {
                        $('#' + this.componentId).find('[title="' + deleteTitle + '"]').show();
                    } else {
                        $('#' + this.componentId).find('[title="' + deleteTitle + '"]').hide();
                    }
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

                // set the draw data
                this.setDrawData(componentState);

                /*
                 * check if the latest component state is a submit and perform
                 * any necessary processing
                 */
                this.processLatestSubmit();
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Check if latest component state is a submission and set isSubmitDirty accordingly
         */
        value: function processLatestSubmit() {
            var latestState = this.$scope.componentState;

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
        key: 'resetButtonClicked',


        /**
         * The reset button was clicked
         */
        value: function resetButtonClicked() {

            // ask the student if they are sure they want to clear the drawing
            var result = confirm('Are you sure you want to clear your drawing?');

            if (result) {
                // clear the drawing
                this.drawingTool.clear();

                // check if we need to reload student data from a connected component
                var latestConnectedComponentState = this.latestConnectedComponentState;
                var latestConnectedComponentParams = this.latestConnectedComponentParams;

                if (latestConnectedComponentState && latestConnectedComponentParams) {
                    // reload the student data from the connected component
                    this.setDrawData(latestConnectedComponentState, latestConnectedComponentParams);
                }
            }
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
            var _this2 = this;

            /*
             * set the dirty flag so we will know we need to save the
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

                // get the draw JSON string
                var studentDataJSONString = this.getDrawData();

                // set the draw JSON string into the draw data
                studentData.drawData = studentDataJSONString;

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

            if (this.mode === 'showStudentWorkOnly') {
                // distable saving if we're in showStudentWorkOnly mode
                this.isDisabled = true;
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
        key: 'attachStudentAsset',


        /**
         * Add student asset images as objects in the drawing canvas
         * @param studentAsset
         */
        value: function attachStudentAsset(studentAsset) {
            var _this3 = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        fabric.Image.fromURL(copiedAsset.url, function (oImg) {
                            oImg.scaleToWidth(200); // set max width and have height scale proportionally
                            // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
                            //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
                            //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
                            //oImg.center();
                            oImg.studentAssetId = copiedAsset.id; // keep track of this asset id
                            _this3.drawingTool.canvas.add(oImg); // add copied asset image to canvas
                        });
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
        key: 'getDrawData',


        /**
         * Get the draw data
         * @return the draw data from the drawing tool as a JSON string
         */
        value: function getDrawData() {
            var drawData = null;

            drawData = this.drawingTool.save();

            return drawData;
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
                            var populatedComponentState = this.DrawService.populateComponentState(importWorkComponentState);

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
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
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
         * Get the image object representation of the student data
         * @returns an image object
         */

    }, {
        key: 'getImageObject',
        value: function getImageObject() {
            var pngFile = null;

            if (this.drawingTool != null && this.drawingTool.canvas != null) {

                // get the image as a base64 string
                var img_b64 = this.drawingTool.canvas.toDataURL('image/png');

                // get the image object
                pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
            }

            return pngFile;
        }

        /**
         * Set the draw data
         * @param componentState the component state
         */

    }, {
        key: 'setDrawData',
        value: function setDrawData(componentState) {
            if (componentState != null) {

                // get the student data from the component state
                var studentData = componentState.studentData;

                if (studentData != null) {

                    // get the draw data
                    var drawData = studentData.drawData;

                    if (drawData != null) {
                        // set the draw data into the drawing tool
                        this.drawingTool.load(drawData);
                    }
                }
            }
        }

        /**
         * Check if the student has drawn anything
         * @returns whether the canvas is empty
         */

    }, {
        key: 'isCanvasEmpty',
        value: function isCanvasEmpty() {

            var result = true;

            if (this.drawingTool != null && this.drawingTool.canvas != null) {

                // get the objects in the canvas where the student draws
                var objects = this.drawingTool.canvas.getObjects();

                if (objects != null && objects.length > 0) {
                    // there are objects in the canvas
                    result = false;
                }
            }

            return result;
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
        key: 'showSnipDrawingButton',


        /**
         * Check whether we need to show the snip drawing button
         * @return whether to show the snip drawing button
         */
        value: function showSnipDrawingButton() {
            return this.isSnipDrawingButtonVisible;
        }

        /**
         * Snip the drawing by converting it to an image
         * @param $event the click event
         */

    }, {
        key: 'snipDrawing',
        value: function snipDrawing($event) {

            // get the canvas element
            var canvas = angular.element('#' + this.componentId + ' canvas');

            if (canvas != null && canvas.length > 0) {

                // get the top canvas
                canvas = canvas[0];

                // get the canvas as a base64 string
                var img_b64 = canvas.toDataURL('image/png');

                // get the image object
                var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

                // create a notebook item with the image populated into it
                this.NotebookService.addNewItem($event, imageObject);
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

                this.$rootScope.$broadcast('doneExiting');
            }));
        }
    }]);

    return DrawController;
}();

DrawController.$inject = ['$injector', '$q', '$rootScope', '$scope', '$timeout', 'ConfigService', 'DrawService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawController;
//# sourceMappingURL=drawController.js.map