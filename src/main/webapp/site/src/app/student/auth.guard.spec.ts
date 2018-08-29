import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthGuard } from './auth.guard';
import { UserService } from "../services/user.service";
import { HttpClientModule } from "@angular/common/http";
import { RouterTestingModule } from "@angular/router/testing";

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, HttpClientModule, RouterTestingModule ],
      providers: [ AuthGuard, UserService ]
    });
  });

  it('should ...', inject([AuthGuard,UserService], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
