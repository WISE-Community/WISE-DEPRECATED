import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPasswordComponent } from './edit-password.component';
import { UserService } from "../../../services/user.service";
import { Observable } from '../../../../../../../../../node_modules/rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatCardModule, MatInputModule } from '@angular/material';
import { User } from "../../../domain/user";
import { BehaviorSubject } from "rxjs";

describe('EditPasswordComponent', () => {
  let component: EditPasswordComponent;
  let fixture: ComponentFixture<EditPasswordComponent>;

  beforeEach(async(() => {
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
        return Observable.create([]);
      }
    };
    TestBed.configureTestingModule({
      declarations: [ EditPasswordComponent ],
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
        { provide: UserService, useValue: userServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
