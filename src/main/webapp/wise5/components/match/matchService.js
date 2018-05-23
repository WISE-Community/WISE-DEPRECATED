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
      component.feedback = [{
        'bucketId': '0',
        'choices': []
      }];
      component.ordered = false;
      return component;
    }
  }, {
    key: 'isCompleted',
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

    /**
     * Check if a the component has a correct answer.
     * @param component The component content object.
     * @return Whether the component has a correct answer.
     */

  }, {
    key: 'hasCorrectAnswer',
    value: function hasCorrectAnswer(component) {
      if (component != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = component.feedback[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var bucket = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = bucket.choices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var choice = _step2.value;

                if (choice.isCorrect) {
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
  }]);

  return MatchService;
}(_componentService2.default);

MatchService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = MatchService;
//# sourceMappingURL=matchService.js.map
