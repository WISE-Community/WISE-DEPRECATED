import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryProjectDisciplinesComponent } from './library-project-disciplines.component';
import { LibraryProject } from '../libraryProject';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LibraryProjectDisciplinesComponent', () => {
  let component: LibraryProjectDisciplinesComponent;
  let fixture: ComponentFixture<LibraryProjectDisciplinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LibraryProjectDisciplinesComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectDisciplinesComponent);
    component = fixture.componentInstance;
    const project: LibraryProject = new LibraryProject();
    project.id = 1;
    project.type = 'project';
    project.notes = 'Testing Project';
    project.metadata = {
      standardsAddressed: {
        ngss: {
          discipline: {
            id: 'LS',
            name: 'Life Sciences'
          }
        }
      }
    };
    project.projectThumb = '';
    project.thumbStyle = '';
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
