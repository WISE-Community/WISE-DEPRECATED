import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRunListItemComponent } from './student-run-list-item.component';

describe('StudentRunListItemComponent', () => {
  let component: StudentRunListItemComponent;
  let fixture: ComponentFixture<StudentRunListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentRunListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentRunListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
