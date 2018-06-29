import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherProjectListComponent } from './teacher-project-list.component';
import { TeacherService } from "../teacher.service";
import { StudentRun } from "../../student/student-run";
import { Observable } from "rxjs/Observable";
import { Project } from "../project";

describe('TeacherProjectListComponent', () => {
  let component: TeacherProjectListComponent;
  let fixture: ComponentFixture<TeacherProjectListComponent>;

  beforeEach(async(() => {
    let teacherServiceStub = {
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
      declarations: [ TeacherProjectListComponent ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
