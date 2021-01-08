import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../student/student.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-student-password-security',
  templateUrl: './forgot-student-password-security.component.html',
  styleUrls: ['./forgot-student-password-security.component.scss']
})
export class ForgotStudentPasswordSecurityComponent implements OnInit {
  username: string;
  questionKey: string;
  question: string;
  answer: string;
  answerSecurityQuestionFormGroup: FormGroup = this.fb.group({
    answer: new FormControl('', [Validators.required])
  });
  message: string;
  processing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.queryParamMap.get('username');
    this.questionKey = this.route.snapshot.queryParamMap.get('questionKey');
    this.question = this.route.snapshot.queryParamMap.get('question');
  }

  submit() {
    this.processing = true;
    this.clearMessage();
    this.studentService
      .checkSecurityAnswer(this.username, this.getAnswer())
      .pipe(
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 'success') {
          this.goToChangePasswordPage();
        } else {
          if (response.messageCode === 'incorrectAnswer') {
            this.setIncorrectAnswerMessage();
          }
        }
      });
  }

  getAnswer() {
    return this.getControlFieldValue('answer');
  }

  getControlFieldValue(fieldName) {
    return this.answerSecurityQuestionFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.answerSecurityQuestionFormGroup.controls[name].setValue(value);
  }

  setIncorrectAnswerMessage() {
    const message = $localize`Incorrect answer, please try again. If you can't remember the answer to your security question, please ask your teacher to change your password or contact us for assistance.`;
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  goToChangePasswordPage() {
    const params = {
      username: this.username,
      questionKey: this.questionKey,
      answer: this.getAnswer()
    };
    this.router.navigate(['/forgot/student/password/change'], {
      queryParams: params,
      skipLocationChange: true
    });
  }
}
