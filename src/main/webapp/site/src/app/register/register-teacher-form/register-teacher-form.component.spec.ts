import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherFormComponent } from './register-teacher-form.component';
import { RegisterModule } from "../register.module";
import { RouterTestingModule } from "@angular/router/testing";
import { TeacherService } from "../../teacher/teacher.service";
import { Observable } from "rxjs";
import { StudentRun } from "../../student/student-run";
import { Project } from "../../teacher/project";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { User } from "../../domain/user";
import { UserService } from '../../services/user.service';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule, MatInputModule,
  MatSelectModule
} from "@angular/material";

describe('RegisterTeacherFormComponent', () => {
  let component: RegisterTeacherFormComponent;
  let fixture: ComponentFixture<RegisterTeacherFormComponent>;

  beforeEach(async(() => {
    const teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
          observer.complete();
        });
      }
    };
    const userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
        user.id = 123456;
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [ RegisterTeacherFormComponent ],
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
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
