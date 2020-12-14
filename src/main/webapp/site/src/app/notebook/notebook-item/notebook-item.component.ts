import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";
import { Subscription } from "rxjs";
import { ConfigService } from "../../../../../wise5/services/configService";
import { NotebookService } from "../../../../../wise5/services/notebookService";
import { ProjectService } from "../../../../../wise5/services/projectService";

@Component({
  selector: 'notebook-item',
  templateUrl: 'notebook-item.component.html'
})
export class NotebookItemComponent {

  @Input()
  note: any;

  @Input()
  config: any;

  @Input()
  itemId: string;

  @Input()
  group: string;

  @Input()
  isChooseMode: boolean;

  item: any;
  type: string;
  label: any;
  color: string;

  @Output()
  onSelect: EventEmitter<any> = new EventEmitter<any>();

  notebookUpdatedSubscription: Subscription;

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private NotebookService: NotebookService,
    private ProjectService: ProjectService
  ) {
  }

  ngOnInit(): void {
    this.item = this.note;
    this.type = this.item ? this.item.type : null;
    this.label = this.config.itemTypes[this.type].label;
    if (this.group === 'public') {
      this.color = 'orange';
    } else {
      this.color = this.label.color;
    }

    this.notebookUpdatedSubscription = this.NotebookService.notebookUpdated$.subscribe(
        ({notebook}) => {
      if (notebook.items[this.itemId]) {
        this.item = notebook.items[this.itemId].last();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.notebookUpdatedSubscription.unsubscribe();
  }

  isItemInGroup(group: string): boolean {
    return this.item.groups != null && this.item.groups.includes(group);
  }

  getItemNodeId(): string {
    if (this.item == null) {
      return null;
    } else {
      return this.item.nodeId;
    }
  }

  getItemNodeLink(): string {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionAndTitleByNodeId(this.item.nodeId);
    }
  }

  getItemNodePosition(): string {
    if (this.item == null) {
      return '';
    } else {
      return this.ProjectService.getNodePositionById(this.item.nodeId);
    }
  }

  doDelete(ev: any): void {
    ev.stopPropagation();
    const confirm = this.upgrade.$injector.get('$mdDialog').confirm()
      .title($localize`Are you sure you want to delete this note?`)
      .ariaLabel('delete note confirmation')
      .targetEvent(ev)
      .ok($localize`Delete`)
      .cancel($localize`Cancel`);
    this.upgrade.$injector.get('$mdDialog').show(confirm).then(() => {
      this.NotebookService.deleteNote(this.item);
    }, () => {
      // they chose not to delete. Do nothing, the dialog will close.
    });
  }

  doRevive(ev: any): void {
    ev.stopPropagation();
    const confirm = this.upgrade.$injector.get('$mdDialog').confirm()
      .title($localize`Are you sure you want to revive this note?`)
      .ariaLabel('revive note confirmation')
      .targetEvent(ev)
      .ok($localize`revive`)
      .cancel($localize`cancel`);
    this.upgrade.$injector.get('$mdDialog').show(confirm).then(() => {
      this.NotebookService.reviveNote(this.item);
    }, () => {
      // they chose not to revive. Do nothing, the dialog will close.
    });
  }

  doSelect(event: any): void {
    if (this.onSelect) {
      this.onSelect.emit({ event: event, note: this.item });
    }
  }

  canShareNotebookItem(): boolean {
    return this.ProjectService.isSpaceExists('public') &&
        this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode &&
        !this.isItemInGroup('public');
  }

  canUnshareNotebookItem(): boolean {
    return this.ProjectService.isSpaceExists('public') &&
        this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode &&
        this.isItemInGroup('public');
  }

  canDeleteNotebookItem(): boolean {
    return this.isMyNotebookItem() &&
        this.item.serverDeleteTime == null &&
        !this.isChooseMode;
  }

  canReviveNotebookItem(): boolean {
    return this.item.serverDeleteTime != null && !this.isChooseMode;
  }

  isMyNotebookItem(): boolean {
    return this.item.workgroupId === this.ConfigService.getWorkgroupId();
  }

  isNotebookItemActive(): boolean {
    return this.item.serverDeleteTime == null;
  }
}
