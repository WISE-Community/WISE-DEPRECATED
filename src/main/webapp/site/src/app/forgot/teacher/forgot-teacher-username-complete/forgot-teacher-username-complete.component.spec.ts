import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherUsernameCompleteComponent } from './forgot-teacher-username-complete.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';

describe('ForgotTeacherUsernameCompleteComponent', () => {
  let component: ForgotTeacherUsernameCompleteComponent;
  let fixture: ComponentFixture<ForgotTeacherUsernameCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherUsernameCompleteComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherUsernameCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the confirmation message', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain('Your username has been sent to your email');
  });

  it('should navigate to the sign in page when the sign in button is clicked', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const signInButton = fixture.debugElement.nativeElement.querySelector('a');
    signInButton.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
