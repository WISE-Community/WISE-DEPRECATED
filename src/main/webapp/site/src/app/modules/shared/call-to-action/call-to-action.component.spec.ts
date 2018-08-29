import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CallToActionComponent } from './call-to-action.component';
import { SharedModule } from "../shared.module";
import { RouterTestingModule } from "@angular/router/testing";
import { MatIconModule } from "@angular/material";

describe('CallToActionComponent', () => {
  let component: CallToActionComponent;
  let fixture: ComponentFixture<CallToActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallToActionComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
        MatIconModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallToActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
