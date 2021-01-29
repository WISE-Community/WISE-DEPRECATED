import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnlinkGoogleAccountPasswordComponent } from '../unlink-google-account-password/unlink-google-account-password.component';

@Component({
  styleUrls: ['./unlink-google-account-confirm.component.scss'],
  templateUrl: './unlink-google-account-confirm.component.html'
})
export class UnlinkGoogleAccountConfirmComponent {
  constructor(public dialog: MatDialog) {}

  continue() {
    this.dialog.closeAll();
    this.dialog.open(UnlinkGoogleAccountPasswordComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}
