import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA, Provider } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MobileMenuComponent } from './mobile-menu.component';
import { User } from '../../domain/user';
import { UserService } from '../../services/user.service';
import { configureTestSuite } from 'ng-bullet';

export class MockUserServiceLogIn {
  getUser(): Observable<User[]> {
    const user: User = new User();
    user.role = 'teacher';
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
}

export class MockUserServiceLogOut {
  getUser(): Observable<User[]> {
    const user: User = null;
    return Observable.create((observer) => {
      observer.next(user);
      observer.complete();
    });
  }
}

describe('MobileMenuComponent', () => {
  let component: MobileMenuComponent;
  let fixture: ComponentFixture<MobileMenuComponent>;

  function createComponent(providers: Provider[] = []) {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MobileMenuComponent],
      providers: [{ provide: UserService, useValue: new MockUserServiceLogIn() }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('when user is logged in', () => {
    configureTestSuite(() => {
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should hide account links when user logs in', () => {
      const accountLinks = fixture.debugElement.query(By.css('#mobileMenuAccountLinks'));
      expect(accountLinks).toBeFalsy();
    });
  });

  describe('when user is logged out', () => {
    configureTestSuite(() => {
      TestBed.overrideProvider(UserService, { useValue: new MockUserServiceLogOut() });
      createComponent();
    });

    it('should show account links when user logs out', () => {
      const accountLinks = fixture.debugElement.query(By.css('#mobileMenuAccountLinks'));
      expect(accountLinks).toBeTruthy();
    });
  });
});
