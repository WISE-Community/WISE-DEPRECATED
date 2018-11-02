import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordVerifyComponent } from './forgot-teacher-password-verify.component';
import {TeacherService} from '../../../teacher/teacher.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

export class MockTeacherService {

}

describe('ForgotTeacherPasswordVerifyComponent', () => {
  let component: ForgotTeacherPasswordVerifyComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordVerifyComponent ],
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
    fixture = TestBed.createComponent(ForgotTeacherPasswordVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
