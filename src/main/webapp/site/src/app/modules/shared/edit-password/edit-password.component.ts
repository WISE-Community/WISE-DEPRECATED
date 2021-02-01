import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { UnlinkGoogleAccountConfirmComponent } from '../unlink-google-account-confirm/unlink-google-account-confirm.component';
import { passwordMatchValidator } from '../validators/password-match.validator';

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss']
})
export class EditPasswordComponent {
  @ViewChild('changePasswordForm', { static: false }) changePasswordForm;
  isSaving: boolean = false;
  isGoogleUser: boolean = false;

  newPasswordFormGroup: FormGroup = this.fb.group(
    {
      newPassword: new FormControl('', [Validators.required]),
      confirmNewPassword: new FormControl('', [Validators.required])
    },
    { validator: passwordMatchValidator }
  );

  changePasswordFormGroup: FormGroup = this.fb.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.isGoogleUser = user.isGoogleUser;
    });
  }

  saveChanges() {
    this.isSaving = true;
    const oldPassword: string = this.getControlFieldValue('oldPassword');
    const newPassword: string = this.getControlFieldValue('newPassword');
    this.userService
      .changePassword(oldPassword, newPassword)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe((response) => {
        this.handleChangePasswordResponse(response);
      });
  }

  getControlFieldValue(fieldName) {
    if (fieldName === 'newPassword' || fieldName === 'confirmNewPassword') {
      return this.newPasswordFormGroup.get(fieldName).value;
    } else {
      return this.changePasswordFormGroup.get(fieldName).value;
    }
  }

  getUsername() {
    return this.userService.getUser().getValue().username;
  }

  handleChangePasswordResponse(response) {
    if (response.status === 'success') {
      this.resetForm();
      this.snackBar.open($localize`Password changed.`);
    } else if (response.status === 'error' && response.messageCode === 'incorrectPassword') {
      const error = { incorrectPassword: true };
      const oldPasswordControl = this.changePasswordFormGroup.get('oldPassword');
      oldPasswordControl.setErrors(error);
    }
  }

  unlinkGoogleAccount() {
    this.dialog.open(UnlinkGoogleAccountConfirmComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }

  resetForm() {
    this.changePasswordForm.resetForm();
  }
}
