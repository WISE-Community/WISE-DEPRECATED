import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../student/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-student-password',
  templateUrl: './forgot-student-password.component.html',
  styleUrls: ['./forgot-student-password.component.scss']
})
export class ForgotStudentPasswordComponent implements OnInit {

  forgotStudentPasswordFormGroup: FormGroup = this.fb.group({
    username: new FormControl('', [Validators.required])
  });
  message: string;

  constructor(private fb: FormBuilder,
              private router: Router,
              private studentService: StudentService) { }

  ngOnInit() {
  }

  submit() {
    const username = this.getUsername();
    this.studentService.getSecurityQuestion(username).subscribe((response) => {
      if (response.status === 'success') {
        this.goToQuestionPage(username, response.questionKey, response.question);
      } else {
        if (response.messageCode === 'usernameNotFound') {
          this.setUsernameNotFoundMessage();
        }
      }
    });
  }

  getUsername() {
    return this.getControlFieldValue('username');
  }

  getControlFieldValue(fieldName) {
    return this.forgotStudentPasswordFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.forgotStudentPasswordFormGroup.controls[name].setValue(value);
  }

  goToQuestionPage(username, questionKey, question) {
    const params = {
      username: username,
      questionKey: questionKey,
      question: question
    };
    this.router.navigate(['forgot/student/password/security'],
        {queryParams: params, skipLocationChange: true});
  }

  setUsernameNotFoundMessage() {
    const message = `Username not found. Please make sure you are typing your username correctly and try again.`;
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }
}
