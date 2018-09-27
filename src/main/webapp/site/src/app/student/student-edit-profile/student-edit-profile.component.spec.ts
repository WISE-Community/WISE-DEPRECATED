import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentEditProfileComponent } from './student-edit-profile.component';
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('StudentEditProfileComponent', () => {
  let component: StudentEditProfileComponent;
  let fixture: ComponentFixture<StudentEditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentEditProfileComponent ],
      imports: [],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
