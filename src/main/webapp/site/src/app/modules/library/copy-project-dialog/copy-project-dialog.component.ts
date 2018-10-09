import { Component, OnInit, Inject } from '@angular/core';
import { LibraryProjectDetailsComponent } from "../library-project-details/library-project-details.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { finalize } from 'rxjs/operators';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";

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
              private libraryService: LibraryService) {

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
        .subscribe((newProject: LibraryProject) => {
          const newLibraryProject: LibraryProject = new LibraryProject(newProject);
          newLibraryProject.visible = true;
          this.libraryService.addPersonalLibraryProject(newLibraryProject);
        });
  }
}
