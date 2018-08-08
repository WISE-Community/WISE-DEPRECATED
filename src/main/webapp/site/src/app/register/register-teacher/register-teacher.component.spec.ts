import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherComponent } from './register-teacher.component';
import { RegisterModule } from "../register.module";
import { TeacherService } from "../../teacher/teacher.service";
import { AuthService } from "angular5-social-login";
import { Observable } from "rxjs/Observable";
import { Project } from "../../teacher/project";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

  beforeEach(async(() => {
    const authServiceStub = {
      signIn(): any {
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceStub }
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
