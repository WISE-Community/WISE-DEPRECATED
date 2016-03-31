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
        };

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

        it('should not replace asset paths in html component content', function () {
            createNormalSpy();
            var contentString = "<source type=\"video/mp4\">";
            var contentStringReplacedAssetPathExpected = "<source type=\"video/mp4\">";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should retrieve project when Config.projectURL is valid', function () {
            createNormalSpy();
            spyOn(ProjectService, "setProject").and.callThrough(); // actually call through the function
            spyOn(ProjectService, "parseProject");
            $httpBackend.when('GET', new RegExp(projectURL)).respond(scootersProjectJSON);
            $httpBackend.expectGET(new RegExp(projectURL));
            var projectPromise = ProjectService.retrieveProject();
            $httpBackend.flush();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(ProjectService.setProject).toHaveBeenCalledWith(scootersProjectJSON);
            expect(ProjectService.parseProject).toHaveBeenCalled();
            expect(ProjectService.project).toEqual(scootersProjectJSON);
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
            var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });

        it('should not register new project when Config.registerNewProjectURL is undefined', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
            expect($httpBackend.flush).toThrowError('No pending request to flush !'); // HTTP request should not be made
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

        // MARK: Save Project
        it('should save project', function () {
            spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            $httpBackend.when('POST', saveProjectURL).respond({ data: defaultCommitHistory });
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            $httpBackend.flush();
            $httpBackend.expectPOST(saveProjectURL);
        });

        it('should not save project when Config.saveProjectURL is undefined', function () {
            spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });

        it('should not save project when Config.projectId is undefined', function () {
            spyOn(ConfigService, "getProjectId").and.returnValue(null);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });

        // MARK: ThemePath
        it('should get default theme path when theme is not defined in the project', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var expectedThemePath = wiseBaseURL + "/wise5/vle/themes/default";
            var actualThemePath = ProjectService.getThemePath();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("wiseBaseURL");
            expect(actualThemePath).toEqual(expectedThemePath);
        });

        it('should get project theme path when theme is defined in the project', function () {
            spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
            ProjectService.setProject(demoProjectJSON); // Set the sample project and parse it
            var demoProjectTheme = demoProjectJSON.theme; // Demo Project has a theme defined
            var expectedThemePath = wiseBaseURL + "/wise5/vle/themes/" + demoProjectTheme;
            var actualThemePath = ProjectService.getThemePath();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("wiseBaseURL");
            expect(actualThemePath).toEqual(expectedThemePath);
        });

        // TODO: add test for ProjectService.getFlattenedProjectAsNodeIds()
        // TODO: add test for ProjectService.getAllPaths()
        // TODO: add test for ProjectService.consolidatePaths()
        // TODO: add test for ProjectService.consumePathsUntilNodeId()
        // TODO: add test for ProjectService.getFirstNodeIdInPathAtIndex()
        // TODO: add test for ProjectService.removeNodeIdFromPaths()
        // TODO: add test for ProjectService.removeNodeIdFromPath()

        // TODO: add test for ProjectService.areFirstNodeIdsInPathsTheSame()
        // TODO: add test for ProjectService.arePathsEmpty()
        // TODO: add test for ProjectService.getPathsThatContainNodeId()
        // TODO: add test for ProjectService.getNonEmptyPathIndex()
        // TODO: add test for ProjectService.getBranches()
        // TODO: add test for ProjectService.findBranches()

        // TODO: add test for ProjectService.createBranchMetaObject()
        // TODO: add test for ProjectService.findNextCommonNodeId()
        // TODO: add test for ProjectService.allPathsContainNodeId()
        // TODO: add test for ProjectService.trimPathsUpToNodeId()
        // TODO: add test for ProjectService.extractPathsUpToNodeId()
        // TODO: add test for ProjectService.removeDuplicatePaths()
        // TODO: add test for ProjectService.pathsEqual()

        // TODO: add test for ProjectService.isNodeIdInABranch()
        // TODO: add test for ProjectService.getBranchPathsByNodeId()

        // TODO: add test for ProjectService.getNodeContentByNodeId()

        // TODO: add test for ProjectService.replaceComponent()
        // TODO: add test for ProjectService.createGroup()
        // TODO: add test for ProjectService.createNode()
        // TODO: add test for ProjectService.createNodeInside()
        // TODO: add test for ProjectService.createNodeAfter()
        // TODO: add test for ProjectService.insertNodeAfterInGroups()
        // TODO: add test for ProjectService.insertNodeAfterInTransitions()

        // TODO: add test for ProjectService.insertNodeInsideInGroups()
        // TODO: add test for ProjectService.insertNodeInsideInTransitions()

        // MARK: Tests for Node and Group Id functions
        // test ProjectService.getStartNodeId()
        it('should return the start node of the project', function () {
            ProjectService.setProject(demoProjectJSON); // Set the sample project and parse it
            var expectedStartNodeId = "node1"; // Demo project's start node id
            var actualStartNodeId = ProjectService.getStartNodeId();
            expect(actualStartNodeId).toEqual(expectedStartNodeId);

            ProjectService.setProject(null); // Set a null project
            var nullProjectStartNodeId = ProjectService.getStartNodeId();
            expect(nullProjectStartNodeId).toBeNull();
        });

        // test ProjectService.getNodeById()
        it('should return the node by nodeId', function () {
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var node1 = ProjectService.getNodeById("node1");
            expect(node1.type).toEqual("node");
            expect(node1.title).toEqual("Introduction to Newton Scooters");
            expect(node1.components.length).toEqual(1);

            // Call getNodeId with null and expect a null return value
            var nodeBadArgs = ProjectService.getNodeById();
            expect(nodeBadArgs).toBeNull();

            // Test node that doesn't exist in project and make sure the function returns null
            var nodeNE = ProjectService.getNodeById("node999");
            expect(nodeNE).toBeNull();
        });

        // test ProjectService.getNodeTitleByNodeId()
        it('should return the node title by nodeId', function () {
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var node1Title = ProjectService.getNodeTitleByNodeId("node1");
            expect(node1Title).toEqual("Introduction to Newton Scooters");

            // Call getNodeTitleByNodeId with null and expect a null return value
            var nodeTitleBadArgs = ProjectService.getNodeTitleByNodeId();
            expect(nodeTitleBadArgs).toBeNull();

            // Test node that doesn't exist in project and make sure the function returns null
            var nodeTitleNE = ProjectService.getNodeTitleByNodeId("node999");
            expect(nodeTitleNE).toBeNull();
        });

        // TODO: add test for ProjectService.getNodePositionAndTitleByNodeId()
        // TODO: add test for ProjectService.getNodeIconByNodeId()

        // test ProjectService.getNextAvailableNodeId()
        it('should return the next available node id', function () {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var nextNodeIdExpected = "node41"; // This should be the next available node id.
            var nextNodeIdActual = ProjectService.getNextAvailableNodeId();
            expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
        });

        // test ProjectService.getNextAvailableGroupId()
        it('should return the next available group id', function () {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var nextGroupIdExpected = "group7"; // This should be the next available group id.
            var nextGroupIdActual = ProjectService.getNextAvailableGroupId();
            expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
        });

        // test ProjectService.getGroupIds()
        it('should return the group ids in the project', function () {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var groupIdsExpected = ["group0", "group1", "group2", "group3", "group4", "group5", "group6"]; // This should be the group ids in the project
            var groupIdsActual = ProjectService.getGroupIds();
            expect(groupIdsActual).toEqual(groupIdsExpected);
        });

        // test ProjectService.getNodeIds()
        it('should return the node ids in the project', function () {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            var nodeIdsExpected = ['node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7', 'node9', 'node12', 'node13', 'node14', 'node18', 'node19', 'node21', 'node22', 'node23', 'node24', 'node25', 'node26', 'node27', 'node28', 'node29', 'node30', 'node31', 'node40', 'node32', 'node33', 'node34', 'node35', 'node36', 'node37', 'node38', 'node39', 'nodeWithNoComponents']; // This should be the node ids in the project
            var nodeIdsActual = ProjectService.getNodeIds();
            expect(nodeIdsActual).toEqual(nodeIdsExpected);
        });

        // test ProjectService.getComponentByNodeIdAndComponentId()
        it('should get the component by node id and comonent id', function () {
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            // nodeId is null
            var nullNodeIdResult = ProjectService.getComponentByNodeIdAndComponentId(null, "57lxhwfp5r");
            expect(nullNodeIdResult).toBeNull();

            // componentId is null
            var nullComponentIdResult = ProjectService.getComponentByNodeIdAndComponentId("node13", null);
            expect(nullComponentIdResult).toBeNull();

            // nodeId doesn't exist
            var nodeIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId("badNodeId", "57lxhwfp5r");
            expect(nodeIdDNEResult).toBeNull();

            // componentId doesn't exist
            var componentIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId("node13", "badComponentId");
            expect(componentIdDNEResult).toBeNull();

            // nodeId and componentId are valid and the component exists in the project
            var componentExists = ProjectService.getComponentByNodeIdAndComponentId("node13", "57lxhwfp5r");
            expect(componentExists).not.toBe(null);
            expect(componentExists.type).toEqual("HTML");

            var componentExists2 = ProjectService.getComponentByNodeIdAndComponentId("node9", "mnzx68ix8h");
            expect(componentExists2).not.toBe(null);
            expect(componentExists2.type).toEqual("embedded");
            expect(componentExists2.url).toEqual("NewtonScooters-potential-kinetic.html");
        });

        // test ProjectService.getComponentPositionByNodeIdAndComponentId()
        it('should get the component position by node id and comonent id', function () {
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            // nodeId is null
            var nullNodeIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId(null, "57lxhwfp5r");
            expect(nullNodeIdResult).toEqual(-1);

            // componentId is null
            var nullComponentIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", null);
            expect(nullComponentIdResult).toEqual(-1);

            // nodeId doesn't exist
            var nodeIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId("badNodeId", "57lxhwfp5r");
            expect(nodeIdDNEResult).toEqual(-1);

            // componentId doesn't exist
            var componentIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", "badComponentId");
            expect(componentIdDNEResult).toEqual(-1);

            // nodeId and componentId are valid and the component exists in the project
            var componentExists = ProjectService.getComponentPositionByNodeIdAndComponentId("node13", "57lxhwfp5r");
            expect(componentExists).toEqual(0);

            var componentExists2 = ProjectService.getComponentPositionByNodeIdAndComponentId("node9", "mnzx68ix8h");
            expect(componentExists2).toEqual(1);
        });

        // test ProjectService.getComponentsByNodeId()
        it('should get the components by node id', function () {
            ProjectService.setProject(scootersProjectJSON); // Set the sample project and parse it
            // nodeId is null
            var nullNodeIdResult = ProjectService.getComponentsByNodeId(null);
            expect(nullNodeIdResult).toEqual([]);

            // nodeId doesn't exist
            var nodeIdDNEResult = ProjectService.getComponentsByNodeId("badNodeId");
            expect(nodeIdDNEResult).toEqual([]);

            // nodeId exists but the node.components is null
            var nodeWithNullComponentResult = ProjectService.getComponentsByNodeId("nodeWithNoComponents");
            expect(nodeWithNullComponentResult).toEqual([]);

            // nodeId is are valid and the node exists in the project
            var nodeExistsResult = ProjectService.getComponentsByNodeId("node13");
            expect(nodeExistsResult).not.toBe(null);
            expect(nodeExistsResult.length).toEqual(1);
            expect(nodeExistsResult[0].id).toEqual("57lxhwfp5r");

            var nodeExistsResult2 = ProjectService.getComponentsByNodeId("node9");
            expect(nodeExistsResult2).not.toBe(null);
            expect(nodeExistsResult2.length).toEqual(7);
            expect(nodeExistsResult2[2].id).toEqual("nm080ntk8e");
            expect(nodeExistsResult2[2].type).toEqual("Table");
        });

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

        // test ProjectService.getMaxScore()
        it('should return the max score of the project', function () {
            // Demo Project doesn't have any max scores, so we expect getMaxScore to return null
            ProjectService.setProject(demoProjectJSON); // Set the sample demo project and parse it
            var demoProjectMaxScoreActual = ProjectService.getMaxScore();
            expect(demoProjectMaxScoreActual).toBeNull(); // When the project doesn't have any max scores defined, max score should be null

            // Sample Scooter Project's max score is 18.
            ProjectService.setProject(scootersProjectJSON); // Set the sample scooter project and parse it
            var scootersProjectMaxScoreExpected = 18;
            var scootersProjectMaxScoreActual = ProjectService.getMaxScore();
            expect(scootersProjectMaxScoreActual).toEqual(scootersProjectMaxScoreExpected);
        });
    });
});
//# sourceMappingURL=projectService.spec.js.map