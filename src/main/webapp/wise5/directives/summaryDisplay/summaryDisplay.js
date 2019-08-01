'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SummaryDisplayController =
/*#__PURE__*/
function () {
  function SummaryDisplayController($injector, $q, ConfigService, ProjectService) {
    var _this = this;

    _classCallCheck(this, SummaryDisplayController);

    this.$injector = $injector;
    this.$q = $q;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.dataService = null;
    var mode = this.ConfigService.getMode();

    if (this.ConfigService.isPreview() || mode === 'studentRun') {
      this.dataService = this.$injector.get('StudentDataService');
    } else if (mode === 'classroomMonitor' || mode === 'author') {
      this.dataService = this.$injector.get('TeacherDataService');
    }

    this.renderDisplay();

    this.$onChanges = function (changes) {
      _this.renderDisplay();
    };
  }

  _createClass(SummaryDisplayController, [{
    key: "renderDisplay",
    value: function renderDisplay() {
      var _this2 = this;

      var summaryComponent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (summaryComponent != null) {
        this.getComponentStates(this.nodeId, this.componentId, this.periodId).then(function (componentStates) {
          _this2.processComponentStates(componentStates);
        });
      } else {
        this.clearChartConfig();
      }
    }
  }, {
    key: "clearChartConfig",
    value: function clearChartConfig() {
      this.chartConfig = {
        options: {
          legend: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          credits: {
            enabled: false
          }
        }
      };
    }
  }, {
    key: "getComponentStates",
    value: function getComponentStates(nodeId, componentId, periodId) {
      if (this.ConfigService.isPreview() || this.ConfigService.getMode() === 'author') {
        return this.getClassmateStudentWorkForPreview(nodeId, componentId);
      } else if (this.ConfigService.getMode() === 'studentRun') {
        return this.dataService.getClassmateStudentWork(nodeId, componentId, periodId);
      } else if (this.ConfigService.getMode() === 'classroomMonitor') {
        return this.dataService.retrieveStudentDataByNodeIdAndComponentIdAndPeriodId(nodeId, componentId, periodId);
      }
    }
  }, {
    key: "getClassmateStudentWorkForPreview",
    value: function getClassmateStudentWorkForPreview(nodeId, componentId) {
      var componentStates = this.createDummyClassmateStudentWork();

      if (this.ConfigService.isPreview()) {
        var componentState = this.dataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

        if (componentState != null) {
          componentStates.push(componentState);
        }
      } // We need to set a delay otherwise the graph won't render properly


      var deferred = this.$q.defer();
      setTimeout(function () {
        deferred.resolve(componentStates);
      }, 1);
      return deferred.promise;
    }
  }, {
    key: "createDummyClassmateStudentWork",
    value: function createDummyClassmateStudentWork() {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
      var choices = component.choices;
      var dummyComponentStates = [];

      for (var dummyCounter = 0; dummyCounter < 10; dummyCounter++) {
        dummyComponentStates.push(this.createDummyComponentState(choices));
      }

      return dummyComponentStates;
    }
  }, {
    key: "createDummyComponentState",
    value: function createDummyComponentState(choices) {
      return {
        studentData: {
          studentChoices: [{
            id: this.getRandomChoice(choices).id
          }]
        }
      };
    }
  }, {
    key: "getRandomChoice",
    value: function getRandomChoice(choices) {
      return choices[Math.floor(Math.random() * choices.length)];
    }
  }, {
    key: "processComponentStates",
    value: function processComponentStates(componentStates) {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
      var summaryData = this.createSummaryData(component, componentStates);

      var _this$createSeriesDat = this.createSeriesData(component, summaryData),
          data = _this$createSeriesDat.data,
          total = _this$createSeriesDat.total;

      var series = this.createSeries(data);
      var chartType = 'column';
      var title = 'Class Results';
      var xAxisType = 'category';
      this.chartConfig = this.createChartConfig(chartType, title, xAxisType, total, series);
    }
  }, {
    key: "createSummaryData",
    value: function createSummaryData(component, componentStates) {
      var summaryData = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = component.choices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var choice = _step.value;
          summaryData[choice.id] = this.createChoiceSummaryData(choice.id, choice.text, choice.isCorrect);
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = componentStates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var componentState = _step2.value;
          this.addComponentStateDataToSummaryData(summaryData, componentState);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return summaryData;
    }
  }, {
    key: "createChoiceSummaryData",
    value: function createChoiceSummaryData(id, text, isCorrect) {
      return {
        id: id,
        text: text,
        isCorrect: isCorrect,
        count: 0
      };
    }
  }, {
    key: "addComponentStateDataToSummaryData",
    value: function addComponentStateDataToSummaryData(summaryData, componentState) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = componentState.studentData.studentChoices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var choice = _step3.value;
          this.incrementSummaryData(summaryData, choice.id);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "incrementSummaryData",
    value: function incrementSummaryData(summaryData, id) {
      summaryData[id].count += 1;
    }
  }, {
    key: "getSummaryDataCount",
    value: function getSummaryDataCount(summaryData, id) {
      return summaryData[id].count;
    }
  }, {
    key: "createChartConfig",
    value: function createChartConfig(chartType, title, xAxisType, total, series) {
      return {
        options: {
          chart: {
            type: chartType
          },
          legend: {
            enabled: false
          },
          tooltip: {
            formatter: function formatter(s, point) {
              return this.key + ': ' + Math.round(100 * this.y / total) + '%';
            }
          },
          exporting: {
            enabled: false
          },
          credits: {
            enabled: false
          }
        },
        title: {
          text: title
        },
        xAxis: {
          type: xAxisType
        },
        series: series
      };
    }
  }, {
    key: "hasCorrectAnswer",
    value: function hasCorrectAnswer(component) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = component.choices[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var choice = _step4.value;

          if (choice.isCorrect) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return false;
    }
  }, {
    key: "createSeriesData",
    value: function createSeriesData(component, summaryData) {
      var data = [];
      var total = 0;
      var hasCorrectness = this.hasCorrectAnswer(component);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = component.choices[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var choice = _step5.value;
          var count = this.getSummaryDataCount(summaryData, choice.id);
          total += count;
          var color = this.getDataPointColor(choice, hasCorrectness);
          var dataPoint = this.createDataPoint(choice.text, count, color);
          data.push(dataPoint);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return {
        data: data,
        total: total
      };
    }
  }, {
    key: "getDataPointColor",
    value: function getDataPointColor(choice, hasCorrectness) {
      var color = null;

      if (hasCorrectness) {
        if (choice.isCorrect) {
          color = 'green';
        } else {
          color = 'red';
        }
      }

      return color;
    }
  }, {
    key: "createDataPoint",
    value: function createDataPoint(name, y, color) {
      return {
        name: name,
        y: y,
        color: color
      };
    }
  }, {
    key: "createSeries",
    value: function createSeries(data) {
      return [{
        data: data,
        dataLabels: {
          enabled: true
        }
      }];
    }
  }]);

  return SummaryDisplayController;
}();

SummaryDisplayController.$inject = ['$injector', '$q', 'ConfigService', 'ProjectService', 'StudentDataService'];
var SummaryDisplay = {
  bindings: {
    nodeId: '<',
    componentId: '<',
    periodId: '<'
  },
  templateUrl: 'wise5/directives/summaryDisplay/summaryDisplay.html',
  controller: SummaryDisplayController,
  controllerAs: 'summaryDisplayCtrl'
};
var _default = SummaryDisplay;
exports["default"] = _default;
//# sourceMappingURL=summaryDisplay.js.map
