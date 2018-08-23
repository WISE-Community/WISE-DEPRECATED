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
    const teacherServiceStub = {
      isLoggedIn: true,
      getRuns(): Observable<Run[]> {
        const runs : Run[] = [];
        const run1 = new Run();
        run1.id = 1;
        run1.name = "Photosynthesis";
        const project1 = new Project();
        project1.id = 1;
        project1.name = "Photosynthesis";
        project1.thumbIconPath = "";
        run1.project = project1;
        const run2 = new Run();
        run2.id = 2;
        run2.name = "Plate Tectonics";
        const project2 = new Project();
        project2.id = 1;
        project2.name = "Photosynthesis";
        project2.thumbIconPath = "";
        run2.project = project2;
        runs.push(run1);
        runs.push(run2);
        return Observable.create( observer => {
          observer.next(runs);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ TeacherModule ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
/*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
