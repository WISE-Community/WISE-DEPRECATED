import { StudentService } from './student.service';
import { Injector} from '@angular/core';
import { HttpClientModule, HttpRequest, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, tick, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions, } from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';

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
