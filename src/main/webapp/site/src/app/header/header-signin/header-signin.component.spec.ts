import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSigninComponent } from './header-signin.component';

describe('HeaderSigninComponent', () => {
  let component: HeaderSigninComponent;
  let fixture: ComponentFixture<HeaderSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSigninComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
