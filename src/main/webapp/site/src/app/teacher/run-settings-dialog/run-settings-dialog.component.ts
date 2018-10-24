import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material';
import { LibraryProjectDetailsComponent } from "../../modules/library/library-project-details/library-project-details.component";
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";
import * as moment from 'moment';

@Component({
  selector: 'app-run-settings-dialog',
  templateUrl: './run-settings-dialog.component.html',
  styleUrls: ['./run-settings-dialog.component.scss']
})
export class RunSettingsDialogComponent implements OnInit {

  run: Run;
  newPeriodName: string;
  studentsPerTeam: string;
  startDate: any;
  previousStartDate: any;
  deletePeriodMessage: string = '';
  addPeriodMessage: string = '';
  studentsPerTeamMessage: string = '';
  startDateMessage: string = '';

  periodNameAlreadyExists = 'There is already a period with that name.';
  noPermissionToAddPeriod = 'You do not have the permission to add periods to this run.';
  notAllowedToDeletePeriodWithStudents = 'You are not allowed to delete a period that contains students.';
  noPermissionToDeletePeriod = 'You do not have the permission to delete periods from this run.';
  noPermissionToChangeStudentsPerTeam = 'You do not have the permission to change the number of students per team for this run.';
  noPermissionToChangeStartDate = 'You do not have the permission to change the start date for this run.';

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService) {
    this.run = data.run;
    this.studentsPerTeam = this.run.studentsPerTeam + '';
    this.startDate = new Date(this.run.startTime);
    this.rememberPreviousStartDate();
  }

  ngOnInit() {

  }

  newPeriodNameKeyUp(event) {
    if (this.isEnterKeyWithNewPeriodName(event)) {
      this.addPeriod();
    }
  }

  isEnterKeyWithNewPeriodName(event) {
    return event.keyCode == 13 && this.newPeriodName != '';
  }

  addPeriod() {
    const periodName = this.newPeriodName;
    if (periodName == null || periodName == '') {
      this.addPeriodMessage = 'Please enter a new period name.';
    } else {
      if (confirm(`Are you sure you want to add the period ${periodName}?`)) {
        this.teacherService.addPeriodToRun(this.run.id, periodName).subscribe((response: any) => {
          if (response.status == 'success') {
            this.run = response.run;
            this.updateDataRun(this.run);
            this.clearNewPeriodInput();
            this.clearErrorMessages();
          } else {
            this.addPeriodMessage = this.translateMessageCode(response.messageCode);
          }
        });
      }
    }
  }

  deletePeriod(periodName) {
    if (confirm(`Are you sure you want to delete the period ${periodName}?`)) {
      this.teacherService.deletePeriodFromRun(this.run.id, periodName).subscribe((response: any) => {
        if (response.status == 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.clearErrorMessages();
        } else {
          this.deletePeriodMessage = this.translateMessageCode(response.messageCode);
        }
      });
    }
  }

  changeStudentsPerTeam(studentsPerTeam) {
    let studentsPerTeamText = studentsPerTeam;
    if (studentsPerTeam == 3) {
      studentsPerTeamText = '1-3';
    }
    if (confirm(`Are you sure you want to change the students per team to ${studentsPerTeamText}?`)) {
      this.teacherService.updateRunStudentsPerTeam(
          this.run.id, studentsPerTeam).subscribe((response: any) => {
        if (response.status == 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.clearErrorMessages();
        } else {
          this.studentsPerTeamMessage = this.translateMessageCode(response.messageCode);
        }
      });
      return true;
    } else {
      return false;
    }
  }

  updateStartTime() {
    const startDate = this.startDate;
    const formattedStartDate = moment(startDate).format('ddd MMM DD YYYY');
    if (confirm(`Are you sure you want to change the start date to\n${formattedStartDate}?`)) {
      this.teacherService.updateRunStartTime(this.run.id, startDate).subscribe((response: any) => {
        if (response.status == 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.rememberPreviousStartDate();
          this.clearErrorMessages();
        } else {
          this.startDateMessage = this.translateMessageCode(response.messageCode);
        }
      });
    } else {
      this.rollbackStartDate();
    }
  }

  rollbackStartDate() {
    this.startDate = this.previousStartDate;
  }

  rememberPreviousStartDate() {
    this.previousStartDate = new Date(this.run.startTime);
  }

  clearNewPeriodInput() {
    this.newPeriodName = '';
  }

  clearErrorMessages() {
    this.deletePeriodMessage = '';
    this.addPeriodMessage = '';
    this.studentsPerTeamMessage = '';
    this.startDateMessage = '';
  }

  translateMessageCode(messageCode: string): string {
    if (messageCode == 'periodNameAlreadyExists') {
      return this.periodNameAlreadyExists;
    } else if (messageCode == 'noPermissionToAddPeriod') {
      return this.noPermissionToAddPeriod;
    } else if (messageCode == 'notAllowedToDeletePeriodWithStudents') {
      return this.notAllowedToDeletePeriodWithStudents;
    } else if (messageCode == 'noPermissionToDeletePeriod') {
      return this.noPermissionToDeletePeriod;
    } else if (messageCode == 'noPermissionToChangeStudentsPerTeam') {
      return this.noPermissionToChangeStudentsPerTeam;
    } else if (messageCode == 'noPermissionToChangeStartDate') {
      return this.noPermissionToChangeStartDate;
    }
  }

  updateDataRun(run) {
    this.data.run.periods = run.periods;
    this.data.run.studentsPerTeam = run.studentsPerTeam;
    this.data.run.startTime = run.startTime;
  }
}
