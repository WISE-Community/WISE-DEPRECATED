import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { TeacherService } from '../teacher.service';
import { User } from '../../domain/user';
import { Project } from '../../domain/project';
import { TeacherHomeComponent } from './teacher-home.component';
import { Run } from '../../domain/run';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../domain/config';
import { LibraryService } from '../../services/library.service';
import { RouterTestingModule } from '@angular/router/testing';

export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export class MockTeacherService {
  getRuns(): Observable<Run[]> {
    const runs: Run[] = [];
    const run1 = new Run();
    run1.id = 1;
    run1.name = 'Photosynthesis';
    run1.numStudents = 12;
    const project1 = new Project();
    project1.id = 1;
    project1.name = 'Photosynthesis';
    project1.projectThumb = '';
    run1.project = project1;
    const run2 = new Run();
    run2.id = 2;
    run2.name = 'Plate Tectonics';
    run2.numStudents = 21;
    const project2 = new Project();
    project2.id = 1;
    project2.name = 'Photosynthesis';
    project2.projectThumb = '';
    run2.project = project2;
    runs.push(run1);
    runs.push(run2);
    return Observable.create((observer) => {
      observer.next(runs);
      observer.complete();
    });
  }
  setTabIndex(index: number) {
    fakeAsyncResponse(index);
  }
  newRunSource$ = fakeAsyncResponse([
    {
      id: 3,
      name: 'Global Climate Change',
      periods: ['1', '2']
    }
  ]);
  tabIndexSource$ = fakeAsyncResponse(0);
}

export class MockUserService {
  getUser(): Observable<User[]> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.username = 'DemoTeacher';
    user.id = 123456;
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
}

export class MockConfigService {
  getConfig(): Observable<Config> {
    return Observable.create((observer) => {
      const config: Config = {
        contextPath: '/wise',
        logOutURL: '/logout',
        currentTime: new Date('2018-10-17T00:00:00.0').getTime()
      };
      observer.next(config);
      observer.complete();
    });
  }

  getContextPath(): string {
    return '/wise';
  }

  getCurrentServerTime(): number {
    return new Date('2018-10-17 00:00:00.0').getTime();
  }

  getDiscourseURL(): string {
    return 'http://localhost:9292';
  }
}

export class MockLibraryService {
  clearAll(): void {}
}

describe('TeacherHomeComponent', () => {
  let component: TeacherHomeComponent;
  let fixture: ComponentFixture<TeacherHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherHomeComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: LibraryService, useClass: MockLibraryService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isDiscourseEnabled).toBeTruthy();
  });
});
