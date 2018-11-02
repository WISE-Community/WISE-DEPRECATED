import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TeacherService} from '../../../teacher/teacher.service';

@Component({
  selector: 'app-forgot-teacher-password-verify',
  templateUrl: './forgot-teacher-password-verify.component.html',
  styleUrls: ['./forgot-teacher-password-verify.component.scss']
})
export class ForgotTeacherPasswordVerifyComponent implements OnInit {

  username: string;
  verificationCodeFormGroup: FormGroup = this.fb.group({
    verificationCode: new FormControl('', [Validators.required])
  });
  message: string;

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private teacherService: TeacherService) { }

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
  }

  getControlFieldValue(fieldName) {
    return this.verificationCodeFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.verificationCodeFormGroup.controls[name].setValue(value);
  }

  submit() {
    const verificationCode = this.getControlFieldValue('verificationCode');
    this.teacherService.checkVerificationCode(this.username, verificationCode)
        .subscribe((response) => {
      if (response.status === 'success') {
        this.goToChangePasswordPage();
      } else {
        if (response.messageCode === 'verificationCodeExpired') {
          this.setVerificationCodeExpiredMessage();
        } else if (response.messageCode === 'verificationCodeIncorrect') {
          this.setVerificationCodeIncorrectMessage();
        } else if (response.messageCode === 'tooManyVerificationCodeAttempts') {
          this.setTooManyVerificationCodeAttemptsMessage();
        }
      }
    });
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

  setMessage(message) {
    this.message = message;
  }

  goToChangePasswordPage() {
    const params = {
      username: this.username,
      verificationCode: this.getControlFieldValue('verificationCode')
    };
    this.router.navigate(['/forgot/teacher/password/change'],
      {queryParams: params, skipLocationChange: true});
  }
}
