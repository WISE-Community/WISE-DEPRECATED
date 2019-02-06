import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndRunDialogComponent } from './end-run-dialog.component';
import { TeacherService } from "../teacher.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from "../../../../../../../../node_modules/@angular/material/dialog";
import { Observable } from "rxjs";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Run } from '../../domain/run';
import { StudentService } from "../../student/student.service";

class MockTeacherService {
  endRun() {
  }
}

describe('RestartRunDialogComponent', () => {
  let component: EndRunDialogComponent;
  let fixture: ComponentFixture<EndRunDialogComponent>;
  const run: Run = new Run();
  run.id = 1;
  run.name = "Photosynthesis"
  run.startTime = '2018-11-10 00:00:00.0';

  const submitAndReceiveResponse = (teacherServiceFunctionName, status, messageCode, run: Run) => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = createObservableResponse(status, messageCode, run);
    spyOn(teacherService, teacherServiceFunctionName).and.returnValue(observableResponse);
    const submitButton = getSubmitButton();
    submitButton.click();
    fixture.detectChanges();
  };

  const createObservableResponse = (status, messageCode, run: Run) => {
    const observableResponse = Observable.create(observer => {
      const response = {
        status: status,
        messageCode: messageCode,
        run: run
      };
      observer.next(response);
      observer.complete();
    });
    return observableResponse;
  };

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndRunDialogComponent ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: MatDialog, useValue: {
            closeAll: () => {}
          }},
        {
          provide: MatDialogRef, useValue: {
            afterClosed: () => {
              return Observable.create(observer => {
                observer.next({});
                observer.complete();
              });
            },
            close: () => {

            }
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: { run: run } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndRunDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
    expect(compiled.textContent).not.toContain('The unit has been successfully ended.');
  });

  it('should show error message', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).not.toContain('The run has been successfully ended.');
    submitAndReceiveResponse('endRun', 'error', "noPermissionToEndRun", run);
    expect(compiled.textContent).toContain('There was an error ending this unit. Please try again later.');
  });

  it('should successfully end the run', () => {
    const run: Run = new Run();
    run.id = 1;
    run.name = "Photosynthesis"
    run.endTime = new Date('2018-11-19 00:00:00.0').getMilliseconds();
    submitAndReceiveResponse('endRun', 'success', null, run);
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('The unit has been successfully ended.');
  });
});
