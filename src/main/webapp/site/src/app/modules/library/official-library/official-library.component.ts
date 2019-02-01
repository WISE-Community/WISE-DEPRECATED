import { Component, Input, ViewEncapsulation, Inject } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { LibraryComponent } from "../library/library.component";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

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
      this.filterUpdated();
    });
    libraryService.officialLibraryProjectsSource$.subscribe((libraryProjects) => {
      this.projects = libraryProjects;
    });
    libraryService.getOfficialLibraryProjects();
  }

  ngOnInit() {
  }
}

@Component({
  selector: 'official-library-details',
  templateUrl: 'official-library-details.html',
})
export class OfficialLibraryDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<OfficialLibraryDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  close(): void {
    this.dialogRef.close();
  }
}
