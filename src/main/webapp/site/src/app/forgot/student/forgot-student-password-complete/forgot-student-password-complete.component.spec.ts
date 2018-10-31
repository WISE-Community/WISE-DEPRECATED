import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentPasswordCompleteComponent } from './forgot-student-password-complete.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ForgotStudentPasswordCompeleteComponent', () => {
  let component: ForgotStudentPasswordCompleteComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotStudentPasswordCompleteComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the password successfully changed message', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain('Your password has been successfully changed');
  });

  it('should show the sign in button', () => {
    const signInButton = fixture.debugElement.nativeElement.querySelector('a');
    expect(signInButton.textContent).toContain('Sign In');
  });
});
