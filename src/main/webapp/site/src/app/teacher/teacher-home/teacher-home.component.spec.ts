import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { defer, Observable } from "rxjs";

import { UserService } from "../../services/user.service";
import { TeacherService } from "../../teacher/teacher.service";
import { User } from "../../domain/user";
import { Project } from "../project";

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { DebugElement, DebugNode, NO_ERRORS_SCHEMA } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TeacherHomeComponent } from "./teacher-home.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Run } from "../../domain/run";

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
      declarations: [ TeacherHomeComponent ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub },
        HttpClient,
        HttpHandler
      ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
      .toContain('Demo');
  });
});
