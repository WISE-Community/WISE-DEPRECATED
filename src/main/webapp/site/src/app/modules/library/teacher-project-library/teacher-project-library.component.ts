import { Component, OnInit } from '@angular/core';
import { LibraryProject } from "../libraryProject";

@Component({
  selector: 'app-teacher-project-library',
  templateUrl: './teacher-project-library.component.html',
  styleUrls: ['./teacher-project-library.component.scss']
})
export class TeacherProjectLibraryComponent implements OnInit {

  projects: LibraryProject[] = [];

  constructor() { }

  ngOnInit() {
  }

}
