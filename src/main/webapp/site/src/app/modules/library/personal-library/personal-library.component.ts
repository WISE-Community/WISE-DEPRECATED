import { Component, Inject } from '@angular/core';
import { LibraryProject } from '../libraryProject';
import { LibraryService } from '../../../services/library.service';
import { LibraryComponent } from '../library/library.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-library',
  templateUrl: './personal-library.component.html',
  styleUrls: ['./personal-library.component.scss']
})
export class PersonalLibraryComponent extends LibraryComponent {
  projects: LibraryProject[] = [];
  filteredProjects: LibraryProject[] = [];
  personalProjects: LibraryProject[] = [];
  sharedProjects: LibraryProject[] = [];
  personalLibraryProjectsSourceSubscription: Subscription;
  sharedLibraryProjectsSourceSubscription: Subscription;
  newProjectSourceSubscription: Subscription;

  constructor(libraryService: LibraryService, private dialog: MatDialog) {
    super(libraryService);
    this.libraryService = libraryService;
  }

  ngOnInit() {
    this.personalLibraryProjectsSourceSubscription = this.libraryService.personalLibraryProjectsSource$.subscribe(
      (personalProjects: LibraryProject[]) => {
        this.personalProjects = personalProjects;
        this.updateProjects();
      }
    );
    this.sharedLibraryProjectsSourceSubscription = this.libraryService.sharedLibraryProjectsSource$.subscribe(
      (sharedProjects: LibraryProject[]) => {
        this.sharedProjects = sharedProjects;
        this.updateProjects();
      }
    );
    this.newProjectSourceSubscription = this.libraryService.newProjectSource$.subscribe(
      (project) => {
        if (project) {
          project.isHighlighted = true;
          this.projects.unshift(project);
          this.filterUpdated();
        }
      }
    );
  }

  ngOnDestroy() {
    this.personalLibraryProjectsSourceSubscription.unsubscribe();
    this.sharedLibraryProjectsSourceSubscription.unsubscribe();
    this.newProjectSourceSubscription.unsubscribe();
  }

  combinePersonalAndSharedProjects() {
    const projects = this.personalProjects.concat(this.sharedProjects);
    projects.sort(this.sortByProjectIdDesc);
    this.projects = projects;
  }

  updateProjects() {
    this.combinePersonalAndSharedProjects();
    this.filterUpdated();
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

  emitNumberOfProjectsVisible(numProjectsVisible: number = null) {
    if (numProjectsVisible) {
      this.libraryService.numberOfPersonalProjectsVisible.next(numProjectsVisible);
    } else {
      this.libraryService.numberOfPersonalProjectsVisible.next(this.filteredProjects.length);
    }
  }

  showInfo() {
    this.dialog.open(PersonalLibraryDetailsComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}

@Component({
  selector: 'personal-library-details',
  templateUrl: 'personal-library-details.html'
})
export class PersonalLibraryDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<PersonalLibraryDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
