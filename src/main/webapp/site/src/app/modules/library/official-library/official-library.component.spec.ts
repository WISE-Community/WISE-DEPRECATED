import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficialLibraryComponent } from './official-library.component';
import { fakeAsyncResponse } from '../../../student/student-run-list/student-run-list.component.spec';
import { LibraryService } from '../../../services/library.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryGroup } from '../libraryGroup';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

export class MockLibraryService {
  libraryGroupsSource$ = fakeAsyncResponse({});
  officialLibraryProjectsSource$ = fakeAsyncResponse([]);
  projectFilterValuesSource$ = fakeAsyncResponse({
    searchValue: '',
    disciplineValue: [],
    dciArrangementValue: [],
    peValue: []
  });
  implementationModelOptions: LibraryGroup[] = [];
  numberOfOfficialProjectsVisible = new BehaviorSubject<number>(0);
  getOfficialLibraryProjects() {}
}

describe('OfficialLibraryComponent', () => {
  let component: OfficialLibraryComponent;
  let fixture: ComponentFixture<OfficialLibraryComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [OfficialLibraryComponent],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
