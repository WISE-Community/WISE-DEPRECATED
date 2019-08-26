import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActionsComponent } from './admin-actions.component';
import { Student } from '../../domain/student';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBarModule, MatTableModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { LOCALE_ID, NO_ERRORS_SCHEMA, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { Observable} from 'rxjs/internal/Observable';
import { UserService } from '../../services/user.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { translationsFactory } from '../../app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

export class MockUserService {
  changePassword(username, oldPassword, newPassword) {
    if (oldPassword === 'a') {
      return Observable.create(observer => {
        observer.next({ message: 'success' });
        observer.complete();
      });
    } else {
      return Observable.create(observer => {
        observer.next({ message: 'incorrect password' });
        observer.complete();
      });
    }
  }
}

export class MockAdminService {
  changeUserPassword(username, oldPassword, newPassword): any {
    return { 'message': 'success' };
  }
}

describe('AdminActionsComponent', () => {
  let component: AdminActionsComponent;
  let fixture: ComponentFixture<AdminActionsComponent>;
  const runs = [{ runId: 1, name: 'test', startTime: 123, teacherUsername: 'test', teacherEmail: 'test' }];
  const student = new Student({ id: 1, firstName: 'a', lastName: 'a', username: 'aa01', runs });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminActionsComponent ],
      imports: [ ReactiveFormsModule, MatTableModule, MatSnackBarModule, HttpClientTestingModule ],
      providers: [
        { provide: MatDialog, useValue: { }},
        { provide: MatDialogRef, useValue: { }},
        { provide: UserService, useClass: MockUserService },
        { provide: MAT_DIALOG_DATA, useValue: { user: student, action: 'changePassword' }},
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas:  [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
