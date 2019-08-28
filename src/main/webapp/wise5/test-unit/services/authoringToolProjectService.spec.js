import authoringToolModule from '../../authoringTool/authoringTool';

describe('AuthoringToolProjectService Unit Test', () => {

  beforeEach(angular.mock.module(authoringToolModule.name));

  const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
  const scootersProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];

  let ConfigService, ProjectService, $rootScope, $httpBackend,  demoProjectJSON, scootersProjectJSON;
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
    const invalidProjectJSONString = "{'a':1";
    const projectIdDefault = 1;
    const projectBaseURL = "http://localhost:8080/curriculum/12345/";
    const projectURL = projectBaseURL + "project.json";
    const registerNewProjectURL = "http://localhost:8080/wise/project/new";
    const saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
    const commitMessageDefault = "Made simple changes";
    const defaultCommitHistory = [{"id":"abc","message":"first commit"}, {"id":"def", "message":"second commit"}];
    const wiseBaseURL = "/wise";
    const i18nURL_common_en = "wise5/i18n/i18n_en.json";
    const i18nURL_vle_en = "wise5/vle/i18n/i18n_en.json";
    const sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    const sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

    function createNormalSpy() {
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
      spyOn(ConfigService, "getConfigParam").and.returnValue(registerNewProjectURL);
      const newProjectIdExpected = projectIdDefault;
      $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      const newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
      $httpBackend.expectPOST(registerNewProjectURL);
    });

    it('should not register new project when Config.registerNewProjectURL is undefined', () => {
      spyOn(ConfigService, "getConfigParam").and.returnValue(null);
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      const newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
      expect(newProjectIdActualPromise).toBeNull();
    });

    it('should not register new project when projectJSON is invalid JSON', () => {
      spyOn(ConfigService, "getConfigParam").and.returnValue(registerNewProjectURL);
      try {
        const newProjectIdActualPromise = ProjectService.registerNewProject(invalidProjectJSONString, commitMessageDefault);
        expect(1).toEqual(2);   // This line should not get called because the above line will throw an error
      } catch (e) {
        expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
        expect(e.message).toEqual("Invalid projectJSONString.")
      }
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
