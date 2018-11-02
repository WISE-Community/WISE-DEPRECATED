import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {TeacherService} from '../../../teacher/teacher.service';

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
  isCreateNewAccountLinkVisible: boolean = false;
  processing: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private teacherService: TeacherService) { }

  ngOnInit() {
  }

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
    this.hideCreateNewAccountLink();

    const email = this.getEmail();
    this.teacherService.sendForgotUsernameEmail(email).subscribe((response) => {
      if (response.status === 'success') {
        this.goToSuccessPage();
      } else {
        if (response.messageCode === 'emailNotFound') {
          this.setEmailNotFoundMessage();
          this.showCreateNewAccountLink();
        } else if (response.messageCode === 'failedToSendEmail') {
          this.setFailedToSendEmailMessage();
        }
      }
      this.processing = false;
    });
  }

  setEmailNotFoundMessage() {
    const message = `We did not find a WISE account associated with the email you entered.
        Please make sure you have typed your email correctly.
        If you have never created an account, you can use the link below to create a new account.`;
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

  showCreateNewAccountLink() {
    this.isCreateNewAccountLinkVisible = true;
  }

  hideCreateNewAccountLink() {
    this.isCreateNewAccountLinkVisible = false;
  }

  createNewAccount() {
    this.router.navigate(['/join']);
  }

  goToSuccessPage() {
    this.router.navigate(['forgot/teacher/username/complete']);
  }
}
