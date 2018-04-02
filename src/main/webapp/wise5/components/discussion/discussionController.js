'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DiscussionController = function () {
  function DiscussionController($filter, $injector, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, DiscussionService, NodeService, NotificationService, ProjectService, StudentAssetService, StudentDataService, StudentWebSocketService, UtilService, $mdMedia) {
    var _this2 = this;

    _classCallCheck(this, DiscussionController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.DiscussionService = DiscussionService;
    this.NodeService = NodeService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.StudentWebSocketService = StudentWebSocketService;
    this.UtilService = UtilService;
    this.idToOrder = this.ProjectService.idToOrder;
    this.$mdMedia = $mdMedia;

    this.$translate = this.$filter('translate');

    // the node id of the current node
    this.nodeId = null;

    // the component id
    this.componentId = null;

    // field that will hold the component content
    this.componentContent = null;

    // field that will hold the authoring component content
    this.authoringComponentContent = null;

    // holds the text that the student has typed
    this.studentResponse = '';

    // holds the text for a new response (not a reply)
    this.newResponse = '';

    // holds student attachments like assets
    this.newAttachments = [];

    // whether the step should be disabled
    this.isDisabled = false;

    // whether the student work is dirty and needs saving
    this.isDirty = false;

    // whether this part is showing previous work
    this.isShowPreviousWork = false;

    // whether the student work is for a submit
    this.isSubmit = false;

    // flag for whether to show the advanced authoring
    this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    this.showJSONAuthoring = false;

    // will hold the class responses
    this.classResponses = [];

    // will hold the top level responses
    this.topLevelResponses = [];

    // the text that is being submitted
    this.submitText = null;

    // map from component state id to response
    this.responsesMap = {};

    // whether rich text is enabled
    this.isRichTextEnabled = false;

    // whether students can attach files to their work
    this.isStudentAttachmentEnabled = false;

    // whether we have retrieved the classmate responses
    this.retrievedClassmateResponses = false;

    // the latest annotations
    this.latestAnnotations = null;

    // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
    this.mode = this.$scope.mode;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    this.workgroupId = null;

    // the options for when to update this component from a connected component
    this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [{
      type: 'Discussion'
    }];

    this.nodeId = this.$scope.nodeId;

    // get the component content from the scope
    this.componentContent = this.$scope.componentContent;

    // get the authoring component content
    this.authoringComponentContent = this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    if (this.componentContent != null) {

      // get the component id
      this.componentId = this.componentContent.id;

      this.mode = this.$scope.mode;

      if (this.$scope.workgroupId != null) {
        this.workgroupId = this.$scope.workgroupId;
      }

      if (this.$scope.nodeId != null) {
        this.nodeId = this.$scope.nodeId;
      }

      if (this.mode === 'student') {
        if (this.ConfigService.isPreview()) {
          // we are in preview mode, so get all posts
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

          this.setClassResponses(componentStates);
        } else {
          // we are in regular student run mode

          if (this.UtilService.hasConnectedComponent(this.componentContent)) {
            // assume there can only be one connected component
            var connectedComponent = this.componentContent.connectedComponents[0];
            if (this.authoringGetConnectedComponentType(connectedComponent) == 'Discussion') {
              this.getClassmateResponses(connectedComponent.nodeId, connectedComponent.componentId);
            }
          } else {
            if (this.isClassmateResponsesGated()) {
              /*
               * classmate responses are gated so we will not show them if the student
               * has not submitted a response
               */

              // get the component state from the scope
              var componentState = this.$scope.componentState;

              if (componentState != null) {
                /*
                 * the student has already submitted a response so we will
                 * display the classmate responses
                 */
                this.getClassmateResponses();
              }
            } else {
              // classmate responses are not gated so we will show them
              this.getClassmateResponses();
            }
          }

          // get the latest annotations
          this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
        }

        // check if we need to lock this component
        this.calculateDisabled();
      } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {

        /*
         * get all the posts that this workgroup id is part of. if the student
         * posted a top level response we will get the top level response and
         * all the replies. if the student replied to a top level response we
         * will get the top level response and all the replies.
         */
        var componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);

        // get the innappropriate flag annotations for the component states
        var annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);

        // show the posts
        this.setClassResponses(componentStates, annotations);

        this.isDisabled = true;

        if (this.mode === 'grading') {
          // get the latest annotations
          this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
        }
      } else if (this.mode === 'onlyShowWork') {
        this.isDisabled = true;
      } else if (this.mode === 'showPreviousWork') {
        this.isPromptVisible = true;
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isDisabled = true;
      } else if (this.mode === 'authoring') {
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
          toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
          height: 300,
          disableDragAndDrop: true,
          buttons: {
            insertAssetButton: InsertAssetButton
          }
        };

        this.updateAdvancedAuthoringView();

        $scope.$watch(function () {
          return this.authoringComponentContent;
        }.bind(this), function (newValue, oldValue) {
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        }.bind(this), true);
      }

      this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

      // set whether studentAttachment is enabled
      this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

      if (this.$scope.$parent.nodeController != null) {
        // register this component with the parent node
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }
    }

    /**
     * The submit button was clicked
     * @param response the response object related to the submit button
     */
    this.$scope.submitbuttonclicked = function (response) {

      if (response) {
        // this submit button was clicked for a reply

        if (response.replyText) {
          var componentState = response;

          // get the component state id
          var componentStateId = componentState.id;

          /*
           * remember the values in the controller so we can read
           * from them later when the student data is saved
           */
          this.$scope.discussionController.studentResponse = componentState.replyText;
          this.$scope.discussionController.componentStateIdReplyingTo = componentStateId;

          // clear the reply input
          response.replyText = null;

          this.$scope.discussionController.isSubmit = true;
          this.$scope.discussionController.isDirty = true;
        }
      } else {
        // the submit button was clicked for the new post

        /*
         * set the response from the top textarea into the
         * studentResponse field that we will read from later
         * when the student data is saved
         */
        this.$scope.discussionController.studentResponse = this.$scope.discussionController.newResponse;

        this.$scope.discussionController.isSubmit = true;
      }

      if (this.mode === 'authoring') {
        this.createComponentState('submit');
      }

      // tell the parent node that this component wants to submit
      this.$scope.$emit('componentSubmitTriggered', { nodeId: this.$scope.discussionController.nodeId, componentId: this.$scope.discussionController.componentId });
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @return a component state containing the student data
     */
    this.$scope.getComponentState = function () {
      var _this = this;

      var deferred = this.$q.defer();

      // check if the student work is dirty and the student clicked the submit button
      if (this.$scope.discussionController.isDirty && this.$scope.discussionController.isSubmit) {

        var action = 'submit';

        // create a component state populated with the student data
        this.$scope.discussionController.createComponentState(action).then(function (componentState) {
          /*
           * clear the component values so they aren't accidentally used again
           * later
           */
          _this.$scope.discussionController.clearComponentValues();

          // set isDirty to false since this student work is about to be saved
          _this.$scope.discussionController.isDirty = false;

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

    /**
     * The parent node submit button was clicked
     */
    this.$scope.$on('nodeSubmitClicked', function (event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (_this2.nodeId === nodeId) {
        _this2.isSubmit = true;
      }
    });

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    this.$scope.$on('annotationSavedToServer', function (event, args) {

      if (args != null) {

        // get the annotation that was saved to the server
        var annotation = args.annotation;

        if (annotation != null) {

          // get the node id and component id of the annotation
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;

          // make sure the annotation was for this component
          if (_this2.nodeId === annotationNodeId && _this2.componentId === annotationComponentId) {

            // get latest score and comment annotations for this component
            _this2.latestAnnotations = _this2.AnnotationService.getLatestComponentAnnotations(_this2.nodeId, _this2.componentId, _this2.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', function (event, args) {

      // do nothing
    });

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    this.$scope.$on('studentWorkSavedToServer', function (event, args) {

      var componentState = args.studentWork;

      // check that the component state is for this component
      if (componentState && _this2.nodeId === componentState.nodeId && _this2.componentId === componentState.componentId) {

        // check if the classmate responses are gated
        if (_this2.isClassmateResponsesGated() && !_this2.retrievedClassmateResponses) {
          /*
           * the classmate responses are gated and we haven't retrieved
           * them yet so we will obtain them now and show them since the student
           * has just submitted a response. getting the classmate responses will
           * also get the post the student just saved to the server.
           */
          _this2.getClassmateResponses();
        } else {
          /*
           * the classmate responses are not gated or have already been retrieved
           * which means they are already being displayed. we just need to add the
           * new response in this case.
           */

          // add the component state to our collection of class responses
          _this2.addClassResponse(componentState);
        }

        _this2.submit();

        // send the student post to web sockets so all the classmates receive it in real time
        var messageType = 'studentData';
        _this2.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, componentState);

        // next, send notifications to students who have posted a response in the same thread as this post
        var studentData = componentState.studentData;
        if (studentData != null && _this2.responsesMap != null) {
          var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
          if (componentStateIdReplyingTo != null) {
            // populate fields of the notification
            var fromWorkgroupId = componentState.workgroupId;
            var notificationType = 'DiscussionReply';
            var nodeId = componentState.nodeId;
            var componentId = componentState.componentId;
            // add the user names to the component state so we can display next to the response
            var userNamesArray = _this2.ConfigService.getUserNamesByWorkgroupId(fromWorkgroupId);
            var userNames = userNamesArray.map(function (obj) {
              return obj.name;
            }).join(', ');
            var notificationMessage = _this2.$translate('discussion.repliedToADiscussionYouWereIn', { userNames: userNames });

            var workgroupsNotifiedSoFar = []; // keep track of workgroups we've already notified, in case a workgroup posts twice on a thread we only want to notify once.
            // check if we have the component state that was replied to
            if (_this2.responsesMap[componentStateIdReplyingTo] != null) {
              var originalPostComponentState = _this2.responsesMap[componentStateIdReplyingTo];
              var toWorkgroupId = originalPostComponentState.workgroupId; // notify the workgroup who posted this reply
              if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId) {
                var notification = _this2.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
                _this2.NotificationService.saveNotificationToServer(notification).then(function (savedNotification) {
                  var messageType = 'notification';
                  _this2.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                });
                workgroupsNotifiedSoFar.push(toWorkgroupId); // make sure we don't notify this workgroup again.
              }

              // also notify repliers to this thread, if any.
              if (_this2.responsesMap[componentStateIdReplyingTo].replies != null) {
                var replies = _this2.responsesMap[componentStateIdReplyingTo].replies;

                for (var r = 0; r < replies.length; r++) {
                  var reply = replies[r];
                  var _toWorkgroupId = reply.workgroupId; // notify the workgroup who posted this reply
                  if (_toWorkgroupId != null && _toWorkgroupId != fromWorkgroupId && workgroupsNotifiedSoFar.indexOf(_toWorkgroupId) == -1) {
                    var _notification = _this2.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, _toWorkgroupId, notificationMessage);
                    _this2.NotificationService.saveNotificationToServer(_notification).then(function (savedNotification) {
                      var messageType = 'notification';
                      _this2.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                    });
                    workgroupsNotifiedSoFar.push(_toWorkgroupId); // make sure we don't notify this workgroup again.
                  }
                }
              }
            }
          }
        }
      }

      _this2.isSubmit = null;
    });

    this.$scope.studentdatachanged = function () {
      this.$scope.discussionController.studentDataChanged();
    };

    /**
     * We have recived a web socket message
     */
    this.$rootScope.$on('webSocketMessageRecieved', function (event, args) {
      if (args != null) {
        var data = args.data;

        var componentState = data.data;

        if (componentState != null) {

          // check that the web socket message is for this step
          if (componentState.nodeId === _this2.nodeId) {

            // get the sender of the message
            var componentStateWorkgroupId = componentState.workgroupId;

            // get the workgroup id of the signed in student
            var workgroupId = _this2.ConfigService.getWorkgroupId();

            /*
             * check if the signed in student sent the message. if the
             * signed in student sent the message we can ignore it.
             */
            if (workgroupId !== componentStateWorkgroupId) {

              if (_this2.retrievedClassmateResponses) {
                // display the classmate post
                _this2.addClassResponse(componentState);
              }
            }
          }
        }
      }
    });

    var scope = this;
    var themePath = this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors?
    // Rich text editor options
    this.tinymceOptions = {
      //onChange: function(e) {
      //scope.studentDataChanged();
      //},
      menubar: false,
      plugins: 'link autoresize',
      toolbar: 'superscript subscript',
      autoresize_bottom_margin: '0',
      autoresize_min_height: '100',
      image_advtab: true,
      content_css: themePath + '/style/tinymce.css',
      statusbar: false,
      forced_root_block: false,
      setup: function setup(ed) {
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

    this.$scope.$watch(function () {
      return $mdMedia('gt-sm');
    }, function (md) {
      $scope.mdScreen = md;
    });

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this2.nodeId && args.componentId == _this2.componentId) {
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
              var assetsDirectoryPath = _this2.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + _this2.nodeId + '_' + _this2.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this2.nodeId + '_' + _this2.componentId;
              }

              if (summernoteId != '') {
                if (_this2.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this2.UtilService.isVideo(fileName)) {
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
      _this2.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this2.componentId === componentId) {
          _this2.showAdvancedAuthoring = !_this2.showAdvancedAuthoring;
        }
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  /**
   * Get the classmate responses
   */


  _createClass(DiscussionController, [{
    key: 'getClassmateResponses',
    value: function getClassmateResponses() {
      var _this3 = this;

      var nodeId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.nodeId;
      var componentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.componentId;

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();

      // make the request for the classmate responses
      this.DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then(function (result) {

        if (result != null) {
          var componentStates = result.studentWorkList;

          /*
           * get the annotations in case there are any that have
           * inappropriate flags
           */
          var annotations = result.annotations;

          // set the classmate responses
          _this3.setClassResponses(componentStates, annotations);
        }
      });
    }
  }, {
    key: 'setStudentWork',


    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    value: function setStudentWork(componentState) {

      if (componentState != null) {
        // populate the text the student previously typed
        var studentData = componentState.studentData;
      }
    }
  }, {
    key: 'saveButtonClicked',


    /**
     * Called when the student clicks the save button
     */
    value: function saveButtonClicked() {

      // tell the parent node that this component wants to save
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'submitButtonClicked',


    /**
     * Called when the student clicks the submit button
     */
    value: function submitButtonClicked() {
      this.isSubmit = true;

      // check if we need to lock the component after the student submits
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }

      // handle the submit button click
      this.$scope.submitbuttonclicked();
    }
  }, {
    key: 'submit',
    value: function submit() {
      if (this.isLockAfterSubmit()) {
        // disable the component if it was authored to lock after submit
        this.isDisabled = true;
      }
    }
  }, {
    key: 'studentDataChanged',


    /**
     * Called when the student changes their work
     */
    value: function studentDataChanged() {
      var _this4 = this;

      /*
       * set the dirty flag so we will know we need to save the
       * student work later
       */
      this.isDirty = true;

      // get this part id
      var componentId = this.getComponentId();

      // get this part id
      var componentId = this.getComponentId();

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {
        _this4.$scope.$emit('componentStudentDataChanged', { nodeId: _this4.nodeId, componentId: componentId, componentState: componentState });
      });
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    value: function createComponentState(action) {

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      if (componentState != null) {
        var studentData = {};

        // set the response into the component state
        studentData.response = this.studentResponse;

        studentData.attachments = this.newAttachments;

        if (this.componentStateIdReplyingTo != null) {
          // if this step is replying, set the component state id replying to
          studentData.componentStateIdReplyingTo = this.componentStateIdReplyingTo;
        }

        componentState.studentData = studentData;

        // set the component type
        componentState.componentType = 'Discussion';

        // set the node id
        componentState.nodeId = this.nodeId;

        // set the component id
        componentState.componentId = this.componentId;

        if (this.ConfigService.isPreview() && !this.componentStateIdReplyingTo || this.mode === 'authoring') {
          // create a dummy component state id if we're in preview mode and posting a new response
          componentState.id = this.UtilService.generateKey();
        }

        if (this.isSubmit) {
          // the student submitted this work
          componentState.studentData.isSubmit = this.isSubmit;

          /*
           * reset the isSubmit value so that the next component state
           * doesn't maintain the same value
           */
          this.isSubmit = false;

          if (this.mode === 'authoring') {
            if (this.StudentDataService.studentData == null) {
              /*
               * initialize the student data since this usually doesn't
               * occur in the authoring mode
               */
              this.StudentDataService.studentData = {};
              this.StudentDataService.studentData.componentStates = [];
            }

            // add the component state to the StudentDataService studentData
            this.StudentDataService.studentData.componentStates.push(componentState);

            // get the component states for this component
            var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

            // set the component states into the component
            this.setClassResponses(componentStates);

            /*
             * clear the input where the user has entered the text they
             * are posting
             */
            this.clearComponentValues();
            this.isDirty = false;
          }
        }
      }

      var deferred = this.$q.defer();

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'createComponentStateAdditionalProcessing',


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
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }

    /**
     * Clear the component values so they aren't accidentally used again
     */

  }, {
    key: 'clearComponentValues',
    value: function clearComponentValues() {

      // clear the student response
      this.studentResponse = '';

      // clear the new response input
      this.newResponse = '';

      // clear new attachments input
      this.newAttachments = [];

      // clear the component state id replying to
      this.componentStateIdReplyingTo = null;
    }
  }, {
    key: 'calculateDisabled',


    /**
     * Check if we need to lock the component
     */
    value: function calculateDisabled() {

      var nodeId = this.nodeId;

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // check if the parent has set this component to disabled
        if (componentContent.isDisabled) {
          this.isDisabled = true;
        } else if (componentContent.lockAfterSubmit) {
          // we need to lock the step after the student has submitted

          // get the component states for this component
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

          // check if any of the component states were submitted
          var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

          if (isSubmitted) {
            // the student has submitted work for this component
            this.isDisabled = true;
          }
        }
        if (this.UtilService.hasConnectedComponent(componentContent)) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = componentContent.connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var connectedComponent = _step.value;

              if (connectedComponent.type == 'showWork') {
                this.isDisabled = true;
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
        }
      }
    }
  }, {
    key: 'showSaveButton',


    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    value: function showSaveButton() {
      var show = false;

      if (this.componentContent != null) {

        // check the showSaveButton field in the component content
        if (this.componentContent.showSaveButton) {
          show = true;
        }
      }

      return show;
    }
  }, {
    key: 'showSubmitButton',


    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    value: function showSubmitButton() {
      var show = false;

      if (this.componentContent != null) {

        // check the showSubmitButton field in the component content
        if (this.componentContent.showSubmitButton) {
          show = true;
        }
      }

      return show;
    }
  }, {
    key: 'isLockAfterSubmit',


    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     * @return whether to lock the component after the student submits
     */
    value: function isLockAfterSubmit() {
      var result = false;

      if (this.componentContent != null) {

        // check the lockAfterSubmit field in the component content
        if (this.componentContent.lockAfterSubmit) {
          result = true;
        }
      }

      return result;
    }
  }, {
    key: 'isClassmateResponsesGated',


    /**
     * Check whether we need to gate the classmate responses
     * @return whether to gate the classmate responses
     */
    value: function isClassmateResponsesGated() {
      var result = false;

      if (this.componentContent != null) {

        // check the gateClassmateResponses field in the component content
        if (this.componentContent.gateClassmateResponses) {
          result = true;
        }
      }

      return result;
    }
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.newAttachments.indexOf(attachment) != -1) {
        this.newAttachments.splice(this.newAttachments.indexOf(attachment), 1);
        this.studentDataChanged();
      }
    }
  }, {
    key: 'attachStudentAsset',


    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
    value: function attachStudentAsset(studentAsset) {
      var _this5 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this5.newAttachments.push(attachment);
            _this5.studentDataChanged();
          }
        });
      }
    }
  }, {
    key: 'getPrompt',


    /**
     * Get the prompt to show to the student
     */
    value: function getPrompt() {
      var prompt = null;

      if (this.originalComponentContent != null) {
        // this is a show previous work component

        if (this.originalComponentContent.showPreviousWorkPrompt) {
          // show the prompt from the previous work component
          prompt = this.componentContent.prompt;
        } else {
          // show the prompt from the original component
          prompt = this.originalComponentContent.prompt;
        }
      } else if (this.componentContent != null) {
        prompt = this.componentContent.prompt;
      }

      return prompt;
    }
  }, {
    key: 'getNumRows',


    /**
     * Get the number of rows for the textarea
     */
    value: function getNumRows() {
      var numRows = null;

      if (this.componentContent != null) {
        numRows = this.componentContent.numRows;
      }

      return numRows;
    }
  }, {
    key: 'importWork',


    /**
     * Import work from another component
     */
    value: function importWork() {

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        var importWorkNodeId = componentContent.importWorkNodeId;
        var importWorkComponentId = componentContent.importWorkComponentId;

        if (importWorkNodeId != null && importWorkComponentId != null) {

          // get the latest component state for this component
          var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

          /*
           * we will only import work into this component if the student
           * has not done any work for this component
           */
          if (componentState == null) {
            // the student has not done any work for this component

            // get the latest component state from the component we are importing from
            var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

            if (importWorkComponentState != null) {
              /*
               * populate a new component state with the work from the
               * imported component state
               */
              var populatedComponentState = this.DiscussionService.populateComponentState(importWorkComponentState);

              // populate the component state into this component
              this.setStudentWork(populatedComponentState);
            }
          }
        }
      }
    }
  }, {
    key: 'getComponentId',


    /**
     * Get the component id
     * @return the component id
     */
    value: function getComponentId() {
      return this.componentContent.id;
    }
  }, {
    key: 'setClassResponses',


    /**
     * Set the class responses into the controller
     * @param componentStates the class component states
     * @param annotations the inappropriate flag annotations
     */
    value: function setClassResponses(componentStates, annotations) {

      this.classResponses = [];

      if (componentStates != null) {

        // loop through all the component states
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];

          if (componentState != null) {

            // get the component state id
            var id = componentState.id;

            // get the workgroup id
            var workgroupId = componentState.workgroupId;

            // get the student data
            var studentData = componentState.studentData;

            if (studentData != null) {

              if (componentState.studentData.isSubmit) {

                // get the latest inappropriate flag for this compnent state
                var latestInappropriateFlagAnnotation = this.getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, componentState.id);

                // add the user names to the component state so we can display next to the response
                var userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
                componentState.userNames = userNames.map(function (obj) {
                  return obj.name;
                }).join(', ');

                // add a replies array to the component state that we will fill with component state replies later
                componentState.replies = [];

                if (this.mode == 'grading' || this.mode == 'gradingRevision') {

                  if (latestInappropriateFlagAnnotation != null) {
                    /*
                     * Set the inappropriate flag annotation into
                     * the component state. This is used for the
                     * grading tool to determine whether to show
                     * the 'Delete' button or the 'Undo Delete'
                     * button.
                     */
                    componentState.latestInappropriateFlagAnnotation = latestInappropriateFlagAnnotation;
                  }

                  // add the component state to our array
                  this.classResponses.push(componentState);
                } else if (this.mode == 'student') {

                  if (latestInappropriateFlagAnnotation != null && latestInappropriateFlagAnnotation.data != null && latestInappropriateFlagAnnotation.data.action == 'Delete') {

                    // do not show this post because the teacher has deleted it
                  } else {
                    // add the component state to our array
                    this.classResponses.push(componentState);
                  }
                }
              }
            }
          }
        }
      }

      // process the class responses
      this.processResponses(this.classResponses);

      this.retrievedClassmateResponses = true;
    }
  }, {
    key: 'getLatestInappropriateFlagAnnotationByStudentWorkId',


    /**
     * Get the latest inappropriate flag annotation for a student work id
     * @param annotations an array of annotations
     * @param studentWorkId a student work id
     * @return the latest inappropriate flag annotation for the given student
     * work id
     */
    value: function getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, studentWorkId) {

      if (annotations != null) {

        // loop through all the annotations from newest to oldest
        for (var a = annotations.length - 1; a >= 0; a--) {
          var annotation = annotations[a];

          if (annotation != null) {
            if (studentWorkId == annotation.studentWorkId && annotation.type == 'inappropriateFlag') {
              /*
               * we have found an inappropriate flag annotation for
               * the student work id we are looking for
               */
              return annotation;
            }
          }
        }
      }

      return null;
    }

    /**
     * Process the class responses. This will put responses into the
     * replies arrays.
     * @param classResponses an array of component states
     */

  }, {
    key: 'processResponses',
    value: function processResponses(componentStates) {

      if (componentStates) {
        var componentState;

        // loop through all the component states
        for (var i = 0; i < componentStates.length; i++) {
          componentState = componentStates[i];

          if (componentState) {
            var componentStateId = componentState.id;

            // set the component state into the map
            this.responsesMap[componentStateId] = componentState;
          }
        }

        // loop through all the component states
        for (var c = 0; c < componentStates.length; c++) {
          componentState = componentStates[c];

          if (componentState && componentState.studentData) {

            // get the student data
            var studentData = componentState.studentData;

            // get the component state id replying to if any
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

            if (componentStateIdReplyingTo) {

              if (this.responsesMap[componentStateIdReplyingTo] && this.responsesMap[componentStateIdReplyingTo].replies) {
                /*
                 * add this component state to the replies array of the
                 * component state that was replied to
                 */
                this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
              }
            }
          }
        }

        this.topLevelResponses = this.getLevel1Responses();
      }
    }
  }, {
    key: 'addClassResponse',


    /**
     * Add a class response to our model
     * @param componentState the component state to add to our model
     */
    value: function addClassResponse(componentState) {

      if (componentState != null) {

        // get the student data
        var studentData = componentState.studentData;

        if (studentData != null) {

          if (componentState.studentData.isSubmit) {
            // this component state is a submit, so we will add it

            // get the workgroup id
            var workgroupId = componentState.workgroupId;

            // add the user names to the component state so we can display next to the response
            var userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
            componentState.userNames = userNames.map(function (obj) {
              return obj.name;
            }).join(', ');

            // add a replies array to the component state that we will fill with component state replies later
            componentState.replies = [];

            // add the component state to our array of class responses
            this.classResponses.push(componentState);

            // get the component state id
            var componentStateId = componentState.id;

            // add the response to our map
            this.responsesMap[componentStateId] = componentState;

            // get the component state id replying to if any
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

            if (componentStateIdReplyingTo != null) {

              // check if we have the component state that was replied to
              if (this.responsesMap[componentStateIdReplyingTo] != null && this.responsesMap[componentStateIdReplyingTo].replies != null) {
                /*
                 * add this response to the replies array of the response
                 * that was replied to
                 */
                this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
              }
            }

            this.topLevelResponses = this.getLevel1Responses();
          }
        }
      }
    }
  }, {
    key: 'getClassResponses',


    /**
     * Get the class responses
     */
    value: function getClassResponses() {
      return this.classResponses;
    }
  }, {
    key: 'getLevel1Responses',


    /**
     * Get the level 1 responses which are posts that are not a
     * reply to another response.
     * @return an array of responses that are not a reply to another
     * response
     */
    value: function getLevel1Responses() {
      var level1Responses = [];
      var classResponses = this.classResponses;

      if (classResponses != null) {

        // loop through all the class responses
        for (var r = 0; r < classResponses.length; r++) {
          var tempClassResponse = classResponses[r];

          if (tempClassResponse != null && tempClassResponse.studentData) {

            // get the student data
            var studentData = tempClassResponse.studentData;

            // get the component state id replying to if any
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

            if (componentStateIdReplyingTo == null) {
              /*
               * this response was not a reply to another post so it is a
               * level 1 response
               */
              level1Responses.push(tempClassResponse);
            }
          }
        }
      }

      return level1Responses;
    }
  }, {
    key: 'authoringViewComponentChanged',


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
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
    key: 'registerExitListener',


    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    value: function registerExitListener() {
      var _this6 = this;

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', function (event, args) {
        // do nothing
        _this6.$rootScope.$broadcast('doneExiting');
      });
    }
  }, {
    key: 'getComponentsByNodeId',


    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */
    value: function getComponentsByNodeId(nodeId) {
      var components = this.ProjectService.getComponentsByNodeId(nodeId);

      return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */

  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(nodeId) {
      var result = this.ProjectService.isApplicationNode(nodeId);

      return result;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

      return nodePositionAndTitle;
    }

    /**
     * The show previous work checkbox was clicked
     */

  }, {
    key: 'authoringShowPreviousWorkClicked',
    value: function authoringShowPreviousWorkClicked() {

      if (!this.authoringComponentContent.showPreviousWork) {
        /*
         * show previous work has been turned off so we will clear the
         * show previous work node id, show previous work component id, and
         * show previous work prompt values
         */
        this.authoringComponentContent.showPreviousWorkNodeId = null;
        this.authoringComponentContent.showPreviousWorkComponentId = null;
        this.authoringComponentContent.showPreviousWorkPrompt = null;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The show previous work node id has changed
     */

  }, {
    key: 'authoringShowPreviousWorkNodeIdChanged',
    value: function authoringShowPreviousWorkNodeIdChanged() {

      if (this.authoringComponentContent.showPreviousWorkNodeId == null || this.authoringComponentContent.showPreviousWorkNodeId == '') {

        /*
         * the show previous work node id is null so we will also set the
         * show previous component id to null
         */
        this.authoringComponentContent.showPreviousWorkComponentId = '';
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The show previous work component id has changed
     */

  }, {
    key: 'authoringShowPreviousWorkComponentIdChanged',
    value: function authoringShowPreviousWorkComponentIdChanged() {

      // get the show previous work node id
      var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;

      // get the show previous work prompt boolean value
      var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;

      // get the old show previous work component id
      var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

      // get the new show previous work component id
      var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;

      // get the new show previous work component
      var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

      if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
        // the new show previous work component is empty

        // save the component
        this.authoringViewComponentChanged();
      } else if (newShowPreviousWorkComponent != null) {

        // get the current component type
        var currentComponentType = this.componentContent.type;

        // get the new component type
        var newComponentType = newShowPreviousWorkComponent.type;

        // check if the component types are different
        if (newComponentType != currentComponentType) {
          /*
           * the component types are different so we will need to change
           * the whole component
           */

          // make sure the author really wants to change the component type
          var answer = confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'));

          if (answer) {
            // the author wants to change the component type

            /*
             * get the component service so we can make a new instance
             * of the component
             */
            var componentService = this.$injector.get(newComponentType + 'Service');

            if (componentService != null) {

              // create a new component
              var newComponent = componentService.createComponent();

              // set move over the values we need to keep
              newComponent.id = this.authoringComponentContent.id;
              newComponent.showPreviousWork = true;
              newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
              newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
              newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

              /*
               * update the authoring component content JSON string to
               * change the component
               */
              this.authoringComponentContentJSONString = JSON.stringify(newComponent);

              // update the component in the project and save the project
              this.advancedAuthoringViewComponentChanged();
            }
          } else {
            /*
             * the author does not want to change the component type so
             * we will rollback the showPreviousWorkComponentId value
             */
            this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
          }
        } else {
          /*
           * the component types are the same so we do not need to change
           * the component type and can just save
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      var result = true;

      if (component != null) {
        result = this.ProjectService.componentHasWork(component);
      }

      return result;
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
     * Add a connected component
     */

  }, {
    key: 'addConnectedComponent',
    value: function addConnectedComponent() {

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

  }, {
    key: 'deleteConnectedComponent',
    value: function deleteConnectedComponent(index) {

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The teacher has clicked the delete button to delete a post. We won't
     * actually delete the student work, we'll just create an inappropriate
     * flag annotation which prevents the students in the class from seeing
     * the post.
     * @param componentState the student component state the teacher wants to
     * delete.
     */

  }, {
    key: 'deletebuttonclicked',
    value: function deletebuttonclicked(componentState) {
      var _this7 = this;

      if (componentState != null) {

        var toWorkgroupId = componentState.workgroupId;

        var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);

        var periodId = null;

        if (userInfo != null) {
          periodId = userInfo.periodId;
        }

        var teacherUserInfo = this.ConfigService.getMyUserInfo();

        var fromWorkgroupId = null;

        if (teacherUserInfo != null) {
          fromWorkgroupId = teacherUserInfo.workgroupId;
        }

        var runId = this.ConfigService.getRunId();
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var studentWorkId = componentState.id;
        var data = {};
        data.action = 'Delete';

        // create the inappropriate flag 'Delete' annotation
        var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);

        // save the annotation to the server
        this.AnnotationService.saveAnnotation(annotation).then(function () {

          // get the component states made by the student
          var componentStates = _this7.DiscussionService.getPostsAssociatedWithWorkgroupId(_this7.componentId, _this7.workgroupId);

          // get the annotations for the component states
          var annotations = _this7.getInappropriateFlagAnnotationsByComponentStates(componentStates);

          // refresh the teacher view of the posts
          _this7.setClassResponses(componentStates, annotations);
        });
      }
    }

    /**
     * The teacher has clicked the 'Undo Delete' button to undo a previous
     * deletion of a post. This function will create an inappropriate flag
     * annotation with the action set to 'Undo Delete'. This will make the
     * post visible to the students.
     * @param componentState the student component state the teacher wants to
     * show again.
     */

  }, {
    key: 'undodeletebuttonclicked',
    value: function undodeletebuttonclicked(componentState) {
      var _this8 = this;

      if (componentState != null) {

        var toWorkgroupId = componentState.workgroupId;

        var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);

        var periodId = null;

        if (userInfo != null) {
          periodId = userInfo.periodId;
        }

        var teacherUserInfo = this.ConfigService.getMyUserInfo();

        var fromWorkgroupId = null;

        if (teacherUserInfo != null) {
          fromWorkgroupId = teacherUserInfo.workgroupId;
        }

        var runId = this.ConfigService.getRunId();
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var studentWorkId = componentState.id;
        var data = {};
        data.action = 'Undo Delete';

        // create the inappropriate flag annotation
        var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);

        // save the annotation to the server
        this.AnnotationService.saveAnnotation(annotation).then(function () {

          // get the component states made by the student
          var componentStates = _this8.DiscussionService.getPostsAssociatedWithWorkgroupId(_this8.componentId, _this8.workgroupId);

          // get the annotations for the component states
          var annotations = _this8.getInappropriateFlagAnnotationsByComponentStates(componentStates);

          // refresh the teacher view of the posts
          _this8.setClassResponses(componentStates, annotations);
        });
      }
    }

    /**
     * Get the inappropriate flag annotations for these component states
     * @param componentStates an array of component states
     * @return an array of inappropriate flag annotations that are associated
     * with the component states
     */

  }, {
    key: 'getInappropriateFlagAnnotationsByComponentStates',
    value: function getInappropriateFlagAnnotationsByComponentStates(componentStates) {
      var annotations = [];

      if (componentStates != null) {

        // loop through all the component states
        for (var c = 0; c < componentStates.length; c++) {

          var componentState = componentStates[c];

          if (componentState != null) {

            /*
             * get the latest inappropriate flag annotation for the
             * component state
             */
            var latestInappropriateFlagAnnotation = this.AnnotationService.getLatestAnnotationByStudentWorkIdAndType(componentState.id, 'inappropriateFlag');

            if (latestInappropriateFlagAnnotation != null) {
              annotations.push(latestInappropriateFlagAnnotation);
            }
          }
        }
      }

      return annotations;
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
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {

      // get the connected components
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {

        var componentStates = [];

        // loop through all the connected components
        for (var c = 0; c < connectedComponents.length; c++) {
          var connectedComponent = connectedComponents[c];

          if (connectedComponent != null) {
            var nodeId = connectedComponent.nodeId;
            var componentId = connectedComponent.componentId;
            var type = connectedComponent.type;

            if (type == 'showWork') {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }

              // we are showing work so we will not allow the student to edit it
              this.isDisabled = true;
            } else if (type == 'importWork' || type == null) {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }
            }
          }
        }

        // merge the student responses from all the component states
        var mergedComponentState = this.createMergedComponentState(componentStates);

        // set the student work into the component
        this.setStudentWork(mergedComponentState);

        // make the work dirty so that it gets saved
        this.studentDataChanged();
      }
    }

    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {

      // create a new component state
      var mergedComponentState = this.NodeService.createNewComponentState();

      if (componentStates != null) {

        var mergedResponse = '';

        // loop through all the component state
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];

          if (componentState != null) {
            var studentData = componentState.studentData;

            if (studentData != null) {

              // get the student response
              var response = studentData.response;

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
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var component = _step2.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          if (numberOfAllowedComponents == 1) {
            /*
             * there is only one viable component to connect to so we
             * will use it
             */
            connectedComponent.componentId = allowedComponent.id;
            connectedComponent.type = 'showWork';
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
  }]);

  return DiscussionController;
}();

DiscussionController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'DiscussionService', 'NodeService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'StudentWebSocketService', 'UtilService', '$mdMedia'];

exports.default = DiscussionController;
//# sourceMappingURL=discussionController.js.map
