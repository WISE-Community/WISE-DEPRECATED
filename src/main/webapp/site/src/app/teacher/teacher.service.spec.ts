import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService, { provide: MatDialog, useValue: {} }]
    });
  });

  it('should be created', inject([TeacherService], (service: TeacherService) => {
    expect(service).toBeTruthy();
  }));

  it('should update run end time when it is null', inject(
    [TeacherService],
    (service: TeacherService) => {
      const http = TestBed.get(HttpTestingController);
      service.updateRunEndTime(1, null).subscribe(() => {});
      const req = http.expectOne('/api/teacher/run/update/endtime');
      expect(req.request.method).toEqual('POST');
      const httpParams = new HttpParams().set('runId', '1');
      expect(req.request.body).toEqual(httpParams);
    }
  ));

  it('should update run end time when it is not null', inject(
    [TeacherService],
    (service: TeacherService) => {
      const http = TestBed.get(HttpTestingController);
      const endTime = new Date().getTime();
      service.updateRunEndTime(1, endTime).subscribe(() => {});
      const req = http.expectOne('/api/teacher/run/update/endtime');
      expect(req.request.method).toEqual('POST');
      const httpParams = new HttpParams().set('runId', '1').set('endTime', endTime + '');
      expect(req.request.body).toEqual(httpParams);
    }
  ));

  it('should update is locked after end date', inject(
    [TeacherService],
    (service: TeacherService) => {
      const http = TestBed.get(HttpTestingController);
      service.updateIsLockedAfterEndDate(1, true).subscribe(() => {});
      const req = http.expectOne('/api/teacher/run/update/islockedafterenddate');
      expect(req.request.method).toEqual('POST');
      const httpParams = new HttpParams().set('runId', '1').set('isLockedAfterEndDate', 'true');
      expect(req.request.body).toEqual(httpParams);
    }
  ));
});
