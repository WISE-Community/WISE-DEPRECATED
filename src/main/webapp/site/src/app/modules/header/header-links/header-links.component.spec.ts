import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLinksComponent } from './header-links.component';
import { User } from "../../../domain/user";
import { APP_BASE_HREF } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { Component } from "@angular/core";

@Component({selector: 'app-header-signin', template: ''})
class HeaderSignInStubComponent {}

describe('HeaderLinksComponent', () => {
  let component: HeaderLinksComponent;
  let fixture: ComponentFixture<HeaderLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      declarations: [ HeaderLinksComponent, HeaderSignInStubComponent ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLinksComponent);
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
