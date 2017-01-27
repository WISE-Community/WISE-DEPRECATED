'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iframeResizer = require('iframe-resizer');

var _iframeResizer2 = _interopRequireDefault(_iframeResizer);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EmbeddedController = function () {
    function EmbeddedController($filter, $injector, $q, $scope, $sce, $window, AnnotationService, ConfigService, NodeService, NotebookService, EmbeddedService, ProjectService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, EmbeddedController);

        this.$filter = $filter;
        this.$injector = $injector;
        this.$q = $q;
        this.$scope = $scope;
        this.$sce = $sce;
        this.$window = $window;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.EmbeddedService = EmbeddedService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;

        this.$translate = this.$filter('translate');

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // field that will hold the component type
        this.componentType = null;

        // the url to the web page to display
        this.url = null;

        // the width of the iframe (optional)
        this.width = null;

        // the height of the iframe (optional)
        this.height = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;

        // whether we have data to save
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // whether the snip model button is shown or not
        this.isSnipModelButtonVisible = true;

        // the label for the notebook in thos project
        this.notebookConfig = this.NotebookService.getNotebookConfig();

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // the latest annotations
        this.latestAnnotations = null;

        // variable to store component states (from application)
        this.componentState = null;

        // the id of the embedded application's iframe
        this.embeddedApplicationIFrameId = '';

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the advanced authoring textarea is displayed
        this.showAdvancedAuthoring = false;

        this.messageEventListener = angular.bind(this, function (messageEvent) {
            // handle messages received from iframe
            var messageEventData = messageEvent.data;
            if (messageEventData.messageType === "event") {
                // save event to WISE
                var nodeId = this.nodeId;
                var componentId = this.componentId;
                var componentType = this.componentType;
                var category = messageEventData.eventCategory;
                var event = messageEventData.event;
                var eventData = messageEventData.eventData;

                // save notebook open/close event
                this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
            } else if (messageEventData.messageType === "studentWork") {
                // save student work to WISE
                // create a new component state
                this.componentState = this.NodeService.createNewComponentState();

                // set the student data into the component state
                this.componentState.studentData = messageEventData.studentData;

                this.componentState.isSubmit = false;
                if (messageEventData.isSubmit) {
                    this.componentState.isSubmit = messageEventData.isSubmit;
                }

                this.componentState.isAutoSave = false;
                if (messageEventData.isAutoSave) {
                    this.componentState.isAutoSave = messageEventData.isAutoSave;
                }

                this.isDirty = true;

                // the student data in the model has changed
                this.studentDataChanged(messageEventData.studentData);

                // tell the parent node that this component wants to save
                this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
            } else if (messageEventData.messageType === "applicationInitialized") {
                // application has finished loading, so send latest component state to application
                this.sendLatestWorkToApplication();
                this.processLatestSubmit();

                // activate iframe-resizer on the embedded app's iframe
                $('#' + this.embeddedApplicationIFrameId).iFrameResize({ scrolling: true });
            } else if (messageEventData.messageType === "componentDirty") {
                var _isDirty = messageEventData.isDirty;

                // set component dirty to true/false and notify node
                this.isDirty = _isDirty;
                this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: _isDirty });
            } else if (messageEventData.messageType === "componentSubmitDirty") {
                var isSubmitDirty = messageEventData.isDirty;

                // set component submit dirty to true/false and notify node
                this.isSubmitDirty = isSubmitDirty;
                this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: isDirty });
            } else if (messageEventData.messageType === "studentDataChanged") {
                this.studentDataChanged(messageEventData.studentData);
            } else if (messageEventData.messageType === "getStudentWork") {
                // the embedded application is requesting the student work

                // get the student work
                var studentWork = this.getStudentWork();

                var message = studentWork;
                message.messageType = 'studentWork';

                // send the student work to the embedded application
                this.sendMessageToApplication(message);
            }
        });

        // listen for message events from embedded iframe application
        this.$window.addEventListener('message', this.messageEventListener);

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

            // id of the iframe that embeds the application
            this.embeddedApplicationIFrameId = "componentApp_" + this.componentId;

            this.componentType = this.componentContent.type;

            if (this.mode === 'student') {
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                this.isSnipModelButtonVisible = true;
            } else if (this.mode === 'authoring') {
                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // set the rubric summernote options
                this.summernoteRubricOptions = {
                    height: 300,
                    disableDragAndDrop: true
                };

                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.setURL(this.componentContent.url);
                }.bind(this), true);
            } else if (this.mode === 'grading') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'onlyShowWork') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;
            } else if (this.mode === 'showPreviousWork') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;
            }

            if (this.componentContent != null) {
                // set the url
                this.setURL(this.componentContent.url);
            }

            // get the width
            this.width = this.componentContent.width ? this.componentContent.width : "100%";

            // get the height
            this.height = this.componentContent.height ? this.componentContent.height : "100%";

            // get the max width
            this.maxWidth = this.componentContent.maxWidth ? this.componentContent.maxWidth : "none";

            // get the max height
            this.maxHeight = this.componentContent.maxHeight ? this.componentContent.maxHeight : "none";

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', function (event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (_this.nodeId === nodeId) {
                _this.isSubmit = true;
            }

            // get the student work
            var studentWork = _this.getStudentWork();

            var message = studentWork;
            message.messageType = 'nodeSubmitClicked';

            // send the student data to the embedded application
            _this.sendMessageToApplication(message);
        });

        this.$scope.$on('studentWorkSavedToServer', function (event, args) {

            var componentState = args.studentWork;

            if (componentState != null) {
                if (componentState.componentId === _this.componentId) {
                    // a component state for this component was saved

                    // set isDirty to false because the component state was just saved and notify node
                    _this.isDirty = false;
                    _this.$scope.$emit('componentDirty', { componentId: _this.componentId, isDirty: false });

                    // clear out current componentState
                    _this.$scope.embeddedController.componentState = null;

                    var isAutoSave = componentState.isAutoSave;
                    var isSubmit = componentState.isSubmit;
                    var serverSaveTime = componentState.serverSaveTime;
                    var clientSaveTime = _this.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // set save message
                    if (isSubmit) {
                        _this.setSaveMessage(_this.$translate('SUBMITTED'), clientSaveTime);

                        _this.submit();

                        // set isSubmitDirty to false because the component state was just submitted and notify node
                        _this.isSubmitDirty = false;
                        _this.$scope.$emit('componentSubmitDirty', { componentId: _this.componentId, isDirty: false });
                    } else if (isAutoSave) {
                        _this.setSaveMessage(_this.$translate('AUTO_SAVED'), clientSaveTime);
                    } else {
                        _this.setSaveMessage(_this.$translate('SAVED'), clientSaveTime);
                    }

                    // Tell application that this componentState was successfully saved to server;
                    // include saved state and updated save message
                    var successMessage = {
                        messageType: "componentStateSaved",
                        componentState: componentState,
                        saveMessage: _this.saveMessage
                    };
                    _this.sendMessageToApplication(successMessage);

                    // clear out componentState
                    _this.componentState = {};
                }
            }

            // get the student work
            var studentWork = _this.getStudentWork();

            var message = studentWork;
            message.messageType = 'studentWork';

            // send the student work to the embedded application
            _this.sendMessageToApplication(message);
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
                if (this.$scope.embeddedController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.embeddedController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.embeddedController.createComponentState(action).then(function (componentState) {
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
                    if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

                        // get latest score and comment annotations for this component
                        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {
            // unregister messageEventListener
            this.$window.removeEventListener('message', this.messageEventListener);
        }));
    }

    /**
     * Check if latest component state is a submission and if not, set isSubmitDirty to true
     */


    _createClass(EmbeddedController, [{
        key: 'processLatestSubmit',
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
                    this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
                } else {
                    // latest state is not a submission, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                    // set save message
                    this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
                }
            }
        }
    }, {
        key: 'setURL',


        /**
         * Set the url
         * @param url the url
         */
        value: function setURL(url) {
            if (url != null) {
                var trustedURL = this.$sce.trustAsResourceUrl(url);
                this.url = trustedURL;
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
        value: function studentDataChanged(data) {
            var _this2 = this;

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

            // remember the student data
            this.studentData = data;

            // create a component state populated with the student data
            this.createComponentState(action).then(function (componentState) {
                _this2.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
            });
        }
    }, {
        key: 'createComponentState',


        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        value: function createComponentState(action) {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

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
            componentState.studentData = this.studentData;

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
    }, {
        key: 'sendLatestWorkToApplication',
        value: function sendLatestWorkToApplication() {
            // get the latest component state from the scope
            var message = {
                messageType: "componentState",
                componentState: this.$scope.componentState
            };

            // send the latest component state to embedded application
            this.sendMessageToApplication(message);
        }
    }, {
        key: 'sendMessageToApplication',
        value: function sendMessageToApplication(message) {
            // send the message to embedded application via postMessage
            window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.postMessage(message, "*");
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
                var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

                // replace the component in the project
                this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

                // set the new component into the controller
                this.componentContent = editedComponentContent;

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
        key: 'snipModel',


        /**
         * Snip the model by converting it to an image
         * @param $event the click event
         */
        value: function snipModel($event) {
            var _this3 = this;

            // get the iframe
            var iframe = $('#componentApp_' + this.componentId);

            if (iframe != null && iframe.length > 0) {

                //get the html from the iframe
                var modelElement = iframe.contents().find('html');

                if (modelElement != null && modelElement.length > 0) {
                    modelElement = modelElement[0];

                    // convert the model element to a canvas element
                    (0, _html2canvas2.default)(modelElement).then(function (canvas) {

                        // get the canvas as a base64 string
                        var img_b64 = canvas.toDataURL('image/png');

                        // get the image object
                        var imageObject = _this3.UtilService.getImageObjectFromBase64String(img_b64);

                        // create a notebook item with the image populated into it
                        _this3.NotebookService.addNewItem($event, imageObject);
                    });
                }
            }
        }

        /**
         * Check whether we need to show the snip model button
         * @return whether to show the snip model button
         */

    }, {
        key: 'showSnipModelButton',
        value: function showSnipModelButton() {
            if (this.NotebookService.isNotebookEnabled() && this.isSnipModelButtonVisible) {
                return true;
            } else {
                return false;
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
            this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
        }
    }, {
        key: 'isApplicationNode',


        /**
         * Check if a node is a step node
         * @param nodeId the node id to check
         * @returns whether the node is an application node
         */
        value: function isApplicationNode(nodeId) {
            var result = this.ProjectService.isApplicationNode(nodeId);

            return result;
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
         * The show previous work checkbox was clicked
         */

    }, {
        key: 'authoringShowPreviousWorkClicked',
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
                    var answer = confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'));

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
         * Check if a component generates student work
         * @param component the component
         * @return whether the component generates student work
         */

    }, {
        key: 'componentHasWork',
        value: function componentHasWork(component) {
            var result = true;

            if (component != null) {
                result = this.ProjectService.componentHasWork(component);
            }

            return result;
        }

        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */

    }, {
        key: 'isLockAfterSubmit',
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

        /**
         * Called when the student clicks the save button
         */

    }, {
        key: 'saveButtonClicked',
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
        key: 'getStudentWork',


        /**
         * Get the student work from the components in this node and potentially
         * from other components
         * @return an object containing work from the components in this node and
         * potentially from other components
         */
        value: function getStudentWork() {

            var studentWork = {};

            // get the latest component states from this node
            var studentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
            studentWork.studentWorkFromThisNode = studentWorkFromThisNode;

            /*
             * this is an array that contains objects with a nodeId and componentId
             * fields. this specifies what student data we need to obtain.
             */
            var getStudentWorkFromOtherComponents = this.componentContent.getStudentWorkFromOtherComponents;

            if (getStudentWorkFromOtherComponents != null) {
                var studentWorkFromOtherComponents = [];

                // loop through all the objects
                for (var c = 0; c < getStudentWorkFromOtherComponents.length; c++) {
                    var otherComponent = getStudentWorkFromOtherComponents[c];

                    if (otherComponent != null) {

                        // get the node id and component id
                        var tempNodeId = otherComponent.nodeId;
                        var tempComponentId = otherComponent.componentId;

                        if (tempNodeId != null) {

                            if (tempComponentId != null) {

                                // get the latest component state for the given component
                                var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);

                                if (tempComponentState == null) {
                                    /*
                                     * there is no component state for the component
                                     * so we will just add an object with a node id field
                                     * and component id field and no other fields to show
                                     * that there is no student data for the component.
                                     */
                                    tempComponentState = {};
                                    tempComponentState.nodeId = tempNodeId;
                                    tempComponentState.componentId = tempComponentId;
                                }

                                // add the component state to the array
                                studentWorkFromOtherComponents.push(tempComponentState);
                            }
                        }
                    }
                }

                studentWork.studentWorkFromOtherComponents = studentWorkFromOtherComponents;
            }

            return studentWork;
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

        /**
         * The author has changed the rubric
         */

    }, {
        key: 'summernoteRubricHTMLChanged',
        value: function summernoteRubricHTMLChanged() {

            // get the summernote rubric html
            var html = this.summernoteRubricHTML;

            /*
             * remove the absolute asset paths
             * e.g.
             * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
             * will be changed to
             * <img src='sun.png'/>
             */
            html = this.ConfigService.removeAbsoluteAssetPaths(html);

            /*
             * replace <a> and <button> elements with <wiselink> elements when
             * applicable
             */
            html = this.UtilService.insertWISELinks(html);

            // update the component rubric
            this.authoringComponentContent.rubric = html;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }]);

    return EmbeddedController;
}();

EmbeddedController.$inject = ['$filter', '$injector', '$q', '$scope', '$sce', '$window', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'EmbeddedService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedController;
//# sourceMappingURL=embeddedController.js.map