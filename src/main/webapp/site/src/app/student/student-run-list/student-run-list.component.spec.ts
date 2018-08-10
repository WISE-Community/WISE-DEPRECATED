import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentModule } from "../student.module";
import { StudentRunListComponent } from "./student-run-list.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ConfigService } from "../../services/config.service";
import { Config } from "../../domain/config";

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
          });}
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

  it ('should detect valid project code', () => {
    const projectCode = 'Cat123';
    expect(component.isValidRunCodeSyntax(projectCode)).toEqual(true);
  })

  it ('should detect invalid project code', () => {
    const projectCode = 'Cat12';
    expect(component.isValidRunCodeSyntax(projectCode)).toEqual(false);
  })
});
