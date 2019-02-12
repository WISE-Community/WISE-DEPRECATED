import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageProjectLibraryComponent } from './home-page-project-library.component';
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('HomePageProjectLibraryComponent', () => {
  let component: HomePageProjectLibraryComponent;
  let fixture: ComponentFixture<HomePageProjectLibraryComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        HomePageProjectLibraryComponent
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
