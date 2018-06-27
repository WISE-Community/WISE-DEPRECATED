'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _openResponseController = require('./openResponseController');

var _openResponseController2 = _interopRequireDefault(_openResponseController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OpenResponseAuthoringController = function (_OpenResponseControll) {
  _inherits(OpenResponseAuthoringController, _OpenResponseControll);

  function OpenResponseAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, OpenResponseAuthoringController);

    // the component types we are allowed to connect to
    var _this = _possibleConstructorReturn(this, (OpenResponseAuthoringController.__proto__ || Object.getPrototypeOf(OpenResponseAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{
      type: 'OpenResponse'
    }];

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      // inject the asset paths into the new component content
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);

      /*
       * reset the values so that the preview is refreshed with
       * the new content
       */
      this.submitCounter = 0;
      this.studentResponse = '';
      this.latestAnnotations = null;
      this.isDirty = false;
      this.isSubmitDirty = false;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      if (this.componentContent.starterSentence != null) {
        /*
         * the student has not done any work and there is a starter sentence
         * so we will populate the textarea with the starter sentence
         */
        this.studentResponse = this.componentContent.starterSentence;
      }
    }.bind(_this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
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
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      // close the popup
      _this.$mdDialog.hide();
    });
    return _this;
  }

  /**
   * Add a scoring rule
   */


  _createClass(OpenResponseAuthoringController, [{
    key: 'authoringAddScoringRule',
    value: function authoringAddScoringRule() {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // create a scoring rule object
        var newScoringRule = {};
        newScoringRule.score = '';
        newScoringRule.feedbackText = '';

        // add the new scoring rule object
        this.authoringComponentContent.cRater.scoringRules.push(newScoringRule);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a scoring rule up
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleUpClicked',
    value: function authoringViewScoringRuleUpClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // make sure the scoring rule is not already at the top
        if (index != 0) {
          // the scoring rule is not at the top so we can move it up

          // get the scoring rule
          var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

          // remove the scoring rule
          this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

          // add the scoring rule back at the position one index back
          this.authoringComponentContent.cRater.scoringRules.splice(index - 1, 0, scoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a scoring rule down
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleDownClicked',
    value: function authoringViewScoringRuleDownClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // make sure the scoring rule is not already at the end
        if (index != this.authoringComponentContent.cRater.scoringRules.length - 1) {

          // get the scoring rule
          var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

          // remove the scoring rule
          this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

          // add the scoring rule back at the position one index forward
          this.authoringComponentContent.cRater.scoringRules.splice(index + 1, 0, scoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a scoring rule
     * @param index the index of the scoring rule
     */

  }, {
    key: 'authoringViewScoringRuleDeleteClicked',
    value: function authoringViewScoringRuleDeleteClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.scoringRules != null) {

        // get the scoring rule
        var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

        if (scoringRule != null) {

          // get the score and feedback text
          var score = scoringRule.score;
          var feedbackText = scoringRule.feedbackText;

          // make sure the author really wants to delete the scoring rule
          //var answer = confirm('Are you sure you want to delete this scoring rule?\n\nScore: ' + score + '\n\n' + 'Feedback Text: ' + feedbackText);
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisScoringRule', { score: score, feedbackText: feedbackText }));

          if (answer) {
            // the author answered yes to delete the scoring rule
            this.authoringComponentContent.cRater.scoringRules.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * Add a new notification. Currently assumes this is a notification based on CRaterResult, but
     * we can add different types in the future.
     */

  }, {
    key: 'authoringAddNotification',
    value: function authoringAddNotification() {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // create a new notification
        var newNotification = {
          notificationType: 'CRaterResult',
          enableCriteria: {
            scoreSequence: ['', '']
          },
          isAmbient: false,
          dismissCode: 'apple',
          isNotifyTeacher: true,
          isNotifyStudent: true,
          notificationMessageToStudent: '{{username}}, ' + this.$translate('openResponse.youGotAScoreOf') + ' {{score}}. ' + this.$translate('openResponse.pleaseTalkToYourTeacher') + '.',
          notificationMessageToTeacher: '{{username}} ' + this.$translate('openResponse.gotAScoreOf') + ' {{score}}.'
        };

        // add the new notification
        this.authoringComponentContent.notificationSettings.notifications.push(newNotification);

        // the author has made changes so we will save the component content
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Add a multiple attempt scoring rule
     */

  }, {
    key: 'authoringAddMultipleAttemptScoringRule',
    value: function authoringAddMultipleAttemptScoringRule() {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // create a new multiple attempt scoring rule
        var newMultipleAttemptScoringRule = {};
        newMultipleAttemptScoringRule.scoreSequence = ['', ''];
        newMultipleAttemptScoringRule.feedbackText = '';

        // add the new multiple attempt scoring rule
        this.authoringComponentContent.cRater.multipleAttemptScoringRules.push(newMultipleAttemptScoringRule);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a multiple attempt scoring rule up
     * @param index
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleUpClicked',
    value: function authoringViewMultipleAttemptScoringRuleUpClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // make sure the multiple attempt scoring rule is not already at the top
        if (index != 0) {
          // the multiple attempt scoring rule is not at the top

          // get the multiple attempt scoring rule
          var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

          // remove the multiple attempt scoring rule
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

          // add the multiple attempt scoring rule back at the position one index back
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index - 1, 0, multipleAttemptScoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a multiple attempt scoring rule down
     * @param index the index of the multiple attempt scoring rule
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleDownClicked',
    value: function authoringViewMultipleAttemptScoringRuleDownClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // make sure the multiple attempt scoring rule is not at the end
        if (index != this.authoringComponentContent.cRater.multipleAttemptScoringRules.length - 1) {
          // the multiple attempt scoring rule is not at the end

          // get the multiple attempt scoring rule
          var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

          // remove the multiple attempt scoring rule
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

          // add the multiple attempt scoring rule back at the position one index forward
          this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index + 1, 0, multipleAttemptScoringRule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a multiple attempt scoring rule
     * @param index the index of the mulitple attempt scoring rule
     */

  }, {
    key: 'authoringViewMultipleAttemptScoringRuleDeleteClicked',
    value: function authoringViewMultipleAttemptScoringRuleDeleteClicked(index) {

      if (this.authoringComponentContent.cRater != null && this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

        // get the multiple attempt scoring rule
        var multipleAttemptScoringRule = this.authoringComponentContent.cRater.multipleAttemptScoringRules[index];

        if (multipleAttemptScoringRule != null) {

          // get the score sequence
          var scoreSequence = multipleAttemptScoringRule.scoreSequence;
          var previousScore = '';
          var currentScore = '';

          if (scoreSequence != null) {
            previousScore = scoreSequence[0];
            currentScore = scoreSequence[1];
          }

          // get the feedback text
          var feedbackText = multipleAttemptScoringRule.feedbackText;

          // make sure the author really wants to delete the multiple attempt scoring rule
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisMultipleAttemptScoringRule', { previousScore: previousScore, currentScore: currentScore, feedbackText: feedbackText }));

          if (answer) {
            // the author answered yes to delete the multiple attempt scoring rule
            this.authoringComponentContent.cRater.multipleAttemptScoringRules.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * Move a notification up
     * @param index of the notification
     */

  }, {
    key: 'authoringViewNotificationUpClicked',
    value: function authoringViewNotificationUpClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // make sure the notification is not already at the top
        if (index != 0) {
          // the notification is not at the top

          // get the notification
          var notification = this.authoringComponentContent.notificationSettings.notifications[index];

          // remove the notification
          this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

          // add the notification back at the position one index back
          this.authoringComponentContent.notificationSettings.notifications.splice(index - 1, 0, notification);

          // the author has made changes so we will save the component content
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a notification down
     * @param index the index of the notification
     */

  }, {
    key: 'authoringViewNotificationDownClicked',
    value: function authoringViewNotificationDownClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // make sure the notification is not at the end
        if (index != this.authoringComponentContent.notificationSettings.notifications.length - 1) {
          // the notification is not at the end

          // get the notification
          var notification = this.authoringComponentContent.notificationSettings.notifications[index];

          // remove the notification
          this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

          // add the notification back at the position one index forward
          this.authoringComponentContent.notificationSettings.notifications.splice(index + 1, 0, notification);

          // the author has made changes so we will save the component content
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Delete a notification
     * @param index the index of the notification
     */

  }, {
    key: 'authoringViewNotificationDeleteClicked',
    value: function authoringViewNotificationDeleteClicked(index) {

      if (this.authoringComponentContent.notificationSettings != null && this.authoringComponentContent.notificationSettings.notifications != null) {

        // get the notification
        var notification = this.authoringComponentContent.notificationSettings.notifications[index];

        if (notification != null) {

          // get the score sequence
          var scoreSequence = notification.enableCriteria.scoreSequence;
          var previousScore = '';
          var currentScore = '';

          if (scoreSequence != null) {
            previousScore = scoreSequence[0];
            currentScore = scoreSequence[1];
          }

          // make sure the author really wants to delete the notification
          var answer = confirm(this.$translate('openResponse.areYouSureYouWantToDeleteThisNotification', { previousScore: previousScore, currentScore: currentScore }));

          if (answer) {
            // the author answered yes to delete the notification
            this.authoringComponentContent.notificationSettings.notifications.splice(index, 1);

            // the author has made changes so we will save the component content
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * The "Enable CRater" checkbox was clicked
     */

  }, {
    key: 'authoringViewEnableCRaterClicked',
    value: function authoringViewEnableCRaterClicked() {

      if (this.authoringComponentContent.enableCRater) {
        // CRater was turned on

        if (this.authoringComponentContent.cRater == null) {
          /*
           * the cRater object does not exist in the component content
           * so we will create it
           */

          // create the cRater object
          var cRater = {};
          cRater.itemType = 'CRATER';
          cRater.itemId = '';
          cRater.scoreOn = 'submit';
          cRater.showScore = true;
          cRater.showFeedback = true;
          cRater.scoringRules = [];
          cRater.enableMultipleAttemptScoringRules = false;
          cRater.multipleAttemptScoringRules = [];

          // set the cRater object into the component content
          this.authoringComponentContent.cRater = cRater;
        }

        // turn on the submit button
        //this.authoringComponentContent.showSubmitButton = true;
        this.setShowSubmitButtonValue(true);
      } else {
        // CRater was turned off

        // turn off the submit button
        this.setShowSubmitButtonValue(false);
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * The "Enable Multiple Attempt Feedback" checkbox was clicked
     */

  }, {
    key: 'enableMultipleAttemptScoringRulesClicked',
    value: function enableMultipleAttemptScoringRulesClicked() {

      // get the cRater object from the component content
      var cRater = this.authoringComponentContent.cRater;

      if (cRater != null && cRater.multipleAttemptScoringRules == null) {
        /*
         * the multiple attempt scoring rules array does not exist so
         * we will create it
         */
        cRater.multipleAttemptScoringRules = [];
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * The "Enable Notifications" checkbox was clicked
     */

  }, {
    key: 'authoringViewEnableNotificationsClicked',
    value: function authoringViewEnableNotificationsClicked() {

      if (this.authoringComponentContent.enableNotifications) {
        // Notifications was turned on

        if (this.authoringComponentContent.notificationSettings == null) {
          /*
           * the NotificationSettings object does not exist in the component content
           * so we will create it
           */
          this.authoringComponentContent.notificationSettings = {
            notifications: []
          };
        }
      }

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * The Use Completion Criteria checkbox was clicked. We will toggle the
     * completion criteria in the component content.
     * @return False if we want to cancel the click and not perform any changes.
     * True if we want to perform the changes.
     */

  }, {
    key: 'useCustomCompletionCriteriaClicked',
    value: function useCustomCompletionCriteriaClicked() {
      if (this.useCustomCompletionCriteria == false) {
        /*
         * The completion criteria was changed from true to false which
         * means we will delete the completionCriteria object. We will confirm
         * with the author that they want to delete the completion criteria.
         */
        var answer = confirm(this.$translate('areYouSureYouWantToDeleteTheCustomCompletionCriteria'));
        if (!answer) {
          // the author answered no so we will abort
          this.useCustomCompletionCriteria = true;
          return false;
        }
      }

      if (this.useCustomCompletionCriteria) {
        /*
         * We are using a completion criteria so we will populate it if it
         * doesn't already exist.
         */
        if (this.authoringComponentContent.completionCriteria == null) {
          this.authoringComponentContent.completionCriteria = {
            inOrder: true,
            criteria: []
          };
        }
      } else {
        // we are not using a completion criteria so we will delete it
        delete this.authoringComponentContent.completionCriteria;
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
      return true;
    }

    /**
     * Move a completion criteria up.
     * @param index The index of the completion criteria to move up.
     */

  }, {
    key: 'moveCompletionCriteriaUp',
    value: function moveCompletionCriteriaUp(index) {
      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the criteria
        var criteria = this.authoringComponentContent.completionCriteria.criteria[index];

        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // insert the criteria one index back
        this.authoringComponentContent.completionCriteria.criteria.splice(index - 1, 0, criteria);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a completion criteria down.
     * @param index The index of the completion criteria to move down.
     */

  }, {
    key: 'moveCompletionCriteriaDown',
    value: function moveCompletionCriteriaDown(index) {
      if (index < this.authoringComponentContent.completionCriteria.criteria.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the criteria
        var criteria = this.authoringComponentContent.completionCriteria.criteria[index];

        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // insert the criteria one index forward
        this.authoringComponentContent.completionCriteria.criteria.splice(index + 1, 0, criteria);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a completion criteria.
     */

  }, {
    key: 'authoringAddCompletionCriteria',
    value: function authoringAddCompletionCriteria() {
      var newCompletionCriteria = {
        nodeId: this.nodeId,
        componentId: this.componentId,
        name: 'isSubmitted'
      };
      this.authoringComponentContent.completionCriteria.criteria.push(newCompletionCriteria);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a completion criteria.
     * @param index The index of the completion criteria.
     */

  }, {
    key: 'authoringDeleteCompletionCriteria',
    value: function authoringDeleteCompletionCriteria(index) {
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisCompletionCriteria'));
      if (answer) {
        // remove the criteria
        this.authoringComponentContent.completionCriteria.criteria.splice(index, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if the item id is a valid CRater item id.
     * @param itemId A string.
     */

  }, {
    key: 'verifyCRaterItemId',
    value: function verifyCRaterItemId(itemId) {
      var _this2 = this;

      // clear the Valid/Invalid text
      this.cRaterItemIdIsValid = null;

      // turn on the "Verifying..." text
      this.isVerifyingCRaterItemId = true;

      this.CRaterService.verifyCRaterItemId(itemId).then(function (isValid) {
        // turn off the "Verifying..." text
        _this2.isVerifyingCRaterItemId = false;

        // set the Valid/Invalid text
        _this2.cRaterItemIdIsValid = isValid;
      });
    }
  }]);

  return OpenResponseAuthoringController;
}(_openResponseController2.default);

;

OpenResponseAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotebookService', 'NotificationService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = OpenResponseAuthoringController;
//# sourceMappingURL=openResponseAuthoringController.js.map
