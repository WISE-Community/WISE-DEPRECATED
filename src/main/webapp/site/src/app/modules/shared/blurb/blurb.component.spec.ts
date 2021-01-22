import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlurbComponent } from './blurb.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BlurbComponent', () => {
  let component: BlurbComponent;
  let fixture: ComponentFixture<BlurbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlurbComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
