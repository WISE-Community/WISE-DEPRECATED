import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Teacher } from '../../domain/teacher';
import { TeacherService } from '../../teacher/teacher.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterUserFormComponent } from '../register-user-form/register-user-form.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-teacher-form',
  templateUrl: './register-teacher-form.component.html',
  styleUrls: ['./register-teacher-form.component.scss']
})
export class RegisterTeacherFormComponent extends RegisterUserFormComponent implements OnInit {
  teacherUser: Teacher = new Teacher();
  schoolLevels: any[] = [
    { code: 'ELEMENTARY_SCHOOL', label: $localize`Elementary School` },
    { code: 'MIDDLE_SCHOOL', label: $localize`Middle School` },
    { code: 'HIGH_SCHOOL', label: $localize`High School` },
    { code: 'COLLEGE', label: $localize`College` },
    { code: 'OTHER', label: $localize`Other` }
  ];
  passwordsFormGroup = this.fb.group(
    {
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    },
    { validator: this.passwordMatchValidator }
  );
  createTeacherAccountFormGroup: FormGroup = this.fb.group(
    {
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z]+')]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z]+')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      schoolName: new FormControl('', [Validators.required]),
      schoolLevel: new FormControl('', [Validators.required]),
      howDidYouHearAboutUs: new FormControl(''),
      agree: new FormControl('')
    },
    { validator: this.agreeCheckboxValidator }
  );
  isSubmitted = false;
  processing: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private teacherService: TeacherService,
    private utilService: UtilService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
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
      this.teacherService.registerTeacherAccount(this.teacherUser).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.router.navigate([
              'join/teacher/complete',
              { username: response.username, isUsingGoogleId: this.isUsingGoogleId() }
            ]);
          } else {
            this.snackBar.open(this.translateCreateAccountErrorMessageCode(response.messageCode));
          }
          this.processing = false;
        },
        (error: HttpErrorResponse) => {
          this.snackBar.open(this.translateCreateAccountErrorMessageCode(error.error.messageCode));
          this.processing = false;
        }
      );
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
      const error = { passwordDoesNotMatch: true };
      passwordsFormGroup.controls['confirmPassword'].setErrors(error);
      return error;
    }
  }

  agreeCheckboxValidator(createTeacherAccountFormGroup: FormGroup) {
    const agree = createTeacherAccountFormGroup.get('agree').value;
    if (!agree) {
      const error = { agreeNotChecked: true };
      createTeacherAccountFormGroup.setErrors(error);
      return error;
    }
    return null;
  }
}
