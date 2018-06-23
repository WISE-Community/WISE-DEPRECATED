'use strict';

import AnimationController from './animationController';

class AnimationAuthoringController extends AnimationController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnimationService,
              AnnotationService,
              ConfigService,
              CRaterService,
              NodeService,
              NotebookService,
              NotificationService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnimationService,
      AnnotationService,
      ConfigService,
      CRaterService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.isPromptVisible = true;
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

    // generate the summernote rubric element id
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

    // set the component rubric into the summernote rubric
    this.summernoteRubricHTML = this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
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


    let themePath = this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors (OR strip down to only special characters, support for equations)
    // Rich text editor options
    this.tinymceOptions = {
      //onChange: function(e) {
      //scope.studentDataChanged();
      //},
      menubar: false,
      plugins: 'link image media autoresize', //imagetools
      toolbar: 'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
      autoresize_bottom_margin: '0',
      autoresize_min_height: '100',
      image_advtab: true,
      content_css: themePath + '/style/tinymce.css',
      setup: function (ed) {
        ed.on('focus', function (e) {
          $(e.target.editorContainer).addClass('input--focused').parent().addClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
        });

        ed.on('blur', function (e) {
          $(e.target.editorContainer).removeClass('input--focused').parent().removeClass('input-wrapper--focused');
          $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
        });
      }
    };

    // the options for when to update this component from a connected component
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

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      {
        type: 'Animation'
      },
      {
        type: 'Graph'
      }
    ];

    this.updateAdvancedAuthoringView();

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
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

      // remove all the old objects
      this.removeAllObjects();

      // initialize all the coordinates
      this.initializeCoordinates();

      // re-render the svg div
      this.setup();
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
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
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'image') {
                // the target is the image
                if (args.targetObject != null) {
                  args.targetObject.image = fileName;
                }
              } else if (args.target == 'imageMovingLeft') {
                // the target is the image moving left
                if (args.targetObject != null) {
                  args.targetObject.imageMovingLeft = fileName;
                }
              } else if (args.target == 'imageMovingRight') {
                // the target is the image moving right
                if (args.targetObject != null) {
                  args.targetObject.imageMovingRight = fileName;
                }
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
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

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();

      // close the popup
      this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (args != null) {
        let componentId = args.componentId;
        if (this.componentId === componentId) {
          this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        }
      }
    });
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
   * Add a scoring rule
   */
  authoringAddScoringRule() {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null) {

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
  authoringViewScoringRuleUpClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null) {

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
  authoringViewScoringRuleDownClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null) {

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
  authoringViewScoringRuleDeleteClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.scoringRules != null) {

      // get the scoring rule
      var scoringRule = this.authoringComponentContent.cRater.scoringRules[index];

      if (scoringRule != null) {

        // get the score and feedback text
        var score = scoringRule.score;
        var feedbackText = scoringRule.feedbackText;

        // make sure the author really wants to delete the scoring rule
        //var answer = confirm('Are you sure you want to delete this scoring rule?\n\nScore: ' + score + '\n\n' + 'Feedback Text: ' + feedbackText);
        var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisScoringRule', {score: score, feedbackText: feedbackText}));

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
  authoringAddNotification() {

    if (this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null) {

      // create a new notification
      let newNotification = {
        notificationType: 'CRaterResult',
        enableCriteria: {
          scoreSequence: ['', '']
        },
        isAmbient: false,
        dismissCode: 'apple',
        isNotifyTeacher: true,
        isNotifyStudent: true,
        notificationMessageToStudent: '{{username}}, ' + this.$translate('animation.youGotAScoreOf') + ' {{score}}. ' + this.$translate('animation.pleaseTalkToYourTeacher') + '.',
        notificationMessageToTeacher: '{{username}} ' + this.$translate('animation.gotAScoreOf') + ' {{score}}.'
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
  authoringAddMultipleAttemptScoringRule() {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

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
  authoringViewMultipleAttemptScoringRuleUpClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

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
  authoringViewMultipleAttemptScoringRuleDownClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

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
  authoringViewMultipleAttemptScoringRuleDeleteClicked(index) {

    if (this.authoringComponentContent.cRater != null &&
      this.authoringComponentContent.cRater.multipleAttemptScoringRules != null) {

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
        var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisMultipleAttemptScoringRule', {previousScore: previousScore, currentScore: currentScore, feedbackText: feedbackText}));

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
  authoringViewNotificationUpClicked(index) {

    if (this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null) {

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
  authoringViewNotificationDownClicked(index) {

    if (this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null) {

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
  authoringViewNotificationDeleteClicked(index) {

    if (this.authoringComponentContent.notificationSettings != null &&
      this.authoringComponentContent.notificationSettings.notifications != null) {

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
        var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisNotification', {previousScore: previousScore, currentScore: currentScore}));

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
  authoringViewEnableCRaterClicked() {

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
        cRater.multipleAttemptScoringRules = []

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
  enableMultipleAttemptScoringRulesClicked() {

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
  authoringViewEnableNotificationsClicked() {

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
   * Add a new object
   */
  authoringAddObjectClicked() {

    // initialize the objects array if necessary
    if (this.authoringComponentContent.objects == null) {
      this.authoringComponentContent.objects = [];
    }

    // create a new object
    var newObject = {};
    newObject.id = this.UtilService.generateKey(10);
    newObject.type = 'image';

    // add the object to our array of objects
    this.authoringComponentContent.objects.push(newObject);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Add a data point to an object
   * @param object add a data point to this object
   */
  authoringAddDataPointClicked(object) {
    if (object != null) {

      if (object.dataSource != null) {
        // the object already has a data source

        // ask the user if they are sure they want to delete the data source
        var answer = confirm('You can only have Data Points or a Data Source. If you add a Data Point, the Data Source will be deleted. Are you sure you want to add a Data Point?');

        if (answer) {
          // the author answered yes to delete the data source
          delete object.dataSource;

          // initialize the data array if necessary
          if (object.data == null) {
            object.data = [];
          }

          // create a new data point
          var newDataPoint = {};

          // add the new data point
          object.data.push(newDataPoint);
        }
      } else {
        // the object does not have a data source so we can add a data point

        // initialize the data array if necessary
        if (object.data == null) {
          object.data = [];
        }

        // create a new data point
        var newDataPoint = {};

        // add the new data point
        object.data.push(newDataPoint);
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a data point from an object
   * @param object the object to delete a data point from
   * @param index the index of the data point to delete
   */
  authoringDeleteObjectDataPointClicked(object, index) {

    if (object != null && object.data != null) {

      // ask the author if they are sure they want to delete the point
      var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'));

      if (answer) {
        // delete the data point at the given index
        object.data.splice(index, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }
  }

  /**
   * Move a data point up
   * @param object the object the data point belongs to
   * @param index the index of the data point in the object
   */
  authoringMoveObjectDataPointUpClicked(object, index) {
    if (object != null && object.data != null) {

      if (index > 0) {
        // the data point is not at the top so we can move it up

        // remember the data point we are moving
        var dataPoint = object.data[index];

        // remove the data point at the given index
        object.data.splice(index, 1);

        // insert the data point back in at one index back
        object.data.splice(index - 1, 0, dataPoint);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a data point down
   * @param object the object the data point belongs to
   * @param index the index of the data point in the object
   */
  authoringMoveObjectDataPointDownClicked(object, index) {
    if (object != null && object.data != null) {

      if (index < object.data.length - 1) {
        // the data point is not at the bottom so we can move it down

        // remember the data point we are moving
        var dataPoint = object.data[index];

        // remove the data point at the given index
        object.data.splice(index, 1);

        // insert the data point back in at one index forward
        object.data.splice(index + 1, 0, dataPoint);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move an object up
   * @param index the index of the object
   */
  authoringMoveObjectUpClicked(index) {

    if (this.authoringComponentContent != null) {

      var objects = this.authoringComponentContent.objects;

      if (objects != null) {

        if (index > 0) {
          // the object is not at the top so we can move it up

          // remember the object we are moving
          var object = objects[index];

          // remove the object
          objects.splice(index, 1);

          // insert the object back in at one index back
          objects.splice(index - 1, 0, object);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move an object down
   * @param index the index of the object
   */
  authoringMoveObjectDownClicked(index) {

    if (this.authoringComponentContent != null) {

      var objects = this.authoringComponentContent.objects;

      if (objects != null) {

        if (index < objects.length - 1) {
          // the object is not at the bottom so we can move it down

          // remember the object we are moving
          var object = objects[index];

          // remove the object
          objects.splice(index, 1);

          // insert the object back in at one index forward
          objects.splice(index + 1, 0, object);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete an object
   * @param index the index of the object
   */
  authoringDeleteObjectClicked(index) {

    if (this.authoringComponentContent != null) {

      var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'));

      if (answer) {
        var objects = this.authoringComponentContent.objects;

        if (objects != null) {
          // remove the object from the array of objects
          objects.splice(index, 1);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The add data source button was clicked
   * @param object the object we will add the data source to
   */
  authoringAddDataSourceClicked(object) {

    if (object != null && object.data != null && object.data.length > 0) {
      /*
       * the object has data so we will ask the author if they are sure
       * they want to add a data source which will remove the data
       */

      var answer = confirm('You can only have Data Points or a Data Source. If you add a Data Source, the Data Points will be deleted. Are you sure you want to add a Data Source?');

      if (answer) {
        // the author answered yes to delete the data points

        // delete the data points
        delete object.data;

        // add the data source
        object.dataSource = {};
      }
    } else {
      // there are no data points so we can add the data source

      // delete the data points
      delete object.data;

      // add the data source
      object.dataSource = {};
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The delete data source button was clicked
   * @param object the object to delete the data source from
   */
  authoringDeleteDataSourceClicked(object) {

    // ask the author if they are sure they want to delete the data source
    var answer = confirm('Are you sure you want to delete the Data Source?');

    if (answer) {
      // the author answered yes to delete the data source
      delete object.dataSource;
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The data source node has changed
   * @param object the object that has changed
   */
  dataSourceNodeChanged(object) {

    if (object != null) {

      // remember the node id
      var nodeId = object.dataSource.nodeId;

      // clear the dataSource object except for the node id
      object.dataSource = {
        nodeId: nodeId
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The data source component has changed
   * @param object the object that has changed
   */
  dataSourceComponentChanged(object) {

    if (object != null) {

      // remember the node id and component id
      var nodeId = object.dataSource.nodeId;
      var componentId = object.dataSource.componentId;

      // get the component
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);

      // clear the dataSource object except for the node id and component id
      object.dataSource = {
        nodeId: nodeId,
        componentId: componentId
      };

      if (component != null && component.type == 'Graph') {
        // set the default parameters for a graph data source
        object.dataSource.trialIndex = 0;
        object.dataSource.seriesIndex = 0;
        object.dataSource.tColumnIndex = 0;
        object.dataSource.xColumnIndex = 1;
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Show the asset popup to allow the author to choose the image
   */
  chooseImage(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'image';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose the image moving left
   * @param object the object to set the image moving left
   */
  chooseImageMovingLeft(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'imageMovingLeft';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose the image moving right
   * @param object the object to set the image moving right
   */
  chooseImageMovingRight(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'imageMovingRight';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * The type for an object changed
   * @param object the object that changed
   */
  authoringObjectTypeChanged(object) {

    if (object != null) {
      if (object.type == 'image') {
        // the type changed to an image so we will delete the text field
        delete object.text;
      } else if (object.type == 'text') {
        // the type changed to text so we will delete the image fields
        delete object.image;
        delete object.width;
        delete object.height;
        delete object.imageMovingLeft;
        delete object.imageMovingRight;
        delete object.imageMovingUp;
        delete object.imageMovingDown;
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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

AnimationAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnimationService',
  'AnnotationService',
  'ConfigService',
  'CRaterService',
  'NodeService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default AnimationAuthoringController;
