import { Component, OnInit } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";

@Component({
  selector: 'app-teacher-project-library',
  templateUrl: './teacher-project-library.component.html',
  styleUrls: ['./teacher-project-library.component.scss']
})
export class TeacherProjectLibraryComponent implements OnInit {

  projects: LibraryProject[] = [];
  selectedTabIndex: number = 0;
  numberOfOfficialProjectsVisible;
  numberOfCommunityProjectsVisible;
  numberOfPersonalProjectsVisible;

  constructor(private libraryService: LibraryService) {
    libraryService.tabIndexSource$.subscribe((tabIndex) => {
      this.selectedTabIndex = tabIndex;
    })
  }

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
