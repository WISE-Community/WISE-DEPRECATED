import { MilestoneReportDataComponent } from './milestone-report-data.component';

describe('MilestoneReportDataComponent', () => {
  it('#getPercent() should return percentage', () => {
    const comp = new MilestoneReportDataComponent();
    comp.data = { scoreCount: 5 };
    expect(comp.getPercent()).toEqual('100%');
  });

  it('#getScoreValuesCount() should count for current score value', () => {
    const comp = new MilestoneReportDataComponent();
    comp.scoreValues = [5];
    comp.data = {
      average: 4.3333333333333,
      counts: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 },
      scoreCount: 3,
      scoreSum: 13
    };
    expect(comp.getScoreValuesCount()).toEqual(2);
  });
});
