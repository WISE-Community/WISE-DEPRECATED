import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileComponent } from './edit-profile.component';
import { Run } from "../../../domain/run";
import { User } from "../../../domain/user";
import { Project } from "../../../teacher/project";
import { fakeAsyncResponse } from "../../../teacher/teacher-home/teacher-home.component.spec";
import { Observable, BehaviorSubject } from '../../../../../../../../../node_modules/rxjs';
import { UserService } from "../../../services/user.service";
import { BrowserAnimationsModule } from '../../../../../../../../../node_modules/@angular/platform-browser/animations';
import { ReactiveFormsModule } from '../../../../../../../../../node_modules/@angular/forms';
import { MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatCardModule, MatInputModule } from '../../../../../../../../../node_modules/@angular/material';
import { RouterTestingModule } from '../../../../../../../../../node_modules/@angular/router/testing';
import { StudentService } from "../../student.service";

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(async(() => {
    let studentServiceStub = {
    };
    const userServiceStub = {
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
      },
      getLanguages() {
        return Observable.create( observer => {
          observer.next([]);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatCardModule,
        MatInputModule
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ]
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
