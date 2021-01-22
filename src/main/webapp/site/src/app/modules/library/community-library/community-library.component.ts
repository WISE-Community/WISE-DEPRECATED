import { Component, Inject } from '@angular/core';
import { LibraryService } from '../../../services/library.service';
import { LibraryProject } from '../libraryProject';
import { LibraryComponent } from '../library/library.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-community-library',
  templateUrl: './community-library.component.html',
  styleUrls: ['./community-library.component.scss']
})
export class CommunityLibraryComponent extends LibraryComponent {
  projects: LibraryProject[] = [];
  filteredProjects: LibraryProject[] = [];

  constructor(libraryService: LibraryService, public dialog: MatDialog) {
    super(libraryService);
    libraryService.communityLibraryProjectsSource$.subscribe((communityProjects) => {
      this.projects = communityProjects;
      this.filterUpdated();
    });
  }

  ngOnInit() {}

  emitNumberOfProjectsVisible(numProjectsVisible: number = null) {
    if (numProjectsVisible) {
      this.libraryService.numberOfCommunityProjectsVisible.next(numProjectsVisible);
    } else {
      this.libraryService.numberOfCommunityProjectsVisible.next(this.filteredProjects.length);
    }
  }

  showInfo() {
    this.dialog.open(CommunityLibraryDetailsComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}

@Component({
  selector: 'community-library-details',
  templateUrl: 'community-library-details.html'
})
export class CommunityLibraryDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<CommunityLibraryDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
