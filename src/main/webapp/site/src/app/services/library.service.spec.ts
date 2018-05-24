import { TestBed, inject } from '@angular/core/testing';

import { LibraryService } from './library.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('LibraryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LibraryService,HttpClient,HttpHandler],
    });
  });

  it('should be created', inject([LibraryService], (service: LibraryService) => {
    expect(service).toBeTruthy();
  }));
});
