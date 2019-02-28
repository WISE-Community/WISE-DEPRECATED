'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _embeddedController = require('./embeddedController');

var _embeddedController2 = _interopRequireDefault(_embeddedController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmbeddedAuthoringController = function (_EmbeddedController) {
  _inherits(EmbeddedAuthoringController, _EmbeddedController);

  function EmbeddedAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, EmbeddedService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, EmbeddedAuthoringController);

    var _this = _possibleConstructorReturn(this, (EmbeddedAuthoringController.__proto__ || Object.getPrototypeOf(EmbeddedAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, EmbeddedService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'AudioOscillator' }, { type: 'ConceptMap' }, { type: 'Discussion' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Match' }, { type: 'MultipleChoice' }, { type: 'OpenResponse' }, { type: 'Table' }];

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.width = this.componentContent.width ? this.componentContent.width : '100%';
      this.height = this.componentContent.height ? this.componentContent.height : '100%';
      this.setURL(this.componentContent.url);
    }.bind(_this), true);
    return _this;
  }

  _createClass(EmbeddedAuthoringController, [{
    key: 'assetSelected',
    value: function assetSelected(event, args) {
      if (this.isEventTargetThisComponent(args)) {
        var fileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          var summernoteId = this.getSummernoteId(args);
          this.restoreSummernoteCursorPosition(summernoteId);
          var fullAssetPath = this.getFullAssetPath(fileName);
          if (this.UtilService.isImage(fileName)) {
            this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
          } else if (this.UtilService.isVideo(fileName)) {
            this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
          }
        } else if (args.target === 'modelFile') {
          this.authoringComponentContent.url = fileName;
          this.authoringViewComponentChanged();
        }
      }
      this.$mdDialog.hide();
    }
  }, {
    key: 'showModelFileChooserPopup',
    value: function showModelFileChooserPopup() {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: 'modelFile'
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }]);

  return EmbeddedAuthoringController;
}(_embeddedController2.default);

EmbeddedAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'EmbeddedService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedAuthoringController;
//# sourceMappingURL=embeddedAuthoringController.js.map
