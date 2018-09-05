import { Component } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { LibraryComponent } from "../library/library.component";

@Component({
  selector: 'app-personal-library',
  templateUrl: './personal-library.component.html',
  styleUrls: ['./personal-library.component.scss']
})
export class PersonalLibraryComponent extends LibraryComponent {

  projects: LibraryProject[] = [];

  constructor(libraryService: LibraryService) {
    super(libraryService);
    libraryService.getPersonalLibraryProjects();
    libraryService.personalLibraryProjectsSource$.subscribe((personalProjects) => {
      for (let personalProject of personalProjects) {
        personalProject.visible = true;
      }
      this.projects = personalProjects;
    });
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });
  }

  ngOnInit() {
  }

}
