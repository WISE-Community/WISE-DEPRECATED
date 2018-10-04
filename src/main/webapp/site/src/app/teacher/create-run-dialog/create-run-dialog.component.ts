import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Project } from "../../domain/project";
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";

@Component({
  selector: 'create-run-dialog',
  templateUrl: './create-run-dialog.component.html',
  styleUrls: ['./create-run-dialog.component.scss']

})
export class CreateRunDialogComponent {

  form: FormGroup;
  project: Project;
  periodsGroup: FormArray;
  customPeriods: FormControl;
  studentsPerTeam: number;
  startDate: any;
  periodOptions: string[] = [];
  isCreating: boolean = false;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<CreateRunDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              private fb: FormBuilder) {
    this.project = data.project;
    this.studentsPerTeam = 3;
    this.startDate = new Date();
  }

  ngOnInit() {
    this.setPeriodOptions();
    let hiddenControl = new FormControl('', Validators.required);
    this.periodsGroup = new FormArray(this.periodOptions.map(period => new FormGroup({
      name: new FormControl(period),
      checkbox: new FormControl(false)
    })));
    this.periodsGroup.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.getPeriodsString());
    });
    this.customPeriods = new FormControl('');
    this.customPeriods.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.getPeriodsString());
    });
    this.form = this.fb.group({
      selectedPeriods: this.periodsGroup,
      customPeriods: this.customPeriods,
      periods: hiddenControl,
      studentsPerTeam: new FormControl('3', Validators.required),
      startDate: new FormControl(new Date(), Validators.required)
    });
  }

  setPeriodOptions() {
    for (let i = 1; i < 9; i++) {
      this.periodOptions.push(i.toString());
    }
  }

  mapPeriods(items: any[]): string[] {
    const selectedPeriods = items.filter((item) => item.checkbox).map((item) => item.name);
    return selectedPeriods.length ? selectedPeriods : [];
  }

  create() {
    this.isCreating = true;
    const combinedPeriods = this.getPeriodsString();
    const startDate = this.form.controls['startDate'].value.getTime();
    const studentsPerTeam = this.form.controls['studentsPerTeam'].value;
    this.teacherService.createRun(
        this.project.id, combinedPeriods, studentsPerTeam, startDate)
        .subscribe((newRun: Run) => {
          const run = new Run(newRun);
          this.teacherService.addNewRun(run);
          this.teacherService.setTabIndex(0);
          this.dialog.closeAll();
        });
  }

  getPeriodsString(): string {
    const periods = this.mapPeriods(this.periodsGroup.value);
    const customPeriods = this.customPeriods.value.split(',');
    for (let i = 0; i < customPeriods.length; i++) {
      customPeriods[i] = customPeriods[i].trim();
    }
    if (periods.length > 0) {
      return periods.toString() + ',' + customPeriods.toString();
    } else {
      return customPeriods.toString();
    }
  }
}
