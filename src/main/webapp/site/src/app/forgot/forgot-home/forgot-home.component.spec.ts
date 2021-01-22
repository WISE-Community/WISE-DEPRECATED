import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotHomeComponent } from './forgot-home.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

describe('ForgotHomeComponent', () => {
  let component: ForgotHomeComponent;
  let fixture: ComponentFixture<ForgotHomeComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotHomeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the student and teacher options', () => {
    const options = fixture.debugElement.nativeElement.querySelectorAll('app-call-to-action');
    expect(options.length).toBe(2);
    expect(options[0].getAttribute('headline')).toContain('Student');
    expect(options[1].getAttribute('headline')).toContain('Teacher');
  });
});
