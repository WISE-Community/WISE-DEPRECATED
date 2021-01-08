import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderSigninComponent } from './header-signin.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderSigninComponent', () => {
  let component: HeaderSigninComponent;
  let fixture: ComponentFixture<HeaderSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderSigninComponent],
      imports: [],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
