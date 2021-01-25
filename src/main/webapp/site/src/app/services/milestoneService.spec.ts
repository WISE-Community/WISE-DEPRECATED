import * as angular from 'angular';
import { MilestoneService } from '../../../../wise5/services/milestoneService';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AchievementService } from '../../../../wise5/services/achievementService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { TeacherDataService } from '../../../../wise5/services/teacherDataService';
import { UtilService } from '../../../../wise5/services/utilService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { TeacherProjectService } from '../../../../wise5/services/teacherProjectService';
import { TeacherWebSocketService } from '../../../../wise5/services/teacherWebSocketService';
import { NotificationService } from '../../../../wise5/services/notificationService';
import { StudentStatusService } from '../../../../wise5/services/studentStatusService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: MilestoneService;
let achievementService: AchievementService;
let configService: ConfigService;
let projectService: ProjectService;
let teacherDataService: TeacherDataService;
let utilService: UtilService;

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

const sampleAggregateData = {
  counts: createScoreCounts([10, 20, 30, 40, 50])
};

const reportSettingsCustomScoreValuesSample = {
  customScoreValues: {
    ki: [1, 2, 3, 4]
  }
};

describe('MilestoneService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AchievementService,
        AnnotationService,
        ConfigService,
        MilestoneService,
        NotificationService,
        ProjectService,
        SessionService,
        StudentDataService,
        StudentStatusService,
        TagService,
        TeacherDataService,
        TeacherProjectService,
        TeacherWebSocketService,
        UtilService
      ]
    });
    service = TestBed.get(MilestoneService);
    achievementService = TestBed.get(AchievementService);
    configService = TestBed.get(ConfigService);
    projectService = TestBed.get(ProjectService);
    teacherDataService = TestBed.get(TeacherDataService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope').and.callFake(() => {});
  });
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
  isPercentOfScoresSatisfiesComparator();
  getComparatorSum();
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
});

function createScoreCounts(counts: any[]) {
  const countsObject = {};
  for (let c = 0; c < counts.length; c++) {
    countsObject[c + 1] = counts[c];
  }
  return countsObject;
}

function createSatisfyCriteria(
  nodeId: string,
  componentId: string,
  targetVariable: string = null,
  func: string = null,
  value: number = null,
  percentThreshold: number = null
) {
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
      spyOn(projectService, 'getAchievements').and.returnValue({ isEnabled: false });
      const milestones = service.getProjectMilestones();
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
      spyOn(projectService, 'getAchievements').and.returnValue(achievements);
      const milestones = service.getProjectMilestones();
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
      spyOn(projectService, 'getAchievements').and.returnValue(achievements);
      const milestoneReports = service.getProjectMilestoneReports();
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
      spyOn(projectService, 'getAchievements').and.returnValue(achievements);
      const milestoneReport = service.getMilestoneReportByNodeId('node2');
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
      spyOn(projectService, 'getAchievements').and.returnValue(achievements);
      const milestoneReport = service.getMilestoneReportByNodeId('node1');
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
      spyOn(achievementService, 'getAchievementIdToStudentAchievementsMappings').and.returnValue(
        achievements
      );
      spyOn(configService, 'getDisplayUsernamesByWorkgroupId').and.returnValue('student');
      spyOn(teacherDataService, 'getCurrentPeriod').and.returnValue(1);
      spyOn(projectService, 'getAchievementByAchievementId').and.returnValue(milestone);
      const milestoneStatus = service.getProjectMilestoneStatus(milestoneId);
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
      const milestone: any = {
        params: {
          nodeIds: ['node1', 'node2']
        }
      };
      projectService.idToOrder = {
        node1: {},
        node2: {},
        node3: {}
      };
      service.insertMilestoneItems(milestone);
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
      const milestone: any = {
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
      spyOn(achievementService, 'getAchievementIdToStudentAchievementsMappings').and.returnValue(
        achievements
      );
      spyOn(configService, 'getDisplayUsernamesByWorkgroupId').and.returnValue('student');
      service.workgroupIds = [1, 2, 3, 4, 5];
      service.insertMilestoneCompletion(milestone);
      expect(milestone.numberOfStudentsCompleted).toEqual(5);
    });
  });
}

