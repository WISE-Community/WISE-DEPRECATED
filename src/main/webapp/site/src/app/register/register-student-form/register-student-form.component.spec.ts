import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterStudentFormComponent } from './register-student-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { StudentService } from '../../student/student.service';
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as helpers from '../register-user-form/register-user-form-spec-helpers';

let router: Router;
let component: RegisterStudentFormComponent;
let fixture: ComponentFixture<RegisterStudentFormComponent>;
let studentService: StudentService;
let snackBar: MatSnackBar;

export class MockStudentService {
  registerStudentAccount() {}

  retrieveSecurityQuestions() {
    return Observable.create((observer) => {
      observer.next([]);
      observer.complete();
    });
  }
}

export class MockUserService {}

describe('RegisterStudentFormComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterStudentFormComponent],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentFormComponent);
    studentService = TestBed.get(StudentService);
    router = TestBed.get(Router);
    snackBar = TestBed.get(MatSnackBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  createAccount();
});

function createAccount() {
  describe('createAccount()', () => {
    it('should create account with valid form fields', () => {
      component.createStudentAccountFormGroup.setValue(
        createAccountFormValue(
          'Patrick',
          'Star',
          'Male',
          '01',
          '01',
          'Who lives in a pineapple under the sea?',
          'Spongebob Squarepants',
          'a',
          'a'
        )
      );
      const username = 'PatrickS0101';
      const response: any = helpers.createAccountSuccessResponse(username);
      spyOn(studentService, 'registerStudentAccount').and.returnValue(of(response));
      const routerNavigateSpy = spyOn(router, 'navigate').and.callFake(
        (args: any[]): Promise<boolean> => {
          return of(true).toPromise();
        }
      );
      component.createAccount();
      expect(routerNavigateSpy).toHaveBeenCalledWith([
        'join/student/complete',
        { username: username, isUsingGoogleId: false }
      ]);
    });

    it('should show error when invalid first name is sent to server', () => {
      expectCreateAccountWithInvalidNameToShowError(
        'invalidFirstName',
        'Error: First Name must only contain characters A-Z'
      );
    });

    it('should show error when invalid last name is sent to server', () => {
      expectCreateAccountWithInvalidNameToShowError(
        'invalidLastName',
        'Error: Last Name must only contain characters A-Z'
      );
    });

    it('should show error when invalid first and last name is sent to server', () => {
      expectCreateAccountWithInvalidNameToShowError(
        'invalidFirstAndLastName',
        'Error: First Name and Last Name must only contain characters A-Z'
      );
    });
  });
}

function expectCreateAccountWithInvalidNameToShowError(errorCode: string, errorMessage: string) {
  component.createStudentAccountFormGroup.setValue(
    createAccountFormValue(
      'Patrick',
      'Star',
      'Male',
      '01',
      '01',
      'Who lives in a pineapple under the sea?',
      'Spongebob Squarepants',
      'a',
      'a'
    )
  );
  const response: any = helpers.createAccountErrorResponse(errorCode);
  spyOn(studentService, 'registerStudentAccount').and.returnValue(throwError(response));
  const snackBarSpy = spyOn(snackBar, 'open');
  component.createAccount();
  expect(snackBarSpy).toHaveBeenCalledWith(errorMessage);
}

function createAccountFormValue(
  firstName: string,
  lastName: string,
  gender: string,
  birthMonth: string,
  birthDay: string,
  securityQuestion: string,
  securityQuestionAnswer: string,
  password: string,
  confirmPassword: string
) {
  return {
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    birthMonth: birthMonth,
    birthDay: birthDay,
    securityQuestion: securityQuestion,
    securityQuestionAnswer: securityQuestionAnswer,
    passwords: {
      password: password,
      confirmPassword: confirmPassword
    }
  };
}
