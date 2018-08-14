import { Component, OnInit, Input } from '@angular/core';
import { Project } from "../project";
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-teacher-project-list-item',
  templateUrl: './teacher-project-list-item.component.html',
  styleUrls: ['./teacher-project-list-item.component.scss']
})
export class TeacherProjectListItemComponent implements OnInit {

  @Input()
  project: Project = new Project();

  editLink: string = '';
  gradeAndManageLink: string = '';
  thumbStyle: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.project.thumbIconPath}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.thumbStyle = this.getThumbStyle();
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
    if (this.project.run != null) {
      this.gradeAndManageLink = `/wise/teacher/run/manage/${ this.project.run.id }`;
    }
    if (this.project.highlighted) {
      setTimeout(() => {
        this.project.highlighted = false;
      }, 5000)
    }
  }
}
