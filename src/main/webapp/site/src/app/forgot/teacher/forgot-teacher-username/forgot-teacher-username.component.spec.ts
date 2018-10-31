import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherUsernameComponent } from './forgot-teacher-username.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ForgotTeacherUsernameComponent', () => {
  let component: ForgotTeacherUsernameComponent;
  let fixture: ComponentFixture<ForgotTeacherUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherUsernameComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
