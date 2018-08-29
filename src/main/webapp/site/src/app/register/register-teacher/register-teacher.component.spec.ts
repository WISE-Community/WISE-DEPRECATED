import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherComponent } from './register-teacher.component';
import { TeacherService } from "../../teacher/teacher.service";
import { AuthService } from "angularx-social-login";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { UserService } from "../../services/user.service";
import { FormsModule } from "@angular/forms";
import { MatCardModule, MatFormFieldModule, MatInputModule } from "@angular/material";

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterTeacherComponent ],
      imports: [ BrowserAnimationsModule, RouterTestingModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule ],
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
