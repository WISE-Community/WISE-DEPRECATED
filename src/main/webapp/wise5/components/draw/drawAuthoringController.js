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

    // the component types we are allowed to connect to
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

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

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
              } else if (args.target == 'stamp') {
                // the target is a stamp

                // get the index of the stamp
                var stampIndex = args.targetObject;

                // get the file name
                var fileName = assetItem.fileName;

                // set the stamp image
                _this.setStampImage(stampIndex, fileName);

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
    return _this;
  }

  /**
   * Add a stamp in the authoring
   */


  _createClass(DrawAuthoringController, [{
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

      var answer = confirm(this.$translate('draw.areYouSureYouWantToSaveTheStarterDrawing'));

      if (answer) {
        // get the draw data
        var drawData = this.getDrawData();

        // set the starter draw data
        this.authoringComponentContent.starterDrawData = drawData;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Delete the starter draw data
     */

  }, {
    key: 'authoringDeleteStarterDrawData',
    value: function authoringDeleteStarterDrawData() {

      var answer = confirm(this.$translate('draw.areYouSureYouWantToDeleteTheStarterDrawing'));

      if (answer) {
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
          var newSrc = projectAssetsDirectoryPath + '/' + background;

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
     * Open the asset choose to select an image for the stamp
     * @param index the index of the stamp
     */

  }, {
    key: 'chooseStampImage',
    value: function chooseStampImage(index) {

      // generate the parameters
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'stamp';
      params.targetObject = index;

      // display the asset chooser
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
      if (connectedComponent != null) {
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
      if (componentType == 'ConceptMap' || componentType == 'Embedded' || componentType == 'Graph' || componentType == 'Label' || componentType == 'Table') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
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
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }]);

  return DrawAuthoringController;
}(_drawController2.default);

DrawAuthoringController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'DrawService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = DrawAuthoringController;
//# sourceMappingURL=drawAuthoringController.js.map
