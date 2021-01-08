import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';
import { CRaterService } from '../../../services/cRaterService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

class EditOpenResponseAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['OpenResponse'];
  cRaterItemIdIsValid: boolean = null;
  isVerifyingCRaterItemId: boolean = false;
  useCustomCompletionCriteria: boolean = false;

  static $inject = ['CRaterService', 'NodeService', 'ProjectService'];

  constructor(
    protected CRaterService: CRaterService,
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService
  ) {
    super(NodeService, ProjectService);
  }

  $onInit(): void {
    super.$onInit();
    if (this.authoringComponentContent.completionCriteria != null) {
      this.useCustomCompletionCriteria = true;
    }
  }

  enableCRaterClicked(): void {
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
    this.componentChanged();
  }

  addScoringRule(): void {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      const newScoringRule = {
        score: '',
        feedbackText: ''
      };
      this.authoringComponentContent.cRater.scoringRules.push(newScoringRule);
      this.componentChanged();
    }
  }

  scoringRuleUpClicked(index: number): void {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      if (index != 0) {
        const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.scoringRules.splice(index - 1, 0, scoringRule);
        this.componentChanged();
      }
    }
  }

  scoringRuleDownClicked(index: number): void {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      if (index != this.authoringComponentContent.cRater.scoringRules.length - 1) {
        const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.authoringComponentContent.cRater.scoringRules.splice(index + 1, 0, scoringRule);
        this.componentChanged();
      }
    }
  }

  scoringRuleDeleteClicked(index: number): void {
    if (
      this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null
    ) {
      const scoringRule = this.authoringComponentContent.cRater.scoringRules[index];
      const score = scoringRule.score;
      const feedbackText = scoringRule.feedbackText;
      const answer = confirm(
        $localize`Are you sure you want to delete this scoring rule?\n\nScore: ${score}\n\nFeedback Text: ${feedbackText}`
      );
      if (answer) {
        this.authoringComponentContent.cRater.scoringRules.splice(index, 1);
        this.componentChanged();
      }
    }
  }

  verifyCRaterItemId(itemId: string): void {
    this.cRaterItemIdIsValid = null;
    this.isVerifyingCRaterItemId = true;
    this.CRaterService.makeCRaterVerifyRequest(itemId).then((isValid) => {
      this.isVerifyingCRaterItemId = false;
      this.cRaterItemIdIsValid = isValid;
    });
  }

  /**
   * Add a new notification. Currently assumes this is a notification based on CRaterResult, but
   * we can add different types in the future.
   */
  addNotification(): void {
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
          $localize`you got a score of` +
          ' {{score}}. ' +
          $localize`Please talk to your teacher` +
          '.',
        notificationMessageToTeacher: '{{username}} ' + $localize`got a score of` + ' {{score}}.'
      };
      this.authoringComponentContent.notificationSettings.notifications.push(newNotification);
      this.componentChanged();
    }
  }

  addMultipleAttemptScoringRule(): void {
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
      this.componentChanged();
    }
  }

  multipleAttemptScoringRuleUpClicked(index: number): void {
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
        this.componentChanged();
      }
    }
  }

  multipleAttemptScoringRuleDownClicked(index: number): void {
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
        this.componentChanged();
      }
    }
  }

  multipleAttemptScoringRuleDeleteClicked(index: number): void {
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
        $localize`Are you sure you want to delete this multiple attempt scoring rule?\n\nPrevious Score: ${previousScore}\n\nCurrent Score: ${currentScore}\n\nFeedback Text: ${feedbackText}`
      );
      if (answer) {
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);
        this.componentChanged();
      }
    }
  }

  notificationUpClicked(index: number): void {
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
        this.componentChanged();
      }
    }
  }

  notificationDownClicked(index: number): void {
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
        this.componentChanged();
      }
    }
  }

  notificationDeleteClicked(index: number): void {
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
        $localize`Are you sure you want to delete this notification?\n\nPrevious Score: ${previousScore}\n\nCurrent Score: ${currentScore}`
      );
      if (answer) {
        this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);
        this.componentChanged();
      }
    }
  }

  enableMultipleAttemptScoringRulesClicked(): void {
    const cRater = this.authoringComponentContent.cRater;
    if (cRater != null && cRater.multipleAttemptScoringRules == null) {
      cRater.multipleAttemptScoringRules = [];
    }
    this.componentChanged();
  }

  enableNotificationsClicked(): void {
    if (this.authoringComponentContent.enableNotifications) {
      if (this.authoringComponentContent.notificationSettings == null) {
        this.authoringComponentContent.notificationSettings = {
          notifications: []
        };
      }
    }
    this.componentChanged();
  }

  /**
   * The Use Completion Criteria checkbox was clicked. We will toggle the
   * completion criteria in the component content.
   * @return False if we want to cancel the click and not perform any changes.
   * True if we want to perform the changes.
   */
  useCustomCompletionCriteriaClicked(): boolean {
    if (this.useCustomCompletionCriteria == false) {
      /*
       * The completion criteria was changed from true to false which
       * means we will delete the completionCriteria object. We will confirm
       * with the author that they want to delete the completion criteria.
       */
      if (!confirm($localize`Are you sure you want to delete the custom completion criteria?`)) {
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
    this.componentChanged();
    return true;
  }

  moveCompletionCriteriaUp(index: number): void {
    if (index > 0) {
      const criteria = this.authoringComponentContent.completionCriteria.criteria[index];
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.authoringComponentContent.completionCriteria.criteria.splice(index - 1, 0, criteria);
    }
    this.componentChanged();
  }

  moveCompletionCriteriaDown(index: number): void {
    if (index < this.authoringComponentContent.completionCriteria.criteria.length - 1) {
      const criteria = this.authoringComponentContent.completionCriteria.criteria[index];
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.authoringComponentContent.completionCriteria.criteria.splice(index + 1, 0, criteria);
    }
    this.componentChanged();
  }

  addCompletionCriteria(): void {
    const newCompletionCriteria = {
      nodeId: this.nodeId,
      componentId: this.componentId,
      name: 'isSubmitted'
    };
    this.authoringComponentContent.completionCriteria.criteria.push(newCompletionCriteria);
    this.componentChanged();
  }

  deleteCompletionCriteria(index: number): void {
    if (confirm($localize`Are you sure you want to delete this completion criteria?`)) {
      this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);
      this.componentChanged();
    }
  }
}

export const EditOpenResponseAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditOpenResponseAdvancedController,
  templateUrl:
    'wise5/components/openResponse/edit-open-response-advanced/edit-open-response-advanced.component.html'
};
