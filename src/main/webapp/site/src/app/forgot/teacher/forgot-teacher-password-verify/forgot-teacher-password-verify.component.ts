import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../../teacher/teacher.service';
import { finalize } from 'rxjs/operators';

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
  processing: boolean = false;
  isVerificationCodeInputEnabled: boolean = true;
  isSubmitButtonEnabled: boolean = true;
  showForgotPasswordLink: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
  }

  getControlField(fieldName) {
    return this.verificationCodeFormGroup.get(fieldName);
  }

  getControlFieldValue(fieldName) {
    return this.getControlField(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.verificationCodeFormGroup.controls[name].setValue(value);
  }

  submit() {
    this.processing = true;
    this.clearMessage();
    this.showForgotPasswordLink = false;
    const verificationCode = this.getControlFieldValue('verificationCode');
    this.teacherService
      .checkVerificationCode(this.username, verificationCode)
      .pipe(
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 'success') {
          this.goToChangePasswordPage();
        } else {
          if (response.messageCode === 'verificationCodeExpired') {
            this.setVerificationCodeExpiredMessage();
            this.disableVerificationCodeInput();
            this.disableSubmitButton();
            this.showForgotPasswordLink = true;
          } else if (response.messageCode === 'verificationCodeIncorrect') {
            this.setVerificationCodeIncorrectMessage();
          } else if (response.messageCode === 'tooManyVerificationCodeAttempts') {
            this.setTooManyVerificationCodeAttemptsMessage();
            this.disableVerificationCodeInput();
            this.disableSubmitButton();
            this.showForgotPasswordLink = true;
          }
        }
      });
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

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  disableVerificationCodeInput() {
    this.getControlField('verificationCode').disable();
  }

  disableSubmitButton() {
    this.isSubmitButtonEnabled = false;
  }

  goToChangePasswordPage() {
    const params = {
      username: this.username,
      verificationCode: this.getControlFieldValue('verificationCode')
    };
    this.router.navigate(['/forgot/teacher/password/change'], {
      queryParams: params,
      skipLocationChange: true
    });
  }
}
