import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from "@angular/core";
import { MatTabsModule } from "@angular/material";
import { TeacherProjectLibraryComponent } from './teacher-project-library.component';
import { LibraryGroup } from "../libraryGroup";
import { LibraryProject } from "../libraryProject";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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

describe('TeacherProjectLibraryComponent', () => {
  let component: TeacherProjectLibraryComponent;
  let fixture: ComponentFixture<TeacherProjectLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatTabsModule
      ],
      declarations: [
        TeacherProjectLibraryComponent,
        LibraryFiltersComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
