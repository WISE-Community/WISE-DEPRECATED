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

var HTMLService = function (_NodeService) {
  _inherits(HTMLService, _NodeService);

  function HTMLService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, HTMLService);

    var _this = _possibleConstructorReturn(this, (HTMLService.__proto__ || Object.getPrototypeOf(HTMLService)).call(this));

    _this.$filter = $filter;
    _this.StudentDataService = StudentDataService;
    _this.UtilService = UtilService;

    _this.$translate = _this.$filter('translate');
    return _this;
  }

  /**
   * Get the component type label
   * example
   * "HTML"
   */


  _createClass(HTMLService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('html.componentTypeLabel');
    }

    /**
     * Create an HTML component object
     * @returns a new HTML component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {

      var component = {};
      component.id = this.UtilService.generateKey();
      component.type = 'HTML';
      component.html = this.$translate('html.enterHTMLHere');

      return component;
    }

    /**
     * Copies an existing HTML component object
     * @returns a copied HTML component object
     */

  }, {
    key: 'copyComponent',
    value: function copyComponent(componentToCopy) {

      var component = {};
      component.id = this.UtilService.generateKey();
      component.type = 'HTML';
      component.html = componentToCopy.html;

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

    /**
     * Whether this component generates student work
     * @param component (optional) the component object. if the component object
     * is not provided, we will use the default value of whether the
     * component type usually has work.
     * @return whether this component generates student work
     */

  }, {
    key: 'componentHasWork',
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
      return false;
    }

    /**
     * Whether this component uses a submit button
     * @return whether this component uses a submit button
     */

  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return false;
    }
  }]);

  return HTMLService;
}(_nodeService2.default);

HTMLService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = HTMLService;
//# sourceMappingURL=htmlService.js.map
