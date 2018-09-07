import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRunListItemComponent } from './teacher-run-list-item.component';
import { Project } from "../project";
import { TeacherService } from "../teacher.service";
import { TeacherRun } from "../teacher-run";
import { MatCardModule, MatIconModule } from "@angular/material";
import { MomentModule } from "ngx-moment";
import { Component, Input } from "@angular/core";

@Component({ selector: 'app-run-menu', template: '' })
export class RunMenuStubComponent {

  @Input()
  run: TeacherRun;
}

describe('TeacherProjectListItemComponent', () => {
  let component: TeacherRunListItemComponent;
  let fixture: ComponentFixture<TeacherRunListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherRunListItemComponent, RunMenuStubComponent ],
      imports: [ MatCardModule, MatIconModule, MomentModule ],
      providers: [ { provide: TeacherService }]
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
