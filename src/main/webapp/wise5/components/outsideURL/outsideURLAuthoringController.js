'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _outsideURLController = _interopRequireDefault(require("./outsideURLController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var OutsideURLAuthoringController =
/*#__PURE__*/
function (_OutsideURLController) {
  _inherits(OutsideURLAuthoringController, _OutsideURLController);

  function OutsideURLAuthoringController($filter, $mdDialog, $q, $rootScope, $sce, $scope, AnnotationService, ConfigService, NodeService, NotebookService, OutsideURLService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, OutsideURLAuthoringController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(OutsideURLAuthoringController).call(this, $filter, $mdDialog, $q, $rootScope, $sce, $scope, AnnotationService, ConfigService, NodeService, NotebookService, OutsideURLService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    $scope.$watch(function () {
      return _this.authoringComponentContent;
    }, function (newValue, oldValue) {
      _this.componentContent = _this.ProjectService.injectAssetPaths(newValue);

      _this.setURL(_this.authoringComponentContent.url);

      _this.setWidthAndHeight(_this.authoringComponentContent.width, _this.authoringComponentContent.height);
    }, true);
    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */

    _this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();

              var fullAssetPath = assetsDirectoryPath + '/' + fileName;
              var summernoteId = '';

              if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus'); // add the image html

                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus'); // insert the video element

                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      } // close the popup


      _this.$mdDialog.hide();
    });

    return _this;
  }

  return OutsideURLAuthoringController;
}(_outsideURLController["default"]);

OutsideURLAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$sce', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'OutsideURLService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = OutsideURLAuthoringController;
exports["default"] = _default;
//# sourceMappingURL=outsideURLAuthoringController.js.map
