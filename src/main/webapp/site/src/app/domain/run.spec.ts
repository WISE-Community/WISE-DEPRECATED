import { async } from '@angular/core/testing';
import {Run} from "./run";

describe('Run', () => {
  beforeEach(async(() => {

  }));

  beforeEach(() => {

  });

  it('should create', () => {
    expect(true).toBeTruthy();
  });

  it('should calculate active with no end time', () => {
    const run = new Run({
      startTime: '2019-03-21 8:00:00.0'
    });
    const before = new Date('2019-03-20 8:00:00.0');
    expect(run.isActive(before)).toBeFalsy();
    const after = new Date('2019-03-22 8:00:00.0');
    expect(run.isActive(after)).toBeTruthy();
  });

  it('should calculate active with end time', () => {
    const run = new Run({
      startTime: '2019-03-21 8:00:00.0',
      endTime: '2019-03-23 8:00:00.0'
    });
    const before = new Date('2019-03-20 8:00:00.0');
    expect(run.isActive(before)).toBeFalsy();
    const during = new Date('2019-03-22 8:00:00.0');
    expect(run.isActive(during)).toBeTruthy();
    const after = new Date('2019-03-24 8:00:00.0');
    expect(run.isActive(after)).toBeFalsy();
  });

  it('should calculate completed with no end time', () => {
    const run = new Run({
      startTime: '2019-03-21 8:00:00.0'
    });
    const now = new Date('2019-03-22 8:00:00.0');
    expect(run.isCompleted(now)).toBeFalsy();
  });

  it('should calculate completed with end time', () => {
    const run = new Run({
      startTime: '2019-03-21 8:00:00.0',
      endTime: '2019-03-23 8:00:00.0'
    });
    const before = new Date('2019-03-20 8:00:00.0');
    expect(run.isCompleted(before)).toBeFalsy();
    const during = new Date('2019-03-22 8:00:00.0');
    expect(run.isCompleted(during)).toBeFalsy();
    const after = new Date('2019-03-24 8:00:00.0');
    expect(run.isCompleted(after)).toBeTruthy();
  });

  it('should calculate scheduled', () => {
    const run = new Run({
      startTime: '2019-03-21 8:00:00.0'
    });
    const before = new Date('2019-03-20 8:00:00.0');
    expect(run.isScheduled(before)).toBeTruthy();
    const after = new Date('2019-03-22 8:00:00.0');
    expect(run.isScheduled(after)).toBeFalsy();
  });

});
