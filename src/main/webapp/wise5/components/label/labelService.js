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

    function LabelService($filter, StudentDataService, UtilService) {
        _classCallCheck(this, LabelService);

        var _this = _possibleConstructorReturn(this, (LabelService.__proto__ || Object.getPrototypeOf(LabelService)).call(this));

        _this.$filter = $filter;
        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        _this.$translate = _this.$filter('translate');
        return _this;
    }

    /**
     * Get the component type label
     * example
     * "Label"
     */


    _createClass(LabelService, [{
        key: 'getComponentTypeLabel',
        value: function getComponentTypeLabel() {
            return this.$translate('label.componentTypeLabel');
        }

        /**
         * Create a Label component object
         * @returns a new Label component object
         */

    }, {
        key: 'createComponent',
        value: function createComponent() {
            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Label';
            component.prompt = '';
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

                if (otherComponentType === 'Label') {
                    // the other component is an Label component

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
    }, {
        key: 'componentHasWork',


        /**
         * Whether this component generates student work
         * @param component (optional) the component object. if the component object
         * is not provided, we will use the default value of whether the
         * component type usually has work.
         * @return whether this component generates student work
         */
        value: function componentHasWork(component) {
            return true;
        }

        /**
         * Whether this component uses a save button
         * @return whether this component uses a save button
         */

    }, {
        key: 'componentUsesSaveButton',
        value: function componentUsesSaveButton() {
            return true;
        }

        /**
         * Whether this component uses a submit button
         * @return whether this component uses a submit button
         */

    }, {
        key: 'componentUsesSubmitButton',
        value: function componentUsesSubmitButton() {
            return true;
        }

        /**
         * Check if the component state has student work. Sometimes a component
         * state may be created if the student visits a component but doesn't
         * actually perform any work. This is where we will check if the student
         * actually performed any work.
         * @param componentState the component state object
         * @param componentContent the component content
         * @return whether the component state has any work
         */

    }, {
        key: 'componentStateHasStudentWork',
        value: function componentStateHasStudentWork(componentState, componentContent) {
            if (componentState != null) {
                var studentData = componentState.studentData;
                if (studentData != null) {
                    // get the labels from the student data
                    var labels = studentData.labels;

                    if (componentContent == null) {
                        // the component content was not provided
                        if (labels != null && labels.length > 0) {
                            // the student has work
                            return true;
                        }
                    } else {
                        // the component content was provided
                        var starterLabels = componentContent.labels;
                        if (starterLabels == null || starterLabels.length == 0) {
                            // there are no starter labels
                            if (labels != null && labels.length > 0) {
                                // the student has work
                                return true;
                            }
                        } else {
                            /*
                             * there are starter labels so we will compare it
                             * with the student labels
                             */
                            if (!this.labelArraysAreTheSame(labels, starterLabels)) {
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

        /**
         * Check if the two arrays of labels contain the same values
         * @param labels1 an array of label objects
         * @param labels2 an array of label objects
         * @return whether the labels contain the same values
         */

    }, {
        key: 'labelArraysAreTheSame',
        value: function labelArraysAreTheSame(labels1, labels2) {

            if (labels1 == null && labels2 == null) {
                return true;
            } else if (labels1 == null && labels2 != null || labels1 != null && labels2 == null) {
                return false;
            } else {
                if (labels1.length != labels2.length) {
                    return false;
                } else {
                    for (var l = 0; l < labels1.length; l++) {
                        var label1 = labels1[l];
                        var label2 = labels2[l];
                        if (!this.labelsAreTheSame(label1, label2)) {
                            return false;
                        }
                    }
                }
            }

            return true;
        }

        /**
         * Check if two labels contain the same values
         * @param label1 a label object
         * @param label2 a label object
         * @return whether the labels contain the same values
         */

    }, {
        key: 'labelsAreTheSame',
        value: function labelsAreTheSame(label1, label2) {

            if (label1 == null && label2 == null) {
                return true;
            } else if (label1 == null && label2 != null || label1 != null && label2 == null) {
                return false;
            } else {
                if (label1.text != label2.text || label1.pointX != label2.pointX || label1.pointY != label2.pointY || label1.textX != label2.textX || label1.textY != label2.textY || label1.color != label2.color) {
                    // at least one of the fields are different
                    return false;
                }
            }

            return true;
        }
    }]);

    return LabelService;
}(_nodeService2.default);

LabelService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = LabelService;
//# sourceMappingURL=labelService.js.map