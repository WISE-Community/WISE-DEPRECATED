import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFaqComponent } from './student-faq.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Observable } from 'rxjs';
import { Config } from '../../domain/config';

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

describe('StudentFaqComponent', () => {
  let component: StudentFaqComponent;
  let fixture: ComponentFixture<StudentFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudentFaqComponent],
      providers: [{ provide: ConfigService, useClass: MockConfigService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
