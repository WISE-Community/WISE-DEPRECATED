import vleModule from '../../vle/vle';

const demoProjectJSONOriginal = window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
const scootersProjectJSONOriginal =
  window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];
let ConfigService, ProjectService, $rootScope, $httpBackend, demoProjectJSON, scootersProjectJSON;
const projectIdDefault = 1;
const projectBaseURL = 'http://localhost:8080/curriculum/12345/';
const projectURL = projectBaseURL + 'project.json';
const saveProjectURL = 'http://localhost:8080/wise/project/save/' + projectIdDefault;
const wiseBaseURL = '/wise';
const i18nURL_common_en = 'wise5/i18n/i18n_en.json';
const i18nURL_vle_en = 'wise5/vle/i18n/i18n_en.json';
const sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
const sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

describe('ProjectService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSONOriginal));
  }));

  shouldReplaceAssetPathsInNonHtmlComponentContent();
  shouldReplaceAssetPathsInHtmlComponentContent();
  shouldNotReplaceAssetPathsInHtmlComponentContent();
  //shouldRetrieveProjectWhenConfigProjectURLIsValid();
  shouldNotRetrieveProjectWhenConfigProjectURLIsUndefined();
  //shouldSaveProject();
  shouldNotSaveProjectWhenTheUserDoesNotHavePermissionToEditTheProject();
  shouldGetDefaultThemePathWhenThemeIsNotDefinedInTheProject();
  shouldGetProjectThemePathWhenThemeIsDefinedInTheProject();
  shouldReturnTheStartNodeOfTheProject();
  shouldReturnTheNodeByNodeId();
  shouldReturnTheNodeTitleByNodeId();
  getNextAvailableNodeId();
  shouldReturnTheNextAvailableGroupId();
  shouldReturnTheGroupIdsInTheProject();
  getNodeIds();
  getInactiveNodeIds();
  shouldGetTheComponentByNodeIdAndComponentId();
  shouldGetTheComponentPositionByNodeIdAndComonentId();
  shouldGetTheComponentsByNodeId();
  shouldReturnTheMaxScoreOfTheProject();
  shouldNotAddSpaceIfItDoesExist();
  shouldAddSpaceIfItDoesntExist();
  shouldNotRemoveASpaceThatDoesNotExist();
  shouldRemoveASpaceThatDoesExist();
  shouldCheckOrderBetweenStepAndStepGroup();
  shouldCheckOrderBetweenStepAndStepGroup();
  shouldCheckOrderBetweenGroupAndStepGroup();
  shouldRemoveTransitionsGoingOutOfGroupInChildNodesOfGroup();
  shouldRemoveNodeFromGroup();
  shouldRemoveStartNodeFromGroup();
  shouldIdentifyBranchStartPoint();
  shouldIdentifyBranchMergePoint();
  shouldGetPathWhenNodeIdIsFound();
  shouldGetPathWhenNodeIdIsFoundAsFirst();
  shouldGetPathWhenNodeIdIsNotFound();
  shouldBeAbleToInsertAStepNodeAfterAnotherStepNode();
  shouldBeAbleToInsertAnActivityNodeAfterAnotherActivityNode();
  shouldNotBeAbleToInsertANodeAfterAnotherNodeWhenTheyAreDifferentTypes();
  shouldBeAbleToInsertAStepNodeInsideAnGroupNode();
  shouldBeAbleToInsertAGroupNodeInsideAGroupNode();
  shouldNotBeAbleToInsertAStepNodeInsideAStepNode();
  shouldDeleteAStepFromTheProject();
  shouldDeleteAnInactiveStepFromTheProject();
  shouldDeleteAStepThatIsTheStartIdOfTheProject();
  shouldDeleteAStepThatIsTheStartIdOfAnAactivityThatIsNotTheFirstActivity();
  shouldDeleteTheFirstActivityFromTheProject();
  shouldDeleteAnActivityThatIsNotTheFirstFromTheProject();
  calculateNodeOrder();
  getGroupNodesIdToOrder();
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
  // TODO: add test for ProjectService.insertNodeInsideOnlyUpdateTransitions()
  // MARK: Tests for Node and Group Id functions
  // TODO: add test for ProjectService.getNodePositionAndTitleByNodeId()
  // TODO: add test for ProjectService.getNodeIconByNodeId()
  // TODO: add test for ProjectService.moveNodesInside()
  // TODO: add test for ProjectService.moveNodesAfter()
  // TODO: add test for ProjectService.deconsteNode()
  // TODO: add test for ProjectService.removeNodeIdFromTransitions()
  // TODO: add test for ProjectService.removeNodeIdFromGroups()
  // TODO: add test for ProjectService.removeNodeIdFromNodes()
  // TODO: add test for ProjectService.createComponent()
  // TODO: add test for ProjectService.addComponentToNode()
  // TODO: add test for ProjectService.moveComponentUp()
  // TODO: add test for ProjectService.moveComponentDown()
  // TODO: add test for ProjectService.deconsteComponent()
});

