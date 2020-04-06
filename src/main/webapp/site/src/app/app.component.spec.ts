import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { UtilService } from './services/util.service';
import { configureTestSuite } from 'ng-bullet';
import { Announcement } from './domain/announcement';
import { ConfigService } from './services/config.service';

@Component({ selector: 'router-outlet', template: '' })
class RouterOutletStubComponent {}

export class MockConfigService {
  getAnnouncement(): Observable<Announcement> {
    return Observable.create(observer => {
      const announcement: Announcement = new Announcement();
      announcement.visible = true;
      observer.next(announcement);
      observer.complete();
    });
  }
}

export class MockUtilService {
  getMobileMenuState(): Observable<boolean> {
    return Observable.create(observer => {
      const state: boolean = false;
      observer.next(state);
      observer.complete();
    });
  }
}

export class MockObservableMedia {
  isActive(query: string): boolean {
    return false;
  }

  asObservable(): Observable<MediaChange> {
    return Observable.create(observer => {
      observer.next(new MediaChange());
      observer.complete();
    });
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useClass: MockConfigService },
        { provide: UtilService, useClass: MockUtilService },
        { provide: MediaObserver, useClass: MockObservableMedia }
      ],
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    expect(component.title).toEqual('app');
  }));

  it(`should show announcement banner and hide when dismissed`, async(() => {
    component.hasAnnouncement = true;
    fixture.detectChanges();
    const shadowRoot: DocumentFragment = fixture.debugElement.nativeElement;
    expect(shadowRoot.querySelector('app-announcement')).toBeTruthy();
    component.dismissAnnouncement();
    fixture.detectChanges();
    expect(shadowRoot.querySelector('app-announcement')).toBeFalsy();
  }));
});