function createStudentAchievement(
  achievementId: string,
  achievementTime: number,
  workgroupId: number
) {
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
      const milestone: any = {
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
      spyOn(service, 'calculateAggregateAutoScores').and.returnValue(aggregateAutoScores);
      service.insertMilestoneReport(milestone);
      expect(milestone.isReportAvailable).toEqual(true);
      expect(milestone.generatedReport).toEqual(content);
    });
  });
}

function setWorkgroupsInCurrentPeriod() {
  describe('setWorkgroupsInCurrentPeriod()', () => {
    it('should set workgroups in current period', () => {
      spyOn(configService, 'getClassmateWorkgroupIds').and.returnValue([1, 2, 3]);
      spyOn(configService, 'getPeriodIdByWorkgroupId').and.returnValue(1);
      service.periodId = 1;
      service.setWorkgroupsInCurrentPeriod();
      expect(service.numberOfStudentsInRun).toEqual(3);
      expect(service.workgroupIds[0]).toEqual(1);
      expect(service.workgroupIds[1]).toEqual(2);
      expect(service.workgroupIds[2]).toEqual(3);
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
      const referencedComponent = service.getReferencedComponent(milestone);
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
      expect(service.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached percent true and num students false', () => {
      const projectAchievement = {
        percentageCompleted: 60,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 2,
        satisfyMinNumWorkgroups: 4
      };
      expect(service.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached percent false and num students false', () => {
      const projectAchievement = {
        percentageCompleted: 25,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 6,
        satisfyMinNumWorkgroups: 4
      };
      expect(service.isCompletionReached(projectAchievement)).toEqual(false);
    });
    it('should check is completion reached perecent true and num students true', () => {
      const projectAchievement = {
        percentageCompleted: 60,
        satisfyMinPercentage: 50,
        numberOfStudentsCompleted: 6,
        satisfyMinNumWorkgroups: 4
      };
      expect(service.isCompletionReached(projectAchievement)).toEqual(true);
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
    spyOn(service, 'calculateAggregateAutoScores').and.returnValue(aggregateAutoScores);
    const report = service.generateReport(projectAchievement);
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
      spyOn(service, 'isTemplateMatch').and.callFake((template, aggregateAutoScores) => {
        if (template.id === 'template-1') {
          return false;
        } else if (template.id === 'template-2') {
          return true;
        }
      });
      expect(service.chooseTemplate(templates, aggregateAutoScores)).toEqual(template2);
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
      spyOn(service, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(service.isTemplateMatch(template, aggregateAutoScores)).toEqual(false);
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
      spyOn(service, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return true;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(service.isTemplateMatch(template, aggregateAutoScores)).toEqual(true);
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
      spyOn(service, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return false;
          }
        }
      );
      expect(service.isTemplateMatch(template, aggregateAutoScores)).toEqual(false);
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
      spyOn(service, 'isTemplateCriterionSatisfied').and.callFake(
        (satisfyCriterion, aggregateAutoScores) => {
          if (satisfyCriterion.id === 'satisfy-criteria-1') {
            return false;
          } else if (satisfyCriterion.id === 'satisfy-criteria-2') {
            return true;
          }
        }
      );
      expect(service.isTemplateMatch(template, aggregateAutoScores)).toEqual(true);
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
    expect(service.isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores)).toEqual(
      false
    );
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
    expect(service.isTemplateCriterionSatisfied(satisfyCriterion, aggregateAutoScores)).toEqual(
      true
    );
  });
}

function isPercentOfScoresSatisfiesComparator() {
  describe('isPercentOfScoresSatisfiesComparator()', () => {
    isPercentOfScoresGreaterThan();
    isPercentOfScoresGreaterThanOrEqualTo();
    isPercentOfScoresLessThan();
    isPercentOfScoresLessThanOrEqualTo();
    isPercentOfScoresEqualTo();
    isPercentOfScoresNotEqualTo();
  });
}

function isPercentOfScoresGreaterThan() {
  const aggregateAutoScores = {
    component1: {
      ki: {
        counts: createScoreCounts([10, 10, 10, 10, 10]),
        scoreCount: 50
      }
    }
  };
  it('should check is percent of scores greater than false', () => {
    const satisfyCriterion = createSatisfyCriteria(
      'node1',
      'component1',
      'ki',
      'percentOfScoresGreaterThan',
      3,
      50
    );
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.greaterThan
      )
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
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.greaterThan
      )
    ).toEqual(true);
  });
}

