import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { UserService } from "../../../services/user.service";
import { Teacher } from "../../../domain/teacher";
import { TeacherService } from "../../teacher.service";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  user: Teacher;
  schoolLevels: any[] = [
    { id: 'ELEMENTARY_SCHOOL', label: this.i18n('Elementary School') },
    { id: 'MIDDLE_SCHOOL', label: this.i18n('Middle School') },
    { id: 'HIGH_SCHOOL', label: this.i18n('High School') },
    { id: 'COLLEGE', label: this.i18n('College') },
    { id: 'OTHER', label: this.i18n('Other') }
  ];
  languages: object[];
  changed: boolean = false;
  isSaving: boolean = false;

  editProfileFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    lastName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    displayName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    schoolName: new FormControl('', [Validators.required]),
    schoolLevel: new FormControl('', [Validators.required]),
    language: new FormControl('', [Validators.required])
  });

  constructor(private fb: FormBuilder,
        private teacherService: TeacherService,
        private userService: UserService,
        public snackBar: MatSnackBar,
        private i18n: I18n) {
    this.user = <Teacher>this.getUser().getValue();
    this.setControlFieldValue('firstName', this.user.firstName);
    this.setControlFieldValue('lastName', this.user.lastName);
    this.setControlFieldValue('displayName', this.user.displayName);
    this.setControlFieldValue('email', this.user.email);
    this.setControlFieldValue('city', this.user.city);
    this.setControlFieldValue('state', this.user.state);
    this.setControlFieldValue('country', this.user.country);
    this.setControlFieldValue('schoolName', this.user.schoolName);
    this.setControlFieldValue('schoolLevel', this.user.schoolLevel);
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
    const displayName: string = this.getControlFieldValue('displayName');
    const email: string = this.getControlFieldValue('email');
    const city: string = this.getControlFieldValue('city');
    const state: string = this.getControlFieldValue('state');
    const country: string = this.getControlFieldValue('country');
    const schoolName: string = this.getControlFieldValue('schoolName');
    const schoolLevel: string = this.getControlFieldValue('schoolLevel');
    const language: string = this.getControlFieldValue('language');
    const username = this.user.userName;
    this.teacherService.updateProfile(username, displayName, email, city, state, country, schoolName, schoolLevel, language)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe((response) => {
          this.handleUpdateProfileResponse(response);
          this.userService.updateTeacherUser(displayName, email, city, state, country, schoolName, schoolLevel, language);
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
  }
}
