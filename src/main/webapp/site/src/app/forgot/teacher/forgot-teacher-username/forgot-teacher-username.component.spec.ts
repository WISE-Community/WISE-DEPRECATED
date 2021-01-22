import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotTeacherUsernameComponent } from './forgot-teacher-username.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TeacherService } from '../../../teacher/teacher.service';
import { Observable } from 'rxjs/index';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

export class MockTeacherService {
  sendForgotUsernameEmail(email: string): Observable<any> {
    return Observable.create((observer) => {
      observer.next({
        status: 'success',
        messageCode: 'emailSent'
      });
      observer.complete();
    });
  }
}

describe('ForgotTeacherUsernameComponent', () => {
  let component: ForgotTeacherUsernameComponent;
  let fixture: ComponentFixture<ForgotTeacherUsernameComponent>;

  const submitAndReceiveResponse = (teacherServiceFunctionName, status, messageCode) => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = createObservableResponse(status, messageCode);
    spyOn(teacherService, teacherServiceFunctionName).and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
  };

  const createObservableResponse = (status, messageCode) => {
    const observableResponse = Observable.create((observer) => {
      const response = {
        status: status,
        messageCode: messageCode
      };
      observer.next(response);
      observer.complete();
    });
    return observableResponse;
  };

  const getErrorMessage = () => {
    const errorMessage = fixture.debugElement.nativeElement.querySelector('.warn');
    return errorMessage.textContent;
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotTeacherUsernameComponent],
      imports: [RouterTestingModule.withRoutes([]), ReactiveFormsModule],
      providers: [{ provide: TeacherService, useClass: MockTeacherService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a failed to send email message', () => {
    submitAndReceiveResponse('sendForgotUsernameEmail', 'failure', 'failedToSendEmail');
    expect(getErrorMessage()).toContain('The server has encountered an error');
  });

  it('should show an email not found message', () => {
    submitAndReceiveResponse('sendForgotUsernameEmail', 'failure', 'emailNotFound');
    expect(getErrorMessage()).toContain(
      'We did not find a WISE account associated with that email'
    );
  });

  it('should navigate to the success page', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create((observer) => {
      const response = {
        status: 'success',
        messageCode: 'emailSent'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'sendForgotUsernameEmail').and.returnValue(observableResponse);
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.setControlFieldValue('email', 'spongebob@bikinibottom.com');
    component.submit();
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/username/complete']);
  });
});
