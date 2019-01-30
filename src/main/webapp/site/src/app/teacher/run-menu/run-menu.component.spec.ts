import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RunMenuComponent } from "./run-menu.component";
import { TeacherService } from "../teacher.service";
import { Project } from "../../domain/project";
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialog, MatMenuModule } from "@angular/material";
import { ConfigService } from "../../services/config.service";
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { TeacherRun } from "../teacher-run";
import { NO_ERRORS_SCHEMA, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from '@angular/core';
import { translationsFactory } from '../../app.module';
import { I18n } from '@ngx-translate/i18n-polyfill';

export class MockTeacherService {

}

export class MockUserService {
  getUser(): BehaviorSubject<User> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'Teacher';
    user.role = 'teacher';
    user.userName = 'DemoTeacher';
    user.id = 123456;
    return Observable.create(observer => {
      observer.next(user);
      observer.complete();
    });
  }
  getUserId() {
    return 123456;
  }
}

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
}

describe('RunMenuComponent', () => {
  let component: RunMenuComponent;
  let fixture: ComponentFixture<RunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatMenuModule ],
      declarations: [ RunMenuComponent ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: MatDialog, useValue: {} },
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunMenuComponent);
    component = fixture.componentInstance;
    const run: TeacherRun = new TeacherRun();
    run.id = 1;
    run.name = "Photosynthesis";
    const owner = new User();
    owner.id = 1;
    run.owner = owner;
    const project = new Project();
    project.id = 1;
    project.owner = owner;
    project.sharedOwners = [];
    run.project = project;
    run.sharedOwners = [];
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
