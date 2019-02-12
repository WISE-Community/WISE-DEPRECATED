import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
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
  startDate: any;
  previousStartDate: any;
  deletePeriodMessage: string = '';
  addPeriodMessage: string = '';
  maxStudentsPerTeamMessage: string = '';
  startDateMessage: string = '';

  periodNameAlreadyExists = this.i18n('There is already a period with that name.');
  noPermissionToAddPeriod = this.i18n('You do not have permission to add periods to this unit.');
  notAllowedToDeletePeriodWithStudents = this.i18n('You are not allowed to delete a period that contains students.');
  noPermissionToDeletePeriod = this.i18n('You do not have permission to delete periods from this unit.');
  noPermissionToChangeMaxStudentsPerTeam = this.i18n('You do not have permission to change the number of students per team for this unit.');
  notAllowedToDecreaseMaxStudentsPerTeam = this.i18n('You are not allowed to decrease the number of students per team because this unit already has teams with more than 1 student.');
  noPermissionToChangeStartDate = this.i18n('You do not have permission to change the start date for this unit.');

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              public snackBar: MatSnackBar,
              private i18n: I18n) {
    this.run = data.run;
    this.maxStudentsPerTeam = this.run.maxStudentsPerTeam + '';
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
    this.clearErrorMessages();
    const periodName = this.newPeriodName;
    if (periodName == null || periodName == '') {
      this.addPeriodMessage = this.i18n('Please enter a new period name.');
    } else {
      this.teacherService.addPeriodToRun(this.run.id, periodName).subscribe((response: any) => {
        if (response.status == 'success') {
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
        if (response.status == 'success') {
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
    if (maxStudentsPerTeam == 3) {
      maxStudentsPerTeamText = this.i18n('1-3');
    }
    if (confirm(this.i18n('Are you sure you want to change the students per team to {{value}}?', {value: maxStudentsPerTeamText}))) {
      this.teacherService.updateRunStudentsPerTeam(
          this.run.id, maxStudentsPerTeam).subscribe((response: any) => {
        if (response.status == 'success') {
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
        this.teacherService.updateRunStartTime(this.run.id, startDate).subscribe((response: any) => {
          if (response.status == 'success') {
            this.run = response.run;
            this.updateDataRun(this.run);
            this.rememberPreviousStartDate();
            this.clearErrorMessages();
            this.showConfirmMessage();
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

  rollbackMaxStudentsPerTeam() {
    this.maxStudentsPerTeam = this.run.maxStudentsPerTeam + '';
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
    this.maxStudentsPerTeamMessage = '';
    this.startDateMessage = '';
  }

  showConfirmMessage() {
    this.snackBar.open(this.i18n(`Unit settings updated.`));
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
    } else if (messageCode == 'noPermissionToChangeMaxStudentsPerTeam') {
      return this.noPermissionToChangeMaxStudentsPerTeam;
    } else if (messageCode = 'notAllowedToDecreaseMaxStudentsPerTeam') {
      return this.notAllowedToDecreaseMaxStudentsPerTeam;
    } else if (messageCode == 'noPermissionToChangeStartDate') {
      return this.noPermissionToChangeStartDate;
    }
  }

  updateDataRun(run) {
    this.data.run.periods = run.periods;
    this.data.run.maxStudentsPerTeam = run.maxStudentsPerTeam;
    this.data.run.startTime = run.startTime;
  }
}
