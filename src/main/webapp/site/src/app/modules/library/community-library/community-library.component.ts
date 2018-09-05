import { Component, OnInit } from '@angular/core';
import { LibraryService } from "../../../services/library.service";
import { LibraryProject } from "../libraryProject";

@Component({
  selector: 'app-community-library',
  templateUrl: './community-library.component.html',
  styleUrls: ['./community-library.component.scss']
})
export class CommunityLibraryComponent implements OnInit {

  projects: LibraryProject[] = [];

  constructor(private libraryService: LibraryService) {
    libraryService.getCommunityLibraryProjects();
    libraryService.communityLibraryProjectsSource$.subscribe((communityProjects) => {
      this.projects = communityProjects;
    });
  }

  ngOnInit() {
  }

}
