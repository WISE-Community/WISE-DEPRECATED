"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentService = _interopRequireDefault(require("../componentService"));

var _html2canvas = _interopRequireDefault(require("html2canvas"));

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

var EmbeddedService =
/*#__PURE__*/
function (_ComponentService) {
  _inherits(EmbeddedService, _ComponentService);

  function EmbeddedService($filter, $q, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, EmbeddedService);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EmbeddedService).call(this, $filter, StudentDataService, UtilService));
    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    return _this;
  }

  _createClass(EmbeddedService, [{
    key: "getComponentTypeLabel",
    value: function getComponentTypeLabel() {
      return this.$translate('embedded.componentTypeLabel');
    }
  }, {
    key: "createComponent",
    value: function createComponent() {
      var component = _get(_getPrototypeOf(EmbeddedService.prototype), "createComponent", this).call(this);

      component.type = 'Embedded';
      component.url = '';
      component.height = 600;
      return component;
    }
  }, {
    key: "isCompleted",
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents) {
      var isCompletedFieldInComponentState = false;

      if (componentStates != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var componentState = _step.value;
            var studentData = componentState.studentData;

            if (studentData != null && studentData.isCompleted != null) {
              if (studentData.isCompleted === true) {
                return true;
              }

              isCompletedFieldInComponentState = true;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (isCompletedFieldInComponentState === false) {
        /*
         * the isCompleted field was not set into the component state so
         * we will look for events to determine isCompleted
         */
        if (nodeEvents != null) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = nodeEvents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var event = _step2.value;

              if (event.event === 'nodeEntered') {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }

      return false;
    }
  }, {
    key: "componentHasWork",
    value: function componentHasWork(component) {
      return false;
    }
  }, {
    key: "componentStateHasStudentWork",
    value: function componentStateHasStudentWork(componentState, componentContent) {
      return componentState.studentData != null;
    }
    /**
     * The component state has been rendered in a <component></component> element
     * and now we want to take a snapshot of the work.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image object.
     */

  }, {
    key: "generateImageFromRenderedComponentState",
    value: function generateImageFromRenderedComponentState(componentState) {
      var _this2 = this;

      var deferred = this.$q.defer();
      var iframe = $('#componentApp_' + componentState.componentId);

      if (iframe != null && iframe.length > 0) {
        var modelElement = iframe.contents().find('html');

        if (modelElement != null && modelElement.length > 0) {
          modelElement = modelElement[0];
          (0, _html2canvas["default"])(modelElement).then(function (canvas) {
            var base64Image = canvas.toDataURL('image/png');

            var imageObject = _this2.UtilService.getImageObjectFromBase64String(base64Image);

            _this2.StudentAssetService.uploadAsset(imageObject).then(function (asset) {
              deferred.resolve(asset);
            });
          });
        }
      }

      return deferred.promise;
    }
  }]);

  return EmbeddedService;
}(_componentService["default"]);

EmbeddedService.$inject = ['$filter', '$q', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = EmbeddedService;
exports["default"] = _default;
//# sourceMappingURL=embeddedService.js.map
