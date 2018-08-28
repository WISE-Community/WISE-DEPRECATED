import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss']
})
export class EditPasswordComponent implements OnInit {

  @ViewChild('changePasswordForm') changePasswordForm;

  newPasswordFormGroup: FormGroup = this.fb.group({
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validator: this.passwordMatchValidator });

  changePasswordFormGroup: FormGroup = this.fb.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

  message: string = '';

  constructor(private fb: FormBuilder,
      private configService: ConfigService,
      private userService: UserService) { }

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
    const oldPassword: string = this.getControlFieldValue('oldPassword');
    const newPassword: string = this.getControlFieldValue('newPassword');
    const username = this.getUsername();
    this.userService.changePassword(username, oldPassword, newPassword).subscribe((response) => {
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
      this.displayMessage("Successfully changed password");
    } else {
      this.displayMessage("Failed to change password");
    }
    this.resetForm();
  }

  displayMessage(message: string) {
    this.message = message;
  }

  resetForm() {
    this.changePasswordForm.resetForm();
  }

}
