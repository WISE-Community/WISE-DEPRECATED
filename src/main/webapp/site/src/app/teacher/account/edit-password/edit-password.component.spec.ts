import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPasswordComponent } from './edit-password.component';
import { UserService } from "../../../services/user.service";
import { BehaviorSubject, Observable } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Provider, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { User } from "../../../domain/user";
import { translationsFactory } from '../../../app.module';
import { I18n } from '@ngx-translate/i18n-polyfill';

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.userName = 'DemoUser';
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }

  changePassword(userName, oldPassword, newPassword) {
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

describe('EditPasswordComponent', () => {
  let component: EditPasswordComponent;
  let fixture: ComponentFixture<EditPasswordComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  const getForm = () => {
    return fixture.debugElement.query(By.css('form'));
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPasswordComponent ],
      imports: [
        BrowserAnimationsModule, ReactiveFormsModule, MatSnackBarModule
      ],
      providers: [
        { provide: UserService, useValue: new MockUserService() },
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

    fixture = TestBed.createComponent(EditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button and invalidate form on initial state', () => {
    expect(component.changePasswordFormGroup.valid).toBeFalsy();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.changePasswordFormGroup.get('oldPassword').setValue('a');
    component.newPasswordFormGroup.get('newPassword').setValue('b');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('b');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
    expect(component.changePasswordFormGroup.valid).toBeTruthy();
  });

  it('should disable submit button and invalidate form when new password and confirm new password fields do not match', () => {
    component.changePasswordFormGroup.get('oldPassword').setValue('a');
    component.newPasswordFormGroup.get('newPassword').setValue('a');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('b');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
    expect(component.changePasswordFormGroup.valid).toBeFalsy();
  });

  it('should disable submit button and set incorrectPassword error when old password is incorrect', async () => {
    component.changePasswordFormGroup.get('oldPassword').setValue('b');
    component.newPasswordFormGroup.get('newPassword').setValue('c');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('c');
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
    expect(component.changePasswordFormGroup.get('oldPassword').getError('incorrectPassword')).toBe(true);
  });

  it('should disable submit button when form is successfully submitted', async () => {
    component.changePasswordFormGroup.get('oldPassword').setValue('a');
    component.newPasswordFormGroup.get('newPassword').setValue('b');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('b');
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });
});
