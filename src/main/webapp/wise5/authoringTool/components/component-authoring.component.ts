import { Directive, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { ConfigService } from '../../services/configService';
import { NodeService } from '../../services/nodeService';
import { TeacherProjectService } from '../../services/teacherProjectService';

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
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService
  ) {
    this.promptChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((prompt: string) => {
        this.authoringComponentContent.prompt = prompt;
        this.componentChanged();
      });
  }

  ngOnInit() {
    this.authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    this.resetUI();
    this.idToOrder = this.ProjectService.idToOrder;
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

  ngOnDestroy() {
    this.componentChangedSubscription.unsubscribe();
    this.starterStateResponseSubscription.unsubscribe();
  }

  promptChanged(prompt: string): void {
    this.promptChange.next(prompt);
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

  isForThisComponent(object: any): boolean {
    return object.nodeId == this.nodeId && object.componentId == this.componentId;
  }

  saveStarterState(starterState: any): void {}

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

  chooseBackgroundImage(): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.openAssetChooser(params);
  }

  openAssetChooser(params: any): any {
    return this.ProjectAssetService.openAssetChooser(params).then((data: any) => {
      return this.assetSelected(data);
    });
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {}
}
