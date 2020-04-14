import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';
let AchievementService,
  ConfigService,
  MilestoneService,
  ProjectService,
  TeacherDataService,
  UtilService;

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
      counts: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0 },
      scoreSum: 5,
      scoreCount: 3,
      average: 1.67
    }
  }
};
const possibleScoresKi = [1, 2, 3, 4, 5];
const reportSettingsCustomScoreValuesSample = {
  customScoreValues: {
    ki: [1, 2, 3, 4]
  }
};

describe('UtilService', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((
    _AchievementService_,
    _ConfigService_,
    _MilestoneService_,
    _ProjectService_,
    _TeacherDataService_,
    _UtilService_
  ) => {
    AchievementService = _AchievementService_;
    ConfigService = _ConfigService_;
    MilestoneService = _MilestoneService_;
    ProjectService = _ProjectService_;
    TeacherDataService = _TeacherDataService_;
    UtilService = _UtilService_;
  }));

  getProjectMilestones();
  getProjectMilestoneReports();
  getMilestoneReportByNodeId();
  getProjectMilestoneStatus();
  insertMilestoneItems();
  insertMilestoneCompletion();
  setWorkgroupsInCurrentPeriod();
  insertMilestoneReport();
  getReferencedComponent();
  isCompletionReached();
  generateReport();
  chooseTemplate();
  isTemplateMatch();
  isTemplateCriterionSatisfied();
  isPercentOfScoresGreaterThan();
  getGreaterThanSum();
  isPercentOfScoresGreaterThanOrEqualTo();
  getGreaterThanOrEqualToSum();
  isPercentOfScoresLessThan();
  getLessThanSum();
  isPercentOfScoresLessThanOrEqualTo();
  getLessThanOrEqualToSum();
  isPercentOfScoresEqualTo();
  getEqualToSum();
  isPercentOfScoresNotEqualTo();
  getNotEqualToSum();
  getAggregateData();
  getPossibleScores();
  isPercentThresholdSatisfied();
  getSatisfyCriteriaReferencedComponents();
  adjustKIScore();
  getKIScoreBounds();
  addDataToAggregate();
  setupAggregateSubScore();
  getCustomScoreValueCounts();
  getPossibleScoreValueCounts();
  processMilestoneGraphsAndData();
  setReportAvailable();
  saveMilestone();
  createMilestone();
  deleteMilestone();
  clearTempFields();
});

function createScoreCounts(counts) {
  const countsObject = {};
  for (let c = 0; c < counts.length; c++) {
    countsObject[c + 1] = counts[c];
  }
  return countsObject;
}

function createSatisfyCriteria(nodeId, componentId, targetVariable, func, value, percentThreshold) {
  return {
    nodeId: nodeId,
    componentId: componentId,
    targetVariable: targetVariable,
    function: func,
    value: value,
    percentThreshold: percentThreshold
  };
}

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

function getProjectMilestoneReports() {
  describe('getProjectMilestoneReports()', () => {
    it('should get project milestone reports', () => {
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
      const milestoneReports = MilestoneService.getProjectMilestoneReports();
      expect(milestoneReports.length).toEqual(1);
    });
  });
}

function getMilestoneReportByNodeId() {
  describe('getMilestoneReportByNodeId()', () => {
    it('should get project milestone report by node id when there is none', () => {
      const achievements = {
        isEnabled: true,
        items: [
          {
            id: 'milestone1',
            type: 'milestone',
            report: {
              templates: [
                {
                  satisfyCriteria: [
                    {
                      nodeId: 'node1',
                      componentId: 'component1'
                    }
                  ]
                }
              ]
            }
          }
        ]
      };
      spyOn(ProjectService, 'getAchievements').and.returnValue(achievements);
      const milestoneReport = MilestoneService.getMilestoneReportByNodeId('node2');
      expect(milestoneReport).toBeNull();
    });
    it('should get project milestone report by node id when there is one', () => {
      const achievements = {
        isEnabled: true,
        items: [
          {
            id: 'milestone1',
            type: 'milestone',
            report: {
              templates: [
                {
                  satisfyCriteria: [
                    {
                      nodeId: 'node1',
                      componentId: 'component1'
                    }
                  ]
                }
              ]
            }
          }
        ]
      };
      spyOn(ProjectService, 'getAchievements').and.returnValue(achievements);
      const milestoneReport = MilestoneService.getMilestoneReportByNodeId('node1');
      expect(milestoneReport).toBeDefined();
    });
  });
}

