import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { PersonalLibraryComponent } from './personal-library.component';
import { LibraryGroup } from "../libraryGroup";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { Observable } from "rxjs";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { LibraryService } from "../../../services/library.service";
import { LibraryProject } from "../libraryProject";
import { Project } from "../../../domain/project";

@Component({selector: 'app-library-project', template: ''})
class LibraryProjectStubComponent {
  @Input()
  project: LibraryProject = new LibraryProject();
}

describe('PersonalLibraryComponent', () => {
  let component: PersonalLibraryComponent;
  let fixture: ComponentFixture<PersonalLibraryComponent>;
  const libraryServiceStub = {
    implementationModelOptions: [],
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
    setTabIndex(index) {

    },
    libraryGroupsSource$: fakeAsyncResponse([]),
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
    newProjectSource$: fakeAsyncResponse({})
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PersonalLibraryComponent,
        LibraryProjectStubComponent
      ],
      providers: [
        { provide: LibraryService, useValue: libraryServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
