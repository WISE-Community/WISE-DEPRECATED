'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

var _fabric = require('fabric');

var _fabric2 = _interopRequireDefault(_fabric);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LabelController = function (_ComponentController) {
  _inherits(LabelController, _ComponentController);

  function LabelController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, $window, AnnotationService, ConfigService, LabelService, NodeService, NotebookService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, LabelController);

    var _this = _possibleConstructorReturn(this, (LabelController.__proto__ || Object.getPrototypeOf(LabelController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.$window = $window;
    _this.LabelService = LabelService;
    _this.OpenResponseService = OpenResponseService;

    // holds student attachments like assets
    _this.attachments = [];

    // the latest annotations
    _this.latestAnnotations = null;

    // whether the new label button is shown or not
    _this.isNewLabelButtonVisible = true;

    // whether the cancel button is shown or not
    _this.isCancelButtonVisible = false;

    // the label for the notebook in thos project
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();

    // whether the student can create new labels
    _this.canCreateLabels = true;

    // whether the student is in the mode to create a new label
    _this.createLabelMode = false;

    // a reference to the canvas
    _this.canvas = null;

    // the canvas width
    _this.canvasWidth = 800;

    // the canvas height
    _this.canvasHeight = 600;

    // the z index of line elements
    _this.lineZIndex = 0;

    // the z index of text elements
    _this.textZIndex = 1;

    // the z index of circle elements
    _this.circleZIndex = 2;

    // the canvas id
    _this.canvasId = 'c';

    // the background image path
    _this.backgroundImage = null;

    // whether to show the reset button
    _this.isResetButtonVisible = true;

    _this.enableCircles = true;

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
    _this.studentDataVersion = 2;

    /*
     * This will hold canvas label objects. A canvas label object contains a
     * circle object, line object, and text object.
     */
    _this.labels = [];

    _this.canvasId = 'canvas_' + _this.nodeId + '_' + _this.componentId;

    // get the component state from the scope
    var componentState = _this.$scope.componentState;

    if (_this.componentContent.canCreateLabels != null) {
      _this.canCreateLabels = _this.componentContent.canCreateLabels;
    }

    if (_this.componentContent.width != null) {
      _this.canvasWidth = _this.componentContent.width;
    }

    if (_this.componentContent.height != null) {
      _this.canvasHeight = _this.componentContent.height;
    }

    if (_this.componentContent.enableCircles != null) {
      _this.enableCircles = _this.componentContent.enableCircles;
    }

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

      if (_this.onlyHasShowWorkConnectedComponents()) {
        _this.isDisabled = true;
      }

      if (_this.canCreateLabels) {
        _this.isNewLabelButtonVisible = true;
      } else {
        _this.isNewLabelButtonVisible = false;
      }

      if (_this.isDisabled) {
        _this.isNewLabelButtonVisible = false;
        _this.canCreateLabels = false;
        _this.isResetButtonVisible = false;
      }

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isNewLabelButtonVisible = false;
      _this.isDisabled = true;

      if (componentState != null) {
        // create a unique id for the application label element using this component state
        _this.canvasId = 'labelCanvas_' + componentState.id;
        if (_this.mode === 'gradingRevision') {
          _this.canvasId = 'labelCanvas_gradingRevision_' + componentState.id;
        }
      }

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isNewLabelButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isNewLabelButtonVisible = false;
      _this.isDisabled = true;
    }

    _this.$timeout(angular.bind(_this, function () {
      // wait for angular to completely render the html before we initialize the canvas

      this.setupCanvas();
    }));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    _this.$scope.isDirty = function () {
      return this.$scope.labelController.isDirty;
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
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
    }.bind(_this);

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    _this.$scope.$on('requestImage', function (event, args) {

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
    _this.$scope.$on('exitNode', angular.bind(_this, function (event, args) {}));

    /**
     * The student has changed the file input
     * @param element the file input element
     */
    _this.$scope.fileUploadChanged = function (element) {
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

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(LabelController, [{
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
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
          if (this.componentContent.labels != null) {
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

      this.disableComponentIfNecessary();

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
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
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
      var _this3 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this3.attachments.push(attachment);
            _this3.studentDataChanged();
          }
        });
      }
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
          this.studentDataChanged();
        }
      }));

      // listen for the text changed event
      canvas.on('text:changed', angular.bind(this, function (options) {
        var target = options.target;
        if (target != null) {
          var type = target.get('type');
          if (type === 'i-text') {
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
      var _this4 = this;

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
              _this4.selectLabel(label);
            });
          }

          text.on('mousedown', function () {
            /*
             * the text was clicked so we will make the associated
             * label selected
             */
            _this4.selectLabel(label);
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
    key: 'getImageObject',


    /**
     * Get the image object representation of the student data
     * @returns an image object
     */
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
  }, {
    key: 'handleConnectedComponentsPostProcess',
    value: function handleConnectedComponentsPostProcess() {
      if (this.componentContent.backgroundImage != null && this.componentContent.backgroundImage != '') {
        this.setBackgroundImage(this.componentContent.backgroundImage);
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
      var _this5 = this;

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
                    _this5.setBackgroundImage(image);

                    // make the work dirty so that it gets saved
                    _this5.studentDataChanged();
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
      var _this6 = this;

      this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        _this6.setBackgroundImage(image.url);
      });
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
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.labels[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var label = _step4.value;

            tempLabels.push(label);
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

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = tempLabels[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var tempLabel = _step5.value;

            this.deleteLabel(tempLabel);
          }

          /*
           * remove the reference to the selected label since it will no
           * longer be selected
           */
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
        this.studentDataChanged();
      }
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
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = connectedComponents[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var connectedComponent = _step6.value;

            if (connectedComponent.type == 'showWork') {
              showWorkConnectedComponentCount += 1;
            }
          }
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

        if (connectedComponents.length > 0 && connectedComponents.length == showWorkConnectedComponentCount) {
          return true;
        }
      }
      return false;
    }
  }]);

  return LabelController;
}(_componentController2.default);

LabelController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'LabelService', 'NodeService', 'NotebookService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = LabelController;
//# sourceMappingURL=labelController.js.map
