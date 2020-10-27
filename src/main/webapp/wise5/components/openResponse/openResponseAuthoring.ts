'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';
import { CRaterService } from '../../services/cRaterService';

@Directive()
class OpenResponseAuthoringController extends EditComponentController {
  allowedConnectedComponentTypes: any[];
  useCustomCompletionCriteria: boolean = false;
  cRaterItemIdIsValid: boolean = null;
  isVerifyingCRaterItemId: boolean = false;

  static $inject = [
    '$filter',
    'ConfigService',
    'CRaterService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    ConfigService,
    protected CRaterService: CRaterService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();
    this.allowedConnectedComponentTypes = [
      {
        type: 'OpenResponse'
      }
    ];

    if (this.authoringComponentContent.completionCriteria != null) {
      this.useCustomCompletionCriteria = true;
    }
  }

  addScoringRule() {
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

  scoringRuleUpClicked(index) {
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

  scoringRuleDownClicked(index) {
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

  scoringRuleDeleteClicked(index) {
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
  addNotification() {
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

  addMultipleAttemptScoringRule() {
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

  multipleAttemptScoringRuleUpClicked(index) {
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

  multipleAttemptScoringRuleDownClicked(index) {
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

  multipleAttemptScoringRuleDeleteClicked(index) {
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

  notificationUpClicked(index) {
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

  notificationDownClicked(index) {
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

  notificationDeleteClicked(index) {
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

  enableCRaterClicked() {
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

  enableNotificationsClicked() {
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

  addCompletionCriteria() {
    const newCompletionCriteria = {
      nodeId: this.nodeId,
      componentId: this.componentId,
      name: 'isSubmitted'
    };
    this.authoringComponentContent.completionCriteria.criteria.push(newCompletionCriteria);
    this.authoringViewComponentChanged();
  }

  deleteCompletionCriteria(index) {
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

const OpenResponseAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: OpenResponseAuthoringController,
  controllerAs: 'openResponseController',
  templateUrl: 'wise5/components/openResponse/authoring.html'
}

export default OpenResponseAuthoring;
