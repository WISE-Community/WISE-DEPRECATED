import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentRunListComponent } from "./student-run-list.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";

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
    const runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"},{id:3,name:"Chemical Reactions"}];
    return Observable.create( observer => {
      observer.next(runs);
      observer.complete();
    });
  }
}

describe('StudentRunListComponent', () => {
  let component: StudentRunListComponent;
  let fixture: ComponentFixture<StudentRunListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentRunListComponent ],
      imports: [],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
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
    expect(compiled.querySelector('#myProjectCount').textContent).toContain('My Projects (3)');
  })
});
