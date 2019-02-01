import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalLibraryComponent } from './personal-library.component';
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { LibraryService } from "../../../services/library.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MatDialog } from '@angular/material';

export class MockLibraryService {
  implementationModelOptions = [];
  personalLibraryProjectsSource$ = fakeAsyncResponse([]);
  sharedLibraryProjectsSource$ = fakeAsyncResponse([]);
  projectFilterOptionsSource$ = fakeAsyncResponse({});
  newProjectSource$ = fakeAsyncResponse({});
  getPersonalLibraryProjects() {

  }
  getSharedLibraryProjects() {

  }
  setTabIndex() {

  }
}

describe('PersonalLibraryComponent', () => {
  let component: PersonalLibraryComponent;
  let fixture: ComponentFixture<PersonalLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PersonalLibraryComponent
      ],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialog }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
