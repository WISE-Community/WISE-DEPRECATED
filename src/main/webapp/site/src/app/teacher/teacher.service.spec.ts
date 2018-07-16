import { TestBed, inject } from '@angular/core/testing';

import { TeacherService } from './teacher.service';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('TeacherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeacherService, HttpClient, HttpHandler]
    });
  });

  it('should be created', inject([TeacherService], (service: TeacherService) => {
    expect(service).toBeTruthy();
  }));
});
