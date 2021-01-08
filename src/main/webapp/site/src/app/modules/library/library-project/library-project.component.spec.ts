import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryProjectComponent } from './library-project.component';
import { LibraryProject } from '../libraryProject';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';

describe('LibraryProjectComponent', () => {
  let component: LibraryProjectComponent;
  let fixture: ComponentFixture<LibraryProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LibraryProjectComponent],
      imports: [BrowserAnimationsModule, RouterTestingModule, OverlayModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
