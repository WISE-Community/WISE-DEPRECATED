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
    _this.studentDataType = _this.componentContent.studentDataType;
    _this.chartType = _this.componentContent.chartType;
    _this.prompt = _this.componentContent.prompt;
    _this.highlightCorrectAnswer = _this.componentContent.highlightCorrectAnswer;
    _this.warningMessage = '';

    if (_this.componentContent.showPromptFromOtherComponent) {
      _this.otherPrompt = _this.getOtherPrompt(_this.summaryNodeId, _this.summaryComponentId);
    }

    _this.isStudent = _this.ConfigService.isPreview() || _this.ConfigService.isStudentRun();

    if (_this.isStudent) {
      _this.otherStepTitle = _this.getOtherStepTitle();
      _this.isShowDisplay = _this.calculateIsShowDisplay();
    } else {
      _this.isShowDisplay = true;
    }

    if (!_this.isShowDisplay) {
      _this.warningMessage = _this.getWarningMessage();
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
    key: "calculateIsShowDisplay",
    value: function calculateIsShowDisplay() {
      if (this.componentContent.requirementToSeeSummary === 'submitWork') {
        return this.studentHasSubmittedWork();
      } else if (this.componentContent.requirementToSeeSummary === 'saveWork') {
        return this.studentHasSavedWork();
      } else if (this.componentContent.requirementToSeeSummary === 'completeComponent') {
        return this.studentHasCompletedComponent();
      } else if (this.componentContent.requirementToSeeSummary === 'none') {
        return true;
      }
    }
  }, {
    key: "getWarningMessage",
    value: function getWarningMessage() {
      var messageTranslationKey = '';

      if (this.componentContent.requirementToSeeSummary === 'submitWork') {
        messageTranslationKey = 'summary.youMustSubmitWork';
      } else if (this.componentContent.requirementToSeeSummary === 'saveWork') {
        messageTranslationKey = 'summary.youMustSaveWork';
      } else if (this.componentContent.requirementToSeeSummary === 'completeComponent') {
        messageTranslationKey = 'summary.youMustComplete';
      }

      return this.$translate(messageTranslationKey, {
        stepTitle: this.otherStepTitle
      });
    }
  }, {
    key: "studentHasSubmittedWork",
    value: function studentHasSubmittedWork() {
      var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.summaryNodeId, this.summaryComponentId);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var componentState = _step.value;

          if (componentState.isSubmit) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: "studentHasSavedWork",
    value: function studentHasSavedWork() {
      var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.summaryNodeId, this.summaryComponentId);
      return componentStates.length > 0;
    }
  }, {
    key: "studentHasCompletedComponent",
    value: function studentHasCompletedComponent() {
      return this.StudentDataService.isCompleted(this.summaryNodeId, this.summaryComponentId);
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
        if (this.componentContent.source === 'period') {
          this.periodId = this.ConfigService.getPeriodId();
        } else if (this.componentContent.source === 'allPeriods') {
          this.periodId = null;
        }
      }
    }
  }, {
    key: "handleStudentWorkSavedToServerAdditionalProcessing",
    value: function handleStudentWorkSavedToServerAdditionalProcessing(event, args) {
      if (this.isStudent) {
        this.isShowDisplay = this.calculateIsShowDisplay();
      }
    }
  }]);

  return SummaryController;
}(_componentController["default"]);

SummaryController.$inject = ['$filter', '$mdDialog', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'SummaryService', 'UtilService'];
var _default = SummaryController;
exports["default"] = _default;
//# sourceMappingURL=summaryController.js.map
