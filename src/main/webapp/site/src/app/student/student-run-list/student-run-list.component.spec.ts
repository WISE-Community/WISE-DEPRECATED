import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";
import { MomentModule } from 'ngx-moment';
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentRunListComponent } from "./student-run-list.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Run } from '../../domain/run';
import {ConfigService} from "../../services/config.service";
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';

export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export class MockStudentService {
  public newRunSource$ = fakeAsyncResponse({
    id: 12345,
    name: "Test Project",
    runCode: "Panda123",
    periodName: "1",
    startTime: "2018-08-22 00:00:00.0",
    teacherDisplayName: "Spongebob Squarepants",
    teacherFirstName: "Spongebob",
    teacherLastName: "Squarepants",
    projectThumb: "/wise/curriculum/360/assets/project_thumb.png"
  });
  getRuns(): Observable<StudentRun[]> {
    const runs : Run[] = [
      new Run({
        id:1,
        name:"Photosynthesis",
        startTime: "2018-08-22 00:00:00.0"
      }),
      new Run({
        id:2,
        name:"Plate Tectonics",
        startTime: "2018-08-23 00:00:00.0"
      }),
      new Run({
        id:3,
        name:"Chemical Reactions",
        startTime: "2018-08-20 00:00:00.0",
        endTime: "2018-08-22 00:00:00.0"
      })
      ];
    return Observable.create( observer => {
      observer.next(runs);
      observer.complete();
    });
  }
}

export class MockConfigService {
  getCurrentServerTime(): number {
    return new Date('2018-08-24 00:00:00.0').getTime();
  }
}

describe('StudentRunListComponent', () => {
  let component: StudentRunListComponent;
  let fixture: ComponentFixture<StudentRunListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentRunListComponent ],
      imports: [ MomentModule ],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: ActivatedRoute, useValue: { queryParams: Observable.create() } },
        { provide: MatDialog, useValue: {} }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show number of runs', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#unitCount').textContent).toContain('My WISE units: 3 (2 active, 1 completed).');
  })
});
