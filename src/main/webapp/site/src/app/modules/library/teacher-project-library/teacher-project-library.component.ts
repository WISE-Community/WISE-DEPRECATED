import { Component, OnInit } from '@angular/core';
import { LibraryProject } from "../libraryProject";

@Component({
  selector: 'app-teacher-project-library',
  templateUrl: './teacher-project-library.component.html',
  styleUrls: ['./teacher-project-library.component.scss']
})
export class TeacherProjectLibraryComponent implements OnInit {

  projects: LibraryProject[] = [];
  numberOfOfficialProjectsVisible;
  numberOfCommunityProjectsVisible;
  numberOfPersonalProjectsVisible;

  constructor() { }

  ngOnInit() {
  }

  updateNumberOfOfficialProjectsVisible(count) {
    this.numberOfOfficialProjectsVisible = count;
  }

  updateNumberOfCommunityProjectsVisible(count) {
    this.numberOfCommunityProjectsVisible = count;
  }

  updateNumberOfPersonalProjectsVisible(count) {
    this.numberOfPersonalProjectsVisible = count;
  }

}
