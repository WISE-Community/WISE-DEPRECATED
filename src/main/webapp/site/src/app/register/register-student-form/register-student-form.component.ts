import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from '@angular/core';
import { Student } from "../../domain/student";
import { StudentService } from "../../student/student.service";
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { UtilService } from "../../services/util.service";

@Component({
  selector: 'app-register-student-form',
  templateUrl: './register-student-form.component.html',
  styleUrls: ['./register-student-form.component.scss']
})
export class RegisterStudentFormComponent implements OnInit {

  studentUser: Student = new Student();
  genders: any[] = [
    { code: "FEMALE", label: 'Female' },
    { code: "MALE", label: 'Male' },
    { code: "NO_ANSWER", label: 'No Answer/Other' }
  ];
  months: string[] = [
    "01 (Jan)",
    "02 (Feb)",
    "03 (Mar)",
    "04 (Apr)",
    "05 (May)",
    "06 (Jun)",
    "07 (Jul)",
    "08 (Aug)",
    "09 (Sep)",
    "10 (Oct)",
    "11 (Nov)",
    "12 (Dec)"
  ];
  days: string[] = [];
  securityQuestions: object;
  passwordsFormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });
  createStudentAccountFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthDay: new FormControl({value: '', disabled: true}, [Validators.required])
  });

  constructor(private router: Router, private route: ActivatedRoute,
              private studentService: StudentService,
              private utilService: UtilService,
              private fb: FormBuilder) {
    this.studentService.retrieveSecurityQuestions().subscribe(response => {
      this.securityQuestions = response;
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.studentUser.googleUserId = params['gID'];
      if (!this.isUsingGoogleId()) {
        this.createStudentAccountFormGroup.addControl('passwords', this.passwordsFormGroup);
        this.createStudentAccountFormGroup.addControl('securityQuestion', new FormControl('', [Validators.required]));
        this.createStudentAccountFormGroup.addControl('securityQuestionAnswer', new FormControl('', [Validators.required]));
      }
      const name = params['name'];
      if (name != null) {
        this.setControlFieldValue('firstName', this.utilService.getFirstName(name));
        this.setControlFieldValue('lastName', this.utilService.getLastName(name));
      } else {
        this.setControlFieldValue("firstName", params['firstName']);
        this.setControlFieldValue("lastName", params['lastName']);
      }
    });

    this.createStudentAccountFormGroup.controls['birthMonth'].valueChanges.subscribe(value => {
      this.setBirthDayOptions();
    });
  }

  isUsingGoogleId() {
    return this.studentUser.googleUserId != null;
  }

  createAccount() {
    if (this.createStudentAccountFormGroup.valid) {
      this.populateStudentUser();
      this.studentService.registerStudentAccount(this.studentUser, (userName) => {
        this.router.navigate(['join/student/complete',
          { username: userName }
        ]);
      });
    }
  }

  populateStudentUser() {
    for (let key of Object.keys(this.createStudentAccountFormGroup.controls)) {
      if (key == 'birthMonth' || key == 'birthDay') {
        this.studentUser[key] = parseInt(this.createStudentAccountFormGroup.get(key).value);
      } else {
        this.studentUser[key] = this.createStudentAccountFormGroup.get(key).value;
      }
    }
    this.studentUser['password'] = this.getPassword();
    delete this.studentUser['passwords'];
  }

  getPassword() {
    return this.passwordsFormGroup.controls['password'].value;
  }

  passwordMatchValidator(passwordsFormGroup: FormGroup) {
    const password = passwordsFormGroup.get('password').value;
    const confirmPassword = passwordsFormGroup.get('confirmPassword').value;
    if (password == confirmPassword) {
      return null;
    } else {
      const error = { 'passwordDoesNotMatch': true };
      passwordsFormGroup.controls['confirmPassword'].setErrors(error);
      return error;
    }
  }

  setControlFieldValue(name: string, value: string) {
    this.createStudentAccountFormGroup.controls[name].setValue(value);
  }

  setBirthDayOptions() {
    const month = this.createStudentAccountFormGroup.get('birthMonth').value;
    let days = 0;
    switch (month) {
      case '02 (Feb)':
        days = 29;
        break;
      case '04 (Apr)':
      case '06 (Jun)':
      case '09 (Sep)':
      case '11 (Nov)':
        days = 30;
        break;
      default:
        days = 31;
    }
    this.days = [];
    for (let i = 0; i < days; i++) {
      this.days.push((i + 1).toString());
    }
    if (days < this.createStudentAccountFormGroup.get('birthDay').value) {
      this.createStudentAccountFormGroup.controls['birthDay'].reset();
    }
    this.createStudentAccountFormGroup.controls['birthDay'].enable();
  }
}
