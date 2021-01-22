import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StudentService } from '../student.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.scss']
})
export class AddProjectDialogComponent implements OnInit {
  validRunCodeSyntaxRegEx: any = /^[a-zA-Z]*\d\d\d$/;
  registerRunRunCode: string = '';
  registerRunPeriods: string[] = [];
  selectedPeriod: string = '';
  accessCode: string = null;
  runCodeFormControl = new FormControl('', [runCodeValidator(this.validRunCodeSyntaxRegEx)]);
  addProjectForm: FormGroup = new FormGroup({
    runCode: this.runCodeFormControl,
    period: new FormControl({ value: '', disabled: true }, Validators.required)
  });
  isAdding = false;

  constructor(
    public dialog: MatDialog,
    private studentService: StudentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['accessCode'] != null) {
        this.accessCode = params['accessCode'];
        this.addProjectForm.controls['runCode'].setValue(params['accessCode']);
        this.checkRunCode();
      }
    });
  }

  submit() {
    this.isAdding = true;
    this.studentService
      .addRun(this.registerRunRunCode, this.selectedPeriod)
      .subscribe((studentRun) => {
        if (studentRun.status === 'error') {
          if (studentRun.messageCode === 'alreadyAddedRun') {
            this.addProjectForm.controls['runCode'].setErrors({ alreadyAddedRun: true });
          } else if (studentRun.messageCode === 'runHasEnded') {
            this.addProjectForm.controls['runCode'].setErrors({ runHasEnded: true });
          } else if (studentRun.messageCode === 'runCodeNotFound') {
            this.addProjectForm.controls['runCode'].setErrors({ invalidRunCode: true });
          }
          this.isAdding = false;
        } else {
          this.studentService.addNewProject(studentRun);
          this.dialog.closeAll();
          this.isAdding = false;
        }
      });
  }

  clearPeriods() {
    this.selectedPeriod = '';
    this.registerRunPeriods = [];
    this.addProjectForm.controls['period'].disable();
  }

  checkRunCode() {
    const runCode = this.addProjectForm.controls['runCode'].value;
    this.registerRunRunCode = runCode;
    if (this.isValidRunCodeSyntax(runCode)) {
      this.studentService.getRunInfo(runCode).subscribe((runInfo) => {
        this.handleRunCodeResponse(runInfo);
      });
    } else {
      this.clearPeriods();
    }
  }

  handleRunCodeResponse(runInfo) {
    if (runInfo.error) {
      this.clearPeriods();
      this.setInvalidRunCode();
    } else {
      if (runInfo.wiseVersion === 4) {
        this.setInvalidRunCode();
      } else {
        this.registerRunPeriods = runInfo.periods;
        this.addProjectForm.controls['period'].enable();
      }
    }
  }

  setInvalidRunCode() {
    this.addProjectForm.controls['runCode'].setErrors({ invalidRunCode: true });
  }

  isValidRunCodeSyntax(runCode: string) {
    return this.validRunCodeSyntaxRegEx.test(runCode);
  }
}

export function runCodeValidator(validRunCodeSyntaxRegEx: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = validRunCodeSyntaxRegEx.test(control.value);
    return valid ? null : { invalidRunCodeSyntax: true };
  };
}
