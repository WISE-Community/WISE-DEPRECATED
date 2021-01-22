import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseWithClassWarningDialogComponent } from './use-with-class-warning-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../../domain/project';
import { Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UseWithClassWarningDialogComponent', () => {
  let component: UseWithClassWarningDialogComponent;
  let fixture: ComponentFixture<UseWithClassWarningDialogComponent>;
  const project: Project = new Project();
  project.metadata = {
    title: 'This is a test'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UseWithClassWarningDialogComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            closeAll: () => {}
          }
        },
        {
          provide: MatDialogRef,
          useValue: {
            afterClosed: () => {
              return Observable.create((observer) => {
                observer.next({});
                observer.complete();
              });
            },
            close: () => {}
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: { project: project } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseWithClassWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