function createNormalSpy() {
  spyOn(ConfigService, 'getConfigParam').and.callFake(param => {
    if (param === 'projectBaseURL') {
      return projectBaseURL;
    } else if (param === 'projectURL') {
      return projectURL;
    } else if (param === 'saveProjectURL') {
      return saveProjectURL;
    } else if (param === 'wiseBaseURL') {
      return wiseBaseURL;
    }
  });
}

function shouldReplaceAssetPathsInNonHtmlComponentContent() {
  it('should replace asset paths in non-html component content', () => {
    createNormalSpy();
    const contentString = "<img src='hello.png' /><style>{background-url:'background.jpg'}</style>";
    const contentStringReplacedAssetPathExpected =
      "<img src='" +
      projectBaseURL +
      "assets/hello.png' /><style>{background-url:'" +
      projectBaseURL +
      "assets/background.jpg'}</style>";
    const contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldReplaceAssetPathsInHtmlComponentContent() {
  it('should replace asset paths in html component content', () => {
    createNormalSpy();
    const contentString = 'style=\\"background-image: url(\\"background.jpg\\")\\"';
    const contentStringReplacedAssetPathExpected =
      'style=\\"background-image: url(\\"' + projectBaseURL + 'assets/background.jpg\\")\\"';
    const contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldNotReplaceAssetPathsInHtmlComponentContent() {
  it('should not replace asset paths in html component content', () => {
    createNormalSpy();
    const contentString = '<source type="video/mp4">';
    const contentStringReplacedAssetPathExpected = '<source type="video/mp4">';
    const contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldRetrieveProjectWhenConfigProjectURLIsValid() {
  it('should retrieve project when Config.projectURL is valid', () => {
    createNormalSpy();
    spyOn(ProjectService, 'setProject').and.callThrough(); // actually call through the function
    spyOn(ProjectService, 'parseProject');
    $httpBackend.when('GET', new RegExp(projectURL)).respond(scootersProjectJSON);
    $httpBackend.expectGET(new RegExp(projectURL));
    $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
    $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
    const projectPromise = ProjectService.retrieveProject();
    $httpBackend.flush();
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('projectURL');
    expect(ProjectService.setProject).toHaveBeenCalledWith(scootersProjectJSON);
    expect(ProjectService.parseProject).toHaveBeenCalled();
    expect(ProjectService.project).toEqual(scootersProjectJSON);
  });
}

function shouldNotRetrieveProjectWhenConfigProjectURLIsUndefined() {
  it('should not retrieve project when Config.projectURL is undefined', () => {
    spyOn(ConfigService, 'getConfigParam').and.returnValue(null);
    const project = ProjectService.retrieveProject();
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('projectURL');
    expect(project).toBeNull();
  });
}

function shouldSaveProject() {
  it('should save project', () => {
    spyOn(ConfigService, 'getProjectId').and.returnValue(projectIdDefault);
    spyOn(ConfigService, 'getConfigParam').and.returnValue(saveProjectURL);
    ProjectService.setProject(scootersProjectJSON);
    $httpBackend.when('GET', /^wise5\/components\/.*/).respond(200, '');
    $httpBackend.when('POST', saveProjectURL).respond({ data: {} });
    $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
    $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
    const newProjectIdActualPromise = ProjectService.saveProject();
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('saveProjectURL');
    expect(ConfigService.getProjectId).toHaveBeenCalled();
    $httpBackend.expectPOST(saveProjectURL);
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation(false); // <-- no unnecessary $digest
  });
}

function shouldNotSaveProjectWhenTheUserDoesNotHavePermissionToEditTheProject() {
  it('should not save project when the user does not have permission to edit the project', () => {
    ProjectService.setProject(scootersProjectJSON);
    spyOn(ConfigService, 'getConfigParam')
      .withArgs('canEditProject')
      .and.returnValue(false);
    expect(ProjectService.saveProject()).toEqual(null);
  });
}

function shouldGetDefaultThemePathWhenThemeIsNotDefinedInTheProject() {
  it('should get default theme path when theme is not defined in the project', () => {
    spyOn(ConfigService, 'getConfigParam').and.returnValue(wiseBaseURL);
    ProjectService.setProject(scootersProjectJSON);
    const expectedThemePath = wiseBaseURL + '/wise5/themes/default';
    const actualThemePath = ProjectService.getThemePath();
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('wiseBaseURL');
    expect(actualThemePath).toEqual(expectedThemePath);
  });
}

function shouldGetProjectThemePathWhenThemeIsDefinedInTheProject() {
  it('should get project theme path when theme is defined in the project', () => {
    spyOn(ConfigService, 'getConfigParam').and.returnValue(wiseBaseURL);
    ProjectService.setProject(demoProjectJSON);
    const demoProjectTheme = demoProjectJSON.theme; // Demo Project has a theme defined
    const expectedThemePath = wiseBaseURL + '/wise5/themes/' + demoProjectTheme;
    const actualThemePath = ProjectService.getThemePath();
    expect(ConfigService.getConfigParam).toHaveBeenCalledWith('wiseBaseURL');
    expect(actualThemePath).toEqual(expectedThemePath);
  });
}

function shouldReturnTheStartNodeOfTheProject() {
  it('should return the start node of the project', () => {
    ProjectService.setProject(demoProjectJSON);
    const expectedStartNodeId = 'node1'; // Demo project's start node id
    const actualStartNodeId = ProjectService.getStartNodeId();
    expect(actualStartNodeId).toEqual(expectedStartNodeId);
  });
}

function shouldReturnTheNodeByNodeId() {
  it('should return the node by nodeId', () => {
    ProjectService.setProject(scootersProjectJSON);
    const node1 = ProjectService.getNodeById('node1');
    expect(node1.type).toEqual('node');
    expect(node1.title).toEqual('Introduction to Newton Scooters');
    expect(node1.components.length).toEqual(1);

    // Call getNodeId with null and expect a null return value
    const nodeBadArgs = ProjectService.getNodeById();
    expect(nodeBadArgs).toBeNull();

    // Test node that doesn't exist in project and make sure the function returns null
    const nodeNE = ProjectService.getNodeById('node999');
    expect(nodeNE).toBeNull();
  });
}

function shouldReturnTheNodeTitleByNodeId() {
  it('should return the node title by nodeId', () => {
    ProjectService.setProject(scootersProjectJSON);
    const node1Title = ProjectService.getNodeTitleByNodeId('node1');
    expect(node1Title).toEqual('Introduction to Newton Scooters');

    // Call getNodeTitleByNodeId with null and expect a null return value
    const nodeTitleBadArgs = ProjectService.getNodeTitleByNodeId();
    expect(nodeTitleBadArgs).toBeNull();

    // Test node that doesn't exist in project and make sure the function returns null
    const nodeTitleNE = ProjectService.getNodeTitleByNodeId('node999');
    expect(nodeTitleNE).toBeNull();
  });
}

function getNextAvailableNodeId() {
  describe('getNextAvailableNodeId', () => {
    it('should return the next available node id', () => {
      createNormalSpy();
      ProjectService.setProject(scootersProjectJSON);
      expect(ProjectService.getNextAvailableNodeId()).toEqual('node43');
      expect(ProjectService.getNextAvailableNodeId(['node43'])).toEqual('node44');
      expect(ProjectService.getNextAvailableNodeId(['node43', 'node44'])).toEqual('node45');
    });
  });
}

function shouldReturnTheNextAvailableGroupId() {
  it('should return the next available group id', () => {
    createNormalSpy();
    ProjectService.setProject(scootersProjectJSON);
    const nextGroupIdExpected = 'group7';
    const nextGroupIdActual = ProjectService.getNextAvailableGroupId();
    expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
  });
}

function shouldReturnTheGroupIdsInTheProject() {
  it('should return the group ids in the project', () => {
    createNormalSpy();
    ProjectService.setProject(scootersProjectJSON);
    const groupIdsExpected = ['group0', 'group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
    const groupIdsActual = ProjectService.getGroupIds();
    expect(groupIdsActual).toEqual(groupIdsExpected);
  });
}

function getNodeIds() {
  describe('getNodeIds', () => {
    it('should return the node ids in the project', () => {
      ProjectService.setProject(scootersProjectJSON);
      const nodeIdsExpected = [
        'node1',
        'node2',
        'node3',
        'node4',
        'node5',
        'node6',
        'node7',
        'node9',
        'node12',
        'node13',
        'node14',
        'node18',
        'node19',
        'node21',
        'node22',
        'node23',
        'node24',
        'node25',
        'node26',
        'node27',
        'node28',
        'node29',
        'node30',
        'node31',
        'node40',
        'node32',
        'node33',
        'node34',
        'node35',
        'node36',
        'node37',
        'node38',
        'node39',
        'nodeWithNoComponents'
      ];
      const nodeIdsActual = ProjectService.getNodeIds();
      expect(nodeIdsActual).toEqual(nodeIdsExpected);
    });
  });
}

function getInactiveNodeIds() {
  describe('getInactiveNodeIds', () => {
    it('should return the inactive nodes in the project', () => {
      ProjectService.setProject(scootersProjectJSON);
      expect(ProjectService.getInactiveNodeIds()).toEqual(['node41', 'node42']);
    });
  });
}

function shouldGetTheComponentByNodeIdAndComponentId() {
  it('should get the component by node id and component id', () => {
    ProjectService.setProject(scootersProjectJSON);
    const nullNodeIdResult = ProjectService.getComponentByNodeIdAndComponentId(null, '57lxhwfp5r');
    expect(nullNodeIdResult).toBeNull();

    const nullComponentIdResult = ProjectService.getComponentByNodeIdAndComponentId('node13', null);
    expect(nullComponentIdResult).toBeNull();

    const nodeIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId(
      'badNodeId',
      '57lxhwfp5r'
    );
    expect(nodeIdDNEResult).toBeNull();

    const componentIdDNEResult = ProjectService.getComponentByNodeIdAndComponentId(
      'node13',
      'badComponentId'
    );
    expect(componentIdDNEResult).toBeNull();

    const componentExists = ProjectService.getComponentByNodeIdAndComponentId(
      'node13',
      '57lxhwfp5r'
    );
    expect(componentExists).not.toBe(null);
    expect(componentExists.type).toEqual('HTML');

    const componentExists2 = ProjectService.getComponentByNodeIdAndComponentId(
      'node9',
      'mnzx68ix8h'
    );
    expect(componentExists2).not.toBe(null);
    expect(componentExists2.type).toEqual('embedded');
    expect(componentExists2.url).toEqual('NewtonScooters-potential-kinetic.html');
  });
}

function shouldGetTheComponentPositionByNodeIdAndComonentId() {
  it('should get the component position by node id and comonent id', () => {
    ProjectService.setProject(scootersProjectJSON);
    const nullNodeIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId(
      null,
      '57lxhwfp5r'
    );
    expect(nullNodeIdResult).toEqual(-1);

    const nullComponentIdResult = ProjectService.getComponentPositionByNodeIdAndComponentId(
      'node13',
      null
    );
    expect(nullComponentIdResult).toEqual(-1);

    const nodeIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId(
      'badNodeId',
      '57lxhwfp5r'
    );
    expect(nodeIdDNEResult).toEqual(-1);

    const componentIdDNEResult = ProjectService.getComponentPositionByNodeIdAndComponentId(
      'node13',
      'badComponentId'
    );
    expect(componentIdDNEResult).toEqual(-1);

    const componentExists = ProjectService.getComponentPositionByNodeIdAndComponentId(
      'node13',
      '57lxhwfp5r'
    );
    expect(componentExists).toEqual(0);

    const componentExists2 = ProjectService.getComponentPositionByNodeIdAndComponentId(
      'node9',
      'mnzx68ix8h'
    );
    expect(componentExists2).toEqual(1);
  });
}

function shouldGetTheComponentsByNodeId() {
  it('should get the components by node id', () => {
    ProjectService.setProject(scootersProjectJSON);
    const nullNodeIdResult = ProjectService.getComponentsByNodeId(null);
    expect(nullNodeIdResult).toEqual([]);
    const nodeIdDNEResult = ProjectService.getComponentsByNodeId('badNodeId');
    expect(nodeIdDNEResult).toEqual([]);
    const nodeWithNullComponentResult = ProjectService.getComponentsByNodeId(
      'nodeWithNoComponents'
    );
    expect(nodeWithNullComponentResult).toEqual([]);
    const nodeExistsResult = ProjectService.getComponentsByNodeId('node13');
    expect(nodeExistsResult).not.toBe(null);
    expect(nodeExistsResult.length).toEqual(1);
    expect(nodeExistsResult[0].id).toEqual('57lxhwfp5r');

    const nodeExistsResult2 = ProjectService.getComponentsByNodeId('node9');
    expect(nodeExistsResult2).not.toBe(null);
    expect(nodeExistsResult2.length).toEqual(7);
    expect(nodeExistsResult2[2].id).toEqual('nm080ntk8e');
    expect(nodeExistsResult2[2].type).toEqual('Table');
  });
}

function shouldReturnTheMaxScoreOfTheProject() {
  it('should return the max score of the project', () => {
    ProjectService.setProject(demoProjectJSON);
    const demoProjectMaxScoreActual = ProjectService.getMaxScore();
    expect(demoProjectMaxScoreActual).toBeNull();
    ProjectService.setProject(scootersProjectJSON);
    const scootersProjectMaxScoreExpected = 18;
    const scootersProjectMaxScoreActual = ProjectService.getMaxScore();
    expect(scootersProjectMaxScoreActual).toEqual(scootersProjectMaxScoreExpected);
  });
}

function shouldNotAddSpaceIfItDoesExist() {
  it('should not add space if it does exist', () => {
    ProjectService.setProject(scootersProjectJSON);
    const spaces = ProjectService.getSpaces();
    expect(spaces.length).toEqual(2);
    const space = {
      id: 'public',
      name: 'Public',
      isPublic: true,
      isShareWithNotebook: true
    };
    ProjectService.addSpace(space);
    expect(spaces.length).toEqual(2);
    expect(spaces[0].id).toEqual('public');
    expect(spaces[1].id).toEqual('ideasAboutGlobalClimateChange');
  });
}

function shouldAddSpaceIfItDoesntExist() {
  it("should add space if it doesn't exist", () => {
    ProjectService.setProject(scootersProjectJSON);
    const spaces = ProjectService.getSpaces();
    expect(spaces.length).toEqual(2);
    const space = {
      id: 'newSpace',
      name: 'New Space to share your thoughts',
      isPublic: true,
      isShareWithNotebook: false
    };
    ProjectService.addSpace(space);
    expect(spaces.length).toEqual(3);
    expect(spaces[0].id).toEqual('public');
    expect(spaces[1].id).toEqual('ideasAboutGlobalClimateChange');
    expect(spaces[2].id).toEqual('newSpace');
  });
}

function shouldNotRemoveASpaceThatDoesNotExist() {
  it('should not remove a space that does not exist', () => {
    ProjectService.setProject(demoProjectJSON);
    const spaces = ProjectService.getSpaces();
    expect(spaces.length).toEqual(1);
    ProjectService.removeSpace('public');
    expect(spaces.length).toEqual(1);
  });
}

function shouldRemoveASpaceThatDoesExist() {
  it('should remove a space that does exist', () => {
    ProjectService.setProject(demoProjectJSON);
    const spaces = ProjectService.getSpaces();
    expect(spaces.length).toEqual(1);
    ProjectService.removeSpace('sharePictures');
    expect(spaces.length).toEqual(0);
  });
}

function shouldCheckOrderBetweenStepAndStepGroup() {
  it('should check order between step and step/group', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.isNodeIdAfter('node1', 'node2')).toBeTruthy();
    expect(ProjectService.isNodeIdAfter('node2', 'node1')).toBeFalsy();
    expect(ProjectService.isNodeIdAfter('node1', 'group2')).toBeTruthy();
    expect(ProjectService.isNodeIdAfter('node20', 'group1')).toBeFalsy();
  });
}

function shouldCheckOrderBetweenGroupAndStepGroup() {
  it('should check order between group and step/group', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.isNodeIdAfter('group1', 'group2')).toBeTruthy();
    expect(ProjectService.isNodeIdAfter('group2', 'group1')).toBeFalsy();
    expect(ProjectService.isNodeIdAfter('group1', 'node20')).toBeTruthy();
    expect(ProjectService.isNodeIdAfter('group2', 'node1')).toBeFalsy();
  });
}

function shouldRemoveTransitionsGoingOutOfGroupInChildNodesOfGroup() {
  it('should remove transitions going out of group in child nodes of group', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getTransitionsByFromNodeId('node18').length).toEqual(1);
    expect(ProjectService.getTransitionsByFromNodeId('node19').length).toEqual(1);
    ProjectService.removeTransitionsOutOfGroup('group1');
    expect(ProjectService.getTransitionsByFromNodeId('node18').length).toEqual(1);
    expect(ProjectService.getTransitionsByFromNodeId('node19').length).toEqual(0);
  });
}

function shouldRemoveNodeFromGroup() {
  it('should remove node from group', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(19);
    ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node3');
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(18);
    expect(ProjectService.getGroupStartId('group1')).toEqual('node1');
    ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node4');
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(17);
    expect(ProjectService.getGroupStartId('group1')).toEqual('node1');
  });
}

function shouldRemoveStartNodeFromGroup() {
  it('should remove start node from group', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(19);
    ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node1');
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(18);
    expect(ProjectService.getGroupStartId('group1')).toEqual('node2');
    ProjectService.removeNodeIdFromGroup(ProjectService.getNodeById('group1'), 'node2');
    expect(ProjectService.getChildNodeIdsById('group1').length).toEqual(17);
    expect(ProjectService.getGroupStartId('group1')).toEqual('node3');
  });
}

function shouldIdentifyBranchStartPoint() {
  it('should identify branch start point', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.isBranchStartPoint('group1')).toBeFalsy();
    expect(ProjectService.isBranchStartPoint('node29')).toBeFalsy();
    expect(ProjectService.isBranchStartPoint('node32')).toBeFalsy();
    expect(ProjectService.isBranchStartPoint('node30')).toBeTruthy();
  });
}

