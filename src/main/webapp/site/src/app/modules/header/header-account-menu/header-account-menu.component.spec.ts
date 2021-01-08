import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderAccountMenuComponent } from './header-account-menu.component';
import { User } from '../../../domain/user';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigService } from '../../../services/config.service';
import { Observable } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Config } from '../../../domain/config';

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

describe('HeaderAccountMenuComponent', () => {
  let component: HeaderAccountMenuComponent;
  let fixture: ComponentFixture<HeaderAccountMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderAccountMenuComponent],
      imports: [HttpClientTestingModule, MatMenuModule],
      providers: [{ provide: ConfigService, useClass: MockConfigService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderAccountMenuComponent);
    component = fixture.componentInstance;
    const user: User = new User();
    user.id = 1;
    user.firstName = 'Amanda';
    user.lastName = 'Panda';
    user.role = 'student';
    user.username = 'AmandaP0101';
    component.user = user;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
