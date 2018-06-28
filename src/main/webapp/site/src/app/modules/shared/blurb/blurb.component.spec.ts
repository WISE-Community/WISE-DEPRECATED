import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlurbComponent } from './blurb.component';

describe('BlurbComponent', () => {
  let component: BlurbComponent;
  let fixture: ComponentFixture<BlurbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlurbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlurbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
