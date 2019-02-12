import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Student } from "../../../domain/student";
import { UserService } from "../../../services/user.service";
import { StudentService } from "../../student.service";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  user: Student;
  languages: object[];
  changed: boolean = false;
  isSaving: boolean = false;

  editProfileFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    lastName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    userName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    language: new FormControl('', [Validators.required])
  });

  constructor(private fb: FormBuilder,
              private studentService: StudentService,
              private userService: UserService,
              public snackBar: MatSnackBar,
              private i18n: I18n) {
    this.user = <Student>this.getUser().getValue();
    this.setControlFieldValue('firstName', this.user.firstName);
    this.setControlFieldValue('lastName', this.user.lastName);
    this.setControlFieldValue('userName', this.user.userName);
    this.setControlFieldValue('language', this.user.language);
    this.userService.getLanguages().subscribe((response) => {
      this.languages = <object[]>response;
    });

    this.editProfileFormGroup.valueChanges.subscribe(() => {
      this.changed = true;
    });
  }

  getUser() {
    return this.userService.getUser();
  }

  setControlFieldValue(name: string, value: string) {
    this.editProfileFormGroup.controls[name].setValue(value);
  }

  ngOnInit() {
  }

  saveChanges() {
    this.isSaving = true;
    const username = this.user.userName;
    const language = this.getControlFieldValue('language');
    this.studentService.updateProfile(username, language)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe((response) => {
          this.handleUpdateProfileResponse(response);
          this.userService.updateStudentUser(language);
        })
  }

  getControlFieldValue(fieldName) {
    return this.editProfileFormGroup.get(fieldName).value;
  }

  handleUpdateProfileResponse(response) {
    if (response.message == 'success') {
      this.changed = false;
      this.snackBar.open(this.i18n(`Profile updated.`));
    } else {
      this.snackBar.open(this.i18n(`An error occurred. Please try again.`));
    }
    this.isSaving = false;
  }
}
