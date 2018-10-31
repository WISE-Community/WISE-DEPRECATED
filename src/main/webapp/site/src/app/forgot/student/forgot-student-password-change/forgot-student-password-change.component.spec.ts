import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentPasswordChangeComponent } from './forgot-student-password-change.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StudentService } from '../../../student/student.service';

export class MockStudentService {

}

describe('ForgotStudentPasswordChangeComponent', () => {
  let component: ForgotStudentPasswordChangeComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordChangeComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotStudentPasswordChangeComponent ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: StudentService, userClass: MockStudentService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button when the password fields are not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the password fields are filled in', () => {
    component.setControlFieldValue('password', 'newpassword');
    component.setControlFieldValue('confirmPassword', 'newpassword');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });
});
