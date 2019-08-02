import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindUserComponent } from './find-user.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FindUserComponent', () => {
  let component: FindUserComponent;
  let fixture: ComponentFixture<FindUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindUserComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
