import * as angular from 'angular';
import { ConfigService } from "../../services/configService";
import { UtilService } from "../../services/utilService";
import { TeacherProjectService } from "../../services/teacherProjectService";
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { NodeService } from '../../services/nodeService';
import { NotificationService } from '../../services/notificationService';
import { Subscription } from 'rxjs';

export abstract class EditComponentController {

  $translate: any;
  allowedConnectedComponentTypes: any[];
  authoringComponentContent: any;
  componentChangedSubscription: Subscription;
  componentContent: any;
  componentId: string;
  idToOrder: any;
  isDirty: boolean = false;
  isPromptVisible: boolean = true;
  isSaveButtonVisible: boolean;
  isSubmitButtonVisible: boolean;
  isSubmitDirty: boolean = false;
  nodeId: string;
  showAdvancedAuthoring: boolean = false;
  submitCounter: number = 0;
  starterStateResponseSubscription: Subscription;
  showAdvancedAuthoringSubscription: Subscription;

  constructor(
      protected $filter: any,
      protected ConfigService: ConfigService,
      protected NodeService: NodeService,
      protected NotificationService: NotificationService,
      protected ProjectAssetService: ProjectAssetService,
      protected ProjectService: TeacherProjectService,
      protected UtilService: UtilService) {
  }

  $onInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
    this.resetUI();
    this.idToOrder = this.ProjectService.idToOrder;
    this.$translate = this.$filter('translate');
    this.componentChangedSubscription = this.ProjectService.componentChanged$.subscribe(() => {
      this.authoringViewComponentChanged();
    });
    this.showAdvancedAuthoringSubscription =
        this.ProjectService.showAdvancedComponentView$.subscribe((event) => {
      if (event.componentId === this.componentId) {
        this.showAdvancedAuthoring = event.isShow;
        this.NotificationService.hideJSONValidMessage();
      }
    });
    this.starterStateResponseSubscription =
        this.NodeService.starterStateResponse$.subscribe((args: any) => {
      if (this.isForThisComponent(args)) {
        this.saveStarterState(args.starterState);
      }
    });
  }

  $onDestroy() {
    this.componentChangedSubscription.unsubscribe();
    this.starterStateResponseSubscription.unsubscribe();
    this.showAdvancedAuthoringSubscription.unsubscribe();
  }

  authoringViewComponentChanged(): void {
    this.resetUI();
    this.ProjectService.nodeChanged();
  }

  resetUI(): void {
    this.componentContent = this.ConfigService.replaceStudentNames(
        this.ProjectService.injectAssetPaths(this.authoringComponentContent));
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.submitCounter = 0;
  }

  openAssetChooser(params: any): any {
    return this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { return this.assetSelected(data) }
    );
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {
  }

  setShowSubmitButtonValue(show) {
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

  addTag() {
    if (this.authoringComponentContent.tags == null) {
      this.authoringComponentContent.tags = [];
    }
    this.authoringComponentContent.tags.push('');
    this.authoringViewComponentChanged();
  }

  moveTagUp(index) {
    if (index > 0) {
      const tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      this.authoringViewComponentChanged();
    }
  }

  moveTagDown(index) {
    if (index < this.authoringComponentContent.tags.length - 1) {
      const tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      this.authoringViewComponentChanged();
    }
  }

  deleteTag(indexOfTagToDelete) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisTag'))) {
      this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
      this.authoringViewComponentChanged();
    }
  }

  connectedComponentTypeChanged(connectedComponent) {
    this.authoringViewComponentChanged();
  }

  connectedComponentNodeIdChanged(connectedComponent) {
    connectedComponent.componentId = null;
    connectedComponent.type = null;
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  isConnectedComponentTypeAllowed(componentType) {
    for (const allowedConnectedComponentType of this.allowedConnectedComponentTypes) {
      if (allowedConnectedComponentType.type === componentType) {
        return true;
      }
    }
    return false;
  }

  addConnectedComponent() {
    this.addConnectedComponentAndSetComponentIdIfPossible();
    this.authoringViewComponentChanged();
  }

  addConnectedComponentAndSetComponentIdIfPossible() {
    const connectedComponent = this.createConnectedComponent();
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(connectedComponent);
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
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

  automaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      connectedComponent.type = 'importWork';
    }
    this.automaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentFieldsIfPossible(connectedComponent) {
  }

  createConnectedComponent() {
    return {
      nodeId: this.nodeId,
      componentId: null,
      type: null
    };
  }

  deleteConnectedComponent(index) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'))) {
      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }
      this.authoringViewComponentChanged();
    }
  }

  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  isApplicationNode(nodeId) {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  getConnectedComponentType(
      {nodeId, componentId}: { nodeId: string, componentId: string }) {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      return component.type;
    }
    return null;
  }

  isForThisComponent(object) {
    return this.nodeId == object.nodeId && this.componentId == object.componentId;
  }

  saveStarterState(starterState: any) {}
}
