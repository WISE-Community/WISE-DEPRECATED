import { async, TestBed, inject } from '@angular/core/testing';
import { StudentService } from './student.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StudentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentService],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should be created', async(
    inject(
      [StudentService, HttpTestingController],
      (service: StudentService, backend: HttpTestingController) => {
        expect(service).toBeTruthy();
      }
    )
  ));
});
