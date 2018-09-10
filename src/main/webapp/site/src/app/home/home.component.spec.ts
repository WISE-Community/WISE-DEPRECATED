import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from './home.component';
import { LibraryService } from "../services/library.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material";

@Component({selector: 'app-hero-section', template: ''})
class HeroStubComponent {}

@Component({selector: 'app-blurb', template: ''})
class BlurbStubComponent {}

@Component({selector: 'app-call-to-action', template: ''})
class CallToActionStubComponent {}

@Component({selector: 'app-home-page-project-library', template: ''})
class LibraryStubComponent {}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent, HeroStubComponent, BlurbStubComponent, CallToActionStubComponent, LibraryStubComponent ],
      imports: [
        BrowserAnimationsModule,
        FlexLayoutModule,
        FormsModule,
        RouterTestingModule,
        MatIconModule
      ],
      providers: [
        HttpClient,
        HttpHandler,
        LibraryService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
