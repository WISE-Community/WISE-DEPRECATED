import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Project } from "../project";
import { TeacherModule } from "../teacher.module";
import { Observable } from "rxjs/Observable";
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "./create-run-dialog.component";

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;

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
    fixture = TestBed.createComponent(CreateRunDialogComponent);
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
