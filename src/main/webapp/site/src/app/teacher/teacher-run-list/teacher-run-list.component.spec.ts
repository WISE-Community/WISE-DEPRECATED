import { Component, Input } from "@angular/core";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";
import { MomentModule } from 'ngx-moment';
import { TeacherRunListComponent } from './teacher-run-list.component';
import { TeacherService } from "../teacher.service";
import { Project } from "../../domain/project";
import { TeacherRun } from "../teacher-run";
import { NO_ERRORS_SCHEMA } from "@angular/core";

@Component({selector: 'app-teacher-run-list-item', template: ''})
class TeacherRunListItemStubComponent {
  @Input()
  run: TeacherRun = new TeacherRun();
}

export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export class MockTeacherService {
  getRuns(): Observable<TeacherRun[]> {
    const runs: TeacherRun[] = [];
    const run1 = new TeacherRun();
    run1.id = 1;
    run1.name = "Photosynthesis";
    run1.numStudents = 30;
    run1.periods = ["1","2"];
    run1.startTime = '2018-01-01 00:00:00.0';
    const project1 = new Project();
    project1.id = 1;
    project1.name = "Photosynthesis";
    project1.projectThumb = "";
    run1.project = project1;
    const run2 = new TeacherRun();
    run2.id = 2;
    run2.name = "Plate Tectonics";
    run2.numStudents = 15;
    run2.periods = ["3","4"];
    run2.startTime = '2018-03-03 00:00:00.0';
    const project2 = new Project();
    project2.id = 1;
    project2.name = "Plate Tectonics";
    project2.projectThumb = "";
    run2.project = project2;
    runs.push(run1);
    runs.push(run2);
    return Observable.create( observer => {
      observer.next(runs);
      observer.complete();
    });
  }
  getSharedRuns(): Observable<TeacherRun[]> {
    const runs: TeacherRun[] = [];
    return Observable.create(observer => {
        observer.next(runs);
        observer.complete();
      }
    );
  }
  newRunSource$ = fakeAsyncResponse(
    {
      id: 3,
      name: "Global Climate Change",
      periods: ["1", "2"]
    }
  );

}

describe('TeacherRunListComponent', () => {
  let component: TeacherRunListComponent;
  let fixture: ComponentFixture<TeacherRunListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherRunListComponent ],
      imports: [ MomentModule ],
      providers: [ { provide: TeacherService, useClass: MockTeacherService }],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function isRunsSortedByStartTimeDesc(runs: TeacherRun[]): boolean {
    let previous: Date = null;
    for (let run of runs) {
      let current = new Date(run.startTime);
      if (previous && previous < current) {
        return false;
      }
      previous = current;
    }
    return true;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort runs by start date', () => {
    const run3 = new TeacherRun();
    run3.id = 3;
    run3.name = "Planet Earth";
    run3.numStudents = 10;
    run3.periods = ["6", "7"];
    run3.startTime = "2018-02-02 00:00:00.0";
    const project3 = new Project();
    project3.id = 1;
    project3.name = "Planet Earth";
    project3.projectThumb = "";
    run3.project = project3;
    component.runs.push(run3);
    component.runs.sort(component.sortByStartTimeDesc);
    expect(isRunsSortedByStartTimeDesc(component.runs)).toBeTruthy();
  })
});
