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
    if (_this.ConfigService != null && _this.ConfigService.getMode() == 'classroomMonitor') {
      // in the classroom monitor, we need access to the TeacherDataService so it can retrieve posts and replies for all students
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
    key: 'populateComponentState',
    value: function populateComponentState(componentStateFromOtherComponent, otherComponentType) {
      var componentState = null;

      if (componentStateFromOtherComponent != null && otherComponentType != null) {
        componentState = StudentDataService.createComponentState();

        if (otherComponentType === 'OpenResponse') {
          componentState.studentData = componentStateFromOtherComponent.studentData;
        }
      }

      return componentState;
    }
  }, {
    key: 'getClassmateResponses',
    value: function getClassmateResponses(runId, periodId, nodeId, componentId) {

      if (runId != null && periodId != null && nodeId != null && componentId != null) {
        return this.$q(angular.bind(this, function (resolve, reject) {

          var httpParams = {};
          httpParams.method = 'GET';
          httpParams.url = this.ConfigService.getConfigParam('studentDataURL');

          var params = {};
          params.runId = runId;
          params.periodId = periodId;
          params.nodeId = nodeId;
          params.componentId = componentId;
          params.getStudentWork = true;
          params.getAnnotations = true;
          httpParams.params = params;

          this.$http(httpParams).then(angular.bind(this, function (result) {
            var classmateData = result.data;

            //console.log(classmateData);

            resolve(classmateData);
          }));
        }));
      }
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

            if (connectedComponent.type == 'showWork') {
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

          if (nodeEvent.event == 'nodeEntered') {
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

    /**
     * Get all the posts associated with a workgroup id. This will
     * get all the posts and replies that the workgroup posted
     * or replied to as well as all the other replies classmates made.
     * @param componentId the component id
     * @param workgroupId the workgroup id
     * @returns an array containing all the component states for
     * top level posts and replies that are associated with the
     * workgroup
     */

  }, {
    key: 'getPostsAssociatedWithWorkgroupId',
    value: function getPostsAssociatedWithWorkgroupId(componentId, workgroupId) {
      var allPosts = [];

      var topLevelComponentIdsFound = [];

      // get all the component states for the workgroup id
      var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId);

      if (componentStates != null) {

        // loop through all the component states
        for (var c = 0; c < componentStates.length; c++) {

          var componentState = componentStates[c];

          if (componentState != null) {
            var studentData = componentState.studentData;

            if (studentData != null) {
              if (studentData.componentStateIdReplyingTo == null) {

                // check if we have already added the top level post
                if (topLevelComponentIdsFound.indexOf(componentState.id) == -1) {
                  // we haven't found the top level post yet so

                  /*
                   * the component state is a top level post so we will
                   * get the post and all the replies to the post
                   */
                  allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, componentState.id));

                  topLevelComponentIdsFound.push(componentState.id);
                }
              } else {

                // check if we have already added the top level post
                if (topLevelComponentIdsFound.indexOf(studentData.componentStateIdReplyingTo) == -1) {
                  // we haven't found the top level post yet so

                  /*
                   * the component state is a reply so we will get the
                   * top level post and all the replies to it
                   */
                  allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, studentData.componentStateIdReplyingTo));

                  topLevelComponentIdsFound.push(studentData.componentStateIdReplyingTo);
                }
              }
            }
          }
        }
      }

      return allPosts;
    }

    /**
     * Get the top level post and all the replies to it
     * @param componentId the component id
     * @param componentStateId the component state id
     * @returns an array containing the top level post and all the replies
     */

  }, {
    key: 'getPostAndAllReplies',
    value: function getPostAndAllReplies(componentId, componentStateId) {
      var postAndAllReplies = [];

      // get all the component states for the node
      var componentStatesForNodeId = this.TeacherDataService.getComponentStatesByComponentId(componentId);

      for (var c = 0; c < componentStatesForNodeId.length; c++) {
        var tempComponentState = componentStatesForNodeId[c];

        if (tempComponentState != null) {
          if (componentStateId === tempComponentState.id) {
            // we have found the top level post
            postAndAllReplies.push(tempComponentState);
          } else {
            // check if the component state is a reply to the post we are looking for
            var studentData = tempComponentState.studentData;

            if (studentData != null) {
              var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

              if (componentStateIdReplyingTo != null) {
                if (componentStateId === componentStateIdReplyingTo) {
                  // this is a reply to the post we are looking for
                  postAndAllReplies.push(tempComponentState);
                }
              }
            }
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

      if (componentState != null) {

        var studentData = componentState.studentData;

        if (studentData != null) {

          // get the response from the student data
          var response = studentData.response;

          if (componentContent == null) {
            // the component content was not provided

            if (response != null && response !== '') {
              // the student has work
              return true;
            }
          } else {
            // the component content was provided

            var starterSentence = componentContent.starterSentence;

            if (starterSentence == null || starterSentence === '') {
              // there is no starter sentence

              if (response != null && response !== '') {
                // the student has work
                return true;
              }
            } else {
              /*
               * there is a starter sentence so we will compare it
               * with the student response
               */

              if (response != null && response !== '' && response !== starterSentence) {
                /*
                 * the student has a response that is different than
                 * the starter sentence
                 */
                return true;
              }
            }
          }
        }
      }

      return false;
    }
  }]);

  return DiscussionService;
}(_componentService2.default);

DiscussionService.$inject = ['$filter', '$http', '$rootScope', '$q', '$injector', 'ConfigService', 'StudentDataService', 'UtilService'];

exports.default = DiscussionService;
//# sourceMappingURL=discussionService.js.map
