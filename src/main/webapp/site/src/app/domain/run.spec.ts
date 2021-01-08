import { async } from '@angular/core/testing';
import { Run } from './run';

describe('Run', () => {
  const run = new Run({
    startTime: new Date('2019-03-21T08:00:00.0').getTime()
  });
  const beforeStartTime = new Date('2019-03-20T08:00:00.0').getTime();
  const betweenStartAndEndTimes = new Date('2019-03-22T08:00:00.0').getTime();
  const endTime = new Date('2019-03-23T08:00:00.0').getTime();
  const afterEndTime = new Date('2019-03-24T08:00:00.0').getTime();

  function expectRun(func, timeNow, expectedValue) {
    expect(run[func](timeNow)).toEqual(expectedValue);
  }

  it('should calculate active', () => {
    expectRun('isActive', beforeStartTime, false);
    expectRun('isActive', betweenStartAndEndTimes, true);
    run.endTime = endTime;
    expectRun('isActive', beforeStartTime, false);
    expectRun('isActive', betweenStartAndEndTimes, true);
    expectRun('isActive', afterEndTime, false);
  });

  it('should calculate completed', () => {
    expect(run.isCompleted(betweenStartAndEndTimes)).toBeFalsy();
    run.endTime = endTime;
    expectRun('isCompleted', beforeStartTime, false);
    expectRun('isCompleted', betweenStartAndEndTimes, false);
    expectRun('isCompleted', afterEndTime, true);
  });

  it('should calculate scheduled', () => {
    expectRun('isScheduled', beforeStartTime, true);
    expectRun('isScheduled', betweenStartAndEndTimes, false);
  });
});
