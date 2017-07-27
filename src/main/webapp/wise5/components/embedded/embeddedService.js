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

var EmbeddedService = function (_NodeService) {
    _inherits(EmbeddedService, _NodeService);

    function EmbeddedService(UtilService) {
        _classCallCheck(this, EmbeddedService);

        var _this = _possibleConstructorReturn(this, (EmbeddedService.__proto__ || Object.getPrototypeOf(EmbeddedService)).call(this));

        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Get the component type label
     * example
     * "Embedded"
     */


    _createClass(EmbeddedService, [{
        key: 'getComponentTypeLabel',
        value: function getComponentTypeLabel() {
            return this.$translate('embedded.componentTypeLabel');
        }

        /**
         * Create an Embedded component object
         * @returns a new Embedded component object
         */

    }, {
        key: 'createComponent',
        value: function createComponent() {
            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'Embedded';
            component.url = '';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            return component;
        }

        /**
         * Copies an existing Embedded component object
         * @returns a copied Embedded component object
         */

    }, {
        key: 'copyComponent',
        value: function copyComponent(componentToCopy) {
            var component = this.createComponent();
            component.url = componentToCopy.url;
            component.showSaveButton = componentToCopy.showSaveButton;
            component.showSubmitButton = componentToCopy.showSubmitButton;
            return component;
        }

        /**
         * Check if the component was completed
         * @param component the component object
         * @param componentStates the component states for the specific component
         * @param componentEvents the events for the specific component
         * @param nodeEvents the events for the parent node of the component
         * @returns whether the component was completed
         */

    }, {
        key: 'isCompleted',
        value: function isCompleted(component, componentStates, componentEvents, nodeEvents) {
            var result = false;

            var isCompletedFieldInComponentState = false;

            if (componentStates != null) {

                /*
                 * loop through all the component states and look for a component
                 * that has the isCompleted field set to true
                 */
                for (var c = 0; c < componentStates.length; c++) {

                    // get a component state
                    var componentState = componentStates[c];

                    if (componentState != null) {
                        // get the student data from the model
                        var studentData = componentState.studentData;

                        if (studentData != null) {

                            if (studentData.isCompleted != null) {
                                /*
                                 * the model has set the isCompleted field in the
                                 * student data
                                 */
                                isCompletedFieldInComponentState = true;

                                if (studentData.isCompleted === true) {
                                    /*
                                     * the model has set the isCompleted field to true
                                     * which means the student has completed the component
                                     */
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            if (isCompletedFieldInComponentState == false) {
                /*
                 * the isCompleted field was not set into the component state so
                 * we will look for events to determine isCompleted
                 */

                if (nodeEvents != null) {

                    // loop through all the events
                    for (var e = 0; e < nodeEvents.length; e++) {

                        // get an event
                        var event = nodeEvents[e];

                        if (event != null && event.event === 'nodeEntered') {
                            result = true;
                            break;
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
            return false;
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
    }]);

    return EmbeddedService;
}(_nodeService2.default);

EmbeddedService.$inject = ['UtilService'];

exports.default = EmbeddedService;
//# sourceMappingURL=embeddedService.js.map