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

var MultipleChoiceService = function (_ComponentService) {
  _inherits(MultipleChoiceService, _ComponentService);

  function MultipleChoiceService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, MultipleChoiceService);

    return _possibleConstructorReturn(this, (MultipleChoiceService.__proto__ || Object.getPrototypeOf(MultipleChoiceService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(MultipleChoiceService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('multipleChoice.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(MultipleChoiceService.prototype.__proto__ || Object.getPrototypeOf(MultipleChoiceService.prototype), 'createComponent', this).call(this);
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
    key: 'getPossibleTransitionCriteria',
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
            'userFriendlyDescription': this.$translate('multipleChoice.userChose', { choiceText: choice.text, choiceId: choice.id })
          };
          allPossibleTransitionCriteria.push(possibleTransitionCriteria);
        }
      } else if (component.choiceType === 'checkbox') {
        // TODO: implement meeee!
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
    key: 'choiceChosen',
    value: function choiceChosen(criteria) {

      var result = false;

      if (criteria != null && criteria.params != null) {
        var nodeId = criteria.params.nodeId;
        var componentId = criteria.params.componentId;
        var choiceIds = criteria.params.choiceIds; // the choice ids that we expect the student to have chosen

        if (nodeId != null && componentId != null) {

          // get the component states
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

          if (componentStates != null && componentStates.length > 0) {

            if (choiceIds != null) {
              // get the latest component state
              var componentState = componentStates[componentStates.length - 1];

              // get the student data
              var studentData = componentState.studentData;

              if (studentData != null) {

                // get the choice(s) the student chose
                var studentChoices = studentData.studentChoices;

                if (studentChoices != null) {

                  if (studentChoices.length === choiceIds.length) {
                    /*
                     * the number of choices the student chose do match so the student may
                     * have matched the choices. we will now need to compare each of the
                     * choice ids to make sure the student chose the ones that are required
                     */

                    var studentChoiceIds = this.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices);

                    for (var c = 0; c < choiceIds.length; c++) {
                      var choiceId = choiceIds[c];

                      if (studentChoiceIds.indexOf(choiceId) === -1) {
                        /*
                         * the required choice id is not in the student choices so the student
                         * did not match all the choices
                         */
                        result = false;
                        break;
                      } else {
                        // the required choice id is in the student choices
                        result = true;
                      }
                    }
                  } else {
                    /*
                     * the number of choices the student chose do not match so the student did
                     * not match the choices
                     */

                    result = false;
                  }
                }
              }
            }
          }
        }
      }

      return result;
    }
  }, {
    key: 'getStudentChoiceIdsFromStudentChoiceObjects',


    /**
     * Get the student choice ids from the student choice objects
     * @param studentChoices an array of student choice objects. these objects contain
     * an id and text fields
     * @returns an array of choice id strings
     */
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
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        // loop through all the component states
        for (var c = 0, l = componentStates.length; c < l; c++) {

          // the component state
          var componentState = componentStates[c];

          // get the student data from the component state
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
    key: 'getStudentDataString',


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
                  }

                  // append the choice text
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
    key: 'componentStateHasStudentWork',
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
  }]);

  return MultipleChoiceService;
}(_componentService2.default);

MultipleChoiceService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = MultipleChoiceService;
//# sourceMappingURL=multipleChoiceService.js.map
