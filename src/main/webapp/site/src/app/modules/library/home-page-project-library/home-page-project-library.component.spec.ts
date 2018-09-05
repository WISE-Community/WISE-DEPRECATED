import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { HomePageProjectLibraryComponent } from './home-page-project-library.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../../shared/shared.module";
import {
  MatBadgeModule,
  MatExpansionModule,
  MatIconModule
} from "@angular/material";
import { Component, Input } from "@angular/core";
import { LibraryService } from "../../../services/library.service";
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { Observable } from "rxjs";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { OfficialLibraryComponent } from "../official-library/official-library.component";


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

describe('HomePageProjectLibraryComponent', () => {
  let component: HomePageProjectLibraryComponent;
  let fixture: ComponentFixture<HomePageProjectLibraryComponent>;
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
    libraryGroupsSource$: fakeAsyncResponse({

    }),
    officialLibraryProjectsSource$: fakeAsyncResponse({

    }),
    projectFilterOptionsSource$: fakeAsyncResponse({
      searchValue: "",
      disciplineValue: [],
      dciArrangementValue: [],
      peValue: []
    })
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        MatIconModule,
        MatBadgeModule,
        MatExpansionModule
      ],
      declarations: [
        OfficialLibraryComponent,
        HomePageProjectLibraryComponent,
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
    fixture = TestBed.createComponent(HomePageProjectLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
