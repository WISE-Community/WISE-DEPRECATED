import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditGraphAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['Animation', 'ConceptMap', 'Draw', 'Embedded', 'Graph', 'Label',
      'Table'];

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
    this.authoringViewComponentChanged();
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
    this.authoringViewComponentChanged();
  }

}

export const EditGraphAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditGraphAdvancedController,
  templateUrl: 'wise5/components/graph/edit-graph-advanced/edit-graph-advanced.component.html'
}
