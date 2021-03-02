import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';
import { MatchService } from '../matchService';

@Component({
  selector: 'match-authoring',
  templateUrl: 'match-authoring.component.html',
  styleUrls: ['match-authoring.component.scss']
})
export class MatchAuthoring extends ComponentAuthoring {
  defaultSourceBucketId: string = '0';

  inputChange: Subject<string> = new Subject<string>();
  feedbackChange: Subject<string> = new Subject<string>();

  inputChangeSubscription: Subscription;
  feedbackChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    private MatchService: MatchService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
    this.feedbackChangeSubscription = this.feedbackChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.turnOnSubmitButtonIfFeedbackExists();
        this.componentChanged();
      });
  }

  ngOnDestroy() {
    this.inputChangeSubscription.unsubscribe();
    this.feedbackChangeSubscription.unsubscribe();
  }

  turnOnSubmitButtonIfFeedbackExists() {
    if (this.componentHasFeedback()) {
      this.setShowSubmitButtonValue(true);
    }
  }

  addChoice(): void {
    const newChoice = {
      id: this.UtilService.generateKey(10),
      value: '',
      type: 'choice'
    };
    this.authoringComponentContent.choices.push(newChoice);
    this.addChoiceToFeedback(newChoice.id);
    this.componentChanged();
  }

  addBucket(): void {
    const newBucket = {
      id: this.UtilService.generateKey(10),
      value: '',
      type: 'bucket'
    };
    this.authoringComponentContent.buckets.push(newBucket);
    this.addBucketToFeedback(newBucket.id);
    this.componentChanged();
  }

  moveChoiceUp(index: number): void {
    if (index != 0) {
      this.moveChoiceUpInChoices(index);
      this.moveChoiceUpInAllBucketFeedback(index);
      this.componentChanged();
    }
  }

  moveChoiceDown(index: number): void {
    if (index < this.authoringComponentContent.choices.length - 1) {
      this.moveChoiceDownInChoices(index);
      this.moveChoiceDownInAllBucketFeedback(index);
      this.componentChanged();
    }
  }

  moveChoiceUpInChoices(index: number) {
    this.moveChoiceInChoices(index, -1);
  }

  moveChoiceDownInChoices(index: number) {
    this.moveChoiceInChoices(index, 1);
  }

  moveChoiceInChoices(index: number, amountToShift: number) {
    const choice = this.authoringComponentContent.choices[index];
    this.authoringComponentContent.choices.splice(index, 1);
    this.authoringComponentContent.choices.splice(index + amountToShift, 0, choice);
  }

  moveChoiceUpInAllBucketFeedback(index: number) {
    this.moveChoiceInAllBucketFeedback(index, -1);
  }

  moveChoiceDownInAllBucketFeedback(index: number) {
    this.moveChoiceInAllBucketFeedback(index, 1);
  }

  moveChoiceInAllBucketFeedback(index: number, amountToShift: number) {
    const feedback = this.authoringComponentContent.feedback;
    for (const bucketFeedbackObj of feedback) {
      const bucketFeedbackChoices = bucketFeedbackObj.choices;
      const tempChoice = bucketFeedbackChoices[index];
      bucketFeedbackChoices.splice(index, 1);
      bucketFeedbackChoices.splice(index + amountToShift, 0, tempChoice);
    }
  }

  deleteChoice(index: number): void {
    if (confirm($localize`Are you sure you want to delete this choice?`)) {
      const deletedChoice = this.authoringComponentContent.choices.splice(index, 1);
      this.removeChoiceFromFeedback(deletedChoice[0].id);
      this.componentChanged();
    }
  }

  moveBucketUp(index: number): void {
    if (index > 0) {
      this.moveBucketUpInBuckets(index);
      this.moveBucketUpInBucketFeedback(index);
      this.componentChanged();
    }
  }

  moveBucketDown(index: number): void {
    if (index < this.authoringComponentContent.buckets.length - 1) {
      this.moveBucketDownInBuckets(index);
      this.moveBucketDownInBucketFeedback(index);
      this.componentChanged();
    }
  }

  moveBucketUpInBuckets(index: number) {
    this.moveBucketInBuckets(index, -1);
  }

  moveBucketDownInBuckets(index: number) {
    this.moveBucketInBuckets(index, 1);
  }

  moveBucketInBuckets(index: number, amountToShift: number) {
    const bucket = this.authoringComponentContent.buckets[index];
    this.authoringComponentContent.buckets.splice(index, 1);
    this.authoringComponentContent.buckets.splice(index + amountToShift, 0, bucket);
  }

  moveBucketUpInBucketFeedback(index: number) {
    this.moveBucketInBucketFeedback(index, -1);
  }

  moveBucketDownInBucketFeedback(index: number) {
    this.moveBucketInBucketFeedback(index, 1);
  }

  moveBucketInBucketFeedback(index: number, amountToShift: number) {
    // the bucket feedback index for authored buckets starts at 1 because the source bucket is at 0
    const bucketFeedbackIndex = index + 1;
    const bucketFeedbackObj = this.authoringComponentContent.feedback[bucketFeedbackIndex];
    this.authoringComponentContent.feedback.splice(bucketFeedbackIndex, 1);
    this.authoringComponentContent.feedback.splice(
      bucketFeedbackIndex + amountToShift,
      0,
      bucketFeedbackObj
    );
  }

  deleteBucket(index: number): void {
    if (confirm($localize`Are you sure you want to delete this bucket?`)) {
      const deletedBucket = this.authoringComponentContent.buckets.splice(index, 1);
      if (deletedBucket != null && deletedBucket.length > 0) {
        this.removeBucketFromFeedback(deletedBucket[0].id);
      }
      this.componentChanged();
    }
  }

  addChoiceToFeedback(choiceId: string): void {
    const feedback = this.authoringComponentContent.feedback;
    for (const bucketFeedback of feedback) {
      const feedbackText = '';
      const isCorrect = false;
      bucketFeedback.choices.push(this.createFeedbackObject(choiceId, feedbackText, isCorrect));
    }
  }

  addBucketToFeedback(bucketId: string): void {
    const feedback = this.authoringComponentContent.feedback;
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

  removeChoiceFromFeedback(choiceId: string): void {
    for (const bucketFeedback of this.authoringComponentContent.feedback) {
      bucketFeedback.choices = bucketFeedback.choices.filter((choice) => {
        return choice.choiceId !== choiceId;
      });
    }
  }

  removeBucketFromFeedback(bucketId: string): void {
    const feedback = this.authoringComponentContent.feedback;
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

  componentHasFeedback(): boolean {
    for (const feedback of this.authoringComponentContent.feedback) {
      for (const choice of feedback.choices) {
        if (choice.isCorrect || this.isNonEmpty(choice.feedback)) {
          return true;
        }
      }
    }
    return false;
  }

  isNonEmpty(str: string): boolean {
    return str != null && str != '';
  }

  isCorrectClicked(feedback: any): void {
    if (!feedback.isCorrect) {
      delete feedback.position;
      delete feedback.incorrectPositionFeedback;
    }
    this.turnOnSubmitButtonIfFeedbackExists();
    this.componentChanged();
  }

  chooseChoiceAsset(choice: any): void {
    this.openAssetChooserHelper('choice', choice);
  }

  chooseBucketAsset(bucket: any): void {
    this.openAssetChooserHelper('bucket', bucket);
  }

  openAssetChooserHelper(target: string, targetObject: any): void {
    this.openAssetChooser({
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: target,
      targetObject: targetObject
    });
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'choice' || target === 'bucket') {
      targetObject.value = '<img src="' + assetItem.fileName + '"/>';
      this.componentChanged();
    }
  }

  getChoiceTextById(choiceId: string): string {
    const choice = this.MatchService.getChoiceById(
      choiceId,
      this.authoringComponentContent.choices
    );
    return choice ? choice.value : null;
  }

  getBucketNameById(bucketId: string): string {
    if (bucketId === this.defaultSourceBucketId) {
      const choicesLabel = this.authoringComponentContent.choicesLabel;
      return choicesLabel ? choicesLabel : $localize`Choices`;
    }
    const bucket = this.MatchService.getBucketById(
      bucketId,
      this.authoringComponentContent.buckets
    );
    return bucket ? bucket.value : null;
  }
}
