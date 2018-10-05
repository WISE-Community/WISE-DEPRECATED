import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileComponent } from './edit-profile.component';
import { UserService } from "../../../services/user.service";
import { Teacher } from "../../../domain/teacher";
import { Observable, BehaviorSubject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule, MatSelectModule,
  MatSnackBarModule } from '@angular/material';
import { TeacherService } from "../../teacher.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { By } from '@angular/platform-browser';

export class MockUserService {
  getUser(): BehaviorSubject<Teacher> {
    const user: Teacher = new Teacher();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.userName = 'DemoTeacher';
    user.id = 123456;
    user.displayName = 'Demo Teacher';
    user.email = 'test@test.com';
    user.city = 'Berkeley';
    user.state = 'CA';
    user.country = 'USA';
    user.schoolLevel = 'High School';
    user.schoolName = 'Berkeley High';
    user.language = 'English';
    const userBehaviorSubject: BehaviorSubject<Teacher> = new BehaviorSubject<Teacher>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }
  getLanguages() {
    return Observable.create( observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

export class MockTeacherService {
  updateProfile() {
    return Observable.create(observer => {
      observer.next({});
      observer.complete();
    });
  }
}

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  const getForm = () => {
    return fixture.debugElement.query(By.css('form'));
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate user info into form controls', () => {
    expect(component.editProfileFormGroup.get('firstName').value).toEqual('Demo');
    expect(component.editProfileFormGroup.get('lastName').value).toEqual('Teacher');
  });

  it('should disable submit button and validate form on initial state', () => {
    const submitButton = getSubmitButton();
    expect(component.editProfileFormGroup.valid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is changed', () => {
    const submitButton = getSubmitButton();
    component.editProfileFormGroup.get('city').setValue('Albany');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should disable submit button when form is submitted', async() => {
    const submitButton = getSubmitButton();
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);
  });
});
