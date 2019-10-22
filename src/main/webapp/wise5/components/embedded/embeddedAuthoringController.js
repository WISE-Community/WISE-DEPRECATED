'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _embeddedController = _interopRequireDefault(require("./embeddedController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var EmbeddedAuthoringController =
/*#__PURE__*/
function (_EmbeddedController) {
  _inherits(EmbeddedAuthoringController, _EmbeddedController);

  function EmbeddedAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, EmbeddedService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, EmbeddedAuthoringController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EmbeddedAuthoringController).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, EmbeddedService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    _this.allowedConnectedComponentTypes = [{
      type: 'Animation'
    }, {
      type: 'AudioOscillator'
    }, {
      type: 'ConceptMap'
    }, {
      type: 'Discussion'
    }, {
      type: 'Draw'
    }, {
      type: 'Embedded'
    }, {
      type: 'Graph'
    }, {
      type: 'Label'
    }, {
      type: 'Match'
    }, {
      type: 'MultipleChoice'
    }, {
      type: 'OpenResponse'
    }, {
      type: 'Table'
    }];
    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_assertThisInitialized(_this)), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);
      this.setURL(this.componentContent.url);
    }.bind(_assertThisInitialized(_this)), true);
    return _this;
  }

  _createClass(EmbeddedAuthoringController, [{
    key: "assetSelected",
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
    key: "showModelFileChooserPopup",
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
}(_embeddedController["default"]);

EmbeddedAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'EmbeddedService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = EmbeddedAuthoringController;
exports["default"] = _default;
//# sourceMappingURL=embeddedAuthoringController.js.map
