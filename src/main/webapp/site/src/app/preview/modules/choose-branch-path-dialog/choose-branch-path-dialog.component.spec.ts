import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseBranchPathDialogComponent } from './choose-branch-path-dialog.component';

describe('ChooseBranchPathDialogComponent', () => {
  let component: ChooseBranchPathDialogComponent;
  let fixture: ComponentFixture<ChooseBranchPathDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseBranchPathDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseBranchPathDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
