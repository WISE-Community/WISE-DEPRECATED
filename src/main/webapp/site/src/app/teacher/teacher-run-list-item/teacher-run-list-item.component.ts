import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { TeacherRun } from "../teacher-run";

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

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.project.thumbIconPath}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.thumbStyle = this.getThumbStyle();
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.run.project.id }`;
    if (this.run != null) {
      this.gradeAndManageLink = `/wise/teacher/run/manage/${ this.run.id }`;
      this.manageStudentsLink = `/wise/teacher/run/manage/${ this.run.id }/#/manageStudents`;
      if (this.run.isHighlighted) {
        setTimeout(() => {
          this.run.isHighlighted = false;
        }, 5000)
      }
    }
  }
}
