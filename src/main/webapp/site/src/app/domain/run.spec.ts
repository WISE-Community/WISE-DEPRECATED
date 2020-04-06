import { async } from '@angular/core/testing';
import { Run } from './run';

describe('Run', () => {
  beforeEach(async(() => {}));

  it('should create', () => {
    expect(true).toBeTruthy();
  });

  it('should calculate active with no end time', () => {
    const run = new Run({
      startTime: new Date('2019-03-21T08:00:00.0').getTime()
    });
    const before = new Date('2019-03-20T08:00:00.0').getTime();
    expect(run.isActive(before)).toBeFalsy();
    const after = new Date('2019-03-22T08:00:00.0').getTime();
    expect(run.isActive(after)).toBeTruthy();
  });

  it('should calculate active with end time', () => {
    const run = new Run({
      startTime: new Date('2019-03-21T08:00:00.0').getTime(),
      endTime: new Date('2019-03-23T08:00:00.0').getTime()
    });
    const before = new Date('2019-03-20T08:00:00.0').getTime();
    expect(run.isActive(before)).toBeFalsy();
    const during = new Date('2019-03-22T08:00:00.0').getTime();
    expect(run.isActive(during)).toBeTruthy();
    const after = new Date('2019-03-24T08:00:00.0').getTime();
    expect(run.isActive(after)).toBeFalsy();
  });

  it('should calculate completed with no end time', () => {
    const run = new Run({
      startTime: new Date('2019-03-21T08:00:00.0').getTime()
    });
    const now = new Date('2019-03-22T08:00:00.0').getTime();
    expect(run.isCompleted(now)).toBeFalsy();
  });

  it('should calculate completed with end time', () => {
    const run = new Run({
      startTime: new Date('2019-03-21T08:00:00.0').getTime(),
      endTime: new Date('2019-03-23T08:00:00.0').getTime()
    });
    const before = new Date('2019-03-20T08:00:00.0').getTime();
    expect(run.isCompleted(before)).toBeFalsy();
    const during = new Date('2019-03-22T08:00:00.0').getTime();
    expect(run.isCompleted(during)).toBeFalsy();
    const after = new Date('2019-03-24T08:00:00.0').getTime();
    expect(run.isCompleted(after)).toBeTruthy();
  });

  it('should calculate scheduled', () => {
    const run = new Run({
      startTime: new Date('2019-03-21T08:00:00.0').getTime()
    });
    const before = new Date('2019-03-20T08:00:00.0').getTime();
    expect(run.isScheduled(before)).toBeTruthy();
    const after = new Date('2019-03-22T08:00:00.0').getTime();
    expect(run.isScheduled(after)).toBeFalsy();
  });
});
