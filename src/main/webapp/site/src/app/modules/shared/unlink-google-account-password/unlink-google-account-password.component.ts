import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { UnlinkGoogleAccountSuccessComponent } from '../unlink-google-account-success/unlink-google-account-success.component';
import { passwordMatchValidator } from '../validators/password-match.validator';

@Component({
  styleUrls: ['./unlink-google-account-password.component.scss'],
  templateUrl: './unlink-google-account-password.component.html'
})
export class UnlinkGoogleAccountPasswordComponent {
  isSaving: boolean = false;
  newPasswordFormGroup: FormGroup = this.fb.group(
    {
      newPassword: new FormControl('', [Validators.required]),
      confirmNewPassword: new FormControl('', [Validators.required])
    },
    { validator: passwordMatchValidator }
  );

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private userService: UserService
  ) {}

  submit() {
    this.isSaving = true;
    this.userService
      .unlinkGoogleUser(this.newPasswordFormGroup.get('newPassword').value)
      .add(() => {
        this.isSaving = false;
        this.dialog.closeAll();
        this.dialog.open(UnlinkGoogleAccountSuccessComponent, {
          panelClass: 'mat-dialog--sm'
        });
      });
  }
}
