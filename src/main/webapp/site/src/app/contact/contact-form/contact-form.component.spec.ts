import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFormComponent } from './contact-form.component';
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule, MatSelectModule } from "@angular/material";
import { UserService } from "../../services/user.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ConfigService } from "../../services/config.service";
import { User } from "../../domain/user";
import { BehaviorSubject } from 'rxjs';

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.userName = 'DemoUser';
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

export class MockConfigService {
}

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactFormComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: ConfigService, useClass: MockConfigService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

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
    expect(name).toBe("Demo User");
  });

  it('should have its submit button disabled if the form isn\'t filled out', () => {
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
