import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginHomeComponent } from './login-home.component';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../domain/config';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecaptchaModule } from 'ng-recaptcha';

export class MockUserService {
  isSignedIn(): boolean {
    return false;
  }
}

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
  getRecaptchaPublicKey(): string {
    return '';
  }
}

describe('LoginHomeComponent', () => {
  let component: LoginHomeComponent;
  let fixture: ComponentFixture<LoginHomeComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginHomeComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, RecaptchaModule],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
