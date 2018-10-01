'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DiscussionController = function (_ComponentController) {
  _inherits(DiscussionController, _ComponentController);

  function DiscussionController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, DiscussionService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, StudentWebSocketService, UtilService, $mdMedia) {
    _classCallCheck(this, DiscussionController);

    var _this = _possibleConstructorReturn(this, (DiscussionController.__proto__ || Object.getPrototypeOf(DiscussionController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.DiscussionService = DiscussionService;
    _this.NotificationService = NotificationService;
    _this.StudentWebSocketService = StudentWebSocketService;
    _this.$mdMedia = $mdMedia;

    // holds the text that the student has typed
    _this.studentResponse = '';

    // holds the text for a new response (not a reply)
    _this.newResponse = '';

    // will hold the class responses
    _this.classResponses = [];

    // will hold the top level responses
    _this.topLevelResponses = [];

    // the text that is being submitted
    _this.submitText = null;

    // map from component state id to response
    _this.responsesMap = {};

    // whether rich text is enabled
    _this.isRichTextEnabled = false;

    // whether we have retrieved the classmate responses
    _this.retrievedClassmateResponses = false;

    // the latest annotations
    _this.latestAnnotations = null;

    if (_this.$scope.workgroupId != null) {
      _this.workgroupId = _this.$scope.workgroupId;
    }

    if (_this.$scope.nodeId != null) {
      _this.nodeId = _this.$scope.nodeId;
    }

    if (_this.mode === 'student') {
      if (_this.ConfigService.isPreview()) {
        var _componentStates = null;
        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          // assume there can only be one connected component
          var connectedComponent = _this.componentContent.connectedComponents[0];
          _componentStates = _this.StudentDataService.getComponentStatesByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
        } else {
          _componentStates = _this.StudentDataService.getComponentStatesByNodeIdAndComponentId(_this.nodeId, _this.componentId);
        }
        _this.setClassResponses(_componentStates);
      } else {
        // we are in regular student run mode

        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          // assume there can only be one connected component
          var _connectedComponent = _this.componentContent.connectedComponents[0];
          _this.getClassmateResponses(_connectedComponent.nodeId, _connectedComponent.componentId);
        } else {
          if (_this.isClassmateResponsesGated()) {
            /*
             * classmate responses are gated so we will not show them if the student
             * has not submitted a response
             */

            // get the component state from the scope
            var componentState = _this.$scope.componentState;

            if (componentState != null) {
              /*
               * the student has already submitted a response so we will
               * display the classmate responses
               */
              _this.getClassmateResponses();
            }
          } else {
            // classmate responses are not gated so we will show them
            _this.getClassmateResponses();
          }
        }
      }

      _this.disableComponentIfNecessary();
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {

      /*
       * get all the posts that this workgroup id is part of. if the student
       * posted a top level response we will get the top level response and
       * all the replies. if the student replied to a top level response we
       * will get the top level response and all the replies.
       */
      var componentStates = _this.DiscussionService.getPostsAssociatedWithWorkgroupId(_this.componentId, _this.workgroupId);

      // get the innappropriate flag annotations for the component states
      var annotations = _this.getInappropriateFlagAnnotationsByComponentStates(componentStates);

      // show the posts
      _this.setClassResponses(componentStates, annotations);

      _this.isDisabled = true;
    } else if (_this.mode === 'onlyShowWork') {
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    }

    _this.isRichTextEnabled = _this.componentContent.isRichTextEnabled;

    /**
     * The submit button was clicked
     * @param response the response object related to the submit button
     */
    _this.$scope.submitbuttonclicked = function (response) {

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
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @return a component state containing the student data
     */
    _this.$scope.getComponentState = function () {
      var _this2 = this;

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
          _this2.$scope.discussionController.clearComponentValues();

          // set isDirty to false since this student work is about to be saved
          _this2.$scope.discussionController.isDirty = false;

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
    }.bind(_this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', function (event, args) {

      // do nothing
    });

    _this.$scope.studentdatachanged = function () {
      this.$scope.discussionController.studentDataChanged();
    };

    /**
     * We have recived a web socket message
     */
    _this.$rootScope.$on('webSocketMessageRecieved', function (event, args) {
      if (args != null) {
        var data = args.data;

        var componentState = data.data;

        if (componentState != null) {

          // check that the web socket message is for this step
          if (componentState.nodeId === _this.nodeId) {

            // get the sender of the message
            var componentStateWorkgroupId = componentState.workgroupId;

            // get the workgroup id of the signed in student
            var workgroupId = _this.ConfigService.getWorkgroupId();

            /*
             * check if the signed in student sent the message. if the
             * signed in student sent the message we can ignore it.
             */
            if (workgroupId !== componentStateWorkgroupId) {

              if (_this.retrievedClassmateResponses) {
                // display the classmate post
                _this.addClassResponse(componentState);
              }
            }
          }
        }
      }
    });

    var scope = _this;
    var themePath = _this.ProjectService.getThemePath();

    // TODO: make toolbar items and plugins customizable by authors?
    // Rich text editor options
    _this.tinymceOptions = {
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

    _this.$scope.$watch(function () {
      return $mdMedia('gt-sm');
    }, function (md) {
      $scope.mdScreen = md;
    });

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(DiscussionController, [{
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      var _this3 = this;

      /**
       * Listen for the 'studentWorkSavedToServer' event which is fired when
       * we receive the response from saving a component state to the server
       */
      this.$scope.$on('studentWorkSavedToServer', function (event, args) {

        var componentState = args.studentWork;

        // check that the component state is for this component
        if (componentState && _this3.nodeId === componentState.nodeId && _this3.componentId === componentState.componentId) {

          // check if the classmate responses are gated
          if (_this3.isClassmateResponsesGated() && !_this3.retrievedClassmateResponses) {
            /*
             * the classmate responses are gated and we haven't retrieved
             * them yet so we will obtain them now and show them since the student
             * has just submitted a response. getting the classmate responses will
             * also get the post the student just saved to the server.
             */
            _this3.getClassmateResponses();
          } else {
            /*
             * the classmate responses are not gated or have already been retrieved
             * which means they are already being displayed. we just need to add the
             * new response in this case.
             */

            // add the component state to our collection of class responses
            _this3.addClassResponse(componentState);
          }

          _this3.disableComponentIfNecessary();

          // send the student post to web sockets so all the classmates receive it in real time
          var messageType = 'studentData';
          componentState.userNamesArray = _this3.ConfigService.getUserNamesByWorkgroupId(componentState.workgroupId);

          _this3.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, componentState);

          // next, send notifications to students who have posted a response in the same thread as this post
          var studentData = componentState.studentData;
          if (studentData != null && _this3.responsesMap != null) {
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
            if (componentStateIdReplyingTo != null) {
              // populate fields of the notification
              var fromWorkgroupId = componentState.workgroupId;
              var notificationType = 'DiscussionReply';
              var nodeId = componentState.nodeId;
              var componentId = componentState.componentId;
              // add the user names to the component state so we can display next to the response
              var userNamesArray = _this3.ConfigService.getUserNamesByWorkgroupId(fromWorkgroupId);
              var userNames = userNamesArray.map(function (obj) {
                return obj.name;
              }).join(', ');
              var notificationMessage = _this3.$translate('discussion.repliedToADiscussionYouWereIn', { userNames: userNames });

              var workgroupsNotifiedSoFar = []; // keep track of workgroups we've already notified, in case a workgroup posts twice on a thread we only want to notify once.
              // check if we have the component state that was replied to
              if (_this3.responsesMap[componentStateIdReplyingTo] != null) {
                var originalPostComponentState = _this3.responsesMap[componentStateIdReplyingTo];
                var toWorkgroupId = originalPostComponentState.workgroupId; // notify the workgroup who posted this reply
                if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId) {
                  var notification = _this3.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
                  _this3.NotificationService.saveNotificationToServer(notification).then(function (savedNotification) {
                    var messageType = 'notification';
                    _this3.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                  });
                  workgroupsNotifiedSoFar.push(toWorkgroupId); // make sure we don't notify this workgroup again.
                }

                // also notify repliers to this thread, if any.
                if (_this3.responsesMap[componentStateIdReplyingTo].replies != null) {
                  var replies = _this3.responsesMap[componentStateIdReplyingTo].replies;

                  for (var r = 0; r < replies.length; r++) {
                    var reply = replies[r];
                    var _toWorkgroupId = reply.workgroupId; // notify the workgroup who posted this reply
                    if (_toWorkgroupId != null && _toWorkgroupId != fromWorkgroupId && workgroupsNotifiedSoFar.indexOf(_toWorkgroupId) == -1) {
                      var _notification = _this3.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, _toWorkgroupId, notificationMessage);
                      _this3.NotificationService.saveNotificationToServer(_notification).then(function (savedNotification) {
                        var messageType = 'notification';
                        _this3.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
                      });
                      workgroupsNotifiedSoFar.push(_toWorkgroupId); // make sure we don't notify this workgroup again.
                    }
                  }
                }
              }
            }
          }
        }

        _this3.isSubmit = null;
      });
    }

    /**
     * Get the classmate responses
     */

  }, {
    key: 'getClassmateResponses',
    value: function getClassmateResponses() {
      var _this4 = this;

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
          _this4.setClassResponses(componentStates, annotations);
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
    key: 'submitButtonClicked',


    /**
     * Called when the student clicks the submit button
     */
    value: function submitButtonClicked() {
      this.isSubmit = true;
      this.disableComponentIfNecessary();
      this.$scope.submitbuttonclicked();
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      var _this5 = this;

      /*
       * set the dirty flag so we will know we need to save the
       * student work later
       */
      this.isDirty = true;

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {
        _this5.$scope.$emit('componentStudentDataChanged', { nodeId: _this5.nodeId, componentId: _this5.componentId, componentState: componentState });
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

        studentData.attachments = this.attachments;

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
    key: 'clearComponentValues',


    /**
     * Clear the component values so they aren't accidentally used again
     */
    value: function clearComponentValues() {

      // clear the student response
      this.studentResponse = '';

      // clear the new response input
      this.newResponse = '';

      // clear new attachments input
      this.attachments = [];

      // clear the component state id replying to
      this.componentStateIdReplyingTo = null;
    }
  }, {
    key: 'disableComponentIfNecessary',
    value: function disableComponentIfNecessary() {
      _get(DiscussionController.prototype.__proto__ || Object.getPrototypeOf(DiscussionController.prototype), 'disableComponentIfNecessary', this).call(this);
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.componentContent.connectedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            if (userNames.length > 0) {
              componentState.userNames = userNames.map(function (obj) {
                return obj.name;
              }).join(', ');
            } else if (componentState.userNamesArray != null) {
              componentState.userNames = componentState.userNamesArray.map(function (obj) {
                return obj.name;
              }).join(', ');
            }

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
    key: 'deletebuttonclicked',


    /**
     * The teacher has clicked the delete button to delete a post. We won't
     * actually delete the student work, we'll just create an inappropriate
     * flag annotation which prevents the students in the class from seeing
     * the post.
     * @param componentState the student component state the teacher wants to
     * delete.
     */
    value: function deletebuttonclicked(componentState) {
      var _this6 = this;

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
          var componentStates = _this6.DiscussionService.getPostsAssociatedWithWorkgroupId(_this6.componentId, _this6.workgroupId);

          // get the annotations for the component states
          var annotations = _this6.getInappropriateFlagAnnotationsByComponentStates(componentStates);

          // refresh the teacher view of the posts
          _this6.setClassResponses(componentStates, annotations);
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
        data.action = 'Undo Delete';

        // create the inappropriate flag annotation
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
  }]);

  return DiscussionController;
}(_componentController2.default);

DiscussionController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'DiscussionService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'StudentWebSocketService', 'UtilService', '$mdMedia'];

exports.default = DiscussionController;
//# sourceMappingURL=discussionController.js.map
