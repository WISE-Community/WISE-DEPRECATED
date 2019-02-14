import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { UserService } from "../../../services/user.service";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss']
})
export class EditPasswordComponent implements OnInit {

  @ViewChild('changePasswordForm') changePasswordForm;
  isSaving: boolean = false;

  newPasswordFormGroup: FormGroup = this.fb.group({
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validator: this.passwordMatchValidator });

  changePasswordFormGroup: FormGroup = this.fb.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

  constructor(private fb: FormBuilder,
              private userService: UserService,
              public snackBar: MatSnackBar,
              private i18n: I18n) { }

  ngOnInit() {
  }

  passwordMatchValidator(passwordsFormGroup: FormGroup) {
    const newPassword = passwordsFormGroup.get('newPassword').value;
    const confirmNewPassword = passwordsFormGroup.get('confirmNewPassword').value;
    if (newPassword == confirmNewPassword) {
      return null;
    } else {
      const error = { 'passwordDoesNotMatch': true };
      passwordsFormGroup.controls['confirmNewPassword'].setErrors(error);
      return error;
    }
  }

  saveChanges() {
    this.isSaving = true;
    const oldPassword: string = this.getControlFieldValue('oldPassword');
    const newPassword: string = this.getControlFieldValue('newPassword');
    const username = this.getUsername();
    this.userService.changePassword(username, oldPassword, newPassword)
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
    if (fieldName == 'newPassword' || fieldName == 'confirmNewPassword') {
      return this.newPasswordFormGroup.get(fieldName).value;
    } else {
      return this.changePasswordFormGroup.get(fieldName).value;
    }
  }

  getUsername() {
    return this.userService.getUser().getValue().userName;
  }

  handleChangePasswordResponse(response) {
    if (response.message == 'success') {
      this.resetForm();
      this.snackBar.open(this.i18n(`Password changed.`));
    } else if (response.message == 'incorrect password') {
      const error = { 'incorrectPassword': true };
      const oldPasswordControl = this.changePasswordFormGroup.get('oldPassword');
      oldPasswordControl.setErrors(error);
    }
  }

  resetForm() {
    this.changePasswordForm.resetForm();
  }
}
