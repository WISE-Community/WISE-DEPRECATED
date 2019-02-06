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
    _this.studentResponse = '';
    _this.newResponse = '';
    _this.classResponses = [];
    _this.topLevelResponses = [];
    _this.responsesMap = {};
    _this.retrievedClassmateResponses = false;
    if (_this.isStudentMode()) {
      if (_this.ConfigService.isPreview()) {
        var componentStates = null;
        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          // assume there can only be one connected component
          var connectedComponent = _this.componentContent.connectedComponents[0];
          componentStates = _this.StudentDataService.getComponentStatesByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
        } else {
          componentStates = _this.StudentDataService.getComponentStatesByNodeIdAndComponentId(_this.nodeId, _this.componentId);
        }
        _this.setClassResponses(componentStates);
      } else {
        if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
          // assume there can only be one connected component
          var _connectedComponent = _this.componentContent.connectedComponents[0];
          _this.getClassmateResponses(_connectedComponent.nodeId, _connectedComponent.componentId);
        } else {
          if (_this.isClassmateResponsesGated()) {
            var componentState = _this.$scope.componentState;
            if (_this.DiscussionService.componentStateHasStudentWork(componentState, _this.componentContent)) {
              _this.getClassmateResponses();
            }
          } else {
            _this.getClassmateResponses();
          }
        }
      }
      _this.disableComponentIfNecessary();
    } else if (_this.isGradingMode() || _this.isGradingRevisionMode()) {
      var _componentStates = _this.DiscussionService.getPostsAssociatedWithWorkgroupId(_this.componentId, _this.workgroupId);
      var annotations = _this.getInappropriateFlagAnnotationsByComponentStates(_componentStates);
      _this.setClassResponses(_componentStates, annotations);
    }
    _this.initializeScopeSubmitButtonClicked();
    _this.initializeScopeGetComponentState();
    _this.initializeScopeStudentDataChanged();
    _this.registerWebSocketMessageReceivedListener();
    _this.initializeWatchMdMedia();
    _this.broadcastDoneRenderingComponent();
    return _this;
  }

  _createClass(DiscussionController, [{
    key: 'initializeScopeSubmitButtonClicked',
    value: function initializeScopeSubmitButtonClicked() {
      var _this2 = this;

      this.$scope.submitbuttonclicked = function (componentStateReplyingTo) {
        if (componentStateReplyingTo && componentStateReplyingTo.replyText) {
          var componentState = componentStateReplyingTo;
          var componentStateId = componentState.id;
          _this2.$scope.discussionController.studentResponse = componentState.replyText;
          _this2.$scope.discussionController.componentStateIdReplyingTo = componentStateId;
          _this2.$scope.discussionController.isSubmit = true;
          _this2.$scope.discussionController.isDirty = true;
          componentStateReplyingTo.replyText = null;
        } else {
          _this2.$scope.discussionController.studentResponse = _this2.$scope.discussionController.newResponse;
          _this2.$scope.discussionController.isSubmit = true;
        }
        if (_this2.isAuthoringMode()) {
          _this2.createComponentState('submit');
        }
        _this2.$scope.$emit('componentSubmitTriggered', {
          nodeId: _this2.$scope.discussionController.nodeId,
          componentId: _this2.$scope.discussionController.componentId
        });
      };
    }
  }, {
    key: 'initializeScopeGetComponentState',
    value: function initializeScopeGetComponentState() {
      var _this3 = this;

      this.$scope.getComponentState = function () {
        var deferred = _this3.$q.defer();
        if (_this3.$scope.discussionController.isDirty && _this3.$scope.discussionController.isSubmit) {
          var action = 'submit';
          _this3.$scope.discussionController.createComponentState(action).then(function (componentState) {
            _this3.$scope.discussionController.clearComponentValues();
            _this3.$scope.discussionController.isDirty = false;
            deferred.resolve(componentState);
          });
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      };
    }
  }, {
    key: 'initializeScopeStudentDataChanged',
    value: function initializeScopeStudentDataChanged() {
      var _this4 = this;

      this.$scope.studentdatachanged = function () {
        _this4.$scope.discussionController.studentDataChanged();
      };
    }
  }, {
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      var _this5 = this;

      this.$scope.$on('studentWorkSavedToServer', function (event, args) {
        var componentState = args.studentWork;
        if (componentState && _this5.nodeId === componentState.nodeId && _this5.componentId === componentState.componentId) {
          if (_this5.isClassmateResponsesGated() && !_this5.retrievedClassmateResponses) {
            _this5.getClassmateResponses();
          } else {
            _this5.addClassResponse(componentState);
          }
          _this5.disableComponentIfNecessary();
          _this5.sendPostToClassmatesInPeriod(componentState);
          _this5.sendPostToStudentsInThread(componentState);
        }
        _this5.isSubmit = null;
      });
    }
  }, {
    key: 'sendPostToClassmatesInPeriod',
    value: function sendPostToClassmatesInPeriod(componentState) {
      var messageType = 'studentData';
      componentState.userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(componentState.workgroupId);
      this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, componentState);
    }
  }, {
    key: 'sendPostToStudentsInThread',
    value: function sendPostToStudentsInThread(componentState) {
      var studentData = componentState.studentData;
      if (studentData != null && this.responsesMap != null) {
        var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
        if (componentStateIdReplyingTo != null) {
          var fromWorkgroupId = componentState.workgroupId;
          var notificationType = 'DiscussionReply';
          var nodeId = componentState.nodeId;
          var componentId = componentState.componentId;
          var userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(fromWorkgroupId);
          var userNames = userNamesArray.map(function (obj) {
            return obj.name;
          }).join(', ');
          var notificationMessage = this.$translate('discussion.repliedToADiscussionYouWereIn', { userNames: userNames });
          var workgroupsNotifiedSoFar = [];
          if (this.responsesMap[componentStateIdReplyingTo] != null) {
            this.sendPostToThreadCreator(componentStateIdReplyingTo, notificationType, nodeId, componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar);
            this.sendPostToThreadRepliers(componentStateIdReplyingTo, notificationType, nodeId, componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar);
          }
        }
      }
    }
  }, {
    key: 'sendPostToThreadCreator',
    value: function sendPostToThreadCreator(componentStateIdReplyingTo, notificationType, nodeId, componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar) {
      var _this6 = this;

      var originalPostComponentState = this.responsesMap[componentStateIdReplyingTo];
      var toWorkgroupId = originalPostComponentState.workgroupId;
      if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId) {
        var notification = this.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
        this.NotificationService.saveNotificationToServer(notification).then(function (savedNotification) {
          var messageType = 'notification';
          _this6.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
        });
        workgroupsNotifiedSoFar.push(toWorkgroupId);
      }
    }
  }, {
    key: 'sendPostToThreadRepliers',
    value: function sendPostToThreadRepliers(componentStateIdReplyingTo, notificationType, nodeId, componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar) {
      var _this7 = this;

      if (this.responsesMap[componentStateIdReplyingTo].replies != null) {
        var replies = this.responsesMap[componentStateIdReplyingTo].replies;
        for (var r = 0; r < replies.length; r++) {
          var reply = replies[r];
          var toWorkgroupId = reply.workgroupId;
          if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId && workgroupsNotifiedSoFar.indexOf(toWorkgroupId) == -1) {
            var notification = this.NotificationService.createNewNotification(notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
            this.NotificationService.saveNotificationToServer(notification).then(function (savedNotification) {
              var messageType = 'notification';
              _this7.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
            });
            workgroupsNotifiedSoFar.push(toWorkgroupId);
          }
        }
      }
    }
  }, {
    key: 'registerWebSocketMessageReceivedListener',
    value: function registerWebSocketMessageReceivedListener() {
      var _this8 = this;

      this.$rootScope.$on('webSocketMessageReceived', function (event, args) {
        var data = args.data;
        var componentState = data.data;
        if (componentState.nodeId === _this8.nodeId && componentState.componentId === _this8.componentId) {
          var componentStateWorkgroupId = componentState.workgroupId;
          var workgroupId = _this8.ConfigService.getWorkgroupId();
          if (workgroupId !== componentStateWorkgroupId) {
            if (_this8.retrievedClassmateResponses) {
              _this8.addClassResponse(componentState);
            }
          }
        }
      });
    }
  }, {
    key: 'initializeWatchMdMedia',
    value: function initializeWatchMdMedia() {
      var _this9 = this;

      this.$scope.$watch(function () {
        return _this9.$mdMedia('gt-sm');
      }, function (md) {
        _this9.$scope.mdScreen = md;
      });
    }
  }, {
    key: 'getClassmateResponses',
    value: function getClassmateResponses() {
      var _this10 = this;

      var nodeId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.nodeId;
      var componentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.componentId;

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      this.DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then(function (result) {
        if (result != null) {
          var componentStates = result.studentWorkList;
          var annotations = result.annotations;
          _this10.setClassResponses(componentStates, annotations);
        }
      });
    }
  }, {
    key: 'submitButtonClicked',
    value: function submitButtonClicked() {
      this.isSubmit = true;
      this.disableComponentIfNecessary();
      this.$scope.submitbuttonclicked();
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      var _this11 = this;

      this.isDirty = true;
      var action = 'change';
      this.createComponentState(action).then(function (componentState) {
        _this11.$scope.$emit('componentStudentDataChanged', { nodeId: _this11.nodeId, componentId: _this11.componentId, componentState: componentState });
      });
    }

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {
        response: this.studentResponse,
        attachments: this.attachments
      };
      if (this.componentStateIdReplyingTo != null) {
        studentData.componentStateIdReplyingTo = this.componentStateIdReplyingTo;
      }
      componentState.studentData = studentData;
      componentState.componentType = 'Discussion';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      if (this.ConfigService.isPreview() && !this.componentStateIdReplyingTo || this.mode === 'authoring') {
        componentState.id = this.UtilService.generateKey();
      }
      if (this.isSubmit) {
        componentState.studentData.isSubmit = this.isSubmit;
        this.isSubmit = false;
        if (this.mode === 'authoring') {
          if (this.StudentDataService.studentData == null) {
            this.StudentDataService.studentData = {};
            this.StudentDataService.studentData.componentStates = [];
          }
          this.StudentDataService.studentData.componentStates.push(componentState);
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
          this.setClassResponses(componentStates);
          this.clearComponentValues();
          this.isDirty = false;
        }
      }
      var deferred = this.$q.defer();
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }
  }, {
    key: 'clearComponentValues',
    value: function clearComponentValues() {
      this.studentResponse = '';
      this.newResponse = '';
      this.attachments = [];
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
    value: function showSaveButton() {
      return this.componentContent.showSaveButton;
    }
  }, {
    key: 'showSubmitButton',
    value: function showSubmitButton() {
      return this.componentContent.showSubmitButton;
    }
  }, {
    key: 'isClassmateResponsesGated',
    value: function isClassmateResponsesGated() {
      return this.componentContent.gateClassmateResponses;
    }
  }, {
    key: 'setClassResponses',
    value: function setClassResponses(componentStates, annotations) {
      this.classResponses = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = componentStates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var componentState = _step2.value;

          if (componentState.studentData.isSubmit) {
            var workgroupId = componentState.workgroupId;
            var latestInappropriateFlagAnnotation = this.getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, componentState.id);
            var userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
            componentState.userNames = userNames.map(function (obj) {
              return obj.name;
            }).join(', ');
            componentState.replies = [];
            if (this.isGradingMode() || this.isGradingRevisionMode()) {
              if (latestInappropriateFlagAnnotation != null) {
                /*
                 * Set the inappropriate flag annotation into the component state. This is used for the
                 * grading tool to determine whether to show the 'Delete' button or the 'Undo Delete'
                 * button.
                 */
                componentState.latestInappropriateFlagAnnotation = latestInappropriateFlagAnnotation;
              }
              this.classResponses.push(componentState);
            } else if (this.isStudentMode()) {
              if (latestInappropriateFlagAnnotation != null && latestInappropriateFlagAnnotation.data != null && latestInappropriateFlagAnnotation.data.action == 'Delete') {
                // do not show this post because the teacher has deleted it
              } else {
                this.classResponses.push(componentState);
              }
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

      this.processResponses(this.classResponses);
      this.retrievedClassmateResponses = true;
    }
  }, {
    key: 'getLatestInappropriateFlagAnnotationByStudentWorkId',
    value: function getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, studentWorkId) {
      if (annotations != null) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = annotations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var annotation = _step3.value;

            if (studentWorkId == annotation.studentWorkId && annotation.type == 'inappropriateFlag') {
              return annotation;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return null;
    }
  }, {
    key: 'processResponses',
    value: function processResponses(componentStates) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = componentStates[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var componentState = _step4.value;

          this.responsesMap[componentState.id] = componentState;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = componentStates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _componentState = _step5.value;

          if (_componentState && _componentState.studentData) {
            var studentData = _componentState.studentData;
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
            if (componentStateIdReplyingTo) {
              if (this.responsesMap[componentStateIdReplyingTo] && this.responsesMap[componentStateIdReplyingTo].replies) {
                this.responsesMap[componentStateIdReplyingTo].replies.push(_componentState);
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      this.topLevelResponses = this.getLevel1Responses();
    }
  }, {
    key: 'addClassResponse',
    value: function addClassResponse(componentState) {
      if (componentState.studentData.isSubmit) {
        var workgroupId = componentState.workgroupId;
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
        componentState.replies = [];
        this.classResponses.push(componentState);
        this.responsesMap[componentState.id] = componentState;
        var componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
        if (componentStateIdReplyingTo != null) {
          if (this.responsesMap[componentStateIdReplyingTo] != null && this.responsesMap[componentStateIdReplyingTo].replies != null) {
            this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
          }
        }
        this.topLevelResponses = this.getLevel1Responses();
      }
    }
  }, {
    key: 'getClassResponses',
    value: function getClassResponses() {
      return this.classResponses;
    }

    /**
     * Get the level 1 responses which are posts that are not a
     * reply to another response.
     * @return an array of responses that are not a reply to another
     * response
     */

  }, {
    key: 'getLevel1Responses',
    value: function getLevel1Responses() {
      var level1Responses = [];
      var classResponses = this.classResponses;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = classResponses[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var classResponse = _step6.value;

          var componentStateIdReplyingTo = classResponse.studentData.componentStateIdReplyingTo;
          if (componentStateIdReplyingTo == null) {
            /*
             * this response was not a reply to another post so it is a
             * level 1 response
             */
            level1Responses.push(classResponse);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return level1Responses;
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
      var _this12 = this;

      var toWorkgroupId = componentState.workgroupId;
      var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);
      var periodId = userInfo.periodId;
      var teacherUserInfo = this.ConfigService.getMyUserInfo();
      var fromWorkgroupId = teacherUserInfo.workgroupId;
      var runId = this.ConfigService.getRunId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var studentWorkId = componentState.id;
      var data = {
        action: 'Delete'
      };
      var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);
      this.AnnotationService.saveAnnotation(annotation).then(function () {
        var componentStates = _this12.DiscussionService.getPostsAssociatedWithWorkgroupId(_this12.componentId, _this12.workgroupId);
        var annotations = _this12.getInappropriateFlagAnnotationsByComponentStates(componentStates);
        _this12.setClassResponses(componentStates, annotations);
      });
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
      var _this13 = this;

      var toWorkgroupId = componentState.workgroupId;
      var userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);
      var periodId = userInfo.periodId;
      var teacherUserInfo = this.ConfigService.getMyUserInfo();
      var fromWorkgroupId = teacherUserInfo.workgroupId;
      var runId = this.ConfigService.getRunId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var studentWorkId = componentState.id;
      var data = {
        action: 'Undo Delete'
      };
      var annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);
      this.AnnotationService.saveAnnotation(annotation).then(function () {
        var componentStates = _this13.DiscussionService.getPostsAssociatedWithWorkgroupId(_this13.componentId, _this13.workgroupId);
        var annotations = _this13.getInappropriateFlagAnnotationsByComponentStates(componentStates);
        _this13.setClassResponses(componentStates, annotations);
      });
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
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = componentStates[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var componentState = _step7.value;

            var latestInappropriateFlagAnnotation = this.AnnotationService.getLatestAnnotationByStudentWorkIdAndType(componentState.id, 'inappropriateFlag');
            if (latestInappropriateFlagAnnotation != null) {
              annotations.push(latestInappropriateFlagAnnotation);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }
      return annotations;
    }
  }]);

  return DiscussionController;
}(_componentController2.default);

DiscussionController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'DiscussionService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'StudentWebSocketService', 'UtilService', '$mdMedia'];

exports.default = DiscussionController;
//# sourceMappingURL=discussionController.js.map
