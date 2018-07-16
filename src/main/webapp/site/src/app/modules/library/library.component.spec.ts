import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { LibraryComponent } from './library.component';
import { LibraryModule } from "./library.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule, LibraryModule ],
      declarations: [],
      providers: [
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
