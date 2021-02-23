import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../../../../wise5/services/configService';
import { NotebookService } from '../../../../../wise5/services/notebookService';
import { ProjectService } from '../../../../../wise5/services/projectService';
import { UtilService } from '../../../../../wise5/services/utilService';
import { NotebookParentComponent } from '../notebook-parent/notebook-parent.component';

@Component({
  selector: 'notebook-notes',
  styleUrls: ['notebook-notes.component.scss'],
  templateUrl: 'notebook-notes.component.html',
  encapsulation: ViewEncapsulation.None
})
export class NotebookNotesComponent extends NotebookParentComponent {
  @Input()
  viewOnly: boolean;

  groups = [];
  hasNotes: boolean;
  groupNameToGroup = {};
  label: any;
  selectedTabIndex = 0;
  title: string;
  notebookUpdatedSubscription: Subscription;
  openNotebookSubscription: Subscription;
  publicNotebookItemsRetrievedSubscription: Subscription;

  constructor(
    ConfigService: ConfigService,
    NotebookService: NotebookService,
    private ProjectService: ProjectService,
    UtilService: UtilService
  ) {
    super(ConfigService, NotebookService, UtilService);
  }

  initComplete(): void {
    this.label = this.config.itemTypes.note.label;
    this.addPersonalGroupToGroups();
    this.addSpacesToGroups();
    this.hasNotes = this.isHasNotes();

    this.notebookUpdatedSubscription = this.NotebookService.notebookUpdated$.subscribe(
      ({ notebookItem }) => {
        if ((notebookItem.groups == null || notebookItem.groups.length === 0) &&
            notebookItem.type === 'note'
        ) {
          this.updatePrivateNotebookNote(notebookItem);
        }
        if (notebookItem.groups != null && notebookItem.groups.includes('public')) {
          this.updatePublicNotebookNote(notebookItem);
        }
        this.hasNotes = this.isHasNotes();
      }
    );

    this.openNotebookSubscription = this.NotebookService.openNotebook$.subscribe(
      ({ visibleSpace }) => {
        this.selectedTabIndex = visibleSpace === 'public' ? 1 : 0;
      }
    );

    this.publicNotebookItemsRetrievedSubscription = 
      this.NotebookService.publicNotebookItemsRetrieved$.subscribe(() => {
        for (const group of this.groups) {
          if (group.name !== 'private') {
            group.items = this.NotebookService.publicNotebookItems[group.name];
          } 
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.notebookUpdatedSubscription.unsubscribe();
    this.openNotebookSubscription.unsubscribe();
    this.publicNotebookItemsRetrievedSubscription.unsubscribe();
  }

  isHasNotes(): boolean {
    return Object.keys(this.notebook.items).length ? true : false;
  }

  addPersonalGroupToGroups(): void {
    const personalGroup = {
      title: $localize`Personal`,
      name: 'private',
      isEditAllowed: true,
      items: []
    };
    this.groupNameToGroup['private'] = personalGroup;
    for (const [personalItemKey, personalItemValue] of Object.entries(this.notebook.items)) {
      if ((personalItemValue as any).last().type === 'note') {
        personalGroup.items.push((personalItemValue as any).last());
      }
    }
    this.groups.push(personalGroup);
  }

  addSpacesToGroups(): void {
    for (const space of this.ProjectService.getSpaces()) {
      if (space.isShowInNotebook) {
        const spaceGroup = {
          title: space.name,
          name: space.id,
          isEditAllowed: true,
          items: []
        };
        this.groupNameToGroup[space.id] = spaceGroup;
        this.groups.push(spaceGroup);
      }
    }
  }

  updatePrivateNotebookNote(notebookItem: any): void {
    this.updateNotebookNote(
      this.groupNameToGroup['private'],
      notebookItem.localNotebookItemId,
      notebookItem.workgroupId,
      notebookItem
    );
    if (this.groupNameToGroup['public'] != null) {
      this.removeNotebookNote(
        this.groupNameToGroup['public'],
        notebookItem.localNotebookItemId,
        notebookItem.workgroupId
      );
    }
  }

  updatePublicNotebookNote(notebookItem: any): void {
    this.updateNotebookNote(
      this.groupNameToGroup['public'],
      notebookItem.localNotebookItemId,
      notebookItem.workgroupId,
      notebookItem
    );
    this.removeNotebookNote(
      this.groupNameToGroup['private'],
      notebookItem.localNotebookItemId,
      notebookItem.workgroupId
    );
  }

  updateNotebookNote(
    group: any,
    localNotebookItemId: string,
    workgroupId: number,
    notebookItem: any
  ): void {
    let added = false;
    let items = group.items;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
        items[i] = notebookItem;
        added = true;
      }
    }
    if (!added) {
      items.push(notebookItem);
    }
  }

  removeNotebookNote(group: any, localNotebookItemId: string, workgroupId: number): void {
    let items = group.items;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.localNotebookItemId == localNotebookItemId && item.workgroupId == workgroupId) {
        items.splice(i, 1);
        i--;
      }
    }
  }

  addNote() {
    this.NotebookService.addNote();
  }

  close(): void {
    this.NotebookService.setNotesVisible(false);
    this.NotebookService.setInsertMode(false);
  }
}
