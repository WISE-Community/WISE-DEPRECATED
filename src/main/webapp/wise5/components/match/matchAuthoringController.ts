'use strict';

import { ComponentAuthoringController } from '../componentAuthoringController';

class MatchAuthoringController extends ComponentAuthoringController {
  allowedConnectedComponentTypes: any[] = [{ type: 'Match' }];
  defaultSourceBucketId: string = '0';

  static $inject = [
    '$scope',
    '$filter',
    'ConfigService',
    'MatchService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $scope,
    $filter,
    ConfigService,
    private MatchService,
    NodeService,
    private NotebookService,
    NotificationService,
    protected ProjectAssetService,
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

  addChoice(): void {
    const newChoice = {
      id: this.UtilService.generateKey(10),
      value: '',
      type: 'choice'
    };
    this.authoringComponentContent.choices.push(newChoice);
    this.addChoiceToFeedback(newChoice.id);
    this.authoringViewComponentChanged();
  }

  addBucket(): void {
    const newBucket = {
      id: this.UtilService.generateKey(10),
      value: '',
      type: 'bucket'
    };
    this.authoringComponentContent.buckets.push(newBucket);
    this.addBucketToFeedback(newBucket.id);
    this.authoringViewComponentChanged();
  }

  moveChoiceUp(index: number): void {
    if (index != 0) {
      const choice = this.authoringComponentContent.choices[index];
      this.authoringComponentContent.choices.splice(index, 1);
      this.authoringComponentContent.choices.splice(index - 1, 0, choice);
      const feedback = this.authoringComponentContent.feedback;
      if (feedback != null) {
        for (const bucketFeedback of feedback) {
          const bucketFeedbackChoices = bucketFeedback.choices;
          if (bucketFeedbackChoices != null) {
            const tempChoice = bucketFeedbackChoices[index];
            if (tempChoice != null) {
              bucketFeedbackChoices.splice(index, 1);
              bucketFeedbackChoices.splice(index - 1, 0, tempChoice);
            }
          }
        }
      }
      this.authoringViewComponentChanged();
    }
  }

  moveChoiceDown(index: number): void {
    if (index < this.authoringComponentContent.choices.length - 1) {
      const choice = this.authoringComponentContent.choices[index];
      this.authoringComponentContent.choices.splice(index, 1);
      this.authoringComponentContent.choices.splice(index + 1, 0, choice);
      const feedback = this.authoringComponentContent.feedback;
      if (feedback != null) {
        for (const bucketFeedback of feedback) {
          const bucketFeedbackChoices = bucketFeedback.choices;
          if (bucketFeedbackChoices != null) {
            const tempChoice = bucketFeedbackChoices[index];
            if (tempChoice != null) {
              bucketFeedbackChoices.splice(index, 1);
              bucketFeedbackChoices.splice(index + 1, 0, tempChoice);
            }
          }
        }
      }
      this.authoringViewComponentChanged();
    }
  }

  deleteChoice(index: number): void {
    if (confirm(this.$translate('match.areYouSureYouWantToDeleteThisChoice'))) {
      const deletedChoice = this.authoringComponentContent.choices.splice(index, 1);
      if (deletedChoice != null && deletedChoice.length > 0) {
        this.removeChoiceFromFeedback(deletedChoice[0].id);
      }
      this.authoringViewComponentChanged();
    }
  }

  moveBucketUp(index: number): void {
    if (index > 0) {
      const bucket = this.authoringComponentContent.buckets[index];
      this.authoringComponentContent.buckets.splice(index, 1);
      this.authoringComponentContent.buckets.splice(index - 1, 0, bucket);

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      const bucketFeedback = this.authoringComponentContent.feedback[index + 1];
      if (bucketFeedback != null) {
        this.authoringComponentContent.feedback.splice(index + 1, 1);
        this.authoringComponentContent.feedback.splice(index, 0, bucketFeedback);
      }
      this.authoringViewComponentChanged();
    }
  }

  moveBucketDown(index: number): void {
    if (index < this.authoringComponentContent.buckets.length - 1) {
      const bucket = this.authoringComponentContent.buckets[index];
      this.authoringComponentContent.buckets.splice(index, 1);
      this.authoringComponentContent.buckets.splice(index + 1, 0, bucket);

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      const bucketFeedback = this.authoringComponentContent.feedback[index + 1];
      if (bucketFeedback != null) {
        this.authoringComponentContent.feedback.splice(index + 1, 1);
        this.authoringComponentContent.feedback.splice(index + 2, 0, bucketFeedback);
      }
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a bucket
   * @param index the index of the bucket in the bucket array
   */
  deleteBucket(index: number): void {
    if (confirm(this.$translate('match.areYouSureYouWantToDeleteThisBucket'))) {
      const deletedBucket = this.authoringComponentContent.buckets.splice(index, 1);
      if (deletedBucket != null && deletedBucket.length > 0) {
        this.removeBucketFromFeedback(deletedBucket[0].id);
      }
      this.authoringViewComponentChanged();
    }
  }

  addChoiceToFeedback(choiceId: string): void {
    const feedback = this.authoringComponentContent.feedback;
    if (feedback != null) {
      for (const bucketFeedback of feedback) {
        const feedbackText = '';
        const isCorrect = false;
        bucketFeedback.choices.push(this.createFeedbackObject(choiceId, feedbackText, isCorrect));
      }
    }
  }

  addBucketToFeedback(bucketId: string): void {
    const feedback = this.authoringComponentContent.feedback;
    if (feedback != null) {
      const bucket = {
        bucketId: bucketId,
        choices: []
      };
      const choices = this.authoringComponentContent.choices;
      for (const choice of choices) {
        const choiceId = choice.id;
        const feedbackText = '';
        const isCorrect = false;
        bucket.choices.push(this.createFeedbackObject(choiceId, feedbackText, isCorrect));
      }
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
  createFeedbackObject(
    choiceId: string,
    feedback: string,
    isCorrect: boolean,
    position: number = null,
    incorrectPositionFeedback: string = null
  ): any {
    return {
      choiceId: choiceId,
      feedback: feedback,
      isCorrect: isCorrect,
      position: position,
      incorrectPositionFeedback: incorrectPositionFeedback
    };
  }

  /**
   * Remove a choice from the feedback
   * @param choiceId the choice id to remove
   */
  removeChoiceFromFeedback(choiceId: string): void {
    const feedback = this.authoringComponentContent.feedback;
    if (feedback != null) {
      for (const bucketFeedback of feedback) {
        const choices = bucketFeedback.choices;
        for (let c = 0; c < choices.length; c++) {
          const choice = choices[c];
          if (choiceId === choice.choiceId) {
            choices.splice(c, 1);
            break;
          }
        }
      }
    }
  }

  /**
   * Remove a bucket from the feedback
   * @param bucketId the bucket id to remove
   */
  removeBucketFromFeedback(bucketId: string): void {
    const feedback = this.authoringComponentContent.feedback;
    if (feedback != null) {
      for (let f = 0; f < feedback.length; f++) {
        const bucketFeedback = feedback[f];
        if (bucketFeedback != null) {
          if (bucketId === bucketFeedback.bucketId) {
            feedback.splice(f, 1);
            break;
          }
        }
      }
    }
  }

  feedbackChanged(): void {
    let show = true;
    if (this.componentHasFeedback()) {
      show = true;
    } else {
      show = false;
    }
    this.setShowSubmitButtonValue(show);
    this.authoringViewComponentChanged();
  }

  /**
   * Check if this component has been authored to have feedback or a correct choice
   * @return whether this component has feedback or a correct choice
   */
  componentHasFeedback(): boolean {
    const feedback = this.authoringComponentContent.feedback;
    if (feedback != null) {
      for (const tempFeedback of feedback) {
        const tempChoices = tempFeedback.choices;
        if (tempChoices != null) {
          for (const tempChoice of tempChoices) {
            if (tempChoice.feedback != null && tempChoice.feedback != '') {
              return true;
            }
            if (tempChoice.isCorrect) {
              return true;
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
  isCorrectClicked(feedback: any): void {
    if (!feedback.isCorrect) {
      delete feedback.position;
      delete feedback.incorrectPositionFeedback;
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Show the asset popup to allow the author to choose an image for the choice
   * @param choice the choice object to set the image into
   */
  chooseChoiceAsset(choice: any): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'choice',
      targetObject: choice
    };
    this.openAssetChooser(params);
  }

  /**
   * Show the asset popup to allow the author to choose an image for the bucket
   * @param bucket the bucket object to set the image into
   */
  chooseBucketAsset(bucket: any): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'bucket',
      targetObject: bucket
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    const fileName = assetItem.fileName;
    if (target === 'choice') {
      targetObject.value = '<img src="' + fileName + '"/>';
      this.authoringViewComponentChanged();
    } else if (target === 'bucket') {
      targetObject.value = '<img src="' + fileName + '"/>';
      this.authoringViewComponentChanged();
    }
  }

  getChoiceTextById(choiceId: string): string {
    const choice = this.MatchService.getChoiceById(
      choiceId,
      this.authoringComponentContent.choices
    );
    if (choice != null) {
      return choice.value;
    }
    return null;
  }

  getBucketNameById(bucketId: string): string {
    if (bucketId === this.defaultSourceBucketId) {
      const choicesLabel = this.authoringComponentContent.choicesLabel;
      return choicesLabel ? choicesLabel : this.$translate('match.choices');
    }
    const bucket = this.MatchService.getBucketById(
      bucketId,
      this.authoringComponentContent.buckets
    );
    if (bucket != null) {
      return bucket.value;
    }
    return null;
  }

  isNotebookEnabled() {
    return this.NotebookService.isNotebookEnabled();
  }
}

export default MatchAuthoringController;
