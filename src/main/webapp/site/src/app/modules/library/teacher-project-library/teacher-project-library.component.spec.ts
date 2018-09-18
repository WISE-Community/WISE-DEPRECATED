import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { TeacherProjectLibraryComponent } from './teacher-project-library.component';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OfficialLibraryComponent } from "../official-library/official-library.component";
import { SharedModule } from "../../shared/shared.module";
import {
  MatBadgeModule,
  MatExpansionModule,
  MatIconModule,
  MatTabsModule,
  MatTooltipModule
} from "@angular/material";
import { LibraryService } from "../../../services/library.service";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { Observable } from "rxjs";
import { CommunityLibraryComponent } from "../community-library/community-library.component";
import { PersonalLibraryComponent } from "../personal-library/personal-library.component";
import { LibraryProjectDetailsComponent } from "../library-project-details/library-project-details.component";
import { Project } from "../../../domain/project";

@Component({selector: 'app-library-group-thumbs', template: ''})
class LibraryGroupThumbsStubComponent {
  @Input()
  group: LibraryGroup = new LibraryGroup();
}

@Component({selector: 'app-library-project', template: ''})
class LibraryProjectStubComponent {
  @Input()
  project: LibraryProject = new LibraryProject();
}

@Component({selector: 'app-library-filters', template: ''})
class LibraryFiltersComponent {
  @Input()
  projects: LibraryProject[] = [];
}

describe('TeacherProjectLibraryComponent', () => {
  let component: TeacherProjectLibraryComponent;
  let fixture: ComponentFixture<TeacherProjectLibraryComponent>;
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
    newProjectSource$: fakeAsyncResponse({})
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
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        MatIconModule,
        MatBadgeModule,
        MatExpansionModule,
        MatTabsModule,
        MatTooltipModule
      ],
      declarations: [
        CommunityLibraryComponent,
        OfficialLibraryComponent,
        PersonalLibraryComponent,
        TeacherProjectLibraryComponent,
        LibraryGroupThumbsStubComponent,
        LibraryProjectStubComponent,
        LibraryProjectDetailsComponent,
        LibraryFiltersComponent
      ],
      providers: [
        { provide: LibraryService, useValue: libraryServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
