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

    this.allowedConnectedComponentTypes = [
      { type: 'AudioOscillator' }
    ];

    this.populateCheckedOscillatorTypes();
  }

  populateCheckedOscillatorTypes() {
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

  handleAuthoringComponentContentChanged(newValue, oldValue) {
    super.handleAuthoringComponentContentChanged(newValue, oldValue);
    this.refreshContentInAuthoringPreview();
  }

  refreshContentInAuthoringPreview() {
    this.stop();
    this.setParametersFromComponentContent();
    this.drawOscilloscopeGridAfterTimeout();
  }

  authoringViewOscillatorTypeClicked() {
    this.authoringComponentContent.oscillatorTypes = [];

    if (this.authoringSineChecked) {
      this.authoringComponentContent.oscillatorTypes.push('sine');
    }

    if (this.authoringSquareChecked) {
      this.authoringComponentContent.oscillatorTypes.push('square');
    }

    if (this.authoringTriangleChecked) {
      this.authoringComponentContent.oscillatorTypes.push('triangle');
    }

    if (this.authoringSawtoothChecked) {
      this.authoringComponentContent.oscillatorTypes.push('sawtooth');
    }

    this.authoringViewComponentChanged();
  }
}

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
