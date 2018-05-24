import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryProjectComponent } from './library-project.component';
import { LibraryProject } from "../libraryProject";

import { MatCardModule, MatIconModule, MatDialogModule, MatTooltipModule } from '@angular/material';
import { LibraryProjectDisciplineIconComponent } from "../library-project-discipline-icon/library-project-discipline-icon.component";

const materialModules = [
  MatCardModule,
  MatIconModule,
  MatDialogModule,
  MatTooltipModule
];

describe('LibraryProjectComponent', () => {
  let component: LibraryProjectComponent;
  let fixture: ComponentFixture<LibraryProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProjectComponent, LibraryProjectDisciplineIconComponent ],
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
