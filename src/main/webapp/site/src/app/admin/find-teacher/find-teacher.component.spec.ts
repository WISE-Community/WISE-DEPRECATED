import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTeacherComponent } from './find-teacher.component';

describe('FindTeacherComponent', () => {
  let component: FindTeacherComponent;
  let fixture: ComponentFixture<FindTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
