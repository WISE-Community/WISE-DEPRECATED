import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageProjectLibraryComponent } from './home-page-project-library.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LibraryService } from '../../../services/library.service';

export class MockLibraryService {
  getOfficialLibraryProjects() {}
  clearAll() {}
}

describe('HomePageProjectLibraryComponent', () => {
  let component: HomePageProjectLibraryComponent;
  let fixture: ComponentFixture<HomePageProjectLibraryComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [HomePageProjectLibraryComponent],
      providers: [{ provide: LibraryService, useClass: MockLibraryService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
