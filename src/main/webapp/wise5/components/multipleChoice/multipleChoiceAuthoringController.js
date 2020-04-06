'use strict';

import MultipleChoiceController from './multipleChoiceController';

class MultipleChoiceAuthoringController extends MultipleChoiceController {
  constructor(
    $filter,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    AnnotationService,
    ConfigService,
    MultipleChoiceService,
    NodeService,
    NotebookService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      MultipleChoiceService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.allowedConnectedComponentTypes = [
      {
        type: 'MultipleChoice'
      }
    ];
    $scope.$watch(
      function() {
        return this.authoringComponentContent;
      }.bind(this),
      function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      }.bind(this),
      true
    );
    this.registerAssetListener();
  }

  registerAssetListener() {
    this.$scope.$on(
      'assetSelected',
      (event, { nodeId, componentId, assetItem, target, targetObject }) => {
        if (nodeId === this.nodeId && componentId === this.componentId) {
          const fileName = assetItem.fileName;
          const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
          if (target === 'prompt') {
            this.UtilService.insertFileInSummernoteEditor(
              `summernotePrompt_${this.nodeId}_${this.componentId}`,
              fullFilePath,
              fileName
            );
          } else if (target === 'rubric') {
            this.UtilService.insertFileInSummernoteEditor(
              `summernoteRubric_${this.nodeId}_${this.componentId}`,
              fullFilePath,
              fileName
            );
          } else if (target === 'choice') {
            targetObject.text = `<img src="${fileName}"/>`;
            this.authoringViewComponentChanged();
          }
        }
        this.$mdDialog.hide();
      }
    );
  }

  authoringViewFeedbackChanged() {
    let show = true;
    if (!this.componentHasFeedback()) {
      show = false;
    }
    this.setShowSubmitButtonValue(show);
    this.authoringViewComponentChanged();
  }

  /**
   * Check if this component has been authored to have feedback or has a correct choice
   * @return whether this component has feedback or has a correct choice
   */
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

  /**
   * Clean up the choice objects. In the authoring tool this is required
   * because we use the choice objects as ng-model values and inject
   * fields into the choice objects such as showFeedback and feedbackToShow.
   */
  cleanUpChoices() {
    for (const choice of this.authoringComponentContent.choices) {
      delete choice.showFeedback;
      delete choice.feedbackToShow;
    }
  }

  /**
   * Show the asset popup to allow the author to choose an image for the choice
   * @param choice the choice object to set the image into
   */
  chooseChoiceAsset(choice) {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'choice',
      targetObject: choice
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (
        this.isConnectedComponentTypeAllowed(component.type) &&
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

  authoringConnectedComponentComponentIdChanged(connectedComponent) {
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

MultipleChoiceAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'MultipleChoiceService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default MultipleChoiceAuthoringController;
