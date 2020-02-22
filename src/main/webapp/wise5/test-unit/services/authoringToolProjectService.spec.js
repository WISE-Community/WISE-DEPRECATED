import authoringToolModule from '../../authoringTool/authoringTool';

describe('AuthoringToolProjectService', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  const demoProjectJSONOriginal =
    window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
  const scootersProjectJSONOriginal =
    window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];
  const scootersProjectJSONString = JSON.stringify(scootersProjectJSONOriginal);
  const scootersProjectName = 'scooters';
  const projectIdDefault = 1;
  const projectBaseURL = 'http://localhost:8080/curriculum/12345/';
  const projectURL = projectBaseURL + 'project.json';
  const registerNewProjectURL = 'http://localhost:8080/wise/project/new';
  const saveProjectURL = 'http://localhost:8080/wise/project/save/' + projectIdDefault;
  const wiseBaseURL = '/wise';
  const i18nURL_common_en = 'wise5/i18n/i18n_en.json';
  const i18nURL_vle_en = 'wise5/vle/i18n/i18n_en.json';
  const sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
  const sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

  let ConfigService, ProjectService, $rootScope, $httpBackend, demoProjectJSON, scootersProjectJSON;
  beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSONOriginal));
  }));

  registerNewProject();
  isNodeIdUsed();
  isNodeIdToInsertTargetNotSpecified();
  testDeleteComponent();
  testDeleteTransition();
  testGetNodeIdAfter();
  testCreateNodeAfter();

  function createConfigServiceGetConfigParamSpy() {
    spyOn(ConfigService, 'getConfigParam').and.callFake(param => {
      if (param === 'projectBaseURL') {
        return projectBaseURL;
      } else if (param === 'projectURL') {
        return projectURL;
      } else if (param === 'registerNewProjectURL') {
        return registerNewProjectURL;
      } else if (param === 'saveProjectURL') {
        return saveProjectURL;
      } else if (param === 'wiseBaseURL') {
        return wiseBaseURL;
      }
    });
  }

  function registerNewProject() {
    describe('registerNewProject', () => {
      it('should register new project', () => {
        createConfigServiceGetConfigParamSpy();
        const newProjectIdExpected = projectIdDefault;
        $httpBackend.when('GET', /^wise5\/.*/).respond(200, '');
        $httpBackend.when('GET', /author\/.*/).respond(200, '{}');
        $httpBackend.when('POST', registerNewProjectURL).respond({ data: newProjectIdExpected });
        $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
        $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
        const newProjectIdActual = ProjectService.registerNewProject(
          scootersProjectName,
          scootersProjectJSONString
        );
        $httpBackend.expectPOST(registerNewProjectURL).respond({ data: newProjectIdExpected });
        newProjectIdActual.then(result => {
          expect(result.data).toEqual(newProjectIdExpected);
        });
        $httpBackend.flush();
      });
    });
  }

  function isNodeIdUsed() {
    describe('isNodeIdUsed', () => {
      it('should find used node id in active nodes', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(ProjectService.isNodeIdUsed('node1')).toEqual(true);
      });

      it('should find used node id in inactive nodes', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(ProjectService.isNodeIdUsed('node789')).toEqual(true);
      });

      it('should not find used node id in active or inactive nodes', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(ProjectService.isNodeIdUsed('nodedoesnotexist')).toEqual(false);
      });
    });
  }

  function isNodeIdToInsertTargetNotSpecified() {
    describe('isNodeIdToInsertTargetNotSpecified', () => {
      it('should return true for null, inactive nodes, steps, and activities', () => {
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified('inactiveNodes')).toBeTruthy();
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified('inactiveSteps')).toBeTruthy();
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified('inactiveGroups')).toBeTruthy();
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified(null)).toBeTruthy();
      });

      it('should return false for active nodes and groups', () => {
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified('activeNodes')).toBeFalsy();
        expect(ProjectService.isNodeIdToInsertTargetNotSpecified('activeGroups')).toBeFalsy();
      });
    });
  }

  function testDeleteComponent() {
    describe('deleteComponent', () => {
      it('should delete the component from the node', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(
          ProjectService.getComponentByNodeIdAndComponentId('node1', 'zh4h1urdys')
        ).not.toBeNull();
        ProjectService.deleteComponent('node1', 'zh4h1urdys');
        expect(ProjectService.getComponentByNodeIdAndComponentId('node1', 'zh4h1urdys')).toBeNull();
      });
    });
  }

  function testDeleteTransition() {
    describe('deleteTransition', () => {
      it('should delete existing transition from the node', () => {
        ProjectService.setProject(demoProjectJSON);
        const node1 = ProjectService.getNodeById('node1');
        expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeTruthy();
        ProjectService.deleteTransition(node1, node1.transitionLogic.transitions[0]);
        expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeFalsy();
      });
    });
  }

  function testGetNodeIdAfter() {
    describe('getNodeIdAfter', () => {
      it('should return the next node in the sequence', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(ProjectService.getNodeIdAfter('node12')).toEqual('node13');
        expect(ProjectService.getNodeIdAfter('node19')).toEqual('group2');
      });
      it('should return null if the node is last', () => {
        ProjectService.setProject(demoProjectJSON);
        expect(ProjectService.getNodeIdAfter('node39')).toBeNull();
      });
    });
  }

  function testCreateNodeAfter() {
    describe('createNodeAfter', () => {
      it('should put a new step node after a step node', () => {
        const newNode = {
          id: 'node1000',
          type: 'node'
        };
        ProjectService.setProject(demoProjectJSON);
        ProjectService.createNodeAfter(newNode, 'node19');
        ProjectService.parseProject();
        expect(ProjectService.idToNode[newNode.id]).toEqual(newNode);
        expect(newNode.transitionLogic.transitions[0].to).toEqual('node20');
        expect(ProjectService.getNodeIdAfter('node19')).toEqual('node1000');
      });
    });
  }
});
