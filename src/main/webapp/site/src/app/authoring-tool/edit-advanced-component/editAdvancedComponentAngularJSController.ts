import { NodeService } from "../../../../../wise5/services/nodeService";
import { TeacherProjectService } from "../../../../../wise5/services/teacherProjectService";

export class EditAdvancedComponentAngularJSController {

  authoringComponentContent: any;
  componentId: string;
  nodeId: string;
  allowedConnectedComponentTypes: any[];
  idToOrder: any;

  static $inject = ['NodeService','ProjectService'];

  constructor(
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService
  ) {
  }

  $onInit(): void {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId, this.componentId);
    this.idToOrder = this.ProjectService.idToOrder;
  }

  authoringViewComponentChanged(): void {
    this.ProjectService.nodeChanged();
  }

  addConnectedComponent(): void {
    this.addConnectedComponentAndSetComponentIdIfPossible();
    this.authoringViewComponentChanged();
  }

  addConnectedComponentAndSetComponentIdIfPossible(): void {
    const connectedComponent = this.createConnectedComponent();
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(connectedComponent);
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent: any): void {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.ProjectService.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (this.isConnectedComponentTypeAllowed(component.type) &&
          component.id != this.componentId) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
    }
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
  }

  connectedComponentTypeChanged(connectedComponent: any): void {
    this.authoringViewComponentChanged();
  }

  connectedComponentNodeIdChanged(connectedComponent: any): void {
    connectedComponent.componentId = null;
    connectedComponent.type = null;
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  connectedComponentComponentIdChanged(connectedComponent: any): void {
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  isConnectedComponentTypeAllowed(componentType: any): boolean {
    for (const allowedConnectedComponentType of this.allowedConnectedComponentTypes) {
      if (allowedConnectedComponentType.type === componentType) {
        return true;
      }
    }
    return false;
  }

  automaticallySetConnectedComponentTypeIfPossible(connectedComponent: any): void {
    if (connectedComponent.componentId != null) {
      connectedComponent.type = 'importWork';
    }
    this.automaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentFieldsIfPossible(connectedComponent: any): void {
  }

  createConnectedComponent(): any {
    return {
      nodeId: this.nodeId,
      componentId: null,
      type: null
    };
  }

  deleteConnectedComponent(index: number): void {
    if (confirm($localize`Are you sure you want to delete this connected component?`)) {
      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }
      this.authoringViewComponentChanged();
    }
  }

  getNodePositionAndTitleByNodeId(nodeId: string): string {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  isApplicationNode(nodeId: string): boolean {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  getComponentsByNodeId(nodeId: string): any[] {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  setShowSubmitButtonValue(show: boolean): void {
    if (show == null || show == false) {
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }
    this.NodeService.broadcastComponentShowSubmitButtonValueChanged({
      nodeId: this.nodeId,
      componentId: this.componentId,
      showSubmitButton: show
    });
  }
}
