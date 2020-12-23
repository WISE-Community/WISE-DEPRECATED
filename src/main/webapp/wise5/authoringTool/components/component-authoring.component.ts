import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { ConfigService } from "../../services/configService";
import { NodeService } from "../../services/nodeService";
import { TeacherProjectService } from "../../services/teacherProjectService";

@Component({
  template: ''
})
export abstract class ComponentAuthoring {

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
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService
  ) {

  }

  ngOnInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, this.componentId);
    this.resetUI();
    this.idToOrder = this.ProjectService.idToOrder;
    this.componentChangedSubscription = this.ProjectService.componentChanged$.subscribe(() => {
      this.authoringViewComponentChanged();
    });
    this.starterStateResponseSubscription =
        this.NodeService.starterStateResponse$.subscribe((args: any) => {
      if (this.isForThisComponent(args)) {
        this.saveStarterState(args.starterState);
      }
    });
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

  isForThisComponent(object) {
    return this.nodeId == object.nodeId && this.componentId == object.componentId;
  }

  saveStarterState(starterState: any) {}
}