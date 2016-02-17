'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ProjectService Unit Test', function () {
    beforeEach(_angular2.default.mock.module(_main2.default.name));

    var ConfigService, ProjectService, $rootScope, $httpBackend;

    beforeEach(inject(function (_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
        ConfigService = _ConfigService_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ProjectService', function () {

        // Load sample project
        var projectJSON = window.mocks['test-unit/curriculum/SelfPropelledVehiclesChallenge/project'];

        var projectIdDefault = 1;
        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        var projectURL = projectBaseURL + "project.json";
        var registerNewProjectURL = "http://localhost:8080/wise/project/new";
        var saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
        var commitMessageDefault = "Made simple changes";

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
                }
            });
        };

        beforeEach(function () {});

        it('should replace asset paths in non-html component content', function () {
            createNormalSpy();
            var contentString = "<img src=\'hello.png\' /><style>{background-url:\'background.jpg\'}</style>";
            var contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' /><style>{background-url:\'" + projectBaseURL + "assets/background.jpg\'}</style>";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should replace asset paths in html component content', function () {
            createNormalSpy();
            var contentString = "style=\\\"background-image: url(\\\"background.jpg\\\")\\\"";
            var contentStringReplacedAssetPathExpected = "style=\\\"background-image: url(\\\"" + projectBaseURL + "assets/background.jpg\\\")\\\"";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should retrieve project when Config.projectURL is valid', function () {
            createNormalSpy();
            spyOn(ProjectService, "setProject").and.callThrough(); // actually call through the function
            spyOn(ProjectService, "parseProject");
            $httpBackend.when('GET', projectURL).respond(projectJSON);
            $httpBackend.expectGET(projectURL);
            var projectPromise = ProjectService.retrieveProject();
            $httpBackend.flush();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(ProjectService.setProject).toHaveBeenCalledWith(projectJSON);
            expect(ProjectService.parseProject).toHaveBeenCalled();
            expect(ProjectService.project).toEqual(projectJSON);
        });

        it('should not retrieve project when Config.projectURL is undefined', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var project = ProjectService.retrieveProject();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(project).toBeNull();
        });

        // MARK: Register Project
        it('should register new project', function () {
            createNormalSpy();
            var newProjectIdExpected = projectIdDefault; // Id of new project created on the server
            $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSON, commitMessageDefault);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });

        it('should not register new project when Config.registerNewProjectURL is undefined', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSON, commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
            expect(newProjectIdActualPromise).toBeNull();
        });

        // TODO: add test for ProjectService.registerNewProject when projectJSON is invalid JSON

        // MARK: Save Project
        it('should not save project when Config.saveProjectURL is undefined', function () {
            spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var newProjectIdActualPromise = ProjectService.saveProject(projectJSON, commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(newProjectIdActualPromise).toBeNull();
        });

        it('should not save project when Config.projectId is undefined', function () {
            spyOn(ConfigService, "getProjectId").and.returnValue(null);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            var newProjectIdActualPromise = ProjectService.saveProject(projectJSON, commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(newProjectIdActualPromise).toBeNull();
        });

        // TODO: add test for ProjectService.saveProject when projectJSON is invalid JSON
        // TODO: add test for ProjectService.saveProject when Config.saveProjectURL and Config.projectId are set and projectJSON is valid

        // MARK: Tests for Node and Group Id functions
        it('should return the next available node id', function () {
            createNormalSpy();
            ProjectService.setProject(projectJSON); // Set the sample project and parse it
            var nextNodeIdExpected = "node8"; // This should be the next available node id.
            var nextNodeIdActual = ProjectService.getNextAvailableNodeId();
            expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
        });

        it('should return the next available group id', function () {
            createNormalSpy();
            ProjectService.setProject(projectJSON); // Set the sample project and parse it
            var nextGroupIdExpected = "group7"; // This should be the next available group id.
            var nextGroupIdActual = ProjectService.getNextAvailableGroupId();
            expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
        });

        it('should return the group ids in the project', function () {
            createNormalSpy();
            ProjectService.setProject(projectJSON); // Set the sample project and parse it
            var groupIdsExpected = ["group0", "group1", "group2", "group3", "group4", "group5", "group6"]; // This should be the group ids in the project
            var groupIdsActual = ProjectService.getGroupIds();
            expect(groupIdsActual).toEqual(groupIdsExpected);
        });

        // TODO: add test for ProjectService.getNodeIds()
        // TODO: add test for ProjectService.moveNodesInside()
        // TODO: add test for ProjectService.moveNodesAfter()
        // TODO: add test for ProjectService.deleteNode()
        // TODO: add test for ProjectService.removeNodeIdFromTransitions()
        // TODO: add test for ProjectService.removeNodeIdFromGroups()
        // TODO: add test for ProjectService.removeNodeIdFromNodes()
        // TODO: add test for ProjectService.createComponent()
        // TODO: add test for ProjectService.addComponentToNode()
        // TODO: add test for ProjectService.moveComponentUp()
        // TODO: add test for ProjectService.moveComponentDown()
        // TODO: add test for ProjectService.deleteComponent()
        // TODO: add test for ProjectService.getMaxScore()
    });
});
//# sourceMappingURL=projectService.spec.js.map