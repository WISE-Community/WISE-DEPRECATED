import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryFiltersComponent } from './library-filters.component';
import { of } from "rxjs";
import { LibraryService } from "../../../services/library.service";
import sampleLibraryGroups from "../sampleLibraryGroups";
import sampleLibraryProjects from "../sampleLibraryProjects";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../../shared/shared.module";
import {
  MatBadgeModule,
  MatIconModule
} from "@angular/material";
import { Component, DebugElement, SimpleChange } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { SearchBarComponent } from "../../shared/search-bar/search-bar.component";
import { By } from '@angular/platform-browser';

describe('LibraryFiltersComponent', () => {
  let component: LibraryFiltersComponent;
  let fixture: ComponentFixture<LibraryFiltersComponent>;
  let projects: LibraryProject[];

  const libraryService = jasmine.createSpyObj('LibraryService', ['getLibraryGroups']);
  libraryService.getLibraryGroups.and.returnValue(of(sampleLibraryGroups));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule, SharedModule, MatIconModule, MatBadgeModule ],
      declarations: [
        LibraryFiltersComponent
      ],
      providers: [
        { provide: LibraryService, useValue: libraryService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    projects = sampleLibraryProjects;

    fixture = TestBed.createComponent(LibraryFiltersComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the projects and populate the filter options', () => {
    component.projects = projects;
    component.ngOnChanges({projects: new SimpleChange(null, projects, true)});
    fixture.detectChanges();
    expect(component.projects.length).toBe(2);
    expect(component.dciArrangementOptions.length).toBe(1);
    expect(component.disciplineOptions.length).toBe(2);
    expect(component.peOptions.length).toBe(3);
  });

  it('should change the search filter when the user changes the search bar value', async(() => {
    const searchInput: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const searchString = 'photo';
    searchInput.value = searchString;
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.searchValue).toEqual(searchString);
    });
  }));

});
