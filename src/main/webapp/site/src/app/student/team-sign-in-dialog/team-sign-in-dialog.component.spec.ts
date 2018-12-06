import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSignInDialogComponent } from './team-sign-in-dialog.component';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { UserService } from "../../services/user.service";
import { ConfigService } from "../../services/config.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Config } from "../../domain/config";
import { AuthService } from "angularx-social-login";
import { MatDialog } from "@angular/material";
import { MAT_DIALOG_DATA } from "../../../../../../../../node_modules/@angular/material/dialog";
import { User } from "../../domain/user";

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.userName = 'DemoUser';
    const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    userBehaviorSubject.next(user);
    return userBehaviorSubject;
  }
}

export class MockAuthService {

}

export class MockConfigService {
  getConfig(): Observable<Config> {
    const config: Config = {
      contextPath: "/wise",
      logOutURL: "/logout",
      currentTime: "2018-10-17 00:00:00.0"
    };
    return Observable.create(observer => {
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
    name: "Test",
    workgroupMembers: [
      {
        "id": 123,
        "firstName": "Spongebob",
        "lastName": "Squarepants",
        "userName": "SpongebobS0123"
      },
      {
        "id": 154,
        "firstName": "Patrick",
        "lastName": "Starr",
        "userName": "PatrickS0619"
      }
    ]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSignInDialogComponent ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: MAT_DIALOG_DATA, useValue: { run: runObj } },
        { provide: UserService, useClass: MockUserService }
        ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
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
