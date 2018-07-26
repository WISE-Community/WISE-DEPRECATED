'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _audioOscillatorController = require('./audioOscillatorController');

var _audioOscillatorController2 = _interopRequireDefault(_audioOscillatorController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioOscillatorAuthoringController = function (_AudioOscillatorContr) {
  _inherits(AudioOscillatorAuthoringController, _AudioOscillatorContr);

  function AudioOscillatorAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, AudioOscillatorService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AudioOscillatorAuthoringController);

    // the component types we are allowed to connect to
    var _this = _possibleConstructorReturn(this, (AudioOscillatorAuthoringController.__proto__ || Object.getPrototypeOf(AudioOscillatorAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, AudioOscillatorService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{
      type: 'AudioOscillator'
    }];

    // update which oscillator types should be checked
    _this.authoringProcessCheckedOscillatorTypes();

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      var _this2 = this;

      // stop the audio if it is playing
      this.stop();

      // inject asset paths if necessary
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);

      this.submitCounter = 0;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      // load the parameters into the component
      this.setParametersFromComponentContent();

      // draw the oscilloscope gride after the view has rendered
      $timeout(function () {
        _this2.drawOscilloscopeGrid();
      }, 0);
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
   * Show the controls for adding an oscillator type
   */


  _createClass(AudioOscillatorAuthoringController, [{
    key: 'authoringOpenAddOscillatorType',
    value: function authoringOpenAddOscillatorType() {
      this.showOscillatorTypeChooser = true;
    }

    /**
     * The author has clicked the add button to add an oscillator type
     */

  }, {
    key: 'authoringAddOscillatorTypeClicked',
    value: function authoringAddOscillatorTypeClicked() {
      var oscillatorTypeToAdd = this.oscillatorTypeToAdd;

      if (this.authoringComponentContent.oscillatorTypes.indexOf(oscillatorTypeToAdd) != -1) {
        // the oscillator type is already in the array of oscillator types

        alert(this.$translate('audioOscillator.errorYouHaveAlreadyAddedOscillatorType', { oscillatorTypeToAdd: oscillatorTypeToAdd }));
      } else {
        // the oscillator type is not already in the array of oscillator types
        this.authoringComponentContent.oscillatorTypes.push(oscillatorTypeToAdd);

        // hide the oscillator type chooser
        this.showOscillatorTypeChooser = false;

        // perform preview updating and project saving
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The author has clicked the cancel button for adding an oscillator type
     */

  }, {
    key: 'authoringCancelOscillatorTypeClicked',
    value: function authoringCancelOscillatorTypeClicked() {
      // hide the oscillator type chooser
      this.showOscillatorTypeChooser = false;
    }

    /**
     * The author has clicked the delete button for removing an oscillator type
     * @param index the index of the oscillator type to remove
     */

  }, {
    key: 'authoringDeleteOscillatorTypeClicked',
    value: function authoringDeleteOscillatorTypeClicked(index) {

      // remove the oscillator type at the given index
      this.authoringComponentContent.oscillatorTypes.splice(index, 1);

      // perform preview updating and project saving
      this.authoringViewComponentChanged();
    }

    /**
     * One of the oscillator types was clicked in the authoring view
     */

  }, {
    key: 'authoringViewOscillatorTypeClicked',
    value: function authoringViewOscillatorTypeClicked() {

      /*
       * clear the oscillator types so we can repopulate it with the
       * ones that are checked
       */
      this.authoringComponentContent.oscillatorTypes = [];

      if (this.authoringSineChecked) {
        // sine is checked
        this.authoringComponentContent.oscillatorTypes.push('sine');
      }

      if (this.authoringSquareChecked) {
        // square is checked
        this.authoringComponentContent.oscillatorTypes.push('square');
      }

      if (this.authoringTriangleChecked) {
        // triangle is checked
        this.authoringComponentContent.oscillatorTypes.push('triangle');
      }

      if (this.authoringSawtoothChecked) {
        // sawtooth is checked
        this.authoringComponentContent.oscillatorTypes.push('sawtooth');
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Determine which oscillator types should be checked
     */

  }, {
    key: 'authoringProcessCheckedOscillatorTypes',
    value: function authoringProcessCheckedOscillatorTypes() {

      if (this.authoringComponentContent.oscillatorTypes.indexOf('sine') != -1) {
        this.authoringSineChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('square') != -1) {
        this.authoringSquareChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('triangle') != -1) {
        this.authoringTriangleChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('sawtooth') != -1) {
        this.authoringSawtoothChecked = true;
      }
    }
  }]);

  return AudioOscillatorAuthoringController;
}(_audioOscillatorController2.default);

;

AudioOscillatorAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'AudioOscillatorService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorAuthoringController;
//# sourceMappingURL=audioOscillatorAuthoringController.js.map
