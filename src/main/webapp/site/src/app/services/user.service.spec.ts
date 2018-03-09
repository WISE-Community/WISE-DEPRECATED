import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService,HttpClient,HttpHandler],
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
