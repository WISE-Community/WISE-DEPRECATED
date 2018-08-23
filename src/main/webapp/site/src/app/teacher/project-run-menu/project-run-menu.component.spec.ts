import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from "../project";
import { TeacherModule } from "../teacher.module";
import { Observable } from "rxjs";
import { ProjectRunMenuComponent } from "./project-run-menu.component";
import { TeacherService } from "../teacher.service";

describe('ProjectRunMenuComponent', () => {
  let component: ProjectRunMenuComponent;
  let fixture: ComponentFixture<ProjectRunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TeacherModule ],
      declarations: [ ],
      providers: [ {provide: TeacherService }]
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
