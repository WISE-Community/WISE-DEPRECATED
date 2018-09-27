import { TestBed, inject } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from "./config.service";

export class MockConfigService {

}

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ConfigService, useClass: MockConfigService }
      ],
      imports: [ HttpClientTestingModule ]
    });
  });

  it('should be created', inject([UserService,ConfigService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