function shouldIdentifyBranchMergePoint() {
  it('should identify branch merge point', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.isBranchMergePoint('group1')).toBeFalsy();
    expect(ProjectService.isBranchMergePoint('node30')).toBeFalsy();
    expect(ProjectService.isBranchMergePoint('node32')).toBeFalsy();
    expect(ProjectService.isBranchMergePoint('node34')).toBeTruthy();
  });
}

function shouldGetPathWhenNodeIdIsFound() {
  it('should get path when nodeId is found', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = ProjectService.consumePathsUntilNodeId(paths, 'node3');
    const expectedPath = ['node1', 'node2'];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node3');
    const expectedPath2 = ['node1', 'node2', 'node4'];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldGetPathWhenNodeIdIsFoundAsFirst() {
  it('should get path when nodeId is found as first', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = ProjectService.consumePathsUntilNodeId(paths, 'node1');
    const expectedPath = [];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node1');
    const expectedPath2 = [];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldGetPathWhenNodeIdIsNotFound() {
  it('should get path when nodeId is not found', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = ProjectService.consumePathsUntilNodeId(paths, 'node6');
    const expectedPath = [];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = ProjectService.consumePathsUntilNodeId(paths2, 'node6');
    const expectedPath2 = [];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldBeAbleToInsertAStepNodeAfterAnotherStepNode() {
  it('should be able to insert a step node after another step node', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node1'), 'node2')
    ).toBeTruthy();
    ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('node1'), 'node2');
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node1'), 'node2')
    ).toBeFalsy();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node2'), 'node1')
    ).toBeTruthy();
  });
}

function shouldBeAbleToInsertAnActivityNodeAfterAnotherActivityNode() {
  it('should be able to insert an activity node after another activity node', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')
    ).toBeTruthy();
    ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('group1'), 'group2');
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')
    ).toBeFalsy();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group2'), 'group1')
    ).toBeTruthy();
  });
}

