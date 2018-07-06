import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from "../project";
import { TeacherModule } from "../teacher.module";
import { ProjectRunMenuComponent } from "./project-run-menu.component";

describe('ProjectRunMenuComponent', () => {
  let component: ProjectRunMenuComponent;
  let fixture: ComponentFixture<ProjectRunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TeacherModule ],
      declarations: [ ]
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
