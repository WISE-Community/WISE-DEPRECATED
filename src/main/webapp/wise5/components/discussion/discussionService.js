'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentService = require('../componentService');

var _componentService2 = _interopRequireDefault(_componentService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DiscussionService = function (_ComponentService) {
  _inherits(DiscussionService, _ComponentService);

  function DiscussionService($filter, $http, $rootScope, $q, $injector, ConfigService, StudentDataService, UtilService) {
    _classCallCheck(this, DiscussionService);

    var _this = _possibleConstructorReturn(this, (DiscussionService.__proto__ || Object.getPrototypeOf(DiscussionService)).call(this, $filter, StudentDataService, UtilService));

    _this.$http = $http;
    _this.$rootScope = $rootScope;
    _this.$q = $q;
    _this.$injector = $injector;
    _this.ConfigService = ConfigService;
    if (_this.ConfigService.getMode() === 'classroomMonitor') {
      /*
       * In the Classroom Monitor, we need access to the TeacherDataService so we can retrieve posts
       * for all students.
       */
      _this.TeacherDataService = _this.$injector.get('TeacherDataService');
    }
    return _this;
  }

  _createClass(DiscussionService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('discussion.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(DiscussionService.prototype.__proto__ || Object.getPrototypeOf(DiscussionService.prototype), 'createComponent', this).call(this);
      component.type = 'Discussion';
      component.prompt = this.$translate('ENTER_PROMPT_HERE');
      component.isStudentAttachmentEnabled = true;
      component.gateClassmateResponses = true;
      return component;
    }
  }, {
    key: 'getClassmateResponses',
    value: function getClassmateResponses(runId, periodId, components) {
      var _this2 = this;

      return this.$q(function (resolve, reject) {
        var params = {
          runId: runId,
          periodId: periodId,
          components: components,
          getStudentWork: true,
          getAnnotations: true
        };
        var httpParams = {
          method: 'GET',
          url: _this2.ConfigService.getConfigParam('studentDataURL'),
          params: params
        };
        _this2.$http(httpParams).then(function (result) {
          resolve(result.data);
        });
      });
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents) {
      if (this.hasShowWorkConnectedComponentThatHasWork(component)) {
        if (this.hasNodeEnteredEvent(nodeEvents)) {
          return true;
        }
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var componentState = _step.value;

            if (componentState.studentData.response != null) {
              return true;
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
      return false;
    }
  }, {
    key: 'hasShowWorkConnectedComponentThatHasWork',
    value: function hasShowWorkConnectedComponentThatHasWork(componentContent) {
      var connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = connectedComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var connectedComponent = _step2.value;

            if (connectedComponent.type === 'showWork') {
              var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(connectedComponent.nodeId, connectedComponent.componentId);
              if (componentStates.length > 0) {
                return true;
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
      }
      return false;
    }
  }, {
    key: 'hasNodeEnteredEvent',
    value: function hasNodeEnteredEvent(nodeEvents) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = nodeEvents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var nodeEvent = _step3.value;

          if (nodeEvent.event === 'nodeEntered') {
            return true;
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

      return false;
    }
  }, {
    key: 'workgroupHasWorkForComponent',
    value: function workgroupHasWorkForComponent(workgroupId, componentId) {
      return this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId).length > 0;
    }
  }, {
    key: 'getPostsAssociatedWithComponentIdsAndWorkgroupId',
    value: function getPostsAssociatedWithComponentIdsAndWorkgroupId(componentIds, workgroupId) {
      var allPosts = [];
      var topLevelComponentStateIdsFound = [];
      var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(workgroupId, componentIds);
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = componentStates[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var componentState = _step4.value;

          var componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
          if (this.isTopLevelPost(componentState)) {
            if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentState.id)) {
              allPosts = allPosts.concat(this.getPostAndAllRepliesByComponentIds(componentIds, componentState.id));
              topLevelComponentStateIdsFound.push(componentState.id);
            }
          } else {
            if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentStateIdReplyingTo)) {
              allPosts = allPosts.concat(this.getPostAndAllRepliesByComponentIds(componentIds, componentStateIdReplyingTo));
              topLevelComponentStateIdsFound.push(componentStateIdReplyingTo);
            }
          }
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

      return allPosts;
    }
  }, {
    key: 'isTopLevelPost',
    value: function isTopLevelPost(componentState) {
      return componentState.studentData.componentStateIdReplyingTo == null;
    }
  }, {
    key: 'isTopLevelComponentStateIdFound',
    value: function isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentStateId) {
      return topLevelComponentStateIdsFound.indexOf(componentStateId) !== -1;
    }
  }, {
    key: 'getPostAndAllRepliesByComponentIds',
    value: function getPostAndAllRepliesByComponentIds(componentIds, componentStateId) {
      var postAndAllReplies = [];
      var componentStatesForComponentIds = this.TeacherDataService.getComponentStatesByComponentIds(componentIds);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = componentStatesForComponentIds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var componentState = _step5.value;

          if (componentState.id === componentStateId) {
            postAndAllReplies.push(componentState);
          } else {
            var componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
            if (componentStateIdReplyingTo === componentStateId) {
              postAndAllReplies.push(componentState);
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

      return postAndAllReplies;
    }
  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return false;
    }
  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return false;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (this.isStudentWorkHasAttachment(componentState)) {
        return true;
      }
      if (this.isComponentHasStarterSentence(componentContent)) {
        return this.isStudentWorkHasText(componentState) && this.isStudentResponseDifferentFromStarterSentence(componentState, componentContent);
      } else {
        return this.isStudentWorkHasText(componentState);
      }
    }
  }, {
    key: 'isComponentHasStarterSentence',
    value: function isComponentHasStarterSentence(componentContent) {
      var starterSentence = componentContent.starterSentence;
      return starterSentence != null && starterSentence !== '';
    }
  }, {
    key: 'isStudentResponseDifferentFromStarterSentence',
    value: function isStudentResponseDifferentFromStarterSentence(componentState, componentContent) {
      var response = componentState.studentData.response;
      var starterSentence = componentContent.starterSentence;
      return response !== starterSentence;
    }
  }, {
    key: 'isStudentWorkHasText',
    value: function isStudentWorkHasText(componentState) {
      var response = componentState.studentData.response;
      return response != null && response !== '';
    }
  }, {
    key: 'isStudentWorkHasAttachment',
    value: function isStudentWorkHasAttachment(componentState) {
      var attachments = componentState.studentData.attachments;
      return attachments != null && attachments.length > 0;
    }
  }]);

  return DiscussionService;
}(_componentService2.default);

DiscussionService.$inject = ['$filter', '$http', '$rootScope', '$q', '$injector', 'ConfigService', 'StudentDataService', 'UtilService'];

exports.default = DiscussionService;
//# sourceMappingURL=discussionService.js.map
