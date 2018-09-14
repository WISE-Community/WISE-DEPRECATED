import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAccountMenuComponent } from './header-account-menu.component';
import { User } from "../../../domain/user";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import {
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule
} from "@angular/material";
import { FormsModule } from "@angular/forms";
import { ConfigService } from "../../../services/config.service";
import { UserService } from "../../../services/user.service";

describe('HeaderAccountMenuComponent', () => {
  let component: HeaderAccountMenuComponent;
  let fixture: ComponentFixture<HeaderAccountMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderAccountMenuComponent ],
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        RouterTestingModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        ConfigService,
        UserService,
        HttpClient,
        HttpHandler
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderAccountMenuComponent);
    component = fixture.componentInstance;
    const user: User = new User();
    user.id = 1;
    user.firstName = "Amanda";
    user.lastName = "Panda";
    user.role = "student";
    user.userName = "AmandaP0101";
    component.user = user;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
