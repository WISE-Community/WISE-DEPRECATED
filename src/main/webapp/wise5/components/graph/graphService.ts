'use strict';

import * as angular from 'angular';
import * as html2canvas from 'html2canvas';
import { Injectable } from '@angular/core';
import { ComponentService } from '../componentService';
import { StudentAssetService } from '../../services/studentAssetService';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import { UpgradeModule } from '@angular/upgrade/static';

@Injectable()
export class GraphService extends ComponentService {
  seriesColors: string[] = ['blue', 'red', 'green', 'orange', 'purple', 'black'];

  constructor(
    private upgrade: UpgradeModule,
    private StudentAssetService: StudentAssetService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.getTranslation('graph.componentTypeLabel');
  }

  getTranslation(key: string) {
    return this.upgrade.$injector.get('$filter')('translate')(key);
  }

  /**
   * Create a Graph component object
   * @returns a new Graph component object
   */
  createComponent() {
    const component: any = super.createComponent();
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
        text: this.getTranslation('graph.timeSeconds'),
        useHTML: true
      },
      min: 0,
      max: 100,
      units: this.getTranslation('graph.secondsUnit'),
      locked: true,
      type: 'limits',
      allowDecimals: false
    };
    component.yAxis = {
      title: {
        text: this.getTranslation('graph.positionMeters'),
        useHTML: true,
        style: {
          color: null
        }
      },
      labels: {
        style: {
          color: null
        }
      },
      min: 0,
      max: 100,
      units: this.getTranslation('graph.metersUnit'),
      locked: true,
      allowDecimals: false
    };
    component.series = [
      {
        name: this.getTranslation('graph.prediction'),
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

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (this.canEdit(component)) {
      return this.hasCompletedComponentState(componentStates, node, component);
    } else {
      return this.UtilService.hasNodeEnteredEvent(nodeEvents);
    }
  }

  hasCompletedComponentState(componentStates: any[], node: any, component: any) {
    if (this.hasComponentStates(componentStates)) {
      if (this.isSubmitRequired(node, component)) {
        return this.hasSubmitComponentState(componentStates);
      } else {
        const latestComponentState = componentStates[componentStates.length - 1];
        return this.componentStateHasStudentWork(latestComponentState);
      }
    }
    return false;
  }

  hasComponentStates(componentStates: any[]) {
    return componentStates != null && componentStates.length > 0;
  }

  hasSubmitComponentState(componentStates: any[]) {
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
  canEdit(component: any) {
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

  hasSeriesData(studentData: any) {
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

  hasTrialData(studentData: any) {
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

  componentStateHasStudentWork(componentState: any, componentContent: any = null) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      if (studentData != null && this.isStudentDataHasWork(studentData)) {
        return true;
      }
      if (this.isStudentChangedAxisLimit(componentState, componentContent)) {
        return true;
      }
    }
    return false;
  }

  isStudentDataHasWork(studentData: any) {
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
       * this is the new graph student data format where the student data can contain multiple
       * trials and each trial can contain multiple series.
       */
      if (this.anyTrialHasDataPoint(studentData.trials)) {
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
  isStudentChangedAxisLimit(componentState: any, componentContent: any) {
    if (componentState != null && componentState.studentData != null && componentContent != null) {
      if (
        this.isXAxisChanged(componentState, componentContent) ||
        this.isYAxisChanged(componentState, componentContent)
      ) {
        return true;
      }
    }
    return false;
  }

  isXAxisChanged(componentState: any, componentContent: any) {
    if (componentState.studentData.xAxis != null && componentContent.xAxis != null) {
      if (
        componentState.studentData.xAxis.min != componentContent.xAxis.min ||
        componentState.studentData.xAxis.max != componentContent.xAxis.max
      ) {
        return true;
      }
    }
    return false;
  }

  isYAxisChanged(componentState: any, componentContent: any) {
    if (componentState.studentData.yAxis != null && componentContent.yAxis != null) {
      if (
        componentState.studentData.yAxis.min != componentContent.yAxis.min ||
        componentState.studentData.yAxis.max != componentContent.yAxis.max
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if any of the trials contains a data point
   * @param trials an array of trials
   * @return whether any of the trials contains a data point
   */
  anyTrialHasDataPoint(trials: any[]) {
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
  trialHasDataPoint(trial: any) {
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
  anySeriesHasDataPoint(multipleSeries: any[]) {
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
  seriesHasDataPoint(singleSeries: any) {
    return singleSeries.data.length > 0;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState: any) {
    return new Promise((resolve, reject) => {
      const highchartsDiv = this.getHighchartsDiv(componentState.componentId);
      html2canvas(highchartsDiv).then((canvas) => {
        const base64Image = canvas.toDataURL('image/png');
        const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
        this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
          resolve(asset);
        });
      });
    });
  }

  getHighchartsDiv(componentId: string) {
    const highchartsDiv = angular.element('#chart_' + componentId).find('.highcharts-container');
    if (highchartsDiv != null && highchartsDiv.length > 0) {
      return highchartsDiv[0];
    } else {
      return null;
    }
  }

  isMultipleYAxes(yAxis: any): boolean {
    return Array.isArray(yAxis);
  }

  getSeriesColor(index: number): string {
    return this.seriesColors[index];
  }
}
