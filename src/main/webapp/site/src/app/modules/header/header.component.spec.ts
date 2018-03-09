import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppRoutingModule } from "../../app-routing.module";

import { MatDividerModule, MatMenuModule, MatIconModule, MatToolbarModule } from "@angular/material";
import { HeaderComponent } from './header.component';
import { HeaderAccountMenuComponent } from "./header-account-menu/header-account-menu.component";
import { HeaderLinksComponent } from "./header-links/header-links.component";
import { HeaderSigninComponent } from "./header-signin/header-signin.component";
import { APP_BASE_HREF } from "@angular/common";
import { UserService } from "../../services/user.service";
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppRoutingModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule
      ],
      declarations: [
        HeaderComponent,
        HeaderAccountMenuComponent,
        HeaderLinksComponent,
        HeaderSigninComponent
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        HttpClient,
        HttpHandler,
        UserService
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
