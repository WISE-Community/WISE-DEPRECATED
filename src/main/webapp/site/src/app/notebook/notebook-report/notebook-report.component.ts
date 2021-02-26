import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { AnnotationService } from "../../../../../wise5/services/annotationService";
import { ConfigService } from "../../../../../wise5/services/configService";
import { NotebookService } from "../../../../../wise5/services/notebookService";
import { ProjectService } from "../../../../../wise5/services/projectService";
import { UtilService } from '../../../../../wise5/services/utilService';
import { NotebookParentComponent } from "../notebook-parent/notebook-parent.component";

@Component({
  selector: 'notebook-report',
  styleUrls: ['notebook-report.component.scss'],
  templateUrl: 'notebook-report.component.html'
})
export class NotebookReportComponent extends NotebookParentComponent {
  autoSaveIntervalMS: number = 30000;
  autoSaveIntervalId: any;
  collapsed: boolean = true;
  dirty: boolean = false;
  full: boolean = false;
  hasAnnotation: boolean = false;
  hasNewAnnotation: boolean = false;
  isAddNoteButtonAvailable: boolean;
  hasReport: boolean = false;
  latestAnnotations: any;
  maxScore: number;
  reportId: number;
  reportItem: any;
  reportItemContent: any;
  saveTime: number = null;
  notebookItemAnnotationReceivedSubscription: Subscription;
  showReportAnnotationsSubscription: Subscription;

  constructor(
    private AnnotationService: AnnotationService,
    ConfigService: ConfigService,
    NotebookService: NotebookService,
    private ProjectService: ProjectService,
    UtilService: UtilService
  ) {
    super(ConfigService, NotebookService, UtilService);
  }

  initComplete(): void {
    this.reportId = this.config.itemTypes.report.notes[0].reportId;
    this.setReportItem();
    if (this.reportItem == null) {
      return;
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

    this.notebookItemAnnotationReceivedSubscription = 
        this.NotebookService.notebookItemAnnotationReceived$.subscribe(
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

    this.showReportAnnotationsSubscription = this.NotebookService.showReportAnnotations$.subscribe(
      () => {
        if (this.collapsed) {
          this.toggleCollapse();
        }
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

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.notebookItemAnnotationReceivedSubscription.unsubscribe();
    this.showReportAnnotationsSubscription.unsubscribe();
  }

  setReportItem() {
    this.reportItem = this.NotebookService.getLatestNotebookReportItemByReportId(
      this.reportId,
      this.workgroupId
    );
    if (this.reportItem) {
      this.hasReport = true;
      const clientSaveTime = this.convertServerSaveTimeToClientSaveTime(
        this.reportItem.serverSaveTime
      );
      this.setSaveTime(clientSaveTime);
    } else {
      this.reportItem = this.NotebookService.getTemplateReportItemByReportId(this.reportId);
    }
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

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  fullscreen(): void {
    if (this.collapsed) {
      this.full = true;
      this.collapsed = false;
    } else {
      this.full = !this.full;
    }
    this.NotebookService.setReportFullScreen(this.full);
  }

  addNotebookItemContent($event: any): void {
    this.NotebookService.setInsertMode(true);
    this.NotebookService.setNotesVisible(true);
  }

  changed(value: string): void {
    this.dirty = true;
    this.reportItem.content.content = this.ConfigService.removeAbsoluteAssetPaths(value);
    this.clearSaveTime();
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
        this.setSaveTime(this.convertServerSaveTimeToClientSaveTime(result.serverSaveTime));
      }
    });
  }

  setSaveTime(time: number): void {
    this.saveTime = time;
  }

  clearSaveTime(): void {
    this.setSaveTime(null);
  }

  isNoteEnabled(): boolean {
    return this.config.itemTypes.note.enabled;
  }
}
