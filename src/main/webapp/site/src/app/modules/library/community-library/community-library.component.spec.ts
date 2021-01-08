import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityLibraryComponent } from './community-library.component';
import { fakeAsyncResponse } from '../../../student/student-run-list/student-run-list.component.spec';
import { LibraryService } from '../../../services/library.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';

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
      imports: [OverlayModule, MatDialogModule],
      declarations: [CommunityLibraryComponent],
      providers: [{ provide: LibraryService, useClass: MockLibraryService }],
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
