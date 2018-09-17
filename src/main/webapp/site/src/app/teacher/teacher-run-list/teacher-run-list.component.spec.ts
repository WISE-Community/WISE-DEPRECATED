import {
  Component,
  Input,
  NO_ERRORS_SCHEMA
} from "@angular/core";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { defer, Observable } from "rxjs";
import { MomentModule } from 'ngx-moment';

import { TeacherRunListComponent } from './teacher-run-list.component';
import { TeacherService } from "../teacher.service";
import { Project } from "../project";
import { TeacherRun } from "../teacher-run";

@Component({selector: 'app-teacher-run-list-item', template: ''})
class TeacherRunListItemStubComponent {
  @Input()
  run: TeacherRun = new TeacherRun();
}

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
      getRuns(): Observable<TeacherRun[]> {
        const runs: TeacherRun[] = [];
        const run1 = new TeacherRun();
        run1.id = 1;
        run1.name = "Photosynthesis";
        run1.numStudents = 30;
        const project1 = new Project();
        project1.id = 1;
        project1.name = "Photosynthesis";
        project1.thumbIconPath = "";
        run1.project = project1;
        const run2 = new TeacherRun();
        run2.id = 2;
        run2.name = "Plate Tectonics";
        run2.numStudents = 15;
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
      getSharedRuns(): Observable<TeacherRun[]> {
        const runs: TeacherRun[] = [];
        return Observable.create(observer => {
            observer.next(runs);
            observer.complete();
          }
        );
      },
      newRunSource$: fakeAsyncResponse([{id: 3, name: "Global Climate Change"}])
    };

    TestBed.configureTestingModule({
      declarations: [
        TeacherRunListItemStubComponent,
        TeacherRunListComponent
      ],
      imports: [
        BrowserAnimationsModule, MomentModule
      ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
