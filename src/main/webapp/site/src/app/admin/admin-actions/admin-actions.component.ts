import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-actions',
  templateUrl: './admin-actions.component.html',
  styleUrls: ['./admin-actions.component.scss']
})
export class AdminActionsComponent implements OnInit {

  @ViewChild('adminChangePasswordForm', { static: false }) adminChangePasswordForm;
  user: any;
  isGoogleUser: boolean;
  isChangePassword: boolean;
  isViewUserInfo: boolean;
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
    oldPassword: new FormControl('', [Validators.required]),
    newPasswordFormGroup: this.newPasswordFormGroup
  });

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<AdminActionsComponent>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private data: any) {
    this.user = data.user;
    this.runs = this.user.runs;
    this.isChangePassword = data.action === 'changePassword';
    this.isViewUserInfo = data.action === 'viewUserInfo';
  }

  ngOnInit() {
    this.isGoogleUser = this.user.isGoogleUser;
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
