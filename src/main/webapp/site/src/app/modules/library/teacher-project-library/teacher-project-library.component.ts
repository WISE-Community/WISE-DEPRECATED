import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class TeacherProjectLibraryComponent implements OnInit {

  projects: LibraryProject[] = [];
  selectedTabIndex: number = 0;
  numberOfOfficialProjectsVisible;
  numberOfCommunityProjectsVisible;
  numberOfPersonalProjectsVisible;

  constructor(private libraryService: LibraryService,
              public dialog: MatDialog,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    libraryService.tabIndexSource$.subscribe((tabIndex) => {
      this.selectedTabIndex = tabIndex;
    });
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.firstChild !== null) {
      const selectedTabIndex = this.activatedRoute.snapshot.firstChild.data.selectedTabIndex;
      this.libraryService.setTabIndex(selectedTabIndex);
    }
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

  tabClicked(event) {
    const tabIndex = event.index;
    if (tabIndex === 0) {
      this.router.navigate(['tested'], { relativeTo: this.activatedRoute });
    } else if (tabIndex === 1) {
      this.router.navigate(['community'], { relativeTo: this.activatedRoute });
    } else if (tabIndex === 2) {
      this.router.navigate(['personal'], { relativeTo: this.activatedRoute });
    }
  }
}
