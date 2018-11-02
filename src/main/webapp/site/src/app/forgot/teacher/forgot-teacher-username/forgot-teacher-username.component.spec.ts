import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherUsernameComponent } from './forgot-teacher-username.component';
import { ReactiveFormsModule } from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {TeacherService} from '../../../teacher/teacher.service';

export class MockTeacherService {

}

describe('ForgotTeacherUsernameComponent', () => {
  let component: ForgotTeacherUsernameComponent;
  let fixture: ComponentFixture<ForgotTeacherUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherUsernameComponent ],
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
    fixture = TestBed.createComponent(ForgotTeacherUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
