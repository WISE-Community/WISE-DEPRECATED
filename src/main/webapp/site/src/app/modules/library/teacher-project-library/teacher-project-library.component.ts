import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { MatDialog } from '@angular/material';
import { OfficialLibraryDetailsComponent } from '../official-library/official-library.component';

@Component({
  selector: 'app-teacher-project-library',
  templateUrl: './teacher-project-library.component.html',
  styleUrls: [
    './teacher-project-library.component.scss',
    '../library/library.component.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class TeacherProjectLibraryComponent {

  projects: LibraryProject[] = [];
  selectedTabIndex: number = 0;
  numberOfOfficialProjectsVisible;
  numberOfCommunityProjectsVisible;
  numberOfPersonalProjectsVisible;

  constructor(private libraryService: LibraryService, public dialog: MatDialog) {
    libraryService.tabIndexSource$.subscribe((tabIndex) => {
      this.selectedTabIndex = tabIndex;
    })
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

  showInfo() {
    this.dialog.open(OfficialLibraryDetailsComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}
