import * as angular from 'angular';
import { ConfigService } from '../../services/configService';
import { UtilService } from '../../services/utilService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { NodeService } from '../../services/nodeService';
import { NotificationService } from '../../services/notificationService';
import { Subscription } from 'rxjs';

export abstract class EditComponentController {
  $translate: any;
  allowedConnectedComponentTypes: string[];
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

  constructor(
    protected $filter: any,
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected NotificationService: NotificationService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {}

  $onInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    this.resetUI();
    this.idToOrder = this.ProjectService.idToOrder;
    this.$translate = this.$filter('translate');
    this.componentChangedSubscription = this.ProjectService.componentChanged$.subscribe(() => {
      this.componentChanged();
    });
    this.starterStateResponseSubscription = this.NodeService.starterStateResponse$.subscribe(
      (args: any) => {
        if (this.isForThisComponent(args)) {
          this.saveStarterState(args.starterState);
        }
      }
    );
  }

  $onDestroy() {
    this.componentChangedSubscription.unsubscribe();
    this.starterStateResponseSubscription.unsubscribe();
  }

  componentChanged(): void {
    this.resetUI();
    this.ProjectService.nodeChanged();
  }

  resetUI(): void {
    this.componentContent = this.ConfigService.replaceStudentNames(
      this.ProjectService.injectAssetPaths(this.authoringComponentContent)
    );
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.submitCounter = 0;
  }

  openAssetChooser(params: any): any {
    return this.ProjectAssetService.openAssetChooser(params).then((data: any) => {
      return this.assetSelected(data);
    });
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {}

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

  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  isApplicationNode(nodeId) {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  isForThisComponent(object) {
    return this.nodeId == object.nodeId && this.componentId == object.componentId;
  }

  saveStarterState(starterState: any) {}
}
