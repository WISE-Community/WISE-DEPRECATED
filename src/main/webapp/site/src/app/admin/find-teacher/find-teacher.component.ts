import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AdminService } from '../admin.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material';
import { AdminActionsComponent } from '../admin-actions/admin-actions.component';
import { AdminActions } from '../admin-actions';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-find-teacher',
  templateUrl: './find-teacher.component.html',
  styleUrls: ['./find-teacher.component.scss']
})
export class FindTeacherComponent implements OnInit {

  @ViewChild('searchTeachersForm', { static: false }) searchTeachersForm;
  showSearchById: boolean = false;
  searchResultsAvailable: boolean = false;
  dataSource: any[] = [];
  displayedColumns: string[] =
      ['username', 'changePassword', 'loginAsUser', 'userInfo', 'manageRoles'];
  changePasswordAdminAction: string = AdminActions.CHANGE_PASSWORD;
  viewUserInfoAdminAction: string = AdminActions.VIEW_USER_INFO;
  manageRolesAdminAction: string = AdminActions.MANAGE_ROLES;
  schoolLevels: any[] = [
    { code: '', label: this.i18n('None') },
    { code: 'ELEMENTARY_SCHOOL', label: this.i18n('Elementary School') },
    { code: 'MIDDLE_SCHOOL', label: this.i18n('Middle School') },
    { code: 'HIGH_SCHOOL', label: this.i18n('High School') },
    { code: 'COLLEGE', label: this.i18n('College') },
    { code: 'OTHER', label: this.i18n('Other') }
  ];

  searchTeachersFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    username: new FormControl(''),
    userId: new FormControl(''),
    displayName: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    country: new FormControl(''),
    schoolName: new FormControl(''),
    schoolLevel: new FormControl(''),
    email: new FormControl(''),
    runId: new FormControl('')
  });

  constructor(private adminService: AdminService,
              private userService: UserService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private i18n: I18n) { }

  ngOnInit() {
    this.showSearchById = this.userService.isAdmin();
  }

  searchTeachers() {
    const firstName = this.getControlFieldValue('firstName');
    const lastName = this.getControlFieldValue('lastName');
    const username = this.getControlFieldValue('username');
    const userId = this.getControlFieldValue('userId');
    const displayName = this.getControlFieldValue('displayName');
    const city = this.getControlFieldValue('city');
    const state = this.getControlFieldValue('state');
    const country = this.getControlFieldValue('country');
    const schoolName = this.getControlFieldValue('schoolName');
    const schoolLevel = this.getControlFieldValue('schoolLevel');
    const email = this.getControlFieldValue('email');
    const runId = this.getControlFieldValue('runId');
    if (!firstName && !lastName && !username && !userId && !displayName && !city && !state &&
        !country && !schoolName && !schoolLevel && !email && !runId) {
      alert('You must enter at least one field.');
    } else {
      this.adminService.searchTeachers(firstName, lastName, username, userId, displayName, city,
        state, country, schoolName, schoolLevel, email, runId).subscribe(teachers => {
        this.dataSource = teachers;
        this.searchResultsAvailable = true;
        if (this.dataSource.length > 0) {
          setTimeout(() => {
            document.querySelector('#teacher-search-results').scrollIntoView(
              { behavior: 'smooth' }
            );
          }, 300);
        }
      });
    }
  }

  setControlFieldValue(fieldName: string, value: string) {
    this.searchTeachersFormGroup.controls[fieldName].setValue(value);
  }

  getControlFieldValue(fieldName: string) {
    return this.searchTeachersFormGroup.get(fieldName).value;
  }

  clearFormFields() {
    this.setControlFieldValue('firstName', '');
    this.setControlFieldValue('lastName', '');
    this.setControlFieldValue('username', '');
    this.setControlFieldValue('userId', '');
    this.setControlFieldValue('displayName', '');
    this.setControlFieldValue('city', '');
    this.setControlFieldValue('state', '');
    this.setControlFieldValue('country', '');
    this.setControlFieldValue('schoolName', '');
    this.setControlFieldValue('schoolLevel', '');
    this.setControlFieldValue('email', '');
    this.setControlFieldValue('runId', '');
    this.searchResultsAvailable = false;
  }

  openAdminActions(username: string, action: string) {
    this.userService.getUserByUsername(username).subscribe(user => {
      this.dialog.open(AdminActionsComponent, {
        data: { user: user, action: action, isTeacher: true },
        panelClass: 'mat-dialog--sm',
        disableClose: true
      });
    });
  }

  loginAsUser(username: string) {
    window.location.href = `/login/impersonate?username=${username}`;
  }
}
