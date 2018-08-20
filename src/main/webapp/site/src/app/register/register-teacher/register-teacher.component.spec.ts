import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherComponent } from './register-teacher.component';
import { RegisterModule } from "../register.module";
import { TeacherService } from "../../teacher/teacher.service";
import { AuthService } from "angularx-social-login";
import { Observable } from "rxjs";
import { Project } from "../../teacher/project";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

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
    const authServiceStub = {
      signIn(): any {
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: TeacherService, useValue: teacherServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
