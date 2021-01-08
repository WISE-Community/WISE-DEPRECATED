import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { TeacherRun } from '../teacher-run';
import { ConfigService } from '../../services/config.service';
import { flash } from '../../animations';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ShareRunCodeDialogComponent } from '../share-run-code-dialog/share-run-code-dialog.component';

@Component({
  selector: 'app-teacher-run-list-item',
  templateUrl: './teacher-run-list-item.component.html',
  styleUrls: ['./teacher-run-list-item.component.scss'],
  animations: [flash]
})
export class TeacherRunListItemComponent implements OnInit {
  @Input()
  run: TeacherRun = new TeacherRun();

  editLink: string = '';
  gradeAndManageLink: string = '';
  manageStudentsLink: string = '';
  thumbStyle: SafeStyle;
  animateDuration: string = '0s';
  animateDelay: string = '0s';

  constructor(
    private sanitizer: DomSanitizer,
    private configService: ConfigService,
    private router: Router,
    private elRef: ElementRef,
    private dialog: MatDialog
  ) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.project.projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.run.project.thumbStyle = this.getThumbStyle();
    const contextPath = this.configService.getContextPath();
    this.editLink = `${contextPath}/author/authorproject.html?projectId=${this.run.project.id}`;
    if (this.run.project.wiseVersion === 4) {
      this.gradeAndManageLink =
        `${this.configService.getWISE4Hostname()}` +
        `/teacher/classroomMonitor/classroomMonitor?runId=${this.run.id}&gradingType=monitor`;
    } else {
      this.gradeAndManageLink = `${contextPath}/teacher/manage/unit/${this.run.id}`;
    }
    this.manageStudentsLink = `${contextPath}/teacher/manage/unit/${this.run.id}/manageStudents`;
    if (this.run.isHighlighted) {
      this.animateDuration = '2s';
      this.animateDelay = '1s';
      setTimeout(() => {
        this.run.isHighlighted = false;
      }, 7000);
    }
  }

  ngAfterViewInit() {
    if (this.run.isHighlighted) {
      this.elRef.nativeElement.querySelector('mat-card').scrollIntoView();
    }
  }

  launchGradeAndManageTool() {
    if (this.run.project.wiseVersion === 4) {
      window.location.href = this.gradeAndManageLink;
    } else {
      this.router.navigateByUrl(this.gradeAndManageLink);
    }
  }

  periodsString() {
    let string = '';
    const length = this.run.periods.length;
    for (let p = 0; p < length; p++) {
      if (p === 0) {
        string = $localize`Class Periods:` + ' ';
      }
      string += this.run.periods[p];
      if (p < length - 1) {
        string += ', ';
      }
    }
    return string;
  }

  isRunActive(run) {
    return run.isActive(this.configService.getCurrentServerTime());
  }

  isRunCompleted(run) {
    return run.isCompleted(this.configService.getCurrentServerTime());
  }

  shareCode() {
    this.dialog.open(ShareRunCodeDialogComponent, {
      data: { run: this.run },
      panelClass: 'mat-dialog--sm'
    });
  }
}
