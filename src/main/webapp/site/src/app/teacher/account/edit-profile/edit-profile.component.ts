import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { Teacher } from "../../../domain/teacher";
import { TeacherService } from "../../teacher.service";

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  user: Teacher;
  schoolLevels: string[] = ["ELEMENTARY_SCHOOL", "MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "OTHER"];
  message: string = '';

  editProfileFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    lastName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    displayName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    schoolName: new FormControl('', [Validators.required]),
    schoolLevel: new FormControl('', [Validators.required])
  });

  constructor(private fb: FormBuilder,
        private teacherService: TeacherService,
        private userService: UserService) {
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
    const displayName: string = this.getControlFieldValue('displayName');
    const email: string = this.getControlFieldValue('email');
    const city: string = this.getControlFieldValue('city');
    const state: string = this.getControlFieldValue('state');
    const country: string = this.getControlFieldValue('country');
    const schoolName: string = this.getControlFieldValue('schoolName');
    const schoolLevel: string = this.getControlFieldValue('schoolLevel');
    const username = this.user.userName;
    this.teacherService.updateProfile(username, displayName, email, city, state, country, schoolName, schoolLevel)
        .subscribe((response) => {
      this.handleUpdateProfileResponse(response);
    })
  }

  getControlFieldValue(fieldName) {
    return this.editProfileFormGroup.get(fieldName).value;
  }

  handleUpdateProfileResponse(response) {
    if (response.message == 'success') {
      this.displayMessage("Successfully changed password");
    } else {
      this.displayMessage("Failed to change password");
    }
  }

  displayMessage(message: string) {
    this.message = message;
  }
}
