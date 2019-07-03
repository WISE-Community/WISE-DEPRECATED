import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { AnnouncementComponent } from './announcement.component';
import { configureTestSuite } from 'ng-bullet';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnouncementComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    component.message = 'This is an announcement.';
    component.action = 'Do something';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the message', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('This is an announcement.');
  });

  it('should show the action', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Do something');
  });
});
