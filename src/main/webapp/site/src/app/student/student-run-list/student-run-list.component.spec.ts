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
          const runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"}];
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
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        StudentModule
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: ConfigService, useValue: configServiceStub },
    { provide: MatDialog, useValue: {} }
      ]
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

  it('should show runs', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#studentRuns').textContent).toContain('Photosynthesis');
  })
});
