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

  it('should get the firstName', inject([UtilService], (service: UtilService) => {
    expect(service.getFirstName('Spongebob Squarepants')).toEqual('Spongebob');
  }));

  it('should get the lastName', inject([UtilService], (service: UtilService) => {
    expect(service.getLastName('Spongebob Squarepants')).toEqual('Squarepants');
  }));

  it('should set and get the mobile menu state', inject([UtilService], (service: UtilService) => {
    service.showMobileMenu();
    expect(service.getMobileMenuState().getValue()).toEqual(true);
  }));

  it('should get the days in the month', inject([UtilService], (service: UtilService) => {
    let daysInMonth = service.getDaysInMonth(1);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(2);
    expect(daysInMonth.length).toBe(29);
    daysInMonth = service.getDaysInMonth(3);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(4);
    expect(daysInMonth.length).toBe(30);
    daysInMonth = service.getDaysInMonth(5);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(6);
    expect(daysInMonth.length).toBe(30);
    daysInMonth = service.getDaysInMonth(7);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(8);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(9);
    expect(daysInMonth.length).toBe(30);
    daysInMonth = service.getDaysInMonth(10);
    expect(daysInMonth.length).toBe(31);
    daysInMonth = service.getDaysInMonth(11);
    expect(daysInMonth.length).toBe(30);
    daysInMonth = service.getDaysInMonth(12);
    expect(daysInMonth.length).toBe(31);
  }));
});
