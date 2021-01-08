import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotStudentComponent } from './forgot-student.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

describe('ForgotStudentComponent', () => {
  let component: ForgotStudentComponent;
  let fixture: ComponentFixture<ForgotStudentComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotStudentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the username and password options', () => {
    const options = fixture.debugElement.nativeElement.querySelectorAll('app-call-to-action');
    expect(options.length).toBe(2);
    expect(options[0].getAttribute('headline')).toContain('Username');
    expect(options[1].getAttribute('headline')).toContain('Password');
  });
});
