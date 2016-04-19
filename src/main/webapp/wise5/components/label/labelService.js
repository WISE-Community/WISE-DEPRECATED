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

var LabelService = function (_NodeService) {
    _inherits(LabelService, _NodeService);

    function LabelService(StudentDataService, UtilService) {
        _classCallCheck(this, LabelService);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LabelService).call(this));

        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Create a Label component object
     * @returns a new Label component object
     */


    _createClass(LabelService, [{
        key: 'createComponent',
        value: function createComponent() {
            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Label';
            component.prompt = 'Enter prompt here';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            component.backgroundImage = '';
            component.canCreateLabels = true;
            component.canDeleteLabels = true;
            component.width = 800;
            component.height = 600;
            component.labels = [];
            return component;
        }

        /**
         * Copies an existing Label component object
         * @returns a copied Label component object
         */

    }, {
        key: 'copyComponent',
        value: function copyComponent(componentToCopy) {
            var component = this.createComponent();
            component.prompt = componentToCopy.prompt;
            component.showSaveButton = componentToCopy.showSaveButton;
            component.showSubmitButton = componentToCopy.showSubmitButton;
            component.backgroundImage = componentToCopy.backgroundImage;
            component.canCreateLabels = componentToCopy.canCreateLabels;
            component.canDeleteLabels = componentToCopy.canDeleteLabels;
            component.width = componentToCopy.width;
            component.height = componentToCopy.height;
            component.labels = [];
            // go through the original labels and create new id's
            if (componentToCopy.labels != null && componentToCopy.labels.length > 0) {
                for (var l = 0; l < componentToCopy.labels.length; l++) {
                    var label = componentToCopy.labels[l];
                    label.id = this.UtilService.generateKey(); // generate a new id for this label.
                    component.labels.push(label);
                }
            }
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

                if (submitRequired) {
                    // completion requires a submission, so check for isSubmit in any component states
                    for (var i = 0, l = componentStates.length; i < l; i++) {
                        var state = componentStates[i];
                        if (state.isSubmit && state.studentData) {
                            // component state is a submission
                            if (state.studentData.labels && state.studentData.labels.length) {
                                // there are labels so the component is completed
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
                        if (studentData.labels && studentData.labels.length) {
                            // there are labels so the component is completed
                            result = true;
                        }
                    }
                }
            }

            return result;
        }
    }]);

    return LabelService;
}(_nodeService2.default);

LabelService.$inject = ['StudentDataService', 'UtilService'];

exports.default = LabelService;
//# sourceMappingURL=labelService.js.map