function getProjectMilestoneStatus() {
  describe('getProjectMilestoneStatus()', () => {
    it('should get project milestone status', () => {
      const milestoneId = 'milestone1';
      const content = 'template1Content';
      const milestone = {
        id: milestoneId,
        report: {
          templates: [
            {
              id: 'template1',
              satisfyConditional: 'any',
              satisfyCriteria: [
                createSatisfyCriteria(
                  'node1',
                  'component1',
                  'ki',
                  'percentOfScoresLessThanOrEqualTo',
                  3,
                  50
                )
              ],
              content: content
            }
          ]
        }
      };
      const achievements = {
        milestone1: [
          createStudentAchievement('milestone1', 1000, 1),
          createStudentAchievement('milestone1', 1000, 2),
          createStudentAchievement('milestone1', 1000, 3),
          createStudentAchievement('milestone1', 1000, 4),
          createStudentAchievement('milestone1', 1000, 5)
        ]
      };
      spyOn(AchievementService, 'getAchievementIdToStudentAchievementsMappings').and.returnValue(
        achievements
      );
      spyOn(ConfigService, 'getDisplayUsernamesByWorkgroupId').and.returnValue('student');
      spyOn(TeacherDataService, 'getCurrentPeriod').and.returnValue(1);
      spyOn(ProjectService, 'getAchievementByAchievementId').and.returnValue(milestone);
      const milestoneStatus = MilestoneService.getProjectMilestoneStatus(milestoneId);
      expect(milestoneStatus.items).toBeDefined();
      expect(milestoneStatus.numberOfStudentsCompleted).toBeDefined();
      expect(milestoneStatus.numberOfStudentsInRun).toBeDefined();
      expect(milestoneStatus.percentageCompleted).toBeDefined();
    });
  });
}

function insertMilestoneItems() {
  describe('insertMilestoneItems()', () => {
    it('should insert milestone items', () => {
      const milestone = {
        params: {
          nodeIds: ['node1', 'node2']
        }
      };
      ProjectService.idToOrder = {
        node1: {},
        node2: {},
        node3: {}
      };
      MilestoneService.insertMilestoneItems(milestone);
      expect(milestone.items['node1'].checked).toEqual(true);
      expect(milestone.items['node2'].checked).toEqual(true);
      expect(milestone.items['node3'].checked).toBeUndefined();
    });
  });
}

function insertMilestoneCompletion() {
  describe('insertMilestoneCompletion()', () => {
    it('should insert milestone completion', () => {
      const content = 'template1Content';
      const milestone = {
        id: 'milestone1',
        report: {
          templates: [
            {
              id: 'template1',
              satisfyConditional: 'any',
              satisfyCriteria: [
                createSatisfyCriteria(
                  'node1',
                  'component1',
                  'ki',
                  'percentOfScoresLessThanOrEqualTo',
                  3,
                  50
                )
              ],
              content: content
            }
          ]
        }
      };
      const achievements = {
        milestone1: [
          createStudentAchievement('milestone1', 1000, 1),
          createStudentAchievement('milestone1', 1000, 2),
          createStudentAchievement('milestone1', 1000, 3),
          createStudentAchievement('milestone1', 1000, 4),
          createStudentAchievement('milestone1', 1000, 5)
        ]
      };
      spyOn(AchievementService, 'getAchievementIdToStudentAchievementsMappings').and.returnValue(
        achievements
      );
      spyOn(ConfigService, 'getDisplayUsernamesByWorkgroupId').and.returnValue('student');
      MilestoneService.workgroupIds = [1, 2, 3, 4, 5];
      MilestoneService.insertMilestoneCompletion(milestone);
      expect(milestone.numberOfStudentsCompleted).toEqual(5);
    });
  });
}

function createStudentAchievement(achievementId, achievementTime, workgroupId) {
  return {
    achievementId: achievementId,
    achievementTime: achievementTime,
    workgroupId: workgroupId
  };
}

function insertMilestoneReport() {
  describe('insertMilestoneReport()', () => {
    it('should insert milestone report', () => {
      const content = 'template1Content';
      const milestone = {
        report: {
          templates: [
            {
              id: 'template1',
              satisfyConditional: 'any',
              satisfyCriteria: [
                createSatisfyCriteria(
                  'node1',
                  'component1',
                  'ki',
                  'percentOfScoresLessThanOrEqualTo',
                  3,
                  50
                )
              ],
              content: content
            }
          ]
        },
        percentageCompleted: 60,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 4,
        satisfyMinNumWorkgroups: 2
      };
      const aggregateAutoScores = {
        ki: {
          counts: createScoreCounts([10, 10, 10, 10, 10]),
          scoreCount: 50
        }
      };
      spyOn(MilestoneService, 'calculateAggregateAutoScores').and.returnValue(aggregateAutoScores);
      MilestoneService.insertMilestoneReport(milestone);
      expect(milestone.isReportAvailable).toEqual(true);
      expect(milestone.generatedReport).toEqual(content);
    });
  });
}

