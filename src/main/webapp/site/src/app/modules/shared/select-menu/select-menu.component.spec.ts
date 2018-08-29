import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectMenuComponent } from './select-menu.component';
import { SharedModule } from "../shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatFormFieldModule, MatSelectModule } from "@angular/material";
import { ReactiveFormsModule } from "@angular/forms";

describe('SelectMenuComponent', () => {
  let component: SelectMenuComponent;
  let fixture: ComponentFixture<SelectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMenuComponent ],
      imports: [ BrowserAnimationsModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule ]
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
