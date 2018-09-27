import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherRunListItemComponent } from './teacher-run-list-item.component';
import { Project} from "../../domain/project";
import { TeacherService } from "../teacher.service";
import { TeacherRun } from "../teacher-run";
import { ConfigService } from "../../services/config.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockTeacherService {

}

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
}

describe('TeacherRunListItemComponent', () => {
  let component: TeacherRunListItemComponent;
  let fixture: ComponentFixture<TeacherRunListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherRunListItemComponent ],
      imports: [],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListItemComponent);
    component = fixture.componentInstance;
    const run = new TeacherRun();
    run.id = 1;
    run.name = "Photosynthesis";
    run.startTime = 123;
    run.endTime = 150;
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
