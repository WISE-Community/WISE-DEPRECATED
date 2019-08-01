'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentController = _interopRequireDefault(require("../componentController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var SummaryController =
/*#__PURE__*/
function (_ComponentController) {
  _inherits(SummaryController, _ComponentController);

  function SummaryController($filter, $mdDialog, $q, $rootScope, $scope, SummaryService, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    var _this;

    _classCallCheck(this, SummaryController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SummaryController).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    _this.summaryNodeId = _this.componentContent.summaryNodeId;
    _this.summaryComponentId = _this.componentContent.summaryComponentId;
    _this.prompt = _this.componentContent.prompt;

    if (_this.componentContent.showPromptFromOtherComponent) {
      var otherComponent = _this.ProjectService.getComponentByNodeIdAndComponentId(_this.summaryNodeId, _this.summaryComponentId);

      if (otherComponent != null) {
        _this.otherPrompt = otherComponent.prompt;
      }
    }

    if (_this.ConfigService.getMode() === 'studentRun') {
      _this.periodId = _this.ConfigService.getPeriodId();
    } else if (_this.ConfigService.getMode() === 'classroomMonitor') {
      var studentWorkgroupId = _this.workgroupId;
      _this.periodId = _this.ConfigService.getPeriodIdByWorkgroupId(studentWorkgroupId);
    }

    return _this;
  }

  return SummaryController;
}(_componentController["default"]);

SummaryController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'SummaryService', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];
var _default = SummaryController;
exports["default"] = _default;
//# sourceMappingURL=summaryController.js.map
