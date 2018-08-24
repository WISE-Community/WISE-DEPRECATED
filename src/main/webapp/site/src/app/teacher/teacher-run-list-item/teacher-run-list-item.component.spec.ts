import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRunListItemComponent } from './teacher-run-list-item.component';
import { TeacherModule } from "../teacher.module";
import { Observable } from "rxjs";
import { Project } from "../project";
import { TeacherService } from "../teacher.service";
import { Run } from "../../domain/run";

describe('TeacherProjectListItemComponent', () => {
  let component: TeacherRunListItemComponent;
  let fixture: ComponentFixture<TeacherRunListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ TeacherModule ],
      providers: [ { provide: TeacherService }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListItemComponent);
    component = fixture.componentInstance;
    const run = new Run();
    run.id = 1;
    run.name = "Photosynthesis";
    run.startTime = 123;
    run.endTime = 150;
    run.numStudents = 30;
    const project = new Project();
    project.id = 1;
    project.name = "Photosynthesis";
    project.thumbIconPath = "";
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
