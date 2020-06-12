import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LibraryProjectDetailsComponent } from "../../modules/library/library-project-details/library-project-details.component";
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";
import * as moment from 'moment';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-run-settings-dialog',
  templateUrl: './run-settings-dialog.component.html',
  styleUrls: ['./run-settings-dialog.component.scss']
})

export class RunSettingsDialogComponent implements OnInit {

  run: Run;
  newPeriodName: string;
  maxStudentsPerTeam: string;
  startDate: Date;
  previousStartDate: Date;
  endDate: Date;
  isLockedAfterEndDateCheckboxEnabled: boolean = false;
  isLockedAfterEndDate: boolean;
  previousEndDate: Date;
  deletePeriodMessage: string = '';
  addPeriodMessage: string = '';
  maxStudentsPerTeamMessage: string = '';
  startDateMessage: string = '';
  endDateMessage: string = '';
  isLockedAfterEndDateMessage: string = '';
  maxStartDate: Date;
  minEndDate: Date;
  targetEndDate: Date;
  messageCodeToMessage: any;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              public snackBar: MatSnackBar,
              private i18n: I18n) {
    this.run = data.run;
    this.maxStudentsPerTeam = this.run.maxStudentsPerTeam + '';
    this.startDate = new Date(this.run.startTime);
    this.endDate = this.run.endTime ? new Date(this.run.endTime) : null;
    this.isLockedAfterEndDate = this.run.isLockedAfterEndDate;
    this.rememberPreviousStartDate();
    this.rememberPreviousEndDate();
    this.setDateRange();
    if (this.endDate != null) {
      this.isLockedAfterEndDateCheckboxEnabled = true;
    }
    this.initializeMessageCodeToMessage();
  }

  initializeMessageCodeToMessage() {
    this.messageCodeToMessage = {
      periodNameAlreadyExists: this.i18n('There is already a period with that name.'),
      noPermissionToAddPeriod: this.i18n('You do not have permission to add periods to this unit.'),
      notAllowedToDeletePeriodWithStudents: this.i18n('You are not allowed to delete a period that contains students.'),
      noPermissionToDeletePeriod: this.i18n('You do not have permission to delete periods from this unit.'),
      noPermissionToChangeMaxStudentsPerTeam: this.i18n('You do not have permission to change the number of students per team for this unit.'),
      notAllowedToDecreaseMaxStudentsPerTeam: this.i18n('You are not allowed to decrease the number of students per team because this unit already has teams with more than 1 student.'),
      noPermissionToChangeDate: this.i18n('You do not have permission to change the dates for this unit.'),
      endDateBeforeStartDate: this.i18n("End date can't be before start date."),
      startDateAfterEndDate: this.i18n("Start date can't be after end date."),
      noPermissionToChangeIsLockedAfterEndDate: this.i18n('You do not have permission to change is locked after end date')
    };
  }

  ngOnInit() {
  }

  newPeriodNameKeyUp(event) {
    if (this.isEnterKeyWithNewPeriodName(event)) {
      this.addPeriod();
    }
  }

  isEnterKeyWithNewPeriodName(event) {
    return event.keyCode === 13 && this.newPeriodName != '';
  }

  addPeriod() {
    this.clearErrorMessages();
    const periodName = this.newPeriodName;
    if (periodName == null || periodName === '') {
      this.addPeriodMessage = this.i18n('Please enter a new period name.');
    } else {
      this.teacherService.addPeriodToRun(this.run.id, periodName).subscribe((response: any) => {
        if (response.status === 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.clearNewPeriodInput();
          this.clearErrorMessages();
          this.showConfirmMessage();
        } else {
          this.addPeriodMessage = this.translateMessageCode(response.messageCode);
        }
      });
    }
  }

  deletePeriod(periodName) {
    this.clearErrorMessages();
    if (confirm(`Are you sure you want to delete this period: ${periodName}?`)) {
      this.teacherService.deletePeriodFromRun(this.run.id, periodName).subscribe((response: any) => {
        if (response.status === 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.clearErrorMessages();
          this.showConfirmMessage();
        } else {
          this.deletePeriodMessage = this.translateMessageCode(response.messageCode);
          alert(this.deletePeriodMessage);
        }
      });
    }
  }

  changeMaxStudentsPerTeam(maxStudentsPerTeam) {
    this.clearErrorMessages();
    let maxStudentsPerTeamText = maxStudentsPerTeam;
    if (maxStudentsPerTeam === 3) {
      maxStudentsPerTeamText = this.i18n('1-3');
    }
    if (confirm(this.i18n('Are you sure you want to change the students per team to {{value}}?', {value: maxStudentsPerTeamText}))) {
      this.teacherService.updateRunStudentsPerTeam(
          this.run.id, maxStudentsPerTeam).subscribe((response: any) => {
        if (response.status === 'success') {
          this.run = response.run;
          this.updateDataRun(this.run);
          this.clearErrorMessages();
          this.showConfirmMessage();
        } else {
          this.rollbackMaxStudentsPerTeam();
          this.maxStudentsPerTeamMessage = this.translateMessageCode(response.messageCode);
          alert(this.maxStudentsPerTeamMessage);
        }
      });
      return true;
    } else {
      this.rollbackMaxStudentsPerTeam();
      return false;
    }
  }

  updateStartTime() {
    this.clearErrorMessages();
    if (this.startDate) {
      const startDate = this.startDate;
      const formattedStartDate = moment(startDate).format('ddd MMM DD YYYY');
      if (confirm(this.i18n('Are you sure you want to change the start date to {{date}}?', {date: formattedStartDate}))) {
        this.teacherService.updateRunStartTime(this.run.id, startDate.getTime()).subscribe((response: any) => {
          if (response.status === 'success') {
            this.run = response.run;
            this.updateDataRun(this.run);
            this.rememberPreviousStartDate();
            this.clearErrorMessages();
            this.showConfirmMessage();
            this.setDateRange();
          } else {
            this.startDateMessage = this.translateMessageCode(response.messageCode);
          }
        });
      } else {
        this.rollbackStartDate();
      }
    } else {
      this.rollbackStartDate();
    }
  }

  updateEndTime() {
    this.clearErrorMessages();
    if (confirm(this.getEndDateChangeConfirmationMessage())) {
      this.updateRunEndTime(this.run.id, this.getEndTime());
    } else {
      this.rollbackEndDate();
    }
  }

  updateRunEndTime(runId, endTime) {
    this.teacherService.updateRunEndTime(runId, endTime).subscribe((response: any) => {
      if (response.status === 'success') {
        this.run = response.run;
        this.updateDataRun(this.run);
        this.rememberPreviousEndDate();
        this.clearErrorMessages();
        this.showConfirmMessage();
        this.setDateRange();
        this.updateLockedAfterEndDateCheckbox();
      } else {
        this.endDateMessage = this.translateMessageCode(response.messageCode);
      }
    });
  }

  getEndDateChangeConfirmationMessage() {
    let message = '';
    if (this.endDate) {
      const endDate = this.endDate;
      endDate.setHours(23, 59, 59);
      const formattedEndDate = moment(endDate).format('ddd MMM DD YYYY');
      message = this.i18n('Are you sure you want to change the end date to {{date}}?',
          {date: formattedEndDate});
    } else {
      message = this.i18n('Are you sure you want to remove the end date?');
    }
    return message;
  }

  getEndTime() {
    if (this.endDate == null) {
      return null;
    } else {
      return this.endDate.getTime();
    }
  }

  setDateRange() {
    this.minEndDate = this.startDate;
    this.maxStartDate = this.endDate;
    this.targetEndDate = null;
    if (this.run.lastRun && !this.run.endTime) {
      this.targetEndDate = new Date(this.run.lastRun);
    }
  }

  updateLockedAfterEndDateCheckbox() {
    if (this.endDate == null) {
      const previousIsLockedAfterEndDateValue = this.isLockedAfterEndDate;
      this.isLockedAfterEndDateCheckboxEnabled = false;
      this.isLockedAfterEndDate = false;
      if (previousIsLockedAfterEndDateValue != this.isLockedAfterEndDate) {
        this.updateIsLockedAfterEndDate();
      }
    } else {
      this.isLockedAfterEndDateCheckboxEnabled = true;
    }
  }

  updateIsLockedAfterEndDate() {
    this.teacherService.updateIsLockedAfterEndDate(this.run.id, this.isLockedAfterEndDate)
        .subscribe((response: any) => {
      if (response.status === 'success') {
        this.run = response.run;
        this.updateDataRun(this.run);
        this.clearErrorMessages();
      } else {
        this.isLockedAfterEndDateMessage = this.translateMessageCode(response.messageCode);
      }
    });
  }

  rollbackMaxStudentsPerTeam() {
    this.maxStudentsPerTeam = this.run.maxStudentsPerTeam + '';
  }

  rollbackStartDate() {
    this.startDate = this.previousStartDate;
  }

  rollbackEndDate() {
    this.endDate = this.previousEndDate;
  }

  rememberPreviousStartDate() {
    this.previousStartDate = new Date(this.run.startTime);
  }

  rememberPreviousEndDate() {
    this.previousEndDate = new Date(this.run.endTime);
  }

  clearNewPeriodInput() {
    this.newPeriodName = '';
  }

  clearErrorMessages() {
    this.deletePeriodMessage = '';
    this.addPeriodMessage = '';
    this.maxStudentsPerTeamMessage = '';
    this.startDateMessage = '';
    this.endDateMessage = '';
    this.isLockedAfterEndDateMessage = '';
  }

  showConfirmMessage() {
    this.snackBar.open(this.i18n(`Unit settings updated.`));
  }

  translateMessageCode(messageCode: string): string {
    return this.messageCodeToMessage[messageCode];
  }

  updateDataRun(run) {
    this.data.run.periods = run.periods;
    this.data.run.maxStudentsPerTeam = run.maxStudentsPerTeam;
    this.data.run.startTime = run.startTime;
    this.data.run.endTime = run.endTime;
    this.data.run.isLockedAfterEndDate = run.isLockedAfterEndDate;
    this.data.run.lastRun = run.lastRun;
  }
}
