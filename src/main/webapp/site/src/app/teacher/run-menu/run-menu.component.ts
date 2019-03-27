import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TeacherService } from "../teacher.service";
import { ShareRunDialogComponent } from "../share-run-dialog/share-run-dialog.component";
import { LibraryProjectDetailsComponent } from "../../modules/library/library-project-details/library-project-details.component";
import { UserService } from "../../services/user.service";
import { TeacherRun } from "../teacher-run";
import { ConfigService } from "../../services/config.service";
import { RunSettingsDialogComponent } from "../run-settings-dialog/run-settings-dialog.component";
import { I18n } from '@ngx-translate/i18n-polyfill';
import { EditRunWarningDialogComponent } from '../edit-run-warning-dialog/edit-run-warning-dialog.component';

@Component({
  selector: 'app-run-menu',
  templateUrl: './run-menu.component.html',
  styleUrls: ['./run-menu.component.scss']
})
export class RunMenuComponent implements OnInit {

  @Input()
  run: TeacherRun;

  editLink: string = '';
  previewLink: string = '';
  reportProblemLink: string = '';

  constructor(private dialog: MatDialog,
              private teacherService: TeacherService,
              private userService: UserService,
              private configService: ConfigService,
              private i18n: I18n) { }

  ngOnInit() {
    this.editLink = `${this.configService.getContextPath()}/author/authorproject.html?projectId=${this.run.project.id}`;
    this.previewLink = `${this.configService.getContextPath()}/previewproject.html?projectId=${this.run.project.id}`;
    this.reportProblemLink = `${this.configService.getContextPath()}/contact?runId=${this.run.id}`;
  }

  shareRun() {
    this.dialog.open(ShareRunDialogComponent, {
      data: { run: this.run },
      panelClass: 'mat-dialog--md'
    });
  }

  showUnitDetails() {
    const project = this.run.project;
    this.dialog.open(LibraryProjectDetailsComponent, {
      data: { project: project, isRunProject: true },
      panelClass: 'mat-dialog--md'
    });
  }

  canEdit() {
    return this.run.project.canEdit(this.userService.getUserId());
  }

  canShare() {
    return this.run.canGradeAndManage(this.userService.getUserId());
  }

  showEditRunDetails() {
    const run = this.run;
    this.dialog.open(RunSettingsDialogComponent, {
      ariaLabel: this.i18n('Run Settings'),
      data: { run: run },
      panelClass: 'mat-dialog--md',
      autoFocus: true
    });
  }

  editContent() {
    if (this.run.lastRun) {
      this.dialog.open(EditRunWarningDialogComponent, {
        ariaLabel: this.i18n('Edit Run Warning'),
        data: { project: this.run.project },
        panelClass: 'mat-dialog--md'
      });
    } else {
      window.location.href = this.editLink;
    }
  }
}
