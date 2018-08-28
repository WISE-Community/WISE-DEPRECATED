import { Component, OnInit } from '@angular/core';
import { Student } from "../../../domain/student";
import { UserService } from "../../../services/user.service";
import { StudentService } from "../../student.service";
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {


  user: Student;
  message: string = '';
  languages: object[];

  editProfileFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    lastName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    userName: new FormControl({ value: '', disabled: true }, [Validators.required]),
    language: new FormControl('', [Validators.required])
  });

  constructor(private fb: FormBuilder,
              private studentService: StudentService,
              private userService: UserService) {
    this.user = <Student>this.getUser().getValue();
    this.setControlFieldValue('firstName', this.user.firstName);
    this.setControlFieldValue('lastName', this.user.lastName);
    this.setControlFieldValue('userName', this.user.userName);
    this.setControlFieldValue('language', this.user.language);
    this.userService.getLanguages().subscribe((response) => {
      this.languages = <object[]>response;
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
    const username = this.user.userName;
    const language = this.getControlFieldValue('language');
    this.studentService.updateProfile(username, language)
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
