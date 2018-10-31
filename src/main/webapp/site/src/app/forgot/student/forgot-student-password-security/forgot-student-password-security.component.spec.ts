import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentPasswordSecurityComponent } from './forgot-student-password-security.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StudentService } from '../../../student/student.service';

export class MockStudentService {

}

describe('ForgotStudentPasswordSecurityComponent', () => {
  let component: ForgotStudentPasswordSecurityComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordSecurityComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotStudentPasswordSecurityComponent ],
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
    fixture = TestBed.createComponent(ForgotStudentPasswordSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button if the answer field is not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the answer field is filled in', () => {
    component.setControlFieldValue('answer', 'cookies');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });
});
