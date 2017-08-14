'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('svg.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnimationController = function () {
    function AnimationController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, CRaterService, NodeService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
        var _this = this;

        _classCallCheck(this, AnimationController);

        this.$filter = $filter;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnimationService = AnimationService;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.CRaterService = CRaterService;
        this.NodeService = NodeService;
        this.NotificationService = NotificationService;
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

        // whether rich text editing is enabled
        this.isRichTextEnabled = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the submit button is disabled
        this.isSubmitButtonDisabled = false;

        // whether we're only showing the student work
        this.onlyShowWork = false;

        // the latest annotations
        this.latestAnnotations = null;

        // used to hold a message dialog if we need to use one
        this.messageDialog = null;

        // counter to keep track of the number of submits
        this.submitCounter = 0;

        // flag for whether to show the advanced authoring
        this.showAdvancedAuthoring = false;

        // whether the JSON authoring is displayed
        this.showJSONAuthoring = false;

        // mapping from object id to svg object
        this.idToSVGObject = {};

        //var scope = this;
        var themePath = this.ProjectService.getThemePath();

        // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
        // Rich text editor options
        this.tinymceOptions = {
            //onChange: function(e) {
            //scope.studentDataChanged();
            //},
            menubar: false,
            plugins: 'link image media autoresize', //imagetools
            toolbar: 'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
            autoresize_bottom_margin: "0",
            autoresize_min_height: "100",
            image_advtab: true,
            content_css: themePath + "/style/tinymce.css",
            setup: function setup(ed) {
                ed.on("focus", function (e) {
                    $(e.target.editorContainer).addClass('input--focused').parent().addClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
                });

                ed.on("blur", function (e) {
                    $(e.target.editorContainer).removeClass('input--focused').parent().removeClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
                });
            }
        };

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

        // the default width and height
        this.width = 800;
        this.height = 600;

        // the default pixels per unit
        this.pixelsPerXUnit = 1;
        this.pixelsPerYUnit = 1;

        // the default data origin in pixels
        this.dataXOriginInPixels = 0;
        this.dataYOriginInPixels = 0;

        // the current state of the animation ('playing', 'paused', or 'stopped')
        this.animationState = 'stopped';

        // the coordinate system to use ('screen' or 'cartesian')
        this.coordinateSystem = 'screen';

        // mapping from id to whether the object is animating
        this.idToAnimationState = {};

        /*
         * milliseconds per data time
         * example
         * The data time can be labelled with any unit of time such as seconds,
         * minutes, hours, days, years, etc.
         * If realTimePerDataTime is 100, that means for 1 data time, 100
         * milliseconds will pass in real time.
         */
        this.realTimePerDataTime = 100;

        // get the component state from the scope
        var componentState = this.$scope.componentState;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // get the svg id
            this.svgId = 'svg_' + this.nodeId + '_' + this.componentId;

            if (this.componentContent.widthInPixels != null && this.componentContent.widthInPixels != '') {
                // get the width of the canvas in pixels
                this.width = this.componentContent.widthInPixels;

                // get the ratio of pixels per x unit
                this.pixelsPerXUnit = this.componentContent.widthInPixels / this.componentContent.widthInUnits;
            }

            if (this.componentContent.heightInPixels != null && this.componentContent.heightInPixels != '') {
                // get the height of the canvas in pixels
                this.height = this.componentContent.heightInPixels;

                // get the ratio of pixels per y unit
                this.pixelsPerYUnit = this.componentContent.heightInPixels / this.componentContent.heightInUnits;
            }

            if (this.componentContent.dataXOriginInPixels != null && this.componentContent.dataXOriginInPixels != '') {
                // get the data x origin in pixels
                this.dataXOriginInPixels = this.componentContent.dataXOriginInPixels;
            }

            if (this.componentContent.dataYOriginInPixels != null && this.componentContent.dataYOriginInPixels != '') {
                // get the data y origin in pixels
                this.dataYOriginInPixels = this.componentContent.dataYOriginInPixels;
            }

            if (this.componentContent.coordinateSystem != null && this.componentContent.coordinateSystem != '') {
                // get the coordinate system
                this.coordinateSystem = this.componentContent.coordinateSystem;
            }

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'grading') {

                // get the svg id
                if (componentState != null) {
                    this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + componentState.id;
                } else {

                    this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + this.workgroupId;
                }

                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'onlyShowWork') {
                this.onlyShowWork = true;
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
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

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

                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    // inject the asset paths into the new component content
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    /*
                     * reset the values so that the preview is refreshed with
                     * the new content
                     */
                    this.submitCounter = 0;
                    this.studentResponse = '';
                    this.latestAnnotations = null;
                    this.isDirty = false;
                    this.isSubmitDirty = false;
                    this.isSaveButtonVisible = this.componentContent.showSaveButton;
                    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                    if (this.componentContent.starterSentence != null) {
                        /*
                         * the student has not done any work and there is a starter sentence
                         * so we will populate the textarea with the starter sentence
                         */
                        this.studentResponse = this.componentContent.starterSentence;
                    }
                }.bind(this), true);
            }

            // set whether rich text is enabled
            this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            if (componentState == null) {
                /*
                 * only import work if the student does not already have
                 * work for this component
                 */

                // check if we need to import work
                var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
                var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

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

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /*
         * Call the setup() function after a timeout so that angular has a
         * chance to set the svg element id before we start using it. If we
         * don't wait for the timeout, the svg id won't be set when we try
         * to start referencing the svg element.
         */
        this.$timeout(angular.bind(this, this.setup));

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function () {
            return this.$scope.animationController.isDirty;
        }.bind(this);

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
                if (this.$scope.animationController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.animationController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.animationController.createComponentState(action).then(function (componentState) {
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

                // trigger the submit
                var submitTriggeredBy = 'nodeSubmitButton';
                this.submit(submitTriggeredBy);
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
        this.$scope.$on('exitNode', function (event, args) {}.bind(this));

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

        /**
         * A connected component has changed its student data so we will
         * perform any necessary changes to this component
         * @param connectedComponent the connected component
         * @param connectedComponentParams the connected component params
         * @param componentState the student data from the connected
         * component that has changed
         */
        this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {

            if (connectedComponent != null && componentState != null) {

                // get the component type that has changed
                var componentType = connectedComponent.type;

                if (componentType === 'Graph') {

                    // update the object datas
                    _this.updateObjectDatasFromDataSources(componentState);
                }
            }
        };

        // load script for this component, if any
        var script = this.componentContent.script;
        if (script != null) {
            this.ProjectService.retrieveScript(script).then(function (script) {
                new Function(script).call(_this);
            });
        }
    }

    /**
     * Setup the objects
     */


    _createClass(AnimationController, [{
        key: 'setup',
        value: function setup() {
            // get the svg.js draw handle
            this.draw = SVG(this.svgId);

            // create the objects
            this.createObjects();

            // if an object uses data from another data source, update its data
            this.updateObjectDatasFromDataSources();
        }

        /**
         * Create the objects in the svg world
         */

    }, {
        key: 'createObjects',
        value: function createObjects() {

            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {
                            var id = object.id;
                            var type = object.type;
                            var label = object.label;

                            var svgObject = null;

                            if (type == 'image') {
                                // get the image file name
                                var image = object.image;

                                // get the width and the height
                                var width = object.width;
                                var height = object.height;

                                // create the image in the svg world
                                svgObject = this.draw.image(image, width, height);
                            } else if (type == 'text') {
                                // get the text
                                var text = object.text;

                                // create the text object in the svg world
                                svgObject = this.draw.text(text);
                            }

                            // add an entry in our id to svg object mapping
                            this.idToSVGObject[id] = svgObject;

                            // add an entry in our id to animation state mapping
                            this.idToAnimationState[id] = false;

                            // initialize the svg object position
                            this.initializeObjectPosition(object);
                        }
                    }
                }
            }
        }

        /**
         * Initialize the object images
         */

    }, {
        key: 'initializeObjectImages',
        value: function initializeObjectImages() {
            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        var id = object.id;
                        var type = object.type;

                        // get the image file name
                        var image = object.image;

                        if (type == 'image') {
                            // the object is an image

                            // get the svg object
                            var svgObject = this.idToSVGObject[id];

                            // load the image into the svg object
                            svgObject.load(image);
                        }
                    }
                }
            }
        }

        /**
         * Initialize the object positions
         */

    }, {
        key: 'initializeObjectPositions',
        value: function initializeObjectPositions() {
            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        // initialize the object position
                        this.initializeObjectPosition(object);
                    }
                }
            }
        }

        /**
         * Convert a data x value to a pixel x value
         * @param x an x value in data units
         * @return the x value converted to a pixel coordinate
         */

    }, {
        key: 'dataXToPixelX',
        value: function dataXToPixelX(x) {

            // default the pixel x to start at the data x origin
            var pixelX = this.dataXOriginInPixels;

            if (x != null) {

                // convert the x value to pixels and shift it by the x origin
                pixelX += x * this.pixelsPerXUnit;
            }

            return pixelX;
        }

        /**
         * Convert a data y value to a pixel y value
         * @param y an y value in data units
         * @return the y value converted to a pixel coordinate
         */

    }, {
        key: 'dataYToPixelY',
        value: function dataYToPixelY(y) {

            // default the pixel y to start at the data y origin
            var pixelY = this.dataYOriginInPixels;

            if (y != null) {
                // convert the y value to pixels and shift it by the y origin
                pixelY += y * this.pixelsPerYUnit;
            }

            return pixelY;
        }

        /**
         * Initialize the object position in the svg world
         * @param object the authored object
         */

    }, {
        key: 'initializeObjectPosition',
        value: function initializeObjectPosition(object) {
            var id = object.id;
            var label = object.label;
            var data = object.data;
            var dataX = object.dataX;
            var dataY = object.dataY;
            var pixelX = object.pixelX;
            var pixelY = object.pixelY;

            var x = 0;
            var y = 0;

            if (dataX != null) {
                // the dataX position was provided

                // convert the data x value to a pixel x value
                x = this.dataXToPixelX(dataX);
            } else if (pixelX != null) {
                // the pixelX position was provided
                x = pixelX;
            }

            if (dataY != null) {
                // the dataY position was provided

                // convert the data y value to a pixel y value
                y = this.dataYToPixelY(dataY);
            } else if (pixelY != null) {
                // the pixelY position was provided
                y = pixelY;
            }

            if (this.isUsingCartesianCoordinateSystem()) {
                /*
                 * we are using the cartesian coordinate system so we need to modify
                 * the y value
                 */
                y = this.convertToCartesianCoordinateSystem(y);
            }

            // get the svg object
            var svgObject = this.idToSVGObject[id];

            if (svgObject != null) {

                // set the x and y pixel position
                svgObject.attr({ x: x, y: y });

                if (data != null && data.length > 0) {
                    // there is data for this object

                    // get the first data point
                    var firstDataPoint = data[0];

                    if (firstDataPoint != null) {

                        var firstDataPointT = firstDataPoint.t;
                        var firstDataPointX = firstDataPoint.x;
                        var firstDataPointY = firstDataPoint.y;

                        if (firstDataPointT === 0) {
                            /*
                             * there is a first data point with t == 0 so we will
                             * use it as the starting position
                             */

                            if (firstDataPointX != null && firstDataPointX != '' && typeof firstDataPointX != 'undefined') {
                                // convert the data x value to a pixel x value
                                var firstDataPointXInPixels = this.dataXToPixelX(firstDataPointX);
                                svgObject.attr('x', firstDataPointXInPixels);
                            }

                            if (firstDataPointY != null && firstDataPointY != '' && typeof firstDataPointY != 'undefined') {
                                // convert the data y value to a pixel y value
                                var firstDataPointYInPixels = this.dataYToPixelY(firstDataPointY);

                                if (this.isUsingCartesianCoordinateSystem()) {
                                    /*
                                     * we are using the cartesian coordinate system so we need to modify
                                     * the y value
                                     */
                                    firstDataPointYInPixels = this.convertToCartesianCoordinateSystem(firstDataPointYInPixels);
                                }

                                svgObject.attr('y', firstDataPointYInPixels);
                            }
                        }
                    }
                }
            }
        }

        /**
         * Start the animation
         */

    }, {
        key: 'startAnimation',
        value: function startAnimation() {

            // set the images back to their starting images in case they have changed
            this.initializeObjectImages();

            // put the objects in their starting positions
            this.initializeObjectPositions();

            if (this.componentContent != null) {

                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {

                            // animate the object
                            this.animateObject(object);
                        }
                    }
                }
            }
        }

        /**
         * Show the time on the svg div
         * @param t the time
         */

    }, {
        key: 'showTime',
        value: function showTime(t) {

            if (this.timerText == null) {
                // initialize the timer text
                this.timerText = this.draw.text("0").attr({ fill: '#f03' });
            }

            // get the width of the svg div
            var width = this.width;

            // set the x position near the top right of the svg div
            var x = width - 30;
            var y = 0;

            // set the text that the student will see
            this.timerText.text(t + "");

            if (t >= 10) {
                // shift the text to the left if there are two digits
                x = width - 38;
            } else if (t >= 100) {
                // shift the text to the left more if there are three digits
                x = width - 46;
            }

            // set the position of the text
            this.timerText.attr({ x: x, y: y });
        }

        /**
         * Update the object data from their data source
         * @param componentState (optional) a component state which may be the
         * data source for one of the objects
         */

    }, {
        key: 'updateObjectDatasFromDataSources',
        value: function updateObjectDatasFromDataSources(componentState) {

            if (this.componentContent != null) {

                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {

                            if (object.dataSource != null) {
                                // the object gets its data from a data source
                                this.updateObjectDataFromDataSource(object, componentState);
                            }
                        }
                    }
                }
            }
        }

        /**
         * Update the data from its data source
         * @param object update the data for this object
         * @param componentState (optional) The component state to get the data
         * from. If this is not provided, we will look up the latest component
         * state.
         */

    }, {
        key: 'updateObjectDataFromDataSource',
        value: function updateObjectDataFromDataSource(object, componentState) {

            if (object != null) {

                // get the data source details
                var dataSource = object.dataSource;

                if (dataSource != null) {
                    var nodeId = dataSource.nodeId;
                    var componentId = dataSource.componentId;

                    if (componentState == null) {
                        // the component state was not passed in so we will get it
                        componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                    }

                    if (componentState != null && nodeId == componentState.nodeId && componentId == componentState.componentId) {
                        // the component state matches the data source

                        if (componentState.componentType == 'Graph') {
                            this.setDataFromGraphComponentState(object, componentState);
                        } else if (componentState.componentType == 'Table') {
                            this.setDataFromTableComponentState(object, componentState);
                        }
                    }
                }
            }
        }

        /**
         * Get the data from the graph component state
         * @param object set the data into this object
         * @param componentState
         */

    }, {
        key: 'setDataFromGraphComponentState',
        value: function setDataFromGraphComponentState(object, componentState) {
            if (object != null) {

                // get the data source specification
                var dataSource = object.dataSource;

                if (dataSource != null) {
                    var nodeId = dataSource.nodeId;
                    var componentId = dataSource.componentId;
                    var trialIndex = dataSource.trialIndex;
                    var seriesIndex = dataSource.seriesIndex;
                    var tColumnIndex = dataSource.tColumnIndex;
                    var xColumnIndex = dataSource.xColumnIndex;
                    var yColumnIndex = dataSource.yColumnIndex;

                    if (componentState != null && nodeId == componentState.nodeId && componentId == componentState.componentId) {
                        // the component state matches the data source

                        var studentData = componentState.studentData;

                        if (studentData != null) {
                            var trials = studentData.trials;

                            if (trials != null) {

                                // get the trial we ant
                                var trial = trials[trialIndex];

                                if (trial != null) {
                                    var series = trial.series;

                                    if (series != null) {

                                        // get the series we want
                                        var singleSeries = series[seriesIndex];

                                        if (singleSeries != null) {
                                            var seriesData = singleSeries.data;

                                            if (seriesData != null) {

                                                // array to store our animation data
                                                var data = [];

                                                // loop through all the points in the series
                                                for (var d = 0; d < seriesData.length; d++) {
                                                    var seriesDataPoint = seriesData[d];

                                                    // create a data point
                                                    var animationDataPoint = {};

                                                    if (tColumnIndex != null) {
                                                        // get the t value
                                                        animationDataPoint.t = seriesDataPoint[tColumnIndex];
                                                    }

                                                    if (xColumnIndex != null) {
                                                        // get the x value
                                                        animationDataPoint.x = seriesDataPoint[xColumnIndex];
                                                    }

                                                    if (yColumnIndex != null) {
                                                        // get the y value
                                                        animationDataPoint.y = seriesDataPoint[yColumnIndex];
                                                    }

                                                    // add the data point to the array
                                                    data.push(animationDataPoint);
                                                }

                                                // set the data into the object
                                                object.data = data;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, {
        key: 'setDataFromTableComponentState',
        value: function setDataFromTableComponentState() {}

        /**
         * Move the object
         * @param object the authored object
         */

    }, {
        key: 'animateObject',
        value: function animateObject(object) {
            var _this2 = this;

            if (object != null) {
                (function () {
                    var id = object.id;
                    var data = object.data;

                    if (data != null) {

                        // get the svg object
                        var svgObject = _this2.idToSVGObject[id];

                        if (svgObject != null) {
                            (function () {

                                /*
                                 * this will hold SVG.FX object that is returned from
                                 * calling animate()
                                 */
                                var animateObject = null;

                                var thisAnimationController = _this2;

                                // loop through all the data

                                var _loop = function _loop(d) {

                                    // get the current point
                                    var currentDataPoint = data[d];
                                    var t = currentDataPoint.t;
                                    var x = currentDataPoint.x;
                                    var y = currentDataPoint.y;
                                    var image = currentDataPoint.image;

                                    // convert the data values to pixels
                                    var xPixel = _this2.dataXToPixelX(x);
                                    var yPixel = _this2.dataYToPixelY(y);

                                    // get the next point
                                    var nextDataPoint = data[d + 1];
                                    var nextT = null;
                                    var nextX = null;
                                    var nextY = null;
                                    var nextXPixel = null;
                                    var nextYPixel = null;

                                    if (nextDataPoint != null) {
                                        nextT = nextDataPoint.t;
                                        nextX = nextDataPoint.x;
                                        nextY = nextDataPoint.y;

                                        // convert the data values to pixels
                                        nextXPixel = _this2.dataXToPixelX(nextX);
                                        nextYPixel = _this2.dataYToPixelY(nextY);
                                    }

                                    if (_this2.isUsingCartesianCoordinateSystem()) {
                                        /*
                                         * we are using the cartesian coordinate system so we need to modify
                                         * the y value
                                         */
                                        yPixel = _this2.convertToCartesianCoordinateSystem(yPixel);
                                        nextYPixel = _this2.convertToCartesianCoordinateSystem(nextYPixel);
                                    }

                                    // set the animation state to true for the object
                                    _this2.idToAnimationState[id] = true;

                                    var tDiff = 0;

                                    if (nextT != null && nextT != '') {
                                        /*
                                         * calculate the time difference so we know how long we should make
                                         * it take to move to the new position
                                         */
                                        tDiff = nextT - t;
                                    }

                                    if (d == 0) {
                                        // this is the first data point

                                        if (t == 0) {
                                            /*
                                             * immediately set the position since we are at
                                             * time 0
                                             */

                                            // set the position
                                            svgObject.attr({ x: xPixel, y: yPixel });
                                        } else {
                                            /*
                                             * the first data point is not at time 0 so we will
                                             * need to wait until time t before we set the
                                             * position of the object
                                             */
                                            animateObject = svgObject.animate(t * _this2.realTimePerDataTime).during(function (pos, morph, eased, situation) {

                                                // calculate the amount of time that has elapsed
                                                var elapsedTime = t * pos;

                                                // display and broadcast the elapsed time
                                                thisAnimationController.displayAndBroadcastTime(elapsedTime);
                                            }).after(function () {
                                                // set the position
                                                this.attr({ x: xPixel, y: yPixel });
                                            });
                                        }
                                    }

                                    if (image != null && image != '') {
                                        /*
                                         * there is an image specified for this data point
                                         * so we will change to that image
                                         */

                                        if (animateObject == null) {
                                            /*
                                             * there is no animateObject yet so we will
                                             * change the image immediately
                                             */
                                            svgObject.load(image);
                                        } else {
                                            /*
                                             * change the image after all the existing
                                             * animations
                                             */
                                            animateObject = animateObject.after(function () {
                                                this.load(image);
                                            });
                                        }
                                    } else if (nextDataPoint != null) {
                                        /*
                                         * there is a next data point so we will see if we
                                         * can determine what image to show based upon the
                                         * movement of the object
                                         */

                                        // get the image to show based upon the movement
                                        var dynamicallyCalculatedImage = _this2.getImageBasedOnMovement(object, currentDataPoint, nextDataPoint);

                                        if (dynamicallyCalculatedImage != null) {
                                            if (animateObject == null) {
                                                /*
                                                 * there is no animateObject yet so we will
                                                 * change the image immediately
                                                 */
                                                svgObject.load(dynamicallyCalculatedImage);
                                            } else {
                                                /*
                                                 * change the image after all the existing
                                                 * animations
                                                 */
                                                animateObject = animateObject.after(function () {
                                                    this.load(dynamicallyCalculatedImage);
                                                });
                                            }
                                        }
                                    }

                                    if (d != data.length - 1) {
                                        // this is a data point that is not the last

                                        // move the image to the next position
                                        animateObject = svgObject.animate(tDiff * _this2.realTimePerDataTime).move(nextXPixel, nextYPixel).during(function (pos, morph, eased, situation) {

                                            // calculate the elapsed time
                                            var elapsedTime = t + tDiff * pos;

                                            // display and broadcast the elapsed time
                                            thisAnimationController.displayAndBroadcastTime(elapsedTime);
                                        });
                                    }

                                    if (d == data.length - 1) {
                                        // this is the last data point

                                        // after all the animations are done on the object we will perform some processing
                                        animateObject = animateObject.afterAll(function () {

                                            /*
                                             * we are done animating this object so we will
                                             * set the animation state to false for the
                                             * object
                                             */
                                            _this2.idToAnimationState[id] = false;

                                            // check if all svg objects are done animating
                                            _this2.checkIfAllAnimatingIsDone();
                                        });
                                    }
                                };

                                for (var d = 0; d < data.length; d++) {
                                    _loop(d);
                                }
                            })();
                        }
                    }
                })();
            }
        }

        /**
         * Display and broadcast the time
         * @param t the time
         */

    }, {
        key: 'displayAndBroadcastTime',
        value: function displayAndBroadcastTime(t) {
            /*
             * Remove the digits after the first decimal place.
             * example
             * 12.817 will be changed to 12.8
             */
            var displayTime = parseInt(t * 10) / 10;

            // show the time on the svg div
            thisAnimationController.showTime(displayTime);

            // create a component state with the time in it
            var componentState = {};
            componentState.t = t;

            /*
             * broadcast the component state with the time in it
             * so other components can know the elapsed time
             */
            thisAnimationController.$scope.$emit('componentStudentDataChanged', { nodeId: thisAnimationController.nodeId, componentId: thisAnimationController.componentId, componentState: componentState });
        }

        /**
         * Get the image based upon the movement of the object
         * @param object the object that is being moved
         * @param currentDataPoint the current data point
         * @param nextDataPoint the next data point
         */

    }, {
        key: 'getImageBasedOnMovement',
        value: function getImageBasedOnMovement(object, currentDataPoint, nextDataPoint) {

            var image = null;

            if (currentDataPoint != null && nextDataPoint != null) {

                var currentX = currentDataPoint.x;
                var currentY = currentDataPoint.y;

                var _nextX = nextDataPoint.x;
                var _nextY = nextDataPoint.y;

                if (currentY == _nextY) {
                    // there is no change in y

                    if (currentX == _nextX) {
                        // there is no change in x

                        // the image is staying in place
                    } else if (currentX < _nextX) {
                        // x is moving to the right
                        if (object.imageMovingRight != null && object.imageMovingRight != '') {
                            image = object.imageMovingRight;
                        }
                    } else if (currentX > _nextX) {
                        // x is moving to the left
                        if (object.imageMovingLeft != null && object.imageMovingLeft != '') {
                            image = object.imageMovingLeft;
                        }
                    }
                } else if (currentX == _nextX) {
                    // there is no change in x

                    if (currentY == _nextY) {
                        // there is no change in y

                        // the image is staying in place
                    } else if (currentY < _nextY) {
                        // y is getting larger

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // y is moving up
                            if (object.imageMovingUp != null && object.imageMovingUp != '') {
                                image = object.imageMovingUp;
                            }
                        } else {
                            // y is moving down
                            if (object.imageMovingDown != null && object.imageMovingDown != '') {
                                image = object.imageMovingDown;
                            }
                        }
                    } else if (currentY > _nextY) {
                        // y is getting smaller

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // y is moving down
                            if (object.imageMovingDown != null && object.imageMovingDown != '') {
                                image = object.imageMovingDown;
                            }
                        } else {
                            // y is moving up
                            if (object.imageMovingUp != null && object.imageMovingUp != '') {
                                image = object.imageMovingUp;
                            }
                        }
                    }
                } else {
                    // there is a change in x and y

                    // TODO: fill out these if/else cases by setting the appropriate image

                    if (currentX < _nextX && currentY < _nextY) {
                        // x is getting larger and y is getting larger

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // the image is moving up to the right
                        } else {
                                // the image is moving down to the right
                            }
                    } else if (currentX < _nextX && currentY > _nextY) {
                        // x is getting larger and y is getting smaller

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // the image is moving down to the right
                        } else {
                                // the image is moving up to the right
                            }
                    } else if (currentX > _nextX && currentY > _nextY) {
                        // x is getting smaller and y is getting smaller

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // the image is moving down to the left
                        } else {
                                // the image is moving up to the left
                            }
                    } else if (currentX > _nextX && currentY < _nextY) {
                        // x is getting smaller and y is getting larger

                        if (this.isUsingCartesianCoordinateSystem()) {
                            // the image is moving up to the right
                        } else {
                                // the image is moving down to the right
                            }
                    }
                }
            }

            return image;
        }

        /**
         * Check if all svg objects are done animating. If there are not svg objects
         * animating, we will set the animationState to 'stopped'.
         */

    }, {
        key: 'checkIfAllAnimatingIsDone',
        value: function checkIfAllAnimatingIsDone() {
            var _this3 = this;

            // check if there are any other objects that are still animating
            if (!this.areAnyObjectsAnimating()) {
                // there are no objects animating

                // set the animation state to 'stopped'
                this.animationState = 'stopped';

                // perform a digest after a timeout so that the buttons update
                this.$timeout(function () {
                    _this3.$scope.$digest();
                });
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

                    var submitCounter = studentData.submitCounter;

                    if (submitCounter != null) {
                        // populate the submit counter
                        this.submitCounter = submitCounter;
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

            if (this.mode === 'authoring') {
                /*
                 * we are in authoring mode so we will set isDirty to false here
                 * because the 'componentSaveTriggered' event won't work in
                 * authoring mode
                 */
                this.isDirty = false;
            }

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
                        alert(this.$translate('animation.youHaveNoMoreChances'));
                        performSubmit = false;
                    } else if (numberOfSubmitsLeft == 1) {

                        // ask the student if they are sure they want to submit
                        message = this.$translate('animation.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft });
                        //message = 'You have ' + numberOfSubmitsLeft + ' chance to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
                        performSubmit = confirm(message);
                    } else if (numberOfSubmitsLeft > 1) {

                        // ask the student if they are sure they want to submit
                        message = this.$translate('animation.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft });
                        //message = 'You have ' + numberOfSubmitsLeft + ' chances to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
                        performSubmit = confirm(message);
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
            var _this4 = this;

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
                _this4.$scope.$emit('componentStudentDataChanged', { nodeId: _this4.nodeId, componentId: componentId, componentState: componentState });
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

            var deferred = this.$q.defer();

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            // set the response into the component state
            var studentData = {};

            // get the text the student typed
            var response = this.getStudentResponse();

            studentData.response = response;
            studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

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
            var _this5 = this;

            var performCRaterScoring = false;

            // determine if we need to perform CRater scoring
            if (action == 'submit' && componentState.isSubmit) {
                if (this.isCRaterScoreOnSubmit(this.componentContent)) {
                    performCRaterScoring = true;
                }
            } else if (action == 'save') {
                if (this.isCRaterScoreOnSave(this.componentContent)) {
                    performCRaterScoring = true;
                }
            } else if (action == 'change' || action == null) {
                if (this.isCRaterScoreOnChange(this.componentContent)) {
                    performCRaterScoring = true;
                }
            }

            if (performCRaterScoring) {
                // we need to perform CRater scoring

                var cRaterItemType = this.CRaterService.getCRaterItemType(this.componentContent);
                var cRaterItemId = this.CRaterService.getCRaterItemId(this.componentContent);
                var cRaterRequestType = 'scoring';
                var cRaterResponseId = new Date().getTime();
                var studentData = this.studentResponse;

                /*
                 * display a dialog message while the student waits for their work
                 * to be scored by CRater
                 */
                this.$mdDialog.show({
                    template: '<md-dialog aria-label="' + this.$translate('animation.pleaseWait') + '"><md-dialog-content><div class="md-dialog-content">' + this.$translate('animation.pleaseWaitWeAreScoringYourWork') + '</div></md-dialog-content></md-dialog>',
                    escapeToClose: false
                });

                // make the CRater request to score the student data
                this.CRaterService.makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData).then(function (result) {

                    if (result != null) {

                        // get the CRater response
                        var data = result.data;

                        if (data != null) {

                            /*
                             * annotations we put in the component state will be
                             * removed from the component state and saved separately
                             */
                            componentState.annotations = [];

                            // get the CRater score
                            var score = data.score;
                            var concepts = data.concepts;
                            var previousScore = null;

                            if (score != null) {

                                // create the auto score annotation
                                var autoScoreAnnotationData = {};
                                autoScoreAnnotationData.value = score;
                                autoScoreAnnotationData.maxAutoScore = _this5.ProjectService.getMaxScoreForComponent(_this5.nodeId, _this5.componentId);
                                autoScoreAnnotationData.concepts = concepts;
                                autoScoreAnnotationData.autoGrader = 'cRater';

                                var autoScoreAnnotation = _this5.createAutoScoreAnnotation(autoScoreAnnotationData);

                                var annotationGroupForScore = null;

                                if (_this5.$scope.$parent.nodeController != null) {
                                    // get the previous score and comment annotations
                                    var latestAnnotations = _this5.$scope.$parent.nodeController.getLatestComponentAnnotations(_this5.componentId);

                                    if (latestAnnotations != null && latestAnnotations.score != null && latestAnnotations.score.data != null) {

                                        // get the previous score annotation value
                                        previousScore = latestAnnotations.score.data.value;
                                    }

                                    if (_this5.componentContent.enableGlobalAnnotations && _this5.componentContent.globalAnnotationSettings != null) {

                                        var globalAnnotationMaxCount = 0;
                                        if (_this5.componentContent.globalAnnotationSettings.globalAnnotationMaxCount != null) {
                                            globalAnnotationMaxCount = _this5.componentContent.globalAnnotationSettings.globalAnnotationMaxCount;
                                        }
                                        // get the annotation properties for the score that the student got.
                                        annotationGroupForScore = _this5.ProjectService.getGlobalAnnotationGroupByScore(_this5.componentContent, previousScore, score);

                                        // check if we need to apply this globalAnnotationSetting to this annotation: we don't need to if we've already reached the maxCount
                                        if (annotationGroupForScore != null) {
                                            var globalAnnotationGroupsByNodeIdAndComponentId = _this5.AnnotationService.getAllGlobalAnnotationGroups(_this5.nodeId, _this5.componentId);
                                            annotationGroupForScore.annotationGroupCreatedTime = autoScoreAnnotation.clientSaveTime; // save annotation creation time

                                            if (globalAnnotationGroupsByNodeIdAndComponentId.length >= globalAnnotationMaxCount) {
                                                // we've already applied this annotation properties to maxCount annotations, so we don't need to apply it any more.
                                                annotationGroupForScore = null;
                                            }
                                        }

                                        if (annotationGroupForScore != null && annotationGroupForScore.isGlobal && annotationGroupForScore.unGlobalizeCriteria != null) {
                                            // check if this annotation is global and what criteria needs to be met to un-globalize.
                                            annotationGroupForScore.unGlobalizeCriteria.map(function (unGlobalizeCriteria) {
                                                // if the un-globalize criteria is time-based (e.g. isVisitedAfter, isRevisedAfter, isVisitedAndRevisedAfter, etc), store the timestamp of this annotation in the criteria
                                                // so we can compare it when we check for criteria satisfaction.
                                                if (unGlobalizeCriteria.params != null) {
                                                    unGlobalizeCriteria.params.criteriaCreatedTimestamp = autoScoreAnnotation.clientSaveTime; // save annotation creation time to criteria
                                                }
                                            });
                                        }

                                        if (annotationGroupForScore != null) {
                                            // copy over the annotation properties into the autoScoreAnnotation's data
                                            angular.merge(autoScoreAnnotation.data, annotationGroupForScore);
                                        }
                                    }
                                }

                                componentState.annotations.push(autoScoreAnnotation);

                                if (_this5.mode === 'authoring') {
                                    if (_this5.latestAnnotations == null) {
                                        _this5.latestAnnotations = {};
                                    }

                                    /*
                                     * we are in the authoring view so we will set the
                                     * latest score annotation manually
                                     */
                                    _this5.latestAnnotations.score = autoScoreAnnotation;
                                }

                                var autoComment = null;

                                // get the submit counter
                                var submitCounter = _this5.submitCounter;

                                if (_this5.componentContent.cRater.enableMultipleAttemptScoringRules && submitCounter > 1) {
                                    /*
                                     * this step has multiple attempt scoring rules and this is
                                     * a subsequent submit
                                     */
                                    // get the feedback based upon the previous score and current score
                                    autoComment = _this5.CRaterService.getMultipleAttemptCRaterFeedbackTextByScore(_this5.componentContent, previousScore, score);
                                } else {
                                    // get the feedback text
                                    autoComment = _this5.CRaterService.getCRaterFeedbackTextByScore(_this5.componentContent, score);
                                }

                                if (autoComment != null) {
                                    // create the auto comment annotation
                                    var autoCommentAnnotationData = {};
                                    autoCommentAnnotationData.value = autoComment;
                                    autoCommentAnnotationData.concepts = concepts;
                                    autoCommentAnnotationData.autoGrader = 'cRater';

                                    var autoCommentAnnotation = _this5.createAutoCommentAnnotation(autoCommentAnnotationData);

                                    if (_this5.componentContent.enableGlobalAnnotations) {
                                        if (annotationGroupForScore != null) {
                                            // copy over the annotation properties into the autoCommentAnnotation's data
                                            angular.merge(autoCommentAnnotation.data, annotationGroupForScore);
                                        }
                                    }
                                    componentState.annotations.push(autoCommentAnnotation);

                                    if (_this5.mode === 'authoring') {
                                        if (_this5.latestAnnotations == null) {
                                            _this5.latestAnnotations = {};
                                        }

                                        /*
                                         * we are in the authoring view so we will set the
                                         * latest comment annotation manually
                                         */
                                        _this5.latestAnnotations.comment = autoCommentAnnotation;
                                    }
                                }
                                if (_this5.componentContent.enableNotifications) {
                                    // get the notification properties for the score that the student got.
                                    var notificationForScore = _this5.ProjectService.getNotificationByScore(_this5.componentContent, previousScore, score);

                                    if (notificationForScore != null) {
                                        notificationForScore.score = score;
                                        notificationForScore.nodeId = _this5.nodeId;
                                        notificationForScore.componentId = _this5.componentId;
                                        _this5.NotificationService.sendNotificationForScore(notificationForScore);
                                    }
                                }

                                // display global annotations dialog if needed
                                if (_this5.componentContent.enableGlobalAnnotations && annotationGroupForScore != null && annotationGroupForScore.isGlobal && annotationGroupForScore.isPopup) {
                                    _this5.$scope.$emit('displayGlobalAnnotations');
                                }
                            }
                        }
                    }

                    /*
                     * hide the dialog that tells the student to wait since
                     * the work has been scored.
                     */
                    _this5.$mdDialog.hide();

                    // resolve the promise now that we are done performing additional processing
                    deferred.resolve(componentState);
                });
            } else if (this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)) {
                // if there are any additionalProcessingFunctions for this node and component, call all of them
                var additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(this.nodeId, this.componentId);
                var allPromises = [];
                for (var i = 0; i < additionalProcessingFunctions.length; i++) {
                    var additionalProcessingFunction = additionalProcessingFunctions[i];
                    var defer = this.$q.defer();
                    var promise = defer.promise;
                    allPromises.push(promise);
                    additionalProcessingFunction(defer, componentState, action);
                }
                this.$q.all(allPromises).then(function () {
                    deferred.resolve(componentState);
                });
            } else {
                /*
                 * we don't need to perform any additional processing so we can resolve
                 * the promise immediately
                 */
                deferred.resolve(componentState);
            }
        }

        /**
         * Create an auto score annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto score annotation
         */

    }, {
        key: 'createAutoScoreAnnotation',
        value: function createAutoScoreAnnotation(data) {

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var toWorkgroupId = this.ConfigService.getWorkgroupId();

            // create the auto score annotation
            var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

            return annotation;
        }

        /**
         * Create an auto comment annotation
         * @param runId the run id
         * @param periodId the period id
         * @param nodeId the node id
         * @param componentId the component id
         * @param toWorkgroupId the student workgroup id
         * @param data the annotation data
         * @returns the auto comment annotation
         */

    }, {
        key: 'createAutoCommentAnnotation',
        value: function createAutoCommentAnnotation(data) {

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var toWorkgroupId = this.ConfigService.getWorkgroupId();

            // create the auto comment annotation
            var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

            return annotation;
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
            var _this6 = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        _this6.attachments.push(attachment);
                        _this6.studentDataChanged();
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
        key: 'getNumRows',


        /**
         * Get the number of rows for the textarea
         */
        value: function getNumRows() {
            var numRows = null;

            if (this.componentContent != null) {
                numRows = this.componentContent.numRows;
            }

            return numRows;
        }
    }, {
        key: 'getNumColumns',


        /**
         * Get the number of columns for the textarea
         */
        value: function getNumColumns() {
            var numColumns = null;

            if (this.componentContent != null) {
                numColumns = this.componentContent.numColumns;
            }

            return numColumns;
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
        key: 'importWork',


        /**
         * Import work from another component
         */
        value: function importWork() {

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
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.AnimationService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);

                            // make the work dirty so that it gets saved
                            this.studentDataChanged();
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
        key: 'isCRaterEnabled',


        /**
         * Check if CRater is enabled for this component
         * @returns whether CRater is enabled for this component
         */
        value: function isCRaterEnabled() {
            var result = false;

            if (this.CRaterService.isCRaterEnabled(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on save
         * @returns whether CRater is set to score on save
         */

    }, {
        key: 'isCRaterScoreOnSave',
        value: function isCRaterScoreOnSave() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on submit
         * @returns whether CRater is set to score on submit
         */

    }, {
        key: 'isCRaterScoreOnSubmit',
        value: function isCRaterScoreOnSubmit() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score on change
         * @returns whether CRater is set to score on change
         */

    }, {
        key: 'isCRaterScoreOnChange',
        value: function isCRaterScoreOnChange() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
                result = true;
            }

            return result;
        }

        /**
         * Check if CRater is set to score when the student exits the step
         * @returns whether CRater is set to score when the student exits the step
         */

    }, {
        key: 'isCRaterScoreOnExit',
        value: function isCRaterScoreOnExit() {
            var result = false;

            if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
                result = true;
            }

            return result;
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
            this.exitListener = this.$scope.$on('exit', function (event, args) {});
        }
    }, {
        key: 'authoringAddScoringRule',


        /**
         * Add a scoring rule
         */
        value: function authoringAddScoringRule() {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

                // create a scoring rule object
                var newScoringRule = {};
                newScoringRule.score = "";
                newScoringRule.feedbackText = "";

                // add the new scoring rule object
                this.authoringComponentContent.cRater.scoringRules.push(newScoringRule);

                /*
                 * the author has made changes so we will save the component
                 * content
                 */
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Move a scoring rule up
         * @param index the index of the scoring rule
         */

    }, {
        key: 'authoringViewScoringRuleUpClicked',
        value: function authoringViewScoringRuleUpClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

                // make sure the scoring rule is not already at the top
                if (index != 0) {
                    // the scoring rule is not at the top so we can move it up

                    // get the scoring rule
                    var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

                    // remove the scoring rule
                    this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

                    // add the scoring rule back at the position one index back
                    this.authoringComponentContent.cRater.scoringRules.splice(index - 1, 0, scoringRule);

                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Move a scoring rule down
         * @param index the index of the scoring rule
         */

    }, {
        key: 'authoringViewScoringRuleDownClicked',
        value: function authoringViewScoringRuleDownClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

                // make sure the scoring rule is not already at the end
                if (index != this.authoringComponentContent.cRater.scoringRules.length - 1) {

                    // get the scoring rule
                    var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

                    // remove the scoring rule
                    this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

                    // add the scoring rule back at the position one index forward
                    this.authoringComponentContent.cRater.scoringRules.splice(index + 1, 0, scoringRule);

                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Delete a scoring rule
         * @param index the index of the scoring rule
         */

    }, {
        key: 'authoringViewScoringRuleDeleteClicked',
        value: function authoringViewScoringRuleDeleteClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

                // get the scoring rule
                var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

                if (scoringRule != null) {

                    // get the score and feedback text
                    var score = scoringRule.score;
                    var feedbackText = scoringRule.feedbackText;

                    // make sure the author really wants to delete the scoring rule
                    //var answer = confirm('Are you sure you want to delete this scoring rule?\n\nScore: ' + score + '\n\n' + 'Feedback Text: ' + feedbackText);
                    var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisScoringRule', { score: score, feedbackText: feedbackText }));

                    if (answer) {
                        // the author answered yes to delete the scoring rule
                        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

                        /*
                         * the author has made changes so we will save the component
                         * content
                         */
                        this.authoringViewComponentChanged();
                    }
                }
            }
        }

        /**
         * Add a new notification. Currently assumes this is a notification based on CRaterResult, but
         * we can add different types in the future.
         */

    }, {
        key: 'authoringAddNotification',
        value: function authoringAddNotification() {

            if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

                // create a new notification
                var newNotification = {
                    notificationType: "CRaterResult",
                    enableCriteria: {
                        scoreSequence: ["", ""]
                    },
                    isAmbient: false,
                    dismissCode: "apple",
                    isNotifyTeacher: true,
                    isNotifyStudent: true,
                    notificationMessageToStudent: "{{username}}, " + this.$translate('animation.youGotAScoreOf') + " {{score}}. " + this.$translate('animation.pleaseTalkToYourTeacher') + ".",
                    notificationMessageToTeacher: "{{username}} " + this.$translate('animation.gotAScoreOf') + " {{score}}."
                };

                // add the new notification
                this.authoringComponentContent.notificationSettings.notifications.push(newNotification);

                // the author has made changes so we will save the component content
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Add a multiple attempt scoring rule
         */

    }, {
        key: 'authoringAddMultipleAttemptScoringRule',
        value: function authoringAddMultipleAttemptScoringRule() {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

                // create a new multiple attempt scoring rule
                var newMultipleAttemptScoringRule = {};
                newMultipleAttemptScoringRule.scoreSequence = ["", ""];
                newMultipleAttemptScoringRule.feedbackText = "";

                // add the new multiple attempt scoring rule
                this.authoringComponentContent.cRater.multipleAttemptScoringRules.push(newMultipleAttemptScoringRule);

                /*
                 * the author has made changes so we will save the component
                 * content
                 */
                this.authoringViewComponentChanged();
            }
        }

        /**
         * Move a multiple attempt scoring rule up
         * @param index
         */

    }, {
        key: 'authoringViewMultipleAttemptScoringRuleUpClicked',
        value: function authoringViewMultipleAttemptScoringRuleUpClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

                // make sure the multiple attempt scoring rule is not already at the top
                if (index != 0) {
                    // the multiple attempt scoring rule is not at the top

                    // get the multiple attempt scoring rule
                    var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

                    // remove the multiple attempt scoring rule
                    this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

                    // add the multiple attempt scoring rule back at the position one index back
                    this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index - 1, 0, multipleAttemptScoringRule);

                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Move a multiple attempt scoring rule down
         * @param index the index of the multiple attempt scoring rule
         */

    }, {
        key: 'authoringViewMultipleAttemptScoringRuleDownClicked',
        value: function authoringViewMultipleAttemptScoringRuleDownClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

                // make sure the multiple attempt scoring rule is not at the end
                if (index != this.authoringComponentContent.cRater.multipleAttemptScoringRules.length - 1) {
                    // the multiple attempt scoring rule is not at the end

                    // get the multiple attempt scoring rule
                    var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

                    // remove the multiple attempt scoring rule
                    this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

                    // add the multiple attempt scoring rule back at the position one index forward
                    this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index + 1, 0, multipleAttemptScoringRule);

                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Delete a multiple attempt scoring rule
         * @param index the index of the mulitple attempt scoring rule
         */

    }, {
        key: 'authoringViewMultipleAttemptScoringRuleDeleteClicked',
        value: function authoringViewMultipleAttemptScoringRuleDeleteClicked(index) {

            if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

                // get the multiple attempt scoring rule
                var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

                if (multipleAttemptScoringRule != null) {

                    // get the score sequence
                    var scoreSequence = multipleAttemptScoringRule.scoreSequence;
                    var previousScore = "";
                    var currentScore = "";

                    if (scoreSequence != null) {
                        previousScore = scoreSequence[0];
                        currentScore = scoreSequence[1];
                    }

                    // get the feedback text
                    var feedbackText = multipleAttemptScoringRule.feedbackText;

                    // make sure the author really wants to delete the multiple attempt scoring rule
                    var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisMultipleAttemptScoringRule', { previousScore: previousScore, currentScore: currentScore, feedbackText: feedbackText }));

                    if (answer) {
                        // the author answered yes to delete the multiple attempt scoring rule
                        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

                        /*
                         * the author has made changes so we will save the component
                         * content
                         */
                        this.authoringViewComponentChanged();
                    }
                }
            }
        }

        /**
         * Move a notification up
         * @param index of the notification
         */

    }, {
        key: 'authoringViewNotificationUpClicked',
        value: function authoringViewNotificationUpClicked(index) {

            if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

                // make sure the notification is not already at the top
                if (index != 0) {
                    // the notification is not at the top

                    // get the notification
                    var notification = this.authoringComponentContent.notificationSettings.notifications[index];

                    // remove the notification
                    this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

                    // add the notification back at the position one index back
                    this.authoringComponentContent.notificationSettings.notifications.splice(index - 1, 0, notification);

                    // the author has made changes so we will save the component content
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Move a notification down
         * @param index the index of the notification
         */

    }, {
        key: 'authoringViewNotificationDownClicked',
        value: function authoringViewNotificationDownClicked(index) {

            if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

                // make sure the notification is not at the end
                if (index != this.authoringComponentContent.notificationSettings.notifications.length - 1) {
                    // the notification is not at the end

                    // get the notification
                    var notification = this.authoringComponentContent.notificationSettings.notifications[index];

                    // remove the notification
                    this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

                    // add the notification back at the position one index forward
                    this.authoringComponentContent.notificationSettings.notifications.splice(index + 1, 0, notification);

                    // the author has made changes so we will save the component content
                    this.authoringViewComponentChanged();
                }
            }
        }

        /**
         * Delete a notification
         * @param index the index of the notification
         */

    }, {
        key: 'authoringViewNotificationDeleteClicked',
        value: function authoringViewNotificationDeleteClicked(index) {

            if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

                // get the notification
                var notification = this.authoringComponentContent.notificationSettings.notifications[index];

                if (notification != null) {

                    // get the score sequence
                    var scoreSequence = notification.enableCriteria.scoreSequence;
                    var previousScore = "";
                    var currentScore = "";

                    if (scoreSequence != null) {
                        previousScore = scoreSequence[0];
                        currentScore = scoreSequence[1];
                    }

                    // make sure the author really wants to delete the notification
                    var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisNotification', { previousScore: previousScore, currentScore: currentScore }));

                    if (answer) {
                        // the author answered yes to delete the notification
                        this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

                        // the author has made changes so we will save the component content
                        this.authoringViewComponentChanged();
                    }
                }
            }
        }

        /**
         * The "Enable CRater" checkbox was clicked
         */

    }, {
        key: 'authoringViewEnableCRaterClicked',
        value: function authoringViewEnableCRaterClicked() {

            if (this.authoringComponentContent.enableCRater) {
                // CRater was turned on

                if (this.authoringComponentContent.cRater == null) {
                    /*
                     * the cRater object does not exist in the component content
                     * so we will create it
                     */

                    // create the cRater object
                    var cRater = {};
                    cRater.itemType = "CRATER";
                    cRater.itemId = "";
                    cRater.scoreOn = "submit";
                    cRater.showScore = true;
                    cRater.showFeedback = true;
                    cRater.scoringRules = [];
                    cRater.enableMultipleAttemptScoringRules = false;
                    cRater.multipleAttemptScoringRules = [];

                    // set the cRater object into the component content
                    this.authoringComponentContent.cRater = cRater;
                }

                // turn on the submit button
                //this.authoringComponentContent.showSubmitButton = true;
                this.setShowSubmitButtonValue(true);
            } else {
                // CRater was turned off

                // turn off the submit button
                this.setShowSubmitButtonValue(false);
            }

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
        }

        /**
         * The "Enable Multiple Attempt Feedback" checkbox was clicked
         */

    }, {
        key: 'enableMultipleAttemptScoringRulesClicked',
        value: function enableMultipleAttemptScoringRulesClicked() {

            // get the cRater object from the component content
            var cRater = this.authoringComponentContent.cRater;

            if (cRater != null && cRater.multipleAttemptScoringRules == null) {
                /*
                 * the multiple attempt scoring rules array does not exist so
                 * we will create it
                 */
                cRater.multipleAttemptScoringRules = [];
            }

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
        }

        /**
         * The "Enable Notifications" checkbox was clicked
         */

    }, {
        key: 'authoringViewEnableNotificationsClicked',
        value: function authoringViewEnableNotificationsClicked() {

            if (this.authoringComponentContent.enableNotifications) {
                // Notifications was turned on

                if (this.authoringComponentContent.notificationSettings == null) {
                    /*
                     * the NotificationSettings object does not exist in the component content
                     * so we will create it
                     */
                    this.authoringComponentContent.notificationSettings = {
                        notifications: []
                    };
                }
            }

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
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
         * Returns all the revisions made by this user for the specified component
         */

    }, {
        key: 'getRevisions',
        value: function getRevisions() {
            // get the component states for this component
            return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        }
    }, {
        key: 'authoringImportPreviousWorkClicked',


        /**
         * The import previous work checkbox was clicked
         */
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

        /**
         * The play button was clicked
         */

    }, {
        key: 'playButtonClicked',
        value: function playButtonClicked() {

            // set the animation state
            this.animationState = 'playing';

            // start the animation
            this.startAnimation();
        }

        /**
         * The pause button was clicked
         */

    }, {
        key: 'pauseButtonClicked',
        value: function pauseButtonClicked() {

            // set the animation state
            this.animationState = 'paused';

            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {
                            var id = object.id;

                            // get the svg object
                            var svgObject = this.idToSVGObject[id];

                            if (svgObject != null) {

                                // pause the object from animating
                                svgObject.pause();
                            }
                        }
                    }
                }
            }
        }

        /**
         * The resume button was clicked
         */

    }, {
        key: 'resumeButtonClicked',
        value: function resumeButtonClicked() {

            // set the animation state
            this.animationState = 'playing';

            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {
                            var id = object.id;

                            // get the svg object
                            var svgObject = this.idToSVGObject[id];

                            if (svgObject != null) {

                                // resume playing the object animation
                                svgObject.play();
                            }
                        }
                    }
                }
            }
        }

        /**
         * The stop button was clicked
         */

    }, {
        key: 'stopButtonClicked',
        value: function stopButtonClicked() {

            // set the animation state
            this.animationState = 'stopped';

            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {
                            var id = object.id;

                            // get the svg object
                            var svgObject = this.idToSVGObject[id];

                            if (svgObject != null) {

                                var jumpToEnd = true;
                                var clearQueue = true;

                                /*
                                 * We need to play it in case it is currently paused.
                                 * There is a minor bug in the animation library
                                 * which is cause if you pause an animation and
                                 * then stop the animation. Then if you try to play the
                                 * animation, the animation will not play. We avoid
                                 * this problem by making sure the object animation
                                 * is playing when we stop it.
                                 */
                                svgObject.play();

                                // stop the object from animating
                                svgObject.stop(jumpToEnd, clearQueue);
                            }
                        }
                    }
                }
            }

            // set the images back to their starting images in case they have changed
            this.initializeObjectImages();

            // put the objects in their starting positions
            this.initializeObjectPositions();
        }

        /**
         * Check if any of the objects are animating
         * @return whether any of the objects are animating
         */

    }, {
        key: 'areAnyObjectsAnimating',
        value: function areAnyObjectsAnimating() {

            if (this.componentContent != null) {

                // get the objects
                var objects = this.componentContent.objects;

                if (objects != null) {

                    // loop through all the objects
                    for (var o = 0; o < objects.length; o++) {
                        var object = objects[o];

                        if (object != null) {
                            var id = object.id;

                            if (this.idToAnimationState[id]) {
                                // an object is animating
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }

        /**
         * Whether we are using the cartesian coordinate system
         * @return whether we are using the cartesian coordinate system
         */

    }, {
        key: 'isUsingCartesianCoordinateSystem',
        value: function isUsingCartesianCoordinateSystem() {

            if (this.coordinateSystem == 'cartesian') {
                // we are using the cartesian coordinate system
                return true;
            }

            return false;
        }

        /**
         * Convert the y value to the cartesian coordinate system
         * @param y the pixel y value in the screen coordinate system
         * @return the pixel y value in the cartesian coordinate system
         */

    }, {
        key: 'convertToCartesianCoordinateSystem',
        value: function convertToCartesianCoordinateSystem(y) {
            return this.height - y;
        }
    }]);

    return AnimationController;
}();

;

AnimationController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnimationService', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AnimationController;
//# sourceMappingURL=animationController.js.map