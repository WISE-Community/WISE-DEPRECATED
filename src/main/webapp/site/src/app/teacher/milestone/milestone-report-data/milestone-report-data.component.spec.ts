import { MilestoneReportDataComponent } from './milestone-report-data.component';

let comp: any = null;
const nodeId1: string = 'node1';
const nodeId2: string = 'node2';
const componentId1: string = 'component1';
const componentId2: string = 'component2';
const counts1: any = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 0 };
const counts2: any = { 1: 0, 2: 0, 3: 0, 4: 2, 5: 0 };
const average1: number = 3.5;
const average2: number = 4;
const scoreCount1: number = 2;
const scoreCount2: number = 2;
const scoreSum1: number = 7;
const scoreSum2: number = 8;
const stepTitle1: string = '1.1: Milestone Step 1';
const stepTitle2: string = '1.2: Milestone Step 2';
const componentData1: any = createComponentData(
  nodeId1,
  componentId1,
  counts1,
  average1,
  scoreCount1,
  scoreSum1,
  stepTitle1
);
const componentData2: any = createComponentData(
  nodeId2,
  componentId2,
  counts2,
  average2,
  scoreCount2,
  scoreSum2,
  stepTitle2
);

describe('MilestoneReportDataComponent', () => {
  beforeEach(() => {
    comp = new MilestoneReportDataComponent();
    comp.data = [componentData1, componentData2];
  });

  getPercent();
  getCount();
  getAverage();
  getScoreValuesCount();
  getComponentData();
});

function getPercent(): void {
  it('getPercent() should return percentage', () => {
    expect(comp.getPercent()).toEqual('100%');
  });
}

function getCount(): void {
  it('getCount() should get the count when scoreValues is not specified', () => {
    expect(comp.getCount()).toEqual(2);
  });

  it('getCount() should get the count when scoreValues is specified', () => {
    comp.scoreValues = [5];
    expect(comp.getCount()).toEqual(0);
  });
}

function getAverage(): void {
  it('getAverage() should get the average', () => {
    expect(comp.getAverage()).toEqual(4);
  });
}

function getScoreValuesCount(): void {
  it('getScoreValuesCount() should get the count for the specified score value', () => {
    comp.scoreValues = [4];
    expect(comp.getScoreValuesCount()).toEqual(2);
  });
}

function getComponentData(): void {
  it(`getComponentData() should get the last component data if nodeId and componentId are not
      specified`, () => {
    expect(comp.getComponentData()).toEqual(componentData2);
  });

  it(`getComponentData() should get the component data if nodeId and componentId are
      specified`, () => {
    comp.nodeId = nodeId1;
    comp.componentId = componentId1;
    expect(comp.getComponentData()).toEqual(componentData1);
  });
}

function createComponentData(
  nodeId: string,
  componentId: string,
  counts: any,
  average: number,
  scoreCount: number,
  scoreSum: number,
  stepTitle: string
): any {
  return {
    nodeId: nodeId,
    componentId: componentId,
    average: average,
    counts: counts,
    scoreCount: scoreCount,
    scoreSum: scoreSum,
    stepTitle: stepTitle
  };
}
