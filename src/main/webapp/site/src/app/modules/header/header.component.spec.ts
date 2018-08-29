import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { APP_BASE_HREF } from "@angular/common";
import { UserService } from "../../services/user.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { HeaderModule } from "./header.module";
import { Component, Input } from "@angular/core";
import { User } from "../../domain/user";
import { MatIconModule, MatToolbarModule } from "@angular/material";
import { RouterTestingModule } from "@angular/router/testing";

@Component({selector: 'app-header-links', template: ''})
class HeaderLinksStubComponent {
  @Input()
  user: User

  @Input()
  location: string;
}

@Component({selector: 'app-header-account-menu', template: ''})
class HeaderAccountMenuStubComponent {
  @Input()
  user: User
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatIconModule, MatToolbarModule, RouterTestingModule ],
      declarations: [ HeaderComponent, HeaderLinksStubComponent, HeaderAccountMenuStubComponent ],
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
