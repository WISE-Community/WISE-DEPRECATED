import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginGoogleUserNotFoundComponent } from './login-google-user-not-found.component';
import {
  MatCardModule,
  MatDividerModule
} from "@angular/material";
import { RouterTestingModule } from "@angular/router/testing";

describe('LoginGoogleUserNotFoundComponent', () => {
  let component: LoginGoogleUserNotFoundComponent;
  let fixture: ComponentFixture<LoginGoogleUserNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginGoogleUserNotFoundComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
        MatCardModule,
        MatDividerModule,
      ]
    })
    .compileComponents();
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
