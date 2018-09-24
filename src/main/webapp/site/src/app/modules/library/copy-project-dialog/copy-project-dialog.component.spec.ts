import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyProjectDialogComponent } from './copy-project-dialog.component';
import { LibraryService } from "../../../services/library.service";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { LibraryGroup } from "../libraryGroup";
import { Project } from "../../../domain/project";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('CopyProjectDialogComponent', () => {
  let component: CopyProjectDialogComponent;
  let fixture: ComponentFixture<CopyProjectDialogComponent>;

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
    setTabIndex() {

    },
    libraryGroupsSource$: fakeAsyncResponse({}),
    officialLibraryProjectsSource$: fakeAsyncResponse([]),
    communityLibraryProjectsSource$: fakeAsyncResponse([]),
    personalLibraryProjectsSource$: fakeAsyncResponse([]),
    sharedLibraryProjectsSource$: fakeAsyncResponse([]),
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
  const projectObj = {
    id: 1,
    name: "Test",
    owner: {
      id: 123456,
      displayName: "Spongebob Squarepants"
    },
    sharedOwners: []
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyProjectDialogComponent ],
      providers: [
        { provide: LibraryService, useValue: libraryServiceStub },
        { provide: MatDialog, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            project: projectObj
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
