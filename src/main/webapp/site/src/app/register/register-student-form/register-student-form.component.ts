import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from '@angular/core';
import { Student } from "../../domain/student";
import { StudentService } from "../../student/student.service";
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";

@Component({
  selector: 'app-register-student-form',
  templateUrl: './register-student-form.component.html',
  styleUrls: ['./register-student-form.component.scss']
})
export class RegisterStudentFormComponent implements OnInit {

  studentUser: Student = new Student();
  genders: string[] = ["MALE", "FEMALE", "NO ANSWER"];
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
  days: string[] = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31"
  ];
  securityQuestions: object;
  private sub: any;
  passwordsFormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });
  createStudentAccountFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthDay: new FormControl('', [Validators.required]),
    securityQuestion: new FormControl('', [Validators.required]),
    securityQuestionAnswer: new FormControl('', [Validators.required]),
    passwords: this.passwordsFormGroup
  });

  constructor(private router: Router, private route: ActivatedRoute,
              private studentService: StudentService, private fb: FormBuilder) {
    this.studentService.retrieveSecurityQuestions().subscribe(response => {
      this.securityQuestions = response;
    });
  }

  ngOnInit() {
  }

  createAccount() {
    this.populateStudentUser();
    this.studentService.registerStudentAccount(this.studentUser, (userName) => {
      this.router.navigate(['join/student/complete',
        { username: userName }
      ]);
    });
  }

  populateStudentUser() {
    for (let key of Object.keys(this.createStudentAccountFormGroup.controls)) {
      if (key == 'birthMonth') {
        this.studentUser[key] = parseInt(this.createStudentAccountFormGroup.get(key).value);
      } else {
        this.studentUser[key] = this.createStudentAccountFormGroup.get(key).value;
      }
    }
    this.studentUser['password'] = this.getPassword();
    delete this.studentUser['passwords'];
    this.studentUser['birthMonth'] = this.studentUser['birthMonth'];
    this.studentUser['birthDay'] = this.studentUser['birthDay'];
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
}
