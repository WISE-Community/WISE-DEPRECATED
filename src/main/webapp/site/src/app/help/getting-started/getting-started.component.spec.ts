import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GettingStartedComponent } from './getting-started.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Config } from '../../domain/config';
import { Observable } from 'rxjs';

export class MockConfigService {
  getConfig(): Observable<Config> {
    const config: Config = {
      contextPath: '/wise',
      logOutURL: '/logout',
      currentTime: new Date('2018-10-24T15:05:40.214').getTime()
    };
    return Observable.create((observer) => {
      observer.next(config);
      observer.complete();
    });
  }
}

describe('GettingStartedComponent', () => {
  let component: GettingStartedComponent;
  let fixture: ComponentFixture<GettingStartedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GettingStartedComponent],
      providers: [{ provide: ConfigService, useClass: MockConfigService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GettingStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
