import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryProjectComponent } from './library-project.component';
import { LibraryProject } from "../libraryProject";
import { LibraryModule } from "../library.module";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TeacherService } from "../../../teacher/teacher.service";
import { MatDialog } from "@angular/material";

describe('LibraryProjectComponent', () => {
  let component: LibraryProjectComponent;
  let fixture: ComponentFixture<LibraryProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProjectComponent ],
      imports: [ ],
      providers: [ { provide: MatDialog } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectComponent);
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
