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
    function DrawController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, DrawController);

        this.$filter = $filter;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.DrawService = DrawService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

        this.$translate = this.$filter('translate');

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

        // counter to keep track of the number of submits
        this.submitCounter = 0;

        // flag for whether to show the advanced authoring
        this.showAdvancedAuthoring = false;

        // whether the JSON authoring is displayed
        this.showJSONAuthoring = false;

        // whether the reset button is visible or not
        this.isResetButtonVisible = false;

        // whether the snip drawing button is shown or not
        this.isSnipDrawingButtonVisible = true;

        // the label for the notebook in thos project
        this.notebookConfig = this.NotebookService.getNotebookConfig();

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

        // the default width and height of the canvas
        this.width = 800;
        this.height = 600;

        if (this.componentContent.width != null) {
            this.width = this.componentContent.width;
        }

        if (this.componentContent.height != null) {
            this.height = this.componentContent.height;
        }

        // the options for when to update this component from a connected component
        this.connectedComponentUpdateOnOptions = [{
            value: 'change',
            text: 'Change'
        }, {
            value: 'submit',
            text: 'Submit'
        }];

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
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'grading' || this.mode === "onlyShowWork") {
                // get the component state from the scope
                var componentState = this.$scope.componentState;
                if (componentState != null) {
                    this.drawingToolId = "drawingtool_" + componentState.id;
                }
                this.isSnipDrawingButtonVisible = false;

                if (this.mode === 'grading') {
                    // get the latest annotations
                    this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                }
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
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                this.isResetButtonVisible = true;

                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('INSERT_ASSET');

                /*
                 * create the custom button for inserting WISE assets into
                 * summernote
                 */
                var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

                /*
                 * the options that specifies the tools to display in the
                 * summernote prompt
                 */
                this.summernoteRubricOptions = {
                    toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertAssetButton: InsertAssetButton
                    }
                };

                this.drawingToolId = "drawingtool_" + this.nodeId + "_" + this.componentId;
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.submitCounter = 0;
                    this.initializeDrawingTool();
                    this.isSaveButtonVisible = this.componentContent.showSaveButton;
                    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                }.bind(this), true);
            }

            // running this in side a timeout ensures that the code only runs after the markup is rendered.
            // maybe there's a better way to do this, like with an event?
            this.$timeout(angular.bind(this, this.initializeDrawingTool));
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

                // trigger the submit
                var submitTriggeredBy = 'nodeSubmitButton';
                this.submit(submitTriggeredBy);
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
                    this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

                    this.lockIfNecessary();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
                } else {
                    this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
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
                            var answer = confirm(this.$translate('draw.doYouWantToUpdateTheConnectedDrawing'));

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
        this.$scope.$on('exitNode', angular.bind(this, function (event, args) {}));

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', function (event, args) {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'prompt') {
                                // the target is the summernote prompt element
                                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
                            } else if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
                            } else if (args.target == 'background') {
                                // the target is the background image

                                // set the background file name
                                _this.authoringComponentContent.background = fileName;

                                /*
                                 * the authoring view background has changed so we will
                                 * perform any changes if needed and then save the project
                                 */
                                _this.authoringViewBackgroundChanged();
                            }

                            if (summernoteId != '') {
                                if (_this.UtilService.isImage(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // add the image html
                                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                } else if (_this.UtilService.isVideo(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // insert the video element
                                    var videoElement = document.createElement('video');
                                    videoElement.controls = 'true';
                                    videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                    $('#' + summernoteId).summernote('insertNode', videoElement);
                                }
                            }
                        }
                    }
                }
            }

            // close the popup
            _this.$mdDialog.hide();
        });
    } // end of constructor

    /**
     * Initialize the drawing tool
     */


    _createClass(DrawController, [{
        key: 'initializeDrawingTool',
        value: function initializeDrawingTool() {

            this.drawingTool = new DrawingTool("#" + this.drawingToolId, {
                stamps: this.componentContent.stamps || {},
                parseSVG: true,
                width: this.width,
                height: this.height
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

            if (componentState == null) {
                /*
                 * only import work or use starter draw data if the student
                 * does not already have work for this component
                 */

                // check if we need to import work
                var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

                // get the starter draw data if any
                var starterDrawData = this.componentContent.starterDrawData;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

                    if (this.componentContent.background != null) {
                        // set the background from the component content
                        this.drawingTool.setBackgroundImage(this.componentContent.background);
                    }

                    // import the work from the other component
                    this.importWork();
                } else if (starterDrawData != null) {
                    // there is starter draw data so we will populate it into the draw tool
                    this.drawingTool.load(starterDrawData);

                    if (this.componentContent.background != null) {
                        // set the background from the component content
                        this.drawingTool.setBackgroundImage(this.componentContent.background);
                    }
                } else {
                    if (this.componentContent.background != null) {
                        // set the background from the component content
                        this.drawingTool.setBackgroundImage(this.componentContent.background);
                    }
                }
            } else {
                // populate the student work into this component
                this.setStudentWork(componentState);
            }

            // check if the student has used up all of their submits
            if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
                /*
                 * the student has used up all of their chances to submit so we
                 * will disable the submit button
                 */
                this.isSubmitButtonDisabled = true;
            }

            // check if we need to lock this component
            this.calculateDisabled();

            // register this component with the parent node
            if (this.$scope.$parent && this.$scope.$parent.nodeController != null) {
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
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
        }

        /**
         * Setup the tools that we will make available to the student
         */

    }, {
        key: 'setupTools',
        value: function setupTools() {

            // get the tools values from the authored content
            var tools = this.componentContent.tools;

            if (tools == null) {
                // we will display all the tools
            } else {
                // we will only display the tools the authored specified to show

                // the title for the select button
                var selectTitle = this.$translate('draw.selectToolTooltip');

                if (tools.select) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + selectTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + selectTitle + '"]').hide();
                }

                // the title for the line button
                var lineTitle = this.$translate('draw.lineToolTooltip');

                if (tools.line) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + lineTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + lineTitle + '"]').hide();
                }

                // the title for the shape button
                var shapeTitle = this.$translate('draw.shapeToolTooltip');

                if (tools.shape) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + shapeTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + shapeTitle + '"]').hide();
                }

                // the title for the free hand button
                var freeHandTitle = this.$translate('draw.freeHandToolTooltip');

                if (tools.freeHand) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + freeHandTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + freeHandTitle + '"]').hide();
                }

                // the title for the text button
                var textTitle = this.$translate('draw.textToolTooltip');

                if (tools.text) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + textTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + textTitle + '"]').hide();
                }

                // the title for the stamp button
                var stampTitle = this.$translate('draw.stampToolTooltip');

                if (tools.stamp) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + stampTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + stampTitle + '"]').hide();
                }

                // the title for the clone button
                var cloneTitle = this.$translate('draw.cloneToolTooltip');

                if (tools.clone) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + cloneTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + cloneTitle + '"]').hide();
                }

                // the title for the stroke color button
                var strokeColorTitle = this.$translate('draw.strokeColorToolTooltip');

                if (tools.strokeColor) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + strokeColorTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + strokeColorTitle + '"]').hide();
                }

                // the title for the fill color button
                var fillColorTitle = this.$translate('draw.fillColorToolTooltip');

                if (tools.fillColor) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + fillColorTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + fillColorTitle + '"]').hide();
                }

                // the title for the stroke width button
                var strokeWidthTitle = this.$translate('draw.strokeWidthToolTooltip');

                if (tools.strokeWidth) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + strokeWidthTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + strokeWidthTitle + '"]').hide();
                }

                // the title for the send back button
                var sendBackTitle = this.$translate('draw.sendBackToolTooltip');

                if (tools.sendBack) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + sendBackTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + sendBackTitle + '"]').hide();
                }

                // the title for the send forward button
                var sendForwardTitle = this.$translate('draw.sendForwardToolTooltip');

                if (tools.sendForward) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + sendForwardTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + sendForwardTitle + '"]').hide();
                }

                // the title for the undo button
                var undoTitle = this.$translate('draw.undo');

                if (tools.undo) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + undoTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + undoTitle + '"]').hide();
                }

                // the title for the redo button
                var redoTitle = this.$translate('draw.redo');

                if (tools.redo) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + redoTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + redoTitle + '"]').hide();
                }

                // the title for the delete button
                var deleteTitle = this.$translate('draw.deleteToolTooltip');

                if (tools.delete) {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + deleteTitle + '"]').show();
                } else {
                    $('#drawingtool_' + this.nodeId + '_' + this.componentId).find('[title="' + deleteTitle + '"]').hide();
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
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

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
            // trigger the submit
            var submitTriggeredBy = 'componentSubmitButton';
            this.submit(submitTriggeredBy);
        }
    }, {
        key: 'submit',


        /**
         * A submit was triggered by the component submit button or node submit button
         * @param submitTriggeredBy what triggered the submit
         * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
         */
        value: function submit(submitTriggeredBy) {

            if (this.isSubmitDirty) {
                // the student has unsubmitted work

                var performSubmit = true;

                if (this.componentContent.maxSubmitCount != null) {
                    // there is a max submit count

                    // calculate the number of submits this student has left
                    var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

                    var message = '';

                    if (numberOfSubmitsLeft <= 0) {
                        // the student does not have any more chances to submit
                        performSubmit = false;
                    } else if (numberOfSubmitsLeft == 1) {
                        /*
                         * the student has one more chance to submit left so maybe
                         * we should ask the student if they are sure they want to submit
                         */
                    } else if (numberOfSubmitsLeft > 1) {
                        /*
                         * the student has more than one chance to submit left so maybe
                         * we should ask the student if they are sure they want to submit
                         */
                    }
                }

                if (performSubmit) {

                    /*
                     * set isSubmit to true so that when the component state is
                     * created, it will know that is a submit component state
                     * instead of just a save component state
                     */
                    this.isSubmit = true;

                    // increment the submit counter
                    this.incrementSubmitCounter();

                    // check if the student has used up all of their submits
                    if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
                        /*
                         * the student has used up all of their submits so we will
                         * disable the submit button
                         */
                        this.isSubmitButtonDisabled = true;
                    }

                    if (this.mode === 'authoring') {
                        /*
                         * we are in authoring mode so we will set values appropriately
                         * here because the 'componentSubmitTriggered' event won't
                         * work in authoring mode
                         */
                        this.isDirty = false;
                        this.isSubmitDirty = false;
                        this.createComponentState('submit');
                    }

                    if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
                        // tell the parent node that this component wants to submit
                        this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
                    } else if (submitTriggeredBy === 'nodeSubmitButton') {
                        // nothing extra needs to be performed
                    }
                } else {
                    /*
                     * the student has cancelled the submit so if a component state
                     * is created, it will just be a regular save and not submit
                     */
                    this.isSubmit = false;
                }
            }
        }

        /**
         * Increment the submit counter
         */

    }, {
        key: 'incrementSubmitCounter',
        value: function incrementSubmitCounter() {
            this.submitCounter++;
        }

        /**
         * The reset button was clicked
         */

    }, {
        key: 'resetButtonClicked',
        value: function resetButtonClicked() {

            // ask the student if they are sure they want to clear the drawing
            var result = confirm(this.$translate('draw.areYouSureYouWantToClearYourDrawing'));

            if (result) {
                // clear the drawing
                this.drawingTool.clear();

                if (this.latestConnectedComponentState && this.latestConnectedComponentParams) {
                    // reload the student data from the connected component
                    this.setDrawData(latestConnectedComponentState, latestConnectedComponentParams);
                } else if (this.componentContent.importPreviousWorkNodeId != null && this.componentContent.importPreviousWorkNodeId != '' && this.componentContent.importPreviousWorkComponentId != null && this.componentContent.importPreviousWorkComponentId != '') {

                    // this component imports work from another component

                    // boolean flag to overwrite the work when we import
                    var overwrite = true;

                    // import work from another component
                    this.importWork(overwrite);
                } else if (this.componentContent.starterDrawData != null) {
                    // this component has starter draw data

                    // there is starter draw data so we will populate it into the draw tool
                    this.drawingTool.load(this.componentContent.starterDrawData);
                }

                if (this.componentContent.background != null && this.componentContent.background != '') {
                    // set the background
                    this.drawingTool.setBackgroundImage(this.componentContent.background);
                }
            }
        }
    }, {
        key: 'lockIfNecessary',
        value: function lockIfNecessary() {
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
                _this2.$scope.$emit('componentStudentDataChanged', { nodeId: _this2.nodeId, componentId: componentId, componentState: componentState });
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

            var deferred = this.$q.defer();

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            var studentData = {};

            // get the draw JSON string
            var studentDataJSONString = this.getDrawData();

            // set the draw JSON string into the draw data
            studentData.drawData = studentDataJSONString;

            // set the submit counter
            studentData.submitCounter = this.submitCounter;

            // set the flag for whether the student submitted this work
            componentState.isSubmit = this.isSubmit;

            // set the student data into the component state
            componentState.studentData = studentData;

            /*
             * reset the isSubmit value so that the next component state
             * doesn't maintain the same value
             */
            this.isSubmit = false;

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
         * @param overwrite boolean value whether to import the work even if the
         * student already has work for this component
         */
        value: function importWork(overwrite) {
            var _this4 = this;

            // get the component content
            var componentContent = this.componentContent;

            if (componentContent != null) {

                // get the import previous work node id and component id
                var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

                if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

                    /*
                     * check if the node id is in the field that we used to store
                     * the import previous work node id in
                     */
                    if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
                        importPreviousWorkNodeId = componentContent.importWorkNodeId;
                    }
                }

                if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

                    /*
                     * check if the component id is in the field that we used to store
                     * the import previous work component id in
                     */
                    if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
                        importPreviousWorkComponentId = componentContent.importWorkComponentId;
                    }
                }

                if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

                    // get the latest component state for this component
                    var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                    /*
                     * we will only import work into this component if the student
                     * has not done any work for this component
                     */
                    if (componentState == null || overwrite == true) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

                        if (importWorkComponentState != null) {

                            if (importWorkComponentState.componentType == 'ConceptMap') {

                                var conceptMapData = null;

                                if (importWorkComponentState.studentData != null) {
                                    // get the concept map data from the other component state
                                    conceptMapData = importWorkComponentState.studentData.conceptMapData;
                                }

                                if (conceptMapData != null) {
                                    var serviceName = 'ConceptMapService';

                                    if (this.$injector.has(serviceName)) {

                                        // get the ConceptMapService
                                        var service = this.$injector.get(serviceName);

                                        // create an image from the concept map data
                                        service.createImage(conceptMapData, componentContent.width, componentContent.height).then(function (image) {

                                            // set the image as the background
                                            _this4.drawingTool.setBackgroundImage(image);

                                            // make the work dirty so that it gets saved
                                            _this4.studentDataChanged();
                                        });
                                    }
                                }
                            } else {
                                /*
                                 * populate a new component state with the work from the
                                 * imported component state
                                 */
                                var populatedComponentState = this.DrawService.populateComponentState(importWorkComponentState);

                                // populate the component state into this component
                                this.setStudentWork(populatedComponentState);

                                if (this.componentContent.background != null && this.componentContent.background != '') {
                                    // set the background
                                    this.drawingTool.setBackgroundImage(this.componentContent.background);

                                    // make the work dirty so that it gets saved
                                    this.studentDataChanged();
                                }
                            }
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
        key: 'authoringShowPreviousWorkClicked',


        /**
         * The show previous work checkbox was clicked
         */
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

                    var submitCounter = studentData.submitCounter;

                    if (submitCounter != null) {
                        // populate the submit counter
                        this.submitCounter = submitCounter;
                    }

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
            if (this.NotebookService.isNotebookEnabled() && this.isSnipDrawingButtonVisible) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Snip the drawing by converting it to an image
         * @param $event the click event
         */

    }, {
        key: 'snipDrawing',
        value: function snipDrawing($event) {

            // get the canvas element
            var canvas = angular.element('#drawingtool_' + this.nodeId + '_' + this.componentId + ' canvas');

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
    }, {
        key: 'componentHasWork',


        /**
         * Check if a component generates student work
         * @param component the component
         * @return whether the component generates student work
         */
        value: function componentHasWork(component) {
            var result = true;

            if (component != null) {
                result = this.ProjectService.componentHasWork(component);
            }

            return result;
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
         * Add a stamp in the authoring
         */

    }, {
        key: 'authoringAddStampButtonClicked',
        value: function authoringAddStampButtonClicked() {

            // create the stamps field in the content if it does not exist
            if (this.authoringComponentContent != null) {

                // create a stamps object if it does not exist
                if (this.authoringComponentContent.stamps == null) {
                    this.authoringComponentContent.stamps = {};
                }

                // create the Stamps array if it does not exist
                if (this.authoringComponentContent.stamps.Stamps == null) {
                    this.authoringComponentContent.stamps.Stamps = [];
                }
            }

            /*
             * create the stamp as an empty string that the author will replace
             * with a file name or url
             */
            this.authoringComponentContent.stamps.Stamps.push('');

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Move a stamp up in the authoring view
         * @param index the index of the stamp
         */

    }, {
        key: 'authoringStampUpClicked',
        value: function authoringStampUpClicked(index) {

            // check if the stamp is not already at the top
            if (index != 0) {
                // the stamp is not at the top

                // get the stamp string
                var stamp = this.authoringComponentContent.stamps.Stamps[index];

                // remove the stamp
                this.authoringComponentContent.stamps.Stamps.splice(index, 1);

                // insert the stamp back into the array
                this.authoringComponentContent.stamps.Stamps.splice(index - 1, 0, stamp);

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Move the stamp down in the authoring view
         * @param index the index of the stamp
         */

    }, {
        key: 'authoringStampDownClicked',
        value: function authoringStampDownClicked(index) {

            // check if the stamp is already at the bottom
            if (index != this.authoringComponentContent.stamps.Stamps.length - 1) {
                // the stamp is not at the bottom

                // get the stamp string
                var stamp = this.authoringComponentContent.stamps.Stamps[index];

                // remove the stamp
                this.authoringComponentContent.stamps.Stamps.splice(index, 1);

                // insert the stamp back into the array
                this.authoringComponentContent.stamps.Stamps.splice(index + 1, 0, stamp);

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Delete a stamp from the authoring view
         * @param index the index of the stamp
         */

    }, {
        key: 'authoringDeleteStampClicked',
        value: function authoringDeleteStampClicked(index) {

            // ask the author if they are sure they want to delete the stamp
            var answer = confirm(this.$translate('draw.areYouSureYouWantToDeleteThisStamp') + '\n\n' + this.authoringComponentContent.stamps.Stamps[index]);

            if (answer) {

                // remove the stamp
                this.authoringComponentContent.stamps.Stamps.splice(index, 1);

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Enable all the tools
         */

    }, {
        key: 'authoringEnableAllToolsButtonClicked',
        value: function authoringEnableAllToolsButtonClicked() {

            if (this.authoringComponentContent.tools == null) {
                this.authoringComponentContent.tools = {};
            }

            // enable all the tools
            this.authoringComponentContent.tools.select = true;
            this.authoringComponentContent.tools.line = true;
            this.authoringComponentContent.tools.shape = true;
            this.authoringComponentContent.tools.freeHand = true;
            this.authoringComponentContent.tools.text = true;
            this.authoringComponentContent.tools.stamp = true;
            this.authoringComponentContent.tools.strokeColor = true;
            this.authoringComponentContent.tools.fillColor = true;
            this.authoringComponentContent.tools.clone = true;
            this.authoringComponentContent.tools.strokeWidth = true;
            this.authoringComponentContent.tools.sendBack = true;
            this.authoringComponentContent.tools.sendForward = true;
            this.authoringComponentContent.tools.undo = true;
            this.authoringComponentContent.tools.redo = true;
            this.authoringComponentContent.tools.delete = true;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Disable all the tools
         */

    }, {
        key: 'authoringDisableAllToolsButtonClicked',
        value: function authoringDisableAllToolsButtonClicked() {

            if (this.authoringComponentContent.tools == null) {
                this.authoringComponentContent.tools = {};
            }

            // disable all the tools
            this.authoringComponentContent.tools.select = false;
            this.authoringComponentContent.tools.line = false;
            this.authoringComponentContent.tools.shape = false;
            this.authoringComponentContent.tools.freeHand = false;
            this.authoringComponentContent.tools.text = false;
            this.authoringComponentContent.tools.stamp = false;
            this.authoringComponentContent.tools.strokeColor = false;
            this.authoringComponentContent.tools.fillColor = false;
            this.authoringComponentContent.tools.clone = false;
            this.authoringComponentContent.tools.strokeWidth = false;
            this.authoringComponentContent.tools.sendBack = false;
            this.authoringComponentContent.tools.sendForward = false;
            this.authoringComponentContent.tools.undo = false;
            this.authoringComponentContent.tools.redo = false;
            this.authoringComponentContent.tools.delete = false;
        }

        /**
         * Save the starter draw data
         */

    }, {
        key: 'authoringSaveStarterDrawData',
        value: function authoringSaveStarterDrawData() {

            // get the draw data
            var drawData = this.getDrawData();

            // set the starter draw data
            this.authoringComponentContent.starterDrawData = drawData;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Delete the starter draw data
         */

    }, {
        key: 'authoringDeleteStarterDrawData',
        value: function authoringDeleteStarterDrawData() {

            // remove the starter draw data
            this.authoringComponentContent.starterDrawData = null;

            // clear the drawing
            this.drawingTool.clear();

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
        }

        /**
         * The author has changed the width
         */

    }, {
        key: 'authoringViewWidthChanged',
        value: function authoringViewWidthChanged() {

            // update the width
            this.width = this.authoringComponentContent.width;

            // update the starter draw data if there is any
            if (this.authoringComponentContent.starterDrawData != null) {

                // get the starter draw data as a JSON object
                var starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);

                if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {

                    // update the width in the starter draw data
                    starterDrawDataJSONObject.dt.width = this.width;

                    // set the starter draw data back into the component content
                    this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
                }
            }

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();

            // re-initialize the drawing tool so the width is updated
            this.$timeout(angular.bind(this, this.initializeDrawingTool));
        }

        /**
         * The author has changed the height
         */

    }, {
        key: 'authoringViewHeightChanged',
        value: function authoringViewHeightChanged() {

            // update the height
            this.height = this.authoringComponentContent.height;

            // update the starter draw data if there is any
            if (this.authoringComponentContent.starterDrawData != null) {

                // get the starter draw data as a JSON object
                var starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);

                if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {

                    // update the height in the starter draw data
                    starterDrawDataJSONObject.dt.height = this.height;

                    // set the starter draw data back into the component content
                    this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
                }
            }

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();

            // re-initialize the drawing tool so the height is updated
            this.$timeout(angular.bind(this, this.initializeDrawingTool));
        }

        /**
         * The author has enabled or disabled a tool
         */

    }, {
        key: 'authoringViewToolClicked',
        value: function authoringViewToolClicked() {

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();

            // re-initialize the drawing tool so the height is updated
            this.$timeout(angular.bind(this, this.initializeDrawingTool));
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

        /**
         * Show the asset popup to allow the author to choose the background image
         */

    }, {
        key: 'chooseBackgroundImage',
        value: function chooseBackgroundImage() {

            // generate the parameters
            var params = {};
            params.popup = true;
            params.nodeId = this.nodeId;
            params.componentId = this.componentId;
            params.target = 'background';

            // display the asset chooser
            this.$rootScope.$broadcast('openAssetChooser', params);
        }

        /**
         * The background has changed so we will update the starter draw data if
         * it has been set and then save the project
         */

    }, {
        key: 'authoringViewBackgroundChanged',
        value: function authoringViewBackgroundChanged() {

            // get the starter draw data string
            var starterDrawData = this.authoringComponentContent.starterDrawData;

            if (starterDrawData != null) {

                // get the starter draw data JSON object
                var starterDrawDataJSON = angular.fromJson(starterDrawData);

                if (starterDrawDataJSON != null && starterDrawDataJSON.canvas != null && starterDrawDataJSON.canvas.backgroundImage != null && starterDrawDataJSON.canvas.backgroundImage.src != null) {

                    // get the background
                    var background = this.authoringComponentContent.background;

                    /*
                     * get the project assets directory path
                     * e.g. https://www.berkeley.edu/curriculum/25/assets
                     */
                    var projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath(true);

                    /*
                     * generate the absolute path to the background image
                     * e.g. https://www.berkeley.edu/curriculum/25/assets/earth.png
                     */
                    var newSrc = projectAssetsDirectoryPath + "/" + background;

                    // set the new src
                    starterDrawDataJSON.canvas.backgroundImage.src = newSrc;

                    // convert the starter draw data back into a string
                    this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSON);
                }
            }

            // save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Add a connected component
         */

    }, {
        key: 'addConnectedComponent',
        value: function addConnectedComponent() {

            /*
             * create the new connected component object that will contain a
             * node id and component id
             */
            var newConnectedComponent = {};
            newConnectedComponent.nodeId = this.nodeId;
            newConnectedComponent.componentId = null;
            newConnectedComponent.updateOn = 'change';

            // initialize the array of connected components if it does not exist yet
            if (this.authoringComponentContent.connectedComponents == null) {
                this.authoringComponentContent.connectedComponents = [];
            }

            // add the connected component
            this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Delete a connected component
         * @param index the index of the component to delete
         */

    }, {
        key: 'deleteConnectedComponent',
        value: function deleteConnectedComponent(index) {

            if (this.authoringComponentContent.connectedComponents != null) {
                this.authoringComponentContent.connectedComponents.splice(index, 1);
            }

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }

        /**
         * Set the show submit button value
         * @param show whether to show the submit button
         */

    }, {
        key: 'setShowSubmitButtonValue',
        value: function setShowSubmitButtonValue(show) {

            if (show == null || show == false) {
                // we are hiding the submit button
                this.authoringComponentContent.showSaveButton = false;
                this.authoringComponentContent.showSubmitButton = false;
            } else {
                // we are showing the submit button
                this.authoringComponentContent.showSaveButton = true;
                this.authoringComponentContent.showSubmitButton = true;
            }

            /*
             * notify the parent node that this component is changing its
             * showSubmitButton value so that it can show save buttons on the
             * step or sibling components accordingly
             */
            this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
        }

        /**
         * The showSubmitButton value has changed
         */

    }, {
        key: 'showSubmitButtonValueChanged',
        value: function showSubmitButtonValueChanged() {

            /*
             * perform additional processing for when we change the showSubmitButton
             * value
             */
            this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }]);

    return DrawController;
}();

DrawController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'DrawService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawController;
//# sourceMappingURL=drawController.js.map