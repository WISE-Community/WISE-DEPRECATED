import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material';

import { CallToActionComponent } from './call-to-action.component';

describe('CallToActionComponent', () => {
  let component: CallToActionComponent;
  let fixture: ComponentFixture<CallToActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallToActionComponent ],
      imports: [ MatIconModule, RouterTestingModule ]
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
