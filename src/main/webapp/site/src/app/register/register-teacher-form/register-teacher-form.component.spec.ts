import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherFormComponent } from './register-teacher-form.component';
import { RegisterModule } from "../register.module";
import { RouterTestingModule } from "@angular/router/testing";
import { TeacherService } from "../../teacher/teacher.service";
import { Observable } from "rxjs/Observable";
import { StudentRun } from "../../student/student-run";
import { Project } from "../../teacher/project";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('RegisterTeacherFormComponent', () => {
  let component: RegisterTeacherFormComponent;
  let fixture: ComponentFixture<RegisterTeacherFormComponent>;

  beforeEach(async(() => {
    const teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
