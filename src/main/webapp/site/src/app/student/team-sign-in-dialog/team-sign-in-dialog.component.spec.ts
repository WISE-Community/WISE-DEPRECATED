import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSignInDialogComponent } from './team-sign-in-dialog.component';

describe('TeamSignInDialogComponent', () => {
  let component: TeamSignInDialogComponent;
  let fixture: ComponentFixture<TeamSignInDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSignInDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSignInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
