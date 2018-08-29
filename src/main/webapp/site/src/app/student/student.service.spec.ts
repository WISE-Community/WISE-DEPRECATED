import { StudentService } from './student.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed, inject } from '@angular/core/testing';

describe('StudentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, HttpClientModule ],
      providers: [ StudentService ]
    });
  });

  it('should be created', async(inject([StudentService, HttpTestingController],
    (service: StudentService, backend: HttpTestingController) => {
    expect(service).toBeTruthy();
  })));

});
