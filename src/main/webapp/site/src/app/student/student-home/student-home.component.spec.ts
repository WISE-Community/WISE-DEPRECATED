import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs";
import { User } from "../../domain/user";
import { UserService } from "../../services/user.service";
import { StudentHomeComponent } from "./student-home.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockUserService {
  getUser(): Observable<User[]> {
    const user: User = new User();
    user.firstName = 'Demo';
    user.lastName = 'User';
    user.role = 'student';
    user.userName = 'DemoUser0101';
    user.id = 123456;
    return Observable.create( observer => {
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
      declarations: [ StudentHomeComponent ],
      providers: [
        { provide: UserService, useClass: MockUserService }
      ],
      imports: [],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show student home page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#studentName').textContent)
      .toContain('Demo User');
  });
});
