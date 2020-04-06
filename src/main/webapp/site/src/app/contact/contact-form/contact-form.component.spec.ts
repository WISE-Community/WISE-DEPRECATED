import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from '@angular/core';
import { ContactFormComponent } from './contact-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule, MatSelectModule } from '@angular/material';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { UserService } from '../../services/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { StudentService } from '../../student/student.service';
import { User } from '../../domain/user';
import { BehaviorSubject } from 'rxjs';
import { translationsFactory } from '../../app.module';
import { configureTestSuite } from 'ng-bullet';
import { LibraryService } from '../../services/library.service';

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.username = 'DemoUser';
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }

  isSignedIn(): boolean {
    return true;
  }

  isStudent(): boolean {
    return false;
  }
}

export class MockConfigService {}

export class MockStudentService {}

export class MockLibraryService {}

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ContactFormComponent],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: ConfigService, useClass: MockConfigService },
        { provide: UserService, useClass: MockUserService },
        { provide: StudentService, useClass: MockStudentService },
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the email field if the user is not signed in', () => {
    const userService = TestBed.get(UserService);
    userService.isSignedIn = () => {
      return false;
    };
    userService.isStudent = () => {
      return false;
    };
    component.showEmailIfNecessary();
    const emailInput = fixture.debugElement.nativeElement.querySelector('input[name="email"]');
    expect(emailInput).not.toBeNull();
  });

  it('should show the email field if the user is signed in as a teacher', () => {
    const userService = TestBed.get(UserService);
    userService.isSignedIn = () => {
      return true;
    };
    userService.isStudent = () => {
      return false;
    };
    component.showEmailIfNecessary();
    const emailInput = fixture.debugElement.nativeElement.querySelector('input[name="email"]');
    expect(emailInput).not.toBeNull();
  });

  it('should not show the email field if the user is signed in as a student', () => {
    const userService = TestBed.get(UserService);
    userService.isSignedIn = () => {
      return true;
    };
    userService.isStudent = () => {
      return true;
    };
    component.showEmailIfNecessary();
    const emailInput = fixture.debugElement.nativeElement.querySelector('input[name="email"]');
    expect(emailInput).not.toBeNull();
  });

  it('should auto populate the name field if the user is signed in', () => {
    const nameInput = fixture.debugElement.nativeElement.querySelector('input[name="name"]');
    const name = nameInput.valueOf().value;
    expect(name).toBe('Demo User');
  });

  it("should have its submit button disabled if the form isn't filled out", () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button');
    expect(submitButton.disabled).toBe(true);
  });

  it('should have its submit button enabled if the form is filled out', () => {
    component.setControlFieldValue('name', 'Spongebob');
    component.setControlFieldValue('email', 'spongebob@bikinibottom.com');
    component.setControlFieldValue('issueType', 'OTHER');
    component.setControlFieldValue('summary', 'I have a problem');
    component.setControlFieldValue('description', 'My mouse is broken');
    fixture.detectChanges();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button');
    expect(submitButton.disabled).toBe(false);
  });
});
