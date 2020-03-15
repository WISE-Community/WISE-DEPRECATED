import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsItemDialogComponent } from './news-item-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

describe('NewsItemDialogComponent', () => {
  let component: NewsItemDialogComponent;
  let fixture: ComponentFixture<NewsItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsItemDialogComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { isEditMode: false }},
        { provide: MatDialogRef, useValue: { close: () => {} }}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
