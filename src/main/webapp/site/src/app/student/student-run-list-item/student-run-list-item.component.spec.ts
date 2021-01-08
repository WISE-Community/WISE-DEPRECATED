import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentRun } from '../student-run';
import { StudentRunListItemComponent } from './student-run-list-item.component';
import { Observable } from 'rxjs';
import { Config } from '../../domain/config';
import { ConfigService } from '../../services/config.service';
import { MomentModule } from 'ngx-moment';
import { Project } from '../../domain/project';
import { User } from '../../domain/user';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StudentService } from '../student.service';
import { UserService } from '../../services/user.service';
import { configureTestSuite } from 'ng-bullet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export class MockConfigService {
  getConfig(): Observable<Config> {
    const config: Config = {
      contextPath: 'vle',
      logOutURL: '/logout',
      currentTime: new Date('2018-10-17T00:00:00.0').getTime()
    };
    return Observable.create((observer) => {
      observer.next(config);
      observer.complete();
    });
  }
  getContextPath(): string {
    return '/wise';
  }
  getCurrentServerTime(): number {
    return new Date('2018-10-17T00:00:00.0').getTime();
  }
}

export class MockStudentService {}

export class MockUserService {}

describe('StudentRunListItemComponent', () => {
  let component: StudentRunListItemComponent;
  let fixture: ComponentFixture<StudentRunListItemComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [MomentModule, BrowserAnimationsModule, MatDialogModule],
      declarations: [StudentRunListItemComponent],
      providers: [
        { provide: ConfigService, useClass: MockConfigService },
        { provide: StudentService, useClass: MockStudentService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentRunListItemComponent);
    component = fixture.componentInstance;
    const run: StudentRun = new StudentRun();
    run.id = 1;
    run.name = 'Photosynthesis';
    const owner = new User();
    owner.displayName = 'Mr. Happy';
    run.owner = owner;
    run.projectThumb = 'Happy.png';
    run.startTime = new Date('2018-10-17T00:00:00.0').getTime();
    const project: Project = new Project();
    project.id = 1;
    project.name = 'Test Project';
    run.project = project;
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      console.log(e);
    }
  });

  it('should say a run is active', () => {
    expect(component.isRunActive(component.run)).toBeTruthy();
  });

  it('should say a run is not active yet', () => {
    component.run.startTime = new Date('2100-10-17T00:00:00.0').getTime();
    component.ngOnInit();
    expect(component.isRunActive(component.run)).toBeFalsy();
  });
});
