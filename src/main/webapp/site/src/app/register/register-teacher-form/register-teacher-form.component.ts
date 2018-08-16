import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Teacher } from "../../domain/teacher";
import { TeacherService } from "../../teacher/teacher.service";
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";

@Component({
  selector: 'app-register-teacher-form',
  templateUrl: './register-teacher-form.component.html',
  styleUrls: ['./register-teacher-form.component.scss']
})
export class RegisterTeacherFormComponent implements OnInit {

  teacherUser: Teacher = new Teacher();
  schoolLevels: string[] = ["ELEMENTARY_SCHOOL", "MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "OTHER"];
  private sub: any;
  passwordsFormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });
  createTeacherAccountForm: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    schoolName: new FormControl('', [Validators.required]),
    schoolLevel: new FormControl('', [Validators.required]),
    howDidYouHearAboutUs: new FormControl(''),
    passwords: this.passwordsFormGroup,
    agree: new FormControl('')
  }, { validator: this.agreeCheckboxValidator });

  constructor(private router: Router, private route: ActivatedRoute,
              private teacherService: TeacherService, private fb: FormBuilder) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.teacherUser.googleUserId = params['gID'];
      const name = params['name'];
      if (name != null) {
        this.createTeacherAccountForm.controls['firstName'].patchValue(this.getFirstName(name));
        this.createTeacherAccountForm.controls['lastName'].patchValue(this.getLastName(name));
      }
      this.createTeacherAccountForm.controls['email'].patchValue(params['email']);
    });
  }

  getFirstName(fullName: string) {
    return fullName.substring(0, fullName.indexOf(" "));
  }

  getLastName(fullName: string) {
    return fullName.substring(fullName.indexOf(" ") + 1);
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
    for (let key of Object.keys(this.createTeacherAccountForm.controls)) {
      this.teacherUser[key] = this.createTeacherAccountForm.controls[key].value;
    }
    this.teacherUser['password'] = this.createTeacherAccountForm.controls['passwords'].controls['password'].value;
    delete this.teacherUser['passwords'];
    if (this.teacherUser['googleUserId'] == "") {
      delete this.teacherUser['googleUserId'];
    }
  }

  passwordMatchValidator(passwordsFormGroup: FormGroup) {
    const password = passwordsFormGroup.get('password').value;
    const confirmPassword = passwordsFormGroup.get('confirmPassword').value;
    if (password == confirmPassword) {
      return null;
    } else {
      passwordsFormGroup.controls['confirmPassword'].setErrors({'passwordDoesNotMatch': true});
      return { 'passwordDoesNotMatch': true };
    }
  }

  agreeCheckboxValidator(createTeacherAccountForm: FormGroup) {
    const isBothPasswordsFilled =
        (<FormGroup> createTeacherAccountForm.controls['passwords']).controls['password'].value != "" &&
        (<FormGroup> createTeacherAccountForm.controls['passwords']).controls['confirmPassword'].value != "";
    if (isBothPasswordsFilled) {
      const agree = createTeacherAccountForm.controls['agree'].value;
      if (!agree) {
        createTeacherAccountForm.setErrors({ 'agreeNotChecked': true });
        return { 'agreeNotChecked': true };
      }
    }
    return null;
  }
}
