'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

var _drawingTool2 = require('lib/drawingTool/drawing-tool');

var _drawingTool3 = _interopRequireDefault(_drawingTool2);

var _vendor = require('lib/drawingTool/vendor.min');

var _vendor2 = _interopRequireDefault(_vendor);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DrawController = function (_ComponentController) {
  _inherits(DrawController, _ComponentController);

  function DrawController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, DrawController);

    var _this = _possibleConstructorReturn(this, (DrawController.__proto__ || Object.getPrototypeOf(DrawController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$injector = $injector;
    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.DrawService = DrawService;

    _this.isResetButtonVisible = false;
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();
    _this.drawingTool = null;
    _this.latestConnectedComponentState = null;
    _this.latestConnectedComponentParams = null;
    _this.width = 800;
    _this.height = 600;

    if (_this.componentContent.width != null) {
      _this.width = _this.componentContent.width;
    }

    if (_this.componentContent.height != null) {
      _this.height = _this.componentContent.height;
    }

    _this.componentType = _this.componentContent.type;

    if (_this.isStudentMode()) {
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.isResetButtonVisible = true;
      _this.drawingToolId = 'drawingtool_' + _this.nodeId + '_' + _this.componentId;
    } else if (_this.isGradingMode() || _this.isGradingRevisionMode() || _this.isOnlyShowWorkMode()) {
      var componentState = _this.$scope.componentState;
      if (componentState != null) {
        if (_this.isGradingRevisionMode()) {
          _this.drawingToolId = 'drawingtool_gradingRevision_' + componentState.id;
        } else {
          _this.drawingToolId = 'drawingtool_' + componentState.id;
        }
      }
    }

    /*
     * Running this inside a timeout ensures that the code only runs after the markup is rendered.
     * Maybe there's a better way to do this, like with an event?
     */
    _this.$timeout(angular.bind(_this, _this.initializeDrawingTool));

    _this.initializeScopeGetComponentState(_this.$scope, 'drawController');

    /*
     * Listen for the requestImage event which is fired when something needs an image representation
     * of the student data from a specific component.
     */
    _this.$scope.$on('requestImage', function (event, args) {
      if (_this.isEventTargetThisComponent(args)) {
        var imageObject = _this.getImageObject();
        var requestImageCallbackArgs = {
          nodeId: args.nodeId,
          componentId: args.componentId,
          imageObject: imageObject
        };
        _this.$scope.$emit('requestImageCallback', requestImageCallbackArgs);
      }
    });

    _this.$scope.$on('notebookItemChosen', function (event, args) {
      if (args.requester == _this.nodeId + '-' + _this.componentId) {
        var notebookItem = args.notebookItem;
        var studentWorkId = notebookItem.content.studentWorkIds[0];
        _this.importWorkByStudentWorkId(studentWorkId);
      }
    });

    _this.broadcastDoneRenderingComponent();
    return _this;
  }

  _createClass(DrawController, [{
    key: 'handleStudentWorkSavedToServerAdditionalProcessing',
    value: function handleStudentWorkSavedToServerAdditionalProcessing(event, args) {
      var componentState = args.studentWork;
      if (this.isForThisComponent(componentState) && this.ProjectService.isConnectedComponent(this.nodeId, this.componentId, componentState.componentId)) {
        var connectedComponentParams = this.ProjectService.getConnectedComponentParams(this.componentContent, componentState.componentId);
        if (connectedComponentParams != null) {
          if (connectedComponentParams.updateOn === 'save' || connectedComponentParams.updateOn === 'submit' && componentState.isSubmit) {
            var performUpdate = false;
            /*
             * make a copy of the component state so we don't accidentally
             * change any values in the referenced object
             */
            componentState = this.UtilService.makeCopyOfJSONObject(componentState);

            if (this.isCanvasEmpty()) {
              performUpdate = true;
            } else {
              // the student has drawn on the canvas so we will ask them if they want to update it
              if (confirm(this.$translate('draw.doYouWantToUpdateTheConnectedDrawing'))) {
                performUpdate = true;
              }
            }

            if (performUpdate) {
              if (!connectedComponentParams.includeBackground) {
                this.DrawService.removeBackgroundFromComponentState(componentState);
              }
              this.setDrawData(componentState);
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
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: 'initializeDrawingTool',
    value: function initializeDrawingTool() {
      var _this2 = this;

      this.drawingTool = new DrawingTool('#' + this.drawingToolId, {
        stamps: this.componentContent.stamps || {},
        parseSVG: true,
        width: this.width,
        height: this.height
      });
      var state = null;
      $('#set-background').on('click', function () {
        _this2.drawingTool.setBackgroundImage($('#background-src').val());
      });
      $('#resize-background').on('click', function () {
        _this2.drawingTool.resizeBackgroundToCanvas();
      });
      $('#resize-canvas').on('click', function () {
        _this2.drawingTool.resizeCanvasToBackground();
      });
      $('#shrink-background').on('click', function () {
        _this2.drawingTool.shrinkBackgroundToCanvas();
      });
      $('#clear').on('click', function () {
        _this2.drawingTool.clear(true);
      });
      $('#save').on('click', function () {
        state = _drawingTool3.default.save();
        $('#load').removeAttr('disabled');
      });
      $('#load').on('click', function () {
        if (state === null) return;
        _this2.drawingTool.load(state);
      });

      var componentState = this.$scope.componentState;
      if (this.isStudentMode()) {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)) {
          this.setStudentWork(componentState);
        } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (componentState == null || !this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)) {
          if (this.componentContent.starterDrawData != null) {
            this.drawingTool.load(this.componentContent.starterDrawData);
          }
          if (this.componentContent.background != null) {
            this.drawingTool.setBackgroundImage(this.componentContent.background);
          }
        }
      } else if (this.isAuthoringMode()) {
        if (this.componentContent.starterDrawData != null) {
          this.drawingTool.load(this.componentContent.starterDrawData);
        }
        if (this.componentContent.background != null) {
          this.drawingTool.setBackgroundImage(this.componentContent.background);
        }
      } else {
        this.setStudentWork(componentState);
      }

      if (this.hasMaxSubmitCount() && this.hasSubmitsLeft()) {
        this.isSubmitButtonDisabled = true;
      }

      this.disableComponentIfNecessary();

      /*
       * Wait before we start listening for the drawing:changed event. We need to wait
       * because the calls above to this.drawingTool.setBackgroundImage() will cause
       * the drawing:changed event to be fired from the drawingTool, but when that happens,
       * we don't want to call this.studentDataChanged() because it marks the student work
       * as dirty. We only want to call this.studentDataChanged() when the drawing:changed
       * event occurs in response to the student changing the drawing and this timeout
       * will help make sure of that.
       */
      this.$timeout(angular.bind(this, function () {
        _this2.drawingTool.on('drawing:changed', angular.bind(_this2, _this2.studentDataChanged));
      }), 500);

      if (this.isStudentMode()) {
        this.drawingTool.on('tool:changed', function (toolName) {
          var category = 'Tool';
          var event = 'toolSelected';
          var data = {
            selectedToolName: toolName
          };
          _this2.StudentDataService.saveComponentEvent(_this2, category, event, data);
        });
      }

      if (this.isGradingMode() || this.isGradingRevisionMode() || this.isOnlyShowWorkMode()) {
        $('#' + this.drawingToolId).find('.dt-tools').hide();
      } else {
        this.setupTools();
      }

      if (this.isDisabled) {
        this.drawingTool.canvas.removeListeners();
      }
    }
  }, {
    key: 'handleConnectedComponentsPostProcess',
    value: function handleConnectedComponentsPostProcess() {
      if (this.componentContent.background != null) {
        this.drawingTool.setBackgroundImage(this.componentContent.background);
      }
    }

    /**
     * Setup the tools that we will make available to the student
     */

  }, {
    key: 'setupTools',
    value: function setupTools() {
      var tools = this.componentContent.tools;
      if (tools == null) {
        // we will display all the tools
      } else {
        // we will only display the tools the authored specified to show
        var _drawingTool = $('#' + this.drawingToolId);
        this.setupSelectTool(_drawingTool, tools);
        this.setupLineTool(_drawingTool, tools);
        this.setupShapeTool(_drawingTool, tools);
        this.setupFreeHandTool(_drawingTool, tools);
        this.setupTextTool(_drawingTool, tools);
        this.setupStampTool(_drawingTool, tools);
        this.setupCloneTool(_drawingTool, tools);
        this.setupStrokeColorTool(_drawingTool, tools);
        this.setupFillColorTool(_drawingTool, tools);
        this.setupStrokeWidthTool(_drawingTool, tools);
        this.setupSendBackTool(_drawingTool, tools);
        this.setupSendForwardTool(_drawingTool, tools);
        this.setupUndoTool(_drawingTool, tools);
        this.setupRedoTool(_drawingTool, tools);
        this.setupDeleteTool(_drawingTool, tools);
        if (this.isDisabled) {
          _drawingTool.find('.dt-tools').hide();
        }
      }
    }
  }, {
    key: 'setupSelectTool',
    value: function setupSelectTool(drawingTool, tools) {
      var selectTitle = this.$translate('draw.selectToolTooltip');
      if (tools.select) {
        drawingTool.find('[title="' + selectTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + selectTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupLineTool',
    value: function setupLineTool(drawingTool, tools) {
      var lineTitle = this.$translate('draw.lineToolTooltip');
      if (tools.line) {
        drawingTool.find('[title="' + lineTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + lineTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupShapeTool',
    value: function setupShapeTool(drawingTool, tools) {
      var shapeTitle = this.$translate('draw.shapeToolTooltip');
      if (tools.shape) {
        drawingTool.find('[title="' + shapeTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + shapeTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupFreeHandTool',
    value: function setupFreeHandTool(drawingTool, tools) {
      var freeHandTitle = this.$translate('draw.freeHandToolTooltip');
      if (tools.freeHand) {
        drawingTool.find('[title="' + freeHandTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + freeHandTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupTextTool',
    value: function setupTextTool(drawingTool, tools) {
      var textTitle = this.$translate('draw.textToolTooltip');
      if (tools.text) {
        drawingTool.find('[title="' + textTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + textTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupStampTool',
    value: function setupStampTool(drawingTool, tools) {
      var stampTitle = this.$translate('draw.stampToolTooltip');
      if (tools.stamp) {
        drawingTool.find('[title="' + stampTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + stampTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupCloneTool',
    value: function setupCloneTool(drawingTool, tools) {
      var cloneTitle = this.$translate('draw.cloneToolTooltip');
      if (tools.clone) {
        drawingTool.find('[title="' + cloneTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + cloneTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupStrokeColorTool',
    value: function setupStrokeColorTool(drawingTool, tools) {
      var strokeColorTitle = this.$translate('draw.strokeColorToolTooltip');
      if (tools.strokeColor) {
        drawingTool.find('[title="' + strokeColorTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + strokeColorTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupFillColorTool',
    value: function setupFillColorTool(drawingTool, tools) {
      var fillColorTitle = this.$translate('draw.fillColorToolTooltip');
      if (tools.fillColor) {
        drawingTool.find('[title="' + fillColorTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + fillColorTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupStrokeWidthTool',
    value: function setupStrokeWidthTool(drawingTool, tools) {
      var strokeWidthTitle = this.$translate('draw.strokeWidthToolTooltip');
      if (tools.strokeWidth) {
        drawingTool.find('[title="' + strokeWidthTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + strokeWidthTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupSendBackTool',
    value: function setupSendBackTool(drawingTool, tools) {
      var sendBackTitle = this.$translate('draw.sendBackToolTooltip');
      if (tools.sendBack) {
        drawingTool.find('[title="' + sendBackTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + sendBackTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupSendForwardTool',
    value: function setupSendForwardTool(drawingTool, tools) {
      var sendForwardTitle = this.$translate('draw.sendForwardToolTooltip');
      if (tools.sendForward) {
        drawingTool.find('[title="' + sendForwardTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + sendForwardTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupUndoTool',
    value: function setupUndoTool(drawingTool, tools) {
      var undoTitle = this.$translate('draw.undo');
      if (tools.undo) {
        drawingTool.find('[title="' + undoTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + undoTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupRedoTool',
    value: function setupRedoTool(drawingTool, tools) {
      var redoTitle = this.$translate('draw.redo');
      if (tools.redo) {
        drawingTool.find('[title="' + redoTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + redoTitle + '"]').hide();
      }
    }
  }, {
    key: 'setupDeleteTool',
    value: function setupDeleteTool(drawingTool, tools) {
      var deleteTitle = this.$translate('draw.deleteToolTooltip');
      if (tools.delete) {
        drawingTool.find('[title="' + deleteTitle + '"]').show();
      } else {
        drawingTool.find('[title="' + deleteTitle + '"]').hide();
      }
    }
  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      if (componentState != null) {
        this.setDrawData(componentState);
        this.processLatestStudentWork();
      }
    }
  }, {
    key: 'resetButtonClicked',
    value: function resetButtonClicked() {
      if (confirm(this.$translate('draw.areYouSureYouWantToClearYourDrawing'))) {
        this.drawingTool.clear();
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (this.latestConnectedComponentState && this.latestConnectedComponentParams) {
          this.setDrawData(latestConnectedComponentState, latestConnectedComponentParams);
        } else if (this.componentContent.starterDrawData != null) {
          this.drawingTool.load(this.componentContent.starterDrawData);
        }
        if (this.componentContent.background != null && this.componentContent.background != '') {
          this.drawingTool.setBackgroundImage(this.componentContent.background);
        }
        this.parentStudentWorkIds = null;
      }
    }

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {
      var deferred = this.$q.defer();
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {};
      var studentDataJSONString = this.getDrawData();
      studentData.drawData = studentDataJSONString;
      studentData.submitCounter = this.submitCounter;
      if (this.parentStudentWorkIds != null) {
        studentData.parentStudentWorkIds = this.parentStudentWorkIds;
      }
      componentState.isSubmit = this.isSubmit;
      componentState.studentData = studentData;
      componentState.componentType = 'Draw';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      this.isSubmit = false;
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }

    /**
     * Add student asset images as objects in the drawing canvas
     * @param studentAsset
     */

  }, {
    key: 'attachStudentAsset',
    value: function attachStudentAsset(studentAsset) {
      var _this3 = this;

      this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
        fabric.Image.fromURL(copiedAsset.url, function (oImg) {
          oImg.scaleToWidth(200); // set max width and have height scale proportionally
          // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
          //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
          //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
          //oImg.center();
          oImg.studentAssetId = copiedAsset.id; // keep track of this asset id
          _this3.drawingTool.canvas.add(oImg); // add copied asset image to canvas
        });
      });
    }
  }, {
    key: 'getDrawData',
    value: function getDrawData() {
      return this.drawingTool.save();
    }

    /**
     * Get the image object representation of the student data
     * @returns an image object
     */

  }, {
    key: 'getImageObject',
    value: function getImageObject() {
      if (this.drawingTool != null && this.drawingTool.canvas != null) {
        var canvasBase64Image = this.drawingTool.canvas.toDataURL('image/png');
        return this.UtilService.getImageObjectFromBase64String(canvasBase64Image);
      }
      return null;
    }
  }, {
    key: 'setDrawData',
    value: function setDrawData(componentState) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData.submitCounter != null) {
          this.submitCounter = studentData.submitCounter;
        }
        var drawData = studentData.drawData;
        if (drawData != null && drawData != '' && drawData != '{}') {
          this.drawingTool.load(drawData);
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
      if (this.drawingTool != null && this.drawingTool.canvas != null) {
        var objects = this.drawingTool.canvas.getObjects();
        if (objects != null && objects.length > 0) {
          return false;
        }
      }
      return true;
    }

    /**
     * Snip the drawing by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snipDrawing',
    value: function snipDrawing($event, studentWorkId) {
      var canvas = angular.element('#drawingtool_' + this.nodeId + '_' + this.componentId + ' canvas');
      if (canvas != null && canvas.length > 0) {
        canvas = canvas[0];
        var canvasBase64Image = canvas.toDataURL('image/png');
        var imageObject = this.UtilService.getImageObjectFromBase64String(canvasBase64Image);
        var noteText = null;
        this.NotebookService.addNote($event, imageObject, noteText, [studentWorkId]);
      }
    }
  }, {
    key: 'snipButtonClicked',
    value: function snipButtonClicked($event) {
      var _this4 = this;

      if (this.isDirty) {
        var deregisterListener = this.$scope.$on('studentWorkSavedToServer', function (event, args) {
          var componentState = args.studentWork;
          if (_this4.isForThisComponent(componentState)) {
            _this4.snipDrawing($event, componentState.id);
            deregisterListener();
          }
        });
        this.saveButtonClicked();
      } else {
        var studentWork = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        this.snipDrawing($event, studentWork.id);
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
      var mergedComponentState = this.NodeService.createNewComponentState();
      if (componentStates != null) {
        var allDrawCanvasObjects = [];
        var firstDrawData = {};
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];
          if (componentState.componentType == 'Draw') {
            var studentData = componentState.studentData;
            var drawData = studentData.drawData;
            var drawDataJSON = angular.fromJson(drawData);
            if (drawDataJSON != null && drawDataJSON.canvas != null && drawDataJSON.canvas.objects != null) {
              if (c == 0) {
                firstDrawData = drawDataJSON;
              }
              allDrawCanvasObjects = allDrawCanvasObjects.concat(drawDataJSON.canvas.objects);
            }
          } else if (componentState.componentType == 'Graph' || componentState.componentType == 'ConceptMap' || componentState.componentType == 'Embedded' || componentState.componentType == 'Label' || componentState.componentType == 'Table') {
            var connectedComponent = this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
            if (connectedComponent.importWorkAsBackground === true) {
              this.setComponentStateAsBackgroundImage(componentState);
            }
          }
        }
        if (allDrawCanvasObjects != null) {
          var _drawData = firstDrawData;
          if (_drawData.canvas != null && _drawData.canvas.objects != null) {
            _drawData.canvas.objects = allDrawCanvasObjects;
          }
          mergedComponentState.studentData = {};
          mergedComponentState.studentData.drawData = angular.toJson(_drawData);
        }
      }
      return mergedComponentState;
    }

    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     */

  }, {
    key: 'setComponentStateAsBackgroundImage',
    value: function setComponentStateAsBackgroundImage(componentState) {
      var _this5 = this;

      this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        _this5.drawingTool.setBackgroundImage(image.url);
      });
    }
  }]);

  return DrawController;
}(_componentController2.default);

DrawController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'DrawService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawController;
//# sourceMappingURL=drawController.js.map
