import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordComponent } from './forgot-teacher-password.component';

describe('ForgotTeacherPasswordComponent', () => {
  let component: ForgotTeacherPasswordComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
