import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderLinksComponent } from './header-links.component';
import { User } from '../../../domain/user';
import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

@Component({ selector: 'app-header-signin', template: '' })
class HeaderSignInStubComponent {}

describe('HeaderLinksComponent', () => {
  let component: HeaderLinksComponent;
  let fixture: ComponentFixture<HeaderLinksComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderLinksComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLinksComponent);
    component = fixture.componentInstance;
    const user: User = new User();
    user.id = 1;
    user.firstName = 'Amanda';
    user.lastName = 'Panda';
    user.role = 'student';
    user.username = 'AmandaP0101';
    component.user = user;
    component.location = 'student';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user welcome message', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.header__links').textContent).toContain('Welcome Amanda!');
  });
});
