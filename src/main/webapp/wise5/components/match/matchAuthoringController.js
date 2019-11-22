'use strict';

import MatchController from "./matchController";

class MatchAuthoringController extends MatchController {
  constructor($filter,
              $mdDialog,
              $mdMedia,
              $q,
              $rootScope,
              $scope,
              AnnotationService,
              ConfigService,
              dragulaService,
              MatchService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $mdMedia,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      dragulaService,
      MatchService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.allowedConnectedComponentTypes = [
      {
        type: 'Match'
      }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isHorizontal = this.componentContent.horizontal;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.isCorrect = null;
      this.submitCounter = 0;
      this.isDisabled = false;
      this.isSubmitButtonDisabled = false;
      this.initializeChoices();
      this.initializeBuckets();
    }.bind(this), true);

    this.$scope.$on('assetSelected', (event, args) => {
      if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
        const assetItem = args.assetItem;
        const fileName = assetItem.fileName;
        const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
        const fullAssetPath = assetsDirectoryPath + '/' + fileName;
        if (args.target == 'prompt' || args.target == 'rubric') {
          let summernoteId = '';
          if (args.target == 'prompt') {
            summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
          } else if (args.target == 'rubric') {
            summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
          }
          if (summernoteId != '') {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
            angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

            if (this.UtilService.isImage(fileName)) {
              angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
            } else if (this.UtilService.isVideo(fileName)) {
              const videoElement = document.createElement('video');
              videoElement.controls = 'true';
              videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
              angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
            }
          }
        } else if (args.target == 'choice') {
          const choiceObject = args.targetObject;
          choiceObject.value = '<img src="' + fileName + '"/>';
          this.authoringViewComponentChanged();
        } else if (args.target == 'bucket') {
          const bucketObject = args.targetObject;
          bucketObject.value = '<img src="' + fileName + '"/>';
          this.authoringViewComponentChanged();
        }
      }
      this.$mdDialog.hide();
    });
  }

  /**
   * Add a choice
   */
  authoringAddChoice() {

    // create a new choice
    var newChoice = {};
    newChoice.id = this.UtilService.generateKey(10);
    newChoice.value = '';
    newChoice.type = 'choice';

    // add the choice to the array of choices
    this.authoringComponentContent.choices.push(newChoice);

    // add the choice to the feedback
    this.addChoiceToFeedback(newChoice.id);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Add a bucket
   */
  authoringAddBucket() {

    // create a new bucket
    var newBucket = {};
    newBucket.id = this.UtilService.generateKey(10);
    newBucket.value = '';
    newBucket.type = 'bucket';

    // add the bucket to the array of buckets
    this.authoringComponentContent.buckets.push(newBucket);

    // add the bucket to the feedback
    this.addBucketToFeedback(newBucket.id);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a choice up
   * @param index the index of the choice
   */
  authoringMoveChoiceUp(index) {

    if (index != 0) {
      // the choice is not at the top so we can move it up

      // remember the choice
      var choice = this.authoringComponentContent.choices[index];

      if (choice != null) {

        // remove the choice
        this.authoringComponentContent.choices.splice(index, 1);

        // insert the choice one index back
        this.authoringComponentContent.choices.splice(index - 1, 0, choice);
      }

      /*
       * get the feedback so we can update the order of the choices within
       * the bucket feedback
       */
      var feedback = this.authoringComponentContent.feedback;

      if (feedback != null) {

        // loop through all the bucket feedback objects
        for (var f = 0; f < feedback.length; f++) {
          var bucketFeedback = feedback[f];

          if (bucketFeedback != null) {

            // get all the choices
            var bucketFeedbackChoices = bucketFeedback.choices;

            if (bucketFeedbackChoices != null) {

              // remmeber the choice
              var tempChoice = bucketFeedbackChoices[index];

              if (tempChoice != null) {
                // remove the choice
                bucketFeedbackChoices.splice(index, 1);

                // insert the choice one index back
                bucketFeedbackChoices.splice(index - 1, 0, tempChoice);
              }
            }
          }
        }
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a choice down
   * @param index the index of the choice
   */
  authoringMoveChoiceDown(index) {

    if (index < this.authoringComponentContent.choices.length - 1) {
      // the choice is not at the bottom so we can move it down

      // remember the choice
      var choice = this.authoringComponentContent.choices[index];

      if (choice != null) {

        // remove the choice
        this.authoringComponentContent.choices.splice(index, 1);

        // insert the choice one index forward
        this.authoringComponentContent.choices.splice(index + 1, 0, choice);
      }

      /*
       * get the feedback so we can update the order of the choices within
       * the bucket feedback
       */
      var feedback = this.authoringComponentContent.feedback;

      if (feedback != null) {

        // loop through all the bucket feedback objects
        for (var f = 0; f < feedback.length; f++) {
          var bucketFeedback = feedback[f];

          if (bucketFeedback != null) {

            // get all the choices
            var bucketFeedbackChoices = bucketFeedback.choices;

            if (bucketFeedbackChoices != null) {

              // remmeber the choice
              var tempChoice = bucketFeedbackChoices[index];

              if (tempChoice != null) {
                // remove the choice
                bucketFeedbackChoices.splice(index, 1);

                // insert the choice one index forward
                bucketFeedbackChoices.splice(index + 1, 0, tempChoice);
              }
            }
          }
        }
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a choice
   * @param index the index of the choice in the choice array
   */
  authoringDeleteChoice(index) {

    // confirm with the user that they want to delete the choice
    var answer = confirm(this.$translate('match.areYouSureYouWantToDeleteThisChoice'));

    if (answer) {

      // remove the choice from the array
      var deletedChoice = this.authoringComponentContent.choices.splice(index, 1);

      if (deletedChoice != null && deletedChoice.length > 0) {

        // splice returns an array so we need to get the element out of it
        deletedChoice = deletedChoice[0];

        // get the choice id
        var choiceId = deletedChoice.id;

        // remove the choice from the feedback
        this.removeChoiceFromFeedback(choiceId);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a bucket up
   * @param index the index of the bucket
   */
  authoringMoveBucketUp(index) {

    if (index > 0) {
      // the bucket is not at the top so we can move it up

      // remember the bucket
      var bucket = this.authoringComponentContent.buckets[index];

      if (bucket != null) {

        // remove the bucket
        this.authoringComponentContent.buckets.splice(index, 1);

        // insert the bucket one index back
        this.authoringComponentContent.buckets.splice(index - 1, 0, bucket);
      }

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      var bucketFeedback = this.authoringComponentContent.feedback[index + 1];

      if (bucketFeedback != null) {

        // remove the bucket feedback
        this.authoringComponentContent.feedback.splice(index + 1, 1);

        // insert the bucket one index back
        this.authoringComponentContent.feedback.splice(index, 0, bucketFeedback);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a bucket down
   * @param index the index of the bucket
   */
  authoringMoveBucketDown(index) {

    if (index < this.authoringComponentContent.buckets.length - 1) {
      // the bucket is not at the bottom so we can move it down

      // remember the bucket
      var bucket = this.authoringComponentContent.buckets[index];

      if (bucket != null) {

        // remove the bucket
        this.authoringComponentContent.buckets.splice(index, 1);

        // insert the bucket one index forward
        this.authoringComponentContent.buckets.splice(index + 1, 0, bucket);
      }

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      var bucketFeedback = this.authoringComponentContent.feedback[index + 1];

      if (bucketFeedback != null) {

        // remove the bucket feedback
        this.authoringComponentContent.feedback.splice(index + 1, 1);

        // insert the bucket one index forward
        this.authoringComponentContent.feedback.splice(index + 2, 0, bucketFeedback);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a bucket
   * @param index the index of the bucket in the bucket array
   */
  authoringDeleteBucket(index) {

    // confirm with the user tha tthey want to delete the bucket
    var answer = confirm(this.$translate('match.areYouSureYouWantToDeleteThisBucket'));

    if (answer) {

      // remove the bucket from the array
      var deletedBucket = this.authoringComponentContent.buckets.splice(index, 1);

      if (deletedBucket != null && deletedBucket.length > 0) {

        // splice returns an array so we need to get the element out of it
        deletedBucket = deletedBucket[0];

        // get the bucket id
        var bucketId = deletedBucket.id;

        // remove the bucket from the feedback
        this.removeBucketFromFeedback(bucketId);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Add a choice to the feedback
   * @param choiceId the choice id
   */
  addChoiceToFeedback(choiceId) {

    // get the feedback array
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      /*
       * loop through all the elements in the feedback. each element
       * represents a bucket.
       */
      for (var f = 0; f < feedback.length; f++) {
        // get a bucket
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          // get the choices in the bucket
          var choices = bucketFeedback.choices;

          var feedbackText = '';
          var isCorrect = false;

          // create a feedback object
          var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

          // add the feedback object
          choices.push(feedbackObject);
        }
      }
    }
  }

  /**
   * Add a bucket to the feedback
   * @param bucketId the bucket id
   */
  addBucketToFeedback(bucketId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // create a new bucket feedback object
      var bucket = {};
      bucket.bucketId = bucketId;
      bucket.choices = [];

      // get all the choices
      var choices = this.authoringComponentContent.choices;

      // loop through all the choices and add a choice feedback object to the bucket
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {

          var choiceId = choice.id;
          var feedbackText = '';
          var isCorrect = false;

          // create a feedback object
          var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

          // add the feedback object
          bucket.choices.push(feedbackObject);
        }
      }

      // add the feedback bucket
      feedback.push(bucket);
    }
  }

  /**
   * Create a feedback object
   * @param choiceId the choice id
   * @param feedback the feedback
   * @param isCorrect whether the choice is correct
   * @param position (optional) the position
   * @param incorrectPositionFeedback (optional) the feedback for when the
   * choice is in the correct but wrong position
   * @returns the feedback object
   */
  createFeedbackObject(choiceId, feedback, isCorrect, position, incorrectPositionFeedback) {

    var feedbackObject = {};
    feedbackObject.choiceId = choiceId;
    feedbackObject.feedback = feedback;
    feedbackObject.isCorrect = isCorrect;
    feedbackObject.position = position;
    feedbackObject.incorrectPositionFeedback = incorrectPositionFeedback;

    return feedbackObject;
  }

  /**
   * Remove a choice from the feedback
   * @param choiceId the choice id to remove
   */
  removeChoiceFromFeedback(choiceId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      /*
       * loop through each bucket feedback and remove the choice from each
       * bucket feedback object
       */
      for (var f = 0; f < feedback.length; f++) {
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          var choices = bucketFeedback.choices;

          // loop through all the choices
          for (var c = 0; c < choices.length; c++) {
            var choice = choices[c];

            if (choice != null) {
              if (choiceId === choice.choiceId) {
                // we have found the choice we want to remove

                // remove the choice feedback object
                choices.splice(c, 1);
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Remove a bucket from the feedback
   * @param bucketId the bucket id to remove
   */
  removeBucketFromFeedback(bucketId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // loop through all the bucket feedback objects
      for (var f = 0; f < feedback.length; f++) {
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          if (bucketId === bucketFeedback.bucketId) {
            // we have found the bucket feedback object we want to remove

            // remove the bucket feedback object
            feedback.splice(f, 1);
            break;
          }
        }
      }
    }
  }

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
   * Check if this component has been authored to have feedback or a correct
   * choice
   * @return whether this component has feedback or a correct choice
   */
  componentHasFeedback() {

    // get the feedback
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // loop through all the feedback buckets
      for (var f = 0; f < feedback.length; f++) {

        var tempFeedback = feedback[f];

        if (tempFeedback != null) {
          var tempChoices = tempFeedback.choices;

          if (tempChoices != null) {

            // loop through the feedback choices
            for (var c = 0; c < tempChoices.length; c++) {
              var tempChoice = tempChoices[c];

              if (tempChoice != null) {

                if (tempChoice.feedback != null && tempChoice.feedback != '') {
                  // this choice has feedback
                  return true;
                }

                if (tempChoice.isCorrect) {
                  // this choice is correct
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * The "Is Correct" checkbox for a choice feedback has been clicked.
   * @param feedback The choice feedback.
   */
  authoringViewIsCorrectClicked(feedback) {
    if (!feedback.isCorrect) {
      // the choice has been set to not correct so we will remove the position
      delete feedback.position;
      delete feedback.incorrectPositionFeedback;
    }
    // save the component
    this.authoringViewComponentChanged();
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
   * Show the asset popup to allow the author to choose an image for the
   * bucket
   * @param bucket the bucket object to set the image into
   */
  chooseBucketAsset(bucket) {
    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'bucket';
    params.targetObject = bucket;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }
}

MatchAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$mdMedia',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'dragulaService',
  'MatchService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default MatchAuthoringController;
