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

  constructor() {

  }

  ngOnInit() {
    this.editLink = `/wise/author#/project/${ this.project.id }`;
    if (this.project.run != null) {
      this.gradeAndManageLink = `/wise/classroomMonitor/${ this.project.run.id }`;
    }
  }

}
