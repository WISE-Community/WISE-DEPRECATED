import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditRunWarningDialogComponent } from './edit-run-warning-dialog.component';
import { ConfigService } from '../../services/config.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Run } from '../../domain/run';
import { configureTestSuite } from 'ng-bullet';
import { RouterTestingModule } from '@angular/router/testing';

export class MockConfigService {
  getContextPath(): string {
    return '';
  }
}

const mockDialogRef = {
  close: jasmine.createSpy('close')
};

describe('EditRunWarningDialogComponent', () => {
  let component: EditRunWarningDialogComponent;
  let fixture: ComponentFixture<EditRunWarningDialogComponent>;

  const run = new Run({ id: 1, project: { id: 1, name: 'Test' } });
  run.project.metadata = {
    title: 'Test Project'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [EditRunWarningDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        { provide: MAT_DIALOG_DATA, useValue: { data: { run } } },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      imports: [RouterTestingModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRunWarningDialogComponent);
    component = fixture.componentInstance;
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create editLink', () => {
    expect(component.editLink !== '').toBeTruthy();
  });
});
