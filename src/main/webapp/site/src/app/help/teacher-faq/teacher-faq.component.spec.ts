import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherFaqComponent } from './teacher-faq.component';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ConfigService } from "../../services/config.service";
import { Observable } from 'rxjs';
import { Config } from "../../domain/config";

export class MockConfigService {
  getConfig(): Observable<Config> {
    const config: Config = {
      contextPath: "/wise",
      logOutURL: "/logout",
      currentTime: "2018-10-24 15:05:40.214"
    };
    return Observable.create(observer => {
      observer.next(config);
      observer.complete();
    });
  }
}

describe('TeacherFaqComponent', () => {
  let component: TeacherFaqComponent;
  let fixture: ComponentFixture<TeacherFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherFaqComponent ],
      providers: [
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
