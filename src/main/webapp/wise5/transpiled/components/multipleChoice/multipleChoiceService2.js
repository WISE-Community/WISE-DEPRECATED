'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultipleChoiceService = function (_NodeService) {
    _inherits(MultipleChoiceService, _NodeService);

    function MultipleChoiceService(StudentDataService) {
        _classCallCheck(this, MultipleChoiceService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MultipleChoiceService).call(this));

        _this.StudentDataService = StudentDataService;
        return _this;
    }

    /**
     * Determine if the student has fulfilled the function requirements
     * @param component the component content
     * @param functionName the function name to call
     * @param functionParams the parameters for the function
     * @param componentStates the component states for the component
     * @param componentEvents the component events for the component
     * @param nodeEvents the node events for the parent of the component
     * @returns whether the student has fulfilled the function requirements
     */

    _createClass(MultipleChoiceService, [{
        key: 'callFunction',
        value: function callFunction(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            if (functionName === 'choiceChosen') {
                result = this.choiceChosen(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents);
            }

            return result;
        }
    }, {
        key: 'choiceChosen',

        /**
         * Check if the student chose a specific choice
         * @param criteria the criteria object
         * @returns a boolean value whether the student chose the choice specified in the
         * criteria object
         */
        value: function choiceChosen(criteria) {

            var result = false;

            if (criteria != null) {
                var nodeId = criteria.nodeId;
                var componentId = criteria.componentId;
                var functionName = criteria.functionName;
                var functionParams = criteria.functionParams;

                if (nodeId != null && componentId != null) {

                    // get the component states
                    var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(nodeId, componentId);

                    if (componentStates != null && componentStates.length > 0) {

                        // get the choice ids that we expect the student to have chose
                        var choiceIds = functionParams.choiceIds;

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
        key: 'getStudentWorkAsHTML',
        value: function getStudentWorkAsHTML(nodeState) {
            var studentWorkAsHTML = null;

            if (nodeState != null) {
                var response = nodeState.response;

                if (response != null) {
                    studentWorkAsHTML = '';

                    for (var x = 0; x < response.length; x++) {
                        var choice = response[x];

                        if (choice != null) {
                            var text = choice.text;

                            if (studentWorkAsHTML != '') {
                                studentWorkAsHTML += '<br/>';
                            }

                            studentWorkAsHTML += text;
                        }
                    }
                }
            }

            return studentWorkAsHTML;
        }
    }, {
        key: 'populateComponentState',

        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */
        value: function populateComponentState(componentStateFromOtherComponent) {
            var componentState = null;

            if (componentStateFromOtherComponent != null) {

                // create an empty component state
                componentState = this.StudentDataService.createComponentState();

                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;

                if (otherComponentType === 'MultipleChoice') {
                    // the other component is an MultipleChoice component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = this.StudentDataService.makeCopyOfJSONObject(studentData);

                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                }
            }

            return componentState;
        }
    }, {
        key: 'isCompleted',

        /**
         * Check if the component was completed
         * @param component the component object
         * @param componentStates the component states for the specific component
         * @param componentEvents the events for the specific component
         * @param nodeEvents the events for the parent node of the component
         * @returns whether the component was completed
         */
        value: function isCompleted(component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            if (componentStates != null) {

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    // the component state
                    var componentState = componentStates[c];

                    // get the student data from the component state
                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        var studentChoices = studentData.studentChoices;

                        if (studentChoices != null) {
                            // there is a student choice so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        }
    }]);

    return MultipleChoiceService;
}(_nodeService2.default);

MultipleChoiceService.$inject = ['StudentDataService'];

exports.default = MultipleChoiceService;