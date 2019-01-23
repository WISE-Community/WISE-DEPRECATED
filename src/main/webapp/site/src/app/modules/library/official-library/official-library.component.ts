import { Component, Input, ViewEncapsulation } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { LibraryComponent } from "../library/library.component";

@Component({
  selector: 'app-official-library',
  templateUrl: './official-library.component.html',
  styleUrls: ['./official-library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OfficialLibraryComponent extends LibraryComponent {

  @Input()
  split: boolean = false;

  projects: LibraryProject[] = [];
  libraryGroups: LibraryGroup[] = [];

  constructor(libraryService: LibraryService) {
    super(libraryService);
    libraryService.libraryGroupsSource$.subscribe((libraryGroups) => {
      this.libraryGroups = libraryGroups;
    });
    libraryService.officialLibraryProjectsSource$.subscribe((libraryProjects) => {
      this.projects = libraryProjects;
      this.emitNumberOfProjectsVisible(this.projects.length);
    });
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });
    libraryService.getOfficialLibraryProjects();
  }

  ngOnInit() {
  }

}
