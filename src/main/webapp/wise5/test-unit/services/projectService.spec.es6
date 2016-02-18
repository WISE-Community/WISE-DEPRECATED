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

        // Load sample project
        var projectJSON = window.mocks['test-unit/curriculum/SelfPropelledVehiclesChallenge/project'];
        var projectJSONString = JSON.stringify(projectJSON);
        var invalidProjectJSONString = "{'a':1";

        var projectIdDefault = 1;
        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        var projectURL = projectBaseURL + "project.json";
        var registerNewProjectURL = "http://localhost:8080/wise/project/new";
        var saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
        var commitMessageDefault = "Made simple changes";
        var defaultCommitHistory = [{"id":"abc","message":"first commit"}, {"id":"def", "message":"second commit"}];

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
            spyOn(ProjectService, "setProject").and.callThrough();   // actually call through the function
            spyOn(ProjectService, "parseProject");
            $httpBackend.when('GET', projectURL).respond(projectJSON);
            $httpBackend.expectGET(projectURL);
            let projectPromise = ProjectService.retrieveProject();
            $httpBackend.flush();
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectURL");
            expect(ProjectService.setProject).toHaveBeenCalledWith(projectJSON);
            expect(ProjectService.parseProject).toHaveBeenCalled();
            expect(ProjectService.project).toEqual(projectJSON);
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
            var newProjectIdExpected = projectIdDefault;   // Id of new project created on the server
            $httpBackend.when('POST', registerNewProjectURL).respond(newProjectIdExpected);
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSONString, commitMessageDefault);
            $httpBackend.flush();
            $httpBackend.expectPOST(registerNewProjectURL);
        });

        it('should not register new project when Config.registerNewProjectURL is undefined', function() {
            spyOn(ConfigService, "getConfigParam").and.returnValue(null);
            var newProjectIdActualPromise = ProjectService.registerNewProject(projectJSONString, commitMessageDefault);
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
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
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
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });

        it('should not save project when Config.projectId is undefined', function() {
            spyOn(ConfigService, "getProjectId").and.returnValue(null);
            spyOn(ConfigService, "getConfigParam").and.returnValue(saveProjectURL);
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
            var newProjectIdActualPromise = ProjectService.saveProject(commitMessageDefault);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("saveProjectURL");
            expect(ConfigService.getProjectId).toHaveBeenCalled();
            expect(newProjectIdActualPromise).toBeNull();
        });



        // TODO: add test for ProjectService.getThemePath()
        // TODO: add test for ProjectService.getNodeTypeByNode()
        // TODO: add test for ProjectService.getNodeTitleByNodeId()
        // TODO: add test for ProjectService.getNodePositionAndTitleByNodeId()

        // TODO: add test for ProjectService.getNodeIconByNodeId()
        // TODO: add test for ProjectService.getStudentIsOnGroupNodeClass()
        // TODO: add test for ProjectService.getStudentIsOnApplicationNodeClass()
        // TODO: add test for ProjectService.getStartGroupId()
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
        // test ProjectService.getNextAvailableNodeId()
        it('should return the next available node id', function() {
            createNormalSpy();
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
            let nextNodeIdExpected = "node8";      // This should be the next available node id.
            let nextNodeIdActual = ProjectService.getNextAvailableNodeId();
            expect(nextNodeIdActual).toEqual(nextNodeIdExpected);
        });

        // test ProjectService.getNextAvailableGroupId()
        it('should return the next available group id', function() {
            createNormalSpy();
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
            let nextGroupIdExpected = "group7";      // This should be the next available group id.
            let nextGroupIdActual = ProjectService.getNextAvailableGroupId();
            expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
        });

        // test ProjectService.getGroupIds()
        it('should return the group ids in the project', function() {
            createNormalSpy();
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
            let groupIdsExpected = ["group0","group1","group2","group3","group4","group5","group6"];      // This should be the group ids in the project
            let groupIdsActual = ProjectService.getGroupIds();
            expect(groupIdsActual).toEqual(groupIdsExpected);
        });

        // test ProjectService.getNodeIds()
        it('should return the node ids in the project', function() {
            createNormalSpy();
            ProjectService.setProject(projectJSON);  // Set the sample project and parse it
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
        // TODO: add test for ProjectService.getMaxScore()

    });
});