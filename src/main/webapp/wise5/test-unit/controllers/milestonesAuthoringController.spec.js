import authoringToolModule from '../../authoringTool/authoringTool';

let $controller;
let $filter;
let $rootScope;
let $scope;
let milestonesAuthoringController;
let ProjectService;
let UtilService;
const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];

describe('MilestonesAuthoringToolController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_ProjectService_, _UtilService_, _$controller_, _$filter_, _$rootScope_) => {
    $controller = _$controller_;
    $filter = _$filter_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ProjectService = _ProjectService_;
    UtilService = _UtilService_;
    ProjectService.setProject(JSON.parse(JSON.stringify(demoProjectJSONOriginal)));
    milestonesAuthoringController =
        $controller('MilestonesAuthoringController', { $filter: $filter, $scope: $scope });
  }));

  shouldInitializeMilestones();
  shouldCreateMilestone();
  shouldGetMilestoneIds();
  shouldGenerateUniqueId();
  shouldAddMilestone();
  shouldDeleteMilestone();
  shouldCreateMilestoneSatisfyCriteria();
  shouldGetMilestoneSatisfyCriteriaIds();
  shouldAddMilestoneSatisfyCriteria();
  shouldDeleteMilestoneSatisfyCriteria();
  shouldCopySatisfyCriteriaToMilestone();
  shouldCreateReport();
  shouldGetReportIds();
  shouldCreateLocation();
  shouldAddLocation();
  shouldDeleteLocation();
  shouldAddCustomScoreValues();
  shouldValidateCustomScoreValuesWithEmptyKey();
  shouldValidateCustomScoreValuesWithEmptyValues();
  shouldValidateCustomScoreValuesWithEmptyKeyAndValues();
  shouldValidateCustomScoreValues();
  shouldGetNumberArrayFromCustomScoreValuesWhenGivenNonNumbers();
  shouldGetNumberArrayFromCustomScoreValues();
  shouldDeleteCustomScoreValues();
  shouldCreateTemplate();
  shouldGetTemplateIds();
  shouldAddTemplate();
  shouldDeleteTemplate();
  shouldCreateTemplateSatisfyCriteria();
  shouldGetTemplateSatisfyCriteriaIds();
  shouldAddTemplateSatisfyCriteria();
  shouldDeleteTemplateSatisfyCriteria();
  shouldAddToIdToExpanded();
  shouldDeleteFromIdToExpanded();
  shouldExpand();
  shouldCollapse();
});

function shouldInitializeMilestones() {
  it('should initialize milestones', () => {
    milestonesAuthoringController.project.achievements = null;
    milestonesAuthoringController.initializeMilestones();
    expect(milestonesAuthoringController.project.achievements.isEnabled).toBe(false);
    expect(milestonesAuthoringController.project.achievements.items).toBeDefined();
    expect(milestonesAuthoringController.project.achievements.items.length).toBe(0);
  });
}

function shouldCreateMilestone() {
  it('should create milestone', () => {
    const milestone = milestonesAuthoringController.createMilestone();
    expect(milestone.id).toBeDefined();
    expect(milestone.isEnabled).toBe(true);
    expect(milestone.type).toBe('milestoneReport');
    expect(milestone.name).toBe('');
    expect(milestone.icon).toBeDefined();
    expect(milestone.report).toBeDefined();
    expect(milestone.satisfyCriteria).toBeDefined();
    expect(milestone.satisfyMinPercentage).toBe(50);
    expect(milestone.satisfyMinNumWorkgroups).toBe(2);
    expect(milestone.satisfyConditional).toBe('all');
  });
}

