'use strict';

class SummaryDisplayController {
  constructor($filter, $injector, $q, AnnotationService, ConfigService, ProjectService,
        UtilService) {
    this.$filter = $filter;
    this.$injector = $injector;
    this.$q = $q;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.numDummySamples = 20;
    this.defaultMaxScore = 5;
    this.maxScore = this.defaultMaxScore;
    this.dataService = null;
    this.hasCorrectness = false;
  }

  $onInit() {
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
      this.$onChanges = (changes) => {
        this.renderDisplay();
      }
    }
    this.colors = {
      palette: ['#1a237e','#701e82','#aa187b','#d72c6c','#f65158','#ff7d43','#ffab32','#fdd835',
          '#ffee58','#ade563','#50d67f','#00c29d','#00aab3','#0090bc','#0074b4','#01579b'],
      singleHue: 'rgb(170, 24, 123)',
      correct: '#00C853',
      incorrect: '#c62828'
    }
  }

  isVLEPreview() {
    return this.ConfigService.isPreview();
  }

  isAuthoringPreview() {
    return this.ConfigService.isAuthoring();
  }

  isStudentRun() {
    return this.ConfigService.isStudentRun();
  }

  isClassroomMonitor() {
    return this.ConfigService.isClassroomMonitor();
  }

  renderDisplay() {
    const summaryComponent =
        this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
    if (summaryComponent != null) {
      if (this.studentDataType === 'responses') {
        this.getComponentStates(this.nodeId, this.componentId, this.periodId)
            .then((componentStates = []) => {
          this.processComponentStates(componentStates);
        });
      } else if (this.studentDataType === 'scores') {
        this.setMaxScore(summaryComponent);
        this.getScores(this.nodeId, this.componentId, this.periodId).then((annotations) => {
          this.processScoreAnnotations(annotations);
        });
      }
    } else {
      this.clearChartConfig();
    }
  }

  setMaxScore(component) {
    if (component.maxScore != null) {
      this.maxScore = component.maxScore;
    } else {
      this.maxScore = this.defaultMaxScore;
    }
  }

  clearChartConfig() {
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

  getComponentStates(nodeId, componentId, periodId) {
    if (this.isVLEPreview()) {
      return this.getDummyStudentWorkForVLEPreview(nodeId, componentId);
    } else if (this.isAuthoringPreview()) {
      return this.getDummyStudentWorkForAuthoringPreview(nodeId, componentId);
    } else if (this.isStudentRun()) {
      return this.dataService.getClassmateStudentWork(nodeId, componentId, periodId);
    } else if (this.isClassroomMonitor()) {
      return this.dataService.retrieveLatestStudentDataByNodeIdAndComponentIdAndPeriodId(
          nodeId, componentId, periodId);
    }
  }

  getScores(nodeId, componentId, periodId) {
    if (this.isVLEPreview()) {
      return this.getDummyStudentScoresForVLEPreview(nodeId, componentId);
    } else if (this.isAuthoringPreview()) {
      return this.getDummyStudentScoresForAuthoringPreview(nodeId, componentId);
    } else if (this.isStudentRun()) {
      return this.dataService.getClassmateScores(nodeId, componentId, periodId
          ).then((annotations) => {
        return this.filterLatestScoreAnnotations(annotations);
      });
    } else if (this.isClassroomMonitor()) {
      const annotations = this.dataService.getAnnotationsByNodeIdAndPeriodId(nodeId, periodId);
      return this.resolveData(this.filterLatestScoreAnnotations(annotations));
    }
  }

  filterLatestScoreAnnotations(annotations) {
    const latestAnnotations = {};
    for (const annotation of annotations) {
      if (annotation.type === 'score' || annotation.type === 'autoScore') {
        this.setLatestAnnotationIfNewer(latestAnnotations, annotation);
      }
    }
    return this.convertObjectToArray(latestAnnotations);
  }

  setLatestAnnotationIfNewer(latestAnnotations, annotation) {
    const workgroupId = annotation.toWorkgroupId;
    const latestAnnotation = latestAnnotations[workgroupId];
    if (latestAnnotation == null || annotation.serverSaveTime > latestAnnotation.serverSaveTime) {
      latestAnnotations[workgroupId] = annotation;
    }
  }

  convertObjectToArray(obj) {
    return Object.keys(obj).map((key) => {
      return obj[key]
    })
  }

  getDummyStudentWorkForVLEPreview(nodeId, componentId) {
    const componentStates = this.createDummyComponentStates();
    const componentState = this.dataService
        .getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
    if (componentState != null) {
      componentStates.push(componentState);
    }
    return this.resolveData(componentStates);
  }

  getDummyStudentScoresForVLEPreview(nodeId, componentId) {
    const annotations = this.createDummyScoreAnnotations();
    const annotation = this.AnnotationService.getLatestScoreAnnotation(
        nodeId, componentId, this.ConfigService.getWorkgroupId());
    if (annotation != null) {
      annotations.push(annotation);
    }
    return this.resolveData(annotations);
  }

  getDummyStudentWorkForAuthoringPreview() {
    return this.resolveData(this.createDummyComponentStates());
  }

  getDummyStudentScoresForAuthoringPreview() {
    return this.resolveData(this.createDummyScoreAnnotations());
  }

  resolveData(data) {
    const deferred = this.$q.defer();
    // We need to set a delay otherwise the graph won't render properly
    setTimeout(() => {
      deferred.resolve(data);
    }, 1);
    return deferred.promise;
  }

  createDummyComponentStates() {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId, this.componentId);
    const choices = component.choices;
    const dummyComponentStates = [];
    for (let dummyCounter = 0; dummyCounter < this.numDummySamples; dummyCounter++) {
      dummyComponentStates.push(this.createDummyComponentState(choices));
    }
    return dummyComponentStates;
  }

  createDummyComponentState(choices) {
    return {
      studentData: {
        studentChoices: [
          { id: this.getRandomChoice(choices).id }
        ]
      }
    };
  }

  getRandomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  createDummyScoreAnnotations() {
    const dummyScoreAnnotations = [];
    for (let dummyCounter = 0; dummyCounter < this.numDummySamples; dummyCounter++) {
      dummyScoreAnnotations.push(this.createDummyScoreAnnotation());
    }
    return dummyScoreAnnotations;
  }

  createDummyScoreAnnotation() {
    return {
      data: {
        value: this.getRandomScore()
      },
      type: 'score'
    };
  }

  getRandomScore() {
    return Math.ceil(Math.random() * this.maxScore);
  }

  processComponentStates(componentStates) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId, this.componentId);
    const summaryData = this.createChoicesSummaryData(component, componentStates);
    const data = this.createChoicesSeriesData(component, summaryData);
    this.calculateCountsAndPercentage(componentStates.length);
    this.renderGraph(data, componentStates.length);
  }

  processScoreAnnotations(annotations) {
    this.updateMaxScoreIfNecessary(annotations);
    const summaryData = this.createScoresSummaryData(annotations);
    const { data, total } = this.createScoresSeriesData(summaryData);
    this.calculateCountsAndPercentage(annotations.length);
    this.renderGraph(data, total);
  }

  updateMaxScoreIfNecessary(annotations) {
    this.maxScore = this.calculateMaxScore(annotations);
  }

  calculateMaxScore(annotations) {
    let maxScoreSoFar = this.maxScore;
    for (const annotation of annotations) {
      const score = this.getScoreFromAnnotation(annotation);
      maxScoreSoFar = Math.max(this.maxScore, score);
    }
    return maxScoreSoFar;
  }

  createChoicesSummaryData(component, componentStates) {
    const summaryData = {};
    for (const choice of component.choices) {
      summaryData[choice.id] = this.createChoiceSummaryData(
          choice.id, choice.text, choice.isCorrect);
    }
    for (const componentState of componentStates) {
      this.addComponentStateDataToSummaryData(summaryData, componentState);
    }
    return summaryData;
  }

  createChoiceSummaryData(id, text, isCorrect) {
    return {
      id: id,
      text: text,
      isCorrect: isCorrect,
      count: 0
    };
  }

  addComponentStateDataToSummaryData(summaryData, componentState) {
    for (const choice of componentState.studentData.studentChoices) {
      this.incrementSummaryData(summaryData, choice.id);
    }
  }

  createChoicesSeriesData(component, summaryData) {
    const data = [];
    this.hasCorrectness = this.hasCorrectAnswer(component);
    for (const choice of component.choices) {
      const count = this.getSummaryDataCount(summaryData, choice.id);
      const color = this.getDataPointColor(choice);
      let text = choice.text;
      if (this.highlightCorrectAnswer && this.chartType === 'pie') {
        text = text + ' (' +
          (choice.isCorrect ? this.$translate('CORRECT') : this.$translate('INCORRECT')) + ')';
      }
      const dataPoint = this.createDataPoint(text, count, color);
      data.push(dataPoint);
    }
    return data;
  }

  hasCorrectAnswer(component) {
    for (const choice of component.choices) {
      if (choice.isCorrect) {
        return true;
      }
    }
    return false;
  }

  getDataPointColor(choice) {
    let color = null;
    if (this.highlightCorrectAnswer) {
      if (choice.isCorrect) {
        color = this.colors.correct;
      } else {
        color = this.colors.incorrect;
      }
    }
    return color;
  }

  createDataPoint(name, y, color) {
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

  createScoresSummaryData(annotations) {
    const summaryData = {};
    for (let scoreValue = 0; scoreValue <= this.maxScore; scoreValue++) {
      summaryData[scoreValue] = this.createScoreSummaryData(scoreValue);
    }
    for (const annotation of annotations) {
      this.addAnnotationDataToSummaryData(summaryData, annotation);
    }
    return summaryData;
  }

  createScoreSummaryData(score) {
    return {
      score: score,
      count: 0
    };
  }

  addAnnotationDataToSummaryData(summaryData, annotation) {
    const score = this.getScoreFromAnnotation(annotation);
    this.incrementSummaryData(summaryData, score);
  }

  getScoreFromAnnotation(annotation) {
    return annotation.data.value;
  }

  incrementSummaryData(summaryData, id) {
    summaryData[id].count += 1;
  }

  createScoresSeriesData(summaryData) {
    const data = [];
    let total = 0;
    for (let scoreValue = 1; scoreValue <= this.maxScore; scoreValue++) {
      const count = this.getSummaryDataCount(summaryData, scoreValue);
      const dataPoint = this.createDataPoint(scoreValue, count);
      data.push(dataPoint);
      total += count;
    }
    return { data: data, total: total };
  }

  renderGraph(data, total) {
    const chartType = this.chartType;
    const title = this.getGraphTitle();
    const xAxisType = 'category';
    const series = this.createSeries(data);
    const colors = this.getChartColors();
    this.chartConfig =  this.createChartConfig(chartType, title, xAxisType, total, series, colors);
  }

  createSeries(data) {
    const series = [{
      data: data,
      dataLabels: {
        enabled: true
      }
    }]
    if (this.highlightCorrectAnswer && this.chartType === 'column') {
      series[0].showInLegend = false;
      series.push({
        name: this.$translate('CORRECT'),
        color: this.colors.correct
      }, {
        name: this.$translate('INCORRECT'),
        color: this.colors.incorrect
      });
    }
    return series;
  }

  getGraphTitle() {
    if (this.isStudentDataTypeResponses()) {
      return this.$translate('CLASS_RESPONSES') + ' | ' +
        this.$translate('PERCENT_OF_CLASS_RESPONDED', {
          totalResponses: this.numResponses,
          totalTeams: this.totalWorkgroups,
          percentResponded: this.percentResponded
      });
    } else if (this.isStudentDataTypeScores()) {
      return this.$translate('CLASS_SCORES') + ' | ' +
        this.$translate('PERCENT_OF_CLASS_RESPONDED', {
          totalResponses: this.numResponses,
          totalTeams: this.totalWorkgroups,
          percentResponded: this.percentResponded
      });
    }
  }

  getChartColors() {
    if (this.studentDataType === 'responses') {
      return this.colors.palette;
    } else {
      let colors = [];
      const step = 100/this.maxScore/100*.9;
      let opacity = .1;
      for (let i = 0; i < this.maxScore; i++) {
        opacity = opacity + step;
        const color = this.UtilService.rgbToHex(this.colors.singleHue, opacity);
        colors.push(color);
      }
      return colors;
    }
  }

  isStudentDataTypeResponses() {
    return this.isStudentDataType('responses');
  }

  isStudentDataTypeScores() {
    return this.isStudentDataType('scores');
  }

  isStudentDataType(studentDataType) {
    return this.studentDataType === studentDataType;
  }

  createChartConfig(chartType, title, xAxisType, total, series, colors) {
    const chartConfig = {
      options: {
        colors: colors,
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
          formatter: function(s, point) {
            if (chartType === 'pie') {
              return '<b>' + this.key + '</b>: ' + this.y;
            } else {
              const pct = Math.round(this.y / total * 100);
              return '<b>' + this.key + '</b>: ' + pct + '%';
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
              formatter: function() {
                if (chartType === 'pie') {
                  const pct = Math.round(this.y / total * 100);
                  return this.key + ': ' + pct + '%';
                } else {
                  return this.y;
                }
              },
              style: {'fontSize': '12px'}
            }
          },
          column: {
            maxPointWidth: 80
          }
        }
      },
      title: {
        text: title,
        style: {'fontSize': '16px', 'fontWeight': '500'}
      },
      xAxis: {
        type: xAxisType,
        labels: {
          style: {'fontSize': '14px'}
        }
      },
      yAxis: {
        title: {
          text: this.$translate('COUNT'),
          style: {'fontSize': '14px'}
        }
      },
      series: series
    };
    if (this.highlightCorrectAnswer) {
      chartConfig.options.legend.enabled = true;
      chartConfig.options.plotOptions.series.colorByPoint = false;
      chartConfig.options.plotOptions.series.grouping = false;
      chartConfig.options.plotOptions.series.events = {
        legendItemClick: function() {
          return false;
        }
      }
    }
    return chartConfig;
  }

  calculateCountsAndPercentage(dataCount) {
    this.numResponses = dataCount;
    this.totalWorkgroups = this.getTotalWorkgroups(dataCount);
    this.percentResponded = this.getPercentResponded(dataCount, this.totalWorkgroups);
  }

  getTotalWorkgroups(dataCount) {
    if (this.isVLEPreview() || this.isAuthoringPreview()) {
      return dataCount;
    } else {
      const numWorkgroups = this.ConfigService.getNumberOfWorkgroupsInPeriod(this.periodId);
      return Math.max(numWorkgroups, dataCount);
    }
  }

  getPercentResponded(numResponses, totalWorkgroups) {
    return Math.floor(100 * numResponses / totalWorkgroups);
  }

  getSummaryDataCount(summaryData, id) {
    return summaryData[id].count;
  }
}

SummaryDisplayController.$inject = [
  '$filter',
  '$injector',
  '$q',
  'AnnotationService',
  'ConfigService',
  'ProjectService',
  'UtilService'
];

const SummaryDisplay = {
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
}

export default SummaryDisplay;
