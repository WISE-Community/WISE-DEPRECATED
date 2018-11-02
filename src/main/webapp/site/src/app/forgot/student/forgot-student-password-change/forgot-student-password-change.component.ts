import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../student/student.service';

@Component({
  selector: 'app-forgot-student-password-change',
  templateUrl: './forgot-student-password-change.component.html',
  styleUrls: ['./forgot-student-password-change.component.scss']
})
export class ForgotStudentPasswordChangeComponent implements OnInit {

  username: string;
  questionKey: string;
  answer: string;
  changePasswordFormGroup: FormGroup = this.fb.group({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });
  message: string = '';

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private studentService: StudentService) { }

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
    this.questionKey = this.route.snapshot.queryParamMap.get('questionKey');
    this.answer = this.route.snapshot.queryParamMap.get('answer');
  }

  submit() {
    this.clearMessage();
    const password = this.getPassword();
    const confirmPassword = this.getConfirmPassword();
    if (this.isPasswordsMatch(password, confirmPassword)) {
      this.studentService.changePassword(this.username, this.answer, password, confirmPassword)
          .subscribe((response) => {
        if (response.status === 'success') {
          this.goToSuccessPage();
        } else {
          this.setErrorOccurredMessage();
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

  getControlFieldValue(fieldName) {
    return this.changePasswordFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.changePasswordFormGroup.controls[name].setValue(value);
  }

  isPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
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
    this.message = '';
  }

  goToSuccessPage() {
    const params = {
      username: this.username
    };
    this.router.navigate(['forgot/student/password/complete'],
      {queryParams: params, skipLocationChange: true});
  }
}
