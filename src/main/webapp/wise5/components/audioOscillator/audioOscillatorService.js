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

var AudioOscillatorService = function (_ComponentService) {
  _inherits(AudioOscillatorService, _ComponentService);

  function AudioOscillatorService($filter, StudentDataService, UtilService) {
    _classCallCheck(this, AudioOscillatorService);

    return _possibleConstructorReturn(this, (AudioOscillatorService.__proto__ || Object.getPrototypeOf(AudioOscillatorService)).call(this, $filter, StudentDataService, UtilService));
  }

  _createClass(AudioOscillatorService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('audioOscillator.componentTypeLabel');
    }
  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(AudioOscillatorService.prototype.__proto__ || Object.getPrototypeOf(AudioOscillatorService.prototype), 'createComponent', this).call(this);
      component.type = 'AudioOscillator';
      component.oscillatorTypes = ['sine'];
      component.startingFrequency = 440;
      component.oscilloscopeWidth = 800;
      component.oscilloscopeHeight = 400;
      component.gridCellSize = 50;
      component.stopAfterGoodDraw = false;
      return component;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      var result = false;

      if (componentStates && componentStates.length) {
        var submitRequired = node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;

        if (submitRequired) {
          // completion requires a submission, so check for isSubmit in any component states
          for (var i = 0, l = componentStates.length; i < l; i++) {
            var state = componentStates[i];
            if (state.isSubmit && state.studentData) {
              // component state is a submission
              if (state.studentData.frequenciesPlayed != null && studentData.frequenciesPlayed.length > 0) {
                // the student has played at least one frequency so the component is completed
                result = true;
                break;
              }
            }
          }
        } else {
          // get the last component state
          var _l = componentStates.length - 1;
          var componentState = componentStates[_l];

          var _studentData = componentState.studentData;

          if (_studentData != null) {
            if (_studentData.frequenciesPlayed != null && _studentData.frequenciesPlayed.length > 0) {
              // the student has played at least one frequency so the component is completed
              result = true;
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
        var _studentData2 = componentState.studentData;
        if (_studentData2 != null) {
          if (_studentData2.frequenciesPlayed != null && _studentData2.frequenciesPlayed.length > 0) {
            return true;
          }
        }
      }
      return false;
    }
  }]);

  return AudioOscillatorService;
}(_componentService2.default);

AudioOscillatorService.$inject = ['$filter', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorService;
//# sourceMappingURL=audioOscillatorService.js.map