function shouldGetMilestoneIds() {
  it('should get milestone ids', () => {
    const milestoneId1 = 'milestone1';
    const milestoneId2 = 'milestone2';
    const milestoneId3 = 'milestone3';
    const milestoneId4 = 'milestone4';
    milestonesAuthoringController.project.achievements = {
      items: [
        { id: milestoneId1 },
        { id: milestoneId2 },
        { id: milestoneId3 }
      ]
    };
    const milestoneIds = milestonesAuthoringController.getMilestoneIds();
    expect(milestoneIds[milestoneId1]).toEqual(true);
    expect(milestoneIds[milestoneId2]).toEqual(true);
    expect(milestoneIds[milestoneId3]).toEqual(true);
    expect(milestoneIds[milestoneId4]).toBeUndefined();
  });
}

function shouldGenerateUniqueId() {
  it('should generate unique id', () => {
    const prefix = 'milestone-';
    const existingId = 'milestone-1234567890';
    milestonesAuthoringController.milestoneIds[existingId] = true;
    const newId = milestonesAuthoringController
      .generateUniqueId(prefix, milestonesAuthoringController.milestoneIds);
    expect(newId).not.toEqual(existingId);
  });
}

function shouldAddMilestone() {
  it('should add milestone', () => {
    expect(milestonesAuthoringController.project.achievements.items.length).toEqual(0);
    expect(Object.keys(milestonesAuthoringController.milestoneIds).length).toEqual(0);
    const milestone = milestonesAuthoringController.addMilestone(0);
    expect(milestonesAuthoringController.project.achievements.items.length).toEqual(1);
    expect(milestonesAuthoringController.project.achievements.items[0]).toEqual(milestone);
    expect(Object.keys(milestonesAuthoringController.milestoneIds).length).toEqual(1);
    expect(milestonesAuthoringController.milestoneIds[milestone.id]).toEqual(true);
  });
}

function shouldDeleteMilestone() {
  it('should delete milestone', () => {
    const milestone = milestonesAuthoringController.addMilestone(0);
    expect(milestonesAuthoringController.project.achievements.items.length).toEqual(1);
    expect(Object.keys(milestonesAuthoringController.milestoneIds).length).toEqual(1);
    spyOn(window, 'confirm').and.returnValue(true);
    const deletedMilestone = milestonesAuthoringController.deleteMilestone(0);
    expect(milestonesAuthoringController.project.achievements.items.length).toEqual(0);
    expect(Object.keys(milestonesAuthoringController.milestoneIds).length).toEqual(0);
    expect(milestone).toEqual(deletedMilestone);
  });
}

function shouldCreateMilestoneSatisfyCriteria() {
  it('should create milestone satisfy criteria', () => {
    const satisfyCriteria = milestonesAuthoringController.createMilestoneSatisfyCriteria();
    expect(satisfyCriteria.id).toBeDefined();
    expect(satisfyCriteria.nodeId).toBe('');
    expect(satisfyCriteria.componentId).toBe('');
    expect(satisfyCriteria.name).toBe('');
  });
}

function shouldGetMilestoneSatisfyCriteriaIds() {
  it('should get milestone satisfy criteria ids', () => {
    milestonesAuthoringController.project.achievements = {
      items: [
        {
          id: 'milestone1',
          satisfyCriteria: [
            {
              id: 'satisfyCriteria1'
            }
          ]
        },
        {
          id: 'milestone2',
          satisfyCriteria: [
            {
              id: 'satisfyCriteria2'
            }
          ]
        }
      ]
    };
    const satisfyCriteriaIds = milestonesAuthoringController.getMilestoneSatisfyCriteriaIds();
    expect(Object.keys(satisfyCriteriaIds).length).toEqual(2);
    expect(satisfyCriteriaIds['satisfyCriteria1']).toEqual(true);
    expect(satisfyCriteriaIds['satisfyCriteria2']).toEqual(true);
  });
}

