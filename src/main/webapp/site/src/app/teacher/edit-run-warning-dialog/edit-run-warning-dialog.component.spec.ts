import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRunWarningDialogComponent } from './edit-run-warning-dialog.component';
import { ConfigService } from '../../services/config.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Project } from '../../domain/project';

export class MockConfigService {
  getContextPath(): string {
    return "";
  }
}

describe('EditRunWarningDialogComponent', () => {
  let component: EditRunWarningDialogComponent;
  let fixture: ComponentFixture<EditRunWarningDialogComponent>;

  const project = new Project({ id: 1, name: "Test"});
  project.metadata = {
    title: "Test Project"
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRunWarningDialogComponent ],
      providers: [
        { provide: MatDialog },
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { data: { project }}},
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRunWarningDialogComponent);
    component = fixture.componentInstance;
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create editLink', () => {
    expect(component.editLink !== '').toBeTruthy()
  })
});
