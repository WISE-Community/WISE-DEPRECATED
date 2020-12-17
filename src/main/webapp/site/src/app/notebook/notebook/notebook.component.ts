import { Component, Input } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";
import { Subscription } from "rxjs";
import { ConfigService } from "../../../../../wise5/services/configService";
import { NotebookService } from "../../../../../wise5/services/notebookService";
import { ProjectService } from "../../../../../wise5/services/projectService";
import { UtilService } from "../../../../../wise5/services/utilService";

@Component({
  selector: 'notebook',
  styleUrls: ['notebook.component.scss'],
  templateUrl: 'notebook.component.html'
})
export class NotebookComponent {

  @Input()
  filter: string;

  @Input()
  mode: string;

  @Input()
  workgroupId: number;

  itemId: string;
  item: any;
  config: any;
  reportVisible: boolean;
  notesVisible: boolean;
  insertMode: boolean;
  insertContent: any;
  requester: string;
  addNoteSubscription: Subscription;
  closeNotebookSubscription: Subscription;
  editNoteSubscription: Subscription;
  notebookUpdatedSubscription: Subscription;
  openNotebookSubscription: Subscription;
  notebook: any;
  publicNotebookItems: any;
  reportId: string;
  selectedNotebookItem: any;

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private NotebookService: NotebookService,
    private ProjectService: ProjectService,
    private UtilService: UtilService
  ) {
  }

  ngOnInit(): void {
    this.itemId = null;
    this.item = null;

    if (this.workgroupId == null) {
      this.workgroupId = this.ConfigService.getWorkgroupId();
    }

    if (this.isStudentNotebook()) {
      this.config = this.UtilService.makeCopyOfJSONObject(
          this.NotebookService.getStudentNotebookConfig());
    } else {
      this.config = this.UtilService.makeCopyOfJSONObject(
          this.NotebookService.getTeacherNotebookConfig());
    }

    if (!this.config.enabled) {
      return;
    }

    this.reportVisible = this.config.itemTypes.report.enabled;
    this.notesVisible = false;
    this.insertMode = false;
    this.insertContent = null;
    this.requester = null;

    this.addNoteSubscription = this.NotebookService.addNote$.subscribe(
        ({file, noteText, isEditTextEnabled, isFileUploadEnabled, studentWorkIds}) => {
      const note = null;
      const isEditMode = true;
      this.showEditNoteDialog(
        note,
        isEditMode,
        file,
        noteText,
        isEditTextEnabled,
        isFileUploadEnabled,
        studentWorkIds
      );
    });

    this.closeNotebookSubscription = this.NotebookService.closeNotebook$.subscribe(() => {
      this.closeNotes();
    });

    this.editNoteSubscription = this.NotebookService.editNote$.subscribe(({note, isEditMode}) => {
      const file = null;
      const noteText = null;
      const isEditTextEnabled = true;
      const isFileUploadEnabled = true;
      const studentWorkIds = null;
      this.showEditNoteDialog(
        note,
        isEditMode,
        file,
        noteText,
        isEditTextEnabled,
        isFileUploadEnabled,
        studentWorkIds
      );
    });

    this.notebookUpdatedSubscription = this.NotebookService.notebookUpdated$.subscribe(
        ({notebook}) => {
      this.notebook = this.UtilService.makeCopyOfJSONObject(notebook);
    });

    this.openNotebookSubscription = this.NotebookService.openNotebook$.subscribe(
        ({insertMode, requester}) => {
      this.open({ value: 'note' });
      this.setInsertMode({ value: insertMode, requester: requester });
    });

    this.notebook = this.NotebookService.getNotebookByWorkgroup(this.workgroupId);
    this.publicNotebookItems = this.NotebookService.publicNotebookItems;

    // assume only 1 report for now
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.addNoteSubscription.unsubscribe();
    this.closeNotebookSubscription.unsubscribe();
    this.editNoteSubscription.unsubscribe();
    this.notebookUpdatedSubscription.unsubscribe();
    this.openNotebookSubscription.unsubscribe();
  }

  isStudentNotebook(): boolean {
    return (
      this.ConfigService.getMode() === 'studentRun' ||
      this.ConfigService.getMode() === 'preview' ||
      ((this.ConfigService.isRunOwner() || this.ConfigService.isRunSharedTeacher()) &&
        this.ConfigService.getWorkgroupId() !== this.workgroupId)
    );
  }

  deleteStudentAsset(studentAsset: any): void {
    alert($localize`deleteStudentAssetFromNotebookNotImplementedYet`);
  }

  showEditNoteDialog(
    note: any,
    isEditMode: boolean,
    file: any,
    text: string,
    isEditTextEnabled: boolean,
    isFileUploadEnabled: boolean,
    studentWorkIds: number[]
  ): void {
    this.upgrade.$injector.get('$mdDialog').show({
      templateUrl: `${this.ProjectService.getThemePath()}/notebook/editNotebookItem.html`,
      controller: 'EditNotebookItemController',
      controllerAs: 'editNotebookItemController',
      bindToController: true,
      locals: {
        note: note,
        isEditMode: isEditMode,
        file: file,
        text: text,
        studentWorkIds: studentWorkIds,
        isEditTextEnabled: isEditTextEnabled,
        isFileUploadEnabled: isFileUploadEnabled
      }
    });
  }

  notebookItemSelected($event: any, notebookItem: any): void {
    this.selectedNotebookItem = notebookItem;
  }

  open({ value }: any): void {
    if (value === 'report') {
      this.reportVisible = !this.reportVisible;
    } else if (value === 'note') {
      if (this.notesVisible) {
        this.closeNotes();
      } else {
        this.NotebookService.retrievePublicNotebookItems('public').then(() => {
          this.notesVisible = true;
        });
      }
    } else if (value === 'new') {
      this.NotebookService.addNote();
    }
  }

  closeNotes(): void {
    this.notesVisible = false;
    this.insertMode = false;
  }

  setInsertMode({ value, requester }: any): void {
    this.insertMode = value;
    if (value) {
      this.NotebookService.retrievePublicNotebookItems('public').then(() => {
        this.notesVisible = true;
      });
    }
    this.requester = requester;
  }

  insert({ event , note }: any): void {
    if (this.requester === 'report') {
      this.insertContent = this.UtilService.makeCopyOfJSONObject(note);
      this.NotebookService.broadcastNotebookItemChosen({
        requester: this.requester,
        notebookItem: note
      });
    } else {
      this.NotebookService.broadcastNotebookItemChosen({
        requester: this.requester,
        notebookItem: note
      });
    }
  }
}
