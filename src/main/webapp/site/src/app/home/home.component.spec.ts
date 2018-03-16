import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { FlexLayoutModule } from '@angular/flex-layout';

import { HomeComponent } from './home.component';
import { LibraryModule } from "../modules/library/library.module";
import { LibraryService } from "../services/library.service";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      imports: [
        FlexLayoutModule,
        LibraryModule
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
