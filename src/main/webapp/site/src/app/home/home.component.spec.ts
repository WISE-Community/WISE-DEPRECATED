import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from './home.component';
import { LibraryModule } from "../modules/library/library.module";
import { LibraryService } from "../services/library.service";
import { SharedModule } from "../modules/shared/shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      imports: [
        BrowserAnimationsModule,
        FlexLayoutModule,
        FormsModule,
        LibraryModule,
        RouterTestingModule,
        SharedModule
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
