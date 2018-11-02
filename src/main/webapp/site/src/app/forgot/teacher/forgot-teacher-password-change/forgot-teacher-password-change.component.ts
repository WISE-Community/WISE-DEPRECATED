import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TeacherService} from '../../../teacher/teacher.service';

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

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private teacherService: TeacherService) { }

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
    this.verificationCode = this.route.snapshot.queryParamMap.get('verificationCode');
  }

  submit() {
    this.clearMessage();
    const password = this.getPassword();
    const confirmPassword = this.getConfirmPassword();
    if (this.isPasswordsMatch(password, confirmPassword)) {
      this.processing = true;
      this.teacherService.changePassword(this.username, this.verificationCode, password, confirmPassword)
          .subscribe((response) => {
        if (response.status === 'success') {
          this.goToSuccessPage();
        } else {
          if (response.messageCode === 'tooManyVerificationCodeAttempts') {
            this.setTooManyVerificationCodeAttemptsMessage();
          } else if (response.messageCode === 'verificationCodeExpired') {
            this.setVerificationCodeExpiredMessage();
          } else if (response.messageCode === 'verificationCodeIncorrect') {
            this.setVerificationCodeIncorrectMessage();
          } else if (response.messageCode === 'passwordsDoNotMatch') {
            this.setPasswordsDoNotMatchMessage();
          } else {
            this.setErrorOccurredMessage();
          }
        }
        this.processing = false;
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

  getControlFieldValue(fieldName) {
    return this.changePasswordFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.changePasswordFormGroup.controls[name].setValue(value);
  }

  isPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }

  setVerificationCodeExpiredMessage() {
    const message = 'The verification code has expired. Please generate a new one.';
    this.setMessage(message);
  }

  setVerificationCodeIncorrectMessage() {
    const message = 'The verification code is in correct. Please try again.';
    this.setMessage(message);
  }

  setTooManyVerificationCodeAttemptsMessage() {
    const message = `You have submitted an incorrect verification code too many times recently.
        For security reasons, we will lock the ability to change your password for 10 minutes.
        Please try again in a little while.`;
    this.setMessage(message);
  }

  setPasswordsDoNotMatchMessage() {
    this.setMessage('Passwords do not match.');
  }

  setErrorOccurredMessage() {
    this.setMessage('An error occurred, please try again.');
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  goToSuccessPage() {
    const params = {
      username: this.username
    };
    this.router.navigate(['forgot/teacher/password/complete'],
      {queryParams: params, skipLocationChange: true});
  }
}
