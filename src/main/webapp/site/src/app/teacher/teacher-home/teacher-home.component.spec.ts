import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { UserService } from "../../services/user.service";
import { TeacherService } from "../../teacher/teacher.service";
import { User } from "../../domain/user";
import { Project } from "../project";

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { TeacherModule } from "../teacher.module";
import { DebugElement, DebugNode } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TeacherHomeComponent } from "./teacher-home.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('TeacherHomeComponent', () => {
  let component: TeacherHomeComponent;
  let fixture: ComponentFixture<TeacherHomeComponent>;

  beforeEach(async(() => {
    let teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
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
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub },
        HttpClient,
        HttpHandler
      ],
      imports: [
        BrowserAnimationsModule,
        TeacherModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show two tabs', () => {
    const bannerDe: DebugElement = fixture.debugElement;
    const tabGroupDe = bannerDe.query(By.css('mat-tab-group'));
    const tabs: DebugElement[] = tabGroupDe.children;
    expect(tabs.length).toEqual(2);
  })
});
