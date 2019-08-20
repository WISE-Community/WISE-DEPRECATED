'use strict';

class SummaryDisplayController {
  constructor($filter, $injector, $q, AnnotationService, ConfigService, ProjectService) {
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
      this.$onChanges = (changes) => {
        this.renderDisplay();
      }
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
    const { data, total } = this.createChoicesSeriesData(component, summaryData);
    this.calculateCountsAndPercentage(componentStates.length);
    this.renderGraph(data, total);
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
    let total = 0;
    const hasCorrectness = this.hasCorrectAnswer(component);
    for (const choice of component.choices) {
      const count = this.getSummaryDataCount(summaryData, choice.id);
      const color = this.getDataPointColor(choice, hasCorrectness);
      const dataPoint = this.createDataPoint(choice.text, count, color);
      data.push(dataPoint);
      total += count;
    }
    return { data: data, total: total };
  }

  hasCorrectAnswer(component) {
    for (const choice of component.choices) {
      if (choice.isCorrect) {
        return true;
      }
    }
    return false;
  }

  getDataPointColor(choice, hasCorrectness) {
    let color = null;
    if (this.highlightCorrectAnswer && hasCorrectness) {
      if (choice.isCorrect) {
        color = '#00C853';
      } else {
        color = '#c62828';
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
    this.chartConfig =  this.createChartConfig(chartType, title, xAxisType, total, series);
  }

  createSeries(data) {
    return [{
      data: data,
      dataLabels: {
        enabled: true
      }
    }];
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

  isStudentDataTypeResponses() {
    return this.isStudentDataType('responses');
  }

  isStudentDataTypeScores() {
    return this.isStudentDataType('scores');
  }
  
  isStudentDataType(studentDataType) {
    return this.studentDataType === studentDataType;
  }

  createChartConfig(chartType, title, xAxisType, total, series) {
    const chartConfig = {
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
          formatter: function(s, point) {
            if (chartType === 'pie') {
              return '<b>' + this.key + '</b>: ' + this.y;
            } else {
              const pct = this.y / total * 100;
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
              formatter: function() {
                if (chartType === 'pie') {
                  const pct = this.y / total * 100;
                  return this.key + ': ' + Highcharts.numberFormat(pct, 0) + '%';
                } else {
                  return this.y;
                }
              },
              style: {'fontSize': '12px'}
            }
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
  'StudentDataService'
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
