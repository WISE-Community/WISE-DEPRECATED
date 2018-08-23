import { TestBed, inject } from '@angular/core/testing';

import { UtilService } from './util.service';

describe('UtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilService]
    });
  });

  it('should be created', inject([UtilService], (service: UtilService) => {
    expect(service).toBeTruthy();
  }));

  /*
  it('should get the firstname', inject([UtilService], (service: UtilService) => {
    expect(service.getFirstName("Spongebob Squarepants")).toEqual("Spongebob");
  }));

  it('should get the lastname', inject([UtilService], (service: UtilService) => {
    expect(service.getLastName("Spongebob Squarepants")).toEqual("Squarepants");
  }));
  */
});
