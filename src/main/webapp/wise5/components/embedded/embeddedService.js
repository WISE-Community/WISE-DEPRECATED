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
     * Create an Embedded component object
     * @returns a new Embedded component object
     */


    _createClass(EmbeddedService, [{
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
    }]);

    return EmbeddedService;
}(_nodeService2.default);

EmbeddedService.$inject = ['UtilService'];

exports.default = EmbeddedService;
//# sourceMappingURL=embeddedService.js.map