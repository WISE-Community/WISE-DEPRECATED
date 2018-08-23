import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Teacher } from "../../domain/teacher";
import { TeacherService } from "../../teacher/teacher.service";
import { FormControl, FormGroup, Validators, FormBuilder, ValidatorFn,
  AbstractControl } from "@angular/forms";
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-register-teacher-form',
  templateUrl: './register-teacher-form.component.html',
  styleUrls: ['./register-teacher-form.component.scss']
})
export class RegisterTeacherFormComponent implements OnInit {

  teacherUser: Teacher = new Teacher();
  schoolLevels: string[] = ["ELEMENTARY_SCHOOL", "MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "OTHER"];
  passwordsFormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });
  createTeacherAccountFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    schoolName: new FormControl('', [Validators.required]),
    schoolLevel: new FormControl('', [Validators.required]),
    howDidYouHearAboutUs: new FormControl(''),
    agree: new FormControl('')
  }, { validator: this.agreeCheckboxValidator });

  constructor(private router: Router, private route: ActivatedRoute,
              private teacherService: TeacherService,
              private utilService: UtilService,
              private fb: FormBuilder) { }

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
    this.populateTeacherUser();
    this.teacherService.registerTeacherAccount(this.teacherUser, (userName) => {
      this.router.navigate(['join/teacher/complete',
        { username: userName }
      ]);
    });
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
