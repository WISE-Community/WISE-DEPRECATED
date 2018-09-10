import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileComponent } from './edit-profile.component';
import { UserService } from "../../../services/user.service";
import { User } from "../../../domain/user";
import { Observable, BehaviorSubject } from '../../../../../../../../../node_modules/rxjs';
import { BrowserAnimationsModule } from '../../../../../../../../../node_modules/@angular/platform-browser/animations';
import { ReactiveFormsModule } from '../../../../../../../../../node_modules/@angular/forms';
import { MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatCardModule, MatInputModule } from '../../../../../../../../../node_modules/@angular/material';
import { RouterTestingModule } from '../../../../../../../../../node_modules/@angular/router/testing';
import { TeacherService } from "../../teacher.service";
import { Run } from "../../../domain/run";
import { Project } from "../../project";
import { fakeAsyncResponse } from "../../teacher-home/teacher-home.component.spec";

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(async(() => {
    let teacherServiceStub = {
      isLoggedIn: true,
      getRuns(): Observable<Run[]> {
        const runs : Run[] = [];
        const run1 = new Run();
        run1.id = 1;
        run1.name = "Photosynthesis";
        run1.numStudents = 12;
        const project1 = new Project();
        project1.id = 1;
        project1.name = "Photosynthesis";
        project1.thumbIconPath = "";
        run1.project = project1;
        const run2 = new Run();
        run2.id = 2;
        run2.name = "Plate Tectonics";
        run2.numStudents = 21;
        const project2 = new Project();
        project2.id = 1;
        project2.name = "Photosynthesis";
        project2.thumbIconPath = "";
        run2.project = project2;
        runs.push(run1);
        runs.push(run2);
        return Observable.create( observer => {
          observer.next(runs);
          observer.complete();
        });
      },
      newRunSource$: fakeAsyncResponse([{id: 3, name: "Global Climate Change"}])
    };
    const userServiceStub = {
      getUser(): BehaviorSubject<User> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
        user.id = 123456;
        const userBehaviorSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
        userBehaviorSubject.next(user);
        return userBehaviorSubject;
      },
      getLanguages() {
        return Observable.create([]);
      }
    };

    TestBed.configureTestingModule({
      declarations: [ EditProfileComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatCardModule,
        MatInputModule
      ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
