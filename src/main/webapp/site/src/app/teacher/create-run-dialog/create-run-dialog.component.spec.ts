import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherService } from '../teacher.service';
import { CreateRunDialogComponent } from './create-run-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule, MatRadioModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Project } from '../../domain/project';
import { Run } from '../../domain/run';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Course } from '../../domain/course';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../../domain/user';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { configureTestSuite } from 'ng-bullet';

export class MockTeacherService {
  createRun() {
    return Observable.create(observer => {
      const run: Run = new Run();
      run.runCode = 'Dog1234';
      run.name = 'Photosynthesis';
      observer.next(run);
      observer.complete();
    });
  }

  addNewRun() {}

  setTabIndex() {}

  checkClassroomAuthorization(): Observable<string> {
    return Observable.create('');
  }

  getClassroomCourses(): Observable<Course[]> {
    const courses: Course[] = [];
    const course = new Course({ id: '1', name: 'Test' });
    courses.push(course);
    return Observable.create(observer => {
      observer.next(courses);
      observer.complete();
    });
  }
}

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.username = 'test';
    return Observable.create(observer => {
      observer.next(user);
      observer.complete();
    });
  }

  isGoogleUser() {
    return false;
  }
}

export class MockConfigService {
  isGoogleClassroomEnabled(): boolean {
    return false;
  }
}

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;
  const project: Project = new Project();
  project.id = 1;
  project.metadata = {
    title: 'Photosynthesis'
  };
  project.projectThumb = 'photo.png';

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  const getForm = () => {
    return fixture.debugElement.query(By.css('form'));
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatRadioModule, MatCheckboxModule],
      declarations: [CreateRunDialogComponent],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService },
        {
          provide: MatDialog,
          useValue: {
            closeAll: () => {}
          }
        },
        {
          provide: MatDialogRef,
          useValue: {
            afterClosed: () => {
              return Observable.create(observer => {
                observer.next({});
                observer.complete();
              });
            },
            close: () => {}
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: { project: project } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRunDialogComponent);
    component = fixture.componentInstance;
    component.project = project;
    component.dialog = TestBed.get(MatDialog);
    spyOn(component.dialog, 'closeAll').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show project info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
  });

  it('should get periods string', () => {
    component.periodsGroup.controls[0].get('checkbox').setValue(true);
    component.periodsGroup.controls[2].get('checkbox').setValue(true);
    component.periodsGroup.controls[4].get('checkbox').setValue(true);
    component.customPeriods.setValue('hello');
    expect(component.getPeriodsString()).toEqual('1,3,5,hello');
  });

  it('should disable submit button and invalidate form on initial state (when no period is selected)', () => {
    const submitButton = getSubmitButton();
    expect(component.form.valid).toBeFalsy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should validate form when period is selected or custom period is entered', () => {
    component.periodsGroup.controls[0].get('checkbox').setValue(true);
    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
    component.periodsGroup.controls[0].get('checkbox').setValue(false);
    component.customPeriods.setValue('Section A, Section B');
    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    const submitButton = getSubmitButton();
    component.periodsGroup.controls[0].get('checkbox').setValue(true);
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should show the confirmation message when form is successfully submitted', async () => {
    component.periodsGroup.controls[0].get('checkbox').setValue(true);
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Dog1234');
    expect(compiled.textContent).toContain('Photosynthesis');
  });
});
