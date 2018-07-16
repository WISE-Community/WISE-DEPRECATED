import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryProjectDisciplineIconComponent } from './library-project-discipline-icon.component';
import { LibraryProject } from "../libraryProject";
import { LibraryModule } from "../library.module";

describe('LibraryProjectDisciplineIconComponent', () => {
  let component: LibraryProjectDisciplineIconComponent;
  let fixture: ComponentFixture<LibraryProjectDisciplineIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ LibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectDisciplineIconComponent);
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
