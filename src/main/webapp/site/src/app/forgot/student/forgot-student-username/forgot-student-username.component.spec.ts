import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotStudentUsernameComponent } from './forgot-student-username.component';
import { StudentService } from '../../../student/student.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

export class MockStudentService {}

describe('ForgotStudentUsernameComponent', () => {
  let component: ForgotStudentUsernameComponent;
  let fixture: ComponentFixture<ForgotStudentUsernameComponent>;

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotStudentUsernameComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [{ provide: StudentService, useClass: MockStudentService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

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
    component.showSearchResults = true;
    fixture.detectChanges();
    const message = fixture.debugElement.nativeElement.querySelector('.warn');
    expect(message.textContent).toContain('We did not find any usernames');
  });

  it('should show the found a username message', () => {
    component.foundUsernames = ['SpongebobSquarepants'];
    component.setMessageForFoundUsernames();
    component.showSearchResults = true;
    fixture.detectChanges();
    const message = fixture.debugElement.nativeElement.querySelector('.info');
    expect(message.textContent).toContain('We found a username');
  });

  it('should show the found multiple usernames message', () => {
    component.foundUsernames = ['SpongebobSquarepants', 'PatrickStar'];
    component.setMessageForFoundUsernames();
    component.showSearchResults = true;
    fixture.detectChanges();
    const message = fixture.debugElement.nativeElement.querySelector('.info');
    expect(message.textContent).toContain('We found multiple usernames');
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
    component.showSearchResults = true;
    fixture.detectChanges();
    const usernameLink = fixture.debugElement.nativeElement.querySelector('a');
    usernameLink.click();
    const params = { username: 'SpongebobS0101' };
    expect(navigateSpy).toHaveBeenCalledWith(['/login', params]);
  });
});
