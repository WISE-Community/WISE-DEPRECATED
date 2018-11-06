import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotStudentUsernameComponent } from './forgot-student-username.component';
import { StudentService } from '../../../student/student.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatInputModule, MatSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {Router} from '@angular/router';

export class MockStudentService {

}

describe('ForgotStudentUsernameComponent', () => {
  let component: ForgotStudentUsernameComponent;
  let fixture: ComponentFixture<ForgotStudentUsernameComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotStudentUsernameComponent ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: StudentService, useClass: MockStudentService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the no usernames found message', () => {
    component.foundUsernames = [];
    component.setMessageForFoundUsernames();
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toContain('We did not find any usernames');
  });

  it('should show the found a username message', () => {
    component.foundUsernames = ['SpongebobSquarepants'];
    component.setMessageForFoundUsernames();
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toContain('We have found a username');
  });

  it('should show the found multiple usernames message', () => {
    component.foundUsernames = ['SpongebobSquarepants', 'PatrickStar'];
    component.setMessageForFoundUsernames();
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toContain('We have found multiple usernames');
  });

  it('should disable the search button when the fields are not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the search button when all the input fields are filled in', () => {
    component.setControlFieldValue('firstName', 'Spongebob');
    component.setControlFieldValue('lastName', 'Squarepants');
    component.setControlFieldValue('birthMonth', '1');
    component.setControlFieldValue('birthDay', '01');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });

  it('should navigate to the login page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    component.loginWithUsername(username);
    const params = { username: username };
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });

  it('should navigate to the login page when a username is clicked', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.foundUsernames = ['SpongebobS0101'];
    fixture.detectChanges();
    const usernameLink = fixture.debugElement.nativeElement.querySelector('.cursor-link');
    usernameLink.click();
    const params = { username: 'SpongebobS0101' };
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });

  it('should navigate to the register page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.createNewAccount();
    expect(navigateSpy).toHaveBeenCalledWith(['/join']);
  });

  it('should navigate to the register page when the create new account link is clicked', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.showCreateNewAccountLink = true;
    fixture.detectChanges();
    const createNewAccountLink = fixture.debugElement.nativeElement.querySelector('.cursor-link');
    createNewAccountLink.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/join']);
  });
});