function shouldNotBeAbleToInsertANodeAfterAnotherNodeWhenTheyAreDifferentTypes() {
  it('should not be able to insert a node after another node when they are different types', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(() => {
      ProjectService.insertNodeAfterInTransitions(ProjectService.getNodeById('node1'), 'group2');
    }).toThrow('Error: insertNodeAfterInTransitions() nodes are not the same type');
  });
}

function shouldBeAbleToInsertAStepNodeInsideAnGroupNode() {
  it('should be able to insert a step node inside an group node', () => {
    ProjectService.setProject(demoProjectJSON);
    const node1 = ProjectService.getNodeById('node1');
    const node19 = ProjectService.getNodeById('node19');
    expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeTruthy();
    expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node20')).toBeFalsy();
    expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node20')).toBeTruthy();
    expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node1')).toBeFalsy();
    ProjectService.insertNodeInsideOnlyUpdateTransitions('node1', 'group2');
    expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node20')).toBeTruthy();
    expect(ProjectService.nodeHasTransitionToNodeId(node1, 'node2')).toBeFalsy();
    expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node1')).toBeTruthy();
    expect(ProjectService.nodeHasTransitionToNodeId(node19, 'node20')).toBeFalsy();
  });
}

function shouldBeAbleToInsertAGroupNodeInsideAGroupNode() {
  it('should be able to insert a group node inside a group node', () => {
    ProjectService.setProject(demoProjectJSON);
    const group1 = ProjectService.getNodeById('group1');
    const group2 = ProjectService.getNodeById('group2');
    expect(ProjectService.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
    expect(ProjectService.nodeHasTransitionToNodeId(group2, 'group1')).toBeFalsy();
    ProjectService.insertNodeInsideOnlyUpdateTransitions('group2', 'group0');
    expect(ProjectService.nodeHasTransitionToNodeId(group2, 'group1')).toBeTruthy();
    /*
     * the transition from group1 to group2 still remains because it is usually
     * removed by calling removeNodeIdFromTransitions() but we don't call it here
     */
    expect(ProjectService.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
  });
}

function shouldNotBeAbleToInsertAStepNodeInsideAStepNode() {
  it('should not be able to insert a step node inside a step node', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(() => {
      ProjectService.insertNodeInsideOnlyUpdateTransitions('node1', 'node2');
    }).toThrow('Error: insertNodeInsideOnlyUpdateTransitions() second parameter must be a group');
  });
}

function shouldDeleteAStepFromTheProject() {
  it('should delete a step from the project', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getNodes().length).toEqual(37);
    expect(ProjectService.getNodeById('node5')).not.toBeNull();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node4'), 'node5')
    ).toBeTruthy();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node5'), 'node6')
    ).toBeTruthy();
    expect(ProjectService.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
    ProjectService.deleteNode('node5');
    expect(ProjectService.getNodes().length).toEqual(36);
    expect(ProjectService.getNodeById('node5')).toBeNull();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node4'), 'node6')
    ).toBeTruthy();
    expect(ProjectService.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
  });
}

