'use strict';

import * as angular from 'angular';
import * as $ from 'jquery';
import ComponentController from '../componentController';
import { CRaterService } from '../../services/cRaterService';
import { NotificationService } from '../../services/notificationService';
import { OpenResponseService } from './openResponseService';
import { AudioRecorderService } from '../../services/audioRecorderService';

class OpenResponseController extends ComponentController {
  $q: any;
  AudioRecorderService: AudioRecorderService;
  CRaterService: CRaterService;
  NotificationService: NotificationService;
  OpenResponseService: OpenResponseService;
  studentResponse: string;
  isRichTextEnabled: boolean;
  messageDialog: any;
  tinymceOptions: any;
  isRecordingAudio: boolean = false;
  audioRecordingInterval: any;
  audioRecordingStartTime: number = 0;
  audioRecordingMaxTime: number = 60000;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'CRaterService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'OpenResponseService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    CRaterService,
    NodeService,
    NotebookService,
    NotificationService,
    OpenResponseService,
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
    this.AudioRecorderService = AudioRecorderService;
    this.CRaterService = CRaterService;
    this.NotificationService = NotificationService;
    this.OpenResponseService = OpenResponseService;

    // holds the text that the student has typed
    this.studentResponse = '';

    // whether rich text editing is enabled
    this.isRichTextEnabled = false;

    // used to hold a message dialog if we need to use one
    this.messageDialog = null;