function setWorkgroupsInCurrentPeriod() {
  describe('setWorkgroupsInCurrentPeriod()', () => {
    it('should set workgroups in current period', () => {
      spyOn(ConfigService, 'getClassmateWorkgroupIds').and.returnValue([1, 2, 3]);
      spyOn(ConfigService, 'getPeriodIdByWorkgroupId').and.returnValue(1);
      MilestoneService.periodId = 1;
      MilestoneService.setWorkgroupsInCurrentPeriod();
      expect(MilestoneService.numberOfStudentsInRun).toEqual(3);
      expect(MilestoneService.workgroupIds[0]).toEqual(1);
      expect(MilestoneService.workgroupIds[1]).toEqual(2);
      expect(MilestoneService.workgroupIds[2]).toEqual(3);
    });
  });
}

function getReferencedComponent() {
  describe('getReferencedComponent()', () => {
    it('should get referenced component', () => {
      const milestone = {
        report: {
          templates: [
            {
              satisfyCriteria: [
                createSatisfyCriteria('node1', 'component1'),
                createSatisfyCriteria('node2', 'component2')
              ]
            },
            {
              satisfyCriteria: [
                createSatisfyCriteria('node1', 'component1'),
                createSatisfyCriteria('node3', 'component3')
              ]
            }
          ]
        }
      };
      const referencedComponent = MilestoneService.getReferencedComponent(milestone);
      expect(referencedComponent).toEqual({ nodeId: 'node3', componentId: 'component3' });
    });
  });
}

