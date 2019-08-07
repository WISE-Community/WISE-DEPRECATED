import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActionsComponent } from './admin-actions.component';
import { Student } from '../../domain/student';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminActionsComponent', () => {
  let component: AdminActionsComponent;
  let fixture: ComponentFixture<AdminActionsComponent>;
  const runs = [{ runId: 1, name: 'test', startTime: 123, teacherUsername: 'test', teacherEmail: 'test' }];
  const student = new Student({ id: 1, firstName: 'a', lastName: 'a', username: 'aa01', runs });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminActionsComponent ],
      imports: [ ReactiveFormsModule, MatTableModule ],
      providers: [
        { provide: MatDialog, useValue: { }},
        { provide: MatDialogRef, useValue: { }},
        { provide: MAT_DIALOG_DATA, useValue: { user: student, action: 'changePassword' }}
      ],
      schemas:  [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
