import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'session-warning',
  templateUrl: 'session-warning-dialog.component.html'
})
export class SessionWarningDialogComponent implements OnInit {

  constuctor(dialog: MatDialog,
      dialogRef: MatDialogRef<SessionWarningDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: any) {
    console.log('SessionWarningDialogComponent constructor');
  }

  ngOnInit() {

  }

  openDialog(): void {

  }

  onNoClick(): void {
    // this.dialogRef.close();
  }
}