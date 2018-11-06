import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentPasswordComponent } from './forgot-student-password.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {StudentService} from '../../../student/student.service';
import {Router} from '@angular/router';

export class MockStudentService {

}

describe('ForgotStudentPasswordComponent', () => {
  let component: ForgotStudentPasswordComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotStudentPasswordComponent ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: StudentService, useClass: MockStudentService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button when the username field is not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the search button when the username field is filled in', () => {
    component.setControlFieldValue('username', 'SpongebobS0101');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });

  it('should navigate to the answer security question page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    const questionKey = 'QUESTION_ONE';
    const question = 'What is your favorite snack?';
    component.goToQuestionPage(username, questionKey, question);
    const params = {
      username: username,
      questionKey: questionKey,
      question: question
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/student/password/security'],
      {queryParams: params, skipLocationChange: true});
  });
});
