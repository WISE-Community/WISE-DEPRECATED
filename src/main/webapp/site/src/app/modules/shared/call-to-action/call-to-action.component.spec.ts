import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CallToActionComponent } from './call-to-action.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CallToActionComponent', () => {
  let component: CallToActionComponent;
  let fixture: ComponentFixture<CallToActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallToActionComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallToActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