    let themePath = this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
    // Rich text editor options
    this.tinymceOptions = {
      //onChange: function(e) {
      //scope.studentDataChanged();
      //},
      menubar: false,
      plugins: 'link image media autoresize', //imagetools
      toolbar:
        'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
      autoresize_bottom_margin: '0',
      autoresize_min_height: '100',
      image_advtab: true,
      content_css: themePath + '/style/tinymce.css',
      setup: function (ed) {
        ed.on('focus', function (e) {
          $(e.target.editorContainer)
            .addClass('input--focused')
            .parent()
            .addClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
        });

        ed.on('blur', function (e) {
          $(e.target.editorContainer)
            .removeClass('input--focused')
            .parent()
            .removeClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
        });
      }
    };

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    } else if (this.mode === 'grading') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    let componentState = null;

    // set whether rich text is enabled
    this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

    // get the component state from the scope
    componentState = this.$scope.componentState;

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      } else if (
        componentState != null &&
        this.OpenResponseService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      } else if (componentState == null) {
        // check if we need to import work

        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          /*
           * the student does not have any work and there are connected
           * components so we will get the work from the connected
           * components
           */
          this.handleConnectedComponents();
        } else if (this.componentContent.starterSentence != null) {
          /*
           * the student has not done any work and there is a starter sentence
           * so we will populate the textarea with the starter sentence
           */
          this.studentResponse = this.componentContent.starterSentence;
        }
      }
    } else {
      // populate the student work into this component
      this.setStudentWork(componentState);
    }

    if (!this.canSubmit()) {
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function () {
      return this.$scope.openResponseController.isDirty;
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function (isSubmit) {
      const deferred = this.$q.defer();
      let getState = false;
      let action = 'change';

      if (isSubmit) {
        if (this.$scope.openResponseController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.openResponseController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.openResponseController.createComponentState(action).then((componentState) => {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * the student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * we will immediately resolve the promise here.
         */
        deferred.resolve();
      }

      return deferred.promise;
    }.bind(this);

    this.registerNotebookItemChosenListener();
    this.registerAudioRecordedListener();

    // load script for this component, if any
    let script = this.componentContent.script;
    if (script != null) {
      this.ProjectService.retrieveScript(script).then((script) => {
        new Function(script).call(this);
      });
    }

    this.broadcastDoneRenderingComponent();
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {
    if (componentState != null) {
      const studentData = componentState.studentData;

      if (studentData != null) {
        const response = studentData.response;

        if (response != null) {
          // populate the text the student previously typed
          this.studentResponse = response;
        }

        const submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        if (studentData.attachments != null) {
          this.attachments = studentData.attachments;
        }

        this.processLatestStudentWork();
      }
    }
  }

  hasSubmitMessage() {
    return true;
  }

  hasFeedback() {
    return (
      this.isCRaterEnabled() &&
      (this.componentContent.cRater.showFeedback || this.componentContent.cRater.showScore)
    );
  }

  confirmSubmit(numberOfSubmitsLeft) {
    if (this.hasFeedback()) {
      return this.submitWithFeedback(numberOfSubmitsLeft);
    } else {
      return this.submitWithoutFeedback(numberOfSubmitsLeft);
    }
  }

  submitWithFeedback(numberOfSubmitsLeft) {
    let isPerformSubmit = false;
    if (numberOfSubmitsLeft <= 0) {
      alert(this.$translate('openResponse.youHaveNoMoreChancesWithFeedback'));
    } else if (numberOfSubmitsLeft === 1) {
      isPerformSubmit = confirm(
        this.$translate('openResponse.youHaveOneChanceWithFeedback', {
          numberOfSubmitsLeft: numberOfSubmitsLeft
        })
      );
    } else if (numberOfSubmitsLeft > 1) {
      isPerformSubmit = confirm(
        this.$translate('openResponse.youHaveMultipleChancesWithFeedback', {
          numberOfSubmitsLeft: numberOfSubmitsLeft
        })
      );
    }
    return isPerformSubmit;
  }

  submitWithoutFeedback(numberOfSubmitsLeft) {
    let isPerformSubmit = false;
    if (numberOfSubmitsLeft <= 0) {
      alert(this.$translate('openResponse.youHaveNoMoreChancesWithoutFeedback'));
    } else if (numberOfSubmitsLeft === 1) {
      isPerformSubmit = confirm(
        this.$translate('openResponse.youHaveOneChanceWithoutFeedback', {
          numberOfSubmitsLeft: numberOfSubmitsLeft
        })
      );
    } else if (numberOfSubmitsLeft > 1) {
      isPerformSubmit = confirm(
        this.$translate('openResponse.youHaveMultipleChancesWithoutFeedback', {
          numberOfSubmitsLeft: numberOfSubmitsLeft
        })
      );
    }
    return isPerformSubmit;
  }

  /**
   * Get the student response
   */
  getStudentResponse() {
    return this.studentResponse;
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const deferred = this.$q.defer();

    // create a new component state
    const componentState: any = this.NodeService.createNewComponentState();

    // set the response into the component state
    const studentData: any = {};

    // get the text the student typed
    const response = this.getStudentResponse();

    studentData.response = response;
    studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

    // set the submit counter
    studentData.submitCounter = this.submitCounter;

    if (this.parentStudentWorkIds != null) {
      studentData.parentStudentWorkIds = this.parentStudentWorkIds;
    }

    // set the flag for whether the student submitted this work
    componentState.isSubmit = this.isSubmit;

    // set the student data into the component state
    componentState.studentData = studentData;

    // set the component type
    componentState.componentType = 'OpenResponse';

    // set the node id
    componentState.nodeId = this.nodeId;

    // set the component id
    componentState.componentId = this.componentId;

    componentState.isCompleted = this.OpenResponseService.isCompleted(
      this.componentContent,
      [componentState],
      null,
      null,
      this.ProjectService.getNodeById(this.nodeId)
    );

    /*
     * reset the isSubmit value so that the next component state
     * doesn't maintain the same value
     */
    this.isSubmit = false;

    /*
     * perform any additional processing that is required before returning
     * the component state
     */
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);

    return deferred.promise;
  }

  /**
   * Perform any additional processing that is required before returning the
   * component state
   * Note: this function must call deferred.resolve() otherwise student work
   * will not be saved
   * @param deferred a deferred object
   * @param componentState the component state
   * @param action the action that we are creating the component state for
   * e.g. 'submit', 'save', 'change'
   */
  createComponentStateAdditionalProcessing(deferred, componentState, action) {
    let performCRaterScoring = false;

    // determine if we need to perform CRater scoring
    if (action == 'submit' && componentState.isSubmit) {
      if (this.isCRaterScoreOnSubmit()) {
        performCRaterScoring = true;
      }
    } else if (action == 'save') {
      if (this.isCRaterScoreOnSave()) {
        performCRaterScoring = true;
      }
    } else if (action == 'change' || action == null) {
      if (this.isCRaterScoreOnChange()) {
        performCRaterScoring = true;
      }
    }

    if (performCRaterScoring) {
      // we need to perform CRater scoring
      const cRaterItemId = this.CRaterService.getCRaterItemId(this.componentContent);
      const cRaterResponseId = new Date().getTime();
      const studentData = this.studentResponse;

      /*
       * display a dialog message while the student waits for their work
       * to be scored by CRater
       */
      this.$mdDialog.show({
        template:
          '<md-dialog aria-label="' +
          this.$translate('openResponse.pleaseWait') +
          '"><md-dialog-content><div class="md-dialog-content">' +
          this.$translate('openResponse.pleaseWaitWeAreScoringYourWork') +
          '</div></md-dialog-content></md-dialog>',
        escapeToClose: false
      });

      // make the CRater request to score the student data
      this.CRaterService.makeCRaterScoringRequest(cRaterItemId, cRaterResponseId, studentData).then(
        (data: any) => {
          /*
           * annotations we put in the component state will be
           * removed from the component state and saved separately
           */
          componentState.annotations = [];

          // get the CRater score
          let score = data.score;
          let concepts = data.concepts;
          let previousScore = null;
          if (data.scores != null) {
            const maxSoFarFunc = (accumulator, currentValue) => {
              return Math.max(accumulator, currentValue.score);
            };
            score = data.scores.reduce(maxSoFarFunc, 0);
          }

          if (score != null) {
            const autoScoreAnnotationData: any = {
              value: score,
              maxAutoScore: this.ProjectService.getMaxScoreForComponent(
                this.nodeId,
                this.componentId
              ),
              concepts: concepts,
              autoGrader: 'cRater'
            };
            if (data.scores != null) {
              autoScoreAnnotationData.scores = data.scores;
            }

            let autoScoreAnnotation = this.createAutoScoreAnnotation(autoScoreAnnotationData);

            let annotationGroupForScore = null;

            if (this.$scope.$parent.nodeController != null) {
              // get the previous score and comment annotations
              let latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(
                this.componentId
              );

              if (
                latestAnnotations != null &&
                latestAnnotations.score != null &&
                latestAnnotations.score.data != null
              ) {
                // get the previous score annotation value
                previousScore = latestAnnotations.score.data.value;
              }

              if (
                this.componentContent.enableGlobalAnnotations &&
                this.componentContent.globalAnnotationSettings != null
              ) {
                let globalAnnotationMaxCount = 0;
                if (
                  this.componentContent.globalAnnotationSettings.globalAnnotationMaxCount != null
                ) {
                  globalAnnotationMaxCount = this.componentContent.globalAnnotationSettings
                    .globalAnnotationMaxCount;
                }
                // get the annotation properties for the score that the student got.
                annotationGroupForScore = this.ProjectService.getGlobalAnnotationGroupByScore(
                  this.componentContent,
                  previousScore,
                  score
                );

                // check if we need to apply this globalAnnotationSetting to this annotation: we don't need to if we've already reached the maxCount
                if (annotationGroupForScore != null) {
                  let globalAnnotationGroupsByNodeIdAndComponentId = this.AnnotationService.getAllGlobalAnnotationGroups();
                  annotationGroupForScore.annotationGroupCreatedTime =
                    autoScoreAnnotation.clientSaveTime; // save annotation creation time

                  if (
                    globalAnnotationGroupsByNodeIdAndComponentId.length >= globalAnnotationMaxCount
                  ) {
                    // we've already applied this annotation properties to maxCount annotations, so we don't need to apply it any more.
                    annotationGroupForScore = null;
                  }
                }

                if (
                  annotationGroupForScore != null &&
                  annotationGroupForScore.isGlobal &&
                  annotationGroupForScore.unGlobalizeCriteria != null
                ) {
                  // check if this annotation is global and what criteria needs to be met to un-globalize.
                  annotationGroupForScore.unGlobalizeCriteria.map((unGlobalizeCriteria) => {
                    // if the un-globalize criteria is time-based (e.g. isVisitedAfter, isRevisedAfter, isVisitedAndRevisedAfter, etc), store the timestamp of this annotation in the criteria
                    // so we can compare it when we check for criteria satisfaction.
                    if (unGlobalizeCriteria.params != null) {
                      unGlobalizeCriteria.params.criteriaCreatedTimestamp =
                        autoScoreAnnotation.clientSaveTime; // save annotation creation time to criteria
                    }
                  });
                }

                if (annotationGroupForScore != null) {
                  // copy over the annotation properties into the autoScoreAnnotation's data
                  angular.merge(autoScoreAnnotation.data, annotationGroupForScore);
                }
              }
            }

            componentState.annotations.push(autoScoreAnnotation);

            if (this.mode === 'authoring') {
              if (this.latestAnnotations == null) {
                this.latestAnnotations = {};
              }

              /*
               * we are in the authoring view so we will set the
               * latest score annotation manually
               */
              this.latestAnnotations.score = autoScoreAnnotation;
            }

            let autoComment = null;

            // get the submit counter
            const submitCounter = this.submitCounter;

            if (
              this.componentContent.cRater.enableMultipleAttemptScoringRules &&
              submitCounter > 1
            ) {
              /*
               * this step has multiple attempt scoring rules and this is
               * a subsequent submit
               */
              // get the feedback based upon the previous score and current score
              autoComment = this.CRaterService.getMultipleAttemptCRaterFeedbackTextByScore(
                this.componentContent,
                previousScore,
                score
              );
            } else {
              // get the feedback text
              autoComment = this.CRaterService.getCRaterFeedbackTextByScore(
                this.componentContent,
                score
              );
            }

            if (autoComment != null) {
              // create the auto comment annotation
              const autoCommentAnnotationData: any = {};
              autoCommentAnnotationData.value = autoComment;
              autoCommentAnnotationData.concepts = concepts;
              autoCommentAnnotationData.autoGrader = 'cRater';

              const autoCommentAnnotation = this.createAutoCommentAnnotation(
                autoCommentAnnotationData
              );

              if (this.componentContent.enableGlobalAnnotations) {
                if (annotationGroupForScore != null) {
                  // copy over the annotation properties into the autoCommentAnnotation's data
                  angular.merge(autoCommentAnnotation.data, annotationGroupForScore);
                }
              }
              componentState.annotations.push(autoCommentAnnotation);

              if (this.mode === 'authoring') {
                if (this.latestAnnotations == null) {
                  this.latestAnnotations = {};
                }

                /*
                 * we are in the authoring view so we will set the
                 * latest comment annotation manually
                 */
                this.latestAnnotations.comment = autoCommentAnnotation;
              }
            }
            if (
              this.componentContent.enableNotifications &&
              this.componentContent.notificationSettings &&
              this.componentContent.notificationSettings.notifications
            ) {
              const notificationForScore: any = this.ProjectService.getNotificationByScore(
                this.componentContent,
                previousScore,
                score
              );
              if (notificationForScore != null) {
                notificationForScore.score = score;
                notificationForScore.nodeId = this.nodeId;
                notificationForScore.componentId = this.componentId;
                this.NotificationService.sendNotificationForScore(notificationForScore);
              }
            }

            if (
              this.componentContent.enableGlobalAnnotations &&
              annotationGroupForScore != null &&
              annotationGroupForScore.isGlobal &&
              annotationGroupForScore.isPopup
            ) {
              this.AnnotationService.broadcastDisplayGlobalAnnotations();
            }
          }

          /*
           * hide the dialog that tells the student to wait since
           * the work has been scored.
           */
          this.$mdDialog.hide();

          // resolve the promise now that we are done performing additional processing
          deferred.resolve(componentState);
        }
      );
    } else if (
      this.ProjectService.hasAdditionalProcessingFunctions(this.nodeId, this.componentId)
    ) {
      // if there are any additionalProcessingFunctions for this node and component, call all of them
      let additionalProcessingFunctions = this.ProjectService.getAdditionalProcessingFunctions(
        this.nodeId,
        this.componentId
      );
      let allPromises = [];
      for (let i = 0; i < additionalProcessingFunctions.length; i++) {
        let additionalProcessingFunction = additionalProcessingFunctions[i];
        let defer = this.$q.defer();
        let promise = defer.promise;
        allPromises.push(promise);
        additionalProcessingFunction(defer, componentState, action);
      }
      this.$q.all(allPromises).then(() => {
        deferred.resolve(componentState);
      });
    } else {
      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }
  }

  /**
   * Create an auto score annotation
   * @param runId the run id
   * @param periodId the period id
   * @param nodeId the node id
   * @param componentId the component id
   * @param toWorkgroupId the student workgroup id
   * @param data the annotation data
   * @returns the auto score annotation
   */
  createAutoScoreAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();

    // create the auto score annotation
    const annotation = this.AnnotationService.createAutoScoreAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );

    return annotation;
  }

  /**
   * Create an auto comment annotation
   * @param runId the run id
   * @param periodId the period id
   * @param nodeId the node id
   * @param componentId the component id
   * @param toWorkgroupId the student workgroup id
   * @param data the annotation data
   * @returns the auto comment annotation
   */
  createAutoCommentAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();

    // create the auto comment annotation
    const annotation = this.AnnotationService.createAutoCommentAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );

    return annotation;
  }

  /**
   * Get the number of rows for the textarea
   */
  getNumRows() {
    let numRows = null;

    if (this.componentContent != null) {
      numRows = this.componentContent.numRows;
    }

    return numRows;
  }

  /**
   * Get the number of columns for the textarea
   */
  getNumColumns() {
    let numColumns = null;

    if (this.componentContent != null) {
      numColumns = this.componentContent.numColumns;
    }

    return numColumns;
  }

  /**
   * Get the text the student typed
   */
  getResponse() {
    let response = null;

    if (this.studentResponse != null) {
      response = this.studentResponse;
    }

    return response;
  }

  snipButtonClicked($event) {
    if (this.isDirty) {
      const studentWorkSavedToServerSubscription = this.StudentDataService.studentWorkSavedToServer$.subscribe(
        (args: any) => {
          const componentState = args.studentWork;
          if (
            componentState &&
            this.nodeId === componentState.nodeId &&
            this.componentId === componentState.componentId
          ) {
            const imageObject = null;
            const noteText = componentState.studentData.response;
            const isEditTextEnabled = false;
            const isFileUploadEnabled = false;
            this.NotebookService.addNote(
              imageObject,
              noteText,
              [componentState.id],
              isEditTextEnabled,
              isFileUploadEnabled
            );
            studentWorkSavedToServerSubscription.unsubscribe();
          }
        }
      );
      this.saveButtonClicked(); // trigger a save
    } else {
      const studentWork = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
      const imageObject = null;
      const noteText = studentWork.studentData.response;
      const isEditTextEnabled = false;
      const isFileUploadEnabled = false;
      this.NotebookService.addNote(
        imageObject,
        noteText,
        [studentWork.id],
        isEditTextEnabled,
        isFileUploadEnabled
      );
    }
  }

  /**
   * Check if CRater is enabled for this component
   * @returns whether CRater is enabled for this component
   */
  isCRaterEnabled() {
    return this.CRaterService.isCRaterEnabled(this.componentContent);
  }

  /**
   * Check if CRater is set to score on save
   * @returns whether CRater is set to score on save
   */
  isCRaterScoreOnSave() {
    let result = false;

    if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score on submit
   * @returns whether CRater is set to score on submit
   */
  isCRaterScoreOnSubmit() {
    let result = false;

    if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score on change
   * @returns whether CRater is set to score on change
   */
  isCRaterScoreOnChange() {
    let result = false;

    if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score when the student exits the step
   * @returns whether CRater is set to score when the student exits the step
   */
  isCRaterScoreOnExit() {
    let result = false;

    if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {
    // create a new component state
    let mergedComponentState: any = this.NodeService.createNewComponentState();

    if (componentStates != null) {
      let mergedResponse = '';

      // loop through all the component state
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];

        if (componentState != null) {
          let studentData = componentState.studentData;

          if (studentData != null) {
            // get the student response
            let response = studentData.response;

            if (response != null && response != '') {
              if (mergedResponse != '') {
                // add a new line between the responses
                mergedResponse += '\n';
              }

              // append the response
              mergedResponse += response;
            }
          }
        }
      }

      if (mergedResponse != null && mergedResponse != '') {
        // set the merged response into the merged component state
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.response = mergedResponse;
      }
    }

    return mergedComponentState;
  }

  studentDataChanged() {
    this.setIsDirtyAndBroadcast();
    if (this.studentResponse === '') {
      this.setIsSubmitDirty(false);
    } else {
      this.setIsSubmitDirtyAndBroadcast();
    }
    this.clearSaveText();
    const action = 'change';
    this.createComponentStateAndBroadcast(action);
  }

  startRecordingAudio() {
    if (this.hasAudioResponses()) {
      if (confirm(this.$translate(`openResponse.confirmReplaceAudioResponse`))) {
        this.removeAudioAttachments();
      } else {
        return;
      }
    }
    this.AudioRecorderService.startRecording(`${this.nodeId}-${this.componentId}`);
    this.startAudioCountdown();
    this.isRecordingAudio = true;
  }

  startAudioCountdown() {
    this.audioRecordingStartTime = new Date().getTime();
    this.audioRecordingInterval = setInterval(() => {
      if (this.getAudioRecordingTimeLeft() <= 0) {
        this.stopRecordingAudio();
      }
    }, 500);
  }

  stopRecordingAudio() {
    this.AudioRecorderService.stopRecording();
    this.isRecordingAudio = false;
    clearInterval(this.audioRecordingInterval);
  }

  getAudioRecordingTimeElapsed() {
    const now = new Date().getTime();
    return now - this.audioRecordingStartTime;
  }

  getAudioRecordingTimeLeft() {
    return Math.floor((this.audioRecordingMaxTime - this.getAudioRecordingTimeElapsed()) / 1000);
  }

  hasAudioResponses() {
    return (
      this.attachments.filter((attachment) => {
        return attachment.type === 'audio';
      }).length > 0
    );
  }

  removeAudioAttachment(attachment) {
    if (confirm(this.$translate(`openResponse.confirmRemoveAudioResponse`))) {
      this.removeAttachment(attachment);
    }
  }

  removeAudioAttachments() {
    this.attachments.forEach((attachment) => {
      if (attachment.type === 'audio') {
        this.removeAttachment(attachment);
      }
    });
  }
}

export default OpenResponseController;
