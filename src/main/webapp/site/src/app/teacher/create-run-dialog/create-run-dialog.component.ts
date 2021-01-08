import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Project } from '../../domain/project';
import { Run } from '../../domain/run';
import { TeacherService } from '../teacher.service';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { ListClassroomCoursesDialogComponent } from '../list-classroom-courses-dialog/list-classroom-courses-dialog.component';

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
  maxStudentsPerTeam: number;
  maxStartDate: Date;
  minEndDate: Date;
  endDateControl: FormControl;
  periodOptions: string[] = [];
  isCreating: boolean = false;
  isCreated: boolean = false;
  run: Run = null;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateRunDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teacherService: TeacherService,
    private userService: UserService,
    private configService: ConfigService,
    private fb: FormBuilder
  ) {
    this.project = data.project;
    this.maxStudentsPerTeam = 3;
  }

  ngOnInit() {
    this.setPeriodOptions();
    let hiddenControl = new FormControl('', Validators.required);
    this.periodsGroup = new FormArray(
      this.periodOptions.map(
        (period) =>
          new FormGroup({
            name: new FormControl(period),
            checkbox: new FormControl(false)
          })
      )
    );
    this.periodsGroup.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.getPeriodsString());
    });
    this.customPeriods = new FormControl('');
    this.customPeriods.valueChanges.subscribe((v) => {
      hiddenControl.setValue(this.getPeriodsString());
    });
    this.endDateControl = new FormControl();
    this.endDateControl.valueChanges.subscribe((v) => {
      this.updateLockedAfterEndDateCheckbox();
    });
    this.form = this.fb.group({
      selectedPeriods: this.periodsGroup,
      customPeriods: this.customPeriods,
      periods: hiddenControl,
      maxStudentsPerTeam: new FormControl('3', Validators.required),
      startDate: new FormControl(new Date(), Validators.required),
      endDate: this.endDateControl,
      isLockedAfterEndDate: new FormControl({ value: false, disabled: true })
    });
    this.setDateRange();
  }

  isGoogleUser() {
    return this.userService.isGoogleUser();
  }

  isGoogleClassroomEnabled() {
    return this.configService.isGoogleClassroomEnabled();
  }

  setPeriodOptions() {
    for (let i = 1; i < 9; i++) {
      this.periodOptions.push(i.toString());
    }
  }

  get selectedPeriodsControl() {
    return <FormArray>this.form.get('selectedPeriods');
  }

  mapPeriods(items: any[]): string[] {
    const selectedPeriods = items.filter((item) => item.checkbox).map((item) => item.name);
    return selectedPeriods.length ? selectedPeriods : [];
  }

  create() {
    this.isCreating = true;
    const combinedPeriods = this.getPeriodsString();
    const startDate = this.form.controls['startDate'].value.getTime();
    let endDateValue = this.form.controls['endDate'].value;
    let endDate = null;
    if (endDateValue) {
      endDateValue.setHours(23, 59, 59);
      endDate = endDateValue.getTime();
    }
    const isLockedAfterEndDate = this.form.controls['isLockedAfterEndDate'].value;
    const maxStudentsPerTeam = this.form.controls['maxStudentsPerTeam'].value;
    this.teacherService
      .createRun(
        this.project.id,
        combinedPeriods,
        maxStudentsPerTeam,
        startDate,
        endDate,
        isLockedAfterEndDate
      )
      .pipe(
        finalize(() => {
          this.isCreating = false;
        })
      )
      .subscribe((newRun: Run) => {
        this.run = new Run(newRun);
        this.dialogRef.afterClosed().subscribe((result) => {
          this.teacherService.addNewRun(this.run);
        });
        this.isCreated = true;
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

  setDateRange() {
    this.minEndDate = this.form.controls['startDate'].value;
    this.maxStartDate = this.form.controls['endDate'].value;
  }

  closeAll() {
    this.dialog.closeAll();
  }

  checkClassroomAuthorization() {
    this.teacherService
      .getClassroomAuthorizationUrl(this.userService.getUser().getValue().username)
      .subscribe(({ authorizationUrl }) => {
        if (authorizationUrl == null) {
          this.getClassroomCourses();
        } else {
          const authWindow = window.open(authorizationUrl, 'authorize', 'width=600,height=800');
          const timer = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(timer);
              this.checkClassroomAuthorization();
            }
          }, 1000);
        }
      });
  }

  getClassroomCourses() {
    this.teacherService
      .getClassroomCourses(this.userService.getUser().getValue().username)
      .subscribe((courses) => {
        this.dialog.open(ListClassroomCoursesDialogComponent, {
          data: { run: this.run, courses },
          panelClass: 'mat-dialog-md'
        });
      });
  }

  updateLockedAfterEndDateCheckbox() {
    if (this.endDateControl.value == null) {
      this.form.controls['isLockedAfterEndDate'].setValue(false);
      this.form.controls['isLockedAfterEndDate'].disable();
    } else {
      this.form.controls['isLockedAfterEndDate'].enable();
    }
  }
}