function shouldDeleteAnInactiveStepFromTheProject() {
  it('should delete an inactive step from the project', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getInactiveNodes().length).toEqual(1);
    expect(ProjectService.getNodeById('node789')).not.toBeNull();
    ProjectService.deleteNode('node789');
    expect(ProjectService.getInactiveNodes().length).toEqual(0);
    expect(ProjectService.getNodeById('node789')).toBeNull();
  });
}

function shouldDeleteAStepThatIsTheStartIdOfTheProject() {
  it('should delete a step that is the start id of the project', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getStartNodeId()).toEqual('node1');
    expect(ProjectService.getNodesWithTransitionToNodeId('node2').length).toEqual(1);
    ProjectService.deleteNode('node1');
    expect(ProjectService.getStartNodeId()).toEqual('node2');
    expect(ProjectService.getNodesWithTransitionToNodeId('node2').length).toEqual(0);
  });
}

function shouldDeleteAStepThatIsTheStartIdOfAnAactivityThatIsNotTheFirstActivity() {
  it('should delete a step that is the start id of an activity that is not the first activity', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getGroupStartId('group2')).toEqual('node20');
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node19'), 'node20')
    ).toBeTruthy();
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node20'), 'node21')
    ).toBeTruthy();
    ProjectService.deleteNode('node20');
    expect(ProjectService.getGroupStartId('group2')).toEqual('node21');
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('node19'), 'node21')
    ).toBeTruthy();
  });
}

