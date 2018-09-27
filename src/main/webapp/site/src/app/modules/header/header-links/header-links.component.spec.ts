import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderLinksComponent } from './header-links.component';
import { User } from "../../../domain/user";
import { Component } from "@angular/core";
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({selector: 'app-header-signin', template: ''})
class HeaderSignInStubComponent {}

describe('HeaderLinksComponent', () => {
  let component: HeaderLinksComponent;
  let fixture: ComponentFixture<HeaderLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderLinksComponent ],
      imports: [ ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
    component.location = 'student';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user welcome message', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.mat-subheading-2').textContent)
      .toContain('Welcome Amanda!');
  });
});
