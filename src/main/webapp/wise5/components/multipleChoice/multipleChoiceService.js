"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentService = _interopRequireDefault(require("../componentService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var MultipleChoiceService =
/*#__PURE__*/
function (_ComponentService) {
  _inherits(MultipleChoiceService, _ComponentService);

  function MultipleChoiceService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, MultipleChoiceService);

    return _possibleConstructorReturn(this, _getPrototypeOf(MultipleChoiceService).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(MultipleChoiceService, [{
    key: "getComponentTypeLabel",
    value: function getComponentTypeLabel() {
      return this.$translate('multipleChoice.componentTypeLabel');
    }
  }, {
    key: "createComponent",
    value: function createComponent() {
      var component = _get(_getPrototypeOf(MultipleChoiceService.prototype), "createComponent", this).call(this);

      component.type = 'MultipleChoice';
      component.choiceType = 'radio';
      component.choices = [];
      component.showFeedback = true;
      return component;
    }
    /**
     * Returns all possible criteria for this component.
     * @param component a MultipleChoice component
     */

  }, {
    key: "getPossibleTransitionCriteria",
    value: function getPossibleTransitionCriteria(nodeId, componentId, component) {
      var allPossibleTransitionCriteria = [];

      if (component.choiceType === 'radio') {
        // Go through all the choices
        for (var c = 0; c < component.choices.length; c++) {
          var choice = component.choices[c];
          var possibleTransitionCriteria = {
            'name': 'choiceChosen',
            'id': 'choiceChosen_' + choice.id,
            'params': {
              'nodeId': nodeId,
              'componentId': componentId,
              'choiceIds': [choice.id]
            },
            'userFriendlyDescription': this.$translate('multipleChoice.userChose', {
              choiceText: choice.text,
              choiceId: choice.id
            })
          };
          allPossibleTransitionCriteria.push(possibleTransitionCriteria);
        }
      } else if (component.choiceType === 'checkbox') {// TODO: implement meeee!
      }

      return allPossibleTransitionCriteria;
    }
    /**
     * Check if the student chose a specific choice
     * @param criteria the criteria object
     * @returns a boolean value whether the student chose the choice specified in the
     * criteria object
     */

  }, {
    key: "choiceChosen",
    value: function choiceChosen(criteria) {
      var nodeId = criteria.params.nodeId;
      var componentId = criteria.params.componentId;
      var constraintChoiceIds = criteria.params.choiceIds;
      var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

      if (latestComponentState != null) {
        var studentChoices = latestComponentState.studentData.studentChoices;
        var studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);
        return this.isChoicesSelected(studentChoiceIds, constraintChoiceIds);
      }

      return false;
    }
  }, {
    key: "isChoicesSelected",
    value: function isChoicesSelected(studentChoiceIds, constraintChoiceIds) {
      if (typeof constraintChoiceIds === 'string') {
        return studentChoiceIds.length === 1 && studentChoiceIds[0] === constraintChoiceIds;
      } else if (Array.isArray(constraintChoiceIds)) {
        if (studentChoiceIds.length === constraintChoiceIds.length) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = constraintChoiceIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var constraintChoiceId = _step.value;

              if (studentChoiceIds.indexOf(constraintChoiceId) === -1) {
                return false;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return true;
        }
      }

      return false;
    }
    /**
     * Get the student choice ids from the student choice objects
     * @param studentChoices an array of student choice objects. these objects contain
     * an id and text fields
     * @returns an array of choice id strings
     */

  }, {
    key: "getStudentChoiceIdsFromStudentChoiceObjects",
    value: function getStudentChoiceIdsFromStudentChoiceObjects(studentChoices) {
      var choiceIds = [];

      if (studentChoices != null) {
        // loop through all the student choice objects
        for (var c = 0; c < studentChoices.length; c++) {
          // get a student choice object
          var studentChoice = studentChoices[c];

          if (studentChoice != null) {
            // get the student choice id
            var studentChoiceId = studentChoice.id;
            choiceIds.push(studentChoiceId);
          }
        }
      }

      return choiceIds;
    }
  }, {
    key: "isCompleted",
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton; // loop through all the component states

        for (var c = 0, l = componentStates.length; c < l; c++) {
          // the component state
          var componentState = componentStates[c]; // get the student data from the component state

          var studentData = componentState.studentData;

          if (studentData != null) {
            var studentChoices = studentData.studentChoices;

            if (studentChoices != null) {
              // there is a student choice so the component has saved work
              if (submitRequired) {
                // completion requires a submission, so check for isSubmit
                if (componentState.isSubmit) {
                  result = true;
                  break;
                }
              } else {
                result = true;
                break;
              }
            }
          }
        }
      }

      return result;
    }
  }, {
    key: "getStudentDataString",

    /**
     * Get the human readable student data string
     * @param componentState the component state
     * @return a human readable student data string
     */
    value: function getStudentDataString(componentState) {
      var studentDataString = '';

      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {
          // get the choices the student chose
          var studentChoices = studentData.studentChoices;

          if (studentChoices != null) {
            // loop through all the choices the student chose
            for (var c = 0; c < studentChoices.length; c++) {
              var studentChoice = studentChoices[c];

              if (studentChoice != null) {
                // get the choice text
                var text = studentChoice.text;

                if (text != null) {
                  if (studentDataString != '') {
                    // separate the choices with a comma
                    studentDataString += ', ';
                  } // append the choice text


                  studentDataString += text;
                }
              }
            }
          }
        }
      }

      return studentDataString;
    }
  }, {
    key: "componentStateHasStudentWork",
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {
          var studentChoices = studentData.studentChoices;

          if (studentChoices != null && studentChoices.length > 0) {
            return true;
          }
        }
      }

      return false;
    }
  }, {
    key: "componentHasCorrectAnswer",
    value: function componentHasCorrectAnswer(component) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = component.choices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var choice = _step2.value;

          if (choice.isCorrect) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    }
  }]);

  return MultipleChoiceService;
}(_componentService["default"]);

MultipleChoiceService.$inject = ['$filter', 'StudentDataService', 'UtilService'];
var _default = MultipleChoiceService;
exports["default"] = _default;
//# sourceMappingURL=multipleChoiceService.js.map
