'use strict';

import { Directive } from '@angular/core';
import * as angular from 'angular';
import ComponentController from '../componentController';
import { MatchService } from './matchService';

@Directive()
class MatchController extends ComponentController {
  $mdMedia: any;
  $q: any;
  dragulaService: any;
  MatchService: MatchService;
  choices: any[];
  buckets: any[];
  isCorrect: boolean;
  bucketWidth: number;
  numChoiceColumns: number;
  isHorizontal: boolean;
  choiceStyle: any;
  bucketStyle: string;
  sourceBucketId: string;
  hasCorrectAnswer: boolean;
  isLatestComponentStateSubmit: boolean;
  sourceBucket: any;
  privateNotebookItems: any[];
  autoScroll: any;
  notebookUpdatedSubscription: any;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$mdMedia',
    '$q',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'dragulaService',
    'MatchService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $mdMedia,
    $q,
    $rootScope,
    $scope,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    dragulaService,
    MatchService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.$q = $q;
    this.dragulaService = dragulaService;
    this.MatchService = MatchService;
    this.$mdMedia = $mdMedia;
    this.autoScroll = require('dom-autoscroller');

    this.choices = [];
    this.buckets = [];
    this.isCorrect = null;
    this.bucketWidth = 100; // the flex (%) width for displaying the buckets
    this.numChoiceColumns = 1;
    this.isHorizontal = this.componentContent.horizontal; // whether to orient the choices and buckets side-by-side
    this.choiceStyle = '';
    this.bucketStyle = '';
    this.sourceBucketId = '0';
    this.hasCorrectAnswer = false;
    this.isLatestComponentStateSubmit = false;
    this.sourceBucket = null;

