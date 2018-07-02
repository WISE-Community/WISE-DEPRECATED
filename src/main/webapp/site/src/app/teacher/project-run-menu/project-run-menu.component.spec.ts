import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRunMenuComponent } from './project-run-menu.component';

describe('ProjectRunMenuComponent', () => {
  let component: ProjectRunMenuComponent;
  let fixture: ComponentFixture<ProjectRunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectRunMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRunMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
