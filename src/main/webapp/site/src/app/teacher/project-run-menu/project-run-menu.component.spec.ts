import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRunMenuComponent } from './project-run-menu.component';
import { MatIconModule, MatMenuModule } from "@angular/material";
import { Project } from "../project";

describe('ProjectRunMenuComponent', () => {
  let component: ProjectRunMenuComponent;
  let fixture: ComponentFixture<ProjectRunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatIconModule, MatMenuModule ],
      declarations: [ ProjectRunMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRunMenuComponent);
    component = fixture.componentInstance;
    const project: Project = new Project();
    project.id = 1;
    project.name = "Photosynthesis";
    project.thumbIconPath = "photo.png";
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
