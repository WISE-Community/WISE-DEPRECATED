import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherComponent } from './forgot-teacher.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ForgotTeacherComponent', () => {
  let component: ForgotTeacherComponent;
  let fixture: ComponentFixture<ForgotTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
