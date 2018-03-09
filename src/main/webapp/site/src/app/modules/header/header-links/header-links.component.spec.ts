import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLinksComponent } from './header-links.component';
import {HeaderSigninComponent} from "../header-signin/header-signin.component";
import { RouterTestingModule } from '@angular/router/testing';
import {User} from "../../../domain/user";

describe('HeaderLinksComponent', () => {
  let component: HeaderLinksComponent;
  let fixture: ComponentFixture<HeaderLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [ HeaderLinksComponent, HeaderSigninComponent ],
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
