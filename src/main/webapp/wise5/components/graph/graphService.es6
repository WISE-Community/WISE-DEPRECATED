import ComponentService from '../componentService';
import html2canvas from 'html2canvas';

class GraphService extends ComponentService {
  constructor($filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('graph.componentTypeLabel');
  }

  /**
   * Create a Graph component object
   * @returns a new Graph component object
   */
  createComponent() {
    const component = super.createComponent();
    component.type = 'Graph';
    component.title = '';
    component.width = 800;
    component.height = 500;
    component.enableTrials = false;
    component.canCreateNewTrials = false;
    component.canDeleteTrials = false;
    component.hideAllTrialsOnNewTrial = false;
    component.canStudentHideSeriesOnLegendClick = false;
    component.roundValuesTo = 'integer';
    component.graphType = 'line';
    component.xAxis = {
      title: {
        text: this.$translate('graph.timeSeconds'),
        useHTML: true
      },
      min: 0,
      max: 100,
      units: this.$translate('graph.secondsUnit'),
      locked: true,
      type: 'limits'
    };
    component.yAxis = {
      title: {
        text: this.$translate('graph.positionMeters'),
        useHTML: true
      },
      min: 0,
      max: 100,
      units: this.$translate('graph.metersUnit'),
      locked: true
    };
    component.series = [
      {
        name: this.$translate('graph.prediction'),
        data: [],
        color: 'blue',
        dashStyle: 'Solid',
        marker: {
          symbol: 'circle'
        },
        canEdit: true,
        type: 'line'
      }
    ];
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    if (this.canEdit(component)) {
      if (this.hasComponentStates(componentStates)) {
        if (this.isSubmitRequired(node, component)) {
          return this.hasSubmitComponentState(componentStates);
        } else {
          const componentState = componentStates[componentStates.length - 1];
          return this.componentStateHasStudentWork(componentState);
        }
      }
    } else {
      return this.UtilService.hasNodeEnteredEvent(nodeEvents);
    }
    return false;
  }

  hasComponentStates(componentStates) {
    return componentStates != null && componentStates.length > 0;
  }

  isSubmitRequired(node, component) {
    return node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);
  }

  hasSubmitComponentState(componentStates) {
    for (const componentState of componentStates) {
      if (componentState.isSubmit && this.componentStateHasStudentWork(componentState)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine if the student can perform any work on this component.
   * @param component The component content.
   * @return Whether the student can perform any work on this component.
   */
  canEdit(component) {
    const series = component.series;
    for (const singleSeries of series) {
      if (singleSeries.canEdit) {
        return true;
      }
    }
    if (this.UtilService.hasImportWorkConnectedComponent(component)) {
      return true;
    }
    return false;
  }

  hasSeriesData(studentData) {
    const series = studentData.series;
    if (series != null) {
      for (const singleSeries of series) {
        if (singleSeries.data != null && singleSeries.data.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  hasTrialData(studentData) {
    const trials = studentData.trials;
    if (trials != null) {
      for (const trial of trials) {
        for (const singleSeries of trial.series) {
          const seriesData = singleSeries.data;
          if (seriesData.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      if (studentData != null) {
        if (studentData.version == 1) {
          /*
           * this is the old graph student data format where the
           * student data can contain multiple series.
           */
           if (this.anySeriesHasDataPoint(studentData.series)) {
             return true;
           }
        } else {
          /*
           * this is the new graph student data format where the
           * student data can contain multiple trials and each trial
           * can contain multiple series.
           */
          if (this.anyTrialHasDataPoint(studentData.trials)) {
            return true;
          }
        }
      }
      if (this.isStudentChangedAxisLimit(componentState, componentContent)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the student has changed any of the axis limits
   * @param componentState the component state
   * @param componentContent the component content
   * @return whether the student has changed any of the axis limits
   */
  isStudentChangedAxisLimit(componentState, componentContent) {
    if (componentState != null && componentState.studentData != null && componentContent != null) {
      if (componentState.studentData.xAxis != null && componentContent.xAxis != null) {
        if (componentState.studentData.xAxis.min != componentContent.xAxis.min) {
          return true;
        } else if (componentState.studentData.xAxis.max != componentContent.xAxis.max) {
          return true;
        }
      }
      if (componentState.studentData.yAxis != null && componentContent.yAxis != null) {
        if (componentState.studentData.yAxis.min != componentContent.yAxis.min) {
          return true;
        } else if (componentState.studentData.yAxis.max != componentContent.yAxis.max) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if any of the trials contains a data point
   * @param trials an array of trials
   * @return whether any of the trials contains a data point
   */
  anyTrialHasDataPoint(trials) {
    for (const trial of trials) {
      if (this.trialHasDataPoint(trial)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a trial has a data point
   * @param trial a trial object which can contain multiple series
   * @return whether the trial contains a data point
   */
  trialHasDataPoint(trial) {
    for (const singleSeries of trial.series) {
      if (this.seriesHasDataPoint(singleSeries)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if an array of series has any data point
   * @param multipleSeries an array of series
   * @return whether any of the series has a data point
   */
  anySeriesHasDataPoint(multipleSeries) {
    if (multipleSeries != null) {
      for (const singleSeries of multipleSeries) {
        if (this.seriesHasDataPoint(singleSeries)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a series has a data point
   * @param singleSeries a series object
   * @return whether the series object has any data points
   */
  seriesHasDataPoint(singleSeries) {
    return singleSeries.data.length > 0;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    const deferred = this.$q.defer();
    const componentId = componentState.componentId;
    let highchartsDiv = angular.element('#chart_' + componentId).find('.highcharts-container');
    if (highchartsDiv != null && highchartsDiv.length > 0) {
      highchartsDiv = highchartsDiv[0];
      html2canvas(highchartsDiv).then((canvas) => {
        const base64Image = canvas.toDataURL('image/png');
        const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
        this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
          deferred.resolve(asset);
        });
      });
    }
    return deferred.promise;
  }
}

GraphService.$inject = [
  '$filter',
  '$q',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default GraphService;
