import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginGoogleUserNotFoundComponent } from './login-google-user-not-found.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginGoogleUserNotFoundComponent', () => {
  let component: LoginGoogleUserNotFoundComponent;
  let fixture: ComponentFixture<LoginGoogleUserNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginGoogleUserNotFoundComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginGoogleUserNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
