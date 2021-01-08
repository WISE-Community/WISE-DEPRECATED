'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class MultipleChoiceAuthoringController extends EditComponentController {
  allowedConnectedComponentTypes = ['MultipleChoice'];

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

  feedbackChanged() {
    let show = true;
    if (!this.componentHasFeedback()) {
      show = false;
    }
    this.setShowSubmitButtonValue(show);
    this.componentChanged();
  }

  componentHasFeedback() {
    for (const choice of this.authoringComponentContent.choices) {
      if (choice.isCorrect || (choice.feedback != null && choice.feedback !== '')) {
        return true;
      }
    }
    return false;
  }

  addChoice() {
    const newChoice = {
      id: this.UtilService.generateKey(10),
      text: '',
      feedback: '',
      isCorrect: false
    };
    this.authoringComponentContent.choices.push(newChoice);
    this.componentChanged();
  }

  deleteChoice(choiceId) {
    if (confirm(this.$translate('multipleChoice.areYouSureYouWantToDeleteThisChoice'))) {
      const choices = this.authoringComponentContent.choices;
      for (let c = 0; c < choices.length; c++) {
        if (choices[c].id === choiceId) {
          choices.splice(c, 1);
          break;
        }
      }
      this.componentChanged();
    }
  }

  moveChoiceUp(choiceId) {
    const choices = this.authoringComponentContent.choices;
    for (let c = 0; c < choices.length; c++) {
      const choice = choices[c];
      if (choice.id === choiceId) {
        if (c !== 0) {
          choices.splice(c, 1);
          choices.splice(c - 1, 0, choice);
        }
        break;
      }
    }
    this.componentChanged();
  }

  moveChoiceDown(choiceId) {
    const choices = this.authoringComponentContent.choices;
    for (let c = 0; c < choices.length; c++) {
      const choice = choices[c];
      if (choice.id === choiceId) {
        if (c !== choices.length - 1) {
          choices.splice(c, 1);
          choices.splice(c + 1, 0, choice);
        }
        break;
      }
    }
    this.componentChanged();
  }

  chooseChoiceAsset(choice) {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'choice',
      targetObject: choice
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }) {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'choice') {
      const fileName = assetItem.fileName;
      targetObject.text = `<img src="${fileName}"/>`;
      this.componentChanged();
    }
  }
}

const MultipleChoiceAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: MultipleChoiceAuthoringController,
  controllerAs: 'multipleChoiceController',
  templateUrl: 'wise5/components/multipleChoice/authoring.html'
};

export default MultipleChoiceAuthoring;
