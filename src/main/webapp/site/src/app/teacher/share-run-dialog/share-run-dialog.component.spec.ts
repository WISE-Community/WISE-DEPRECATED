import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareRunDialogComponent } from './share-run-dialog.component';

describe('ShareRunDialogComponent', () => {
  let component: ShareRunDialogComponent;
  let fixture: ComponentFixture<ShareRunDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareRunDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRunDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
