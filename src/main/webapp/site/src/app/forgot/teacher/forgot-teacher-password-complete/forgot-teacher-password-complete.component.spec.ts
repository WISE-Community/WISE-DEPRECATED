import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordCompleteComponent } from './forgot-teacher-password-complete.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';

describe('ForgotTeacherPasswordCompleteComponent', () => {
  let component: ForgotTeacherPasswordCompleteComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordCompleteComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
