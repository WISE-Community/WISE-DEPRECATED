import { TestBed, inject } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { UserService } from '../services/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '../services/config.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

export class MockUserService {}

export class MockConfigService {}

describe('TeacherAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: UserService, useClass: MockUserService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should create', inject([AuthGuard, UserService, ConfigService], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
