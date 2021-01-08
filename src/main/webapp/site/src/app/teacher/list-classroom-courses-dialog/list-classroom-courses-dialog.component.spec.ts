import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListClassroomCoursesDialogComponent } from './list-classroom-courses-dialog.component';
import { TeacherService } from '../teacher.service';
import { UserService } from '../../services/user.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../../domain/user';
import { Observable } from 'rxjs/internal/Observable';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

export class MockTeacherService {
  addToClassroom: (accessCode: string, unitTitle: number, courseId: number) => {};
}

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.username = 'test';
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
}

describe('ListClassroomCoursesDialogComponent', () => {
  let component: ListClassroomCoursesDialogComponent;
  let fixture: ComponentFixture<ListClassroomCoursesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatCheckboxModule, OverlayModule, MatDialogModule],
      declarations: [ListClassroomCoursesDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            run: {
              id: 1,
              name: 'Test',
              accessCode: 'Test123'
            },
            courses: [{ id: '1', name: 'Test' }]
          }
        },
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListClassroomCoursesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
