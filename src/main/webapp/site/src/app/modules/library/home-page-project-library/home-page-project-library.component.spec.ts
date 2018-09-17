import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageProjectLibraryComponent } from './home-page-project-library.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../../shared/shared.module";
import { Component } from "@angular/core";

@Component({selector: 'app-library-filters', template: ''})
class LibraryFiltersStubComponent {
}

@Component({selector: 'app-official-library', template: ''})
class OfficialLibraryStubComponent {
}

describe('HomePageProjectLibraryComponent', () => {
  let component: HomePageProjectLibraryComponent;
  let fixture: ComponentFixture<HomePageProjectLibraryComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule
      ],
      declarations: [
        HomePageProjectLibraryComponent,
        LibraryFiltersStubComponent,
        OfficialLibraryStubComponent
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
