import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotTeacherPasswordCompleteComponent } from './forgot-teacher-password-complete.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

describe('ForgotTeacherPasswordCompleteComponent', () => {
  let component: ForgotTeacherPasswordCompleteComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordCompleteComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotTeacherPasswordCompleteComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go go the sign in page when the sign in button is clicked', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobSquarepants';
    component.username = username;
    component.goToLoginPage();
    const params = {
      username: username
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });
});
