import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { TeacherRun } from "../teacher-run";
import { Run } from "../../domain/run";
import { ConfigService } from "../../services/config.service";

@Component({
  selector: 'app-teacher-run-list-item',
  templateUrl: './teacher-run-list-item.component.html',
  styleUrls: ['./teacher-run-list-item.component.scss']
})
export class TeacherRunListItemComponent implements OnInit {

  @Input()
  run: TeacherRun = new TeacherRun();

  editLink: string = '';
  gradeAndManageLink: string = '';
  manageStudentsLink: string = '';
  thumbStyle: SafeStyle;

  constructor(private sanitizer: DomSanitizer,
              private configService: ConfigService) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.project.projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.run.project.thumbStyle = this.getThumbStyle();
    this.editLink = `${this.configService.getContextPath()}/author/authorproject.html?projectId=${this.run.project.id}`;
    if (this.run != null) {
      this.gradeAndManageLink = `${this.configService.getContextPath()}/teacher/run/manage/${this.run.id}`;
      this.manageStudentsLink = `${this.configService.getContextPath()}/teacher/run/manage/${ this.run.id }/#/manageStudents`;
      if (this.run.isHighlighted) {
        setTimeout(() => {
          this.run.isHighlighted = false;
        }, 5000)
      }
    }
  }

  periodsString() {
    let string = '';
    const length = this.run.periods.length;
    for (let p = 0; p < length; p++) {
      if (p === 0) {
        string = 'Class Periods: ';
      }
      string += this.run.periods[p];
      if (p < length - 1) {
        string += ', ';
      }
    }
    return string;
  }

  isScheduled() {
    if (this.run.endTime) {
      return false;
    }
    let startTime = new Date(this.run.startTime).getTime();
    let now = new Date().getTime();
    if (startTime < now) {
      return false;
    }
    return true;
  }
}
