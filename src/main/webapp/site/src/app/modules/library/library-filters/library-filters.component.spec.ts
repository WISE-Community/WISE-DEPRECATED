import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryFiltersComponent } from './library-filters.component';
import { LibraryService } from "../../../services/library.service";
import sampleLibraryProjects from "../sampleLibraryProjects";
import { SimpleChange, NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";

export class MockLibraryService {
  public officialLibraryProjectsSource$ = fakeAsyncResponse([]);
  public communityLibraryProjectsSource$ = fakeAsyncResponse([]);
  public sharedLibraryProjectsSource$ = fakeAsyncResponse([]);
  public personalLibraryProjectsSource$ = fakeAsyncResponse([]);
  filterOptions(projectFilterOptions: ProjectFilterOptions) {

  }
}

describe('LibraryFiltersComponent', () => {
  let component: LibraryFiltersComponent;
  let fixture: ComponentFixture<LibraryFiltersComponent>;
  let projects: LibraryProject[];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ],
      declarations: [ LibraryFiltersComponent ],
      providers: [ { provide: LibraryService, useClass: MockLibraryService } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    projects = sampleLibraryProjects;
    fixture = TestBed.createComponent(LibraryFiltersComponent);
    component = fixture.componentInstance;
    component.libraryProjects = projects;
    component.ngOnChanges({projects: new SimpleChange(null, projects, true)});
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

  it('should call LibraryService.filterOptions when the search value changes', async(() => {
    const libraryServiceFilterOptionsSpy = spyOn(TestBed.get(LibraryService), 'filterOptions');
    component.searchUpdated('photo');
    expect(libraryServiceFilterOptionsSpy).toHaveBeenCalled();
  }));

  it('should call LibraryService.filterOptions when a drop down value changes', async(() => {
    const libraryServiceFilterOptionsSpy = spyOn(TestBed.get(LibraryService), 'filterOptions');
    component.filterUpdated(['Earth Sciences', 'Physical Sciences'], 'discipline');
    expect(libraryServiceFilterOptionsSpy).toHaveBeenCalled();
  }));

});
