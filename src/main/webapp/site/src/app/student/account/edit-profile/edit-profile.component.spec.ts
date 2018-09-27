import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileComponent } from './edit-profile.component';
import { User } from "../../../domain/user";
import { Observable, BehaviorSubject } from 'rxjs';
import { UserService } from "../../../services/user.service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule, MatInputModule } from '@angular/material';
import { StudentService } from "../../student.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockStudentService {

}

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.userName = 'DemoTeacher';
    user.id = 123456;
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }
  getLanguages() {
    return Observable.create( observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
