import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';

class EditMultipleChoiceAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['MultipleChoice'];

  constructor(
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(NodeService, ProjectService);
  }

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
      this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
    }
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    connectedComponent.type = 'importWork';
    this.copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent);
    this.componentChanged();
  }

  copyChoiceTypeAndChoicesFromConnectedComponent(connectedComponent) {
    const nodeId = connectedComponent.nodeId;
    const componentId = connectedComponent.componentId;
    if (
      this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId).type ===
      'MultipleChoice'
    ) {
      this.copyChoiceTypeFromComponent(nodeId, componentId);
      this.copyChoicesFromComponent(nodeId, componentId);
    }
  }

  copyChoiceTypeFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    this.authoringComponentContent.choiceType = component.choiceType;
  }

  copyChoicesFromComponent(nodeId, componentId) {
    this.authoringComponentContent.choices = this.getCopyOfChoicesFromComponent(
      nodeId,
      componentId
    );
  }

  getCopyOfChoicesFromComponent(nodeId, componentId) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    return this.UtilService.makeCopyOfJSONObject(component.choices);
  }
}

export const EditMultipleChoiceAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditMultipleChoiceAdvancedController,
  templateUrl:
    'wise5/components/multipleChoice/edit-multiple-choice-advanced/edit-multiple-choice-advanced.component.html'
};
