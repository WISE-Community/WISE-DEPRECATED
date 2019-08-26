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
  userInfoDataSource: any[] = [];
  userInfoDisplayedColumns = ['label', 'value'];
  runColumns = ['runId', 'name', 'startTime', 'teacherUsername', 'teacherEmail'];
  runLabels = ['Run ID', 'Run Name', 'Run Start Time', 'Teacher Username', 'Teacher Email'];
  runsDataSource: MatTableDataSource<any>;
  runDisplayedColumns = [];
  runs = [];

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
    this.runs = this.user.runs;
  }

  ngOnInit() {
    this.updateDataSource();
    this.transposeRunsData();
    this.fillRunLabels();
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
    if (response.message == 'success') {
      this.resetForm();
      this.snackBar.open(this.i18n(`Password changed.`));
    } else if (response.message == 'incorrect admin password') {
      const error = { 'incorrectPassword': true };
      const adminPasswordControl = this.adminChangePasswordFormGroup.get('adminPassword');
      adminPasswordControl.setErrors(error);
    } else if (response.message === 'invalid password') {
      const error = { 'incorrectPassword': true };
      const oldPasswordControl = this.adminChangePasswordFormGroup
    }
  }

  resetForm() {
    this.adminChangePasswordForm.resetForm();
  }

  updateDataSource() {
    this.userInfoDataSource.push({ label: 'ID', value: this.user.userId });
    this.userInfoDataSource.push({ label: 'Full Name', value: `${this.user.firstName} ${this.user.lastName}` });
    this.userInfoDataSource.push({ label: 'WISE Username', value: this.user.username });
    this.userInfoDataSource.push({ label: 'Number of Logins', value: this.user.numberOfLogins });
  }

  transposeRunsData() {
    let transposedData = [];
    for (let column = 0; column < this.runColumns.length; column++) {
      transposedData[column] = { label: this.runLabels[column] };
      for (let row = 0; row < this.runs.length; row++) {
        transposedData[column][`column${row}`] = this.runs[row][this.runColumns[column]];
      }
    }
    this.runsDataSource = new MatTableDataSource(transposedData);
  }

  fillRunLabels() {
    this.runDisplayedColumns = ['label'];
    for (let i = 0; i < this.runs.length; i++) {
      this.runDisplayedColumns.push(`column${i}`);
    }
  }
}
