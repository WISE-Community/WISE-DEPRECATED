import { Component } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { Standard } from "../standard";
import { LibraryService } from "../../../services/library.service";
import { LibraryComponent } from "../library/library.component";

@Component({
  selector: 'app-official-library',
  templateUrl: './official-library.component.html',
  styleUrls: ['./official-library.component.scss']
})
export class OfficialLibraryComponent extends LibraryComponent {

  projects: LibraryProject[] = [];
  libraryGroups: LibraryGroup[] = [];
  expandedGroups: object = {};
  implementationModelValue: string = '';
  implementationModelOptions: LibraryGroup[] = [];
  searchValue: string = '';
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];
  peOptions: Standard[] = [];
  peValue = [];
  showFilters: boolean = false;

  constructor(libraryService: LibraryService) {
    super(libraryService);
    libraryService.getOfficialLibraryProjects();
    libraryService.libraryGroupsSource$.subscribe((libraryGroups) => {
      this.libraryGroups = libraryGroups;
    });
    libraryService.officialLibraryProjectsSource$.subscribe((libraryProjects) => {
      this.projects = libraryProjects;
      this.emitNumberOfProjectsVisible(this.projects.length);
      this.setImplementationModelOptions();
      this.implementationModelValue = libraryService.implementationModelValue;
    });
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });
  }

  ngOnInit() {
  }

}
