'use strict';

import { ComponentAuthoringController } from '../componentAuthoringController';

class AudioOscillatorAuthoringController extends ComponentAuthoringController {

  allowedConnectedComponentTypes: any[];
  authoringSineChecked: boolean;
  authoringSquareChecked: boolean;
  authoringTriangleChecked: boolean;
  authoringSawtoothChecked: boolean;

  static $inject = [
    '$filter',
    '$scope',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    $scope,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $scope,
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
    this.allowedConnectedComponentTypes = [{ type: 'AudioOscillator' }];
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

export default AudioOscillatorAuthoringController;
