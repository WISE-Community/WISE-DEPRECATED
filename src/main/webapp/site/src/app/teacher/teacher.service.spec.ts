import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { TeacherService } from './teacher.service';

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

  it('should update is locked after end date',
      inject([TeacherService], (service: TeacherService) => {
    const http = TestBed.get(HttpTestingController);
    service.updateIsLockedAfterEndDate(1, true).subscribe(() => {});
    const req = http.expectOne('/api/teacher/run/update/islockedafterenddate');
    expect(req.request.method).toEqual('POST');
    const httpParams = new HttpParams()
        .set('runId', '1')
        .set('isLockedAfterEndDate', 'true');
    expect(req.request.body).toEqual(httpParams);
  }));
});
