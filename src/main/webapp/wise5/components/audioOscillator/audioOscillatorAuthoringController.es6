'use strict';

import AudioOscillatorController from "./audioOscillatorController";

class AudioOscillatorAuthoringController extends AudioOscillatorController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnnotationService,
              AudioOscillatorService,
              ConfigService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      AudioOscillatorService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      {
        type: 'AudioOscillator'
      }
    ];

    // update which oscillator types should be checked
    this.authoringProcessCheckedOscillatorTypes();

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {

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
      $timeout(() => {this.drawOscilloscopeGrid()}, 0);
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
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
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
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
      this.$mdDialog.hide();
    });
  }

  /**
   * Show the controls for adding an oscillator type
   */
  authoringOpenAddOscillatorType() {
    this.showOscillatorTypeChooser = true;
  }

  /**
   * The author has clicked the add button to add an oscillator type
   */
  authoringAddOscillatorTypeClicked() {
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
  authoringCancelOscillatorTypeClicked() {
    // hide the oscillator type chooser
    this.showOscillatorTypeChooser = false;
  }

  /**
   * The author has clicked the delete button for removing an oscillator type
   * @param index the index of the oscillator type to remove
   */
  authoringDeleteOscillatorTypeClicked(index) {

    // remove the oscillator type at the given index
    this.authoringComponentContent.oscillatorTypes.splice(index, 1);

    // perform preview updating and project saving
    this.authoringViewComponentChanged();
  }

  /**
   * One of the oscillator types was clicked in the authoring view
   */
  authoringViewOscillatorTypeClicked() {

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
  authoringProcessCheckedOscillatorTypes() {

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
};

AudioOscillatorAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'AudioOscillatorService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default AudioOscillatorAuthoringController;
