import { Component, Input, ViewEncapsulation, Inject } from '@angular/core';
import { LibraryGroup } from '../libraryGroup';
import { LibraryProject } from '../libraryProject';
import { LibraryService } from '../../../services/library.service';
import { LibraryComponent } from '../library/library.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-official-library',
  templateUrl: './official-library.component.html',
  styleUrls: ['./official-library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OfficialLibraryComponent extends LibraryComponent {
  @Input()
  isSplitScreen: boolean = false;

  projects: LibraryProject[] = [];
  libraryGroups: LibraryGroup[] = [];
  expandedGroups: object = {};

  constructor(libraryService: LibraryService, public dialog: MatDialog) {
    super(libraryService);
    libraryService.libraryGroupsSource$.subscribe((libraryGroups) => {
      this.libraryGroups = libraryGroups;
    });
    libraryService.officialLibraryProjectsSource$.subscribe((libraryProjects) => {
      this.projects = libraryProjects;
      this.filterUpdated();
    });
  }

  ngOnInit() {}

  emitNumberOfProjectsVisible(numProjectsVisible: number = null) {
    if (numProjectsVisible) {
      this.libraryService.numberOfOfficialProjectsVisible.next(numProjectsVisible);
    } else {
      this.libraryService.numberOfOfficialProjectsVisible.next(this.filteredProjects.length);
    }
  }

  showInfo() {
    this.dialog.open(OfficialLibraryDetailsComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}

@Component({
  selector: 'official-library-details',
  templateUrl: 'official-library-details.html'
})
export class OfficialLibraryDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<OfficialLibraryDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
