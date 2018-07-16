import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { SharedModule } from "../shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ BrowserAnimationsModule, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
