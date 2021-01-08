import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { LibraryProjectMenuComponent } from './library-project-menu.component';
import { TeacherService } from '../../../teacher/teacher.service';
import { Project } from '../../../domain/project';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../../services/user.service';
import { User } from '../../../domain/user';
import { Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../../services/config.service';

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
  getUserId(): number {
    return 123456;
  }
}

export class MockTeacherService {
  getProjectUsage(projectId: number): Observable<number> {
    return Observable.create((observer) => {
      observer.next(projectId);
      observer.complete();
    });
  }
}

export class MockConfigService {
  getContextPath(): string {
    return '';
  }
}

describe('LibraryProjectMenuComponent', () => {
  let component: LibraryProjectMenuComponent;
  let fixture: ComponentFixture<LibraryProjectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule, MatDialogModule],
      declarations: [LibraryProjectMenuComponent],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectMenuComponent);
    component = fixture.componentInstance;
    const project: Project = new Project();
    project.id = 1;
    project.name = 'Photosynthesis';
    const user = new User();
    user.id = 123456;
    user.username = 'Spongebob Squarepants';
    user.displayName = 'Spongebob Squarepants';
    project.owner = user;
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
