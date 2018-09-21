import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityLibraryComponent } from './community-library.component';
import { Component, Input } from "@angular/core";
import { LibraryProject } from "../libraryProject";
import { Observable } from "rxjs";
import { LibraryGroup } from "../libraryGroup";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { LibraryService } from "../../../services/library.service";

@Component({selector: 'app-library-project', template: ''})
class LibraryProjectStubComponent {
  @Input()
  project: LibraryProject = new LibraryProject();
}

describe('CommunityLibraryComponent', () => {
  let component: CommunityLibraryComponent;
  let fixture: ComponentFixture<CommunityLibraryComponent>;
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
    libraryGroupsSource$: fakeAsyncResponse([]),
    officialLibraryProjectsSource$: fakeAsyncResponse([]),
    communityLibraryProjectsSource$: fakeAsyncResponse([]),
    projectFilterOptionsSource$: fakeAsyncResponse({
      searchValue: "",
      disciplineValue: [],
      dciArrangementValue: [],
      peValue: []
    })
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommunityLibraryComponent,
        LibraryProjectStubComponent
      ],
      providers: [
        { provide: LibraryService, useValue: libraryServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
