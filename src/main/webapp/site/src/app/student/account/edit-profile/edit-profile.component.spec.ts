import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileComponent } from './edit-profile.component';
import { User } from '../../../domain/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { StudentService } from '../../student.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Student } from '../../../domain/student';
import { configureTestSuite } from 'ng-bullet';
import { MatDialogModule } from '@angular/material/dialog';

export class MockUserService {
  user: User;

  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.role = 'student';
    user.username = 'du0101';
    user.id = 123456;
    user.language = 'English';
    this.user = user;
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }

  getLanguages() {
    return Observable.create((observer) => {
      observer.next([]);
      observer.complete();
    });
  }

  updateStudentUser(language) {
    const user = <Student>this.getUser().getValue();
    user.language = language;
  }
}

export class MockStudentService {
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
        { provide: StudentService, useClass: MockStudentService },
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
    expect(component.editProfileFormGroup.get('lastName').value).toEqual('User');
  });

  it('should disable submit button and validate form on initial state', () => {
    const submitButton = getSubmitButton();
    expect(component.editProfileFormGroup.valid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is changed', () => {
    const submitButton = getSubmitButton();
    component.editProfileFormGroup.get('language').setValue('Spanish');
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
