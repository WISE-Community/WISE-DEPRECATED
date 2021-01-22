import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../student/student.service';
import { finalize } from 'rxjs/operators';

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
    this.answer = this.route.snapshot.queryParamMap.get('answer');
  }

  submit() {
    this.clearMessage();
    const password = this.getPassword();
    const confirmPassword = this.getConfirmPassword();
    if (this.isPasswordsMatch(password, confirmPassword)) {
      this.processing = true;
      this.studentService
        .changePassword(this.username, this.answer, password, confirmPassword)
        .pipe(
          finalize(() => {
            this.processing = false;
          })
        )
        .subscribe((response) => {
          if (response.status === 'success') {
            this.goToSuccessPage();
          } else {
            if (response.messageCode === 'passwordIsBlank') {
              this.setPasswordIsBlankMessage();
            } else if (response.messageCode === 'passwordsDoNotMatch') {
              this.setPasswordsDoNotMatchMessage();
            } else if (response.messageCode === 'invalidPassword') {
              this.setInvalidPasswordMessage();
            } else {
              this.setErrorOccurredMessage();
            }
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

  setPasswordIsBlankMessage() {
    this.setMessage($localize`Password cannot be blank. Please try again.`);
  }

  setPasswordsDoNotMatchMessage() {
    this.setMessage($localize`Passwords do not match. Please try again.`);
  }

  setInvalidPasswordMessage() {
    this.setMessage($localize`Password is invalid. Please try a different password.`);
  }

  setErrorOccurredMessage() {
    this.setMessage($localize`An error occurred. Please try again.`);
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
    this.router.navigate(['/forgot/student/password/complete'], {
      queryParams: params,
      skipLocationChange: true
    });
  }
}
