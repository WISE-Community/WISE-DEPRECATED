import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSignInDialogComponent } from './team-sign-in-dialog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Config } from '../../domain/config';
import { AuthService } from 'angularx-social-login';
import { User } from '../../domain/user';
import { StudentService } from '../student.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.username = 'DemoUser';
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }
}

export class MockStudentService {
  launchRun(
    runId: string,
    workgroupId: string,
    presentUserIds: number[],
    absentUserIds: number[]
  ): Observable<any> {
    return Observable.create((observer) => {
      observer.next({
        status: 'success',
        messageCode: 'passwordChanged'
      });
      observer.complete();
    });
  }
}

export class MockAuthService {}

export class MockConfigService {
  getConfig(): Observable<Config> {
    const config: Config = {
      contextPath: '/wise',
      logOutURL: '/logout',
      currentTime: new Date('2018-10-17T00:00:00.0').getTime()
    };
    return Observable.create((observer) => {
      observer.next(config);
      observer.complete();
    });
  }
}

describe('TeamSignInDialogComponent', () => {
  let component: TeamSignInDialogComponent;
  let fixture: ComponentFixture<TeamSignInDialogComponent>;

  const runObj = {
    id: 1,
    name: 'Test',
    workgroupMembers: [
      {
        id: 123,
        firstName: 'Spongebob',
        lastName: 'Squarepants',
        username: 'SpongebobS0123'
      },
      {
        id: 154,
        firstName: 'Patrick',
        lastName: 'Starr',
        username: 'PatrickS0619'
      }
    ]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamSignInDialogComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: MAT_DIALOG_DATA, useValue: { run: runObj } },
        { provide: MatDialogRef, useValue: {} },
        { provide: UserService, useClass: MockUserService },
        { provide: StudentService, useClass: MockStudentService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSignInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
