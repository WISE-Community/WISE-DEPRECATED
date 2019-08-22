import {Component, OnInit, ViewChild} from '@angular/core';
import { AdminService } from '../admin.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material';
import { AdminActionsComponent } from '../admin-actions/admin-actions.component';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-find-student',
  templateUrl: './find-student.component.html',
  styleUrls: ['./find-student.component.scss']
})
export class FindStudentComponent implements OnInit {

  @ViewChild('searchStudentFieldsForm', { static: false }) searchStudentFieldsForm;
  showSearchById: boolean = false;
  searchResultsAvailable: boolean = false;
  dataSource: any[] = [];
  displayedColumns: string[] = ['username', 'changePassword', 'loginAsUser', 'userInfo'];

  searchStudentFieldsFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    username: new FormControl(''),
    userId: new FormControl(''),
    runId: new FormControl(''),
    workgroupId: new FormControl(''),
    teacherUsername: new FormControl('')
  });

  constructor(private adminService: AdminService,
              private userService: UserService,
              private dialog: MatDialog,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.showSearchById = this.userService.isAdmin();
  }

  search() {
    const firstName = this.getControlFieldValue('firstName');
    const lastName = this.getControlFieldValue('lastName');
    const username = this.getControlFieldValue('username');
    const userId = this.getControlFieldValue('userId');
    const runId = this.getControlFieldValue('runId');
    const workgroupId = this.getControlFieldValue('workgroupId');
    const teacherUsername = this.getControlFieldValue('teacherUsername');
    if (!firstName && !lastName && !username && !userId && !runId && !workgroupId && !teacherUsername) {
      alert('You must enter at least one field.');
    } else {
      this.adminService.searchStudents(firstName, lastName, username, userId, runId, workgroupId, teacherUsername).subscribe(students => {
          this.dataSource = students;
          this.searchResultsAvailable = true;
          setTimeout(() => {
            document.querySelector('#student-search-results').scrollIntoView(
              { behavior: 'smooth' }
            );
          }, 600);
      });
    }
  }

  setControlFieldValue(fieldName: string, value: string) {
    this.searchStudentFieldsFormGroup.controls[fieldName].setValue(value);
  }

  getControlFieldValue(fieldName: string) {
    return this.searchStudentFieldsFormGroup.get(fieldName).value;
  }

  clearFormFields() {
    this.setControlFieldValue('firstName', '');
    this.setControlFieldValue('lastName', '');
    this.setControlFieldValue('username', '');
    this.setControlFieldValue('userId', '');
    this.setControlFieldValue('runId', '');
    this.setControlFieldValue('workgroupId', '');
    this.setControlFieldValue('teacherUsername', '');
    this.searchResultsAvailable = false;
  }

  openAdminActions(username: string, action: string) {
    this.userService.getUserByUsername(username).subscribe(user => {
      this.dialog.open(AdminActionsComponent, {
        data: { user, action },
        panelClass: 'mat-dialog--md',
        disableClose: true
      })
    });
  }

  loginAsUser(username: string) {

  }
}
