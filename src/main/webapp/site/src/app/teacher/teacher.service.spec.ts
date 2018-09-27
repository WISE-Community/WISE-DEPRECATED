import { TestBed, inject } from '@angular/core/testing';
import { TeacherService } from './teacher.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TeacherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ TeacherService ]
    });
  });

  it('should be created', inject([TeacherService], (service: TeacherService) => {
    expect(service).toBeTruthy();
  }));
});
