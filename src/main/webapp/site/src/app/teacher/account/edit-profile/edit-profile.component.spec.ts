import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileComponent } from './edit-profile.component';
import { UserService } from '../../../services/user.service';
import { Teacher } from '../../../domain/teacher';
import { Observable, BehaviorSubject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TeacherService } from '../../teacher.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { User } from '../../../domain/user';
import { configureTestSuite } from 'ng-bullet';
import { MatDialogModule } from '@angular/material/dialog';

export class MockUserService {
  user: User;

  getUser(): BehaviorSubject<Teacher> {
    const user: Teacher = new Teacher();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.username = 'DemoTeacher';
    user.id = 123456;
    user.displayName = 'Demo Teacher';
    user.email = 'test@test.com';
    user.city = 'Berkeley';
    user.state = 'CA';
    user.country = 'USA';
    user.schoolLevel = 'High School';
    user.schoolName = 'Berkeley High';
    user.language = 'English';
    this.user = user;
    const userBehaviorSubject: BehaviorSubject<Teacher> = new BehaviorSubject<Teacher>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }
  getLanguages() {
    return Observable.create((observer) => {
      observer.next([]);
      observer.complete();
    });
  }

  updateTeacherUser(displayName, email, city, state, country, schoolName, schoolLevel, language) {
    const user: Teacher = <Teacher>this.getUser().getValue();
    user.displayName = displayName;
    user.email = email;
    user.city = city;
    user.state = state;
    user.country = country;
    user.schoolName = schoolName;
    user.schoolLevel = schoolLevel;
    user.language = language;
  }
}

export class MockTeacherService {
  updateProfile() {
    return Observable.create((observer) => {
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

  const submitForm = () => {
    const form = getForm();
    form.triggerEventHandler('submit', null);
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [EditProfileComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

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

  it('should disable submit button when form is submitted', async () => {
    const submitButton = getSubmitButton();
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);
  });

  it('should update the user', async () => {
    component.editProfileFormGroup.get('language').setValue('Spanish');
    submitForm();
    fixture.detectChanges();
    const testBedUserService = TestBed.get(UserService);
    expect(testBedUserService.user.language).toBe('Spanish');
  });
});
