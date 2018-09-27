import { TestBed, inject } from '@angular/core/testing';
import { LibraryService } from './library.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LibraryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ LibraryService ],
      imports: [ HttpClientTestingModule ]
    });
  });

  it('should be created', inject([LibraryService], (service: LibraryService) => {
    expect(service).toBeTruthy();
  }));
});
