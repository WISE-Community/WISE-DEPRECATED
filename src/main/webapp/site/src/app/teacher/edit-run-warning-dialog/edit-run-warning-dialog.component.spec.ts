import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRunWarningDialogComponent } from './edit-run-warning-dialog.component';

describe('EditRunWarningDialogComponent', () => {
  let component: EditRunWarningDialogComponent;
  let fixture: ComponentFixture<EditRunWarningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRunWarningDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRunWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
