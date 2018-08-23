import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherComponent } from './register-teacher.component';
import { RegisterModule } from "../register.module";
import { TeacherService } from "../../teacher/teacher.service";
import { AuthService } from "angularx-social-login";
import { Observable } from "rxjs";
import { Project } from "../../teacher/project";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { User } from "../../domain/user";
import { UserService } from "../../services/user.service";

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ],
      providers: [
        { provide: AuthService },
        { provide: TeacherService },
        { provide: UserService }
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
