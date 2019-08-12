'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _componentController = _interopRequireDefault(require("../componentController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var SummaryController =
/*#__PURE__*/
function (_ComponentController) {
  _inherits(SummaryController, _ComponentController);

  function SummaryController($filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, SummaryService, UtilService) {
    var _this;

    _classCallCheck(this, SummaryController);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SummaryController).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));
    _this.SummaryService = SummaryService;
    _this.summaryNodeId = _this.componentContent.summaryNodeId;
    _this.summaryComponentId = _this.componentContent.summaryComponentId;
    _this.summaryStudentDataType = _this.componentContent.summaryStudentDataType;
    _this.chartType = _this.componentContent.chartType;
    _this.prompt = _this.componentContent.prompt;

    if (_this.componentContent.showPromptFromOtherComponent) {
      _this.otherPrompt = _this.getOtherPrompt(_this.summaryNodeId, _this.summaryComponentId);
    }

    _this.isStudent = _this.ConfigService.isPreview() || _this.ConfigService.isStudentRun();

    if (_this.isStudent) {
      _this.otherStepTitle = _this.getOtherStepTitle();
      _this.studentHasWork = _this.isStudentHasWork();
    }

    _this.setPeriodIdIfNecessary();

    return _this;
  }

  _createClass(SummaryController, [{
    key: "getOtherPrompt",
    value: function getOtherPrompt(nodeId, componentId) {
      var otherComponent = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (otherComponent != null) {
        return otherComponent.prompt;
      }

      return null;
    }
  }, {
    key: "isStudentHasWork",
    value: function isStudentHasWork() {
      var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.summaryNodeId, this.summaryComponentId);
      return componentStates.length > 0;
    }
  }, {
    key: "getOtherStepTitle",
    value: function getOtherStepTitle() {
      return this.ProjectService.getNodePositionAndTitleByNodeId(this.summaryNodeId);
    }
  }, {
    key: "setPeriodIdIfNecessary",
    value: function setPeriodIdIfNecessary() {
      if (this.ConfigService.isStudentRun()) {
        if (this.componentContent.summarySource === 'period') {
          this.periodId = this.ConfigService.getPeriodId();
        } else if (this.componentContent.summarySource === 'allPeriods') {
          this.periodId = null;
        }
      }
    }
  }]);

  return SummaryController;
}(_componentController["default"]);

SummaryController.$inject = ['$filter', '$mdDialog', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'SummaryService', 'UtilService'];
var _default = SummaryController;
exports["default"] = _default;
//# sourceMappingURL=summaryController.js.map
