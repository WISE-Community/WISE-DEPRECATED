import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Teacher } from "../../domain/teacher";
import { TeacherService } from "../../teacher/teacher.service";
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { UtilService } from '../../services/util.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-register-teacher-form',
  templateUrl: './register-teacher-form.component.html',
  styleUrls: ['./register-teacher-form.component.scss']
})
export class RegisterTeacherFormComponent implements OnInit {

  teacherUser: Teacher = new Teacher();
  schoolLevels: any[] = [
    { code: "ELEMENTARY_SCHOOL", label: this.i18n('Elementary School') },
    { code: "MIDDLE_SCHOOL", label: this.i18n('Middle School') },
    { code: "HIGH_SCHOOL", label: this.i18n('High School') },
    { code: "COLLEGE", label: this.i18n('College') },
    { code: "OTHER", label: this.i18n('Other') }
  ];
  passwordsFormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });
  createTeacherAccountFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    schoolName: new FormControl('', [Validators.required]),
    schoolLevel: new FormControl('', [Validators.required]),
    howDidYouHearAboutUs: new FormControl(''),
    agree: new FormControl('')
  }, { validator: this.agreeCheckboxValidator });
  isSubmitted = false;
  processing: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute,
              private teacherService: TeacherService,
              private utilService: UtilService,
              private fb: FormBuilder,
              private i18n: I18n) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teacherUser.googleUserId = params['gID'];
      if (!this.isUsingGoogleId()) {
        this.createTeacherAccountFormGroup.addControl('passwords', this.passwordsFormGroup);
      }
      const name = params['name'];
      if (name != null) {
        this.setControlFieldValue('firstName', this.utilService.getFirstName(name));
        this.setControlFieldValue('lastName', this.utilService.getLastName(name));
      }
      this.setControlFieldValue('email', params['email']);
    });
  }

  isUsingGoogleId() {
    return this.teacherUser.googleUserId != null;
  }

  setControlFieldValue(name: string, value: string) {
    this.createTeacherAccountFormGroup.controls[name].setValue(value);
  }

  createAccount() {
    this.isSubmitted = true;
    if (this.createTeacherAccountFormGroup.valid) {
      this.processing = true;
      this.populateTeacherUser();
      this.teacherService.registerTeacherAccount(this.teacherUser, (userName) => {
        this.router.navigate(['join/teacher/complete',
          { username: userName, isUsingGoogleId: this.isUsingGoogleId() }
        ]);
        this.processing = false;
      });
    }
  }

  populateTeacherUser() {
    for (let key of Object.keys(this.createTeacherAccountFormGroup.controls)) {
      this.teacherUser[key] = this.createTeacherAccountFormGroup.get(key).value;
    }
    if (!this.isUsingGoogleId()) {
      this.teacherUser['password'] = this.getPassword();
      delete this.teacherUser['passwords'];
      delete this.teacherUser['googleUserId'];
    }
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

  agreeCheckboxValidator(createTeacherAccountFormGroup: FormGroup) {
    const agree = createTeacherAccountFormGroup.get('agree').value;
    if (!agree) {
      const error = { 'agreeNotChecked': true };
      createTeacherAccountFormGroup.setErrors(error);
      return error;
    }
    return null;
  }
}
