import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { AnnotationService } from "../../../../../wise5/services/annotationService";
import { ConfigService } from "../../../../../wise5/services/configService";
import { NotebookService } from "../../../../../wise5/services/notebookService";
import { ProjectService } from "../../../../../wise5/services/projectService";

@Component({
  selector: 'notebook-report',
  templateUrl: 'notebook-report.component.html'
})
export class NotebookReportComponent {

  @Input()
  config: any;

  @Input()
  insertContent: any;

  @Input()
  insertMode: string;

  @Input()
  reportId: string;

  @Input()
  visible: boolean;

  @Input()
  workgroupId: number;

  @Input()
  mode: string;

  @Input()
  hasNewAnnotation: boolean;

  @Input()
  maxScore: number;

  @Output()
  onCollapse: EventEmitter<any> = new EventEmitter();

  @Output()
  onSetInsertMode: EventEmitter<any> = new EventEmitter();

  hasReport: boolean = false;
  full: boolean = false;
  collapsed: boolean = true;
  dirty: boolean = false;
  autoSaveIntervalMS: number = 30000;
  autoSaveIntervalId: any;
  saveMessage: any = {
    text: '',
    time: null 
  };
  reportItem: any;
  reportItemContent: any;
  latestAnnotations: any;
  hasAnnotation: boolean = false;
  isAddNoteButtonAvailable: boolean;
  notebookItemAnnotationReceivedSubscription: Subscription;
  showReportAnnotationsSubscription: Subscription;

  constructor(
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private NotebookService: NotebookService,
    private ProjectService: ProjectService
  ) {

  }

  ngOnInit(): void {
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
    if (this.workgroupId == null) {
      this.workgroupId = this.ConfigService.getWorkgroupId();
    }
    this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(
      this.reportId,
      this.workgroupId
    );
    if (this.reportItem) {
      this.hasReport = true;
      const clientSaveTime = this.convertServerSaveTimeToClientSaveTime(
        this.reportItem.serverSaveTime
      );
      this.setSavedMessage(clientSaveTime);
    } else {
      // student doesn't have work for this report yet, so get the default template.
      this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
      if (this.reportItem == null) {
        // don't allow student to work on the report
        return;
      }
    }
    this.maxScore = this.NotebookService.getMaxScoreByReportId(this.reportId);

    if (this.mode !== 'classroomMonitor') {
      this.reportItem.id = null; // set the id to null so it can be inserted as initial version, as opposed to updated. this is true for both new and just-loaded reports.
    }
    this.reportItemContent = this.ProjectService.injectAssetPaths(this.reportItem.content.content);
    this.latestAnnotations = this.AnnotationService.getLatestNotebookItemAnnotations(
      this.workgroupId,
      this.reportId
    );
    this.hasAnnotation = this.calculateHasAnnotation(this.latestAnnotations);
    this.startAutoSaveInterval();
    this.isAddNoteButtonAvailable = this.isNoteEnabled();

    /**
     * Captures the annotation received event, checks whether the given
     * annotation id matches this report id, updates UI accordingly
     */
    this.notebookItemAnnotationReceivedSubscription = this.NotebookService.notebookItemAnnotationReceived$.subscribe(
      ({ annotation }: any) => {
        if (annotation.localNotebookItemId === this.reportId) {
          this.hasNewAnnotation = true;
          this.latestAnnotations = this.AnnotationService.getLatestNotebookItemAnnotations(
            this.workgroupId,
            this.reportId
          );
          this.hasAnnotation = this.calculateHasAnnotation(this.latestAnnotations);
        }
      }
    );

    /**
     * Captures the show report annotations event, opens report (if collapsed)
     * and scrolls to the report annotations display
     */
    this.showReportAnnotationsSubscription = this.NotebookService.showReportAnnotations$.subscribe(
      () => {
        if (this.collapsed) {
          this.collapse();
        }

        // scroll to report annotations (bottom)
        const $notebookReportContent = $('.notebook-report__content');
        setTimeout(() => {
          $notebookReportContent.animate(
            {
              scrollTop: $notebookReportContent.prop('scrollHeight')
            },
            500
          );
        }, 500);
      }
    );
  }

  calculateHasAnnotation(latestAnnotations: any): boolean {
    if (latestAnnotations != null) {
      return latestAnnotations.score != null || latestAnnotations.comment != null;
    }
    return false;
  }

  convertServerSaveTimeToClientSaveTime(serverSaveTime: number): number {
    return this.ConfigService.convertToClientTimestamp(serverSaveTime);
  }

  collapse(): void {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.onCollapse.emit();
    }
  }

  fullscreen(): void {
    if (this.collapsed) {
      this.full = true;
      this.collapsed = false;
    } else {
      this.full = !this.full;
    }
  }

  addNotebookItemContent($event: any): void {
    this.onSetInsertMode.emit({ value: true, requester: 'report' });
  }

  changed(value: string): void {
    this.dirty = true;
    this.reportItem.content.content = this.ConfigService.removeAbsoluteAssetPaths(value);
    this.clearSavedMessage();
  }

  startAutoSaveInterval(): void {
    this.stopAutoSaveInterval();
    this.autoSaveIntervalId = setInterval(() => {
      if (this.dirty) {
        this.saveNotebookReportItem();
      }
    }, this.autoSaveIntervalMS);
  }

  stopAutoSaveInterval(): void {
    clearInterval(this.autoSaveIntervalId);
  }

  saveNotebookReportItem(): void {
    // set save timestamp
    this.NotebookService.saveNotebookItem(
      this.reportItem.id,
      this.reportItem.nodeId,
      this.reportItem.localNotebookItemId,
      this.reportItem.type,
      this.reportItem.title,
      this.reportItem.content,
      this.reportItem.groups,
      Date.parse(new Date().toString())
    ).then((result: any) => {
      if (result) {
        this.dirty = false;
        this.hasNewAnnotation = false;
        // set the reportNotebookItemId to the newly-incremented id so that future saves during this
        // visit will be an update instead of an insert.
        this.reportItem.id = result.id;
        this.setSavedMessage(this.convertServerSaveTimeToClientSaveTime(result.serverSaveTime));
      }
    });
  }

  setSavedMessage(time: number): void {
    this.setSaveText($localize`Saved`, time);
  }

  clearSavedMessage(): void {
    this.setSaveText('', null);
  }

  setSaveText(message: string, time: number): void {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
  }

  isNoteEnabled(): boolean {
    return this.config.itemTypes.note.enabled;
  }
}