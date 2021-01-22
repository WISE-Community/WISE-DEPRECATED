import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotStudentPasswordCompleteComponent } from './forgot-student-password-complete.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

describe('ForgotStudentPasswordCompleteComponent', () => {
  let component: ForgotStudentPasswordCompleteComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordCompleteComponent>;

  const getSignInButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button');
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotStudentPasswordCompleteComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the password successfully changed message', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain(
      'Your password has been successfully changed'
    );
  });

  it('should show the sign in button', () => {
    const signInButton = getSignInButton();
    expect(signInButton.textContent).toContain('Sign In');
  });

  it('should navigate to the login page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    component.username = username;
    const params = { username: username };
    const signInButton = getSignInButton();
    signInButton.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });
});
