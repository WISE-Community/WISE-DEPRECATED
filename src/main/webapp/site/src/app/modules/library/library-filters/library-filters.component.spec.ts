import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryFiltersComponent } from './library-filters.component';
import { LibraryService } from '../../../services/library.service';
import sampleLibraryProjects from '../sampleLibraryProjects';
import { SimpleChange, NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryProject } from '../libraryProject';
import { fakeAsyncResponse } from '../../../student/student-run-list/student-run-list.component.spec';
import { ProjectFilterValues } from '../../../domain/projectFilterValues';
import { configureTestSuite } from 'ng-bullet';

export class MockLibraryService {
  public officialLibraryProjectsSource$ = fakeAsyncResponse([]);
  public communityLibraryProjectsSource$ = fakeAsyncResponse([]);
  public sharedLibraryProjectsSource$ = fakeAsyncResponse([]);
  public personalLibraryProjectsSource$ = fakeAsyncResponse([]);
  setFilterValues(projectFilterValues: ProjectFilterValues) {}
  getFilterValues(): ProjectFilterValues {
    return new ProjectFilterValues();
  }
}

describe('LibraryFiltersComponent', () => {
  let component: LibraryFiltersComponent;
  let fixture: ComponentFixture<LibraryFiltersComponent>;
  let projects: LibraryProject[];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [LibraryFiltersComponent],
      providers: [{ provide: LibraryService, useClass: MockLibraryService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    projects = sampleLibraryProjects;
    fixture = TestBed.createComponent(LibraryFiltersComponent);
    component = fixture.componentInstance;
    component.libraryProjects = projects;
    component.ngOnChanges({ projects: new SimpleChange(null, projects, true) });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the filter options', () => {
    expect(component.libraryProjects.length).toBe(2);
    expect(component.dciArrangementOptions.length).toBe(1);
    expect(component.disciplineOptions.length).toBe(2);
    expect(component.peOptions.length).toBe(3);
  });

  it('should call LibraryService.setFilterValues when the search value changes', async(() => {
    const libraryServiceFilterValuesSpy = spyOn(TestBed.get(LibraryService), 'setFilterValues');
    component.searchUpdated('photo');
    expect(libraryServiceFilterValuesSpy).toHaveBeenCalled();
  }));

  it('should call LibraryService.setFilterValues when a filter value changes', async(() => {
    const libraryServiceFilterValuesSpy = spyOn(TestBed.get(LibraryService), 'setFilterValues');
    component.filterUpdated(['Earth Sciences', 'Physical Sciences'], 'discipline');
    expect(libraryServiceFilterValuesSpy).toHaveBeenCalled();
  }));
});
