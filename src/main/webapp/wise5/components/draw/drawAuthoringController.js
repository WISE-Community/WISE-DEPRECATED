'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _drawController = require('./drawController');

var _drawController2 = _interopRequireDefault(_drawController);

var _drawingTool = require('lib/drawingTool/drawing-tool');

var _drawingTool2 = _interopRequireDefault(_drawingTool);

var _vendor = require('lib/drawingTool/vendor.min');

var _vendor2 = _interopRequireDefault(_vendor);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DrawAuthoringController = function (_DrawController) {
  _inherits(DrawAuthoringController, _DrawController);

  function DrawAuthoringController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, DrawAuthoringController);

    var _this = _possibleConstructorReturn(this, (DrawAuthoringController.__proto__ || Object.getPrototypeOf(DrawAuthoringController)).call(this, $filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    _this.isResetButtonVisible = true;
    _this.drawingToolId = 'drawingtool_' + _this.nodeId + '_' + _this.componentId;

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.submitCounter = 0;
      this.initializeDrawingTool();
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    }.bind(_this), true);
    return _this;
  }

  _createClass(DrawAuthoringController, [{
    key: 'assetSelected',
    value: function assetSelected(event, args) {
      if (this.isEventTargetThisComponent(args)) {
        var fileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          var summernoteId = this.getSummernoteId(args);
          this.restoreSummernoteCursorPosition(summernoteId);
          var fullAssetPath = this.getFullAssetPath(fileName);
          if (this.UtilService.isImage(fileName)) {
            this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
          } else if (this.UtilService.isVideo(fileName)) {
            this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
          }
        } else if (args.target === 'background') {
          this.authoringComponentContent.background = fileName;
          this.authoringViewBackgroundChanged();
        } else if (args.target === 'stamp') {
          var stampIndex = args.targetObject;
          this.setStampImage(stampIndex, fileName);
          this.authoringViewBackgroundChanged();
        }
      }
      this.$mdDialog.hide();
    }
  }, {
    key: 'authoringAddStampButtonClicked',
    value: function authoringAddStampButtonClicked() {
      this.initializeAuthoringComponentContentStampsIfNecessary();
      /*
       * create the stamp as an empty string that the author will replace
       * with a file name or url
       */
      this.authoringComponentContent.stamps.Stamps.push('');
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'initializeAuthoringComponentContentStampsIfNecessary',
    value: function initializeAuthoringComponentContentStampsIfNecessary() {
      if (this.authoringComponentContent != null) {
        if (this.authoringComponentContent.stamps == null) {
          this.authoringComponentContent.stamps = {};
        }
        if (this.authoringComponentContent.stamps.Stamps == null) {
          this.authoringComponentContent.stamps.Stamps = [];
        }
      }
    }

    /**
     * Move a stamp up in the authoring view
     * @param index the index of the stamp to move
     */

  }, {
    key: 'authoringMoveStampUp',
    value: function authoringMoveStampUp(index) {
      if (index != 0) {
        var stamp = this.authoringComponentContent.stamps.Stamps[index];
        this.authoringComponentContent.stamps.Stamps.splice(index, 1);
        this.authoringComponentContent.stamps.Stamps.splice(index - 1, 0, stamp);
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move the stamp down in the authoring view
     * @param index the index of the stamp to move
     */

  }, {
    key: 'authoringMoveStampDown',
    value: function authoringMoveStampDown(index) {
      if (index != this.authoringComponentContent.stamps.Stamps.length - 1) {
        var stamp = this.authoringComponentContent.stamps.Stamps[index];
        this.authoringComponentContent.stamps.Stamps.splice(index, 1);
        this.authoringComponentContent.stamps.Stamps.splice(index + 1, 0, stamp);
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
      if (confirm(this.$translate('draw.areYouSureYouWantToDeleteThisStamp') + '\n\n' + this.authoringComponentContent.stamps.Stamps[index])) {
        this.authoringComponentContent.stamps.Stamps.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringEnableAllToolsButtonClicked',
    value: function authoringEnableAllToolsButtonClicked() {
      if (this.authoringComponentContent.tools == null) {
        this.authoringComponentContent.tools = {};
      }
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
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringDisableAllToolsButtonClicked',
    value: function authoringDisableAllToolsButtonClicked() {
      if (this.authoringComponentContent.tools == null) {
        this.authoringComponentContent.tools = {};
      }
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
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringSaveStarterDrawData',
    value: function authoringSaveStarterDrawData() {
      if (confirm(this.$translate('draw.areYouSureYouWantToSaveTheStarterDrawing'))) {
        var drawData = this.getDrawData();
        this.authoringComponentContent.starterDrawData = drawData;
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringDeleteStarterDrawData',
    value: function authoringDeleteStarterDrawData() {
      if (confirm(this.$translate('draw.areYouSureYouWantToDeleteTheStarterDrawing'))) {
        this.authoringComponentContent.starterDrawData = null;
        this.drawingTool.clear();
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringViewWidthChanged',
    value: function authoringViewWidthChanged() {
      this.width = this.authoringComponentContent.width;
      this.updateStarterDrawDataWidth();
      this.authoringViewComponentChanged();
      this.authoringInitializeDrawingToolAfterTimeout();
    }
  }, {
    key: 'updateStarterDrawDataWidth',
    value: function updateStarterDrawDataWidth() {
      if (this.authoringComponentContent.starterDrawData != null) {
        var starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);
        if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
          starterDrawDataJSONObject.dt.width = this.width;
          this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
        }
      }
    }
  }, {
    key: 'authoringViewHeightChanged',
    value: function authoringViewHeightChanged() {
      this.height = this.authoringComponentContent.height;
      this.updateStarterDrawDataHeight();
      this.authoringViewComponentChanged();
      this.authoringInitializeDrawingToolAfterTimeout();
    }
  }, {
    key: 'updateStarterDrawDataHeight',
    value: function updateStarterDrawDataHeight() {
      if (this.authoringComponentContent.starterDrawData != null) {
        var starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);
        if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
          starterDrawDataJSONObject.dt.height = this.height;
          this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
        }
      }
    }
  }, {
    key: 'authoringViewToolClicked',
    value: function authoringViewToolClicked() {
      this.authoringViewComponentChanged();
      this.authoringInitializeDrawingToolAfterTimeout();
    }

    /**
     * Show the asset popup to allow the author to choose the background image
     */

  }, {
    key: 'chooseBackgroundImage',
    value: function chooseBackgroundImage() {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: 'background'
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'authoringViewBackgroundChanged',
    value: function authoringViewBackgroundChanged() {
      this.updateStarterDrawDataBackground();
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'updateStarterDrawDataBackground',
    value: function updateStarterDrawDataBackground() {
      var starterDrawData = this.authoringComponentContent.starterDrawData;
      if (starterDrawData != null) {
        var starterDrawDataJSON = angular.fromJson(starterDrawData);
        if (starterDrawDataJSON != null && starterDrawDataJSON.canvas != null && starterDrawDataJSON.canvas.backgroundImage != null && starterDrawDataJSON.canvas.backgroundImage.src != null) {
          /*
           * get the project assets directory path
           * e.g. https://www.berkeley.edu/curriculum/25/assets
           */
          var projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath(true);
          var background = this.authoringComponentContent.background;
          /*
           * generate the absolute path to the background image
           * e.g. https://www.berkeley.edu/curriculum/25/assets/earth.png
           */
          var newSrc = projectAssetsDirectoryPath + '/' + background;
          starterDrawDataJSON.canvas.backgroundImage.src = newSrc;
          this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSON);
        }
      }
    }

    /**
     * Open the asset chooser to select an image for the stamp
     * @param index the index of the stamp
     */

  }, {
    key: 'chooseStampImage',
    value: function chooseStampImage(index) {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: 'target',
        targetObject: index
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Set the stamp image
     * @param index the index of the stamp
     * @param fileName the file name of the image
     */

  }, {
    key: 'setStampImage',
    value: function setStampImage(index, fileName) {
      this.authoringComponentContent.stamps.Stamps[index] = fileName;
    }
  }, {
    key: 'handleConnectedComponentsPostProcess',
    value: function handleConnectedComponentsPostProcess() {
      if (this.componentContent != null && this.componentContent.background != null) {
        this.drawingTool.setBackgroundImage(this.componentContent.background);
      }
    }

    /**
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      var components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        var numberOfAllowedComponents = 0;
        var allowedComponent = null;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var component = _step.value;

            if (component != null) {
              if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                // we have found a viable component we can connect to
                numberOfAllowedComponents += 1;
                allowedComponent = component;
              }
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

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {
      // default the type to import work
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      this.authoringViewComponentChanged();
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
      if (componentType === 'ConceptMap' || componentType === 'Embedded' || componentType === 'Graph' || componentType === 'Label' || componentType === 'Table') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the checkbox.
     */

  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringInitializeDrawingToolAfterTimeout',
    value: function authoringInitializeDrawingToolAfterTimeout() {
      this.$timeout(angular.bind(this, this.initializeDrawingTool));
    }
  }]);

  return DrawAuthoringController;
}(_drawController2.default);

DrawAuthoringController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'DrawService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawAuthoringController;
//# sourceMappingURL=drawAuthoringController.js.map
