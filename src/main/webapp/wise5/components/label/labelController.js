'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

var _fabric = require('fabric');

var _fabric2 = _interopRequireDefault(_fabric);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LabelController = function () {
  function LabelController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, $window, AnnotationService, ConfigService, LabelService, NodeService, NotebookService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, LabelController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$window = $window;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.LabelService = LabelService;
    this.NodeService = NodeService;
    this.NotebookService = NotebookService;
    this.OpenResponseService = OpenResponseService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
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

    // whether the submit button is disabled
    this.isSubmitButtonDisabled = false;

    // counter to keep track of the number of submits
    this.submitCounter = 0;

    // flag for whether to show the advanced authoring
    this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    this.showJSONAuthoring = false;

    // the latest annotations
    this.latestAnnotations = null;

    // whether the new label button is shown or not
    this.isNewLabelButtonVisible = true;

    // whether the cancel button is shown or not
    this.isCancelButtonVisible = false;

    // whether the snip image button is shown or not
    this.isSnipImageButtonVisible = true;

    // the label for the notebook in thos project
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    // whether the student can create new labels
    this.canCreateLabels = true;

    // whether the student is in the mode to create a new label
    this.createLabelMode = false;

    // a reference to the canvas
    this.canvas = null;

    // the canvas width
    this.canvasWidth = 800;

    // the canvas height
    this.canvasHeight = 600;

    // the z index of line elements
    this.lineZIndex = 0;

    // the z index of text elements
    this.textZIndex = 1;

    // the z index of circle elements
    this.circleZIndex = 2;

    // the canvas id
    this.canvasId = 'c';

    // the background image path
    this.backgroundImage = null;

    // whether to show the reset button
    this.isResetButtonVisible = true;

    this.enableCircles = true;

    // modify Fabric so that Text elements can utilize padding
    fabric.Text.prototype.set({
      _getNonTransformedDimensions: function _getNonTransformedDimensions() {
        // Object dimensions
        return new fabric.Point(this.width, this.height).scalarAdd(this.padding);
      },
      _calculateCurrentDimensions: function _calculateCurrentDimensions() {
        // Controls dimensions
        return fabric.util.transformPoint(this._getTransformedDimensions(), this.getViewportTransform(), true);
      }
    });

    /*
     * Student data version 1 is where the text x and y positioning is relative
     * to the circle.
     * Student data version 2 is where the text x and y positioning is absolute.
     */
    this.studentDataVersion = 2;

    /*
     * This will hold canvas label objects. A canvas label object contains a
     * circle object, line object, and text object.
     */
    this.labels = [];

    // the options for when to update this component from a connected component
    this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'OpenResponse' }, { type: 'Table' }];

    this.nodeId = this.$scope.nodeId;

    // get the component content from the scope
    this.componentContent = this.$scope.componentContent;

    // get the authoring component content
    this.authoringComponentContent = this.$scope.authoringComponentContent;
    this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

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

      this.canvasId = 'canvas_' + this.nodeId + '_' + this.componentId;

      // get the component state from the scope
      var componentState = this.$scope.componentState;

      if (this.componentContent.canCreateLabels != null) {
        this.canCreateLabels = this.componentContent.canCreateLabels;
      }

      if (this.componentContent.width != null) {
        this.canvasWidth = this.componentContent.width;
      }

      if (this.componentContent.height != null) {
        this.canvasHeight = this.componentContent.height;
      }

      if (this.componentContent.enableCircles != null) {
        this.enableCircles = this.componentContent.enableCircles;
      }

      if (this.mode === 'student') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

        if (this.onlyHasShowWorkConnectedComponents()) {
          this.isDisabled = true;
        }

        if (this.canCreateLabels) {
          this.isNewLabelButtonVisible = true;
        } else {
          this.isNewLabelButtonVisible = false;
        }

        if (this.isDisabled) {
          this.isNewLabelButtonVisible = false;
          this.canCreateLabels = false;
          this.isResetButtonVisible = false;
        }

        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isNewLabelButtonVisible = false;
        this.isSnipImageButtonVisible = false;
        this.isDisabled = true;

        if (componentState != null) {
          // create a unique id for the application label element using this component state
          this.canvasId = 'labelCanvas_' + componentState.id;
          if (this.mode === 'gradingRevision') {
            this.canvasId = 'labelCanvas_gradingRevision_' + componentState.id;
          }
        }

        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      } else if (this.mode === 'onlyShowWork') {
        this.isPromptVisible = false;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isNewLabelButtonVisible = false;
        this.isSnipImageButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'showPreviousWork') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isNewLabelButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'authoring') {
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

        if (this.componentContent.enableCircles == null) {
          /*
           * If this component was created before enableCircles was implemented,
           * we will default it to true in the authoring so that the
           * "Enable Dots" checkbox is checked.
           */
          this.authoringComponentContent.enableCircles = true;
        }

        this.updateAdvancedAuthoringView();

        $scope.$watch(function () {
          return this.authoringComponentContent;
        }.bind(this), function (newValue, oldValue) {
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);

          // the canvas width
          this.canvasWidth = 800;

          // the canvas height
          this.canvasHeight = 600;

          this.submitCounter = 0;
          this.isSaveButtonVisible = this.componentContent.showSaveButton;
          this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
          this.enableCircles = this.componentContent.enableCircles;

          if (this.canvas != null) {

            // clear the parent to remove the canvas
            $('#canvasParent_' + this.canvasId).empty();

            // create a new canvas
            var canvas = $('<canvas/>');
            canvas.attr('id', this.canvasId);
            canvas.css('border', '1px solid black');

            // add the new canvas
            $('#canvasParent_' + this.canvasId).append(canvas);

            /*
             * clear the background so that setupCanvas() can
             * reapply the background
             */
            this.backgroundImage = null;

            // setup the new canvas
            this.setupCanvas();
          }

          if (this.componentContent.canCreateLabels != null) {
            this.canCreateLabels = this.componentContent.canCreateLabels;
          }

          if (this.canCreateLabels) {
            this.isNewLabelButtonVisible = true;
          } else {
            this.isNewLabelButtonVisible = false;
          }
        }.bind(this), true);
      }

      this.$timeout(angular.bind(this, function () {
        // wait for angular to completely render the html before we initialize the canvas

        this.setupCanvas();
      }));
    }

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function () {
      return this.$scope.labelController.isDirty;
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
        if (this.$scope.labelController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.labelController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.labelController.createComponentState(action).then(function (componentState) {
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

    /**
     * The student has changed the file input
     * @param element the file input element
     */
    this.$scope.fileUploadChanged = function (element) {
      var _this2 = this;

      // get the current background image if any
      var backgroundImage = this.labelController.getBackgroundImage();

      var overwrite = true;

      if (backgroundImage != null && backgroundImage != '') {
        /*
         * there is an existing background image so we will ask the
         * student if they want to change it
         */
        var answer = confirm(this.labelController.$translate('label.areYouSureYouWantToChangeTheBackgroundImage'));

        if (answer) {
          // the student wants to change the background image
          overwrite = true;
        } else {
          // the student does not want to change the background image
          overwrite = false;

          /*
           * clear the input file value otherwise it will show the
           * name of the file they recently selected but decided not
           * to use because they decided not to change the background
           * image
           */
          element.value = null;
        }
      }

      if (overwrite) {
        // we will change the current background

        // get the files from the file input element
        var files = element.files;

        if (files != null && files.length > 0) {

          // upload the file to the studentuploads folder
          this.labelController.StudentAssetService.uploadAsset(files[0]).then(function (unreferencedAsset) {

            // make a referenced copy of the unreferenced asset
            _this2.labelController.StudentAssetService.copyAssetForReference(unreferencedAsset).then(function (referencedAsset) {

              if (referencedAsset != null) {
                // get the url of the referenced asset
                var imageURL = referencedAsset.url;

                if (imageURL != null && imageURL != '') {

                  // set the referenced asset as the background image
                  _this2.labelController.setBackgroundImage(imageURL);
                  _this2.labelController.studentDataChanged();
                }
              }
            });
          });
        }
      }
    };

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
                _this.authoringComponentContent.backgroundImage = fileName;

                // the authoring component content has changed so we will save the project
                _this.authoringViewComponentChanged();
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
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
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

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  _createClass(LabelController, [{
    key: 'setupCanvas',
    value: function setupCanvas() {
      // initialize the canvas
      var canvas = this.initializeCanvas();
      this.canvas = canvas;

      // get the component state from the scope
      var componentState = this.$scope.componentState;

      if (!this.disabled) {
        // create the key down listener to listen for the delete key
        this.createKeydownListener();
      }

      // set whether studentAttachment is enabled
      this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

      if (this.mode == 'student') {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          // we will show work from another component
          this.handleConnectedComponents();
        } else if (this.LabelService.componentStateHasStudentWork(componentState, this.componentContent)) {
          /*
           * the student has work so we will populate the work into this
           * component
           */
          this.setStudentWork(componentState);
        } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // we will import work from another component
          this.handleConnectedComponents();

          if (this.componentContent.labels != null) {
            // populate the canvas with the starter labels
            this.addLabelsToCanvas(this.componentContent.labels);
          }
        } else if (this.LabelService.componentStateIsSameAsStarter(componentState, this.componentContent)) {
          // the student labels are the same as the starter labels
          this.setStudentWork(componentState);
        } else if (componentState == null) {
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
          } else if (this.componentContent.labels != null) {
            /*
             * the student has not done any work and there are starter labels
             * so we will populate the canvas with the starter labels
             */
            this.addLabelsToCanvas(this.componentContent.labels);
          }
        }
      } else if (this.mode === 'grading') {
        // populate the student work into this component
        this.setStudentWork(componentState);
      } else {
        if (componentState == null && this.componentContent.labels != null) {
          // populate the canvas with the starter labels
          this.addLabelsToCanvas(this.componentContent.labels);
        } else {
          // populate the student work into this component
          this.setStudentWork(componentState);
        }
      }

      // get the background image that may have been set by the student data
      var backgroundImage = this.getBackgroundImage();

      if (backgroundImage == null && this.componentContent.backgroundImage != null) {
        // get the background image from the component content if any
        this.setBackgroundImage(this.componentContent.backgroundImage);
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

          if (studentData.version == null) {
            this.setStudentDataVersion(1);
          } else {
            this.setStudentDataVersion(studentData.version);
          }

          // get the labels from the student data
          var labels = studentData.labels;

          // add the labels to the canvas
          this.addLabelsToCanvas(labels);

          // get the background image from the student data
          var backgroundImage = studentData.backgroundImage;

          if (backgroundImage != null) {
            this.setBackgroundImage(backgroundImage);
          }

          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
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
    key: 'addLabelsToCanvas',


    /**
     * Add labels ot the canvas
     * @param labels an array of objects that contain the values for a label
     */
    value: function addLabelsToCanvas(labels) {
      if (labels != null) {

        // loop through all the labels
        for (var x = 0; x < labels.length; x++) {

          // get a label
          var label = labels[x];

          if (label != null) {

            // get the values of the label
            var pointX = label.pointX;
            var pointY = label.pointY;
            var textX = label.textX;
            var textY = label.textY;
            var text = label.text;
            var color = label.color;
            var canEdit = label.canEdit;
            var canDelete = label.canDelete;

            // create the label
            var label = this.createLabel(pointX, pointY, textX, textY, text, color, canEdit, canDelete);

            // add the label to the canvas
            this.addLabelToCanvas(this.canvas, label);
          }
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

      //this.isSubmit = true;

      // tell the parent node that this component wants to submit
      //this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
     * Called when the student clicks on the new label button to enter
     * create label mode
     */

  }, {
    key: 'newLabelButtonClicked',
    value: function newLabelButtonClicked() {
      this.createLabelMode = true;
      this.isCancelButtonVisible = true;
      this.editLabelMode = false;
      this.selectedLabel = null;
    }
  }, {
    key: 'cancelButtonClicked',


    /**
     * Called when the student clicks on the cancel button to exit
     * create label mode
     */
    value: function cancelButtonClicked() {
      this.createLabelMode = false;
      this.isCancelButtonVisible = false;
    }
  }, {
    key: 'incrementSubmitCounter',


    /**
     * Increment the submit counter
     */
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
        _this3.$scope.$emit('componentStudentDataChanged', { nodeId: _this3.nodeId, componentId: componentId, componentState: componentState });
      });
    }
  }, {
    key: 'getLabelData',


    /**
     * Get the label data from the canvas.
     * @returns An array of simple JSON objects that contain the label data.
     */
    value: function getLabelData() {
      var labels = [];

      /*
       * get all the circle objects from the canvas which each correspond to
       * a label point
       */
      var objects = this.canvas.getObjects('i-text');

      if (objects != null) {

        // loop through all the circle objects
        for (var x = 0; x < objects.length; x++) {

          /*
           * the object is a circle which contains all the data
           * for a label
           */
          var object = objects[x];

          if (object != null) {

            // get the simple JSON object that represents the label
            var labelJSONObject = this.getLabelJSONObjectFromText(object);

            if (labelJSONObject != null) {
              // add the object to our array of labels
              labels.push(labelJSONObject);
            }
          }
        }
      }

      return labels;
    }
  }, {
    key: 'getLabelJSONObjectFromCircle',


    /**
     * Get the simple JSON object that represents the label
     * @param circle a Fabric circle object
     * @returns a simple JSON object that represents the label
     */
    value: function getLabelJSONObjectFromCircle(circle) {
      var labelJSONObject = {};

      // get the label object that contains the circle, line, and text objects
      var label = this.getLabelFromCircle(circle);

      // get the line associated with the circle
      var lineObject = circle.line;

      // get the text object associated with the circle
      var textObject = circle.text;

      // get the position of the circle
      var pointX = circle.get('left');
      var pointY = circle.get('top');

      // get the position of the text object
      var textX = null;
      var textY = null;
      if (this.isStudentDataVersion(1)) {
        /*
         * get the offset of the end of the line (this is where the text object is
         * also located)
         */
        var xDiff = lineObject.x2 - lineObject.x1;
        var yDiff = lineObject.y2 - lineObject.y1;

        // the text x and y position is relative to the circle
        textX = xDiff;
        textY = yDiff;
      } else {
        // the text x and y position is absolute
        textX = textObject.left;
        textY = textObject.top;
      }

      // get the text and background color of the text
      var text = label.textString;
      var color = textObject.backgroundColor;

      // set all the values into the object
      labelJSONObject.pointX = parseInt(pointX);
      labelJSONObject.pointY = parseInt(pointY);
      labelJSONObject.textX = parseInt(textX);
      labelJSONObject.textY = parseInt(textY);
      labelJSONObject.text = text;
      labelJSONObject.color = color;

      return labelJSONObject;
    }
  }, {
    key: 'getLabelJSONObjectFromText',


    /**
     * Get the simple JSON object that represents the label
     * @param text a Fabric text object
     * @returns a simple JSON object that represents the label
     */
    value: function getLabelJSONObjectFromText(text) {
      var labelJSONObject = {};

      // get the label object that contains the circle, line, and text objects
      var label = this.getLabelFromText(text);
      var circleObject = label.circle;
      var lineObject = label.line;
      var textObject = label.text;

      // get the position of the circle
      var pointX = circleObject.get('left');
      var pointY = circleObject.get('top');

      // get the position of the text object
      var textX = null;
      var textY = null;
      if (this.isStudentDataVersion(1)) {
        /*
         * get the offset of the end of the line (this is where the text object is
         * also located)
         */
        var xDiff = lineObject.x2 - lineObject.x1;
        var yDiff = lineObject.y2 - lineObject.y1;

        // the text x and y position is relative to the circle
        textX = xDiff;
        textY = yDiff;
      } else {
        // the text x and y position is absolute
        textX = textObject.left;
        textY = textObject.top;
      }

      // get the text and background color of the text
      var textString = label.textString;
      var color = textObject.backgroundColor;

      // set all the values into the object
      labelJSONObject.pointX = parseInt(pointX);
      labelJSONObject.pointY = parseInt(pointY);
      labelJSONObject.textX = parseInt(textX);
      labelJSONObject.textY = parseInt(textY);
      labelJSONObject.text = textString;
      labelJSONObject.color = color;

      var canEdit = label.canEdit;
      if (canEdit == null) {
        canEdit = false;
      }
      labelJSONObject.canEdit = canEdit;

      var canDelete = label.canDelete;
      if (canDelete == null) {
        canDelete = false;
      }
      labelJSONObject.canDelete = canDelete;

      return labelJSONObject;
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
      studentData.version = this.getStudentDataVersion();
      studentData.labels = this.getLabelData();

      var backgroundImage = this.getBackgroundImage();
      if (backgroundImage != null) {
        studentData.backgroundImage = backgroundImage;
      }

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'Label';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;

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
    key: 'showNewLabelButton',


    /**
     * Check whether we need to show the new label button
     * @returns whether to show the new label button
     */
    value: function showNewLabelButton() {
      return this.isNewLabelButtonVisible;
    }
  }, {
    key: 'showCancelButton',


    /**
     * Check whether we need to show the cancel button
     * @returns whether to show the cancel button
     */
    value: function showCancelButton() {
      return this.isCancelButtonVisible;
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
      }
    }
  }, {
    key: 'attachStudentAsset',
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
              var populatedComponentState = this.LabelService.populateComponentState(importWorkComponentState);

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
    key: 'initializeCanvas',


    /**
     * Initialize the canvas
     * @returns the canvas object
     */
    value: function initializeCanvas() {

      var canvas = null;

      if (this.componentContent.width != null && this.componentContent.width != '') {
        this.canvasWidth = this.componentContent.width;
      }

      if (this.componentContent.height != null && this.componentContent.height != '') {
        this.canvasHeight = this.componentContent.height;
      }

      // get the canvas object from the html
      if (this.isDisabled) {
        // we will make the canvas uneditable
        canvas = new fabric.StaticCanvas(this.canvasId);
      } else {
        // make the canvas editable
        canvas = new fabric.Canvas(this.canvasId);
      }

      // disable selection of items
      canvas.selection = false;

      // change the cursor to a hand when it is hovering over an object
      canvas.hoverCursor = 'pointer';

      // set the width and height of the canvas
      canvas.setWidth(this.canvasWidth);
      canvas.setHeight(this.canvasHeight);
      document.getElementById(this.canvasId).width = this.canvasWidth;
      document.getElementById(this.canvasId).height = this.canvasHeight;

      // set the height on the parent div so that a vertical scrollbar doesn't show up
      $('#canvasParent_' + this.canvasId).css('height', this.canvasHeight + 2);

      // listen for the mouse down event
      canvas.on('mouse:down', angular.bind(this, function (options) {

        // get the object that was clicked on if any
        var activeObject = this.canvas.getActiveObject();

        if (activeObject == null) {
          /*
           * no objects in the canvas were clicked. the user clicked
           * on a blank area of the canvas so we will unselect any label
           * that was selected and turn off edit label mode
           */
          this.selectedLabel = null;
          this.editLabelMode = false;
        }

        // check if the student is in create label mode
        if (this.createLabelMode) {
          /*
           * the student is in create label mode so we will create a new label
           * where they have clicked
           */

          // turn off create label mode and hide the cancel button
          this.createLabelMode = false;
          this.isCancelButtonVisible = false;

          var event = options.e;

          if (event != null) {
            // get the x and y position that the student clicked on
            var x = event.layerX;
            var y = event.layerY;

            /*
             * set the location of the text object to be down to the right
             * of the position the student clicked on
             */
            var textX = null;
            var textY = null;
            if (this.enableCircles) {
              // place the text to the bottom right of the circle
              if (this.isStudentDataVersion(1)) {
                // text is relatively positioned
                textX = 100;
                textY = 100;
              } else {
                // text is absolutely positioned
                textX = x + 100;
                textY = y + 100;
              }
            } else {
              // circles are not enabled so we are only using the text
              textX = x;
              textY = y;
            }

            var canEdit = true;
            var canDelete = true;

            // create a new label
            var newLabel = this.createLabel(x, y, textX, textY, this.$translate('label.aNewLabel'), 'blue', canEdit, canDelete);

            // add the label to the canvas
            this.addLabelToCanvas(this.canvas, newLabel);

            /*
             * make the new label selected so that the student can edit
             * the text
             */
            this.selectLabel(newLabel);

            // notify others that the student data has changed
            this.studentDataChanged();
          }
        }
      }));

      // listen for the object moving event
      canvas.on('object:moving', angular.bind(this, function (options) {
        var target = options.target;

        if (target != null) {

          // get the type of the object that is moving
          var type = target.get('type');

          // get the position of the element
          var left = target.get('left');
          var top = target.get('top');

          // limit the x position to the canvas
          if (left < 0) {
            target.set('left', 0);
            left = 0;
          } else if (left > this.canvasWidth) {
            target.set('left', this.canvasWidth);
            left = this.canvasWidth;
          }

          // limit the y position to the canvas
          if (top < 0) {
            target.set('top', 0);
            top = 0;
          } else if (top > this.canvasHeight) {
            target.set('top', this.canvasHeight);
            top = this.canvasHeight;
          }

          if (type === 'circle') {
            /*
             * the student is moving the point of the label so we need to update
             * the endpoint of the line and the position of the text element.
             * the endpoint of the line and the position of the text element should
             * maintain the relative position to the point.
             */

            // get the line associated with the circle
            var line = target.line;

            var xDiff = 0;
            var yDiff = 0;

            if (line != null) {
              // calculate the relative offset of the end of the line
              xDiff = line.x2 - line.x1;
              yDiff = line.y2 - line.y1;

              if (this.isStudentDataVersion(1)) {
                // set the new position of the two endpoints of the line
                line.set({ x1: left, y1: top, x2: left + xDiff, y2: top + yDiff });
              } else {
                // set the new position of the circle endpoint of the line
                line.set({ x1: left, y1: top });
              }

              // remove and add the line to refresh the element in the canvas
              canvas.remove(line);
              canvas.add(line);

              // set the z index so it will be below the circle and text elements
              canvas.moveTo(line, this.lineZIndex);
            }

            // get the text element
            var text = target.text;

            if (text != null) {
              if (this.isStudentDataVersion(1)) {
                /*
                 * In the old student data version the text position is relative
                 * to the circle so we need to move the text along with the circle.
                 */

                // set the new position of the text element
                text.set({ left: left + xDiff, top: top + yDiff });

                // remove and add the line to refresh the element in the canvas
                canvas.remove(text);
                canvas.add(text);

                // set the z index so it will be above line elements and below circle elements
                canvas.moveTo(text, this.textZIndex);
              }
            }
          } else if (type === 'i-text') {
            if (this.enableCircles) {
              /*
               * the student is moving the text of the label so we need to update
               * the endpoint of the line. the endpoint of the line should be in
               * the same position as the text element.
               */
              var line = target.line;
              if (line != null) {
                // set the new position of the text element
                line.set({ x2: left, y2: top });

                // remove and add the line to refresh the element in the canvas
                canvas.remove(line);
                canvas.add(line);

                // set the z index so it will be below the circle and text elements
                canvas.moveTo(line, this.lineZIndex);
              }
            } else {
              /*
               * Circles are not enabled so we are only showing the text. We will
               * set the circle position to be the same as the text position.
               */
              var circle = target.circle;
              var _line = target.line;
              circle.set({ left: left, top: top });
              _line.set({ x1: left, y1: top, x2: left, y2: top });
            }
          }

          // refresh the canvas
          canvas.renderAll();

          // notify others that the student data has changed
          this.studentDataChanged();
        }
      }));

      // listen for the text changed event
      canvas.on('text:changed', angular.bind(this, function (options) {
        var target = options.target;
        if (target != null) {
          var type = target.get('type');
          if (type === 'i-text') {
            // notify others that the student data has changed
            this.studentDataChanged();
          }
        }
      }));

      return canvas;
    }
  }, {
    key: 'setBackgroundImage',


    /**
     * Set the background image
     * @param backgroundImagePath the url path to an image
     */
    value: function setBackgroundImage(backgroundImagePath) {
      if (backgroundImagePath != null) {
        this.backgroundImage = backgroundImagePath;
        this.canvas.setBackgroundImage(backgroundImagePath, this.canvas.renderAll.bind(this.canvas));
      }
    }
  }, {
    key: 'getBackgroundImage',


    /**
     * Get the background image
     * @returns the background image path
     */
    value: function getBackgroundImage() {
      return this.backgroundImage;
    }
  }, {
    key: 'createKeydownListener',


    /**
     * Create the keydown listener that we will use for deleting labels
     */
    value: function createKeydownListener() {
      window.addEventListener('keydown', angular.bind(this, this.keyPressed), false);
    }
  }, {
    key: 'keyPressed',


    /**
     * The callback handler for the keydown event
     * @param e the event
     */
    value: function keyPressed(e) {

      // get the key code of the key that was pressed
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        // the enter key was pressed
        if (this.selectedLabel != null) {
          /*
           * There is a selected label so we will treat the enter keypress as
           * the intention of submitting any changes to the label text.
           */
          this.saveLabelButtonClicked();
          this.$scope.$apply();
        }
      }
    }
  }, {
    key: 'getLabelFromCircle',


    /**
     * Get the label object given the canvas circle object.
     * @param circle A canvas circle object.
     * @return A label object.
     */
    value: function getLabelFromCircle(circle) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.labels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var label = _step.value;

          if (circle == label.circle) {
            return label;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    }

    /**
     * Get the label object given the canvas text object.
     * @param text A canvas text object.
     * @return A label object.
     */

  }, {
    key: 'getLabelFromText',
    value: function getLabelFromText(text) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.labels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var label = _step2.value;

          if (text == label.text) {
            return label;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return null;
    }

    /**
     * Create a label object. The label object is represented by a circle
     * element (the point), a line element, and a text element. The circle
     * element will contain a reference to the line and text elements. The
     * text element will contain a reference to the line element.
     * @param pointX the x position of the point (circle)
     * @param pointY the y position of the point (circle)
     * @param textX the x position of the text relative to the point (circle)
     * @param textY the y position of the text relative to the point (circle)
     * @param textString the text of the label
     * @param color the background color of the label
     * @param canEdit whether the student can edit the label
     * @param canDelete whether the student can delete the label
     * @returns an object containing a circle, line, and text
     */

  }, {
    key: 'createLabel',
    value: function createLabel(pointX, pointY, textX, textY, textString, color, canEdit, canDelete) {
      var label = {};

      // get the position of the point
      var x1 = pointX;
      var y1 = pointY;
      var x2 = null;
      var y2 = null;

      if (this.isStudentDataVersion(1)) {
        // get the absolute position of the text
        x2 = pointX + textX;
        y2 = pointY + textY;
      } else {
        x2 = textX;
        y2 = textY;
      }

      /*
       * Make sure all the positions are within the bounds of the canvas. If there
       * are any positions that are outside the bounds, we will change the
       * position to be within the bounds.
       */
      x1 = this.makeSureXIsWithinXMinMaxLimits(x1);
      y1 = this.makeSureYIsWithinYMinMaxLimits(y1);
      x2 = this.makeSureXIsWithinXMinMaxLimits(x2);
      y2 = this.makeSureYIsWithinYMinMaxLimits(y2);

      if (color == null) {
        // the default background color for text elements will be blue
        color = 'blue';
      }

      var radius = 5;
      if (this.componentContent.pointSize != null && this.componentContent.pointSize != '') {
        radius = parseFloat(this.componentContent.pointSize);
      }

      var fontSize = 20;
      if (this.componentContent.fontSize != null && this.componentContent.fontSize != '') {
        fontSize = parseFloat(this.componentContent.fontSize);
      }

      // create a circle element
      var circle = new fabric.Circle({
        radius: radius,
        left: x1,
        top: y1,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        borderColor: 'red',
        hasBorders: true,
        selectable: true
      });

      // create a line element
      var line = new fabric.Line([x1, y1, x2, y2], {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 3,
        selectable: false
      });

      // wrap the text if necessary
      var wrappedTextString = textString;
      if (this.componentContent.labelWidth) {
        wrappedTextString = this.UtilService.wordWrap(textString, this.componentContent.labelWidth);
      }

      // create an editable text element
      var text = new fabric.IText(wrappedTextString, {
        left: x2,
        top: y2,
        originX: 'center',
        originY: 'center',
        fontSize: fontSize,
        fill: 'white',
        backgroundColor: color,
        width: 100,
        hasControls: false,
        hasBorders: true,
        borderColor: 'red',
        selectable: true,
        cursorWidth: 0,
        editable: false,
        padding: 16
      });

      // give the circle a reference to the line and text elements
      circle.line = line;
      circle.text = text;

      // give the text element a reference to the line and circle elements
      text.line = line;
      text.circle = circle;

      // add the circle, line, and text elements to the label object
      label.circle = circle;
      label.line = line;
      label.text = text;
      label.textString = textString;

      if (canEdit == null) {
        canEdit = true;
      }
      label.canEdit = canEdit;

      if (canDelete == null) {
        canDelete = true;
      }
      label.canDelete = canDelete;

      return label;
    }
  }, {
    key: 'makeSureXIsWithinXMinMaxLimits',


    /**
     * Make sure the x coordinate is within the bounds of the canvas.
     * @param x The x coordinate.
     * @return The x coordinate that may have been modified to be within the
     * bounds.
     */
    value: function makeSureXIsWithinXMinMaxLimits(x) {
      // make sure the x is not to the left of the left edge
      if (x < 0) {
        x = 0;
      }
      // make sure the x is not to the right of the right edge
      if (x > this.canvasWidth) {
        x = this.canvasWidth;
      }
      return x;
    }

    /**
     * Make sure the y coordinate is within the bounds of the canvas.
     * @param y The y coordinate.
     * @return The y coordinate that may have been modified to be within the
     * bounds.
     */

  }, {
    key: 'makeSureYIsWithinYMinMaxLimits',
    value: function makeSureYIsWithinYMinMaxLimits(y) {
      // make sure the y is not above the top edge
      if (y < 0) {
        y = 0;
      }
      // make sure the y is not below the bottom edge
      if (y > this.canvasHeight) {
        y = this.canvasHeight;
      }
      return y;
    }

    /**
     * Add a label to canvas
     * @param canvas the canvas
     * @param label an object that contains a Fabric circle, Fabric line,
     * and Fabric itext elements
     */

  }, {
    key: 'addLabelToCanvas',
    value: function addLabelToCanvas(canvas, label) {
      var _this5 = this;

      if (canvas != null && label != null) {

        // get the circle, line and text elements
        var circle = label.circle;
        var line = label.line;
        var text = label.text;

        if (circle != null && line != null && text != null) {

          if (this.enableCircles) {
            // add the elements to the canvas
            canvas.add(circle, line, text);

            // set the z indexes for the elements
            canvas.moveTo(line, this.lineZIndex);
            canvas.moveTo(text, this.textZIndex);
            canvas.moveTo(circle, this.circleZIndex);
          } else {
            // add the text element to the canvas
            canvas.add(text);
            canvas.moveTo(text, this.textZIndex);
          }

          // refresh the canvas
          canvas.renderAll();

          if (this.enableCircles) {
            circle.on('mousedown', function () {
              /*
               * the circle was clicked so we will make the associated
               * label selected
               */
              _this5.selectLabel(label);
            });
          }

          text.on('mousedown', function () {
            /*
             * the text was clicked so we will make the associated
             * label selected
             */
            _this5.selectLabel(label);
          });

          this.labels.push(label);
        }
      }
    }
  }, {
    key: 'selectLabel',


    /**
     * Make the label selected which means we will show the UI elements to
     * allow the text to be edited and the label to deleted.
     * @param label the label object
     */
    value: function selectLabel(label) {
      // create a reference to the selected label
      this.selectedLabel = label;

      if (label.canEdit) {
        /*
         * remember the label text before the student changes it in case the
         * student wants to cancel any changes they make
         */
        this.selectedLabelText = label.text.text;

        // show the label text input
        this.editLabelMode = true;

        /*
         * Give focus to the label text input element so the student can immediately
         * start typing.
         */
        this.$timeout(function () {
          /*
           * Get the y position of the top of the edit label text input. If this
           * value is negative, it means the element is above the currently
           * viewable area and can not be seen. If the value is positive, it means
           * the element is currently in the viewable area and can be seen.
           */
          var editLabelTextInputTop = $('#editLabelTextInput').offset().top;

          /*
           * Check if the edit label text input is viewable. We want to make sure
           * the input is in view. If the input is not in view and we give it
           * focus, it will have the undesirable effect of scrolling the view up
           * so that the input comes into view. We don't want it to scroll because
           * it's jarring when the student is trying to select a label in the
           * canvas.
           */
          if (editLabelTextInputTop > 100) {
            // the input is in view so we will give it focus.
            angular.element('#editLabelTextInput').focus();
          }
        });
      } else {
        // hide label text input
        this.editLabelMode = false;
      }

      /*
       * force angular to refresh, otherwise angular will wait until the
       * user generates another input (such as moving the mouse) before
       * refreshing
       */
      this.$scope.$apply();
    }

    /**
     * The student has changed the label text on the selected label
     * @param label The label that has changed.
     * @param textObject The label's canvas text object.
     * @param textString The text string.
     */

  }, {
    key: 'selectedLabelTextChanged',
    value: function selectedLabelTextChanged(label, textObject, textString) {

      // save the text string into the label
      label.textString = textString;

      // wrap the text if necessary
      var wrappedText = textString;
      if (this.componentContent.labelWidth != null && this.componentContent.labelWidth != '') {
        wrappedText = this.UtilService.wordWrap(textString, this.componentContent.labelWidth);
      }

      // set the wrapped text into the text object
      textObject.setText(wrappedText);

      // notify the controller that the student data has changed
      this.studentDataChanged();

      // refresh the canvas
      this.canvas.renderAll();
    }

    /**
     * Remove a label from the canvas.
     * @param canvas The canvas.
     * @param label A label object that contains a circle object, line object, and
     * text object.
     */

  }, {
    key: 'removeLabelFromCanvas',
    value: function removeLabelFromCanvas(canvas, label) {

      if (canvas != null && label != null) {

        // get the circle, line, and text elements
        var circle = label.circle;
        var line = label.line;
        var text = label.text;

        if (circle != null && line != null && text != null) {
          // remove the elements from the canvas
          canvas.remove(circle);
          canvas.remove(line);
          canvas.remove(text);

          this.labels.splice(this.labels.indexOf(label), 1);

          // refresh the canvas
          canvas.renderAll();
        }
      }
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
        var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        // replace the component in the project
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

        // set the new authoring component content
        this.authoringComponentContent = authoringComponentContent;

        // set the component content
        this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

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
    key: 'getStepNodeIds',


    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
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
     * Add a label in the authoring view
     */

  }, {
    key: 'authoringAddLabelClicked',
    value: function authoringAddLabelClicked() {

      // create the new label
      var newLabel = {};
      newLabel.text = this.$translate('label.enterTextHere');
      newLabel.color = 'blue';
      newLabel.pointX = 100;
      newLabel.pointY = 100;
      newLabel.textX = 200;
      newLabel.textY = 200;
      newLabel.canEdit = false;
      newLabel.canDelete = false;

      // add the label to the array of labels
      this.authoringComponentContent.labels.push(newLabel);

      // save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a label in the authoring view
     * @param index the index of the label in the labels array
     */

  }, {
    key: 'authoringDeleteLabelClicked',
    value: function authoringDeleteLabelClicked(index, label) {

      // get the label text
      var selectedLabelText = label.textString;

      // ask the author if they are sure they want to delete this label
      var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteThisLabel', { selectedLabelText: selectedLabelText }));

      if (answer) {
        // the author answered yes to delete the label

        // delete the label from the array
        this.authoringComponentContent.labels.splice(index, 1);

        // save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Get the image object representation of the student data
     * @returns an image object
     */

  }, {
    key: 'getImageObject',
    value: function getImageObject() {
      var pngFile = null;

      if (this.canvas != null) {

        // get the image as a base64 string
        var img_b64 = this.canvas.toDataURL('image/png');

        // get the image object
        pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
      }

      return pngFile;
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
    key: 'showSnipImageButton',


    /**
     * Check whether we need to show the snip image button
     * @return whether to show the snip image button
     */
    value: function showSnipImageButton() {
      if (this.NotebookService.isNotebookEnabled() && this.isSnipImageButtonVisible) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Snip the labels by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snipImage',
    value: function snipImage($event) {

      // get the canvas element
      var canvas = angular.element('#' + this.canvasId);

      if (canvas != null && canvas.length > 0) {

        // get the top canvas
        canvas = canvas[0];

        // get the canvas as a base64 string
        var img_b64 = canvas.toDataURL('image/png');

        // get the image object
        var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

        // create a notebook item with the image populated into it
        this.NotebookService.addNote($event, imageObject);
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
     * The student clicked the save button in the edit label mode
     */

  }, {
    key: 'saveLabelButtonClicked',
    value: function saveLabelButtonClicked() {
      if (this.selectedLabel != null) {
        /*
         * we do not need to perform any saving of the text since it has
         * already been handled by the ng-model for the label text
         */

        /*
         * remove the reference to the selected label since it will no
         * longer be selected
         */
        this.selectedLabel = null;

        // turn off edit label mode
        this.editLabelMode = false;

        // make the canvas object no longer the active object
        this.canvas.discardActiveObject();
      }
    }

    /**
     * The student clicked the cancel button in the edit label mode
     */

  }, {
    key: 'cancelLabelButtonClicked',
    value: function cancelLabelButtonClicked() {

      if (this.selectedLabel != null) {

        // get the label text before the student recently made changes to it
        var selectedLabelText = this.selectedLabelText;

        // revert the label text to what it was before
        this.selectedLabel.text.setText(selectedLabelText);

        // clear the label text holder
        this.selectedLabelText = null;

        /*
         * remove the reference to the selected label since it will no
         * longer be selected
         */
        this.selectedLabel = null;

        // turn off edit label mode
        this.editLabelMode = false;

        // make the canvas object no longer the active object
        this.canvas.discardActiveObject();

        // notify others that the student data has changed
        this.studentDataChanged();

        // refresh the canvas
        this.canvas.renderAll();
      }
    }

    /**
     * The student clicked the delete button in the edit label mode
     */

  }, {
    key: 'deleteLabelButtonClicked',
    value: function deleteLabelButtonClicked() {

      if (this.selectedLabel != null) {

        // get the text from the label we are going to delete
        var selectedLabelText = this.selectedLabel.textString;

        // confirm with the student that they want to delete the label
        var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteThisLabel', { selectedLabelText: selectedLabelText }));

        if (answer) {
          // the student is sure they want to delete the label
          this.deleteLabel(this.selectedLabel);

          /*
           * remove the reference to the selected label since it will no
           * longer be selected
           */
          this.selectedLabel = null;

          // turn off edit label mode
          this.editLabelMode = false;

          // make the canvas object no longer the active object
          this.canvas.discardActiveObject();

          // notify others that the student data has changed
          this.studentDataChanged();
        }
      }
    }

    /**
     * Delete a label from the canvas.
     * @param label A label object.
     */

  }, {
    key: 'deleteLabel',
    value: function deleteLabel(label) {
      // remove the label from the canvas
      this.removeLabelFromCanvas(this.canvas, label);
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
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'background';

      // display the asset chooser
      this.$rootScope.$broadcast('openAssetChooser', params);
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
     * Save the starter labels from the component authoring preview
     */

  }, {
    key: 'saveStarterLabels',
    value: function saveStarterLabels() {

      // ask the author if they are sure they want to save the starter labels
      var answer = confirm(this.$translate('label.areYouSureYouWantToSaveTheStarterLabels'));

      if (answer) {
        // the author answered yes to save the starter labels

        // get the labels in the component authoring preview
        var labels = this.getLabelData();

        /*
         * make a copy of the labels so we don't run into any referencing issues
         * later
         */
        var starterLabels = this.UtilService.makeCopyOfJSONObject(labels);

        // sort the labels alphabetically by their text
        starterLabels.sort(this.labelTextComparator);

        // set the labels
        this.authoringComponentContent.labels = starterLabels;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * A comparator used to sort labels alphabetically
     * It should be used like labels.sort(this.labelTextComparator);
     * @param labelA a label object
     * @param labelB a label object
     * @return -1 if labelA comes before labelB
     * 1 if labelB comes after labelB
     * 0 of the labels are equal
     */

  }, {
    key: 'labelTextComparator',
    value: function labelTextComparator(labelA, labelB) {

      if (labelA.text < labelB.text) {
        // the labelA text comes before the labelB text alphabetically
        return -1;
      } else if (labelA.text > labelB.text) {
        // the labelA text comes after the labelB text alphabetically
        return 1;
      } else {
        /*
         * the labelA text is the same as the labelB text so we will
         * try to break the tie by looking at the color
         */

        if (labelA.color < labelB.color) {
          // the labelA color text comes before the labelB color text alphabetically
          return -1;
        } else if (labelA.color > labelB.color) {
          // the labelA color text comes after the labelB color text alphabetically
          return 1;
        } else {
          /*
           * the labelA color text is the same as the labelB color text so
           * we will try to break the tie by looking at the pointX
           */

          if (labelA.pointX < labelB.pointX) {
            // the labelA pointX is smaller than the labelB pointX
            return -1;
          } else if (labelA.pointX > labelB.pointX) {
            // the labelA pointX is larger than the labelB pointX
            return 1;
          } else {
            /*
             * the labelA pointX is the same as the labelB pointX so
             * we will try to break the tie by looking at the pointY
             */

            if (labelA.pointY < labelB.pointY) {
              // the labelA pointY is smaller than the labelB pointY
              return -1;
            } else if (labelA.pointY > labelB.pointY) {
              // the labelA pointY is larger than the labelB pointY
              return 1;
            } else {
              /*
               * all the label values are the same between labelA
               * and labelB
               */
              return 0;
            }
          }
        }
      }
    }

    /**
     * Delete all the starter labels
     */

  }, {
    key: 'deleteStarterLabels',
    value: function deleteStarterLabels() {

      /*
       * ask the author if they are sure they want to delete all the starter
       * labels
       */
      var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteAllTheStarterLabels'));

      if (answer) {
        // the author answered yes to delete

        // clear the labels array
        this.authoringComponentContent.labels = [];

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Open a webpage in a new tab that shows a lot of the javascript colors
     */

  }, {
    key: 'openColorViewer',
    value: function openColorViewer() {

      // open the webpage in a new tab
      this.$window.open('http://www.javascripter.net/faq/colornam.htm');
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

      if (this.authoringComponentContent.tags == null) {
        // initialize the tags array
        this.authoringComponentContent.tags = [];
      }

      // add a tag
      this.authoringComponentContent.tags.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag up
     * @param index the index of the tag to move up
     */

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index back
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index forward
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a tag
     * @param index the index of the tag to delete
     */

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {

      // get the connected components
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {

        var componentStates = [];

        // loop through all the connected components
        for (var c = 0; c < connectedComponents.length; c++) {
          var connectedComponent = connectedComponents[c];

          if (connectedComponent != null) {
            var nodeId = connectedComponent.nodeId;
            var componentId = connectedComponent.componentId;
            var type = connectedComponent.type;

            if (type == 'showWork') {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }

              // we are showing work so we will not allow the student to edit it
              this.isDisabled = true;
            } else if (type == 'importWork' || type == null) {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }
            }
          }
        }

        // merge the student responses from all the component states
        var mergedComponentState = this.createMergedComponentState(componentStates);

        // set the student work into the component
        this.setStudentWork(mergedComponentState);

        if (this.componentContent.backgroundImage != null && this.componentContent.backgroundImage != '') {
          /*
           * this component has a background so we will use it instead of
           * the background from the imported student work
           */
          this.setBackgroundImage(this.componentContent.backgroundImage);
        }

        // make the work dirty so that it gets saved
        this.studentDataChanged();
      }
    }

    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var _this6 = this;

      var mergedComponentState = this.NodeService.createNewComponentState();

      if (componentStates != null) {
        var mergedLabels = [];
        var mergedBackgroundImage = null;
        var studentDataVersion = 2;
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];
          if (componentState != null) {
            if (componentState.componentType == 'Label') {
              var studentData = componentState.studentData;
              if (studentData != null) {
                if (studentData.version != null) {
                  studentDataVersion = studentData.version;
                }
                var labels = studentData.labels;
                var backgroundImage = studentData.backgroundImage;
                if (labels != null && labels != '') {
                  mergedLabels = mergedLabels.concat(labels);
                }
                if (backgroundImage != null && backgroundImage != '') {
                  mergedBackgroundImage = backgroundImage;
                }
              }
            } else if (componentState.componentType == 'OpenResponse') {
              var connectedComponent = this.getConnectedComponentForComponentState(componentState);
              if (connectedComponent != null) {
                var _studentData = componentState.studentData;
                var response = _studentData.response;
                if (connectedComponent.importWorkAsBackground) {
                  var charactersPerLine = connectedComponent.charactersPerLine;
                  var spaceInbetweenLines = connectedComponent.spaceInbetweenLines;
                  var fontSize = connectedComponent.fontSize;

                  // create an image from the concept map data
                  this.LabelService.createImageFromText(response, null, null, charactersPerLine, null, spaceInbetweenLines, fontSize).then(function (image) {
                    // set the image as the background
                    _this6.setBackgroundImage(image);

                    // make the work dirty so that it gets saved
                    _this6.studentDataChanged();
                  });
                }
              }
            } else if (componentState.componentType == 'ConceptMap' || componentState.componentType == 'Draw' || componentState.componentType == 'Embedded' || componentState.componentType == 'Graph' || componentState.componentType == 'Table') {
              var _connectedComponent = this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
              if (_connectedComponent.importWorkAsBackground === true) {
                this.setComponentStateAsBackgroundImage(componentState);
              }
            }
          }
        }

        if (mergedLabels != null) {
          mergedComponentState.studentData = {};
          mergedComponentState.studentData.labels = mergedLabels;
          mergedComponentState.studentData.backgroundImage = mergedBackgroundImage;
        }
        if (studentDataVersion != null) {
          mergedComponentState.studentData.version = studentDataVersion;
        }
      }

      return mergedComponentState;
    }

    /**
     * Get the connected component associated with the component state.
     * @param componentState A component state object that was obtained from a
     * connected component.
     * @return A connected component object.
     */

  }, {
    key: 'getConnectedComponentForComponentState',
    value: function getConnectedComponentForComponentState(componentState) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.componentContent.connectedComponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var connectedComponent = _step3.value;

          if (componentState.nodeId == connectedComponent.nodeId && componentState.componentId == connectedComponent.componentId) {
            return connectedComponent;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return null;
    }

    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     */

  }, {
    key: 'setComponentStateAsBackgroundImage',
    value: function setComponentStateAsBackgroundImage(componentState) {
      var _this7 = this;

      this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        _this7.setBackgroundImage(image.url);
      });
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

      /*
       * create the new connected component object that will contain a
       * node id and component id
       */
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

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
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = components[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var component = _step4.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          if (numberOfAllowedComponents == 1) {
            /*
             * there is only one viable component to connect to so we
             * will use it
             */
            connectedComponent.componentId = allowedComponent.id;
            connectedComponent.type = 'importWork';
            this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
          }
        }
      }
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

      if (answer) {
        // the author answered yes to delete

        if (this.authoringComponentContent.connectedComponents != null) {
          this.authoringComponentContent.connectedComponents.splice(index, 1);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Get the connected component type
     * @param connectedComponent get the component type of this connected component
     * @return the connected component type
     */

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

      var connectedComponentType = null;

      if (connectedComponent != null) {

        // get the node id and component id of the connected component
        var nodeId = connectedComponent.nodeId;
        var componentId = connectedComponent.componentId;

        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

        if (component != null) {
          // get the component type
          connectedComponentType = component.type;
        }
      }

      return connectedComponentType;
    }

    /**
     * The connected component node id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        connectedComponent.componentId = null;
        connectedComponent.type = null;
        delete connectedComponent.importWorkAsBackground;
        this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

      if (connectedComponent != null) {

        // default the type to import work
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * If the component type is a certain type, we will set the importWorkAsBackground
     * field to true.
     * @param connectedComponent The connected component object.
     */

  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType == 'ConceptMap' || componentType == 'Draw' || componentType == 'Embedded' || componentType == 'Graph' || componentType == 'Table') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }

    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

          if (allowedConnectedComponentType != null) {
            if (componentType == allowedConnectedComponentType.type) {
              // the component type is allowed
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
      // toggle the JSON authoring textarea
      this.showJSONAuthoring = !this.showJSONAuthoring;

      if (this.jsonStringChanged && !this.showJSONAuthoring) {
        /*
         * the author has changed the JSON and has just closed the JSON
         * authoring view so we will save the component
         */
        this.advancedAuthoringViewComponentChanged();

        // scroll to the top of the component
        this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

        this.jsonStringChanged = false;
      }
    }

    /**
     * The author has changed the JSON manually in the advanced view
     */

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }

    /**
     * The student clicked the reset button so we will delete all the labels and
     * reset the background if applicable.
     */

  }, {
    key: 'resetButtonClicked',
    value: function resetButtonClicked() {
      // confirm with the student that they want to delete the label
      var answer = confirm(this.$translate('label.areYouSureYouWantToReset'));

      if (answer) {
        var tempLabels = [];
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.labels[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var label = _step5.value;

            tempLabels.push(label);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = tempLabels[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var tempLabel = _step6.value;

            this.deleteLabel(tempLabel);
          }

          /*
           * remove the reference to the selected label since it will no
           * longer be selected
           */
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        this.selectedLabel = null;

        // turn off edit label mode
        this.editLabelMode = false;

        // make the canvas object no longer the active object
        this.canvas.discardActiveObject();

        if (this.componentContent.labels != null) {
          /*
           * the student has not done any work and there are starter labels
           * so we will populate the canvas with the starter labels
           */
          this.addLabelsToCanvas(this.componentContent.labels);
        }

        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // we will import work from another component
          this.handleConnectedComponents();
        }

        // notify others that the student data has changed
        this.studentDataChanged();
      }
    }

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the
     * checkbox.
     */

  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (connectedComponent.importWorkAsBackground) {
        // the checkbox is checked
        connectedComponent.charactersPerLine = 100;
        connectedComponent.spaceInbetweenLines = 40;
        connectedComponent.fontSize = 16;
      } else {
        // the checkbox is not checked
        delete connectedComponent.charactersPerLine;
        delete connectedComponent.spaceInbetweenLines;
        delete connectedComponent.fontSize;
        delete connectedComponent.importWorkAsBackground;
      }

      this.authoringViewComponentChanged();
    }

    /**
     * Set the student data version for this controller.
     * @param studentDataVersion The student data version.
     */

  }, {
    key: 'setStudentDataVersion',
    value: function setStudentDataVersion(studentDataVersion) {
      this.studentDataVersion = studentDataVersion;
    }

    /**
     * Get the student data version.
     * @return The student data version.
     */

  }, {
    key: 'getStudentDataVersion',
    value: function getStudentDataVersion() {
      return this.studentDataVersion;
    }

    /**
     * Check if the student data version we are using matches the argument.
     * @param studentDataVersion The studentDataVersion to compare.
     * @return Whether the passed in studentDataVersion matches the
     * studentDataVersion this controller is set to.
     */

  }, {
    key: 'isStudentDataVersion',
    value: function isStudentDataVersion(studentDataVersion) {
      return this.getStudentDataVersion() == studentDataVersion;
    }

    /**
     * Check if this component only has show work connected components.
     * @return If this component has connected components and all of them are
     * 'showWork', then return true. Otherwise return false.
     */

  }, {
    key: 'onlyHasShowWorkConnectedComponents',
    value: function onlyHasShowWorkConnectedComponents() {
      var connectedComponents = this.componentContent.connectedComponents;
      var showWorkConnectedComponentCount = 0;
      if (connectedComponents != null) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = connectedComponents[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var connectedComponent = _step7.value;

            if (connectedComponent.type == 'showWork') {
              showWorkConnectedComponentCount += 1;
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        if (connectedComponents.length > 0 && connectedComponents.length == showWorkConnectedComponentCount) {
          return true;
        }
      }
      return false;
    }
  }]);

  return LabelController;
}();

LabelController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'LabelService', 'NodeService', 'NotebookService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = LabelController;
//# sourceMappingURL=labelController.js.map
