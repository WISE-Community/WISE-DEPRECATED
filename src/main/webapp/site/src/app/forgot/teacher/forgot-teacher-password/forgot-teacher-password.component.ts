import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from '../../../teacher/teacher.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-teacher-password',
  templateUrl: './forgot-teacher-password.component.html',
  styleUrls: ['./forgot-teacher-password.component.scss']
})
export class ForgotTeacherPasswordComponent implements OnInit {
  forgotTeacherPasswordFormGroup: FormGroup = this.fb.group({
    username: new FormControl('', [Validators.required])
  });
  message: string = '';
  showForgotUsernameLink: boolean = false;
  processing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {}

  getControlFieldValue(fieldName) {
    return this.forgotTeacherPasswordFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.forgotTeacherPasswordFormGroup.controls[name].setValue(value);
  }

  submit() {
    this.processing = true;
    this.clearMessage();
    this.showForgotUsernameLink = false;
    const username = this.getControlFieldValue('username');
    this.teacherService
      .getVerificationCodeEmail(username)
      .pipe(
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 'success') {
          this.goToVerificationCodePage();
        } else {
          if (response.messageCode === 'usernameNotFound') {
            this.setUsernameNotFoundMessage();
            this.showForgotUsernameLink = true;
          } else if (response.messageCode === 'tooManyVerificationCodeAttempts') {
            this.setTooManyVerificationCodeAttemptsMessage();
          } else if (response.messageCode === 'failedToSendEmail') {
            this.setFailedToSendEmailMessage();
          }
        }
      });
  }

  setUsernameNotFoundMessage() {
    const message = $localize`We could not find that username. Please make sure you are typing it correctly and try again. If you have forgotten your username, please use the forgot username option below.`;
    this.setMessage(message);
  }

  setTooManyVerificationCodeAttemptsMessage() {
    const message = $localize`You have submitted an invalid verification code too many times. For security reasons, we will lock the ability to change your password for 10 minutes. After 10 minutes, you can try again.`;
    this.setMessage(message);
  }

  setFailedToSendEmailMessage() {
    const message = $localize`The server has encountered an error and was unable to send you an email. Please try again. If the error continues to occur, please contact us.`;
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  goToVerificationCodePage() {
    const params = {
      username: this.getControlFieldValue('username')
    };
    this.router.navigate(['/forgot/teacher/password/verify'], {
      queryParams: params,
      skipLocationChange: true
    });
  }
}
