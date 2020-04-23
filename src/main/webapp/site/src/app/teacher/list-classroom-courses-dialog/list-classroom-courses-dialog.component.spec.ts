import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListClassroomCoursesDialogComponent } from './list-classroom-courses-dialog.component';
import { TeacherService } from '../teacher.service';
import { UserService } from '../../services/user.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../../domain/user';
import { Observable } from 'rxjs/internal/Observable';
import { NO_ERRORS_SCHEMA, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { translationsFactory } from "../../app.module";
import { I18n } from '@ngx-translate/i18n-polyfill';

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
      imports: [
        ReactiveFormsModule,
        MatCheckboxModule
      ],
      declarations: [ ListClassroomCoursesDialogComponent ],
      providers: [
        { provide: MatDialog },
        { provide: MatDialogRef, useValue: { close: () => {} }},
        { provide: MAT_DIALOG_DATA, useValue: {
          run: {
            id: 1,
            name: 'Test',
            accessCode: 'Test123'
          },
          courses: [{ id: '1', name: 'Test' }]
        }},
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
        ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
