import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from 'rxjs';
import { MomentModule } from 'ngx-moment';
import { TeacherRunListComponent } from './teacher-run-list.component';
import { TeacherService } from '../teacher.service';
import { Project } from '../../domain/project';
import { TeacherRun } from '../teacher-run';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { configureTestSuite } from 'ng-bullet';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

@Component({ selector: 'app-teacher-run-list-item', template: '' })
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
    run1.name = 'Photosynthesis';
    run1.numStudents = 30;
    run1.periods = ['1', '2'];
    run1.startTime = new Date('2018-01-01T00:00:00.0').getTime();
    const project1 = new Project();
    project1.id = 1;
    project1.name = 'Photosynthesis';
    project1.projectThumb = '';
    run1.project = project1;
    const run2 = new TeacherRun();
    run2.id = 2;
    run2.name = 'Plate Tectonics';
    run2.numStudents = 15;
    run2.periods = ['3', '4'];
    run2.startTime = new Date('2018-03-03T00:00:00.0').getTime();
    const project2 = new Project();
    project2.id = 1;
    project2.name = 'Plate Tectonics';
    project2.projectThumb = '';
    run2.project = project2;
    runs.push(run1);
    runs.push(run2);
    return Observable.create((observer) => {
      observer.next(runs);
      observer.complete();
    });
  }
  getSharedRuns(): Observable<TeacherRun[]> {
    const runs: TeacherRun[] = [];
    return Observable.create((observer) => {
      observer.next(runs);
      observer.complete();
    });
  }
  newRunSource$ = fakeAsyncResponse({
    id: 3,
    name: 'Global Climate Change',
    periods: ['1', '2']
  });
}

export class MockConfigService {
  getCurrentServerTime(): number {
    return new Date('2018-08-24T00:00:00.0').getTime();
  }
}

describe('TeacherRunListComponent', () => {
  let component: TeacherRunListComponent;
  let fixture: ComponentFixture<TeacherRunListComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherRunListComponent],
      imports: [MomentModule, RouterTestingModule],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function isRunsSortedByStartTimeDesc(runs: TeacherRun[]): boolean {
    let previous: number = null;
    for (let run of runs) {
      let current = run.startTime;
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
    run3.name = 'Planet Earth';
    run3.numStudents = 10;
    run3.periods = ['6', '7'];
    run3.startTime = new Date('2018-02-02T00:00:00.0').getTime();
    const project3 = new Project();
    project3.id = 1;
    project3.name = 'Planet Earth';
    project3.projectThumb = '';
    run3.project = project3;
    component.runs.push(run3);
    component.runs.sort(component.sortByStartTimeDesc);
    expect(isRunsSortedByStartTimeDesc(component.runs)).toBeTruthy();
  });
});
