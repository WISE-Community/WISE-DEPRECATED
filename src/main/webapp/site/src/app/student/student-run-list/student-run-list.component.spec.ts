import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs";
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentModule } from "../student.module";
import { StudentRunListComponent } from "./student-run-list.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('StudentRunListComponent', () => {
  let component: StudentRunListComponent;
  let fixture: ComponentFixture<StudentRunListComponent>;

  beforeEach(async(() => {
    let studentServiceStub = {
        isLoggedIn: true,
        getRuns(): Observable<StudentRun[]> {
          let runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"}];
          return Observable.create( observer => {
              observer.next(runs);
              observer.complete();
          });}
    }
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        StudentModule
      ],
      providers: [ {provide: StudentService, useValue: studentServiceStub } ]
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
