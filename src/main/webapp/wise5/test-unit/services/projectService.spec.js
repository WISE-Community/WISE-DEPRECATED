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

        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        var projectURL = projectBaseURL + "project.json";
        var registerNewProjectURL = "http://localhost:8080/wise/project/new";

        function createNormalSpy() {
            spyOn(ConfigService, "getConfigParam").and.callFake(function (param) {
                if (param === "projectBaseURL") {
                    return projectBaseURL;
                } else if (param === "projectURL") {
                    return projectURL;
                } else if (param === "registerNewProjectURL") {
                    return registerNewProjectURL;
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

        it('should register new project', function () {
            createNormalSpy();
            var newProjectIdExpected = 1; // Id of new project created on the server
            $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
            var commitMessage = "I moved the mc step to activity 3.";
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSON, commitMessage);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });

        // TODO: add test for ProjectService.saveProject when Config.saveProjectURL is undefined or Config.projectId is undefined
        // TODO: add test for ProjectService.saveProject when Config.saveProjectURL and Config.projectId are set
        // TODO: add test for ProjectService.registerNewProject when Config.saveProjectURL is undefined
        // TODO: add test for ProjectService.registerNewProject when Config.saveProjectURL is set

        // MARK: Tests for Node and Group Id functions

        it('should return the next available node id', function () {
            createNormalSpy();
            ProjectService.project = projectJSON; // Set the sample project
            ProjectService.parseProject(); // Parse the project
            var nextNodeIdExpected = "node8"; // This should be the next available node id.
            var nextNodeIdActual = ProjectService.getNextAvailableNodeId();
            expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
        });

        it('should return the next available group id', function () {
            createNormalSpy();
            ProjectService.project = projectJSON; // Set the sample project
            ProjectService.parseProject(); // Parse the project
            var nextGroupIdExpected = "group7"; // This should be the next available group id.
            var nextGroupIdActual = ProjectService.getNextAvailableGroupId();
            expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
        });

        it('should return the group ids in the project', function () {
            createNormalSpy();
            ProjectService.project = projectJSON; // Set the sample project
            ProjectService.parseProject(); // Parse the project
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