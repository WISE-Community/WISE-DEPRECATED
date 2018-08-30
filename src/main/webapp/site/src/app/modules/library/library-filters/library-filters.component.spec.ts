import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryFiltersComponent } from './library-filters.component';
import { of } from "rxjs";
import { LibraryService } from "../../../services/library.service";
import sampleLibraryGroups from "../sampleLibraryGroups";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../../shared/shared.module";
import {
  MatBadgeModule,
  MatIconModule
} from "@angular/material";
import { Component, SimpleChange } from '@angular/core';
import { LibraryProject } from "../libraryProject";

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
    projects = [];
    const project1 = new LibraryProject();
    project1.id = 1;
    project1.name = '';
    project1.metadata = {
      "standardsAddressed": {
        "ngss": {
          "disciplines": [
            {
              "id": "LS",
              "name": "Life Sciences"
            }
          ],
          "dci": [
            {
              "id": "LS1.B",
              "name": "Growth and Development of Organisms"
            }
          ],
          "dciArrangements": [
            {
              "id": "MS-LS1",
              "name": "From Molecules to Organisms: Structures and Processes",
              "children": [
                {
                  "id": "MS-LS1-4",
                  "name": "Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively."
                },
                {
                  "id": "MS-LS1-5",
                  "name": "Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms."
                }
              ]
            }
          ],
          "ccc": [
            {
              "id": "ce",
              "name": "Cause and Effect"
            }
          ],
          "practices": [
            {
            "id": "eae",
            "name": "Engaging in Argument from Evidence"
            }
          ]
        }
      }
    };
    projects.push(project1);
    const project2 = new LibraryProject();
    project2.id = 2;
    project2.name = '';
    project2.metadata = {
      "standardsAddressed": {
        "ngss": {
          "disciplines": [
            {
              "id": "PS",
              "name": "Physical Sciences"
            }
          ],
          "dci": [
            {
              "id": "LS1.B",
              "name": "Growth and Development of Organisms"
            }
          ],
          "dciArrangements": [
            {
              "id": "MS-LS1",
              "name": "From Molecules to Organisms: Structures and Processes",
              "children": [
                {
                  "id": "MS-LS1-4",
                  "name": "Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively."
                },
                {
                  "id": "MS-LS1-6",
                  "name": "Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms."
                }
              ]
            }
          ],
          "ccc": [
            {
              "id": "ce",
              "name": "Cause and Effect"
            }
          ],
          "practices": [
            {
              "id": "ceds",
              "name": "Constructing Explanations and Designing Solutions"
            }
          ]
        }
      }
    };
    projects.push(project2);

    fixture = TestBed.createComponent(LibraryFiltersComponent);
    component = fixture.componentInstance;
    //component.projects = projects;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    component.projects = projects;
    component.ngOnChanges({projects: new SimpleChange(null, projects, true)});
    fixture.detectChanges();
    expect(component.projects.length).toBe(2);
    expect(component.dciArrangementOptions.length).toBe(1);
    expect(component.disciplineOptions.length).toBe(2);
    expect(component.peOptions.length).toBe(3);
  });

});
