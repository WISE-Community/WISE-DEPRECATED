import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, ValidatorFn,
  AbstractControl } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss']
})
export class EditPasswordComponent implements OnInit {

  newPasswordFormGroup: FormGroup = this.fb.group({
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validator: this.passwordMatchValidator });

  changePasswordFormGroup: FormGroup = this.fb.group({
    oldPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

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
    const oldPassword: string = this.changePasswordFormGroup.get('oldPassword').value;
    const newPassword: string = this.newPasswordFormGroup.get('newPassword').value;
    const username = this.userService.getUser().getValue().userName;
    this.userService.changePassword(username, oldPassword, newPassword).subscribe((response) => {
      console.log(response);
    });
  }

}
