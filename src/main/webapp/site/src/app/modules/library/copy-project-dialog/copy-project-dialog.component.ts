import { Component, OnInit, Inject } from '@angular/core';
import { LibraryProjectDetailsComponent } from "../library-project-details/library-project-details.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { finalize } from 'rxjs/operators';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { MatSnackBar } from '@angular/material';
import { I18n } from "@ngx-translate/i18n-polyfill";

@Component({
  selector: 'app-copy-project-dialog',
  templateUrl: './copy-project-dialog.component.html',
  styleUrls: ['./copy-project-dialog.component.scss']
})
export class CopyProjectDialogComponent implements OnInit {

  isCopying: boolean = false;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private libraryService: LibraryService,
              private snackBar: MatSnackBar,
              private i18n: I18n) {

    this.libraryService.newProjectSource$.subscribe(() => {
      this.dialog.closeAll();
    });
  }

  ngOnInit() {
  }

  copy() {
    this.isCopying = true;
    this.dialogRef.afterClosed().subscribe(() => {
      scrollTo(0, 0);
    });
    this.libraryService.copyProject(this.data.project.id)
        .pipe(
          finalize(() => {
            this.isCopying = false;
          })
        )
        .subscribe((response: any) => {
          if (response.status === 'error') {
            this.showErrorMessage();
          } else {
            const newLibraryProject: LibraryProject = new LibraryProject(response);
            newLibraryProject.visible = true;
            this.libraryService.addPersonalLibraryProject(newLibraryProject);
          }
       }, (error) => {
        this.showErrorMessage();
       });
  }

  showErrorMessage() {
    this.snackBar.open(this.i18n('There was an error trying to copy the project. Please refresh the page and try again.'));
  }
}
