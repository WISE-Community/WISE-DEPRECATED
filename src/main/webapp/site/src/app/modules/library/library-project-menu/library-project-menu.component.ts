import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Project } from "../../../domain/project";
import { TeacherService } from "../../../teacher/teacher.service";

@Component({
  selector: 'app-library-project-menu',
  templateUrl: './library-project-menu.component.html',
  styleUrls: ['./library-project-menu.component.scss']
})
export class LibraryProjectMenuComponent implements OnInit {

  @Input()
  project: Project;

  @Output('menuAction')
  select: EventEmitter<string> = new EventEmitter<string>();

  editLink: string = '';
  previewLink: string = '';

  constructor(public dialog: MatDialog, public teacherService: TeacherService) { }

  ngOnInit() {
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
  }

  copyProject() {
    this.select.emit('copy');
  }

  shareProject() {
    this.select.emit('share');
  }

  editProject() {
    this.select.emit('edit');
  }
}
