'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _labelController = require('./labelController');

var _labelController2 = _interopRequireDefault(_labelController);

var _fabric = require('fabric');

var _fabric2 = _interopRequireDefault(_fabric);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LabelAuthoringController = function (_LabelController) {
  _inherits(LabelAuthoringController, _LabelController);

  function LabelAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, $window, AnnotationService, ConfigService, LabelService, NodeService, NotebookService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, LabelAuthoringController);

    // the component types we are allowed to connect to
    var _this = _possibleConstructorReturn(this, (LabelAuthoringController.__proto__ || Object.getPrototypeOf(LabelAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, $window, AnnotationService, ConfigService, LabelService, NodeService, NotebookService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'OpenResponse' }, { type: 'Table' }];

    if (_this.componentContent.enableCircles == null) {
      /*
       * If this component was created before enableCircles was implemented,
       * we will default it to true in the authoring so that the
       * "Enable Dots" checkbox is checked.
       */
      _this.authoringComponentContent.enableCircles = true;
    }

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
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
    return _this;
  }

  /**
   * Add a label in the authoring view
   */


  _createClass(LabelAuthoringController, [{
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
      if (componentType == 'ConceptMap' || componentType == 'Draw' || componentType == 'Embedded' || componentType == 'Graph' || componentType == 'Table') {
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
  }]);

  return LabelAuthoringController;
}(_labelController2.default);

LabelAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'LabelService', 'NodeService', 'NotebookService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = LabelAuthoringController;
//# sourceMappingURL=labelAuthoringController.js.map
