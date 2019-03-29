import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListClassroomCoursesDialogComponent } from './list-classroom-courses-dialog.component';
import { TeacherService } from '../teacher.service';
import { UserService } from '../../services/user.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../../domain/user';
import { Observable } from 'rxjs/internal/Observable';

export class MockTeacherService {
  addToClassroom: (accessCode: string, unitTitle: number, courseId: number) => {};
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
}

describe('ListClassroomCoursesDialogComponent', () => {
  let component: ListClassroomCoursesDialogComponent;
  let fixture: ComponentFixture<ListClassroomCoursesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListClassroomCoursesDialogComponent ],
      providers: [
        { provide: MatDialog },
        { provide: MatDialogRef, useValue: { close: () => {} }},
        { provide: MAT_DIALOG_DATA, useValue: { accessCode: 'test', unitTitle: 'test', courses: [{ id: '1', name: 'test' }] }},
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService }
        ]
    })
    .compileComponents();
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
