import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

let service: UserService;
let http: HttpTestingController;
export class MockConfigService {}

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, { provide: ConfigService, useClass: MockConfigService }],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });
  unlinkGoogleAccount_postToUrl();
});

function unlinkGoogleAccount_postToUrl() {
  it('unlinkGoogleAccount() should make POST request to unlink google account', fakeAsync(() => {
    const newPassword = 'my new pass';
    service.unlinkGoogleUser(newPassword);
    const unlinkRequest = http.expectOne({
      url: '/api/google-user/unlink-account',
      method: 'POST'
    });
    unlinkRequest.flush({ response: 'success' });
    tick();
  }));
}
