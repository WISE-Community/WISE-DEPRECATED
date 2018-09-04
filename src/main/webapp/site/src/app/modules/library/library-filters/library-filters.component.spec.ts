import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

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
import { SelectMenuComponent } from "../../shared/select-menu/select-menu.component";
import { SelectMenuTestHelper } from '../select-menu-test.helper';

describe('LibraryFiltersComponent', () => {
  let component: LibraryFiltersComponent;
  let fixture: ComponentFixture<LibraryFiltersComponent>;
  let projects: LibraryProject[];

  const libraryService = jasmine.createSpyObj('LibraryService',
      ['getLibraryGroups', 'filterOptions']);
  libraryService.getLibraryGroups.and.returnValue(of(sampleLibraryGroups));
  libraryService.filterOptions.and.returnValue(of({
    searchValue: "",
    disciplineValue: [],
    dciArrangementValue: [],
    peValue: []
  }));

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
    component.projects = projects;
    component.ngOnChanges({projects: new SimpleChange(null, projects, true)});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the filter options', () => {
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

  it('should change the dci arrangement value when the user selects an option in the drop down', fakeAsync(() => {
    const dciArrangementValue = ['LS'];
    const dciArrangementSelectMenu = fixture.debugElement.query(By.css('#dciArrangementSelectMenu'));
    dciArrangementSelectMenu.nativeElement.value = dciArrangementValue;
    let selectMenu: SelectMenuTestHelper = new SelectMenuTestHelper(fixture);
    selectMenu.triggerMenu();
    const options = selectMenu.getOptions();
    selectMenu.selectOption(options[0]);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.disciplineValue).toEqual(dciArrangementValue);
    });
  }));

});
