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

var DrawService = function (_NodeService) {
    _inherits(DrawService, _NodeService);

    function DrawService(StudentDataService) {
        _classCallCheck(this, DrawService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DrawService).call(this));

        _this.StudentDataService = StudentDataService;
        return _this;
    }

    _createClass(DrawService, [{
        key: 'getStudentWorkJPEG',
        value: function getStudentWorkJPEG(componentState) {
            if (componentState != null) {
                var studentData = componentState.studentData;

                if (studentData != null && studentData.drawData != null) {
                    var drawData = JSON.parse(studentData.drawData);
                    if (drawData != null && drawData.jpeg != null && drawData.jpeg != "") {
                        return drawData.jpeg;
                    }
                }
            }
            return null;
        }
    }, {
        key: 'getStudentWorkAsHTML',
        value: function getStudentWorkAsHTML(componentState) {
            var studentWorkAsHTML = '<p>Your drawing</p>';

            if (componentState != null) {
                var studentData = componentState.studentData;

                if (studentData != null && studentData.drawData != null) {
                    var drawData = JSON.parse(studentData.drawData);
                    if (drawData != null && drawData.jpeg != null && drawData.jpeg != "") {
                        studentWorkAsHTML = '<img src=\"' + drawData.jpeg + '\"></img>';
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
                componentState = StudentDataService.createComponentState();

                // get the component type of the other component state
                var otherComponentType = componentStateFromOtherComponent.componentType;

                if (otherComponentType === 'Draw') {
                    // the other component is an Draw component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = StudentDataService.makeCopyOfJSONObject(studentData);

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
                        var drawData = studentData.drawData;

                        if (drawData != null) {
                            // there is draw data so the component is completed
                            result = true;
                            break;
                        }
                    }
                }
            }

            return result;
        }
    }]);

    return DrawService;
}(_nodeService2.default);

DrawService.$inject = ['StudentDataService'];

exports.default = DrawService;
//# sourceMappingURL=drawService.js.map