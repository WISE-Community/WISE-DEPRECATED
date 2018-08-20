import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherProjectListItemComponent } from './teacher-project-list-item.component';
import { TeacherModule } from "../teacher.module";
import { Observable } from "rxjs";
import { Project } from "../project";
import { TeacherService } from "../teacher.service";

describe('TeacherProjectListItemComponent', () => {
  let component: TeacherProjectListItemComponent;
  let fixture: ComponentFixture<TeacherProjectListItemComponent>;

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
      declarations: [],
      imports: [ TeacherModule ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
