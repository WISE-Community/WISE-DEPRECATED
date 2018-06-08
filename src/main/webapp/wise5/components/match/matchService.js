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

var MatchService = function (_ComponentService) {
  _inherits(MatchService, _ComponentService);

  function MatchService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, MatchService);

    return _possibleConstructorReturn(this, (MatchService.__proto__ || Object.getPrototypeOf(MatchService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(MatchService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('match.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(MatchService.prototype.__proto__ || Object.getPrototypeOf(MatchService.prototype), 'createComponent', this).call(this);
      component.type = 'Match';
      component.choices = [];
      component.buckets = [];
      component.feedback = [{ 'bucketId': '0', 'choices': [] }];
      component.ordered = false;
      return component;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      if (componentStates && componentStates.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var componentState = _step.value;

            var buckets = componentState.studentData.buckets;
            if (buckets && buckets.length > 0) {
              if (this.isSubmitRequired(node, component)) {
                if (componentState.isSubmit) {
                  return true;
                }
              } else {
                return true;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'isSubmitRequired',
    value: function isSubmitRequired(node, component) {
      return node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var buckets = componentState.studentData.buckets;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = buckets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var bucket = _step2.value;

            var items = bucket.items;
            if (items != null && items.length > 0) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'hasCorrectAnswer',
    value: function hasCorrectAnswer(component) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = component.feedback[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var bucket = _step3.value;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = bucket.choices[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var choice = _step4.value;

              if (choice.isCorrect) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return false;
    }
  }]);

  return MatchService;
}(_componentService2.default);

MatchService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = MatchService;
//# sourceMappingURL=matchService.js.map
