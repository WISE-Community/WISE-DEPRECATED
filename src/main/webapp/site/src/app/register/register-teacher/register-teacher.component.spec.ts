import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterTeacherComponent } from './register-teacher.component';
import { TeacherService } from '../../teacher/teacher.service';
import { AuthService } from 'angularx-social-login';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { Config } from '../../domain/config';
import { ConfigService } from '../../services/config.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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

export class MockAuthService {}

export class MockTeacherService {}

export class MockUserService {}

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterTeacherComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