function isPercentOfScoresGreaterThanOrEqualTo() {
  const aggregateAutoScores = {
    component1: {
      ki: {
        counts: createScoreCounts([10, 10, 10, 10, 10]),
        scoreCount: 50
      }
    }
  };
  it('should check is percent of scores greater than or equal to false', () => {
    const satisfyCriterion = createSatisfyCriteria(
      'node1',
      'component1',
      'ki',
      'percentOfScoresGreaterThanOrEqualTo',
      4,
      50
    );
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.greaterThanEqualTo
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
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.greaterThanEqualTo
      )
    ).toEqual(true);
  });
}

function isPercentOfScoresLessThan() {
  const aggregateAutoScores = {
    component1: {
      ki: {
        counts: createScoreCounts([10, 10, 10, 10, 10]),
        scoreCount: 50
      }
    }
  };
  it('should check is percent of scores less than false', () => {
    const satisfyCriterion = createSatisfyCriteria(
      'node1',
      'component1',
      'ki',
      'percentOfScoresLessThan',
      3,
      50
    );
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.lessThan
      )
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
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.lessThan
      )
    ).toEqual(true);
  });
}

function isPercentOfScoresLessThanOrEqualTo() {
  const aggregateAutoScores = {
    component1: {
      ki: {
        counts: createScoreCounts([10, 10, 10, 10, 10]),
        scoreCount: 50
      }
    }
  };
  it('should check is percent of scores less than or equal to false', () => {
    const satisfyCriterion = createSatisfyCriteria(
      'node1',
      'component1',
      'ki',
      'percentOfScoresLessThanOrEqualTo',
      2,
      50
    );
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.lessThanEqualTo
      )
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
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.lessThanEqualTo
      )
    ).toEqual(true);
  });
}

function isPercentOfScoresEqualTo() {
  const satisfyCriterion = createSatisfyCriteria(
    'node1',
    'component1',
    'ki',
    'percentOfScoresEqualTo',
    3,
    50
  );
  it('should check is percent of scores equal to false', () => {
    const aggregateAutoScores = {
      component1: {
        ki: {
          counts: createScoreCounts([10, 10, 10, 10, 10]),
          scoreCount: 50
        }
      }
    };
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.equalTo
      )
    ).toEqual(false);
  });
  it('should check is percent of scores equal to true', () => {
    const aggregateAutoScores = {
      component1: {
        ki: {
          counts: createScoreCounts([10, 0, 10, 0, 0]),
          scoreCount: 20
        }
      }
    };
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterion,
        aggregateAutoScores,
        utilService.equalTo
      )
    ).toEqual(true);
  });
}

function isPercentOfScoresNotEqualTo() {
  it('should return true when percent of scores equal to value are less than threshold', () => {
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterionSample,
        aggregateAutoScoresSample,
        utilService.notEqualTo
      )
    ).toEqual(true);
  });
  it('should return true when percent of scores equal to value meet threshold', () => {
    const aggregateAutoScores = angular.copy(aggregateAutoScoresSample);
    aggregateAutoScores.xfns1g7pga.ki.counts = { 1: 1, 2: 0, 3: 2, 4: 0, 5: 0 };
    expect(
      service.isPercentOfScoresSatisfiesComparator(
        satisfyCriterionSample,
        aggregateAutoScores,
        utilService.notEqualTo
      )
    ).toEqual(false);
  });
}

