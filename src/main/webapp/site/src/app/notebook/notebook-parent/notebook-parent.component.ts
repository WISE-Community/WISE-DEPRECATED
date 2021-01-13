import { Component, Input } from '@angular/core';
import { ConfigService } from '../../../../../wise5/services/configService';
import { NotebookService } from '../../../../../wise5/services/notebookService';
import { UtilService } from '../../../../../wise5/services/utilService';

Component({
  selector: 'notebook-parent'
});
export class NotebookParentComponent {
  config: any;
  notesVisible: boolean;

  @Input()
  workgroupId: number;

  constructor(
    private ConfigService: ConfigService,
    public NotebookService: NotebookService,
    private UtilService: UtilService
  ) {}

  ngOnInit(): void {
    if (this.workgroupId === null) {
      this.workgroupId = this.ConfigService.getWorkgroupId();
    }

    if (this.isStudentNotebook()) {
      this.config = this.UtilService.makeCopyOfJSONObject(
        this.NotebookService.getStudentNotebookConfig()
      );
    } else {
      this.config = this.UtilService.makeCopyOfJSONObject(
        this.NotebookService.getTeacherNotebookConfig()
      );
    }

    if (!this.config.enabled) {
      return;
    }

    this.initComplete();
  }

  initComplete(): void {}

  isStudentNotebook(): boolean {
    return (
      this.ConfigService.getMode() === 'studentRun' ||
      this.ConfigService.getMode() === 'preview' ||
      ((this.ConfigService.isRunOwner() || this.ConfigService.isRunSharedTeacher()) &&
        this.ConfigService.getWorkgroupId() !== this.workgroupId)
    );
  }
}