    this.privateNotebookItems = [];

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      if (this.shouldImportPrivateNotes()) {
        const allPrivateNotebookItems = this.NotebookService.getPrivateNotebookItems();
        this.privateNotebookItems = allPrivateNotebookItems.filter((note) => {
          return note.serverDeleteTime == null;
        });
        this.notebookUpdatedSubscription = this.NotebookService.notebookUpdated$.subscribe(
          (args) => {
            if (args.notebookItem.type === 'note') {
              this.addNotebookItemToSourceBucket(args.notebookItem);
            }
          }
        );
      }
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
      if (this.shouldImportPrivateNotes()) {
        this.privateNotebookItems = this.NotebookService.getPrivateNotebookItems(this.workgroupId);
      }
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    this.hasCorrectAnswer = this.hasCorrectChoices();
    this.initializeChoices();
    this.initializeBuckets();
    const componentState = this.$scope.componentState;
    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        this.MatchService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      }
    } else if (componentState != null) {
      this.setStudentWork(componentState);
    }

    if (componentState != null && componentState.isSubmit) {
      this.isLatestComponentStateSubmit = componentState.isSubmit === true;
    }

    if (this.studentHasUsedAllSubmits()) {
      this.isDisabled = true;
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();

    this.registerDragListeners();

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param {boolean} isSubmit whether the request is coming from a submit
     * action (optional; default is false)
     * @return {promise} a promise of a component state containing the student data
     */
    this.$scope.getComponentState = (isSubmit) => {
      const deferred = this.$q.defer();
      let hasDirtyWork = false;
      let action = 'change';

      if (isSubmit) {
        if (this.$scope.matchController.isSubmitDirty) {
          hasDirtyWork = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.matchController.isDirty) {
          hasDirtyWork = true;
          action = 'save';
        }
      }

      if (hasDirtyWork) {
        this.$scope.matchController.createComponentState(action).then((componentState) => {
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };

    this.broadcastDoneRenderingComponent();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    if (this.notebookUpdatedSubscription != null) {
      this.notebookUpdatedSubscription.unsubscribe();
    }
  }

  addNotebookItemToSourceBucket(notebookItem) {
    const choice = this.createChoiceFromNotebookItem(notebookItem);
    this.choices.push(choice);
    const sourceBucket = this.MatchService.getBucketById(this.sourceBucketId, this.buckets);
    sourceBucket.items.push(choice);
  }

  studentHasUsedAllSubmits() {
    return (
      this.componentContent.maxSubmitCount != null &&
      this.submitCounter >= this.componentContent.maxSubmitCount
    );
  }

  registerDragListeners() {
    const dragId = 'match_' + this.componentId;
    this.registerStudentDataChangedOnDrop(dragId);
    this.disableDraggingIfNeeded(dragId);
    const drake = this.dragulaService.find(this.$scope, dragId).drake;
    this.showVisualIndicatorWhileDragging(drake);
    this.autoScroll([document.querySelector('#content')], {
      margin: 30,
      pixels: 50,
      scrollWhenOutside: true,
      autoScroll: function () {
        return this.down && drake.dragging;
      }
    });
  }

  registerStudentDataChangedOnDrop(dragId) {
    const dropEvent = dragId + '.drop-model';
    this.$scope.$on(dropEvent, (e, el, container, source) => {
      this.$scope.matchController.studentDataChanged();
    });
  }

  disableDraggingIfNeeded(dragId) {
    this.dragulaService.options(this.$scope, dragId, {
      moves: (el, source, handle, sibling) => {
        return !this.$scope.matchController.isDisabled;
      }
    });
  }

  showVisualIndicatorWhileDragging(drake) {
    drake
      .on('over', (el, container, source) => {
        if (source !== container) {
          container.className += ' match-bucket__contents--over';
        }
      })
      .on('out', (el, container, source) => {
        if (source !== container) {
          container.className = container.className.replace('match-bucket__contents--over', '');
        }
      });
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setStudentWork(componentState) {
    const studentData = componentState.studentData;
    const componentStateBuckets = studentData.buckets;
    const sourceBucket = this.MatchService.getBucketById(this.sourceBucketId, this.buckets);
    sourceBucket.items = []; // clear the source bucket
    const bucketIds = this.getBucketIds();
    const choiceIds = this.getChoiceIds();

    for (let componentStateBucket of componentStateBuckets) {
      let componentStateBucketId = componentStateBucket.id;
      if (bucketIds.indexOf(componentStateBucketId) > -1) {
        for (let currentChoice of componentStateBucket.items) {
          const currentChoiceId = currentChoice.id;
          const currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
          const bucket = this.MatchService.getBucketById(componentStateBucketId, this.buckets);
          if (currentChoiceLocation > -1) {
            // choice is valid and used by student in a valid bucket, so add it to that bucket

            // content for choice with this id may have changed, so get updated content
            const updatedChoice = this.MatchService.getChoiceById(currentChoiceId, this.choices);
            bucket.items.push(updatedChoice);
            choiceIds.splice(currentChoiceLocation, 1);
          } else {
            bucket.items.push(currentChoice);
          }
        }
      }
    }

    // add unused choices to the source bucket
    for (let choiceId of choiceIds) {
      sourceBucket.items.push(this.MatchService.getChoiceById(choiceId, this.choices));
    }

    const submitCounter = studentData.submitCounter;
    if (submitCounter != null) {
      this.submitCounter = submitCounter;
    }

    if (this.submitCounter > 0) {
      if (componentState.isSubmit) {
        this.checkAnswer();
      } else {
        /*
         * This component state was not a submit, but the student
         * submitted some time in the past. We want to show the
         * feedback for choices that have not moved since the
         * student submitted.
         */
        this.processPreviousStudentWork();
      }
    } else {
      /*
       * there was no submit in the past but we will still need to
       * check if submit is dirty.
       */
      this.processPreviousStudentWork();
    }
  }

  /**
   * Get the latest submitted componentState and display feedback for choices
   * that haven't changed since. This will also determine if submit is dirty.
   */
  processPreviousStudentWork() {
    const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    if (latestComponentState == null) {
      return;
    }

    const serverSaveTime = latestComponentState.serverSaveTime;
    const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
    if (latestComponentState.isSubmit === true) {
      this.isCorrect = latestComponentState.isCorrect;
      this.setIsSubmitDirty(false);
      this.setSubmittedMessage(clientSaveTime);
      this.checkAnswer();
    } else {
      const latestSubmitComponentState = this.StudentDataService.getLatestSubmitComponentState(
        this.nodeId,
        this.componentId
      );
      if (latestSubmitComponentState != null) {
        this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
      } else {
        this.isCorrect = null;
        this.setIsSubmitDirty(false);
        this.setSavedMessage(clientSaveTime);
      }
    }
  }

  /**
   * There is unsaved student work that is not yet saved in a component state
   */
  processDirtyStudentWork() {
    const latestSubmitComponentState = this.StudentDataService.getLatestSubmitComponentState(
      this.nodeId,
      this.componentId
    );
    if (latestSubmitComponentState != null) {
      this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
    } else {
      const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
      if (latestComponentState != null) {
        this.isCorrect = null;
        this.setIsSubmitDirty(true);
        this.setSavedMessage(latestComponentState.clientSaveTime);
      }
    }
  }

  showFeedbackOnUnchangedChoices(latestSubmitComponentState) {
    const choicesThatChangedSinceLastSubmit = this.getChoicesThatChangedSinceLastSubmit(
      latestSubmitComponentState
    );
    if (choicesThatChangedSinceLastSubmit.length > 0) {
      this.setIsSubmitDirty(true);
    } else {
      this.setIsSubmitDirty(false);
    }
    this.checkAnswer(choicesThatChangedSinceLastSubmit);
  }

  setIsSubmitDirty(isSubmitDirty) {
    this.isSubmitDirty = isSubmitDirty;
    this.StudentDataService.broadcastComponentSubmitDirty({
      componentId: this.componentId,
      isDirty: isSubmitDirty
    });
  }

  isLatestComponentStateASubmit() {}

  getBucketIds() {
    return this.buckets.map((b) => {
      return b.id;
    });
  }

  getChoiceIds() {
    return this.choices.map((c) => {
      return c.id;
    });
  }

  getChoicesThatChangedSinceLastSubmit(latestSubmitComponentState) {
    const latestSubmitComponentStateBuckets = latestSubmitComponentState.studentData.buckets;
    const choicesThatChangedSinceLastSubmit = [];
    for (let currentComponentStateBucket of this.buckets) {
      const currentComponentStateBucketChoiceIds = currentComponentStateBucket.items.map(
        (choice) => {
          return choice.id;
        }
      );
      let bucketFromSubmitComponentState = this.MatchService.getBucketById(
        currentComponentStateBucket.id,
        latestSubmitComponentStateBuckets
      );
      if (bucketFromSubmitComponentState != null) {
        const latestSubmitComponentStateChoiceIds = bucketFromSubmitComponentState.items.map(
          (choice) => {
            return choice.id;
          }
        );

        for (
          let choiceIndexInBucket = 0;
          choiceIndexInBucket < currentComponentStateBucketChoiceIds.length;
          choiceIndexInBucket++
        ) {
          const currentBucketChoiceId = currentComponentStateBucketChoiceIds[choiceIndexInBucket];
          if (latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId) == -1) {
            choicesThatChangedSinceLastSubmit.push(currentBucketChoiceId);
          } else if (
            this.isAuthorHasSpecifiedACorrectPosition(currentBucketChoiceId) &&
            choiceIndexInBucket !=
              latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId)
          ) {
            choicesThatChangedSinceLastSubmit.push(currentBucketChoiceId);
          }
        }
      }
    }
    return choicesThatChangedSinceLastSubmit;
  }

  getChoices() {
    return this.choices;
  }

  initializeChoices() {
    this.choices = this.componentContent.choices;
    if (this.shouldImportPrivateNotes()) {
      for (let privateNotebookItem of this.privateNotebookItems) {
        if (privateNotebookItem.type === 'note') {
          this.choices.push(this.createChoiceFromNotebookItem(privateNotebookItem));
        }
      }
    }
  }

  shouldImportPrivateNotes() {
    return this.isNotebookEnabled() && this.componentContent.importPrivateNotes;
  }

  createChoiceFromNotebookItem(notebookItem) {
    let value = notebookItem.content.text;
    for (let attachment of notebookItem.content.attachments) {
      value += '<br/><img src="' + attachment.iconURL + '"/>';
    }
    return {
      id: notebookItem.localNotebookItemId,
      value: value,
      type: 'choice'
    };
  }

  initializeBuckets() {
    this.buckets = [];
    this.setBucketWidth();
    this.setNumChoiceColumns();
    this.setChoiceStyle();
    this.setBucketStyle();
    this.sourceBucket = {
      id: this.sourceBucketId,
      value: this.componentContent.choicesLabel
        ? this.componentContent.choicesLabel
        : this.$translate('match.choices'),
      type: 'bucket',
      items: []
    };
    for (let choice of this.getChoices()) {
      this.sourceBucket.items.push(choice);
    }
    this.buckets.push(this.sourceBucket);
    for (let bucket of this.componentContent.buckets) {
      bucket.items = [];
      this.buckets.push(bucket);
    }
  }

  setBucketWidth() {
    if (this.isHorizontal) {
      this.bucketWidth = 100;
    } else {
      if (typeof this.componentContent.bucketWidth === 'number') {
        this.bucketWidth = this.componentContent.bucketWidth;
      } else {
        let n = this.componentContent.buckets.length;
        if (n % 3 === 0 || n > 4) {
          this.bucketWidth = Math.round(100 / 3);
        } else if (n % 2 === 0) {
          this.bucketWidth = 100 / 2;
        }
      }
    }
  }

  setNumChoiceColumns() {
    if (this.isHorizontal) {
      this.numChoiceColumns = 1;
    } else {
      if (typeof this.componentContent.bucketWidth === 'number') {
        this.numChoiceColumns = Math.round(100 / this.componentContent.bucketWidth);
      } else {
        let n = this.componentContent.buckets.length;
        if (n % 3 === 0 || n > 4) {
          this.numChoiceColumns = 3;
        } else if (n % 2 === 0) {
          this.numChoiceColumns = 2;
        }
      }
      if (typeof this.componentContent.choiceColumns === 'number') {
        this.numChoiceColumns = this.componentContent.choiceColumns;
      }
    }
  }

  setChoiceStyle() {
    this.choiceStyle = {
      '-moz-column-count': this.numChoiceColumns,
      '-webkit-column-count': this.numChoiceColumns,
      'column-count': this.numChoiceColumns
    };
  }

  setBucketStyle() {
    if (this.bucketWidth === 100) {
      this.bucketStyle = this.choiceStyle;
    }
  }

  getBuckets() {
    return this.buckets;
  }

  /**
   * Create a copy of the array of buckets with brand new objects.
   * @return {array}
   */
  getCopyOfBuckets() {
    const bucketsJSONString = angular.toJson(this.getBuckets());
    return angular.fromJson(bucketsJSONString);
  }

  getNumSubmitsLeft() {
    return this.componentContent.maxSubmitCount - this.submitCounter;
  }

  hasStudentUsedAllSubmits() {
    return this.getNumSubmitsLeft() <= 0;
  }

  /**
   * Check if the student has answered correctly and show feedback.
   * @param {array} choice ids to not show feedback for
   */
  checkAnswer(choiceIdsExcludedFromFeedback = []) {
    let isCorrect = true;
    let buckets = this.getBuckets();
    for (let bucket of buckets) {
      let bucketId = bucket.id;
      let items = bucket.items;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let position = i + 1;
        let choiceId = item.id;
        let feedbackObject = this.getFeedbackObject(bucketId, choiceId);
        if (feedbackObject != null) {
          let feedback = feedbackObject.feedback;
          let correctPosition = feedbackObject.position;
          let feedbackIsCorrect = feedbackObject.isCorrect;
          if (this.hasCorrectAnswer) {
            if (!this.isAuthorHasSpecifiedACorrectBucket(choiceId)) {
              if (bucketId == this.sourceBucketId) {
                // set this choice as correct because this choice belongs in the source bucket
                feedbackIsCorrect = true;
              }
            }
          }

          if (feedback == '') {
            if (this.hasCorrectAnswer) {
              if (feedbackIsCorrect) {
                feedback = this.$translate('CORRECT');
              } else {
                feedback = this.$translate('INCORRECT');
              }
            }
          }

          if (this.doesPositionNotMatter(correctPosition)) {
            item.feedback = feedback;
            item.isCorrect = feedbackIsCorrect;
            item.isIncorrectPosition = false;
            isCorrect = isCorrect && feedbackIsCorrect;
          } else {
            /*
             * position does matter and the choice is in a correct
             * bucket. we know this because a feedback object will
             * only have a non-null position value if the choice is
             * in the correct bucket. if the feedback object is for
             * a choice that is in an incorrect bucket, the position
             * value will be null.
             */
            if (position === correctPosition) {
              item.feedback = feedback;
              item.isCorrect = feedbackIsCorrect;
              item.isIncorrectPosition = false;
              isCorrect = isCorrect && feedbackIsCorrect;
            } else {
              // item is in the correct bucket but wrong position
              let incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;
              if (incorrectPositionFeedback == null || incorrectPositionFeedback == '') {
                incorrectPositionFeedback = this.$translate('match.correctBucketButWrongPosition');
              }
              item.feedback = incorrectPositionFeedback;
              item.isCorrect = false;
              item.isIncorrectPosition = true;
              isCorrect = false;
            }
          }
        }

        if (!this.hasCorrectAnswer) {
          item.isCorrect = null;
          item.isIncorrectPosition = null;
        }

        if (choiceIdsExcludedFromFeedback.indexOf(choiceId) > -1) {
          item.feedback = null;
        }
      }
    }

    if (this.hasCorrectAnswer) {
      this.isCorrect = isCorrect;
    } else {
      this.isCorrect = null;
    }
  }

  /**
   * Get the array of feedback
   * @return {array} the array of feedback objects
   */
  getAllFeedback() {
    return this.componentContent.feedback;
  }

  /**
   * Get the feedback object for the combination of bucket and choice
   * @param {string} bucketId the bucket id
   * @param {string} choiceId the choice id
   * @return {object} the feedback object for the combination of bucket and choice
   */
  getFeedbackObject(bucketId, choiceId) {
    for (let bucketFeedback of this.getAllFeedback()) {
      if (bucketFeedback.bucketId === bucketId) {
        for (let choiceFeedback of bucketFeedback.choices) {
          if (choiceFeedback.choiceId === choiceId) {
            return choiceFeedback;
          }
        }
      }
    }
    return null;
  }

  doesPositionNotMatter(feedbackPosition) {
    return !this.componentContent.ordered || feedbackPosition == null;
  }

  studentDataChanged() {
    this.isCorrect = null;
    this.isLatestComponentStateSubmit = false;
    super.studentDataChanged();
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    let componentState: any = this.NodeService.createNewComponentState();
    let studentData: any = {};
    if (action === 'submit') {
      this.checkAnswer();
      if (this.hasCorrectAnswer && this.isCorrect != null) {
        studentData.isCorrect = this.isCorrect;
      }
      this.isLatestComponentStateSubmit = true;
    } else {
      this.clearFeedback();
      this.processDirtyStudentWork();
      this.isLatestComponentStateSubmit = false;
    }

    /*
     * Create a copy of the buckets so we don't accidentally change a bucket and have it also
     * change previous versions of the buckets.
     */
    studentData.buckets = this.getCopyOfBuckets();
    componentState.isSubmit = this.isSubmit;
    studentData.submitCounter = this.submitCounter;

    /*
     * reset the isSubmit value so that the next component state
     * doesn't maintain the same value
     */
    this.isSubmit = false;

    componentState.studentData = studentData;
    componentState.componentType = 'Match';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;

    let deferred = this.$q.defer();

    /*
     * perform any additional processing that is required before returning
     * the component state
     */
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);
    return deferred.promise;
  }

  /**
   * Get the choice with the given text.
   * @param {string} text look for a choice with this text
   * @returns {object} the choice with the given text
   */
  getChoiceByText(text) {
    for (let choice of this.componentContent.choices) {
      if (choice.value === text) {
        return choice;
      }
    }
    return null;
  }

  /**
   * Check if the component has been authored with a correct choice
   * @return {boolean} whether the component has been authored with a correct choice
   */
  hasCorrectChoices() {
    for (let bucket of this.componentContent.feedback) {
      for (let choice of bucket.choices) {
        if (choice.isCorrect) {
          return true;
        }
      }
    }
    return false;
  }

  clearFeedback() {
    for (let choice of this.getChoices()) {
      choice.isCorrect = null;
      choice.isIncorrectPosition = null;
      choice.feedback = null;
    }
  }

  /**
   * Check if a choice has a correct bucket
   * @param {string} choiceId the choice id
   * @return {boolean} whether the choice has a correct bucket
   */
  isAuthorHasSpecifiedACorrectBucket(choiceId) {
    for (let bucket of this.getAllFeedback()) {
      for (let choice of bucket.choices) {
        if (choice.choiceId === choiceId) {
          if (choice.isCorrect) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Returns true if the choice has been authored to have a correct position
   * @param {string} choiceId the choice id
   * @return {boolean} whether the choice has a correct position in any bucket
   */
  isAuthorHasSpecifiedACorrectPosition(choiceId) {
    for (let bucket of this.getAllFeedback()) {
      for (let choice of bucket.choices) {
        if (choice.choiceId === choiceId) {
          if (choice.position != null) {
            return true;
          }
        }
      }
    }
    return false;
  }

  choiceIsInCorrectPosition(choiceId) {
    // dummy. not called.
    // TODO: implement me.
    return false;
  }

  /**
   * Create a component state with the merged student responses
   * @param {array} componentStates an array of component states
   * @return {object} a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {
    const mergedBuckets = [];
    for (let componentState of componentStates) {
      for (let bucket of componentState.studentData.buckets) {
        this.mergeBucket(mergedBuckets, bucket);
      }
    }
    const mergedComponentState: any = this.NodeService.createNewComponentState();
    mergedComponentState.studentData = {
      buckets: mergedBuckets
    };
    return mergedComponentState;
  }

  /**
   * Merge a bucket into the array of buckets
   * @param {array} buckets an array of buckets to merge into
   * @param {object} bucket the bucket to merge into the array of buckets
   * @return {array} an array of buckets with the merged bucket
   */
  mergeBucket(buckets, bucket) {
    let bucketFound = false;
    for (let tempBucket of buckets) {
      if (tempBucket.id == bucket.id) {
        /*
         * the bucket is already in the array of buckets so we
         * will just merge the items
         */
        bucketFound = true;
        this.mergeChoices(tempBucket.items, bucket.items);
      }
    }
    if (!bucketFound) {
      /*
       * the bucket was not in the array of buckets so we will add the
       * bucket
       */
      buckets.push(bucket);
    }
    return buckets;
  }

  /**
   * Merge the items. Only merge the items with an id that is not already in
   * the array of items.
   * @param {array} choices1 an array of choice objects
   * @param {array} choices2 an array of choice objects
   * @return {array} an array of objects that have been merged
   */
  mergeChoices(choices1, choices2) {
    const choices1Ids = this.getIds(choices1);
    for (let choice2 of choices2) {
      if (choices1Ids.indexOf(choice2.id) == -1) {
        choices1.push(choice2);
      }
    }
    return choices1;
  }

  /**
   * Get the ids from the array of objects
   * @param {array} objects an array of objects that have ids
   * @param {array} an array of id strings
   */
  getIds(objects) {
    const ids = [];
    for (let object of objects) {
      ids.push(object.id);
    }
    return ids;
  }

  addChoice() {
    const confirm = this.$mdDialog
      .prompt()
      .title(this.$translate('match.enterChoiceText'))
      .placeholder(this.$translate('match.typeSomething'))
      .cancel(this.$translate('CANCEL'))
      .ok(this.$translate('OK'));
    this.$mdDialog.show(confirm).then((result) => {
      if (result != null && result != '') {
        const newChoice = {
          id: this.UtilService.generateKey(10),
          value: result,
          type: 'choice',
          studentCreated: true
        };
        this.sourceBucket.items.push(newChoice);
        this.studentDataChanged();
      }
    });
  }

  deleteChoice(choice) {
    if (confirm(this.$translate('match.areYouSureYouWantToDeleteThisChoice'))) {
      const buckets = this.getBuckets();
      for (let bucket of buckets) {
        const items = bucket.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id == choice.id) {
            items.splice(i, 1);
          }
        }
      }
      this.studentDataChanged();
    }
  }
}

export default MatchController;
