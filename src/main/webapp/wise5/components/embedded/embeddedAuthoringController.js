'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _embeddedController = require('./embeddedController');

var _embeddedController2 = _interopRequireDefault(_embeddedController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

var _iframeResizer = require('iframe-resizer');

var _iframeResizer2 = _interopRequireDefault(_iframeResizer);

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

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              // get the assets directory path, e.g. /wise/curriculum/3/
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;
              var summernoteId = '';

              if (args.target == 'prompt') {
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      _this.$mdDialog.hide();
    });

    /* TODO geoffreykwan we're listening to assetSelected twice?
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              if (args.target == 'modelFile') {
                _this.authoringComponentContent.url = fileName;
                _this.authoringViewComponentChanged();
              }
            }
          }
        }
      }
      _this.$mdDialog.hide();
    });
    return _this;
  }

  /**
   * Show the asset popup to allow the author to choose the model file
   */


  _createClass(EmbeddedAuthoringController, [{
    key: 'chooseModelFile',
    value: function chooseModelFile() {
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'modelFile';
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }]);

  return EmbeddedAuthoringController;
}(_embeddedController2.default);

EmbeddedAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'EmbeddedService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedAuthoringController;
//# sourceMappingURL=embeddedAuthoringController.js.map
