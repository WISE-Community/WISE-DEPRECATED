'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentService = require('../componentService');

var _componentService2 = _interopRequireDefault(_componentService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTMLService = function (_ComponentService) {
  _inherits(HTMLService, _ComponentService);

  function HTMLService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, HTMLService);

    return _possibleConstructorReturn(this, (HTMLService.__proto__ || Object.getPrototypeOf(HTMLService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(HTMLService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('html.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(HTMLService.prototype.__proto__ || Object.getPrototypeOf(HTMLService.prototype), 'createComponent', this).call(this);
      component.type = 'HTML';
      component.html = this.$translate('html.enterHTMLHere');
      return component;
    }
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
    value: function componentHasWork(component) {
      return false;
    }
  }, {
    key: 'componentUsesSaveButton',
    value: function componentUsesSaveButton() {
      return false;
    }
  }, {
    key: 'componentUsesSubmitButton',
    value: function componentUsesSubmitButton() {
      return false;
    }
  }]);

  return HTMLService;
}(_componentService2.default);

HTMLService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = HTMLService;
//# sourceMappingURL=htmlService.js.map
