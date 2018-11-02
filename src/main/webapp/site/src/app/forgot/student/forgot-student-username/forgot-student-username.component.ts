import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilService } from '../../../services/util.service';
import { StudentService } from '../../../student/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-student-username',
  templateUrl: './forgot-student-username.component.html',
  styleUrls: ['./forgot-student-username.component.scss']
})
export class ForgotStudentUsernameComponent implements OnInit {

  months: any[] = [
    { value: 1, text: '01 (Jan)'},
    { value: 2, text: '02 (Feb)'},
    { value: 3, text: '03 (Mar)'},
    { value: 4, text: '04 (Apr)'},
    { value: 5, text: '05 (May)'},
    { value: 6, text: '06 (Jun)'},
    { value: 7, text: '07 (Jul)'},
    { value: 8, text: '08 (Aug)'},
    { value: 9, text: '09 (Sep)'},
    { value: 10, text: '10 (Oct)'},
    { value: 11, text: '11 (Nov)'},
    { value: 12, text: '12 (Dec)'}
  ];
  days: string[] = [];
  forgotStudentUsernameFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthDay: new FormControl({value: '', disabled: true}, [Validators.required])
  });
  foundUsernames: string[] = [];
  message: string;
  isErrorMessage: boolean = false;
  showCreateNewAccountLink: boolean = false;
  processing: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private utilService: UtilService,
              private studentService: StudentService) { }

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
      this.studentService.getStudentUsernames(firstName, lastName, birthMonth, birthDay)
          .subscribe((response) => {
        this.foundUsernames = response;
        this.setMessageForFoundUsernames();
        this.showCreateNewAccountLink = true;
        this.processing = false;
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
      this.isErrorMessage = false
    } else if (foundUsernamesCount > 1) {
      this.setMultipleMatchMessage();
      this.isErrorMessage = true;
    }
  }

  setZeroMatchMessage() {
    const message = `We did not find any usernames that match the information you provided. 
        Please make sure you entered your information correctly. If you can't find your account, 
        you will need to create a new account.`;
    this.setMessage(message);
  }

  setSingleMatchMessage() {
    const message = `We have found a username that matches. 
        Click on the username to log in with that account. 
        If this username is not yours, you will need to create a new account.`;
    this.setMessage(message);
  }

  setMultipleMatchMessage() {
    const message = `We have found multiple usernames that match.
        Try to remember which username is yours and then click on the username to log in with that account. 
        If none of these usernames are yours, you will need to create a new account.`;
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

  createNewAccount() {
    this.router.navigate(['/join']);
  }
}
