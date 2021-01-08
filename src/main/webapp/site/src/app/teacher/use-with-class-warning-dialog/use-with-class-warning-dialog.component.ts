import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateRunDialogComponent } from '../create-run-dialog/create-run-dialog.component';
import { Project } from '../../domain/project';

@Component({
  selector: 'app-use-with-class-warning-dialog',
  templateUrl: './use-with-class-warning-dialog.component.html',
  styleUrls: ['./use-with-class-warning-dialog.component.scss']
})
export class UseWithClassWarningDialogComponent implements OnInit {
  project: Project;
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UseWithClassWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.project = data.project;
  }

  ngOnInit() {}

  proceedAnyway() {
    this.dialog.open(CreateRunDialogComponent, {
      data: this.data,
      panelClass: 'mat-dialog--md',
      disableClose: true
    });

    this.dialogRef.close();
  }
}
