import { Directive, Input } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ConfigService } from "../../services/configService";
import { NodeService } from "../../services/nodeService";
import { TeacherProjectService } from "../../services/teacherProjectService";

@Directive()
export abstract class ComponentAuthoring {
  @Input()
  nodeId: string;

  @Input()
  componentId: string;

  promptChange: Subject<string> = new Subject<string>();
  allowedConnectedComponentTypes: string[];
  authoringComponentContent: any;
  componentChangedSubscription: Subscription;
  componentContent: any;
  idToOrder: any;
  isDirty: boolean = false;
  isPromptVisible: boolean = true;
  isSaveButtonVisible: boolean;
  isSubmitButtonVisible: boolean;
  isSubmitDirty: boolean = false;
  showAdvancedAuthoring: boolean = false;
  submitCounter: number = 0;
  starterStateResponseSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService
  ) {

    this.promptChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((prompt: string) => {
        this.authoringComponentContent.prompt = prompt;
        this.authoringViewComponentChanged();
      });
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

  promptChanged(prompt: string): void {
    this.promptChange.next(prompt);
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

  isForThisComponent(object: any): boolean {
    return object.nodeId == this.nodeId && object.componentId == this.componentId;
  }

  saveStarterState(starterState: any): void {}
}