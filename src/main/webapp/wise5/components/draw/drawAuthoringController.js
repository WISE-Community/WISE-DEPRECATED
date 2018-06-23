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

    // the options for when to update this component from a connected component
    var _this = _possibleConstructorReturn(this, (DrawAuthoringController.__proto__ || Object.getPrototypeOf(DrawAuthoringController)).call(this, $filter, $injector, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, DrawService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
    _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
    _this.isResetButtonVisible = true;

    // generate the summernote rubric element id
    _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

    // set the component rubric into the summernote rubric
    _this.summernoteRubricHTML = _this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = _this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    _this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    _this.drawingToolId = 'drawingtool_' + _this.nodeId + '_' + _this.componentId;
    _this.updateAdvancedAuthoringView();

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

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });
    return _this;
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */


  _createClass(DrawAuthoringController, [{
    key: 'authoringViewComponentChanged',
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
    key: 'authoringAddStampButtonClicked',


    /**
     * Add a stamp in the authoring
     */
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
      if (componentType == 'ConceptMap' || componentType == 'Embedded' || componentType == 'Graph' || componentType == 'Label' || componentType == 'Table') {
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
