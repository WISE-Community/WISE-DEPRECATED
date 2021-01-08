import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditLabelAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = [
    'ConceptMap',
    'Draw',
    'Embedded',
    'Graph',
    'Label',
    'OpenResponse',
    'Table'
  ];

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent: any): void {
    super.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    if (connectedComponent.componentId != null) {
      this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    }
  }

  connectedComponentComponentIdChanged(connectedComponent: any): void {
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.componentChanged();
  }

  setImportWorkAsBackgroundIfApplicable(connectedComponent: any): void {
    const componentType = this.getConnectedComponentType(connectedComponent);
    if (['ConceptMap', 'Draw', 'Embedded', 'Graph', 'Table'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  importWorkAsBackgroundClicked(connectedComponent: any): void {
    if (connectedComponent.importWorkAsBackground) {
      connectedComponent.charactersPerLine = 100;
      connectedComponent.spaceInbetweenLines = 40;
      connectedComponent.fontSize = 16;
    } else {
      delete connectedComponent.charactersPerLine;
      delete connectedComponent.spaceInbetweenLines;
      delete connectedComponent.fontSize;
      delete connectedComponent.importWorkAsBackground;
    }
    this.componentChanged();
  }
}

export const EditLabelAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditLabelAdvancedController,
  templateUrl: 'wise5/components/label/edit-label-advanced/edit-label-advanced.component.html'
};
