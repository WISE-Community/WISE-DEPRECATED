'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _audioOscillatorController = require('./audioOscillatorController');

var _audioOscillatorController2 = _interopRequireDefault(_audioOscillatorController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioOscillatorAuthoringController = function (_AudioOscillatorContr) {
  _inherits(AudioOscillatorAuthoringController, _AudioOscillatorContr);

  function AudioOscillatorAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, AudioOscillatorService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AudioOscillatorAuthoringController);

    var _this = _possibleConstructorReturn(this, (AudioOscillatorAuthoringController.__proto__ || Object.getPrototypeOf(AudioOscillatorAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, AudioOscillatorService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'AudioOscillator' }];

    _this.populateCheckedOscillatorTypes();
    return _this;
  }

  _createClass(AudioOscillatorAuthoringController, [{
    key: 'populateCheckedOscillatorTypes',
    value: function populateCheckedOscillatorTypes() {
      if (this.authoringComponentContent.oscillatorTypes.indexOf('sine') != -1) {
        this.authoringSineChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('square') != -1) {
        this.authoringSquareChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('triangle') != -1) {
        this.authoringTriangleChecked = true;
      }

      if (this.authoringComponentContent.oscillatorTypes.indexOf('sawtooth') != -1) {
        this.authoringSawtoothChecked = true;
      }
    }
  }, {
    key: 'handleAuthoringComponentContentChanged',
    value: function handleAuthoringComponentContentChanged(newValue, oldValue) {
      _get(AudioOscillatorAuthoringController.prototype.__proto__ || Object.getPrototypeOf(AudioOscillatorAuthoringController.prototype), 'handleAuthoringComponentContentChanged', this).call(this, newValue, oldValue);
      this.stop();
      this.setParametersFromComponentContent();
      this.drawOscilloscopeGridAfterTimeout();
    }
  }, {
    key: 'assetSelected',
    value: function assetSelected(event, args) {
      if (this.isEventTargetThisComponent(args)) {
        var assetItem = args.assetItem;
        var fileName = assetItem.fileName;
        var fullAssetPath = this.getFullAssetPath(fileName);
        var summernoteId = this.getSummernoteId(args);
        this.restoreSummernoteCursorPosition(summernoteId);

        if (this.UtilService.isImage(fileName)) {
          this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      }

      this.$mdDialog.hide();
    }
  }, {
    key: 'authoringViewOscillatorTypeClicked',
    value: function authoringViewOscillatorTypeClicked() {
      this.authoringComponentContent.oscillatorTypes = [];

      if (this.authoringSineChecked) {
        this.authoringComponentContent.oscillatorTypes.push('sine');
      }

      if (this.authoringSquareChecked) {
        this.authoringComponentContent.oscillatorTypes.push('square');
      }

      if (this.authoringTriangleChecked) {
        this.authoringComponentContent.oscillatorTypes.push('triangle');
      }

      if (this.authoringSawtoothChecked) {
        this.authoringComponentContent.oscillatorTypes.push('sawtooth');
      }

      this.authoringViewComponentChanged();
    }
  }]);

  return AudioOscillatorAuthoringController;
}(_audioOscillatorController2.default);

AudioOscillatorAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'AudioOscillatorService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AudioOscillatorAuthoringController;
//# sourceMappingURL=audioOscillatorAuthoringController.js.map
