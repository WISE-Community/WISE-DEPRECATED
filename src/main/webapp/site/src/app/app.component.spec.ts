import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from "@angular/core";
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent { }

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [ AppComponent ],
      imports: [ RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));
});