function shouldAddMilestoneSatisfyCriteria() {
  it('should add milestone satisfy criteria', () => {
    const milestone = {
      id: 'milestone1',
      satisfyCriteria: []
    };
    milestonesAuthoringController.project.achievements.items.push(milestone);
    const milestoneSatisfyCriteria =
        milestonesAuthoringController.addMilestoneSatisfyCriteria(milestone, 0);
    expect(milestone.satisfyCriteria.length).toEqual(1);
    expect(Object.keys(milestonesAuthoringController.milestoneSatisfyCriteriaIds).length)
        .toEqual(1);
    expect(milestone.satisfyCriteria[0]).toEqual(milestoneSatisfyCriteria);
  });
}

function shouldDeleteMilestoneSatisfyCriteria() {
  it('should delete milestone satisfy criteria', () => {
    const milestone = {
      id: 'milestone1',
      satisfyCriteria: []
    };
    milestonesAuthoringController.project.achievements.items.push(milestone);
    const milestoneSatisfyCriteria =
        milestonesAuthoringController.addMilestoneSatisfyCriteria(milestone, 0);
    expect(milestone.satisfyCriteria.length).toEqual(1);
    expect(Object.keys(milestonesAuthoringController.milestoneSatisfyCriteriaIds).length)
        .toEqual(1);
    spyOn(window, 'confirm').and.returnValue(true);
    const deltedMilestoneSatisfyCriteria =
        milestonesAuthoringController.deleteMilestoneSatisfyCriteria(milestone, 0);
    expect(milestone.satisfyCriteria.length).toEqual(0);
    expect(Object.keys(milestonesAuthoringController.milestoneSatisfyCriteriaIds).length)
        .toEqual(0);
    expect(milestoneSatisfyCriteria).toEqual(deltedMilestoneSatisfyCriteria);
  });
}

function shouldCopySatisfyCriteriaToMilestone() {
  it('should copy satisfy criteria to milestone', () => {
    const milestone = {
      id: 'milestone1',
      report: {
        templates: [
          {
            id: 'template1',
            satisfyCriteria: [
              {
                nodeId: 'node1',
                componentId: 'component1'
              }
            ]
          },
          {
            id: 'template2',
            satisfyCriteria: [
              {
                nodeId: 'node2',
                componentId: 'component2'
              }
            ]
          }
        ],
        locations: [
          {
            nodeId: 'node1',
            componentId: 'component1'
          },
          {
            nodeId: 'node2',
            componentId: 'component2'
          }
        ]
      }
    };
    spyOn(window, 'confirm').and.returnValue(true);
    milestonesAuthoringController.copySatisfyCriteriaToMilestone(milestone, 'node3', 'component3');
    expect(milestone.report.templates[0].satisfyCriteria[0].nodeId).toEqual('node3');
    expect(milestone.report.templates[0].satisfyCriteria[0].componentId).toEqual('component3');
    expect(milestone.report.templates[1].satisfyCriteria[0].nodeId).toEqual('node3');
    expect(milestone.report.templates[1].satisfyCriteria[0].componentId).toEqual('component3');
    expect(milestone.report.locations[0].nodeId).toEqual('node3');
    expect(milestone.report.locations[0].componentId).toEqual('component3');
    expect(milestone.report.locations[1].nodeId).toEqual('node3');
    expect(milestone.report.locations[1].componentId).toEqual('component3');
  });
}

function shouldCreateReport() {
  it('should create report', () => {
    const report = milestonesAuthoringController.createReport();
    expect(report.id).toBeDefined();
    expect(report.title).toEqual('');
    expect(report.isEnabled).toEqual(true);
    expect(report.audience).toEqual(['teacher']);
    expect(report.templates).toEqual([]);
    expect(report.locations).toEqual([{nodeId: '', componentId: ''}]);
    expect(report.customScoreValues).toEqual({});
  });
}

function shouldGetReportIds() {
  it('should get report ids', () => {
    const reportId1 = 'report1';
    const reportId2 = 'report2';
    const reportId3 = 'report3';
    milestonesAuthoringController.project.achievements = {
      items: [
        {
          id: 'milestone1',
          report: {
            id: reportId1
          }
        },
        {
          id: 'milestone2',
          report: {
            id: reportId2
          }
        }
      ]
    };
    const reportIds = milestonesAuthoringController.getReportIds();
    expect(reportIds[reportId1]).toEqual(true);
    expect(reportIds[reportId2]).toEqual(true);
    expect(reportIds[reportId3]).toBeUndefined();
  });
}

