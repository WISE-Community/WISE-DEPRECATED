import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from "@angular/core";
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UtilService } from "./services/util.service";
import { configureTestSuite } from 'ng-bullet';

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent { }

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
  let app;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UtilService, useClass: MockUtilService },
        { provide: MediaObserver, useClass: MockObservableMedia },
        { provide: MatDialog, useValue: {
            closeAll: () => {
            }
          }
        }
      ],
      declarations: [ AppComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  });

  it('should create the app', async(() => {
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    expect(app.title).toEqual('app');
  }));
});
