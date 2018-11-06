import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentPasswordCompleteComponent } from './forgot-student-password-complete.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import {Router} from '@angular/router';

describe('ForgotStudentPasswordCompleteComponent', () => {
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

  it('should navigate to the login page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    component.username = username;
    component.goToLoginPage();
    const params = { username: username };
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });
});
