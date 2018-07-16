import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryProjectComponent } from './library-project.component';
import { LibraryProject } from "../libraryProject";
import { LibraryModule } from "../library.module";

describe('LibraryProjectComponent', () => {
  let component: LibraryProjectComponent;
  let fixture: ComponentFixture<LibraryProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ LibraryModule ]
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
