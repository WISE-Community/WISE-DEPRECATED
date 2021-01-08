import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditGraphAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = [
    'Animation',
    'ConceptMap',
    'Draw',
    'Embedded',
    'Graph',
    'Label',
    'Table'
  ];

  addXAxisPlotLine(): void {
    if (this.authoringComponentContent.xAxis.plotLines == null) {
      this.authoringComponentContent.xAxis.plotLines = [];
    }
    const plotLine = {
      color: 'gray',
      width: 1,
      value: null,
      label: {
        text: '',
        verticalAlign: 'bottom',
        textAlign: 'right',
        y: -10,
        style: {
          fontWeight: 'bold'
        }
      }
    };
    this.authoringComponentContent.xAxis.plotLines.push(plotLine);
  }

  deleteXAxisPlotLine(index: number): void {
    this.authoringComponentContent.xAxis.plotLines.splice(index, 1);
    this.componentChanged();
  }

  addYAxisPlotLine(): void {
    if (this.authoringComponentContent.yAxis.plotLines == null) {
      this.authoringComponentContent.yAxis.plotLines = [];
    }
    const plotLine = {
      color: 'gray',
      width: 1,
      value: null,
      label: {
        text: '',
        style: {
          fontWeight: 'bold'
        }
      }
    };
    this.authoringComponentContent.yAxis.plotLines.push(plotLine);
  }

  deleteYAxisPlotLine(index: number): void {
    this.authoringComponentContent.yAxis.plotLines.splice(index, 1);
    this.componentChanged();
  }

  addConnectedComponent() {
    this.addConnectedComponentAndSetComponentIdIfPossible();
    if (
      this.authoringComponentContent.connectedComponents.length > 1 ||
      this.authoringComponentContent.series.length > 0
    ) {
      // enable trials so each connected component can put work in a different trial
      this.authoringComponentContent.enableTrials = true;
    }
    this.componentChanged();
  }

  addConnectedComponentSeriesNumber(connectedComponent) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    connectedComponent.seriesNumbers.push(null);
    this.componentChanged();
  }

  deleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    connectedComponent.seriesNumbers.splice(seriesNumberIndex, 1);
    this.componentChanged();
  }

  connectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {
    if (connectedComponent.seriesNumbers == null) {
      connectedComponent.seriesNumbers = [];
    }
    if (seriesNumberIndex < connectedComponent.seriesNumbers.length) {
      connectedComponent.seriesNumbers[seriesNumberIndex] = value;
    }
    this.componentChanged();
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    const connectedComponentType = this.getConnectedComponentType(connectedComponent);
    if (connectedComponentType !== 'Embedded') {
      delete connectedComponent.seriesNumbers;
    }
    if (connectedComponentType !== 'Table') {
      delete connectedComponent.skipFirstRow;
      delete connectedComponent.xColumn;
      delete connectedComponent.yColumn;
    }
    if (connectedComponentType !== 'Graph') {
      delete connectedComponent.showClassmateWorkSource;
    }
    if (connectedComponentType === 'Table') {
      connectedComponent.skipFirstRow = true;
      connectedComponent.xColumn = 0;
      connectedComponent.yColumn = 1;
    }
    connectedComponent.type = 'importWork';
    this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.componentChanged();
  }

  connectedComponentShowClassmateWorkChanged(connectedComponent) {
    if (connectedComponent.showClassmateWork) {
      connectedComponent.showClassmateWorkSource = 'period';
    } else {
      delete connectedComponent.showClassmateWork;
      delete connectedComponent.showClassmateWorkSource;
    }
    this.componentChanged();
  }

  setImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.getConnectedComponentType(connectedComponent);
    if (['ConceptMap', 'Draw', 'Label'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  connectedComponentTypeChanged(connectedComponent) {
    if (connectedComponent.type === 'importWork') {
      delete connectedComponent.showClassmateWorkSource;
    } else if (connectedComponent.type === 'showWork') {
      delete connectedComponent.showClassmateWorkSource;
    } else if (connectedComponent.type === 'showClassmateWork') {
      // enable trials so each classmate work will show up in a different trial
      this.authoringComponentContent.enableTrials = true;
      if (connectedComponent.showClassmateWorkSource == null) {
        connectedComponent.showClassmateWorkSource = 'period';
      }
    }
    this.componentChanged();
  }

  importWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.componentChanged();
  }
}

export const EditGraphAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditGraphAdvancedController,
  templateUrl: 'wise5/components/graph/edit-graph-advanced/edit-graph-advanced.component.html'
};
