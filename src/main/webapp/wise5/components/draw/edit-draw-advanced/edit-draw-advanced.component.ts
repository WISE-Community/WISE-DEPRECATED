import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditDrawAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['ConceptMap', 'Draw', 'Embedded', 'Graph', 'Label', 'Table'];

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (
        this.isConnectedComponentTypeAllowed(component.type) &&
        component.id != this.componentId
      ) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
      this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    }
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    connectedComponent.type = 'importWork';
    this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.componentChanged();
  }

  setImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.ProjectService.getComponentType(
      connectedComponent.nodeId,
      connectedComponent.componentId
    );
    if (['ConceptMap', 'Embedded', 'Graph', 'Label', 'Table'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  importWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.componentChanged();
  }
}

export const EditDrawAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditDrawAdvancedController,
  templateUrl: 'wise5/components/draw/edit-draw-advanced/edit-draw-advanced.component.html'
};
