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

var OutsideURLService = function (_NodeService) {
    _inherits(OutsideURLService, _NodeService);

    function OutsideURLService(UtilService) {
        _classCallCheck(this, OutsideURLService);

        var _this = _possibleConstructorReturn(this, (OutsideURLService.__proto__ || Object.getPrototypeOf(OutsideURLService)).call(this));

        _this.UtilService = UtilService;
        return _this;
    }

    /**
     * Create an OutsideURL component object
     * @returns a new OutsideURL component object
     */


    _createClass(OutsideURLService, [{
        key: 'createComponent',
        value: function createComponent() {
            var component = {};
            component.id = this.UtilService.generateKey();
            component.type = 'OutsideURL';
            component.url = '';
            component.showSaveButton = false;
            component.showSubmitButton = false;
            return component;
        }

        /**
         * Copies an existing OutsideURL component object
         * @returns a copied OutsideURL component object
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
    }]);

    return OutsideURLService;
}(_nodeService2.default);

OutsideURLService.$inject = ['UtilService'];

exports.default = OutsideURLService;
//# sourceMappingURL=outsideURLService.js.map