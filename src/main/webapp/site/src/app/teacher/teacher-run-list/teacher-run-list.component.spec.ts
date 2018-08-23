import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRunListComponent } from './teacher-run-list.component';
import { TeacherService } from "../teacher.service";
import { defer, Observable } from "rxjs";
import { Project } from "../project";
import { TeacherModule } from "../teacher.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Run } from "../../domain/run";

/**
 *  Create async observable that emits-once and completes
 *  after a JS engine turn
 */
export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('TeacherRunListComponent', () => {
  let component: TeacherRunListComponent;
  let fixture: ComponentFixture<TeacherRunListComponent>;

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
      },
      newRunSource$: fakeAsyncResponse([{id: 3, name: "Global Climate Change"}])
    };

    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TeacherModule
      ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
/*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
