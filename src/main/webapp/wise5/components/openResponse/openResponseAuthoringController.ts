'use strict';

import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import OpenResponseController from './openResponseController';

class OpenResponseAuthoringController extends OpenResponseController {
  ProjectAssetService: ProjectAssetService;
  allowedConnectedComponentTypes: any[];

  static $inject = [
    '$filter',
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
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
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
    ProjectAssetService,
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
    );
    this.ProjectAssetService = ProjectAssetService;
    this.allowedConnectedComponentTypes = [
      {
        type: 'OpenResponse'
      }
    ];

    $scope.$watch(
      function() {
        return this.authoringComponentContent;
      }.bind(this),
      function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.submitCounter = 0;
        this.studentResponse = '';
        this.latestAnnotations = null;
        this.isDirty = false;
        this.isSubmitDirty = false;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        if (this.componentContent.starterSentence != null) {
          this.studentResponse = this.componentContent.starterSentence;
        }
      }.bind(this),
      true
    );
  }

  openAssetChooser(params: any) {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
  }

  assetSelected({ nodeId, componentId, assetItem, target }) {
    const fileName = assetItem.fileName;
    const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
    if (target === 'rubric') {
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
  }

  authoringAddScoringRule() {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      const newScoringRule = {
        score: '',
        feedbackText: ''
      };
      this.authoringComponentContent.cRater.scoringRules.push(newScoringRule);
      this.authoringViewComponentChanged();
    }
  }

  authoringViewScoringRuleUpClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      if (index != 0) {
        const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.scoringRules.splice(index - 1, 0, scoringRule);
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewScoringRuleDownClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      if (index != this.authoringComponentContent.cRater.scoringRules.length - 1) {
        const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.scoringRules.splice(index + 1, 0, scoringRule);
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewScoringRuleDeleteClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
      const score = scoringRule.score;
      const feedbackText = scoringRule.feedbackText;
      const answer = confirm(
        this.$translate('openResponse.areYouSureYouWantToDeleteThisScoringRule', {
          score: score,
          feedbackText: feedbackText
        })
      );
      if (answer) {
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }

  /**
   * Add a new notification. Currently assumes this is a notification based on CRaterResult, but
   * we can add different types in the future.
   */
  authoringAddNotification() {
    if (
      this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null
    ) {
      const newNotification = {
        notificationType: 'CRaterResult',
        enableCriteria: {
          scoreSequence: ['', '']
        },
        isAmbient: false,
        dismissCode: 'apple',
        isNotifyTeacher: true,
        isNotifyStudent: true,
        notificationMessageToStudent:
          '{{username}}, ' +
          this.$translate('openResponse.youGotAScoreOf') +
          ' {{score}}. ' +
          this.$translate('openResponse.pleaseTalkToYourTeacher') +
          '.',
        notificationMessageToTeacher:
          '{{username}} ' + this.$translate('openResponse.gotAScoreOf') + ' {{score}}.'
      };
      this.authoringComponentContent.notificationSettings.notifications.push(newNotification);
      this.authoringViewComponentChanged();
    }
  }

  authoringAddMultipleAttemptScoringRule() {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null
    ) {
      const newMultipleAttemptScoringRule = {
        scoreSequence: ['', ''],
        feedbackText: ''
      };
      this.authoringComponentContent.cRater.multipleAttemptScoringRules.push(
        newMultipleAttemptScoringRule
      );
      this.authoringViewComponentChanged();
    }
  }

  authoringViewMultipleAttemptScoringRuleUpClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null
    ) {
      if (index != 0) {
        const multipleAttemptScoringRule = this.authoringComponentContent.cRater
          .multipleAttemptScoringRules[index];
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(
          index - 1,
          0,
          multipleAttemptScoringRule
        );
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewMultipleAttemptScoringRuleDownClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null
    ) {
      if (index != this.authoringComponentContent.cRater.multipleAttemptScoringRules.length - 1) {
        const multipleAttemptScoringRule = this.authoringComponentContent.cRater
          .multipleAttemptScoringRules[index];
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(
          index + 1,
          0,
          multipleAttemptScoringRule
        );
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewMultipleAttemptScoringRuleDeleteClicked(index) {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null
    ) {
      const multipleAttemptScoringRule = this.authoringComponentContent.cRater
        .multipleAttemptScoringRules[index];
      const scoreSequence = multipleAttemptScoringRule.scoreSequence;
      let previousScore = '';
      let currentScore = '';
      if (scoreSequence != null) {
        previousScore = scoreSequence[0];
        currentScore = scoreSequence[1];
      }
      const feedbackText = multipleAttemptScoringRule.feedbackText;
      const answer = confirm(
        this.$translate('openResponse.areYouSureYouWantToDeleteThisMultipleAttemptScoringRule', {
          previousScore: previousScore,
          currentScore: currentScore,
          feedbackText: feedbackText
        })
      );
      if (answer) {
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewNotificationUpClicked(index) {
    if (
      this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null
    ) {
      if (index != 0) {
        const notification = this.authoringComponentContent.notificationSettings.notifications[
          index
        ];
        this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);
        this.authoringComponentContent.notificationSettings.notifications.splice(
          index - 1,
          0,
          notification
        );
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewNotificationDownClicked(index) {
    if (
      this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null
    ) {
      if (index != this.authoringComponentContent.notificationSettings.notifications.length - 1) {
        const notification = this.authoringComponentContent.notificationSettings.notifications[
          index
        ];
        this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);
        this.authoringComponentContent.notificationSettings.notifications.splice(
          index + 1,
          0,
          notification
        );
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewNotificationDeleteClicked(index) {
    if (
      this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null
    ) {
      const notification = this.authoringComponentContent.notificationSettings.notifications[index];
      const scoreSequence = notification.enableCriteria.scoreSequence;
      let previousScore = '';
      let currentScore = '';
      if (scoreSequence != null) {
        previousScore = scoreSequence[0];
        currentScore = scoreSequence[1];
      }
      const answer = confirm(
        this.$translate('openResponse.areYouSureYouWantToDeleteThisNotification', {
          previousScore: previousScore,
          currentScore: currentScore
        })
      );
      if (answer) {
        this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }

  authoringViewEnableCRaterClicked() {
    if (this.authoringComponentContent.enableCRater) {
      if (this.authoringComponentContent.cRater == null) {
        const cRater = {
          itemType: 'CRATER',
          itemId: '',
          scoreOn: 'submit',
          showScore: true,
          showFeedback: true,
          scoringRules: [],
          enableMultipleAttemptScoringRules: false,
          multipleAttemptScoringRules: []
        };
        this.authoringComponentContent.cRater = cRater;
      }
      this.setShowSubmitButtonValue(true);
    } else {
      this.setShowSubmitButtonValue(false);
    }
    this.authoringViewComponentChanged();
  }

  enableMultipleAttemptScoringRulesClicked() {
    const cRater = this.authoringComponentContent.cRater;
    if (cRater != null && cRater.multipleAttemptScoringRules == null) {
      cRater.multipleAttemptScoringRules = [];
    }
    this.authoringViewComponentChanged();
  }

  authoringViewEnableNotificationsClicked() {
    if (this.authoringComponentContent.enableNotifications) {
      if (this.authoringComponentContent.notificationSettings == null) {
        this.authoringComponentContent.notificationSettings = {
          notifications: []
        };
      }
    }
    this.authoringViewComponentChanged();
  }

  /**
   * The Use Completion Criteria checkbox was clicked. We will toggle the
   * completion criteria in the component content.
   * @return False if we want to cancel the click and not perform any changes.
   * True if we want to perform the changes.
   */
  useCustomCompletionCriteriaClicked() {
    if (this.useCustomCompletionCriteria == false) {
      /*
       * The completion criteria was changed from true to false which
       * means we will delete the completionCriteria object. We will confirm
       * with the author that they want to delete the completion criteria.
       */
      if (!confirm(this.$translate('areYouSureYouWantToDeleteTheCustomCompletionCriteria'))) {
        this.useCustomCompletionCriteria = true;
        return false;
      }
    }

    if (this.useCustomCompletionCriteria) {
      if (this.authoringComponentContent.completionCriteria == null) {
        this.authoringComponentContent.completionCriteria = {
          inOrder: true,
          criteria: []
        };
      }
    } else {
      delete this.authoringComponentContent.completionCriteria;
    }
    this.authoringViewComponentChanged();
    return true;
  }

  moveCompletionCriteriaUp(index) {
    if (index > 0) {
      const criteria = this.authoringComponentContent.completionCriteria.criteria[index];
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.authoringComponentContent.completionCriteria.criteria.splice(index - 1, 0, criteria);
    }
    this.authoringViewComponentChanged();
  }

  moveCompletionCriteriaDown(index) {
    if (index < this.authoringComponentContent.completionCriteria.criteria.length - 1) {
      const criteria = this.authoringComponentContent.completionCriteria.criteria[index];
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.authoringComponentContent.completionCriteria.criteria.splice(index + 1, 0, criteria);
    }
    this.authoringViewComponentChanged();
  }

  authoringAddCompletionCriteria() {
    const newCompletionCriteria = {
      nodeId: this.nodeId,
      componentId: this.componentId,
      name: 'isSubmitted'
    };
    this.authoringComponentContent.completionCriteria.criteria.push(newCompletionCriteria);
    this.authoringViewComponentChanged();
  }

  authoringDeleteCompletionCriteria(index) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisCompletionCriteria'))) {
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  verifyCRaterItemId(itemId) {
    this.cRaterItemIdIsValid = null;
    this.isVerifyingCRaterItemId = true;
    this.CRaterService.makeCRaterVerifyRequest(itemId).then(isValid => {
      this.isVerifyingCRaterItemId = false;
      this.cRaterItemIdIsValid = isValid;
    });
  }
}

export default OpenResponseAuthoringController;
