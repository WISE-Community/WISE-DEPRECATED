import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTeacherComponent } from './find-teacher.component';
import { Observable } from 'rxjs/internal/Observable';
import { MatDialog, MatTableModule} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { UserService } from '../../services/user.service';
import { LOCALE_ID, NO_ERRORS_SCHEMA, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { Teacher } from '../../domain/teacher';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { translationsFactory } from '../../app.module';

export class MockAdminService {
  searchTeachers(): Observable<Teacher []> {
    const teachers: Teacher[] = [];
    return Observable.create(observer => {
      observer.next(teachers);
      observer.complete();
    });
  }
}

export class MockUserService {
  isAdmin(): boolean {
    return false;
  }
}

describe('FindTeacherComponent', () => {
  let component: FindTeacherComponent;
  let fixture: ComponentFixture<FindTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindTeacherComponent ],
      imports: [ MatTableModule, ReactiveFormsModule ],
      providers: [
        { provide: AdminService, useClass: MockAdminService },
        { provide: UserService, useClass: MockUserService },
        { provide: MatDialog, useValue: { open: () => {} }},
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
    fixture = TestBed.createComponent(FindTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
