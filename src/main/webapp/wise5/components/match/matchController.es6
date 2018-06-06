'use strict';

import ComponentController from "../componentController";

class MatchController extends ComponentController {
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
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
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
    this.latestAnnotations = null;
    this.sourceBucketId = '0';
    this.hasCorrectAnswer = false;
    this.isLatestComponentStateSubmit = false;
    this.connectedComponentUpdateOnOptions = [
      {
        value: 'change',
        text: 'Change'
      },
      {
        value: 'submit',
        text: 'Submit'
      }
    ];
    this.allowedConnectedComponentTypes = [
      {
        type: 'Match'
      }
    ];

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
      if (this.mode === 'grading') {
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      }
    } else if (this.mode === 'onlyShowWork') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'authoring') {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
      this.summernoteRubricHTML = this.componentContent.rubric;
      const insertAssetString = this.$translate('INSERT_ASSET');
      const InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);
      this.summernoteRubricOptions = {
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'video']],
          ['view', ['fullscreen', 'codeview', 'help']],
          ['customButton', ['insertAssetButton']]
        ],
        height: 300,
        disableDragAndDrop: true,
        buttons: {
          insertAssetButton: InsertAssetButton
        }
      };

      this.updateAdvancedAuthoringView();

      $scope.$watch(function() {
        return this.authoringComponentContent;
      }.bind(this), function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.isCorrect = null;
        this.submitCounter = 0;
        this.isDisabled = false;
        this.isSubmitButtonDisabled = false;
        this.initializeChoices();
        this.initializeBuckets();
      }.bind(this), true);
    }

    this.hasCorrectAnswer = this.hasCorrectChoices();
    this.initializeChoices();
    this.initializeBuckets();
    const componentState = this.$scope.componentState;
    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      }  else if (this.MatchService.componentStateHasStudentWork(componentState, this.componentContent)) {
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

    if (this.$scope.$parent.nodeController != null) {
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

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
            $('#' + summernoteId).summernote('editor.restoreRange');
            $('#' + summernoteId).summernote('editor.focus');

            if (this.UtilService.isImage(fileName)) {
              $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
            } else if (this.UtilService.isVideo(fileName)) {
              const videoElement = document.createElement('video');
              videoElement.controls = 'true';
              videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
              $('#' + summernoteId).summernote('insertNode', videoElement);
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

    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (this.componentId === args.componentId) {
        this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  studentHasUsedAllSubmits() {
    return this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount;
  }

  registerDragListeners() {
    const dragId = 'match_' + this.componentId;
    this.registerStudentDataChangedOnDrop(dragId);
    this.disableDraggingIfNeeded(dragId);
    const drake = this.dragulaService.find(this.$scope, dragId).drake;
    this.showVisualIndicatorWhileDragging(drake);
    this.supportScrollWhileDragging(drake);
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
    drake.on('over', (el, container, source) => {
      if (source !== container) {
        container.className += ' match-bucket__contents--over';
      }
    }).on('out', (el, container, source) => {
      if (source !== container) {
        container.className = container.className.replace('match-bucket__contents--over', '');;
      }
    });
  }

  supportScrollWhileDragging(drake) {
    this.autoScroll(
      [document.querySelector('#content')], {
        margin: 30,
        pixels: 50,
        scrollWhenOutside: true,
        autoScroll: function() {
          // Only scroll when the pointer is down, and there is a child being dragged
          return this.down && drake.dragging;
        }
      });
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setStudentWork(componentState) {
    const studentData = componentState.studentData;
    const componentStateBuckets = studentData.buckets;
    const sourceBucket = this.getBucketById(this.sourceBucketId);
    sourceBucket.items = []; // clear the source bucket
    const bucketIds = this.getBucketIds();
    const choiceIds = this.getChoiceIds();

    for (let componentStateBucket of componentStateBuckets) {
      let componentStateBucketId = componentStateBucket.id;
      if (bucketIds.indexOf(componentStateBucketId) > -1) {
        for (let currentChoice of componentStateBucket.items) {
          const currentChoiceId = currentChoice.id;
          const currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
          if (currentChoiceLocation > -1) {
            // choice is valid and used by student in a valid bucket, so add it to that bucket
            const bucket = this.getBucketById(componentStateBucketId);
            // content for choice with this id may have change, so get updated content
            const updatedChoice = this.getChoiceById(currentChoiceId);
            bucket.items.push(updatedChoice);
            choiceIds.splice(currentChoiceLocation, 1);
          }
        }
      }
    }

    // add unused choices to the source bucket
    for (let choiceId of choiceIds) {
      sourceBucket.items.push(this.getChoiceById(choiceId));
    }

    const submitCounter = studentData.submitCounter;
    if (submitCounter != null) {
      this.submitCounter = submitCounter;
    }

    if (this.submitCounter > 0) {
      if (componentState.isSubmit) {
        this.checkAnswer()
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
  };

  /**
   * Get the latest submitted componentState and display feedback for choices
   * that haven't changed since. This will also determine if submit is dirty.
   */
  processPreviousStudentWork() {
    const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
    if (latestComponentState == null) {
      return;
    }

    const serverSaveTime = latestComponentState.serverSaveTime;
    const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
    if (latestComponentState.isSubmit === true) {
      this.isCorrect = latestComponentState.isCorrect;
      this.setIsSubmitDirty(false);
      this.showSubmitMessage(clientSaveTime);
      this.checkAnswer();
    } else {
      const latestSubmitComponentState =
          this.StudentDataService.getLatestSubmitComponentState(this.nodeId, this.componentId);
      if (latestSubmitComponentState != null) {
        this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
      } else {
        this.isCorrect = null;
        this.setIsSubmitDirty(false);
        this.showSaveMessage(clientSaveTime);
      }
    }
  };

  /**
   * There is unsaved student work that is not yet saved in a component state
   */
  processDirtyStudentWork() {
    const latestSubmitComponentState =
        this.StudentDataService.getLatestSubmitComponentState(this.nodeId, this.componentId);
    if (latestSubmitComponentState != null) {
      this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
    } else {
      const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
      if (latestComponentState != null) {
        this.isCorrect = null;
        this.setIsSubmitDirty(true);
        this.showSaveMessage(latestComponentState.clientSaveTime);
      }
    }
  };

  showFeedbackOnUnchangedChoices(latestSubmitComponentState) {
    const choicesThatChangedSinceLastSubmit = this.getChoicesThatChangedSinceLastSubmit(latestSubmitComponentState);
    if (choicesThatChangedSinceLastSubmit.length > 0) {
      this.setIsSubmitDirty(true);
    } else {
      this.setIsSubmitDirty(false);
    }
    this.checkAnswer(choicesThatChangedSinceLastSubmit);
  }

  showSaveMessage(time) {
    this.setSaveMessage(this.$translate('LAST_SAVED'), time);
  }

  showSubmitMessage(time) {
    this.setSaveMessage(this.$translate('LAST_SUBMITTED'), time);
  }

  setIsSubmitDirty(isSubmitDirty) {
    this.isSubmitDirty = isSubmitDirty;
    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: isSubmitDirty});
  }

  isLatestComponentStateASubmit() {

  }

  getBucketIds() {
    return this.buckets.map(b => { return b.id; });
  }

  getChoiceIds() {
    return this.choices.map(c => { return c.id; });
  }

  getChoicesThatChangedSinceLastSubmit(latestSubmitComponentState) {
    const latestSubmitComponentStateBuckets = latestSubmitComponentState.studentData.buckets;
    const choicesThatChangedSinceLastSubmit = [];
    for (let currentComponentStateBucket of this.buckets) {
      const currentComponentStateBucketChoiceIds = currentComponentStateBucket.items.map(choice => { return choice.id; });
      let bucketFromSubmitComponentState = this.getBucketById(currentComponentStateBucket.id, latestSubmitComponentStateBuckets);
      if (bucketFromSubmitComponentState != null) {
        const latestSubmitComponentStateChoiceIds =
            bucketFromSubmitComponentState.items.map(choice => { return choice.id; });

        for (let choiceIndexInBucket = 0; choiceIndexInBucket < currentComponentStateBucketChoiceIds.length; choiceIndexInBucket++) {
          const currentBucketChoiceId = currentComponentStateBucketChoiceIds[choiceIndexInBucket];
          if (latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId) == -1) {
            choicesThatChangedSinceLastSubmit.push(currentBucketChoiceId);
          } else if (this.isAuthorHasSpecifiedACorrectPosition(currentBucketChoiceId) &&
              choiceIndexInBucket != latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId)) {
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
  }

  initializeBuckets() {
    this.buckets = [];
    this.setBucketWidth();
    this.setNumChoiceColumns();
    this.setChoiceStyle();
    this.setBucketStyle();
    const sourceBucket = {
      id: this.sourceBucketId,
      value: this.componentContent.choicesLabel ? this.componentContent.choicesLabel : this.$translate('match.choices'),
      type: 'bucket',
      items: []
    };
    for (let choice of this.getChoices()) {
      sourceBucket.items.push(choice);
    }
    this.buckets.push(sourceBucket);
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
          this.bucketWidth = Math.round(100/3);
        } else if (n % 2 === 0) {
          this.bucketWidth = 100/2;
        }
      }
    }
  }

  setNumChoiceColumns() {
    if (this.isHorizontal) {
      this.numChoiceColumns = 1;
    } else {
      if (typeof this.componentContent.bucketWidth === 'number') {
        this.numChoiceColumns = Math.round(100/this.componentContent.bucketWidth);
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
      'column-count':this.numChoiceColumns
    };
  }

  setBucketStyle() {
    if (this.bucketWidth === 100) {
      this.bucketStyle = this.choiceStyle;
    }
  }

  getBuckets() {
    return this.buckets;
  };

  /**
   * Create a copy of the array of buckets with brand new objects.
   * @return {array}
   */
  getCopyOfBuckets() {
    const bucketsJSONString = angular.toJson(this.getBuckets());
    return angular.fromJson(bucketsJSONString);
  }

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param {string} submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {
    if (this.isSubmitDirty) {
      let performSubmit = true;
      if (this.componentContent.maxSubmitCount != null && this.hasStudentUsedAllSubmits()) {
        performSubmit = false;
      }
      if (performSubmit) {
        this.isSubmit = true;
        this.isCorrect = null;
        this.incrementSubmitCounter();
        if (this.componentContent.maxSubmitCount != null && this.hasStudentUsedAllSubmits()) {
          this.isDisabled = true;
          this.isSubmitButtonDisabled = true;
        }

        if (this.mode === 'authoring') {
          /*
           * we are in authoring mode so we will set values appropriately
           * here because the 'componentSubmitTriggered' event won't
           * work in authoring mode
           */
          this.isDirty = false;
          this.isSubmitDirty = false;
          this.createComponentState('submit');
        }

        if (submitTriggeredBy === 'componentSubmitButton') {
          this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        }
      } else {
        this.isSubmit = false;
      }
    }
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
    let componentState = this.NodeService.createNewComponentState();
    let studentData = {};
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
   * The component has changed in the regular authoring view so we will save the project
   */
  authoringViewComponentChanged() {

    // update the JSON string in the advanced authoring view textarea
    this.updateAdvancedAuthoringView();

    /*
     * notify the parent node that the content has changed which will save
     * the project to the server
     */
    this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
  };

  /**
   * The component has changed in the advanced authoring view so we will update
   * the component and save the project.
   */
  advancedAuthoringViewComponentChanged() {

    try {
      /*
       * create a new component by converting the JSON string in the advanced
       * authoring view into a JSON object
       */
      var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

      // set the new authoring component content
      this.authoringComponentContent = authoringComponentContent;

      // set the component content
      this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
  };

  /**
   * Update the component JSON string that will be displayed in the advanced authoring view textarea
   */
  updateAdvancedAuthoringView() {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  };

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
   * Get the choice by id from the authoring component content
   * @param {string} id the choice id
   * @returns {object} the choice object from the authoring component content
   */
  getChoiceById(id) {
    for (let choice of this.componentContent.choices) {
      if (choice.id === id) {
        return choice;
      }
    }
    return null;
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
   * Get the bucket by id from the authoring component content.
   * @param {string} id the bucket id
   * @param {array} buckets (optional) the buckets to get the bucket from
   * @returns {object} the bucket object from the authoring component content
   */
  getBucketById(id, buckets = this.buckets) {
    for (let bucket of buckets) {
      if (bucket.id == id) {
        return bucket;
      }
    }
    return null;
  }

  /**
   * Get the choice value by id from the authoring component content
   * @param {string} choiceId the choice id
   * @returns {string} the choice value from the authoring component content
   */
  getChoiceValueById(choiceId) {
    const choice = this.getChoiceById(choiceId);
    if (choice != null) {
      return choice.value;
    }
    return null;
  }

  /**
   * Get the bucket value by id from the authoring component content
   * @param {string} bucketId the bucket id
   * @returns {string} the bucket value from the authoring component content
   */
  getBucketValueById(bucketId) {
    const bucket = this.getBucketById(bucketId);
    if (bucket != null) {
      return bucket.value;
    }
    return null;
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
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {

    // get the summernote rubric html
    var html = this.summernoteRubricHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    html = this.ConfigService.removeAbsoluteAssetPaths(html);

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    html = this.UtilService.insertWISELinks(html);

    // update the component rubric
    this.authoringComponentContent.rubric = html;

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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
   * Add a connected component
   */
  addConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.updateOn = 'change';

    // initialize the array of connected components if it does not exist yet
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }

    // add the connected component
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  deleteConnectedComponent(index) {

    if (this.authoringComponentContent.connectedComponents != null) {
      this.authoringComponentContent.connectedComponents.splice(index, 1);
    }

    // the authoring component content has changed so we will save the project
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
   * Set the show submit button value
   * @param show whether to show the submit button
   */
  setShowSubmitButtonValue(show) {

    if (show == null || show == false) {
      // we are hiding the submit button
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      // we are showing the submit button
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }

    /*
     * notify the parent node that this component is changing its
     * showSubmitButton value so that it can show save buttons on the
     * step or sibling components accordingly
     */
    this.$scope.$emit('componentShowSubmitButtonValueChanged', {nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show});
  }

  /**
   * The showSubmitButton value has changed
   */
  showSubmitButtonValueChanged() {

    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

    // the authoring component content has changed so we will save the project
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

  /**
   * Add a tag
   */
  addTag() {

    if (this.authoringComponentContent.tags == null) {
      // initialize the tags array
      this.authoringComponentContent.tags = [];
    }

    // add a tag
    this.authoringComponentContent.tags.push('');

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag up
   * @param index the index of the tag to move up
   */
  moveTagUp(index) {

    if (index > 0) {
      // the index is not at the top so we can move it up

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);

      // insert the tag one index back
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag down
   * @param index the index of the tag to move down
   */
  moveTagDown(index) {

    if (index < this.authoringComponentContent.tags.length - 1) {
      // the index is not at the bottom so we can move it down

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);

      // insert the tag one index forward
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a tag
   * @param index the index of the tag to delete
   */
  deleteTag(index) {

    // ask the author if they are sure they want to delete the tag
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

    if (answer) {
      // the author answered yes to delete the tag

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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
    const mergedComponentState = this.NodeService.createNewComponentState();
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

  /**
   * Add a connected component
   */
  authoringAddConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.type = null;
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

    // initialize the array of connected components if it does not exist yet
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }

    // add the connected component
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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
        }
      }
    }
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {

    // ask the author if they are sure they want to delete the connected component
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

    if (answer) {
      // the author answered yes to delete

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the connected component type
   * @param connectedComponent get the component type of this connected component
   * @return the connected component type
   */
  authoringGetConnectedComponentType(connectedComponent) {

    var connectedComponentType = null;

    if (connectedComponent != null) {

      // get the node id and component id of the connected component
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;

      // get the component
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
        // get the component type
        connectedComponentType = component.type;
      }
    }

    return connectedComponentType;
  }

  /**
   * The connected component node id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentNodeIdChanged(connectedComponent) {
    if (connectedComponent != null) {
      connectedComponent.componentId = null;
      connectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

    if (connectedComponent != null) {

      if (connectedComponent.type == 'importWork') {
        /*
         * the type has changed to import work
         */
      } else if (connectedComponent.type == 'showWork') {
        /*
         * the type has changed to show work
         */
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Check if we are allowed to connect to this component type
   * @param componentType the component type
   * @return whether we can connect to the component type
   */
  isConnectedComponentTypeAllowed(componentType) {

    if (componentType != null) {

      let allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

      // loop through the allowed connected component types
      for (let a = 0; a < allowedConnectedComponentTypes.length; a++) {
        let allowedConnectedComponentType = allowedConnectedComponentTypes[a];

        if (allowedConnectedComponentType != null) {
          if (componentType == allowedConnectedComponentType.type) {
            // the component type is allowed
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * The show JSON button was clicked to show or hide the JSON authoring
   */
  showJSONButtonClicked() {
    // toggle the JSON authoring textarea
    this.showJSONAuthoring = !this.showJSONAuthoring;

    if (this.jsonStringChanged && !this.showJSONAuthoring) {
      /*
       * the author has changed the JSON and has just closed the JSON
       * authoring view so we will save the component
       */
      this.advancedAuthoringViewComponentChanged();

      // scroll to the top of the component
      this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

      this.jsonStringChanged = false;
    }
  }

  /**
   * The author has changed the JSON manually in the advanced view
   */
  authoringJSONChanged() {
    this.jsonStringChanged = true;
  }
}

MatchController.$inject = [
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

export default MatchController;
