'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AuthoringToolProjectService Unit Test', function () {

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  var ConfigService = void 0,
      ProjectService = void 0,
      $rootScope = void 0,
      $httpBackend = void 0;
  beforeEach(inject(function (_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
  }));

  describe('AuthoringToolProjectService', function () {
    // Load sample projects
    var demoProjectJSON = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
    var demoProjectJSONString = JSON.stringify(demoProjectJSON);
    var scootersProjectJSON = window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];
    var scootersProjectJSONString = JSON.stringify(scootersProjectJSON);
    var invalidProjectJSONString = "{'a':1";

    var projectIdDefault = 1;
    var projectBaseURL = "http://localhost:8080/curriculum/12345/";
    var projectURL = projectBaseURL + "project.json";
    var registerNewProjectURL = "http://localhost:8080/wise/project/new";
    var saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
    var commitMessageDefault = "Made simple changes";
    var defaultCommitHistory = [{ "id": "abc", "message": "first commit" }, { "id": "def", "message": "second commit" }];
    var wiseBaseURL = "/wise";

    // i18n
    var i18nURL_common_en = "wise5/i18n/common/i18n_en.json";
    var i18nURL_vle_en = "wise5/i18n/vle/i18n_en.json";
    var sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    var sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

    function createNormalSpy() {
      spyOn(ConfigService, "getConfigParam").and.callFake(function (param) {
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

    // MARK: Register Project
    xit('should register new project', function () {
      createNormalSpy();
      var newProjectIdExpected = projectIdDefault; // Id of new project created on the server
      $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
      $httpBackend.flush();
      $httpBackend.expectPOST(registerNewProjectURL);
    });

    it('should not register new project when Config.registerNewProjectURL is undefined', function () {
      spyOn(ConfigService, "getConfigParam").and.returnValue(null);
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
      expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
      expect(newProjectIdActualPromise).toBeNull();
    });

    it('should not register new project when projectJSON is invalid JSON', function () {
      spyOn(ConfigService, "getConfigParam").and.returnValue(registerNewProjectURL);
      try {
        var newProjectIdActualPromise = ProjectService.registerNewProject(invalidProjectJSONString, commitMessageDefault);
        expect(1).toEqual(2); // This line should not get called because the above line will throw an error
      } catch (e) {
        expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
        expect(e.message).toEqual("Invalid projectJSONString.");
      }
    });
  });
});
//# sourceMappingURL=authoringToolProjectService.spec.js.map
