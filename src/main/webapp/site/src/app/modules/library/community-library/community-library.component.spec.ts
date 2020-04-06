import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityLibraryComponent } from './community-library.component';
import { fakeAsyncResponse } from '../../../student/student-run-list/student-run-list.component.spec';
import { LibraryService } from '../../../services/library.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

export class MockLibraryService {
  implementationModelOptions = [];
  communityLibraryProjectsSource$ = fakeAsyncResponse([]);
  projectFilterValuesSource$ = fakeAsyncResponse({
    searchValue: '',
    disciplineValue: [],
    dciArrangementValue: [],
    peValue: []
  });
  numberOfCommunityProjectsVisible = new BehaviorSubject<number>(0);
}

describe('CommunityLibraryComponent', () => {
  let component: CommunityLibraryComponent;
  let fixture: ComponentFixture<CommunityLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityLibraryComponent],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
