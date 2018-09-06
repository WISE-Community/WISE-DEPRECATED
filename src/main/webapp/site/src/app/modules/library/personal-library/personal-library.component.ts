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
      this.emitNumberOfProjectsVisible(this.projects.length);
    });
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });

    libraryService.newProjectSource$.subscribe(project => {
      this.projects.unshift(project);
      this.emitNumberOfProjectsVisible(this.projects.length);
      this.libraryService.setTabIndex(2);
    });
  }

  ngOnInit() {
  }

}
