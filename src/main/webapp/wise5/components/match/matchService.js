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

    function MatchService($filter, StudentDataService, UtilService) {
        _classCallCheck(this, MatchService);

        var _this = _possibleConstructorReturn(this, (MatchService.__proto__ || Object.getPrototypeOf(MatchService)).call(this));

        _this.$filter = $filter;
        _this.StudentDataService = StudentDataService;
        _this.UtilService = UtilService;
        _this.$translate = _this.$filter('translate');
        return _this;
    }

    /**
     * Get the component type label
     * example
     * "Match"
     */


    _createClass(MatchService, [{
        key: 'getComponentTypeLabel',
        value: function getComponentTypeLabel() {
            return this.$translate('match.componentTypeLabel');
        }

        /**
         * Create a Match component object
         * @returns a new Match component object
         */

    }, {
        key: 'createComponent',
        value: function createComponent() {

            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Match';
            component.prompt = '';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            component.choices = [];
            component.buckets = [];
            component.feedback = [{
                "bucketId": "0",
                "choices": []
            }];
            component.ordered = false;

            return component;
        }

        /**
         * Copies an existing Match component object
         * @returns a copied Match component object
         */

    }, {
        key: 'copyComponent',
        value: function copyComponent(componentToCopy) {
            var component = this.createComponent();
            component.prompt = componentToCopy.prompt;
            component.showSaveButton = componentToCopy.showSaveButton;
            component.showSubmitButton = componentToCopy.showSubmitButton;
            component.feedback = componentToCopy.feedback; // Copy the feedback as-is. We'll update the id's below.
            component.choices = [];
            // go through the original choices and create new id's
            if (componentToCopy.choices != null && componentToCopy.choices.length > 0) {
                for (var c = 0; c < componentToCopy.choices.length; c++) {
                    var choice = componentToCopy.choices[c];
                    var oldChoiceId = choice.id;
                    var newChoiceId = this.UtilService.generateKey(); // generate a new id for this choice.
                    choice.id = newChoiceId; // update the choice.
                    component.choices.push(choice);
                    // Also update any matching choice in the feedback.
                    if (component.feedback != null && component.feedback.length > 0) {
                        for (var f = 0; f < component.feedback.length; f++) {
                            var feedback = component.feedback[f];
                            if (feedback.choices != null && feedback.choices.length > 0) {
                                for (var fc = 0; fc < feedback.choices.length; fc++) {
                                    var feedbackChoice = feedback.choices[fc];
                                    if (feedbackChoice.choiceId === oldChoiceId) {
                                        feedbackChoice.choiceId = newChoiceId;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            component.buckets = [];
            // go through the original buckets and create new id's
            if (componentToCopy.buckets != null && componentToCopy.buckets.length > 0) {
                for (var b = 0; b < componentToCopy.buckets.length; b++) {
                    var bucket = componentToCopy.buckets[b];
                    var oldBucketId = bucket.id;
                    var newBucketId = this.UtilService.generateKey(); // generate a new id for this bucket.
                    bucket.id = newBucketId; // update the bucket's id
                    component.buckets.push(bucket);
                    // Also update any matching bucket in the feedback.
                    if (component.feedback != null && component.feedback.length > 0) {
                        for (var f = 0; f < component.feedback.length; f++) {
                            var feedback = component.feedback[f];
                            if (feedback.bucketId === oldBucketId) {
                                feedback.bucketId = newBucketId;
                            }
                        }
                    }
                }
            }
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
                    var buckets = studentData.buckets;
                    if (buckets != null) {
                        for (var b = 0; b < buckets.length; b++) {
                            var bucket = buckets[b];
                            if (bucket != null) {
                                var items = bucket.items;
                                if (items != null && items.length > 0) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }
    }]);

    return MatchService;
}(_nodeService2.default);

MatchService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = MatchService;
//# sourceMappingURL=matchService.js.map
