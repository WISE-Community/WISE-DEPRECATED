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
  function SummaryDisplayController($filter, $injector, $q, AnnotationService, ConfigService, ProjectService) {
    var _this = this;

    _classCallCheck(this, SummaryDisplayController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$q = $q;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.$translate = this.$filter('translate');
    this.numDummySamples = 20;
    this.defaultMaxScore = 5;
    this.maxScore = this.defaultMaxScore;
    this.dataService = null;

    if (this.chartType == null) {
      this.chartType = 'column';
    }

    if (this.isVLEPreview() || this.isStudentRun()) {
      this.dataService = this.$injector.get('StudentDataService');
    } else if (this.isClassroomMonitor() || this.isAuthoringPreview()) {
      this.dataService = this.$injector.get('TeacherDataService');
    }

    this.renderDisplay();

    if (this.isAuthoringPreview()) {
      this.$onChanges = function (changes) {
        _this.renderDisplay();
      };
    }
  }

  _createClass(SummaryDisplayController, [{
    key: "isVLEPreview",
    value: function isVLEPreview() {
      return this.ConfigService.isPreview();
    }
  }, {
    key: "isAuthoringPreview",
    value: function isAuthoringPreview() {
      return this.ConfigService.isAuthoring();
    }
  }, {
    key: "isStudentRun",
    value: function isStudentRun() {
      return this.ConfigService.isStudentRun();
    }
  }, {
    key: "isClassroomMonitor",
    value: function isClassroomMonitor() {
      return this.ConfigService.isClassroomMonitor();
    }
  }, {
    key: "renderDisplay",
    value: function renderDisplay() {
      var _this2 = this;

      var summaryComponent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (summaryComponent != null) {
        if (this.studentDataType === 'responses') {
          this.getComponentStates(this.nodeId, this.componentId, this.periodId).then(function () {
            var componentStates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            _this2.processComponentStates(componentStates);
          });
        } else if (this.studentDataType === 'scores') {
          this.setMaxScore(summaryComponent);
          this.getScores(this.nodeId, this.componentId, this.periodId).then(function (annotations) {
            _this2.processScoreAnnotations(annotations);
          });
        }
      } else {
        this.clearChartConfig();
      }
    }
  }, {
    key: "setMaxScore",
    value: function setMaxScore(component) {
      if (component.maxScore != null) {
        this.maxScore = component.maxScore;
      } else {
        this.maxScore = this.defaultMaxScore;
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
      if (this.isVLEPreview()) {
        return this.getDummyStudentWorkForVLEPreview(nodeId, componentId);
      } else if (this.isAuthoringPreview()) {
        return this.getDummyStudentWorkForAuthoringPreview(nodeId, componentId);
      } else if (this.isStudentRun()) {
        return this.dataService.getClassmateStudentWork(nodeId, componentId, periodId);
      } else if (this.isClassroomMonitor()) {
        return this.dataService.retrieveLatestStudentDataByNodeIdAndComponentIdAndPeriodId(nodeId, componentId, periodId);
      }
    }
  }, {
    key: "getScores",
    value: function getScores(nodeId, componentId, periodId) {
      var _this3 = this;

      if (this.isVLEPreview()) {
        return this.getDummyStudentScoresForVLEPreview(nodeId, componentId);
      } else if (this.isAuthoringPreview()) {
        return this.getDummyStudentScoresForAuthoringPreview(nodeId, componentId);
      } else if (this.isStudentRun()) {
        return this.dataService.getClassmateScores(nodeId, componentId, periodId).then(function (annotations) {
          return _this3.filterLatestScoreAnnotations(annotations);
        });
      } else if (this.isClassroomMonitor()) {
        var annotations = this.dataService.getAnnotationsByNodeIdAndPeriodId(nodeId, periodId);
        return this.resolveData(this.filterLatestScoreAnnotations(annotations));
      }
    }
  }, {
    key: "filterLatestScoreAnnotations",
    value: function filterLatestScoreAnnotations(annotations) {
      var latestAnnotations = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = annotations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var annotation = _step.value;

          if (annotation.type === 'score' || annotation.type === 'autoScore') {
            this.setLatestAnnotationIfNewer(latestAnnotations, annotation);
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

      return this.convertObjectToArray(latestAnnotations);
    }
  }, {
    key: "setLatestAnnotationIfNewer",
    value: function setLatestAnnotationIfNewer(latestAnnotations, annotation) {
      var workgroupId = annotation.toWorkgroupId;
      var latestAnnotation = latestAnnotations[workgroupId];

      if (latestAnnotation == null || annotation.serverSaveTime > latestAnnotation.serverSaveTime) {
        latestAnnotations[workgroupId] = annotation;
      }
    }
  }, {
    key: "convertObjectToArray",
    value: function convertObjectToArray(obj) {
      return Object.keys(obj).map(function (key) {
        return obj[key];
      });
    }
  }, {
    key: "getDummyStudentWorkForVLEPreview",
    value: function getDummyStudentWorkForVLEPreview(nodeId, componentId) {
      var componentStates = this.createDummyComponentStates();
      var componentState = this.dataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

      if (componentState != null) {
        componentStates.push(componentState);
      }

      return this.resolveData(componentStates);
    }
  }, {
    key: "getDummyStudentScoresForVLEPreview",
    value: function getDummyStudentScoresForVLEPreview(nodeId, componentId) {
      var annotations = this.createDummyScoreAnnotations();
      var annotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, this.ConfigService.getWorkgroupId());

      if (annotation != null) {
        annotations.push(annotation);
      }

      return this.resolveData(annotations);
    }
  }, {
    key: "getDummyStudentWorkForAuthoringPreview",
    value: function getDummyStudentWorkForAuthoringPreview() {
      return this.resolveData(this.createDummyComponentStates());
    }
  }, {
    key: "getDummyStudentScoresForAuthoringPreview",
    value: function getDummyStudentScoresForAuthoringPreview() {
      return this.resolveData(this.createDummyScoreAnnotations());
    }
  }, {
    key: "resolveData",
    value: function resolveData(data) {
      var deferred = this.$q.defer(); // We need to set a delay otherwise the graph won't render properly

      setTimeout(function () {
        deferred.resolve(data);
      }, 1);
      return deferred.promise;
    }
  }, {
    key: "createDummyComponentStates",
    value: function createDummyComponentStates() {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
      var choices = component.choices;
      var dummyComponentStates = [];

      for (var dummyCounter = 0; dummyCounter < this.numDummySamples; dummyCounter++) {
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
    key: "createDummyScoreAnnotations",
    value: function createDummyScoreAnnotations() {
      var dummyScoreAnnotations = [];

      for (var dummyCounter = 0; dummyCounter < this.numDummySamples; dummyCounter++) {
        dummyScoreAnnotations.push(this.createDummyScoreAnnotation());
      }

      return dummyScoreAnnotations;
    }
  }, {
    key: "createDummyScoreAnnotation",
    value: function createDummyScoreAnnotation() {
      return {
        data: {
          value: this.getRandomScore()
        },
        type: 'score'
      };
    }
  }, {
    key: "getRandomScore",
    value: function getRandomScore() {
      return Math.ceil(Math.random() * this.maxScore);
    }
  }, {
    key: "processComponentStates",
    value: function processComponentStates(componentStates) {
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
      var summaryData = this.createChoicesSummaryData(component, componentStates);

      var _this$createChoicesSe = this.createChoicesSeriesData(component, summaryData),
          data = _this$createChoicesSe.data,
          total = _this$createChoicesSe.total;

      this.calculateCountsAndPercentage(componentStates.length);
      this.renderGraph(data, total);
    }
  }, {
    key: "processScoreAnnotations",
    value: function processScoreAnnotations(annotations) {
      this.updateMaxScoreIfNecessary(annotations);
      var summaryData = this.createScoresSummaryData(annotations);

      var _this$createScoresSer = this.createScoresSeriesData(summaryData),
          data = _this$createScoresSer.data,
          total = _this$createScoresSer.total;

      this.calculateCountsAndPercentage(annotations.length);
      this.renderGraph(data, total);
    }
  }, {
    key: "updateMaxScoreIfNecessary",
    value: function updateMaxScoreIfNecessary(annotations) {
      this.maxScore = this.calculateMaxScore(annotations);
    }
  }, {
    key: "calculateMaxScore",
    value: function calculateMaxScore(annotations) {
      var maxScoreSoFar = this.maxScore;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = annotations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var annotation = _step2.value;
          var score = this.getScoreFromAnnotation(annotation);
          maxScoreSoFar = Math.max(this.maxScore, score);
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

      return maxScoreSoFar;
    }
  }, {
    key: "createChoicesSummaryData",
    value: function createChoicesSummaryData(component, componentStates) {
      var summaryData = {};
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = component.choices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var choice = _step3.value;
          summaryData[choice.id] = this.createChoiceSummaryData(choice.id, choice.text, choice.isCorrect);
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = componentStates[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var componentState = _step4.value;
          this.addComponentStateDataToSummaryData(summaryData, componentState);
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
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = componentState.studentData.studentChoices[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var choice = _step5.value;
          this.incrementSummaryData(summaryData, choice.id);
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
    }
  }, {
    key: "createChoicesSeriesData",
    value: function createChoicesSeriesData(component, summaryData) {
      var data = [];
      var total = 0;
      var hasCorrectness = this.hasCorrectAnswer(component);
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = component.choices[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var choice = _step6.value;
          var count = this.getSummaryDataCount(summaryData, choice.id);
          var color = this.getDataPointColor(choice, hasCorrectness);
          var dataPoint = this.createDataPoint(choice.text, count, color);
          data.push(dataPoint);
          total += count;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return {
        data: data,
        total: total
      };
    }
  }, {
    key: "hasCorrectAnswer",
    value: function hasCorrectAnswer(component) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = component.choices[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var choice = _step7.value;

          if (choice.isCorrect) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
            _iterator7["return"]();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return false;
    }
  }, {
    key: "getDataPointColor",
    value: function getDataPointColor(choice, hasCorrectness) {
      var color = null;

      if (this.highlightCorrectAnswer && hasCorrectness) {
        if (choice.isCorrect) {
          color = '#00C853';
        } else {
          color = '#c62828';
        }
      }

      return color;
    }
  }, {
    key: "createDataPoint",
    value: function createDataPoint(name, y, color) {
      if (color) {
        return {
          name: name,
          y: y,
          color: color
        };
      } else {
        return {
          name: name,
          y: y
        };
      }
    }
  }, {
    key: "createScoresSummaryData",
    value: function createScoresSummaryData(annotations) {
      var summaryData = {};

      for (var scoreValue = 0; scoreValue <= this.maxScore; scoreValue++) {
        summaryData[scoreValue] = this.createScoreSummaryData(scoreValue);
      }

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = annotations[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var annotation = _step8.value;
          this.addAnnotationDataToSummaryData(summaryData, annotation);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
            _iterator8["return"]();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return summaryData;
    }
  }, {
    key: "createScoreSummaryData",
    value: function createScoreSummaryData(score) {
      return {
        score: score,
        count: 0
      };
    }
  }, {
    key: "addAnnotationDataToSummaryData",
    value: function addAnnotationDataToSummaryData(summaryData, annotation) {
      var score = this.getScoreFromAnnotation(annotation);
      this.incrementSummaryData(summaryData, score);
    }
  }, {
    key: "getScoreFromAnnotation",
    value: function getScoreFromAnnotation(annotation) {
      return annotation.data.value;
    }
  }, {
    key: "incrementSummaryData",
    value: function incrementSummaryData(summaryData, id) {
      summaryData[id].count += 1;
    }
  }, {
    key: "createScoresSeriesData",
    value: function createScoresSeriesData(summaryData) {
      var data = [];
      var total = 0;

      for (var scoreValue = 1; scoreValue <= this.maxScore; scoreValue++) {
        var count = this.getSummaryDataCount(summaryData, scoreValue);
        var dataPoint = this.createDataPoint(scoreValue, count);
        data.push(dataPoint);
        total += count;
      }

      return {
        data: data,
        total: total
      };
    }
  }, {
    key: "renderGraph",
    value: function renderGraph(data, total) {
      var chartType = this.chartType;
      var title = this.getGraphTitle();
      var xAxisType = 'category';
      var series = this.createSeries(data);
      this.chartConfig = this.createChartConfig(chartType, title, xAxisType, total, series);
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
  }, {
    key: "getGraphTitle",
    value: function getGraphTitle() {
      if (this.isStudentDataTypeResponses()) {
        return this.$translate('CLASS_RESPONSES') + ' | ' + this.$translate('PERCENT_OF_CLASS_RESPONDED', {
          totalResponses: this.numResponses,
          totalTeams: this.totalWorkgroups,
          percentResponded: this.percentResponded
        });
      } else if (this.isStudentDataTypeScores()) {
        return this.$translate('CLASS_SCORES') + ' | ' + this.$translate('PERCENT_OF_CLASS_RESPONDED', {
          totalResponses: this.numResponses,
          totalTeams: this.totalWorkgroups,
          percentResponded: this.percentResponded
        });
      }
    }
  }, {
    key: "isStudentDataTypeResponses",
    value: function isStudentDataTypeResponses() {
      return this.isStudentDataType('responses');
    }
  }, {
    key: "isStudentDataTypeScores",
    value: function isStudentDataTypeScores() {
      return this.isStudentDataType('scores');
    }
  }, {
    key: "isStudentDataType",
    value: function isStudentDataType(studentDataType) {
      return this.studentDataType === studentDataType;
    }
  }, {
    key: "createChartConfig",
    value: function createChartConfig(chartType, title, xAxisType, total, series) {
      var chartConfig = {
        options: {
          chart: {
            type: chartType,
            style: {
              fontFamily: 'Roboto,Helvetica Neue,sans-serif'
            }
          },
          legend: {
            enabled: false
          },
          tooltip: {
            formatter: function formatter(s, point) {
              if (chartType === 'pie') {
                return '<b>' + this.key + '</b>: ' + this.y;
              } else {
                var pct = this.y / total * 100;
                return '<b>' + this.key + '</b>: ' + Highcharts.numberFormat(pct, 0) + '%';
              }
            }
          },
          exporting: {
            enabled: false
          },
          credits: {
            enabled: false
          },
          plotOptions: {
            series: {
              colorByPoint: true,
              dataLabels: {
                formatter: function formatter() {
                  if (chartType === 'pie') {
                    var pct = this.y / total * 100;
                    return this.key + ': ' + Highcharts.numberFormat(pct, 0) + '%';
                  } else {
                    return this.y;
                  }
                },
                style: {
                  'fontSize': '12px'
                }
              }
            }
          }
        },
        title: {
          text: title,
          style: {
            'fontSize': '16px',
            'fontWeight': '500'
          }
        },
        xAxis: {
          type: xAxisType,
          labels: {
            style: {
              'fontSize': '14px'
            }
          }
        },
        yAxis: {
          title: {
            text: this.$translate('COUNT'),
            style: {
              'fontSize': '14px'
            }
          }
        },
        series: series
      };
      return chartConfig;
    }
  }, {
    key: "calculateCountsAndPercentage",
    value: function calculateCountsAndPercentage(dataCount) {
      this.numResponses = dataCount;
      this.totalWorkgroups = this.getTotalWorkgroups(dataCount);
      this.percentResponded = this.getPercentResponded(dataCount, this.totalWorkgroups);
    }
  }, {
    key: "getTotalWorkgroups",
    value: function getTotalWorkgroups(dataCount) {
      if (this.isVLEPreview() || this.isAuthoringPreview()) {
        return dataCount;
      } else {
        var numWorkgroups = this.ConfigService.getNumberOfWorkgroupsInPeriod(this.periodId);
        return Math.max(numWorkgroups, dataCount);
      }
    }
  }, {
    key: "getPercentResponded",
    value: function getPercentResponded(numResponses, totalWorkgroups) {
      return Math.floor(100 * numResponses / totalWorkgroups);
    }
  }, {
    key: "getSummaryDataCount",
    value: function getSummaryDataCount(summaryData, id) {
      return summaryData[id].count;
    }
  }]);

  return SummaryDisplayController;
}();

SummaryDisplayController.$inject = ['$filter', '$injector', '$q', 'AnnotationService', 'ConfigService', 'ProjectService', 'StudentDataService'];
var SummaryDisplay = {
  bindings: {
    nodeId: '<',
    componentId: '<',
    highlightCorrectAnswer: '<',
    studentDataType: '<',
    periodId: '<',
    chartType: '<',
    hasWarning: '<',
    warningMessage: '<'
  },
  templateUrl: 'wise5/directives/summaryDisplay/summaryDisplay.html',
  controller: SummaryDisplayController,
  controllerAs: 'summaryDisplayCtrl'
};
var _default = SummaryDisplay;
exports["default"] = _default;
//# sourceMappingURL=summaryDisplay.js.map
