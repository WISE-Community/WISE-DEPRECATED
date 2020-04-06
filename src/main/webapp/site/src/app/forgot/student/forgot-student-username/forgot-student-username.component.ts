import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { UtilService } from '../../../services/util.service';
import { StudentService } from '../../../student/student.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-student-username',
  templateUrl: './forgot-student-username.component.html',
  styleUrls: ['./forgot-student-username.component.scss']
})
export class ForgotStudentUsernameComponent implements OnInit {
  months: any[] = [
    { value: 1, text: this.i18n('01 (Jan)') },
    { value: 2, text: this.i18n('02 (Feb)') },
    { value: 3, text: this.i18n('03 (Mar)') },
    { value: 4, text: this.i18n('04 (Apr)') },
    { value: 5, text: this.i18n('05 (May)') },
    { value: 6, text: this.i18n('06 (Jun)') },
    { value: 7, text: this.i18n('07 (Jul)') },
    { value: 8, text: this.i18n('08 (Aug)') },
    { value: 9, text: this.i18n('09 (Sep)') },
    { value: 10, text: this.i18n('10 (Oct)') },
    { value: 11, text: this.i18n('11 (Nov)') },
    { value: 12, text: this.i18n('12 (Dec)') }
  ];
  days: string[] = [];
  forgotStudentUsernameFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthDay: new FormControl({ value: '', disabled: true }, [Validators.required])
  });
  foundUsernames: string[] = [];
  message: string;
  isErrorMessage: boolean = false;
  showSearchResults: boolean = false;
  processing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private utilService: UtilService,
    private studentService: StudentService,
    private i18n: I18n
  ) {}

  ngOnInit() {
    this.forgotStudentUsernameFormGroup.controls['birthMonth'].valueChanges.subscribe(value => {
      this.setBirthDayOptions();
    });
  }

  setBirthDayOptions() {
    const month = this.forgotStudentUsernameFormGroup.get('birthMonth').value;
    this.days = this.utilService.getDaysInMonth(month);
    if (this.days.length < this.forgotStudentUsernameFormGroup.get('birthDay').value) {
      this.forgotStudentUsernameFormGroup.controls['birthDay'].reset();
    }
    this.forgotStudentUsernameFormGroup.controls['birthDay'].enable();
  }

  submit() {
    this.clearMessage();
    if (this.forgotStudentUsernameFormGroup.valid) {
      this.processing = true;
      const firstName = this.getControlFieldValue('firstName');
      const lastName = this.getControlFieldValue('lastName');
      const birthMonth = parseInt(this.getControlFieldValue('birthMonth'));
      const birthDay = parseInt(this.getControlFieldValue('birthDay'));
      this.studentService
        .getStudentUsernames(firstName, lastName, birthMonth, birthDay)
        .pipe(
          finalize(() => {
            this.processing = false;
          })
        )
        .subscribe(response => {
          this.foundUsernames = response;
          this.setMessageForFoundUsernames();
          this.showSearchResults = true;
        });
    }
  }

  setMessageForFoundUsernames() {
    const foundUsernamesCount = this.foundUsernames.length;
    if (foundUsernamesCount === 0) {
      this.setZeroMatchMessage();
      this.isErrorMessage = true;
    } else if (foundUsernamesCount === 1) {
      this.setSingleMatchMessage();
      this.isErrorMessage = false;
    } else if (foundUsernamesCount > 1) {
      this.setMultipleMatchMessage();
      this.isErrorMessage = false;
    }
  }

  setZeroMatchMessage() {
    const message = this.i18n(
      `We did not find any usernames that match the information you provided. Please make sure you entered your information correctly. If you can't find your account, ask a teacher for help or contact us for assistance.`
    );
    this.setMessage(message);
  }

  setSingleMatchMessage() {
    const message = this.i18n(
      `We found a username that matches. Select it to log in. If this username is not yours, ask a teacher for help or contact us for assistance.`
    );
    this.setMessage(message);
  }

  setMultipleMatchMessage() {
    const message = this.i18n(
      `We found multiple usernames that match. If one of these is yours, select it to log in. If you can't find your account, ask a teacher for help or contact us for assistance.`
    );
    this.setMessage(message);
  }

  setMessage(message) {
    this.message = message;
  }

  clearMessage() {
    this.setMessage('');
  }

  getControlFieldValue(fieldName) {
    return this.forgotStudentUsernameFormGroup.get(fieldName).value;
  }

  setControlFieldValue(name: string, value: string) {
    this.forgotStudentUsernameFormGroup.controls[name].setValue(value);
  }

  loginWithUsername(username) {
    this.router.navigate(['/login', { username: username }]);
  }
}
