import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AnnouncementComponent } from './announcement.component';
import { configureTestSuite } from 'ng-bullet';
import { Announcement } from '../domain/announcement';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [AnnouncementComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            closeAll: () => {}
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the banner text and button', () => {
    component.announcement = new Announcement();
    component.announcement.visible = true;
    component.announcement.bannerText = 'This is an announcement.';
    component.announcement.bannerButton = 'Do something';
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('This is an announcement.');
    expect(compiled.textContent).toContain('Do something');
  });

  it('should emit dismiss event on dismiss button click', async () => {
    spyOn(component.doDismiss, 'emit');
    const dismissButton = fixture.debugElement.query(By.css('.announcement__dismiss'))
      .nativeElement;
    dismissButton.click();
    fixture.detectChanges();
    expect(component.doDismiss.emit).toHaveBeenCalled();
  });
});
