import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMenuComponent } from './select-menu.component';
import { MatFormFieldModule, MatSelectModule, MatOptionModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

describe('SelectMenuComponent', () => {
  let component: SelectMenuComponent;
  let fixture: ComponentFixture<SelectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMenuComponent ],
      imports: [ BrowserAnimationsModule, FormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule ]
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
