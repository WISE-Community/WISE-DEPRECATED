import { Component, Inject } from '@angular/core';
import { LibraryProjectDetailsComponent } from '../library-project-details/library-project-details.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { LibraryProject } from '../libraryProject';
import { LibraryService } from '../../../services/library.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-copy-project-dialog',
  templateUrl: './copy-project-dialog.component.html',
  styleUrls: ['./copy-project-dialog.component.scss']
})
export class CopyProjectDialogComponent {
  isCopying: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private libraryService: LibraryService,
    private snackBar: MatSnackBar
  ) {
    this.libraryService.newProjectSource$.subscribe(() => {
      this.dialog.closeAll();
    });
  }

  copy() {
    this.isCopying = true;
    this.libraryService
      .copyProject(this.data.project.id)
      .pipe(
        finalize(() => {
          this.isCopying = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 'error') {
            this.showErrorMessage();
          } else {
            const newLibraryProject: LibraryProject = new LibraryProject(response);
            newLibraryProject.visible = true;
            this.libraryService.addPersonalLibraryProject(newLibraryProject);
          }
        },
        (error) => {
          this.showErrorMessage();
        }
      );
  }

  showErrorMessage() {
    this.snackBar.open(
      $localize`There was an error trying to copy the project. Please refresh the page and try again.`
    );
  }
}
