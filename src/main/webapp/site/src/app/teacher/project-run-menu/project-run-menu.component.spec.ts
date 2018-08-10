import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from "../project";
import { TeacherModule } from "../teacher.module";
import { Observable } from "rxjs/Observable";
import { ProjectRunMenuComponent } from "./project-run-menu.component";
import { TeacherService } from "../teacher.service";

describe('ProjectRunMenuComponent', () => {
  let component: ProjectRunMenuComponent;
  let fixture: ComponentFixture<ProjectRunMenuComponent>;

  beforeEach(async(() => {
    const teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      imports: [ TeacherModule ],
      declarations: [ ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
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
