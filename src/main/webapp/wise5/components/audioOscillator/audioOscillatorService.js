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
      if (componentStates && componentStates.length) {
        var componentState = componentStates[componentStates.length - 1];
        return this.componentStateHasStudentWork(componentState);
      }
      return false;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData != null) {
          if (studentData.frequenciesPlayed != null && studentData.frequenciesPlayed.length > 0) {
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