function shouldCreateLocation() {
  it('should create location', () => {
    const location = milestonesAuthoringController.createLocation();
    expect(location.nodeId).toEqual('');
    expect(location.componentId).toEqual('');
  });
}

function shouldAddLocation() {
  it('should add location', () => {
    const report = {
      locations: []
    };
    expect(report.locations.length).toEqual(0);
    const location = milestonesAuthoringController.addLocation(report, 0);
    expect(report.locations.length).toEqual(1);
    expect(report.locations[0]).toEqual(location);
  });
}

function shouldDeleteLocation() {
  it('should delete location', () => {
    const location = {
      nodeId: '', componentId: ''
    };
    const report = {
      locations: [
        location
      ]
    };
    expect(report.locations.length).toEqual(1);
    spyOn(window, 'confirm').and.returnValue(true);
    const deletedLocation = milestonesAuthoringController.deleteLocation(report, 0);
    expect(report.locations.length).toEqual(0);
    expect(location).toEqual(deletedLocation);
  });
}

function shouldAddCustomScoreValues() {
  it('should add custom score values', () => {
    const report = {
      customScoreValues: {}
    };
    const key = 'ki';
    const values = '1,2,3';
    milestonesAuthoringController.addCustomScoreValues(report, key, values);
    expect(Object.keys(report.customScoreValues).length).toEqual(1);
    expect(report.customScoreValues['ki']).toEqual([1,2,3]);
  });
}

function shouldValidateCustomScoreValuesWithEmptyKey() {
  it('should validate custom score values with empty key', () => {
    const key = '';
    const values = '1,2,3';
    spyOn(window, 'alert');
    expect(milestonesAuthoringController.validateCustomScoreValues(key, values)).toEqual(false);
    expect(window.alert).toHaveBeenCalledWith('errorKeyMustNotBeEmpty\n');
  });
}

function shouldValidateCustomScoreValuesWithEmptyValues() {
  it('should validate custom score values with empty values', () => {
    const key = 'ki';
    const values = '';
    spyOn(window, 'alert');
    expect(milestonesAuthoringController.validateCustomScoreValues(key, values)).toEqual(false);
    expect(window.alert).toHaveBeenCalledWith('errorValuesMustNotBeEmpty');
  });
}

function shouldValidateCustomScoreValuesWithEmptyKeyAndValues() {
  it('should validate custom score values with empty key and values', () => {
    const key = '';
    const values = '';
    spyOn(window, 'alert');
    expect(milestonesAuthoringController.validateCustomScoreValues(key, values)).toEqual(false);
    expect(window.alert).toHaveBeenCalledWith('errorKeyMustNotBeEmpty\nerrorValuesMustNotBeEmpty');
  });
}

function shouldValidateCustomScoreValues() {
  it('should validate custom score values', () => {
    const key = 'ki';
    const values = '1,2,3';
    expect(milestonesAuthoringController.validateCustomScoreValues(key, values)).toEqual(true);
  });
}

function shouldGetNumberArrayFromCustomScoreValuesWhenGivenNonNumbers() {
  it('should get number array from custom score values when given non numbers', () => {
    const values = '1,a,3';
    expect(milestonesAuthoringController.getNumberArrayFromCustomScoreValues(values))
        .toEqual([1,3]);
  });
}

function shouldGetNumberArrayFromCustomScoreValues() {
  it('should get number array from custom score values', () => {
    const values = '1,2,3';
    expect(milestonesAuthoringController.getNumberArrayFromCustomScoreValues(values))
        .toEqual([1,2,3]);
  });
}

