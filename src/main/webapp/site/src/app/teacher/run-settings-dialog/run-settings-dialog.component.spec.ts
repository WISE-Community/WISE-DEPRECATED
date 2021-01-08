import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RunSettingsDialogComponent } from './run-settings-dialog.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Run } from '../../domain/run';
import { TeacherService } from '../teacher.service';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { MomentModule } from 'ngx-moment';
import { configureTestSuite } from 'ng-bullet';

export class MockTeacherService {
  addPeriodToRun(runId, periodName) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
  deletePeriodFromRun(runId, periodName) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
  changeMaxStudentsPerTeam(runId, maxStudentsPerTeam) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
  updateStartTime(runId, maxStudentsPerTeam) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
  updateEndTime(runId, maxStudentsPerTeam) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
  updateIsLockedAfterEndDate(runId, isLockedAfterEndDate) {
    return Observable.create((observer) => {
      const response: any = {};
      observer.next(response);
      observer.complete();
    });
  }
}

describe('RunSettingsDialogComponent', () => {
  let component: RunSettingsDialogComponent;
  let fixture: ComponentFixture<RunSettingsDialogComponent>;

  const getStartDateInput = () => {
    return fixture.debugElement.nativeElement.querySelectorAll('input')[1];
  };

  const getEndDateInput = () => {
    return fixture.debugElement.nativeElement.querySelectorAll('input')[2];
  };

  function createNewRun() {
    return new Run({
      id: 1,
      name: 'Test Project',
      periods: ['1', '2', '3'],
      maxStudentsPerTeam: 1,
      startTime: new Date('2018-10-17T00:00:00.0').getTime(),
      endTime: new Date('2018-10-19T23:59:00.0').getTime()
    });
  }

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [RunSettingsDialogComponent],
      imports: [MatSnackBarModule, MomentModule],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { run: createNewRun() } },
        { provide: TeacherService, useClass: MockTeacherService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RunSettingsDialogComponent);
    component = fixture.componentInstance;
    component.run = createNewRun();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the periods', () => {
    const periodContainers = fixture.debugElement.nativeElement.querySelectorAll('.info-block');
    expect(periodContainers.length).toBe(3);
  });

  it('should populate the correct number of students per team', () => {
    const radioGroup = fixture.debugElement.nativeElement.querySelector('mat-radio-group');
    expect(radioGroup.ngModel).toBe('1');
  });

  it('should populate the correct start date', () => {
    const startDateInput = getStartDateInput();
    expect(startDateInput.ngModel.getDate()).toBe(17);
    expect(startDateInput.ngModel.getMonth()).toBe(9);
    expect(startDateInput.ngModel.getUTCFullYear()).toBe(2018);
  });

  it('should populate the correct end date', () => {
    const endDateInput = getEndDateInput();
    expect(endDateInput.ngModel.getDate()).toBe(19);
    expect(endDateInput.ngModel.getMonth()).toBe(9);
    expect(endDateInput.ngModel.getUTCFullYear()).toBe(2018);
  });

  it('should add a period', () => {
    component.run.periods.push('4');
    fixture.detectChanges();
    const periodContainers = fixture.debugElement.nativeElement.querySelectorAll('.info-block');
    expect(periodContainers.length).toBe(4);
  });

  it('should delete a period', () => {
    component.run.periods.splice(2, 1);
    fixture.detectChanges();
    const periodContainers = fixture.debugElement.nativeElement.querySelectorAll('.info-block');
    expect(periodContainers.length).toBe(2);
  });

  it('should change the students per team', () => {
    component.maxStudentsPerTeam = '3';
    const radioGroup = fixture.debugElement.nativeElement.querySelector('mat-radio-group');
    fixture.detectChanges();
    expect(radioGroup.ngModel).toBe('3');
  });

  it('should change the start date', () => {
    component.startDate = new Date('2019-11-18T00:00:00.0');
    fixture.detectChanges();
    const startDateInput = getStartDateInput();
    expect(startDateInput.ngModel.getDate()).toBe(18);
    expect(startDateInput.ngModel.getMonth()).toBe(10);
    expect(startDateInput.ngModel.getUTCFullYear()).toBe(2019);
  });

  it('should change the end date', () => {
    component.endDate = new Date('2019-11-20T23:59:00.0');
    fixture.detectChanges();
    const endDateInput = getEndDateInput();
    expect(endDateInput.ngModel.getDate()).toBe(20);
    expect(endDateInput.ngModel.getMonth()).toBe(10);
    expect(endDateInput.ngModel.getUTCFullYear()).toBe(2019);
  });

  it('should update is locked after end date false', () => {
    component.isLockedAfterEndDate = false;
    const teacherService = TestBed.get(TeacherService);
    spyOn(teacherService, 'updateIsLockedAfterEndDate').and.returnValue(of({}));
    component.updateIsLockedAfterEndDate();
    expect(teacherService.updateIsLockedAfterEndDate).toHaveBeenCalledWith(1, false);
  });

  it('should update is locked after end date true', () => {
    component.isLockedAfterEndDate = true;
    const teacherService = TestBed.get(TeacherService);
    spyOn(teacherService, 'updateIsLockedAfterEndDate').and.returnValue(of({}));
    component.updateIsLockedAfterEndDate();
    expect(teacherService.updateIsLockedAfterEndDate).toHaveBeenCalledWith(1, true);
  });

  it('should enable is locked after end date checkbox', () => {
    component.endDate = new Date();
    component.isLockedAfterEndDateCheckboxEnabled = false;
    const teacherService = TestBed.get(TeacherService);
    spyOn(teacherService, 'updateIsLockedAfterEndDate').and.returnValue(of({}));
    component.updateLockedAfterEndDateCheckbox();
    expect(component.isLockedAfterEndDateCheckboxEnabled).toEqual(true);
  });

  it('should disable is locked after end date checkbox', () => {
    component.endDate = null;
    component.isLockedAfterEndDateCheckboxEnabled = true;
    const teacherService = TestBed.get(TeacherService);
    spyOn(teacherService, 'updateIsLockedAfterEndDate').and.returnValue(of({}));
    component.updateLockedAfterEndDateCheckbox();
    expect(component.isLockedAfterEndDateCheckboxEnabled).toEqual(false);
  });

  it('should translate message code', () => {
    const message = component.translateMessageCode('periodNameAlreadyExists');
    expect(message).toEqual('There is already a period with that name.');
  });
});
