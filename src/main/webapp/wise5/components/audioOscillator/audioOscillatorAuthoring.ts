'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class AudioOscillatorAuthoringController extends EditComponentController {
  authoringSineChecked: boolean;
  authoringSquareChecked: boolean;
  authoringTriangleChecked: boolean;
  authoringSawtoothChecked: boolean;

  static $inject = [
    '$filter',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();
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
    this.componentChanged();
  }
}

const AudioOscillatorAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: AudioOscillatorAuthoringController,
  controllerAs: 'audioOscillatorController',
  templateUrl: 'wise5/components/audioOscillator/authoring.html'
};

export default AudioOscillatorAuthoring;
