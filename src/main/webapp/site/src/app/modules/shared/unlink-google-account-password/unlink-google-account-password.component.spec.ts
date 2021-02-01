import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { UnlinkGoogleAccountPasswordComponent } from './unlink-google-account-password.component';

class MockUserService {
  unlinkGoogleUser(newPassword: string) {
    return new Subscription();
  }
}

let component: UnlinkGoogleAccountPasswordComponent;
let fixture: ComponentFixture<UnlinkGoogleAccountPasswordComponent>;
let userService = new MockUserService();

describe('UnlinkGoogleAccountPasswordComponent', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [UnlinkGoogleAccountPasswordComponent],
      imports: [BrowserAnimationsModule, ReactiveFormsModule, MatDialogModule],
      providers: [{ provide: UserService, useValue: userService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(UnlinkGoogleAccountPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  formSubmit_callUserServiceUnlinkGoogleUserFunction();
});

function formSubmit_callUserServiceUnlinkGoogleUserFunction() {
  it('should call UserService.UnlinkGoogleUserFunction when form is submitted', () => {
    const unlinkFunctionSpy = spyOn(userService, 'unlinkGoogleUser').and.returnValue(
      new Subscription()
    );
    const newPassword = 'aloha';
    component.newPasswordFormGroup.setValue({
      newPassword: newPassword,
      confirmNewPassword: newPassword
    });
    component.submit();
    expect(unlinkFunctionSpy).toHaveBeenCalledWith(newPassword);
  });
}