function shouldDeleteCustomScoreValues() {
  it('should delete custom score values', () => {
    const report = {
      customScoreValues: {
        'ki': [1, 2, 3]
      }
    };
    spyOn(window, 'confirm').and.returnValue(true);
    milestonesAuthoringController.deleteCustomScoreValues(report, 'ki');
    expect(report.customScoreValues['ki']).toBeUndefined();
  });
}

function shouldCreateTemplate() {
  it('should create template', () => {
    const template = milestonesAuthoringController.createTemplate();
    expect(template.id).toBeDefined();
    expect(template.description).toEqual('');
    expect(template.recommendations).toEqual('');
    expect(template.content).toEqual('');
    expect(template.satisfyConditional).toEqual('');
    expect(template.satisfyCriteria).toEqual([]);
  });
}

function shouldGetTemplateIds() {
  it('should get template ids', () => {
    const templateId1 = 'template1';
    const templateId2 = 'template2';
    const templateId3 = 'template3';
    milestonesAuthoringController.project.achievements = {
      items: [
        {
          id: 'milestone1',
          report: {
            templates: [
              {
                id: templateId1
              }
            ]
          }
        },
        {
          id: 'milestone2',
          report: {
            templates: [
              {
                id: templateId2
              }
            ]
          }
        }
      ]
    }
    const templateIds = milestonesAuthoringController.getTemplateIds();
    expect(templateIds[templateId1]).toEqual(true);
    expect(templateIds[templateId2]).toEqual(true);
    expect(templateIds[templateId3]).toBeUndefined();
  });
}

function shouldAddTemplate() {
  it('should add template', () => {
    const report = {
      templates: []
    };
    const template = milestonesAuthoringController.addTemplate(report, 0);
    expect(report.templates.length).toEqual(1);
    expect(report.templates[0]).toEqual(template);
    expect(Object.keys(milestonesAuthoringController.templateIds).length).toEqual(1);
    expect(milestonesAuthoringController.templateIds[template.id]).toEqual(true);
  });
}

function shouldDeleteTemplate() {
  it('should delete template', () => {
    const report = {
      templates: []
    };
    const template = milestonesAuthoringController.addTemplate(report, 0);
    expect(report.templates.length).toEqual(1);
    expect(Object.keys(milestonesAuthoringController.templateIds).length).toEqual(1);
    spyOn(window, 'confirm').and.returnValue(true);
    const deletedTemplate = milestonesAuthoringController.deleteTemplate(report, 0);
    expect(report.templates.length).toEqual(0);
    expect(Object.keys(milestonesAuthoringController.templateIds).length).toEqual(0);
    expect(template).toEqual(deletedTemplate);
  });
}

function shouldCreateTemplateSatisfyCriteria() {
  it('should create template satisfy criteria', () => {
    const templateSatisfyCriteria = milestonesAuthoringController.createTemplateSatisfyCriteria();
    expect(templateSatisfyCriteria.id).toBeDefined();
    expect(templateSatisfyCriteria.nodeId).toEqual('');
    expect(templateSatisfyCriteria.componentId).toEqual('');
    expect(templateSatisfyCriteria.percentThreshold).toEqual(50);
    expect(templateSatisfyCriteria.targetVariable).toEqual('');
    expect(templateSatisfyCriteria.function).toEqual('');
    expect(templateSatisfyCriteria.type).toEqual('autoScore');
    expect(templateSatisfyCriteria.value).toEqual(3);
  });
}

