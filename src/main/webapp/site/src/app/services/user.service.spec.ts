import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { ConfigService } from "./config.service";

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService,HttpClient,HttpHandler,ConfigService],
    });
  });

  it('should be created', inject([UserService,ConfigService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
