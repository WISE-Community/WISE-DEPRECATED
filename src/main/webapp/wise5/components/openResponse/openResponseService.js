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

var OpenResponseService = function (_ComponentService) {
  _inherits(OpenResponseService, _ComponentService);

  function OpenResponseService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, OpenResponseService);

    return _possibleConstructorReturn(this, (OpenResponseService.__proto__ || Object.getPrototypeOf(OpenResponseService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(OpenResponseService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('openResponse.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(OpenResponseService.prototype.__proto__ || Object.getPrototypeOf(OpenResponseService.prototype), 'createComponent', this).call(this);
      component.type = 'OpenResponse';
      component.starterSentence = null;
      component.isStudentAttachmentEnabled = false;
      return component;
    }
  }, {
    key: 'copyComponent',
    value: function copyComponent(componentToCopy) {
      var component = _get(OpenResponseService.prototype.__proto__ || Object.getPrototypeOf(OpenResponseService.prototype), 'copyComponent', this).call(this, componentToCopy);
      component.starterSentence = componentToCopy.starterSentence;
      component.isStudentAttachmentEnabled = componentToCopy.isStudentAttachmentEnabled;
      return component;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        if (submitRequired) {
          // completion requires a submission, so check for isSubmit in any component states
          for (var i = 0, l = componentStates.length; i < l; i++) {
            var state = componentStates[i];
            if (state.isSubmit && state.studentData) {
              // component state is a submission
              if (state.studentData.response) {
                // there is a response so the component is completed
                result = true;
                break;
              }
            }
          }
        } else {
          // get the last component state
          var _l = componentStates.length - 1;
          var componentState = componentStates[_l];

          var studentData = componentState.studentData;

          if (studentData != null) {
            if (studentData.response) {
              // there is a response so the component is completed
              result = true;
            }
          }
        }
      }

      if (component.completionCriteria != null) {
        /*
         * there is a special completion criteria authored in this component
         * so we will evaluate the completion criteria to see if the student
         * has completed this component
         */
        result = this.StudentDataService.isCompletionCriteriaSatisfied(component.completionCriteria);
      }

      return result;
    }
  }, {
    key: 'displayAnnotation',
    value: function displayAnnotation(componentContent, annotation) {
      if (annotation.displayToStudent === false) {
        return false;
      } else {
        if (annotation.type == 'score') {} else if (annotation.type == 'comment') {} else if (annotation.type == 'autoScore') {
          if (componentContent.cRater != null && !componentContent.cRater.showScore) {
            return false;
          } else if (componentContent.showAutoScore === false) {
            return false;
          }
        } else if (annotation.type == 'autoComment') {
          if (componentContent.cRater != null && !componentContent.cRater.showFeedback) {
            return false;
          } else if (componentContent.showAutoFeedback === false) {
            return false;
          }
        }
      }
      return true;
    }
  }, {
    key: 'getStudentDataString',
    value: function getStudentDataString(componentState) {
      return componentState.studentData.response;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (this.hasStarterSentence(componentContent)) {
        var response = componentState.studentData.response;
        var starterSentence = componentContent.starterSentence;
        return this.hasResponse(componentState) && response !== starterSentence;
      } else {
        return this.hasResponse(componentState);
      }
    }
  }, {
    key: 'hasStarterSentence',
    value: function hasStarterSentence(componentContent) {
      var starterSentence = componentContent.starterSentence;
      return starterSentence != null && starterSentence !== '';
    }
  }, {
    key: 'hasResponse',
    value: function hasResponse(componentState) {
      var response = componentState.studentData.response;
      return response != null && response !== '';
    }
  }]);

  return OpenResponseService;
}(_componentService2.default);

OpenResponseService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = OpenResponseService;
//# sourceMappingURL=openResponseService.js.map