function shouldGetTemplateSatisfyCriteriaIds() {
  it('should get template satisfy criteria ids', () => {
    const templateSatisfyCriteriaId1 = 'templateSatisfyCriteria1';
    const templateSatisfyCriteriaId2 = 'templateSatisfyCriteria2';
    const templateSatisfyCriteriaId3 = 'templateSatisfyCriteria3';
    milestonesAuthoringController.project.achievements = {
      items: [
        {
          id: 'milestone1',
          report: {
            templates: [
              {
                id: 'template1',
                satisfyCriteria: [
                  {
                    id: templateSatisfyCriteriaId1
                  }
                ]
              }
            ]
          }
        },
        {
          id: 'milestone2',
          report: {
            templates: [
              {
                id: 'template2',
                satisfyCriteria: [
                  {
                    id: templateSatisfyCriteriaId2
                  }
                ]
              }
            ]
          }
        }
      ]
    };
    const templateSatisfyCriteriaIds =
        milestonesAuthoringController.getTemplateSatisfyCriteriaIds();
    expect(templateSatisfyCriteriaIds[templateSatisfyCriteriaId1]).toEqual(true);
    expect(templateSatisfyCriteriaIds[templateSatisfyCriteriaId2]).toEqual(true);
    expect(templateSatisfyCriteriaIds[templateSatisfyCriteriaId3]).toBeUndefined();
  });
}

function shouldAddTemplateSatisfyCriteria() {
  it('should add template satisfy criteria', () => {
    const template = {
      satisfyCriteria: []
    };
    const templateSatisfyCriteria =
        milestonesAuthoringController.addTemplateSatisfyCriteria(template, 0);
    expect(template.satisfyCriteria.length).toEqual(1);
    expect(template.satisfyCriteria[0]).toEqual(templateSatisfyCriteria);
    expect(Object.keys(milestonesAuthoringController.templateSatisfyCriteriaIds).length).toEqual(1);
    expect(milestonesAuthoringController.templateSatisfyCriteriaIds[templateSatisfyCriteria.id])
        .toEqual(true);
  });
}

function shouldDeleteTemplateSatisfyCriteria() {
  it('should delete template satisfy criteria', () => {
    const satisfyCriteria = {
      id: 'satisfyCriteria1'
    };
    const template = {
      satisfyCriteria: [
        satisfyCriteria
      ]
    };
    milestonesAuthoringController.templateSatisfyCriteriaIds['satisfyCriteria1'] = true;
    spyOn(window, 'confirm').and.returnValue(true);
    const deletedSatisfyCriteria =
        milestonesAuthoringController.deleteTemplateSatisfyCriteria(template, 0);
    expect(template.satisfyCriteria.length).toEqual(0);
    expect(Object.keys(milestonesAuthoringController.templateSatisfyCriteriaIds).length).toEqual(0);
    expect(satisfyCriteria).toEqual(deletedSatisfyCriteria);
  });
}

function shouldAddToIdToExpanded() {
  it('should add to id to expanded', () => {
    const milestoneId = 'milestone1';
    expect(milestonesAuthoringController.idToExpanded[milestoneId]).toBeUndefined();
    milestonesAuthoringController.addToIdToExpanded(milestoneId);
    expect(milestonesAuthoringController.idToExpanded[milestoneId]).toEqual(true);
  });
}

function shouldDeleteFromIdToExpanded() {
  it('should delete from id to expanded', () => {
    const milestoneId = 'milestone1';
    milestonesAuthoringController.idToExpanded[milestoneId] = true;
    milestonesAuthoringController.deleteFromIdToExpanded(milestoneId);
    expect(milestonesAuthoringController.idToExpanded[milestoneId]).toBeUndefined();
  });
}

function shouldExpand() {
  it('should expand', () => {
    const milestoneId = 'milestone1';
    milestonesAuthoringController.idToExpanded[milestoneId] = false;
    milestonesAuthoringController.expand(milestoneId);
    expect(milestonesAuthoringController.idToExpanded[milestoneId]).toEqual(true);
  });
}

function shouldCollapse() {
  it('should collapse', () => {
    const milestoneId = 'milestone1';
    milestonesAuthoringController.idToExpanded[milestoneId] = true;
    milestonesAuthoringController.collapse(milestoneId);
    expect(milestonesAuthoringController.idToExpanded[milestoneId]).toEqual(false);
  });
}
