import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { UserService } from "../services/user.service";
import { HttpClientModule } from "@angular/common/http";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConfigService } from "../services/config.service";

describe('TeacherAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, HttpClientModule, RouterTestingModule],
      providers: [AuthGuard,UserService,ConfigService]
    });
  });

  it('should create', inject([AuthGuard,UserService,ConfigService], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

});
