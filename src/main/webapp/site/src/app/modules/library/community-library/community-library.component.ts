import { Component } from '@angular/core';
import { LibraryService } from "../../../services/library.service";
import { LibraryProject } from "../libraryProject";
import { LibraryComponent } from "../library/library.component";

@Component({
  selector: 'app-community-library',
  templateUrl: './community-library.component.html',
  styleUrls: ['./community-library.component.scss']
})
export class CommunityLibraryComponent extends LibraryComponent {

  projects: LibraryProject[] = [];

  constructor(libraryService: LibraryService) {
    super(libraryService);
    libraryService.getCommunityLibraryProjects();
    libraryService.communityLibraryProjectsSource$.subscribe((communityProjects) => {
      for (let communityProject of communityProjects) {
        communityProject.visible = true;
      }
      this.projects = communityProjects;
    });
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });
  }

  ngOnInit() {
  }

}