function getComparatorSum() {
  describe('getComparatorSum()', () => {
    getComparatorSum_greaterThan0_ReturnSumAll();
    getComparatorSum_greaterThan3_ReturnSumPartial();
    getComparatorSum_greaterThan5_Return0();
  });
}

function expectComparatorResult(satisfyCriterionValue: number, expectedResult: number) {
  const satisfyCriterion = { value: satisfyCriterionValue };
  expect(
    service.getComparatorSum(
      satisfyCriterion,
      sampleAggregateData,
      possibleScoresKi,
      utilService.greaterThan
    )
  ).toEqual(expectedResult);
}

function getComparatorSum_greaterThan0_ReturnSumAll() {
  it('should get greater than sum with score 0', () => {
    expectComparatorResult(0, 150);
  });
}

function getComparatorSum_greaterThan3_ReturnSumPartial() {
  it('should get greater than sum with score 3', () => {
    expectComparatorResult(3, 90);
  });
}

function getComparatorSum_greaterThan5_Return0() {
  it('should get greater than sum with score 5', () => {
    expectComparatorResult(5, 0);
  });
}

function getAggregateData() {
  describe('getAggregateData()', () => {
    it('should return the aggregate data', () => {
      const result = service.getAggregateData(satisfyCriterionSample, aggregateAutoScoresSample);
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
      expect(service.getPossibleScores(aggregateData)).toEqual([1, 2, 3, 4, 5]);
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
      const aggregateData = service.getAggregateData(satisfyCriterionSample, aggregateAutoScores);
      const sum = service.getComparatorSum(
        satisfyCriterionSample,
        aggregateData,
        possibleScoresKi,
        utilService.equalTo
      );
      const result = service.isPercentThresholdSatisfied(
        satisfyCriterionSample,
        aggregateData,
        sum
      );
      expect(result).toBeTruthy();
    });
    it('should return false when percent threshold is not satisfied', () => {
      const aggregateData = service.getAggregateData(
        satisfyCriterionSample,
        aggregateAutoScoresSample
      );
      const sum = service.getComparatorSum(
        satisfyCriterionSample,
        aggregateData,
        possibleScoresKi,
        utilService.equalTo
      );
      const result = service.isPercentThresholdSatisfied(
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
      expect(service.getSatisfyCriteriaReferencedComponents(projectAchievement)).toEqual({
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
      expect(service.adjustKIScore(value, reportSettingsCustomScoreValuesSample)).toEqual(4);
    });
  });
}

function getKIScoreBounds() {
  describe('getKIScoreBounds()', () => {
    it('should return the KI score bounds', () => {
      expect(service.getKIScoreBounds(reportSettingsCustomScoreValuesSample)).toEqual({
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
      const result = service.addDataToAggregate(
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
      const counts = service.setupAggregateSubScore(subScoreId, reportSettings);
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
      const counts = service.setupAggregateSubScore(subScoreId, reportSettings);
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
      const scoreValues = service.getCustomScoreValueCounts([0, 1, 2]);
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
      const scoreValues = service.getPossibleScoreValueCounts('ki');
      expect(Object.entries(scoreValues).length).toEqual(5);
      expect(scoreValues[1]).toEqual(0);
      expect(scoreValues[2]).toEqual(0);
      expect(scoreValues[3]).toEqual(0);
      expect(scoreValues[4]).toEqual(0);
      expect(scoreValues[5]).toEqual(0);
    });
    it('should get possible score value counts for not ki', () => {
      const scoreValues = service.getPossibleScoreValueCounts('science');
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
      content = service.processMilestoneGraphsAndData(content, aggregateAutoScores);
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
      content = service.processMilestoneGraphsAndData(content, aggregateAutoScores);
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
      const projectAchievement: any = {};
      service.setReportAvailable(projectAchievement, false);
      expect(projectAchievement.isReportAvailable).toEqual(false);
    });
    it('should set report available true', () => {
      const projectAchievement: any = {};
      service.setReportAvailable(projectAchievement, true);
      expect(projectAchievement.isReportAvailable).toEqual(true);
    });
  });
}
