'use strict';

import MultipleChoiceController from "./multipleChoiceController";

class MultipleChoiceAuthoringController extends MultipleChoiceController {
  constructor($filter,
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
              UtilService) {
    super($filter,
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
      UtilService);

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      {
        type: 'MultipleChoice'
      }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
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

              if (args.target == 'prompt' || args.target == 'rubric') {
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
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                    // add the image html
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
                  } else if (this.UtilService.isVideo(fileName)) {
                    /*
                     * move the cursor back to its position when the asset chooser
                     * popup was clicked
                     */
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                    // insert the video element
                    var videoElement = document.createElement('video');
                    videoElement.controls = 'true';
                    videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                    angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
                  }
                }
              } else if (args.target == 'choice') {
                // the target is a choice

                /*
                 * get the target object which should be a
                 * choice object
                 */
                var targetObject = args.targetObject;

                if (targetObject != null) {

                  // create the img html
                  var text = '<img src="' + fileName + '"/>';

                  // set the html into the choice text
                  targetObject.text = text;

                  // save the component
                  this.authoringViewComponentChanged();
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
   * Get the available choices from component content
   * @return the available choices from the component content
   */
  getAuthoringChoices() {
    var choices = null;

    // get the component content
    var authoringComponentContent = this.authoringComponentContent;

    if (authoringComponentContent != null) {

      // get the choices
      choices = authoringComponentContent.choices;
    }

    return choices;
  };

  /**
   * The author has changed the feedback so we will enable the submit button
   */
  authoringViewFeedbackChanged() {

    var show = true;

    if (this.componentHasFeedback()) {
      // this component has feedback so we will show the submit button
      show = true;
    } else {
      /*
       * this component does not have feedback so we will not show the
       * submit button
       */
      show = false;
    }

    // show or hide the submit button
    this.setShowSubmitButtonValue(show);

    // save the component
    this.authoringViewComponentChanged();
  }

  /**
   * Check if this component has been authored to have feedback or has a
   * correct choice
   * @return whether this component has feedback or has a correct choice
   */
  componentHasFeedback() {

    // get the choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {

          if (choice.feedback != null && choice.feedback != '') {
            // the choice has feedback
            return true;
          }

          if (choice.isCorrect) {
            // the choice is correct
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Add a choice from within the authoring tool
   */
  addChoice() {

    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    // make the new choice
    var newChoice = {};
    newChoice.id = this.UtilService.generateKey(10);
    newChoice.text = '';
    newChoice.feedback = '';
    newChoice.isCorrect = false;

    // add the new choice
    choices.push(newChoice);

    // save the component
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a choice from within the authoring tool
   * @param choiceId
   */
  deleteChoice(choiceId) {

    // ask the author if they are sure they want to delete the choice
    var answer = confirm(this.$translate('multipleChoice.areYouSureYouWantToDeleteThisChoice'));

    if (answer) {
      // the author answered yes to delete the choice

      // get the authored choices
      var choices = this.authoringComponentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            var tempChoiceId = choice.id;

            if (choiceId === tempChoiceId) {
              // we have found the choice that we want to delete so we will remove it
              choices.splice(c, 1);
              break;
            }
          }
        }
      }

      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a choice up
   * @param choiceId the choice to move
   */
  moveChoiceUp(choiceId) {

    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          var tempChoiceId = choice.id;

          if (choiceId === tempChoiceId) {

            if (c == 0) {
              /*
               * the choice is the first choice so we can't move
               * it up
               */
            } else {
              // we have found the choice that we want to move up

              // remove the choice
              choices.splice(c, 1);

              // add the choice one index back
              choices.splice(c - 1, 0, choice);
            }

            break;
          }
        }
      }
    }

    this.authoringViewComponentChanged();
  }

  /**
   * Move a choice down
   * @param choiceId the choice to move
   */
  moveChoiceDown(choiceId) {
    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          var tempChoiceId = choice.id;

          if (choiceId === tempChoiceId) {

            if (c == choices.length - 1) {
              /*
               * the choice is the last choice so we can't move
               * it down
               */
            } else {
              // we have found the choice that we want to move down

              // remove the choice
              choices.splice(c, 1);

              // add the choice one index forward
              choices.splice(c + 1, 0, choice);
            }

            break;
          }
        }
      }
    }
  }

  /**
   * Clean up the choice objects. In the authoring tool this is required
   * because we use the choice objects as ng-model values and inject
   * fields into the choice objects such as showFeedback and feedbackToShow.
   */
  cleanUpChoices() {

    // get the authored choices
    var choices = this.getAuthoringChoices();

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          // remove the fields we don't want to be saved
          delete choice.showFeedback;
          delete choice.feedbackToShow;
        }
      }
    }
  }

  /**
   * Show the asset popup to allow the author to choose an image for the
   * choice
   * @param choice the choice object to set the image into
   */
  chooseChoiceAsset(choice) {
    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'choice';
    params.targetObject = choice;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    if (connectedComponent != null) {
      let components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        let numberOfAllowedComponents = 0;
        let allowedComponent = null;
        for (let component of components) {
          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) &&
              component.id != this.componentId) {
              // we have found a viable component we can connect to
              numberOfAllowedComponents += 1;
              allowedComponent = component;
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
          this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
        }
      }
    }
  }

  /**
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

    if (connectedComponent != null) {

      // default the type to import work
      connectedComponent.type = 'importWork';
      this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    if (this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId).type == "MultipleChoice") {
      this.copyChoiceTypeFromComponent(nodeId, componentId);
      this.copyChoicesFromComponent(nodeId, componentId);
    }
  }

  copyChoiceTypeFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    this.authoringComponentContent.choiceType = component.choiceType;
  }

  copyChoicesFromComponent(nodeId, componentId) {
    this.authoringComponentContent.choices = this.getCopyOfChoicesFromComponent(nodeId, componentId);
  }

  getCopyOfChoicesFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    return this.UtilService.makeCopyOfJSONObject(component.choices);
  }
};

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
