import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { Teacher } from '../../../domain/teacher';
import { TeacherService } from '../../teacher.service';
import { MatDialog } from '@angular/material/dialog';
import { UnlinkGoogleAccountConfirmComponent } from '../../../modules/shared/unlink-google-account-confirm/unlink-google-account-confirm.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  user: Teacher;
  schoolLevels: any[] = [
    { id: 'ELEMENTARY_SCHOOL', label: $localize`Elementary School` },
    { id: 'MIDDLE_SCHOOL', label: $localize`Middle School` },
    { id: 'HIGH_SCHOOL', label: $localize`High School` },
    { id: 'COLLEGE', label: $localize`College` },
    { id: 'OTHER', label: $localize`Other` }
  ];
  languages: object[];
  changed: boolean = false;
  isSaving: boolean = false;
  isGoogleUser: boolean = false;
  userSubscription: Subscription;

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

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private userService: UserService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
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
  }

  getUser() {
    return this.userService.getUser();
  }

  setControlFieldValue(name: string, value: string) {
    this.editProfileFormGroup.controls[name].setValue(value);
  }

  ngOnInit() {
    this.editProfileFormGroup.valueChanges.subscribe(() => {
      this.changed = true;
    });

    this.userSubscription = this.userService.getUser().subscribe((user) => {
      this.isGoogleUser = user.isGoogleUser;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
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
    const username = this.user.username;
    this.teacherService
      .updateProfile(
        username,
        displayName,
        email,
        city,
        state,
        country,
        schoolName,
        schoolLevel,
        language
      )
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe((response) => {
        this.handleUpdateProfileResponse(response);
        this.userService.updateTeacherUser(
          displayName,
          email,
          city,
          state,
          country,
          schoolName,
          schoolLevel,
          language
        );
      });
  }

  getControlFieldValue(fieldName) {
    return this.editProfileFormGroup.get(fieldName).value;
  }

  handleUpdateProfileResponse(response) {
    if (response.status === 'success') {
      this.changed = false;
      this.snackBar.open($localize`Profile updated.`);
    } else {
      this.snackBar.open($localize`An error occurred. Please try again.`);
    }
  }

  unlinkGoogleAccount() {
    this.dialog.open(UnlinkGoogleAccountConfirmComponent, {
      panelClass: 'mat-dialog--sm'
    });
  }
}
