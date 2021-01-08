import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditTableAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['Embedded', 'Graph', 'Table'];
  isDataExplorerScatterPlotEnabled: boolean;
  isDataExplorerLineGraphEnabled: boolean;
  isDataExplorerBarGraphEnabled: boolean;

  $onInit(): void {
    super.$onInit();
    if (this.authoringComponentContent.isDataExplorerEnabled) {
      this.repopulateDataExplorerGraphTypes();
      this.initializeDataExplorerSeriesParams();
    }
  }

  initializeDataExplorerSeriesParams(): void {
    if (this.authoringComponentContent.dataExplorerSeriesParams == null) {
      this.authoringComponentContent.dataExplorerSeriesParams = [];
      for (let s = 0; s < this.authoringComponentContent.numDataExplorerSeries; s++) {
        this.authoringComponentContent.dataExplorerSeriesParams.push({});
      }
    }
  }

  initializeDataExplorerGraphTypes(): void {
    this.authoringComponentContent.dataExplorerGraphTypes = [];
    this.authoringComponentContent.dataExplorerGraphTypes.push(
      this.createGraphTypeObject('Scatter Plot', 'scatter')
    );
  }

  repopulateDataExplorerGraphTypes(): void {
    this.isDataExplorerScatterPlotEnabled = false;
    this.isDataExplorerLineGraphEnabled = false;
    this.isDataExplorerBarGraphEnabled = false;
    for (const graphType of this.authoringComponentContent.dataExplorerGraphTypes) {
      if (graphType.value === 'scatter') {
        this.isDataExplorerScatterPlotEnabled = true;
      } else if (graphType.value === 'line') {
        this.isDataExplorerLineGraphEnabled = true;
      } else if (graphType.value === 'column') {
        this.isDataExplorerBarGraphEnabled = true;
      }
    }
  }

  toggleDataExplorer(): void {
    if (this.authoringComponentContent.isDataExplorerEnabled) {
      if (this.authoringComponentContent.dataExplorerGraphTypes == null) {
        this.initializeDataExplorerGraphTypes();
        this.repopulateDataExplorerGraphTypes();
      }
      if (this.authoringComponentContent.numDataExplorerSeries == null) {
        this.authoringComponentContent.numDataExplorerSeries = 1;
      }
      if (this.authoringComponentContent.numDataExplorerYAxis == null) {
        this.authoringComponentContent.numDataExplorerYAxis = 1;
      }
      if (this.authoringComponentContent.isDataExplorerAxisLabelsEditable == null) {
        this.authoringComponentContent.isDataExplorerAxisLabelsEditable = false;
      }
      if (this.authoringComponentContent.dataExplorerSeriesParams == null) {
        this.authoringComponentContent.dataExplorerSeriesParams = [{}];
      }
    }
    this.componentChanged();
  }

  dataExplorerToggleScatterPlot(): void {
    this.dataExplorerToggleGraphType('Scatter Plot', 'scatter');
  }

  dataExplorerToggleLineGraph(): void {
    this.dataExplorerToggleGraphType('Line Graph', 'line');
  }

  dataExplorerToggleBarGraph(): void {
    this.dataExplorerToggleGraphType('Bar Graph', 'column');
  }

  dataExplorerToggleGraphType(name: string, value: string): void {
    const graphTypes = this.authoringComponentContent.dataExplorerGraphTypes;
    for (let index = 0; index < graphTypes.length; index++) {
      if (graphTypes[index].value === value) {
        graphTypes.splice(index, 1);
        this.componentChanged();
        return;
      }
    }
    graphTypes.push(this.createGraphTypeObject(name, value));
    this.componentChanged();
  }

  createGraphTypeObject(name: string, value: string): any {
    return { name: name, value: value };
  }

  numDataExplorerSeriesChanged(): void {
    const count = this.authoringComponentContent.numDataExplorerSeries;
    if (this.authoringComponentContent.dataExplorerSeriesParams.length < count) {
      this.increaseNumDataExplorerSeries(count);
    } else if (this.authoringComponentContent.dataExplorerSeriesParams.length > count) {
      this.decreaseNumDataExplorerSeries(count);
    }
    this.componentChanged();
  }

  increaseNumDataExplorerSeries(count: number): void {
    const numToAdd = count - this.authoringComponentContent.dataExplorerSeriesParams.length;
    for (let s = 0; s < numToAdd; s++) {
      this.authoringComponentContent.dataExplorerSeriesParams.push({});
    }
  }

  decreaseNumDataExplorerSeries(count: number): void {
    this.authoringComponentContent.dataExplorerSeriesParams = this.authoringComponentContent.dataExplorerSeriesParams.slice(
      0,
      count
    );
  }

  numDataExplorerYAxisChanged(): void {
    this.updateDataExplorerSeriesParamsYAxis();
    this.componentChanged();
  }

  updateDataExplorerSeriesParamsYAxis(): void {
    for (const params of this.authoringComponentContent.dataExplorerSeriesParams) {
      if (params.yAxis >= this.authoringComponentContent.numDataExplorerYAxis) {
        params.yAxis = 0;
      }
    }
  }
}

export const EditTableAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditTableAdvancedController,
  templateUrl: 'wise5/components/table/edit-table-advanced/edit-table-advanced.component.html'
};
