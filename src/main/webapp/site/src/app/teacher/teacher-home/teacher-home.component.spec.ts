import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { TeacherHomeComponent } from './teacher-home.component';
import { UserService } from "../../services/user.service";
import { TeacherService } from "../../teacher/teacher.service";
import { StudentRun } from "../../student/student-run";
import { User } from "../../domain/user";

describe('TeacherHomeComponent', () => {
  let component: TeacherHomeComponent;
  let fixture: ComponentFixture<TeacherHomeComponent>;

  beforeEach(async(() => {
    let teacherServiceStub = {
      isLoggedIn: true,
      getRuns(): Observable<StudentRun[]> {
        let runs : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(runs);
          observer.complete();
        });
      }
    };

    let userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'User';
        user.role = 'student';
        user.userName = 'DemoUser0101';
        user.id = 123456;
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [ TeacherHomeComponent ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
