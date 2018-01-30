import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEditProfileComponent } from './student-edit-profile.component';

describe('StudentEditProfileComponent', () => {
  let component: StudentEditProfileComponent;
  let fixture: ComponentFixture<StudentEditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentEditProfileComponent ]
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
