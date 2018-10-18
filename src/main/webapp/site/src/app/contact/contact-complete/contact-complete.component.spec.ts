import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCompleteComponent } from './contact-complete.component';

describe('ContactCompleteComponent', () => {
  let component: ContactCompleteComponent;
  let fixture: ComponentFixture<ContactCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
