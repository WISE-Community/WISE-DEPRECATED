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
  personalProjects: LibraryProject[] = [];
  sharedProjects: LibraryProject[] = [];

  constructor(libraryService: LibraryService) {
    super(libraryService);

    libraryService.personalLibraryProjectsSource$.subscribe((personalProjects: LibraryProject[]) => {
      this.personalProjects = personalProjects;
      this.combinePersonalAndSharedProjects();
      this.emitNumberOfProjectsVisible();
    });

    libraryService.sharedLibraryProjectsSource$.subscribe((sharedProjects: LibraryProject[]) => {
      this.sharedProjects = sharedProjects;
      this.combinePersonalAndSharedProjects();
      this.emitNumberOfProjectsVisible();
    });

    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });

    libraryService.newProjectSource$.subscribe(project => {
      this.projects.unshift(project);
<<<<<<< HEAD
      let numProjectsVisible = this.countVisibleProjects(this.projects);
      this.emitNumberOfProjectsVisible(numProjectsVisible);
=======
      this.emitNumberOfProjectsVisible();
>>>>>>> issue-1443-show-shared-library-projects
      this.libraryService.setTabIndex(2);
    });

    libraryService.getPersonalLibraryProjects();
    libraryService.getSharedLibraryProjects();
  }

  ngOnInit() {
  }

  emitNumberOfProjectsVisible() {
    super.emitNumberOfProjectsVisible(this.personalProjects.length + this.sharedProjects.length);
  }

  combinePersonalAndSharedProjects() {
    const projects = this.personalProjects.concat(this.sharedProjects);
    projects.sort(this.sortByProjectIdDesc);
    this.projects = projects;
  }

  sortByProjectIdDesc(a, b) {
    if (a.id < b.id) {
      return 1;
    } else if (a.id > b.id) {
      return -1;
    } else {
      return 0;
    }
  }
}
