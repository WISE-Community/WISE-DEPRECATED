import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from '../../../teacher/teacher.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-teacher-password-change',
  templateUrl: './forgot-teacher-password-change.component.html',
  styleUrls: ['./forgot-teacher-password-change.component.scss']
})
export class ForgotTeacherPasswordChangeComponent implements OnInit {
  username: string;
  verificationCode: string;
  changePasswordFormGroup: FormGroup = this.fb.group({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });
  message: string = '';
  processing: boolean = false;
  isSubmitButtonEnabled: boolean = true;
  showForgotPasswordLink = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
    this.verificationCode = this.route.snapshot.queryParamMap.get('verificationCode');
  }

  submit() {
    this.clearMessage();
    const password = this.getPassword();
    const confirmPassword = this.getConfirmPassword();
    this.showForgotPasswordLink = false;
    if (this.isPasswordsMatch(password, confirmPassword)) {
      this.processing = true;
      this.teacherService
        .changePassword(this.username, this.verificationCode, password, confirmPassword)
        .pipe(
          finalize(() => {
            this.processing = false;
          })
        )
        .subscribe((response) => {
          if (response.status === 'success') {
            this.goToSuccessPage();
          } else {
            if (response.messageCode === 'tooManyVerificationCodeAttempts') {
              this.setTooManyVerificationCodeAttemptsMessage();
              this.disablePasswordInputs();
              this.disableSubmitButton();
              this.showForgotPasswordLink = true;
            } else if (response.messageCode === 'verificationCodeExpired') {
              this.setVerificationCodeExpiredMessage();
              this.disablePasswordInputs();
              this.disableSubmitButton();
              this.showForgotPasswordLink = true;
            } else if (response.messageCode === 'verificationCodeIncorrect') {
              this.setVerificationCodeIncorrectMessage();
            } else if (response.messageCode === 'passwordIsBlank') {
              this.setPasswordIsBlankMessage();
            } else if (response.messageCode === 'passwordsDoNotMatch') {
              this.setPasswordsDoNotMatchMessage();
            } else {
              this.setErrorOccurredMessage();
            }
          }
        });
    } else {
      this.setPasswordsDoNotMatchMessage();
    }
  }

  getPassword() {
    return this.getControlFieldValue('password');
  }

  getConfirmPassword() {
    return this.getControlFieldValue('confirmPassword');
  }

  getControlField(fieldName) {
    return this.changePasswordFormGroup.get(fieldName);
  }

  getControlFieldValue(fieldName) {
    return this.getControlField(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.changePasswordFormGroup.controls[name].setValue(value);
  }

  isPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }

  setVerificationCodeExpiredMessage() {
    const message = $localize`The verification code has expired. Verification codes are valid for 10 minutes. Please go back to the Teacher Forgot Password page to generate a new one.`;
    this.setMessage(message);
  }

  setVerificationCodeIncorrectMessage() {
    const message = $localize`The verification code is invalid. Please try again.`;
    this.setMessage(message);
  }

  setTooManyVerificationCodeAttemptsMessage() {
    const message = $localize`You have submitted an invalid verification code too many times. For security reasons, we will lock the ability to change your password for 10 minutes. After 10 minutes, please go back to the Teacher Forgot Password page to generate a new verification code.`;
    this.setMessage(message);
  }

  setPasswordIsBlankMessage() {
    this.setMessage($localize`Password cannot be blank, please enter a password.`);
  }

  setPasswordsDoNotMatchMessage() {
    this.setMessage($localize`Passwords do not match, please try again.`);
  }

  setErrorOccurredMessage() {
    this.setMessage($localize`An error occurred. Please try again.`);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  disablePasswordInputs() {
    this.getControlField('password').disable();
    this.getControlField('confirmPassword').disable();
  }

  disableSubmitButton() {
    this.isSubmitButtonEnabled = false;
  }

  goToSuccessPage() {
    const params = {
      username: this.username
    };
    this.router.navigate(['/forgot/teacher/password/complete'], {
      queryParams: params,
      skipLocationChange: true
    });
  }
}
