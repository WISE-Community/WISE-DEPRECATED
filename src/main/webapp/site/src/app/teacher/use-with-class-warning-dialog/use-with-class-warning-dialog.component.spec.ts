import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseWithClassWarningDialogComponent } from './use-with-class-warning-dialog.component';

describe('UseWithClassWarningDialogComponent', () => {
  let component: UseWithClassWarningDialogComponent;
  let fixture: ComponentFixture<UseWithClassWarningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseWithClassWarningDialogComponent ]
    })
    .compileComponents();
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
