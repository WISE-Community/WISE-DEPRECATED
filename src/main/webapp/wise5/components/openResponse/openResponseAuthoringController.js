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

    // the options for when to update this component from a connected component
    var _this = _possibleConstructorReturn(this, (OpenResponseAuthoringController.__proto__ || Object.getPrototypeOf(OpenResponseAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{
      type: 'OpenResponse'
    }];

    _this.isPromptVisible = true;
    _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
    _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

    // generate the summernote rubric element id
    _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

    // set the component rubric into the summernote rubric
    _this.summernoteRubricHTML = _this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = _this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    _this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    _this.updateAdvancedAuthoringView();

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

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });
    return _this;
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */


  _createClass(OpenResponseAuthoringController, [{
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {

      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

      try {
        /*
         * create a new component by converting the JSON string in the advanced
         * authoring view into a JSON object
         */
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        // replace the component in the project
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

        // set the new component into the controller
        this.componentContent = editedComponentContent;

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'authoringAddScoringRule',


    /**
     * Add a scoring rule
     */
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
     * The author has changed the rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {

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
     * Set the show submit button value
     * @param show whether to show the submit button
     */

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

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
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

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

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

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

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var component = _step.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
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

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
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

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
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

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
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
