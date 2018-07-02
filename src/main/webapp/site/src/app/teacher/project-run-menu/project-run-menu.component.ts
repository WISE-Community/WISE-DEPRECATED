import { Component, Input, OnInit } from '@angular/core';
import { Project } from "../project";

@Component({
  selector: 'app-project-run-menu',
  templateUrl: './project-run-menu.component.html',
  styleUrls: ['./project-run-menu.component.scss']
})
export class ProjectRunMenuComponent implements OnInit {

  @Input()
  project: Project;

  editLink: string = '';
  previewLink: string = '';

  constructor() { }

  ngOnInit() {
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
    this.previewLink = `/wise/previewproject.html?projectId=${ this.project.id }`;
  }

}
