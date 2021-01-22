import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../domain/user';
import { UserService } from '../../services/user.service';
import { StudentHomeComponent } from './student-home.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

export class MockUserService {
  getUser(): Observable<User[]> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.role = 'student';
    user.username = 'DemoUser0101';
    user.id = 123456;
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
}

describe('StudentHomeComponent', () => {
  let component: StudentHomeComponent;
  let fixture: ComponentFixture<StudentHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudentHomeComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: MatDialog, useValue: {} }
      ],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
