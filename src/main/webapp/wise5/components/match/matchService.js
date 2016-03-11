'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeService = require('../../services/nodeService');

var _nodeService2 = _interopRequireDefault(_nodeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MatchService = function (_NodeService) {
    _inherits(MatchService, _NodeService);

    function MatchService(StudentDataService, UtilService) {
        _classCallCheck(this, MatchService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MatchService).call(this));

        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Create a Match component object
     * @returns a new Match component object
     */


    _createClass(MatchService, [{
        key: 'createComponent',
        value: function createComponent() {

            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Match';
            component.prompt = 'Enter prompt here';
            component.showSaveButton = false;
            component.showSubmitButton = true;
            component.choices = [];
            component.buckets = [];
            component.feedback = [];
            component.ordered = false;

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

                if (otherComponentType === 'Match') {
                    // the other component is an Match component

                    // get the student data from the other component state
                    var studentData = componentStateFromOtherComponent.studentData;

                    // create a copy of the student data
                    var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

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
         * @param node parent node of the component
         * @returns whether the component was completed
         */
        value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
            var result = false;

            if (componentStates && componentStates.length) {
                var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

                // loop through all the component states
                for (var c = 0; c < componentStates.length; c++) {

                    // the component state
                    var componentState = componentStates[c];

                    // get the student data from the component state
                    var studentData = componentState.studentData;

                    if (studentData != null) {
                        var buckets = studentData.buckets;

                        if (buckets && buckets.length) {
                            // there is a bucket, so the student has saved work
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
    }]);

    return MatchService;
}(_nodeService2.default);

MatchService.$inject = ['StudentDataService', 'UtilService'];

exports.default = MatchService;
//# sourceMappingURL=matchService.js.map