import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterStudentCompleteComponent } from './register-student-complete.component';
import { RouterTestingModule } from "@angular/router/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('RegisterStudentCompleteComponent', () => {
  let component: RegisterStudentCompleteComponent;
  let fixture: ComponentFixture<RegisterStudentCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStudentCompleteComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
