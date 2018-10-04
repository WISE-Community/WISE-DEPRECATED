import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPasswordComponent } from './edit-password.component';
import { UserService } from "../../../services/user.service";
import { BehaviorSubject, Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Teacher } from "../../../domain/teacher";

export class MockUserService {
  getUser(): BehaviorSubject<Teacher> {
    const user: Teacher = new Teacher();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.userName = 'DemoTeacher';
    const userBehaviorSubject: BehaviorSubject<Teacher> = new BehaviorSubject<Teacher>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }

  changePassword() {
    return Observable.create(observer => {
      observer.next({});
      observer.complete();
    });
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
        ReactiveFormsModule
      ],
      providers: [
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button and invalidate form on initial state', () => {
    const submitButton = getSubmitButton();
    expect(component.changePasswordFormGroup.valid).toBeFalsy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    const submitButton = getSubmitButton();
    component.changePasswordFormGroup.get('oldPassword').setValue('a');
    component.newPasswordFormGroup.get('newPassword').setValue('a');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('a');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
    expect(component.changePasswordFormGroup.valid).toBeTruthy();
  });

  it('should disable submit button and invalidate form when new password and confirm new password fields do not match', () => {
    const submitButton = getSubmitButton();
    component.changePasswordFormGroup.get('oldPassword').setValue('a');
    component.newPasswordFormGroup.get('newPassword').setValue('a');
    component.newPasswordFormGroup.get('confirmNewPassword').setValue('b');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);
    expect(component.changePasswordFormGroup.valid).toBeFalsy();
  });

  it('should disable submit button when form is submitted', async() => {
    const submitButton = getSubmitButton();
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);
  });
});
