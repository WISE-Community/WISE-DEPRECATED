import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyComponent } from './privacy.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacyComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
