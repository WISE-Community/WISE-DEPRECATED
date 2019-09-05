import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherRunListItemComponent } from './teacher-run-list-item.component';
import { Project} from "../../domain/project";
import { TeacherService } from "../teacher.service";
import { TeacherRun } from "../teacher-run";
import { ConfigService } from "../../services/config.service";
import { NO_ERRORS_SCHEMA, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from "@angular/core";
import { I18n } from '@ngx-translate/i18n-polyfill';
import { translationsFactory } from "../../app.module";
import { MomentModule } from "ngx-moment";
import { configureTestSuite } from 'ng-bullet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export class MockTeacherService {

}

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
  getCurrentServerTime(): number {
    return new Date('2018-08-24T00:00:00.0').getTime();
  }
}

describe('TeacherRunListItemComponent', () => {
  let component: TeacherRunListItemComponent;
  let fixture: ComponentFixture<TeacherRunListItemComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherRunListItemComponent ],
      imports: [ MomentModule, BrowserAnimationsModule ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListItemComponent);
    component = fixture.componentInstance;
    const run = new TeacherRun();
    run.id = 1;
    run.name = "Photosynthesis";
    run.startTime = new Date('2018-10-17T00:00:00.0').getTime();
    run.endTime = new Date('2018-10-18T23:59:59.0').getTime();
    run.numStudents = 30;
    run.periods = ['1', '2'];
    const project = new Project();
    project.id = 1;
    project.name = "Photosynthesis";
    project.projectThumb = "";
    run.project = project;
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
  });
});
