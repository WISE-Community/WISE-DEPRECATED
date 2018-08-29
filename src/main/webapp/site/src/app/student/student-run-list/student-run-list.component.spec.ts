import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDialog } from "@angular/material/dialog";
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentModule } from "../student.module";
import { StudentRunListComponent } from "./student-run-list.component";
import { ConfigService } from "../../services/config.service";
import { Config } from "../../domain/config";
import { MatIconModule } from "@angular/material";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('StudentRunListComponent', () => {
  let component: StudentRunListComponent;
  let fixture: ComponentFixture<StudentRunListComponent>;

  beforeEach(async(() => {
    const studentServiceStub = {
        isLoggedIn: true,
        getRuns(): Observable<StudentRun[]> {
          const runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"},{id:3,name:"Chemical Reactions"}];
          return Observable.create( observer => {
              observer.next(runs);
              observer.complete();
          });
    },
    newRunSource$: fakeAsyncResponse({
      id: 12345,
      name: "Test Project",
      runCode: "Panda123",
      periodName: "1",
      startTime: "2018-08-22 00:00:00.0",
      teacherDisplayName: "Spongebob Squarepants",
      teacherFirstName: "Spongebob",
      teacherLastName: "Squarepants",
      projectThumb: "/wise/curriculum/360/assets/project_thumb.png"
    })
    };
    const configServiceStub = {
      getConfig(): Observable<Config> {
        const config : Config = {"context":"vle","logOutURL":"/logout","currentTime":20180730};
        return Observable.create( observer => {
          observer.next(config);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [ StudentRunListComponent ],
      imports: [
        BrowserAnimationsModule, MatIconModule
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: ConfigService, useValue: configServiceStub },
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