function isCompletionReached() {
  describe('isCompletionReached()', () => {
    it('should check is completion reached percent false and num students false', () => {
      const projectAchievement = {
        percentageCompleted: 25,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 2,
        satisfyMinNumWorkgroups: 4
      };
      expect(MilestoneService.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached percent true and num students false', () => {
      const projectAchievement = {
        percentageCompleted: 60,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 2,
        satisfyMinNumWorkgroups: 4
      };
      expect(MilestoneService.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached percent false and num students false', () => {
      const projectAchievement = {
        percentageCompleted: 25,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 6,
        satisfyMinNumWorkgroups: 4
      };
      expect(MilestoneService.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached perecent true and num students true', () => {
      const projectAchievement = {
        percentageCompleted: 60,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 6,
        satisfyMinNumWorkgroups: 4
      };
      expect(MilestoneService.isCompletionReached(projectAchievement)).toEqual(true);
    });
  });
}

function generateReport() {
  it('should generate report', () => {
    const content = 'template1Content';
    const projectAchievement = {
      report: {
        templates: [
          {
            id: 'template1',
            satisfyConditional: 'any',
            satisfyCriteria: [
              createSatisfyCriteria(
                'node1',
                'component1',
                'ki',
                'percentOfScoresLessThanOrEqualTo',
                3,
                50
              )
            ],
            content: content
          }
        ]
      }
    };
    const aggregateAutoScores = {
      ki: {
        counts: createScoreCounts([10, 10, 10, 10, 10]),
        scoreCount: 50
      }
    };
    spyOn(MilestoneService, 'calculateAggregateAutoScores').and.returnValue(aggregateAutoScores);
    const report = MilestoneService.generateReport(projectAchievement);
    expect(report.content).toEqual(content);
  });
}

function chooseTemplate() {
  describe('chooseTemplate()', () => {
    it('should choose template', () => {
      const template1 = {
        id: 'template-1'
      };
      const template2 = {
        id: 'template-2'
      };
      const templates = [template1, template2];
      const aggregateAutoScores = {};
      spyOn(MilestoneService, 'isTemplateMatch').and.callFake((template, aggregateAutoScores) => {
        if (template.id === 'template-1') {
          return false;
        } else if (template.id === 'template-2') {
          return true;
        }
      });
      expect(MilestoneService.chooseTemplate(templates, aggregateAutoScores)).toEqual(template2);
    });
  });
}

function isTemplateMatch() {
  describe('isTemplateMatch()', () => {
    it('should check is template match with all conditional false', () => {
      const template = {
        satisfyConditional: 'all',
        satisfyCriteria: [
          {
            id: 'satisfy-criteria-1'
          },
          {
            id: 'satisfy-criteria-2'
          }
        ]
      };
      const aggregateAutoScores = {};
      spyOn(MilestoneService, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(MilestoneService.isTemplateMatch(template, aggregateAutoScores)).toEqual(false);
    });
    it('should check is template match with all conditional true', () => {
      const template = {
        satisfyConditional: 'all',
        satisfyCriteria: [
          {
            id: 'satisfy-criteria-1'
          },
          {
            id: 'satisfy-criteria-2'
          }
        ]
      };
      const aggregateAutoScores = {};
      spyOn(MilestoneService, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return true;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(MilestoneService.isTemplateMatch(template, aggregateAutoScores)).toEqual(true);
    });
    it('should check is template match with any conditional false', () => {
      const template = {
        satisfyConditional: 'any',
        satisfyCriteria: [
          {
            id: 'satisfy-criteria-1'
          },
          {
            id: 'satisfy-criteria-2'
          }
        ]
      };
      const aggregateAutoScores = {};
      spyOn(MilestoneService, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return false;
          }
        }
      );
      expect(MilestoneService.isTemplateMatch(template, aggregateAutoScores)).toEqual(false);
    });
    it('should check is template match with any conditional true', () => {
      const template = {
        satisfyConditional: 'any',
        satisfyCriteria: [
          {
            id: 'satisfy-criteria-1'
          },
          {
            id: 'satisfy-criteria-2'
          }
        ]
      };
      const aggregateAutoScores = {};
      spyOn(MilestoneService, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(MilestoneService.isTemplateMatch(template, aggregateAutoScores)).toEqual(true);
    });
  });
}

function isTemplateCriterionSatisfied() {
  it('should check is template criterion satisfied false', () => {
    const satisfyCriterion = {
      function: 'percentOfScoresGreaterThan',
      componentId: 'component1',
      targetVariable: 'ki',
      value: 3,
      percentThreshold: 50
    };
    const aggregateAutoScores = {
      component1: {
        ki: {
          counts: createScoreCounts([10, 10, 10, 10, 10]),
          scoreCount: 50
        }
      }
    };
    expect(
      MilestoneService.isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores)
    ).toEqual(false);
  });
  it('should check is template criterion satisfied true', () => {
    const satisfyCriterion = createSatisfyCriteria(
      'node1',
      'component1',
      'ki',
      'percentOfScoresGreaterThan',
      2,
      50
    );
    const aggregateAutoScores = {
      component1: {
        ki: {
          counts: createScoreCounts([10, 10, 10, 10, 10]),
          scoreCount: 50
        }
      }
    };
    expect(
      MilestoneService.isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores)
    ).toEqual(true);
  });
}

function isPercentOfScoresGreaterThan() {
  describe('isPercentOfScoresGreaterThan()', () => {
    it('should check is percent of scores greater than false', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresGreaterThan',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresGreaterThan(satisfyCriterion, aggregateAutoScores)
      ).toEqual(false);
    });
    it('should check is percent of scores greater than true', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresGreaterThan',
        2,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresGreaterThan(satisfyCriterion, aggregateAutoScores)
      ).toEqual(true);
    });
  });
}

function getGreaterThanSum() {
  describe('getGreaterThanSum()', () => {
    it('should get greater than sum with score 1', () => {
      const satisfyCriterion = { value: 1 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(140);
    });
    it('should get greater than sum with score 2', () => {
      const satisfyCriterion = { value: 2 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(120);
    });
    it('should get greater than sum with score 3', () => {
      const satisfyCriterion = { value: 3 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(90);
    });
    it('should get greater than sum with score 4', () => {
      const satisfyCriterion = { value: 4 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(50);
    });
  });
}

function isPercentOfScoresGreaterThanOrEqualTo() {
  describe('isPercentOfScoresGreaterThanOrEqualTo()', () => {
    it('should check is percent of scores greater than or equal to false', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresGreaterThanOrEqualTo',
        4,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresGreaterThanOrEqualTo(
          satisfyCriterion,
          aggregateAutoScores
        )
      ).toEqual(false);
    });
    it('should check is percent of scores greater than or equal to true', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresGreaterThanOrEqualTo',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresGreaterThanOrEqualTo(
          satisfyCriterion,
          aggregateAutoScores
        )
      ).toEqual(true);
    });
  });
}

