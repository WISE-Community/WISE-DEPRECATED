import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('ProjectService Unit Test', function () {
    beforeEach(angular.mock.module(mainModule.name));

    var ConfigService, ProjectService, $rootScope, $httpBackend;

    beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
        ConfigService = _ConfigService_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ProjectService', function () {

        // Load sample projects
        var demoProjectJSON = window.mocks['test-unit/curriculum/DemoProject/project'];
        var demoProjectJSONString = JSON.stringify(demoProjectJSON);
        var scootersProjectJSON = window.mocks['test-unit/curriculum/SelfPropelledVehiclesChallenge/project'];
        var scootersProjectJSONString = JSON.stringify(scootersProjectJSON);
        var invalidProjectJSONString = "{'a':1";

        var projectIdDefault = 1;
        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        var projectURL = projectBaseURL + "project.json";
        var registerNewProjectURL = "http://localhost:8080/wise/project/new";
        var saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
        var commitMessageDefault = "Made simple changes";
        var defaultCommitHistory = [{"id":"abc","message":"first commit"}, {"id":"def", "message":"second commit"}];
        var wiseBaseURL = "/wise";

        function createNormalSpy() {
            spyOn(ConfigService, "getConfigParam").and.callFake(function(param) {
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

        beforeEach(function() {
        });

        it('should replace asset paths in non-html component content', function () {
            createNormalSpy();
            let contentString = "<img src=\'hello.png\' /><style>{background-url:\'background.jpg\'}</style>";
            let contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' /><style>{background-url:\'" + projectBaseURL + "assets/background.jpg\'}</style>";
            let contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should replace asset paths in html component content', function () {
            createNormalSpy();
            let contentString = "style=\\\"background-image: url(\\\"background.jpg\\\")\\\"";
            let contentStringReplacedAssetPathExpected = "style=\\\"background-image: url(\\\"" + projectBaseURL + "assets/background.jpg\\\")\\\"";
            let contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should retrieve project when Config.projectURL is valid', function() {
            createNormalSpy();
            spyOn(ProjectService, "setProject").and.callThrough(); // actually call through the function
            spyOn(ProjectService, "parseProject");
            $httpBackend.when('GET', projectURL).respond(scootersProjectJSON);
            $httpBackend.expectGET(projectURL);
            let projectPromise = ProjectService.retrieveProject();
            $httpBackend.flush();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(ProjectService.setProject).toHaveBeenCalledWith(scootersProjectJSON);
            expect(ProjectService.parseProject).toHaveBeenCalled();
            expect(ProjectService.project).toEqual(scootersProjectJSON);
        });

        it('should not retrieve project when Config.projectURL is undefined', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            let project = ProjectService.retrieveProject();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(project).toBeNull();
        });

        // MARK: Register Project
        it('should register new project', function() {
            createNormalSpy();
            var newProjectIdExpected = projectIdDefault; // Id of new project created on the server
            $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
            var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });

        it('should not register new project when Config.registerNewProjectURL is undefined', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var newProjectIdActualPromise = ProjectService.registerNewProject(scootersProjectJSONString, commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
            expect($httpBackend.flush).toThrowError('No pending request to flush !'); // HTTP request should not be made
            expect(newProjectIdActualPromise).toBeNull();
        });

        it('should not register new project when projectJSON is invalid JSON', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(registerNewProjectURL);
            try {
                var newProjectIdActualPromise = ProjectService.registerNewProject(invalidProjectJSONString, commitMessageDefault);
                expect(1).toEqual(2);   // This line should not get called because the above line will throw an error
            } catch (e) {
                expect(ConfigService.getConfigParam).toHaveBeenCalledWith("registerNewProjectURL");
                expect(e.message).toEqual("Invalid projectJSONString.")
            }
        });

        // MARK: Save Project
        it('should save project', function() {
            spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            $httpBackend.when('POST', saveProjectURL).respond({data: defaultCommitHistory});
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            $httpBackend.flush();
            $httpBackend.expectPOST(saveProjectURL);
        });

        it('should not save project when Config.saveProjectURL is undefined', function() {
            spyOn(ConfigService, "getProjectId").and.returnValue(projectIdDefault);
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });

        it('should not save project when Config.projectId is undefined', function() {
            spyOn(ConfigService, "getProjectId").and.returnValue(null);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });

        // MARK: ThemePath
        it('should get default theme path when theme is not defined in the project', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let expectedThemePath = wiseBaseURL + "/wise5/vle/themes/default";
            let actualThemePath = ProjectService.getThemePath();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("wiseBaseURL");
            expect(actualThemePath).toEqual(expectedThemePath);
        });

        it('should get project theme path when theme is defined in the project', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(wiseBaseURL);
            ProjectService.setProject(demoProjectJSON);  // Set the sample project and parse it
            let demoProjectTheme = demoProjectJSON.theme;  // Demo Project has a theme defined
            let expectedThemePath = wiseBaseURL + "/wise5/vle/themes/" + demoProjectTheme;
            let actualThemePath = ProjectService.getThemePath();
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
        // TODO: add test for ProjectService.getComponentByNodeIdAndComponentId()
        // TODO: add test for ProjectService.getComponentPositionByNodeIdAndComponentId()
        // TODO: add test for ProjectService.getComponentsByNodeId()
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
        it('should return the start node of the project', function() {
            ProjectService.setProject(demoProjectJSON);  // Set the sample project and parse it
            let expectedStartNodeId = "node1";  // Demo project's start node id
            let actualStartNodeId = ProjectService.getStartNodeId();
            expect(actualStartNodeId).toEqual(expectedStartNodeId);

            ProjectService.setProject(null);  // Set a null project
            let nullProjectStartNodeId = ProjectService.getStartNodeId();
            expect(nullProjectStartNodeId).toBeNull();
        });

        // test ProjectService.getNodeById()
        it('should return the node by nodeId', function() {
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let node1 = ProjectService.getNodeById("node1");
            expect(node1.type).toEqual("node");
            expect(node1.title).toEqual("Introduction to Newton Scooters");
            expect(node1.components.length).toEqual(1);

            // Call getNodeId with null and expect a null return value
            let nodeBadArgs = ProjectService.getNodeById();
            expect(nodeBadArgs).toBeNull();

            // Test node that doesn't exist in project and make sure the function returns null
            let nodeNE = ProjectService.getNodeById("node999");
            expect(nodeNE).toBeNull();
        });

        // test ProjectService.getNodeTitleByNodeId()
        it('should return the node title by nodeId', function() {
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let node1Title = ProjectService.getNodeTitleByNodeId("node1");
            expect(node1Title).toEqual("Introduction to Newton Scooters");

            // Call getNodeTitleByNodeId with null and expect a null return value
            let nodeTitleBadArgs = ProjectService.getNodeTitleByNodeId();
            expect(nodeTitleBadArgs).toBeNull();

            // Test node that doesn't exist in project and make sure the function returns null
            let nodeTitleNE = ProjectService.getNodeTitleByNodeId("node999");
            expect(nodeTitleNE).toBeNull();
        });

        // TODO: add test for ProjectService.getNodePositionAndTitleByNodeId()
        // TODO: add test for ProjectService.getNodeIconByNodeId()

        // test ProjectService.getNextAvailableNodeId()
        it('should return the next available node id', function() {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let nextNodeIdExpected = "node8";      // This should be the next available node id.
            let nextNodeIdActual = ProjectService.getNextAvailableNodeId();
            expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
        });

        // test ProjectService.getNextAvailableGroupId()
        it('should return the next available group id', function() {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let nextGroupIdExpected = "group7";      // This should be the next available group id.
            let nextGroupIdActual = ProjectService.getNextAvailableGroupId();
            expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
        });

        // test ProjectService.getGroupIds()
        it('should return the group ids in the project', function() {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let groupIdsExpected = ["group0","group1","group2","group3","group4","group5","group6"];      // This should be the group ids in the project
            let groupIdsActual = ProjectService.getGroupIds();
            expect(groupIdsActual).toEqual(groupIdsExpected);
        });

        // test ProjectService.getNodeIds()
        it('should return the node ids in the project', function() {
            createNormalSpy();
            ProjectService.setProject(scootersProjectJSON);  // Set the sample project and parse it
            let nodeIdsExpected = ['node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7',
                'node9', 'node12', 'node13', 'node14', 'node18', 'node19', 'node21', 'node22',
                'node23', 'node24', 'node25', 'node26', 'node27', 'node28', 'node29', 'node30',
                'node31', 'node40', 'node32', 'node33', 'node34', 'node35', 'node36', 'node37',
                'node38', 'node39'];      // This should be the node ids in the project
            let nodeIdsActual = ProjectService.getNodeIds();
            expect(nodeIdsActual).toEqual(nodeIdsExpected);
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
        it('should return the max score of the project', function() {
            // Demo Project doesn't have any max scores, so we expect getMaxScore to return null
            ProjectService.setProject(demoProjectJSON);  // Set the sample demo project and parse it
            let demoProjectMaxScoreActual = ProjectService.getMaxScore();
            expect(demoProjectMaxScoreActual).toBeNull(); // When the project doesn't have any max scores defined, max score should be null

            // Sample Scooter Project's max score is 18.
            ProjectService.setProject(scootersProjectJSON);  // Set the sample scooter project and parse it
            let scootersProjectMaxScoreExpected = 18;
            let scootersProjectMaxScoreActual = ProjectService.getMaxScore();
            expect(scootersProjectMaxScoreActual).toEqual(scootersProjectMaxScoreExpected);
        });

    });
});