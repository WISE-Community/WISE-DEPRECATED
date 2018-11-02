import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordChangeComponent } from './forgot-teacher-password-change.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TeacherService} from '../../../teacher/teacher.service';

export class MockTeacherService {

}

describe('ForgotTeacherPasswordChangeComponent', () => {
  let component: ForgotTeacherPasswordChangeComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordChangeComponent ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TeacherService, userClass: MockTeacherService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
