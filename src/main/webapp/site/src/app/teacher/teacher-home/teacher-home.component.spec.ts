import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";

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

/**
 *  Create async observable that emits-once and completes
 *  after a JS engine turn
 */
export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

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
      },
      newProjectSource$: fakeAsyncResponse([{id: 3, name: "Global Climate Change"}])
    };

    let userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
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
        TeacherModule,
        RouterTestingModule
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
  });

  it('should show teacher name and avatar', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#teacherName').textContent)
      .toContain('Demo Teacher');
  });
});