function shouldDeleteTheFirstActivityFromTheProject() {
  it('should delete the first activity from the project', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(ProjectService.getGroupStartId('group0')).toEqual('group1');
    expect(ProjectService.getStartNodeId()).toEqual('node1');
    expect(ProjectService.getNodes().length).toEqual(37);
    expect(ProjectService.getNodesWithTransitionToNodeId('node20').length).toEqual(1);
    ProjectService.deleteNode('group1');
    expect(ProjectService.getNodeById('group1')).toBeNull();
    expect(ProjectService.getGroupStartId('group0')).toEqual('group2');
    expect(ProjectService.getStartNodeId()).toEqual('node20');
    expect(ProjectService.getNodes().length).toEqual(17);
    expect(ProjectService.getNodesWithTransitionToNodeId('node20').length).toEqual(0);
  });
}

function shouldDeleteAnActivityThatIsNotTheFirstFromTheProject() {
  it('should delete an activity that is not the first from the project', () => {
    ProjectService.setProject(demoProjectJSON);
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')
    ).toBeTruthy();
    expect(ProjectService.getTransitionsByFromNodeId('group1').length).toEqual(1);
    expect(ProjectService.getNodes().length).toEqual(37);
    ProjectService.deleteNode('group2');
    expect(
      ProjectService.nodeHasTransitionToNodeId(ProjectService.getNodeById('group1'), 'group2')
    ).toBeFalsy();
    expect(ProjectService.getTransitionsByFromNodeId('group1').length).toEqual(0);
    expect(ProjectService.getNodes().length).toEqual(21);
  });
}

