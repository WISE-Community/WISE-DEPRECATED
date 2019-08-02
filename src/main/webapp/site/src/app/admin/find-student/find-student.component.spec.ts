import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindStudentComponent } from './find-student.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Student } from '../../domain/student';
import { AdminService } from '../admin.service';
import {UserService} from '../../services/user.service';

export class MockAdminService {
  searchStudents(): Observable<Student []> {
    const students: Student[] = [];
    return Observable.create(observer => {
      observer.next(students);
      observer.complete();
    });
  }
}

export class MockUserService {
  isAdmin(): boolean {
    return false;
  }
}

describe('FindStudentComponent', () => {
  let component: FindStudentComponent;
  let fixture: ComponentFixture<FindStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindStudentComponent ],
      providers: [
        { provide: AdminService, useClass: MockAdminService },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
