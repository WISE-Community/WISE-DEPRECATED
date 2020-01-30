import authoringToolModule from '../../authoringTool/authoringTool';

describe('AuthoringToolProjectService Unit Test', () => {

  beforeEach(angular.mock.module(authoringToolModule.name));

  const demoProjectJSONOriginal =
      window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
  const scootersProjectJSONOriginal =
      window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];

  let ConfigService, ProjectService, $rootScope, $httpBackend,  demoProjectJSON,
      scootersProjectJSON;
  beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSONOriginal));
  }));

  describe('AuthoringToolProjectService', () => {
    const scootersProjectJSONString = JSON.stringify(scootersProjectJSONOriginal);
    const scootersProjectName = "scooters";
    const invalidProjectJSONString = "{'a':1";
    const projectIdDefault = 1;
    const projectBaseURL = "http://localhost:8080/curriculum/12345/";
    const projectURL = projectBaseURL + "project.json";
    const registerNewProjectURL = "http://localhost:8080/wise/project/new";
    const saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
    const wiseBaseURL = "/wise";
    const i18nURL_common_en = "wise5/i18n/i18n_en.json";
    const i18nURL_vle_en = "wise5/vle/i18n/i18n_en.json";
    const sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    const sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

    function createConfigServiceGetConfigParamSpy() {
      spyOn(ConfigService, "getConfigParam").and.callFake((param) => {
        if (param === "projectBaseURL") {
          return projectBaseURL;
        } else if (param === "projectURL") {
          return projectURL;
        } else if (param === "registerNewProjectURL") {
          return registerNewProjectURL;
        } else if (param === "saveProjectURL") {
          return saveProjectURL;
        } else if (param === "wiseBaseURL") {
          return wiseBaseURL;
        }
      });
    }

    it('should register new project', () => {
      createConfigServiceGetConfigParamSpy();
      const newProjectIdExpected = projectIdDefault;
      $httpBackend.when('GET', /^wise5\/.*/).respond(200, '');
      $httpBackend.when('GET', /author\/.*/).respond(200, '{}');
      $httpBackend.when('POST', registerNewProjectURL).respond({data: newProjectIdExpected});
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      const newProjectIdActual = ProjectService.registerNewProject(scootersProjectName,
          scootersProjectJSONString);
      $httpBackend.expectPOST(registerNewProjectURL).respond({data: newProjectIdExpected});
      newProjectIdActual.then((result) => {
        expect(result.data).toEqual(newProjectIdExpected);
      });
      $httpBackend.flush();
    });

    it('should find used node id in active nodes', () => {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isNodeIdUsed("node1")).toEqual(true);
    });

    it('should find used node id in inactive nodes', () => {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isNodeIdUsed("node789")).toEqual(true);
    });

    it('should not find used node id in active or inactive nodes', () => {
      ProjectService.setProject(demoProjectJSON);
      expect(ProjectService.isNodeIdUsed("nodedoesnotexist")).toEqual(false);
    });
  });
});
