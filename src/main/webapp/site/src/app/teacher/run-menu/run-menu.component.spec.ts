import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RunMenuComponent } from "./run-menu.component";
import { TeacherService } from "../teacher.service";
import { Project } from "../../domain/project";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, Observable } from 'rxjs';
import {
  MatDialog,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule
} from "@angular/material";
<<<<<<< HEAD
import { ConfigService } from "../../services/config.service";
=======
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { TeacherRun } from "../teacher-run";
>>>>>>> PortalRedesignAngular

describe('RunMenuComponent', () => {
  const configServiceStub = {
    getContextPath(): string {
      return '/wise';
    }
  };
  let component: RunMenuComponent;
  let fixture: ComponentFixture<RunMenuComponent>;

  beforeEach(async(() => {
    let userServiceStub = {
      getUser(): BehaviorSubject<User> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
        user.id = 123456;
        return Observable.create(observer => {
          observer.next(user);
          observer.complete();
        });
      },
      getUserId() {
        return 123456;
      }
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatMenuModule,
        MatIconModule
      ],
      declarations: [ RunMenuComponent ],
      providers: [
        { provide: TeacherService },
<<<<<<< HEAD
        { provide: MatDialog },
        { provide: ConfigService, useValue: configServiceStub }
=======
        { provide: UserService, useValue: userServiceStub },
        { provide: MatDialog }
>>>>>>> PortalRedesignAngular
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunMenuComponent);
    component = fixture.componentInstance;
    const run: TeacherRun = new TeacherRun();
    run.id = 1;
    run.name = "Photosynthesis";
    const owner = new User();
    owner.id = 1;
    run.owner = owner;
    const project = new Project();
    project.id = 1;
    project.owner = owner;
    project.sharedOwners = [];
    run.project = project;
    run.sharedOwners = [];
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
