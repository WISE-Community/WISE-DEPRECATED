import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Project } from "../project";
import { TeacherService } from "../teacher.service";
import { Run } from "../../domain/run";

@Component({
  selector: 'app-project-run-menu',
  templateUrl: './project-run-menu.component.html',
  styleUrls: ['./project-run-menu.component.scss']
})
export class ProjectRunMenuComponent implements OnInit {

  @Input()
  project: Project;

  editLink: string = '';
  previewLink: string = '';

  constructor(public dialog: MatDialog, public teacherService: TeacherService) { }

  ngOnInit() {
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
    this.previewLink = `/wise/previewproject.html?projectId=${ this.project.id }`;
  }

  showCreateRunDialog() {
    const dialogRef = this.dialog.open(CreateRunDialog, {
      data: { project: this.project }
    });

    dialogRef.afterClosed().subscribe(result => {
      scrollTo(0, 0);
    });
  }
}

@Component({
  selector: 'create-run-dialog',
  templateUrl: 'create-run-dialog.html',
})
export class CreateRunDialog {

  isFormValid: boolean;
  project: Project;
  periods: object;
  customPeriods: string;
  studentsPerTeam: number;
  startDate: any;

  constructor(public dialogRef: MatDialogRef<CreateRunDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any, private teacherService: TeacherService) {
    this.isFormValid = false;
    this.project = data.project;
    this.periods = {};
    for (let period of [1, 2, 3, 4, 5, 6, 7, 8]) {
      this.periods[period] = false;
    }
    this.customPeriods = "";
    this.studentsPerTeam = 3;
    this.startDate = new Date();
  }

  periodChanged() {
    const combinedPeriods = this.getPeriodsString(this.periods, this.customPeriods);
    if (combinedPeriods == "") {
      this.isFormValid = false;
    } else {
      this.isFormValid = true;
    }
  }

  create() {
    const combinedPeriods = this.getPeriodsString(this.periods, this.customPeriods);
    if (combinedPeriods == "") {
      alert("Error: You must select at least one period");
    } else {
      this.teacherService.createRun(
        this.project.id, combinedPeriods, this.studentsPerTeam, this.startDate.getTime())
        .subscribe((run: Run) => {
          const project = new Project();
          project.id = run.projectId;
          project.name = run.name;
          project.dateCreated = new Date().toString();
          project.run = run;
          this.teacherService.addNewProject(project);
          this.dialogRef.close();
      });
    }
  }

  getPeriodsString(periods, customPeriods) {
    let allPeriods = "";
    for (let period of [1, 2, 3, 4, 5, 6, 7, 8]) {
      if (this.periods[period]) {
        if (allPeriods != "") {
          allPeriods += ",";
        }
        allPeriods += period;
      }
    }
    if (customPeriods != "") {
      allPeriods += "," + customPeriods;
    }
    return allPeriods;
  }
}
