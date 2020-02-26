import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminActions } from '../admin-actions';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-actions',
  templateUrl: './admin-actions.component.html',
  styleUrls: ['./admin-actions.component.scss']
})
export class AdminActionsComponent implements OnInit {

  @ViewChild('adminChangePasswordForm', { static: false }) adminChangePasswordForm;
  user: any;
  isGoogleUser: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isChangePassword: boolean;
  isViewUserInfo: boolean;
  isManageRoles: boolean;
  isSaving: boolean = false;
  hasRun: boolean;
  userInfoDataSource: any[] = [];
  userInfoDisplayedColumns = ['label', 'value'];
  runColumnsStudents = ['runId', 'name', 'runCode', 'numberOfPeriods', 'numberOfStudents', 
      'previewProjectLink', 'editProjectLink', 'startTime', 'workGroupId', 'studentsInWorkGroup'];
  runColumnsTeachers = ['runId', 'name', 'runCode', 'numberOfPeriods', 'numberOfStudents', 
      'previewProjectLink', 'editProjectLink', 'startTime'];
  runsDataSource: MatTableDataSource<any>;
  runDisplayedColumns = [];
  runs = [];
  allAuthorities = [];
  userAuthorities;

  newPasswordFormGroup: FormGroup = this.fb.group({
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validator: this.passwordMatchValidator });

  adminChangePasswordFormGroup: FormGroup = this.fb.group({
    adminPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<AdminActionsComponent>,
              private adminService: AdminService,
              private fb: FormBuilder,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private i18n: I18n,
              @Inject(MAT_DIALOG_DATA) private data: any) {
    this.user = data.user;
    this.isGoogleUser = this.user.isGoogleUser;
    this.isStudent = data.isStudent;
    this.isTeacher = data.isTeacher;
    this.isChangePassword = data.action === AdminActions.CHANGE_PASSWORD;
    this.isViewUserInfo = data.action === AdminActions.VIEW_USER_INFO;
    this.isManageRoles = data.action === AdminActions.MANAGE_ROLES;
    if (this.user.runs) {
      this.runs = this.user.runs;
    }
    this.hasRun = this.runs.length != 0;
    this.userAuthorities = new Set();
    if (this.user.userAuthorities) {
      this.allAuthorities = this.user.allAuthorities;
      this.userAuthorities = new Set(this.user.userAuthorities);
    }
  }

  ngOnInit() {

    this.updateDataSource();
  }

  passwordMatchValidator(passwordsFormGroup: FormGroup) {
    const newPassword = passwordsFormGroup.get('newPassword').value;
    const confirmNewPassword = passwordsFormGroup.get('confirmNewPassword').value;
    if (newPassword == confirmNewPassword) {
      return null;
    } else {
      const error = { 'passwordDoesNotMatch': true };
      passwordsFormGroup.controls['confirmNewPassword'].setErrors(error);
      return error;
    }
  }

  saveChanges() {
    this.isSaving = true;
    const adminPassword: string = this.getControlFieldValue('adminPassword');
    const newPassword: string = this.getControlFieldValue('newPassword');
    const username = this.user.username;
    this.adminService.changeUserPassword(username, adminPassword, newPassword)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe((response) => {
        this.handleChangePasswordResponse(response);
      });
  }

  getControlFieldValue(fieldName) {
    if (fieldName == 'newPassword' || fieldName == 'confirmNewPassword') {
      return this.newPasswordFormGroup.get(fieldName).value;
    } else {
      return this.adminChangePasswordFormGroup.get(fieldName).value;
    }
  }

  handleChangePasswordResponse(response) {
    if (response.messageCode == 'success') {
      this.resetForm();
      this.snackBar.open(this.i18n(`Password changed.`));
    } else if (response.messageCode == 'incorrect admin password') {
      const error = { 'incorrectPassword': true };
      const adminPasswordControl = this.adminChangePasswordFormGroup.get('adminPassword');
      adminPasswordControl.setErrors(error);
    } else {
      const error = { 'incorrectPassword': true };
      const newPasswordControl = this.adminChangePasswordFormGroup.get('newPassword');
      const confirmNewPasswordControl = this.adminChangePasswordFormGroup.get('confirmNewPassword');
      newPasswordControl.setErrors(error);
      confirmNewPasswordControl.setErrors(error);
    }
  }

  resetForm() {
    this.adminChangePasswordForm.resetForm();
  }

  updateDataSource() {
    this.userInfoDataSource.push({ label: this.i18n('ID'), value: this.user.userId });
    this.userInfoDataSource.push({ label: this.i18n('Full Name'), value: `${this.user.firstName} ${this.user.lastName}` });
    this.userInfoDataSource.push({ label: this.i18n('WISE Username'), value: this.user.username });
    this.userInfoDataSource.push({ label: this.i18n('Email'), value: this.user.email});
    if(this.isStudent) {
      this.userInfoDataSource.push({ label: this.i18n('Gender'), value: this.user.gender });
      this.userInfoDataSource.push({ label: this.i18n('Birth Day'), value: this.user.birthDay });
      this.userInfoDataSource.push({ label: this.i18n('Birth Month'), value: this.user.birthMonth });
    }
    if(this.isTeacher) {
      this.userInfoDataSource.push({ label: this.i18n('Display Name'), value: this.user.displayName });
      this.userInfoDataSource.push({ label: this.i18n('City'), value: this.user.city });
      this.userInfoDataSource.push({ label: this.i18n('State'), value: this.user.state });
      this.userInfoDataSource.push({ label: this.i18n('Country'), value: this.user.country });
      this.userInfoDataSource.push({ label: this.i18n('School Name'), value: this.user.schoolName });
      this.userInfoDataSource.push({ label: this.i18n('School Level'), value: this.user.schoolLevel });
      this.userInfoDataSource.push({ label: this.i18n('How did you hear about us?'), value: this.user.howDidYouHearAboutUs });
    }
    this.userInfoDataSource.push({ label: this.i18n('Language'), value: this.user.language });
    this.userInfoDataSource.push({ label: this.i18n('Sign Up Date'), value: this.user.signUpDate });
    this.userInfoDataSource.push({ label: this.i18n('Number Of Logins'), value: this.user.numberOfLogins });
    this.userInfoDataSource.push({ label: this.i18n('Last Login'), value: this.user.lastLogIn });
  }

  userAuthorityChanged(authorityName: string) {
    let action;
    if (this.userAuthorities.has(authorityName)) {
      action = 'revoke';
    } else {
      action = 'grant';
    }
    this.adminService.updateUserAuthorities(this.user.username, action, authorityName).subscribe(response => {
      if (response.message === 'success') {
        if (action === 'revoke') {
          this.userAuthorities.delete(authorityName);
        } else if (action === 'grant') {
          this.userAuthorities.add(authorityName);
        }
        this.snackBar.open(this.i18n('Successfully updated user roles'));
      } else {
        this.snackBar.open(this.i18n('Could not update user roles'));
      }
    });
  }
}
