import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { LibraryComponent } from './library.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../shared/shared.module";
import {
  MatBadgeModule,
  MatExpansionModule,
  MatIconModule
} from "@angular/material";
import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { LibraryService } from "../../services/library.service";
import { LibraryGroup } from "./libraryGroup";
import { LibraryProject } from "./libraryProject";
import { Observable } from "rxjs";
import { User } from "../../domain/user";

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

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;
  const libraryServiceStub = {
    getLibraryGroups(): Observable<LibraryGroup[]> {
      const libraryGroup: LibraryGroup[] = [];
      return Observable.create( observer => {
        observer.next(libraryGroup);
        observer.complete();
      });
    }
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        MatIconModule,
        MatBadgeModule,
        MatExpansionModule
      ],
      declarations: [
        LibraryComponent,
        LibraryGroupThumbsStubComponent,
        LibraryProjectStubComponent,
        LibraryFiltersComponent
      ],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: LibraryService, useValue: libraryServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
