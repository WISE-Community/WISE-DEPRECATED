import { TestBed, inject } from '@angular/core/testing';

import { ConfigService } from './config.service';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { UserService } from "./user.service";

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService, HttpClient, HttpHandler]
    });
  });

  it('should be created', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy();
  }));
});
