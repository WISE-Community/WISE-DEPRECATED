import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { User } from "../../domain/user";
import { UserService } from "../../services/user.service";

import { StudentModule } from "../student.module";
import { StudentHomeComponent } from "./student-home.component";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('StudentHomeComponent', () => {
  let component: StudentHomeComponent;
  let fixture: ComponentFixture<StudentHomeComponent>;

  beforeEach(async(() => {
    let studentServiceStub = {
        isLoggedIn: true,
        getRuns(): Observable<StudentRun[]> {
          let runs : any[] = [
            {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
          ];
          return Observable.create( observer => {
              observer.next(runs);
              observer.complete();
          });
        }
    };

    let userServiceStub = {
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
    };

    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ],
      imports: [ BrowserAnimationsModule, StudentModule, RouterTestingModule ]
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
