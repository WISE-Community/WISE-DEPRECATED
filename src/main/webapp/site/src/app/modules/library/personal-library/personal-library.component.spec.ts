import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { PersonalLibraryComponent } from './personal-library.component';
import { LibraryGroup } from "../libraryGroup";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { Observable } from "rxjs";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { LibraryService } from "../../../services/library.service";
import { LibraryProject } from "../libraryProject";

@Component({selector: 'app-library-project', template: ''})
class LibraryProjectStubComponent {
  @Input()
  project: LibraryProject = new LibraryProject();
}

describe('PersonalLibraryComponent', () => {
  let component: PersonalLibraryComponent;
  let fixture: ComponentFixture<PersonalLibraryComponent>;
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
    libraryGroupsSource$: fakeAsyncResponse([]),
    officialLibraryProjectsSource$: fakeAsyncResponse([]),
    communityLibraryProjectsSource$: fakeAsyncResponse([]),
    personalLibraryProjectsSource$: fakeAsyncResponse([]),
    projectFilterOptionsSource$: fakeAsyncResponse({
      searchValue: "",
      disciplineValue: [],
      dciArrangementValue: [],
      peValue: []
    }),
    tabIndexSource$: fakeAsyncResponse({}),
    newProjectSource$: fakeAsyncResponse({})
  }

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
