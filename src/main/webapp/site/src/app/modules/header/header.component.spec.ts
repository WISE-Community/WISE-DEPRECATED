import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Component, Input } from '@angular/core';
import { User } from '../../domain/user';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Config } from '../../domain/config';
import { UtilService } from '../../services/util.service';

export class MockUserService {
  getUser(): Observable<User> {
    return Observable.create((observer) => {
      const user: User = new User();
      observer.next(user);
      observer.complete();
    });
  }
}

export class MockUtilService {
  showMainMenu() {}
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
}

@Component({ selector: 'app-header-account-menu', template: '' })
class HeaderAccountMenuStubComponent {
  @Input()
  user: User;
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: UtilService, useClass: MockUtilService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
