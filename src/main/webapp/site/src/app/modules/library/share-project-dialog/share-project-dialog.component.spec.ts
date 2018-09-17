import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProjectDialogComponent } from './share-project-dialog.component';
import { TeacherService } from "../../../teacher/teacher.service";
import { Run } from "../../../domain/run";
import { Project } from "../../../teacher/project";
import { Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatAutocompleteModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { LibraryService } from "../../../services/library.service";

describe('ShareProjectDialogComponent', () => {
  const libraryServiceStub = {
    getLibraryGroups(): Observable<LibraryGroup[]> {
      const libraryGroup: LibraryGroup[] = [];
      return Observable.create( observer => {
        observer.next(libraryGroup);
        observer.complete();
      });
    },
    filterOptions(projectFilterOptions: ProjectFilterOptions): Observable<ProjectFilterOptions> {
      return Observable.create(observer => {
        observer.next(projectFilterOptions);
        observer.complete();
      });
    },
    getOfficialLibraryProjects() {

    },
    getCommunityLibraryProjects() {

    },
    getPersonalLibraryProjects() {

    },
    getSharedLibraryProjects() {

    },
    getProjectInfo(): Observable<Project> {
      return Observable.create(observer => {
        observer.next(projectObj);
        observer.complete();
      });
    },
    libraryGroupsSource$: fakeAsyncResponse({}),
    officialLibraryProjectsSource$: fakeAsyncResponse({}),
    communityLibraryProjectsSource$: fakeAsyncResponse({}),
    personalLibraryProjectsSource$: fakeAsyncResponse({}),
    sharedLibraryProjectsSource$: fakeAsyncResponse({}),
    projectFilterOptionsSource$: fakeAsyncResponse({
      searchValue: "",
      disciplineValue: [],
      dciArrangementValue: [],
      peValue: []
    }),
    tabIndexSource$: fakeAsyncResponse({}),
    newProjectSource$: fakeAsyncResponse({}),
    implementationModelOptions: []
  };
  const teacherServiceStub = {
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
    retrieveAllTeacherUsernames(): Observable<string[]> {
      let usernames : any[] = [
        "Spongebob Squarepants",
        "Patrick Star"
      ];
      return Observable.create( observer => {
        observer.next(usernames);
        observer.complete();
      });
    },
    getRun(runId: string): Observable<Run> {
      return Observable.create( observer => {
        const run: any = runObj;
        observer.next(run);
        observer.complete();
      });
    }
  };
  const runObj = {
    id: 1,
    name: "Photosynthesis",
    sharedOwners: [{
      id:4,
      firstName: "spongebob",
      lastName: "squarepants",
      permissions: [1,3]
    }],
    project: {
      id: 9,
      sharedOwners: [{
        id:4,
        firstName: "spongebob",
        lastName: "squarepants",
        permissions: [2]
      }]
    }
  };
  const projectObj = {
    id: 1,
    name: "Test",
    owner: {
      id: 123456,
      displayName: "Spongebob Squarepants"
    },
    sharedOwners: []
  };

  let component: ShareProjectDialogComponent;
  let fixture: ComponentFixture<ShareProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProjectDialogComponent ],
      imports: [ BrowserAnimationsModule, MatAutocompleteModule ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: LibraryService, useValue: libraryServiceStub },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            project: projectObj
          }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
