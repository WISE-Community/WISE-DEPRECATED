import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAccountMenuComponent } from './header-account-menu.component';
import { MatMenuModule, MatIconModule, MatDividerModule } from "@angular/material";
import { User } from "../../../domain/user";
import { ConfigService } from "../../../services/config.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { UserService } from "../../../services/user.service";

describe('HeaderAccountMenuComponent', () => {
  let component: HeaderAccountMenuComponent;
  let fixture: ComponentFixture<HeaderAccountMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderAccountMenuComponent ],
      imports: [ MatDividerModule, MatMenuModule, MatIconModule ],
      providers: [ ConfigService, HttpClient, HttpHandler, UserService ]
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
