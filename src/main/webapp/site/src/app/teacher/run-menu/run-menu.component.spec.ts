import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RunMenuComponent } from './run-menu.component';
import { TeacherService } from '../teacher.service';
import { Project } from '../../domain/project';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigService } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { User } from '../../domain/user';
import { TeacherRun } from '../teacher-run';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Course } from '../../domain/course';
import { RouterTestingModule } from '@angular/router/testing';

export class MockTeacherService {
  checkClassroomAuthorization(): Observable<string> {
    return Observable.create('');
  }
  getClassroomCourses(): Observable<Course[]> {
    const courses: Course[] = [];
    const course = new Course({ id: '1', name: 'Test' });
    courses.push(course);
    return Observable.create((observer) => {
      observer.next(courses);
      observer.complete();
    });
  }
}

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.username = 'DemoTeacher';
    user.id = 123456;
    user.isGoogleUser = false;
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
  getUserId() {
    return 123456;
  }
  isGoogleUser() {
    return false;
  }
}

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
}

describe('RunMenuComponent', () => {
  let component: RunMenuComponent;
  let fixture: ComponentFixture<RunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, RouterTestingModule],
      declarations: [RunMenuComponent],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: MatDialog, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunMenuComponent);
    component = fixture.componentInstance;
    const run: TeacherRun = new TeacherRun();
    run.id = 1;
    run.name = 'Photosynthesis';
    const owner = new User();
    owner.id = 1;
    run.owner = owner;
    const project = new Project();
    project.id = 1;
    project.owner = owner;
    project.sharedOwners = [];
    run.project = project;
    run.sharedOwners = [];
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
