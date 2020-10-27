'use strict';

import { Directive } from '@angular/core';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class MultipleChoiceAuthoringController extends EditComponentController {
  ProjectAssetService: ProjectAssetService;
  allowedConnectedComponentTypes: any[] = [
    {
      type: 'MultipleChoice'
    }
  ];

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
  }

  feedbackChanged() {
    let show = true;
    if (!this.componentHasFeedback()) {
      show = false;
    }
    this.setShowSubmitButtonValue(show);
    this.authoringViewComponentChanged();
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
    this.authoringViewComponentChanged();
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
      this.authoringViewComponentChanged();
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
    this.authoringViewComponentChanged();
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
    this.authoringViewComponentChanged();
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
      this.authoringViewComponentChanged();
    }
  }

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (this.isConnectedComponentTypeAllowed(component.type) &&
        component.id != this.componentId
      ) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
      this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
    }
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    connectedComponent.type = 'importWork';
    this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
    this.authoringViewComponentChanged();
  }

  copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    if (
      this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId).type ===
      'MultipleChoice'
    ) {
      this.copyChoiceTypeFromComponent(nodeId, componentId);
      this.copyChoicesFromComponent(nodeId, componentId);
    }
  }

  copyChoiceTypeFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    this.authoringComponentContent.choiceType = component.choiceType;
  }

  copyChoicesFromComponent(nodeId, componentId) {
    this.authoringComponentContent.choices = this.getCopyOfChoicesFromComponent(
      nodeId,
      componentId
    );
  }

  getCopyOfChoicesFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    return this.UtilService.makeCopyOfJSONObject(component.choices);
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
}

export default MultipleChoiceAuthoring;
