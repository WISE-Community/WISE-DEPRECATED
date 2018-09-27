import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterStudentFormComponent } from './register-student-form.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs";
import { StudentService } from "../../student/student.service";
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule } from "@angular/forms";
import { MatInputModule, MatSelectModule } from "@angular/material";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockStudentService {
  retrieveSecurityQuestions() {
    return Observable.create(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

export class MockUserService {

}

describe('RegisterStudentFormComponent', () => {
  let component: RegisterStudentFormComponent;
  let fixture: ComponentFixture<RegisterStudentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStudentFormComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
