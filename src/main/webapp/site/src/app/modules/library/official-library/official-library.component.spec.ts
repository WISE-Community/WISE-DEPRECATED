import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialLibraryComponent } from './official-library.component';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { SharedModule } from "../../shared/shared.module";
import { LibraryService } from "../../../services/library.service";
import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient, HttpHandler } from "@angular/common/http";
import {
  MatBadgeModule,
  MatExpansionModule,
  MatIconModule,
  MatTabsModule
} from "@angular/material";

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

describe('OfficialLibraryComponent', () => {
  let component: OfficialLibraryComponent;
  let fixture: ComponentFixture<OfficialLibraryComponent>;
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
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        MatIconModule,
        MatBadgeModule,
        MatExpansionModule,
        MatTabsModule
      ],
      declarations: [
        OfficialLibraryComponent,
        LibraryGroupThumbsStubComponent,
        LibraryProjectStubComponent,
        LibraryFiltersComponent
      ],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: LibraryService, useValue: libraryServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialLibraryComponent);
    component = fixture.componentInstance;
    component.projects = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
