import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { LibraryProject } from "../libraryProject";

@Component({
  selector: 'app-library-project',
  templateUrl: './library-project.component.html',
  styleUrls: ['./library-project.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryProjectComponent implements OnInit {

  @Input()
  project: LibraryProject = new LibraryProject();

  constructor(private sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
    this.project.thumbStyle = this.getThumbStyle(this.project.projectThumb);
  }

  getThumbStyle(projectThumb) {
    const DEFAULT_THUMB = 'assets/img/default-picture-sm.svg';
    const STYLE = `url(${projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  showDetails(): void {
    let project = this.project;
    this.dialog.open(LibraryProjectDetailsComponent, {
      ariaLabel: 'Project Details',
      data: { project: project },
      panelClass: 'mat-dialog-container--md'
    });
  }
}

@Component({
  selector: 'app-library-project-details',
  templateUrl: './library-project-details.component.html'
})

export class LibraryProjectDetailsComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