function calculateNodeOrder() {
  describe('calculateNodeOrder', () => {
    it('should calculate the node order', () => {
      ProjectService.project = demoProjectJSON;
      ProjectService.loadNodes(demoProjectJSON.nodes);
      ProjectService.calculateNodeOrder(demoProjectJSON.nodes[0]);
      expect(ProjectService.idToOrder['group0'].order).toEqual(0);
      expect(ProjectService.idToOrder['group1'].order).toEqual(1);
      expect(ProjectService.idToOrder['node1'].order).toEqual(2);
      expect(ProjectService.idToOrder['node2'].order).toEqual(3);
      expect(ProjectService.idToOrder['node3'].order).toEqual(4);
      expect(ProjectService.idToOrder['node4'].order).toEqual(5);
      expect(ProjectService.idToOrder['node5'].order).toEqual(6);
      expect(ProjectService.idToOrder['node6'].order).toEqual(7);
    });
  });
}

function getGroupNodesIdToOrder() {
  describe('getGroupNodesIdToOrder', () => {
    it('should return only group nodes in idToOrder', () => {
      ProjectService.project = demoProjectJSON;
      ProjectService.loadNodes(demoProjectJSON.nodes);
      ProjectService.calculateNodeOrder(demoProjectJSON.nodes[0]);
      expect(ProjectService.getGroupNodesIdToOrder()).toEqual({
        group0: { order: 0 },
        group1: { order: 1 },
        group2: { order: 21 }
      });
    });
  });
}
