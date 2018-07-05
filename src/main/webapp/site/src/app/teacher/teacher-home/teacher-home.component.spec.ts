import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { TeacherHomeComponent } from './teacher-home.component';
import { UserService } from "../../services/user.service";
import { TeacherService } from "../../teacher/teacher.service";
import { User } from "../../domain/user";
import { TeacherProjectListComponent } from "../teacher-project-list/teacher-project-list.component";
import { Project } from "../project";
import { TeacherProjectListItemComponent } from "../teacher-project-list-item/teacher-project-list-item.component";
import { SearchBarComponent } from "../../modules/shared/search-bar/search-bar.component";
import { SelectMenuComponent } from "../../modules/shared/select-menu/select-menu.component";

import {
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatMenuModule,
  MatSelectModule, MatTabsModule
} from "@angular/material";
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MomentModule } from "angular2-moment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LibraryModule } from "../../modules/library/library.module";
import { SharedModule } from "../../modules/shared/shared.module";
import { ProjectRunMenuComponent } from "../project-run-menu/project-run-menu.component";
import { HttpClient, HttpHandler } from "@angular/common/http";

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
      declarations: [
        TeacherHomeComponent,
        TeacherProjectListComponent,
        TeacherProjectListItemComponent,
        ProjectRunMenuComponent,
      ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: UserService, useValue: userServiceStub },
        HttpClient,
        HttpHandler
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        LibraryModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatTabsModule,
        MomentModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule
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
});
