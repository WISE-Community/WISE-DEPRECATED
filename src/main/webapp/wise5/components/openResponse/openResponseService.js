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

var OpenResponseService = function (_NodeService) {
    _inherits(OpenResponseService, _NodeService);

    function OpenResponseService(StudentDataService, UtilService) {
        _classCallCheck(this, OpenResponseService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OpenResponseService).call(this));

        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Create a OpenResponse component object
     * @returns a new OpenResponse component object
     */

    _createClass(OpenResponseService, [{
        key: 'createComponent',
        value: function createComponent() {

            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'OpenResponse';
            component.prompt = 'Enter prompt here';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            component.starterSentence = null;
            component.isStudentAttachmentEnabled = false;

            return component;
        }

        /**
         * Populate a component state with the data from another component state
         * @param componentStateFromOtherComponent the component state to obtain the data from
         * @return a new component state that contains the student data from the other
         * component state
         */

    }, {
        key: 'populateComponentState',
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

    return OpenResponseService;
}(_nodeService2.default);

OpenResponseService.$inject = ['StudentDataService', 'UtilService'];

exports.default = OpenResponseService;
//# sourceMappingURL=openResponseService.js.map