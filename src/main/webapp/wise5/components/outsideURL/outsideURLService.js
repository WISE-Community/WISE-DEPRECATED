"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentService = _interopRequireDefault(require("../componentService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var OutsideURLService =
/*#__PURE__*/
function (_ComponentService) {
  _inherits(OutsideURLService, _ComponentService);

  function OutsideURLService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, OutsideURLService);

    return _possibleConstructorReturn(this, _getPrototypeOf(OutsideURLService).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(OutsideURLService, [{
    key: "getComponentTypeLabel",
    value: function getComponentTypeLabel() {
      return this.$translate('outsideURL.componentTypeLabel');
    }
  }, {
    key: "createComponent",
    value: function createComponent() {
      var component = _get(_getPrototypeOf(OutsideURLService.prototype), "createComponent", this).call(this);

      component.type = 'OutsideURL';
      component.url = '';
      component.height = 600;
      return component;
    }
  }, {
    key: "isCompleted",
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
    key: "componentHasWork",
    value: function componentHasWork(component) {
      return false;
    }
  }, {
    key: "componentUsesSaveButton",
    value: function componentUsesSaveButton() {
      return false;
    }
  }, {
    key: "componentUsesSubmitButton",
    value: function componentUsesSubmitButton() {
      return false;
    }
  }]);

  return OutsideURLService;
}(_componentService["default"]);

OutsideURLService.$inject = ['$filter', 'StudentDataService', 'UtilService'];
var _default = OutsideURLService;
exports["default"] = _default;
//# sourceMappingURL=outsideURLService.js.map
