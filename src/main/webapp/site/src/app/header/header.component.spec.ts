import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppRoutingModule } from "../app-routing.module";

import { HeaderComponent } from './header.component';
import { HeaderAccountMenuComponent } from "./header-account-menu/header-account-menu.component";
import { HeaderLinksComponent } from "./header-links/header-links.component";
import { HeaderSigninComponent } from "./header-signin/header-signin.component";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppRoutingModule
      ],
      declarations: [
        HeaderComponent,
        HeaderAccountMenuComponent,
        HeaderLinksComponent,
        HeaderSigninComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
