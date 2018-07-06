import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectMenuComponent } from './select-menu.component';
import { SharedModule } from "../shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('SelectMenuComponent', () => {
  let component: SelectMenuComponent;
  let fixture: ComponentFixture<SelectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ BrowserAnimationsModule, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
