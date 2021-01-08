import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TeacherService } from '../../../teacher/teacher.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-teacher-username',
  templateUrl: './forgot-teacher-username.component.html',
  styleUrls: ['./forgot-teacher-username.component.scss']
})
export class ForgotTeacherUsernameComponent implements OnInit {
  forgotTeacherUsernameFormGroup: FormGroup = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  message: string = '';
  processing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {}

  getControlFieldValue(fieldName) {
    return this.forgotTeacherUsernameFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.forgotTeacherUsernameFormGroup.controls[name].setValue(value);
  }

  getEmail() {
    return this.getControlFieldValue('email');
  }

  submit() {
    this.processing = true;
    this.clearMessage();
    const email = this.getEmail();
    this.teacherService
      .sendForgotUsernameEmail(email)
      .pipe(
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 'success') {
          this.goToSuccessPage();
        } else {
          if (response.messageCode === 'emailNotFound') {
            this.setEmailNotFoundMessage();
          } else if (response.messageCode === 'failedToSendEmail') {
            this.setFailedToSendEmailMessage();
          }
        }
      });
  }

  setEmailNotFoundMessage() {
    const message = $localize`We did not find a WISE account associated with that email. Please make sure you have typed your email address correctly.`;
    this.setMessage(message);
  }

  setFailedToSendEmailMessage() {
    const message = $localize`The server has encountered an error and was unable to send an email to you. Please try again. If the error continues to occur, please contact us.`;
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  goToSuccessPage() {
    this.router.navigate(['/forgot/teacher/username/complete']);
  }
}
