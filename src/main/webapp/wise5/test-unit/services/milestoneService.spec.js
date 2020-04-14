import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';
let MilestoneService, ProjectService;
const satisfyCriterionSample = {
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
    ki: {
      counts: {1: 2, 2: 0, 3: 1, 4: 0, 5: 0}, 
      scoreSum: 5, 
      scoreCount: 3, 
      average: 1.67
    }
  }
};
const possibleScoresKi = [1,2,3,4,5];
const reportSettingsCustomScoreValuesSample = {
  customScoreValues: {
    ki: [1, 2, 3, 4]
  }
};

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
  adjustKIScore();
  getKIScoreBounds();
  addDataToAggregate();
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
          MilestoneService.isPercentOfScoresNotEqualTo(satisfyCriterionSample, aggregateAutoScoresSample);
      expect(result)
          .toBeTruthy();
    });
    it('should return true when percent of scores equal to value meet threshold', () => {
      const aggregateAutoScores = angular.copy(aggregateAutoScoresSample)
      aggregateAutoScores.xfns1g7pga.ki.counts = {1: 1, 2: 0, 3: 2, 4: 0, 5: 0};
      const result = 
          MilestoneService.isPercentOfScoresNotEqualTo(satisfyCriterionSample, aggregateAutoScores);
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
          MilestoneService.getNotEqualToSum(satisfyCriterionSample, aggregateData, possibleScoresKi);
      expect(result).toBe(2);
    });
  });
}

function getAggregateData() {
  describe('getAggregateData()', () => {
    it('should return the aggregate data', () => {
      const result = MilestoneService.getAggregateData(satisfyCriterionSample, aggregateAutoScoresSample);
      expect(result).toEqual({
        counts: {1: 2, 2: 0, 3: 1, 4: 0, 5: 0}, 
        scoreCount: 3,
        scoreSum: 5,
        average: 1.67
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
          MilestoneService.getAggregateData(satisfyCriterionSample, aggregateAutoScores);
      const sum = 
          MilestoneService.getEqualToSum(satisfyCriterionSample, aggregateData, possibleScoresKi);
      const result = 
          MilestoneService.isPercentThresholdSatisfied(satisfyCriterionSample, aggregateData, sum);
      expect(result).toBeTruthy();
    });
    it('should return false when percent threshold is not satisfied', () => {
      const aggregateData = 
          MilestoneService.getAggregateData(satisfyCriterionSample, aggregateAutoScoresSample);
      const sum = 
          MilestoneService.getEqualToSum(satisfyCriterionSample, aggregateData, possibleScoresKi);
      const result = 
          MilestoneService.isPercentThresholdSatisfied(satisfyCriterionSample, aggregateData, sum);
      expect(result).toBeFalsy();
    });
  });
}

function getSatisfyCriteriaReferencedComponents() {
  describe('getSatisfyCriteriaReferencedComponents()', () => {
    it('should return referenced components', () => {
      const satisfyCriterion = angular.copy(satisfyCriterionSample);
      satisfyCriterion.nodeId = 'node2';
      const projectAchievement = {
        report: {
          templates: [
            {
              satisfyCriteria: [
                satisfyCriterionSample,
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

// TODO: finish
function calculateAggregateAutoScores() {
  describe('calculateAggregateAutoScores()', () => {
    it('should return the aggregate auto scores', () => {
    });
  });
}

function adjustKIScore() {
  describe('adjustKIScore()', () => {
    it('should return the adjusted KI score', () => {
      const value = 5;
      expect(MilestoneService.adjustKIScore(value, reportSettingsCustomScoreValuesSample))
          .toEqual(4);
    });
  });
}

function getKIScoreBounds() {
  describe('getKIScoreBounds()', () => {
    it('should return the KI score bounds', () => {
      expect(MilestoneService.getKIScoreBounds(reportSettingsCustomScoreValuesSample))
          .toEqual({
            min: 1,
            max: 4
          });
    });
  });
}

function addDataToAggregate() {
  describe('addDataToAggregate()', () => {
    it('should add annotation to the aggregate scores and return aggregate', () => {
      const annotation = {
        data: {
          scores: [{
            id: 'ki',
            score: 3
          }]
        }
      };
      const aggregateAutoScore = angular.copy(aggregateAutoScoresSample).xfns1g7pga;
      const result = 
          MilestoneService.addDataToAggregate(aggregateAutoScore, annotation, reportSettingsCustomScoreValuesSample);
      expect(result).toEqual({
          ki: {
            counts: {1: 2, 2: 0, 3: 2, 4: 0, 5: 0}, 
            scoreSum: 8,
            scoreCount: 4,
            average: 2
          }
      });
    });
  });
}
