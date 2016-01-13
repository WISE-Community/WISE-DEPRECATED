'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodeService = require('../../services/nodeService2');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LabelService = function (_NodeService) {
    _inherits(LabelService, _NodeService);

    function LabelService(StudentDataService) {
        _classCallCheck(this, LabelService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LabelService).call(this));

        _this.StudentDataService = StudentDataService;
        return _this;
    }

    _createClass(LabelService, [{
        key: 'callFunction',
        value: function callFunction(node, component, functionName, functionParams, componentStates, nodeStates, componentEvents, nodeEvents) {
            var result = null;

            if (functionName === 'isCompleted') {
                result = this.isCompleted(component, componentStates, componentEvents, nodeEvents);
            } else if (functionName === 'wordCountCompare') {
                result = this.wordCountCompare(functionParams);
            }

            return result;
        }
    }, {
        key: 'wordCountCompare',
        value: function wordCountCompare(params) {
            var result = false;

            if (params != null) {
                var operator = params.operator;
                var count = params.count;
                var nodeVisits = params.nodeVisits;

                var latestNodeState = this.getLatestNodeState(nodeVisits);

                var wordCount = 0;

                if (latestNodeState != null) {
                    var response = latestNodeState.studentData;

                    if (response != null) {
                        wordCount = this.getWordCount(response);

                        if (operator === '<') {
                            if (wordCount < count) {
                                result = true;
                            }
                        } else if (operator === '>=') {
                            if (wordCount >= count) {
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        }
    }, {
        key: 'getWordCount',
        value: function getWordCount(response) {
            var wordCount = 0;

            if (response != null) {
                var regex = /\s+/gi;
                wordCount = response.trim().replace(regex, ' ').split(' ').length;
            }

            return wordCount;
        }
    }, {
        key: 'getStudentWorkAsHTML',
        value: function getStudentWorkAsHTML(componentState) {
            var studentWorkAsHTML = null;

            if (componentState != null && componentState.studentData != null) {
                var response = componentState.studentData.response;

                if (response != null) {
                    studentWorkAsHTML = '<p>' + response + '</p>';
                }

                var attachments = componentState.studentData.attachments;

                // TODO: make into directive and use in component displays as well
                if (attachments && attachments.length) {
                    studentWorkAsHTML += '<div class="component-content__actions" layout="row" layout-wrap="true">';
                    for (var a = 0; a < attachments.length; a++) {
                        var attachment = attachments[a];
                        studentWorkAsHTML += '<div class="component__attachment">' + '<img src="' + attachment.iconURL + '" alt="' + attachment.iconURL + '" class="component__attachment__content" />' + '</div>';
                    }
                    studentWorkAsHTML += '</div>';
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

                if (otherComponentType === 'OpenResponse') {
                    // the other component is an OpenResponse component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = this.StudentDataService.makeCopyOfJSONObject(studentData);

                    // set the student data into the new component state
                    componentState.studentData = studentDataCopy;
                } else if (otherComponentType === 'Planning') {
                    componentState.studentData = JSON.stringify(componentStateFromOtherComponent.studentNodes);
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

            if (componentStates != null && componentStates.length) {

                // get the last component state
                var l = componentStates.length - 1;
                var componentState = componentStates[l];

                var studentData = componentState.studentData;

                if (studentData != null) {
                    var response = studentData.response;

                    if (response) {
                        // there is a response so the component is completed
                        result = true;
                    }
                }
            }

            return result;
        }
    }]);

    return LabelService;
}(_nodeService2.default);

LabelService.$inject = ['StudentDataService'];

exports.default = LabelService;