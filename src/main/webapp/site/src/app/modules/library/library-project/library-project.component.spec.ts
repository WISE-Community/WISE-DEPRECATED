import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryProjectComponent } from './library-project.component';
import { LibraryProject } from "../libraryProject";

import { MatCardModule, } from '@angular/material';

const materialModules = [
  MatCardModule
];

describe('LibraryProjectComponent', () => {
  let component: LibraryProjectComponent;
  let fixture: ComponentFixture<LibraryProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProjectComponent ],
      imports: [ materialModules ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectComponent);
    component = fixture.componentInstance;
    const project: LibraryProject = new LibraryProject();
    project.id = 'testingProject';
    project.type = 'project';
    project.notes = 'Testing Project';
    project.metadata = {};
    project.projectThumb = '';
    project.thumbStyle = '';
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
