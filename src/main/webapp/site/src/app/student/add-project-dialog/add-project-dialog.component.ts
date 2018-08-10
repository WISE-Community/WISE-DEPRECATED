import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { StudentService } from "../student.service";

@Component({
  selector: 'app-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.scss']
})
export class AddProjectDialogComponent implements OnInit {

  isFormValid: boolean;
  validRunCode: boolean = false;
  registerRunRunCode: string = '';
  registerRunPeriods: string[] = [];
  selectedPeriod: string = '';

  constructor(public dialogRef: MatDialogRef<AddProjectDialogComponent>,
      private studentService: StudentService) {
    this.isFormValid = false;
  }

  ngOnInit() {
  }

  addRun() {
    this.studentService.addRun(this.registerRunRunCode, this.selectedPeriod).subscribe((studentRun) => {
      if (studentRun.error) {
        alert(studentRun.error);
      } else {
        this.studentService.addNewProject(studentRun);
        this.endAddRun();
        this.dialogRef.close();
      }
    });
  }

  endAddRun() {
    this.clearPeriods();
    this.dialogRef.close();
  }

  cancelAddRun() {
    this.endAddRun();
  }

  clearPeriods() {
    this.selectedPeriod = '';
    this.registerRunPeriods = [];
  }

  checkRunCode(event: KeyboardEvent) {
    const runCode = (<HTMLInputElement>event.target).value;
    this.registerRunRunCode = runCode;
    if (this.isValidRunCodeSyntax(runCode)) {
      this.studentService.getRunInfo(runCode).subscribe(runInfo => {
        if (runInfo.error) {
          this.validRunCode = false;
          this.clearPeriods();
        } else {
          this.validRunCode = true;
          this.registerRunPeriods = runInfo.periods;
        }
      });
    } else {
      this.validRunCode = false;
      this.clearPeriods();
    }
  }

  isValidRunCodeSyntax(runCode: string) {
    return /^[a-zA-Z]*\d\d\d/.test(runCode);
  }
}
