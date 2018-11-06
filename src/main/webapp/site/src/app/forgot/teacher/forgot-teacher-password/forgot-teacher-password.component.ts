import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TeacherService} from '../../../teacher/teacher.service';

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

  constructor(private fb: FormBuilder,
              private router: Router,
              private teacherService: TeacherService) { }

  ngOnInit() {
  }

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
    this.teacherService.getVerificationCodeEmail(username).subscribe((response) => {
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
      this.processing = false;
    });
  }

  setUsernameNotFoundMessage() {
    const message = `We could not find that username.
        Please make sure you are typing your username correctly and try again.
        If you have forgotten your username, please use the forgot username page below.`;
    this.setMessage(message);
  }

  setTooManyVerificationCodeAttemptsMessage() {
    const message = `You have submitted an incorrect verification code too many times recently.
        For security reasons, we will lock the ability to change your password for 10 minutes.
        Please try again in a little while.`;
    this.setMessage(message);
  }

  setFailedToSendEmailMessage() {
    const message = `The server has encountered an error and was unable to send the email to you.
        Please try again. If the error continues to occur, please contact us.`;
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  goToForgotTeacherUsernamePage() {
    this.router.navigate(['/forgot/teacher/username']);
  }

  goToVerificationCodePage() {
    const params = {
      username: this.getControlFieldValue('username')
    };
    this.router.navigate(['/forgot/teacher/password/verify'],
        {queryParams: params, skipLocationChange: true});
  }

}
