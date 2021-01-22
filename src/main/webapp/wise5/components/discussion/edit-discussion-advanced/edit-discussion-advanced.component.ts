import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditDiscussionAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['Discussion'];

  connectedComponentTypeChanged(connectedComponent) {
    this.changeAllDiscussionConnectedComponentTypesToMatch(connectedComponent.type);
    super.connectedComponentTypeChanged(connectedComponent);
  }

  changeAllDiscussionConnectedComponentTypesToMatch(connectedComponentType) {
    for (const connectedComponent of this.authoringComponentContent.connectedComponents) {
      connectedComponent.type = connectedComponentType;
    }
  }

  automaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      const firstConnectedComponent = this.authoringComponentContent.connectedComponents[0];
      connectedComponent.type = firstConnectedComponent.type;
    }
  }
}

export const EditDiscussionAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditDiscussionAdvancedController,
  templateUrl:
    'wise5/components/discussion/edit-discussion-advanced/edit-discussion-advanced.component.html'
};
