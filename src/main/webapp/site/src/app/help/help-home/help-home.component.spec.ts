import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpHomeComponent } from './help-home.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HelpHomeComponent', () => {
  let component: HelpHomeComponent;
  let fixture: ComponentFixture<HelpHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HelpHomeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