function getGreaterThanOrEqualToSum() {
  describe('getGreaterThanOrEqualToSum()', () => {
    it('should get greater than or equal to sum with score 1', () => {
      const satisfyCriterion = { value: 1 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(150);
    });
    it('should get greater than or equal to sum with score 2', () => {
      const satisfyCriterion = { value: 2 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(140);
    });
    it('should get greater than or equal to sum with score 3', () => {
      const satisfyCriterion = { value: 3 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(120);
    });
    it('should get greater than or equal to sum with score 4', () => {
      const satisfyCriterion = { value: 4 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(90);
    });
    it('should get greater than or equal to sum with score 5', () => {
      const satisfyCriterion = { value: 5 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getGreaterThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(50);
    });
  });
}

function isPercentOfScoresLessThan() {
  describe('isPercentOfScoresLessThan()', () => {
    it('should check is percent of scores less than false', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresLessThan',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresLessThan(satisfyCriterion, aggregateAutoScores)
      ).toEqual(false);
    });
    it('should check is percent of scores less than true', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresLessThan',
        4,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresLessThan(satisfyCriterion, aggregateAutoScores)
      ).toEqual(true);
    });
  });
}

function getLessThanSum() {
  describe('getLessThanSum()', () => {
    it('should get less than sum with score 2', () => {
      const satisfyCriterion = { value: 2 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(10);
    });
    it('should get less than sum with score 3', () => {
      const satisfyCriterion = { value: 3 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(30);
    });
    it('should get less than sum with score 4', () => {
      const satisfyCriterion = { value: 4 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(60);
    });
    it('should get less than sum with score 5', () => {
      const satisfyCriterion = { value: 5 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(100);
    });
  });
}

function isPercentOfScoresLessThanOrEqualTo() {
  describe('isPercentOfScoresLessThanOrEqualTo()', () => {
    it('should check is percent of scores less than or equal to false', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresLessThanOrEqualTo',
        2,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresLessThanOrEqualTo(satisfyCriterion, aggregateAutoScores)
      ).toEqual(false);
    });
    it('should check is percent of scores less than or equal to true', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresLessThanOrEqualTo',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresLessThanOrEqualTo(satisfyCriterion, aggregateAutoScores)
      ).toEqual(true);
    });
  });
}

function getLessThanOrEqualToSum() {
  describe('getLessThanOrEqualToSum()', () => {
    it('should get less than or equal to sum with score 1', () => {
      const satisfyCriterion = { value: 1 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(10);
    });
    it('should get less than or equal to sum with score 2', () => {
      const satisfyCriterion = { value: 2 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(30);
    });
    it('should get less than or equal to sum with score 3', () => {
      const satisfyCriterion = { value: 3 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(60);
    });
    it('should get less than or equal to sum with score 4', () => {
      const satisfyCriterion = { value: 4 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(100);
    });
    it('should get less than or equal to sum with score 5', () => {
      const satisfyCriterion = { value: 5 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getLessThanOrEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(150);
    });
  });
}

function isPercentOfScoresEqualTo() {
  describe('isPercentOfScoresEqualTo()', () => {
    it('should check is percent of scores equal to false', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresEqualTo',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 10, 10, 10, 10]),
            scoreCount: 50
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresEqualTo(satisfyCriterion, aggregateAutoScores)
      ).toEqual(false);
    });
    it('should check is percent of scores equal to true', () => {
      const satisfyCriterion = createSatisfyCriteria(
        'node1',
        'component1',
        'ki',
        'percentOfScoresEqualTo',
        3,
        50
      );
      const aggregateAutoScores = {
        component1: {
          ki: {
            counts: createScoreCounts([10, 0, 10, 0, 0]),
            scoreCount: 20
          }
        }
      };
      expect(
        MilestoneService.isPercentOfScoresEqualTo(satisfyCriterion, aggregateAutoScores)
      ).toEqual(true);
    });
  });
}

function getEqualToSum() {
  describe('getEqualToSum()', () => {
    it('should equal to sum', () => {
      const satisfyCriterion = { value: 3 };
      const aggregateData = {
        counts: createScoreCounts([10, 20, 30, 40, 50])
      };
      const possibleScores = [1, 2, 3, 4, 5];
      expect(
        MilestoneService.getEqualToSum(satisfyCriterion, aggregateData, possibleScores)
      ).toEqual(30);
    });
  });
}

function isPercentOfScoresNotEqualTo() {
  describe('isPercentOfScoresNotEqualTo()', () => {
    it('should return true when percent of scores equal to value are less than threshold', () => {
      const result = MilestoneService.isPercentOfScoresNotEqualTo(
        satisfyCriterionSample,
        aggregateAutoScoresSample
      );
      expect(result).toBeTruthy();
    });
    it('should return true when percent of scores equal to value meet threshold', () => {
      const aggregateAutoScores = angular.copy(aggregateAutoScoresSample);
      aggregateAutoScores.xfns1g7pga.ki.counts = { 1: 1, 2: 0, 3: 2, 4: 0, 5: 0 };
      const result = MilestoneService.isPercentOfScoresNotEqualTo(
        satisfyCriterionSample,
        aggregateAutoScores
      );
      expect(result).toBeFalsy();
    });
  });
}

function getNotEqualToSum() {
  describe('getNotEqualToSum()', () => {
    const aggregateData = {
      counts: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0 },
      scoreCount: 3
    };
    it('should return the sum of scores not equal to value', () => {
      const result = MilestoneService.getNotEqualToSum(
        satisfyCriterionSample,
        aggregateData,
        possibleScoresKi
      );
      expect(result).toBe(2);
    });
  });
}

function getAggregateData() {
  describe('getAggregateData()', () => {
    it('should return the aggregate data', () => {
      const result = MilestoneService.getAggregateData(
        satisfyCriterionSample,
        aggregateAutoScoresSample
      );
      expect(result).toEqual({
        counts: { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0 },
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
      counts: { 2: 2, 1: 0, 3: 1, 4: 0, 5: 0 }
    };
    it('should return the possible scores', () => {
      expect(MilestoneService.getPossibleScores(aggregateData)).toEqual([1, 2, 3, 4, 5]);
    });
  });
}

function isPercentThresholdSatisfied() {
  describe('isPercentThresholdSatisfied()', () => {
    it('should return true when percent threshold is satisfied', () => {
      const aggregateAutoScores = {
        xfns1g7pga: {
          ki: { counts: { 1: 1, 2: 0, 3: 2, 4: 0, 5: 0 }, scoreCount: 3 }
        }
      };
      const aggregateData = MilestoneService.getAggregateData(
        satisfyCriterionSample,
        aggregateAutoScores
      );
      const sum = MilestoneService.getEqualToSum(
        satisfyCriterionSample,
        aggregateData,
        possibleScoresKi
      );
      const result = MilestoneService.isPercentThresholdSatisfied(
        satisfyCriterionSample,
        aggregateData,
        sum
      );
      expect(result).toBeTruthy();
    });
    it('should return false when percent threshold is not satisfied', () => {
      const aggregateData = MilestoneService.getAggregateData(
        satisfyCriterionSample,
        aggregateAutoScoresSample
      );
      const sum = MilestoneService.getEqualToSum(
        satisfyCriterionSample,
        aggregateData,
        possibleScoresKi
      );
      const result = MilestoneService.isPercentThresholdSatisfied(
        satisfyCriterionSample,
        aggregateData,
        sum
      );
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
              satisfyCriteria: [satisfyCriterionSample, satisfyCriterion]
            }
          ]
        }
      };
      expect(MilestoneService.getSatisfyCriteriaReferencedComponents(projectAchievement)).toEqual({
        node1_xfns1g7pga: {
          nodeId: 'node1',
          componentId: 'xfns1g7pga'
        },
        node2_xfns1g7pga: {
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
    it('should return the aggregate auto scores', () => {});
  });
}

function adjustKIScore() {
  describe('adjustKIScore()', () => {
    it('should return the adjusted KI score', () => {
      const value = 5;
      expect(MilestoneService.adjustKIScore(value, reportSettingsCustomScoreValuesSample)).toEqual(
        4
      );
    });
  });
}

function getKIScoreBounds() {
  describe('getKIScoreBounds()', () => {
    it('should return the KI score bounds', () => {
      expect(MilestoneService.getKIScoreBounds(reportSettingsCustomScoreValuesSample)).toEqual({
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
          scores: [
            {
              id: 'ki',
              score: 3
            }
          ]
        }
      };
      const aggregateAutoScore = angular.copy(aggregateAutoScoresSample).xfns1g7pga;
      const result = MilestoneService.addDataToAggregate(
        aggregateAutoScore,
        annotation,
        reportSettingsCustomScoreValuesSample
      );
      expect(result).toEqual({
        ki: {
          counts: { 1: 2, 2: 0, 3: 2, 4: 0, 5: 0 },
          scoreSum: 8,
          scoreCount: 4,
          average: 2
        }
      });
    });
  });
}

function setupAggregateSubScore() {
  describe('setupAggregateSubScore()', () => {
    it('should setup aggregate sub score', () => {
      const subScoreId = 'ki';
      const reportSettings = {};
      const counts = MilestoneService.setupAggregateSubScore(subScoreId, reportSettings);
      expect(counts.scoreSum).toEqual(0);
      expect(counts.scoreCount).toEqual(0);
      expect(counts.counts).toEqual(createScoreCounts([0, 0, 0, 0, 0]));
      expect(counts.average).toEqual(0);
    });
    it('should setup aggregate sub score with custom score values', () => {
      const subScoreId = 'ki';
      const reportSettings = {
        customScoreValues: {
          ki: [0, 1, 2]
        }
      };
      const counts = MilestoneService.setupAggregateSubScore(subScoreId, reportSettings);
      expect(counts.scoreSum).toEqual(0);
      expect(counts.scoreCount).toEqual(0);
      expect(counts.counts).toEqual({ 0: 0, 1: 0, 2: 0 });
      expect(counts.average).toEqual(0);
    });
  });
}

function getCustomScoreValueCounts() {
  describe('getCustomScoreValueCounts()', () => {
    it('should get custom score value counts', () => {
      const scoreValues = MilestoneService.getCustomScoreValueCounts([0, 1, 2]);
      expect(Object.entries(scoreValues).length).toEqual(3);
      expect(scoreValues[0]).toEqual(0);
      expect(scoreValues[1]).toEqual(0);
      expect(scoreValues[2]).toEqual(0);
    });
  });
}

function getPossibleScoreValueCounts() {
  describe('getPossibleScoreValueCounts()', () => {
    it('should get possible score value counts for ki', () => {
      const scoreValues = MilestoneService.getPossibleScoreValueCounts('ki');
      expect(Object.entries(scoreValues).length).toEqual(5);
      expect(scoreValues[1]).toEqual(0);
      expect(scoreValues[2]).toEqual(0);
      expect(scoreValues[3]).toEqual(0);
      expect(scoreValues[4]).toEqual(0);
      expect(scoreValues[5]).toEqual(0);
    });
    it('should get possible score value counts for not ki', () => {
      const scoreValues = MilestoneService.getPossibleScoreValueCounts('science');
      expect(Object.entries(scoreValues).length).toEqual(3);
      expect(scoreValues[1]).toEqual(0);
      expect(scoreValues[2]).toEqual(0);
      expect(scoreValues[3]).toEqual(0);
    });
  });
}

function processMilestoneGraphsAndData() {
  describe('processMilestoneGraphsAndData()', () => {
    it('should process milestone report graph', () => {
      let content = '<milestone-report-graph id="ki"></milestone-report-graph>';
      const aggregateAutoScores = {
        component1: {
          ki: {
            scoreSum: 4,
            scoreCount: 2,
            average: 2,
            counts: createScoreCounts([1, 0, 1, 0, 0])
          }
        }
      };
      content = MilestoneService.processMilestoneGraphsAndData(content, aggregateAutoScores);
      expect(
        content.includes(
          `data="{'scoreSum':4,'scoreCount':2,'average':2,'counts':{'1':1,'2':0,'3':1,'4':0,'5':0}}"`
        )
      ).toEqual(true);
    });
    it('should process milestone report data', () => {
      let content = '<milestone-report-data score-id="ki"></milestone-report-data>';
      const aggregateAutoScores = {
        component1: {
          ki: {
            scoreSum: 4,
            scoreCount: 2,
            average: 2,
            counts: createScoreCounts([1, 0, 1, 0, 0])
          }
        }
      };
      content = MilestoneService.processMilestoneGraphsAndData(content, aggregateAutoScores);
      expect(
        content.includes(
          `data="{'scoreSum':4,'scoreCount':2,'average':2,` +
            `'counts':{'1':1,'2':0,'3':1,'4':0,'5':0}}"`
        )
      ).toEqual(true);
    });
  });
}

function setReportAvailable() {
  describe('setReportAvailable()', () => {
    it('should set report available false', () => {
      const projectAchievement = {};
      MilestoneService.setReportAvailable(projectAchievement, false);
      expect(projectAchievement.isReportAvailable).toEqual(false);
    });
    it('should set report available true', () => {
      const projectAchievement = {};
      MilestoneService.setReportAvailable(projectAchievement, true);
      expect(projectAchievement.isReportAvailable).toEqual(true);
    });
  });
}

function saveMilestone() {
  describe('saveMilestone()', () => {
    it('should save milestone when it is new', () => {
      const milestone1 = {
        id: 'milestone1'
      };
      const projectAchievements = [milestone1];
      spyOn(ProjectService, 'getAchievementItems').and.returnValue(projectAchievements);
      spyOn(ProjectService, 'saveProject').and.callFake(() => {});
      const milestone2 = {
        id: 'milestone2'
      };
      MilestoneService.saveMilestone(milestone2);
      expect(projectAchievements.length).toEqual(2);
      expect(projectAchievements[0].id).toEqual('milestone1');
      expect(projectAchievements[1].id).toEqual('milestone2');
    });
    it('should save milestone when it already exists', () => {
      const milestone1 = {
        id: 'milestone1'
      };
      const projectAchievements = [milestone1];
      spyOn(ProjectService, 'getAchievementItems').and.returnValue(projectAchievements);
      spyOn(ProjectService, 'saveProject').and.callFake(() => {});
      MilestoneService.saveMilestone(milestone1);
      expect(projectAchievements.length).toEqual(1);
      expect(projectAchievements[0].id).toEqual('milestone1');
    });
  });
}

function createMilestone() {
  describe('createMilestone()', () => {
    it('should create milestone', () => {
      const milestone1 = {
        id: 'milestone1'
      };
      const projectAchievements = [milestone1];
      spyOn(ProjectService, 'getAchievementItems').and.returnValue(projectAchievements);
      spyOn(AchievementService, 'getAvailableAchievementId').and.returnValue('milestone2');
      spyOn(UtilService, 'makeCopyOfJSONObject').and.returnValue({});
      const milestone = MilestoneService.createMilestone();
      expect(milestone.id).toEqual('milestone2');
      const dayOfYear = MilestoneService.moment(milestone.params.targetDate).dayOfYear();
      const todayDayOfYear = MilestoneService.moment().dayOfYear();
      expect(dayOfYear).toEqual(todayDayOfYear + 1);
    });
  });
}

function deleteMilestone() {
  describe('deleteMilestone()', () => {
    it('should delete milestone', () => {
      const milestone1 = { id: 'milestone1' };
      const milestone2 = { id: 'milestone2' };
      const milestone3 = { id: 'milestone3' };
      const projectAchievements = [milestone1, milestone2, milestone3];
      spyOn(ProjectService, 'getAchievementItems').and.returnValue(projectAchievements);
      spyOn(ProjectService, 'saveProject').and.callFake(() => {});
      MilestoneService.deleteMilestone(milestone2);
      expect(projectAchievements.length).toEqual(2);
      expect(projectAchievements[0].id).toEqual('milestone1');
      expect(projectAchievements[1].id).toEqual('milestone3');
    });
  });
}

function clearTempFields() {
  describe('clearTempFields()', () => {
    it('should clear temp fields', () => {
      const projectAchievements = [
        {
          items: [{}],
          workgroups: [1],
          numberOfStudentsCompleted: 2,
          numberOfStudentsInRun: 4,
          percentageCompleted: 50,
          generatedReport: 'report',
          generatedRecommendations: 'recommendations',
          nodeId: 'node1',
          componentId: 'component1',
          isReportAvailable: true
        }
      ];
      spyOn(ProjectService, 'getAchievementItems').and.returnValue(projectAchievements);
      MilestoneService.clearTempFields();
      const projectAchievement = projectAchievements[0];
      expect(projectAchievement.items).toBeUndefined();
      expect(projectAchievement.workgroups).toBeUndefined();
      expect(projectAchievement.numberOfStudentsCompleted).toBeUndefined();
      expect(projectAchievement.numberOfStudentsInRun).toBeUndefined();
      expect(projectAchievement.percentageCompleted).toBeUndefined();
      expect(projectAchievement.generatedReport).toBeUndefined();
      expect(projectAchievement.generatedRecommendations).toBeUndefined();
      expect(projectAchievement.nodeId).toBeUndefined();
      expect(projectAchievement.componentId).toBeUndefined();
      expect(projectAchievement.isReportAvailable).toBeUndefined();
      expect(MilestoneService.workgroupsStorage[0]).toEqual([1]);
      expect(MilestoneService.numberOfStudentsCompletedStorage[0]).toEqual(2);
      expect(MilestoneService.percentageCompletedStorage[0]).toEqual(50);
    });
  });
}
