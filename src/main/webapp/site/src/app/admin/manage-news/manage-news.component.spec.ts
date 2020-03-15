import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNewsComponent } from './manage-news.component';

describe('ManageNewsComponent', () => {
  let component: ManageNewsComponent;
  let fixture: ComponentFixture<ManageNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageNewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
