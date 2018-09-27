import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryProjectDisciplineIconComponent } from './library-project-discipline-icon.component';
import { LibraryProject } from "../libraryProject";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('LibraryProjectDisciplineIconComponent', () => {
  let component: LibraryProjectDisciplineIconComponent;
  let fixture: ComponentFixture<LibraryProjectDisciplineIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProjectDisciplineIconComponent ],
      imports: [],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectDisciplineIconComponent);
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
