import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';
let MilestoneService, ProjectService;
const satisfyCriterionNotEqualTo = {
  percentThreshold: 50,
  targetVariable: 'ki',
  componentId: 'xfns1g7pga',
  function: 'percentOfScoresNotEqualTo',
  id: 'template1SatisfyCriteria0',
  type: 'autoScore',
  nodeId: 'node1',
  value: 3
};
const aggregateAutoScoresSample = {
  xfns1g7pga: {
    ki: {counts: {1: 2, 2: 0, 3: 1, 4: 0, 5: 0}, scoreCount: 3}
  }
};
const possibleScoresKi = [1,2,3,4,5];

describe('UtilService', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((_MilestoneService_, _ProjectService_) => {
    MilestoneService = _MilestoneService_;
    ProjectService = _ProjectService_;
  }));

  getProjectMilestones();
  isPercentOfScoresNotEqualTo();
  getNotEqualToSum();
  getAggregateData();
  getPossibleScores();
  isPercentThresholdSatisfied();
  getSatisfyCriteriaReferencedComponents();
});

function getProjectMilestones() {
  describe('getProjectMilestones()', () => {
    it('should get project milestones when it is not enabled', () => {
      spyOn(ProjectService, 'getAchievements').and.returnValue({ isEnabled: false });
      const milestones = MilestoneService.getProjectMilestones();
      expect(milestones.length).toEqual(0);
    });
    it('should get project milestones when there are milestones', () => {
      const achievements = {
        isEnabled: true,
        items: [
          {
            type: 'milestone'
          },
          {
            type: 'milestoneReport'
          }
        ]
      };
      spyOn(ProjectService, 'getAchievements').and.returnValue(achievements);
      const milestones = MilestoneService.getProjectMilestones();
      expect(milestones.length).toEqual(2);
    });
  });
}

function isPercentOfScoresNotEqualTo() {
  describe('isPercentOfScoresNotEqualTo()', () => {
    it('should return true when percent of scores equal to value are less than threshold', () => {
      const result = 
          MilestoneService.isPercentOfScoresNotEqualTo(satisfyCriterionNotEqualTo, aggregateAutoScoresSample);
      expect(result)
          .toBeTruthy();
    });
    it('should return true when percent of scores equal to value meet threshold', () => {
      const aggregateAutoScores = angular.copy(aggregateAutoScoresSample)
      aggregateAutoScores.xfns1g7pga.ki.counts = {1: 1, 2: 0, 3: 2, 4: 0, 5: 0};
      const result = 
          MilestoneService.isPercentOfScoresNotEqualTo(satisfyCriterionNotEqualTo, aggregateAutoScores);
      expect(result).toBeFalsy();
    });
  });
}

function getNotEqualToSum() {
  describe('getNotEqualToSum()', () => {
    const aggregateData = {
      counts: {1: 2, 2: 0, 3: 1, 4: 0, 5: 0}, 
      scoreCount: 3
    };
    it('should return the sum of scores not equal to value', () => {
      const result = 
          MilestoneService.getNotEqualToSum(satisfyCriterionNotEqualTo, aggregateData, possibleScoresKi);
      expect(result).toBe(2);
    });
  });
}

function getAggregateData() {
  describe('getAggregateData()', () => {
    it('should return the aggregate data', () => {
      const result = MilestoneService.getAggregateData(satisfyCriterionNotEqualTo, aggregateAutoScoresSample);
      expect(result).toEqual({
        counts: {1: 2, 2: 0, 3: 1, 4: 0, 5: 0}, 
        scoreCount: 3
      });
    });
  });
}

function getPossibleScores() {
  describe('getPossibleScores()', () => {
    const aggregateData = {
      counts: {2: 2, 1: 0, 3: 1, 4: 0, 5: 0}
    };
    it('should return the possible scores', () => {
      expect(MilestoneService.getPossibleScores(aggregateData)).toEqual([
        1, 2, 3, 4, 5
      ]);
    });
  });
}

function isPercentThresholdSatisfied() {
  describe('isPercentThresholdSatisfied()', () => {
    it('should return true when percent threshold is satisfied', () => {
      const aggregateAutoScores = {
        xfns1g7pga: {
          ki: {counts: {1: 1, 2: 0, 3: 2, 4: 0, 5: 0}, scoreCount: 3}
        }
      };
      const aggregateData = 
          MilestoneService.getAggregateData(satisfyCriterionNotEqualTo, aggregateAutoScores);
      const sum = 
          MilestoneService.getEqualToSum(satisfyCriterionNotEqualTo, aggregateData, possibleScoresKi);
      const result = 
          MilestoneService.isPercentThresholdSatisfied(satisfyCriterionNotEqualTo, aggregateData, sum);
      expect(result).toBeTruthy();
    });
    it('should return false when percent threshold is not satisfied', () => {
      const aggregateData = 
          MilestoneService.getAggregateData(satisfyCriterionNotEqualTo, aggregateAutoScoresSample);
      const sum = 
          MilestoneService.getEqualToSum(satisfyCriterionNotEqualTo, aggregateData, possibleScoresKi);
      const result = 
          MilestoneService.isPercentThresholdSatisfied(satisfyCriterionNotEqualTo, aggregateData, sum);
      expect(result).toBeFalsy();
    });
  });
}

function getSatisfyCriteriaReferencedComponents() {
  describe('getSatisfyCriteriaReferencedComponents()', () => {
    it('should return referenced components', () => {
      const satisfyCriterion = angular.copy(satisfyCriterionNotEqualTo);
      satisfyCriterion.nodeId = 'node2';
      const projectAchievement = {
        report: {
          templates: [
            {
              satisfyCriteria: [
                satisfyCriterionNotEqualTo,
                satisfyCriterion
              ]
            }
          ]
        }
      };
      expect(MilestoneService.getSatisfyCriteriaReferencedComponents(projectAchievement)).toEqual({
        'node1_xfns1g7pga': {
          nodeId: 'node1',
          componentId: 'xfns1g7pga'
        },
        'node2_xfns1g7pga': {
          nodeId: 'node2',
          componentId: 'xfns1g7pga'
        }
      });
    });
  });
}
