import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { LibraryProject } from '../libraryProject';
import { LibraryService } from '../../../services/library.service';
import { MatDialog } from '@angular/material/dialog';
import { OfficialLibraryDetailsComponent } from '../official-library/official-library.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-project-library',
  templateUrl: './teacher-project-library.component.html',
  styleUrls: ['./teacher-project-library.component.scss', '../library/library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TeacherProjectLibraryComponent implements OnInit {
  projects: LibraryProject[] = [];
  numberOfOfficialProjectsVisible: number = 0;
  numberOfCommunityProjectsVisible: number = 0;
  numberOfPersonalProjectsVisible: number = 0;
  route: String;
  tabs: any[] = [
    { path: 'library/tested', label: $localize`WISE Tested`, numVisible: 0 },
    { path: 'library/community', label: $localize`Community Built`, numVisible: 0 },
    { path: 'library/personal', label: $localize`My Units`, numVisible: 0 }
  ];

  constructor(libraryService: LibraryService, public dialog: MatDialog, private router: Router) {
    libraryService.numberOfOfficialProjectsVisible$.subscribe((num) => {
      this.tabs[0].numVisible = num;
    });
    libraryService.numberOfCommunityProjectsVisible$.subscribe((num) => {
      this.tabs[1].numVisible = num;
    });
    libraryService.numberOfPersonalProjectsVisible$.subscribe((num) => {
      this.tabs[2].numVisible = num;
    });
    if (!libraryService.hasLoaded) {
      libraryService.getCommunityLibraryProjects();
      libraryService.getOfficialLibraryProjects();
      libraryService.getPersonalLibraryProjects();
      libraryService.getSharedLibraryProjects();
      libraryService.hasLoaded = true;
    }
    libraryService.newProjectSource$.subscribe((project) => {
      if (project) {
        document.querySelector('.library').scrollIntoView();
      }
    });
  }

  ngOnInit() {}

  isOfficialRoute(): boolean {
    return this.router.url === '/teacher/home/library/tested';
  }

  isCommunityRoute(): boolean {
    return this.router.url === '/teacher/home/library/community';
  }

  isPersonalRoute(): boolean {
    return this.router.url === '/teacher/home/library/personal';
  }

  showInfo() {
    this.dialog.open(OfficialLibraryDetailsComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}
