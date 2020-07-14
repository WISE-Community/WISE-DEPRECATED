import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ProjectService } from '../../../../wise5/services/projectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import demoProjectJSON_import from './sampleData/curriculum/Demo.project.json';
import scootersProjectJSON_import from './sampleData/curriculum/SelfPropelledVehiclesChallenge.project.json';
import { getAuthServiceConfigs } from '../app.module';
const projectIdDefault = 1;
const projectBaseURL = 'http://localhost:8080/curriculum/12345/';
const projectURL = projectBaseURL + 'project.json';
const saveProjectURL = 'http://localhost:8080/wise/project/save/' + projectIdDefault;
const wiseBaseURL = '/wise';
let service: ProjectService;
let configService: ConfigService;
let utilService: UtilService;
let http: HttpTestingController;
let demoProjectJSON: any;
let scootersProjectJSON: any;

describe('ProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ProjectService, ConfigService, UtilService ]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope').and.callFake(() => {});
    service = TestBed.get(ProjectService);
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSON_import));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSON_import));
  });
  shouldReplaceAssetPathsInNonHtmlComponentContent();
  shouldReplaceAssetPathsInHtmlComponentContent();
  shouldNotReplaceAssetPathsInHtmlComponentContent();
  shouldRetrieveProjectWhenConfigProjectURLIsValid();
  shouldNotRetrieveProjectWhenConfigProjectURLIsUndefined();
  shouldSaveProject();
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
  shouldBeAbleToInsertAStepNodeInsideAGroupNode();
  shouldBeAbleToInsertAGroupNodeInsideAGroupNode();
  shouldNotBeAbleToInsertAStepNodeInsideAStepNode();
  shouldDeleteAStepFromTheProject();
  shouldDeleteAnInactiveStepFromTheProject();
  shouldDeleteAStepThatIsTheStartIdOfTheProject();
  shouldDeleteAStepThatIsTheLastStepOfTheProject();
  shouldDeleteAStepThatIsTheStartIdOfAnAactivityThatIsNotTheFirstActivity();
  shouldDeleteTheFirstActivityFromTheProject();
  shouldDeleteAnActivityInTheMiddleOfTheProject();
  shouldDeleteTheLastActivityFromTheProject();
  calculateNodeOrder();
  getGroupNodesIdToOrder();
  getUniqueAuthors();
  deleteActivityWithBranching();
  deleteTheLastStepInAnActivity();
  deleteAllStepsInAnActivity();
  getTags();
  // TODO: add test for service.getFlattenedProjectAsNodeIds()
  // TODO: add test for service.getAllPaths()
  // TODO: add test for service.consolidatePaths()
  // TODO: add test for service.consumePathsUntilNodeId()
  // TODO: add test for service.getFirstNodeIdInPathAtIndex()
  // TODO: add test for service.removeNodeIdFromPaths()
  // TODO: add test for service.removeNodeIdFromPath()
  // TODO: add test for service.areFirstNodeIdsInPathsTheSame()
  // TODO: add test for service.arePathsEmpty()
  // TODO: add test for service.getPathsThatContainNodeId()
  // TODO: add test for service.getNonEmptyPathIndex()
  // TODO: add test for service.getBranches()
  // TODO: add test for service.findBranches()
  // TODO: add test for service.createBranchMetaObject()
  // TODO: add test for service.findNextCommonNodeId()
  // TODO: add test for service.allPathsContainNodeId()
  // TODO: add test for service.trimPathsUpToNodeId()
  // TODO: add test for service.extractPathsUpToNodeId()
  // TODO: add test for service.removeDuplicatePaths()
  // TODO: add test for service.pathsEqual()
  // TODO: add test for service.getBranchPathsByNodeId()
  // TODO: add test for service.getNodeContentByNodeId()
  // TODO: add test for service.replaceComponent()
  // TODO: add test for service.createGroup()
  // TODO: add test for service.createNode()
  // TODO: add test for service.createNodeInside()
  // TODO: add test for service.createNodeAfter()
  // TODO: add test for service.insertNodeAfterInGroups()
  // TODO: add test for service.insertNodeAfterInTransitions()
  // TODO: add test for service.insertNodeInsideInGroups()
  // TODO: add test for service.insertNodeInsideOnlyUpdateTransitions()
  // MARK: Tests for Node and Group Id functions
  // TODO: add test for service.getNodePositionAndTitleByNodeId()
  // TODO: add test for service.getNodeIconByNodeId()
  // TODO: add test for service.moveNodesInside()
  // TODO: add test for service.moveNodesAfter()
  // TODO: add test for service.deconsteNode()
  // TODO: add test for service.removeNodeIdFromTransitions()
  // TODO: add test for service.removeNodeIdFromGroups()
  // TODO: add test for service.removeNodeIdFromNodes()
  // TODO: add test for service.createComponent()
  // TODO: add test for service.addComponentToNode()
  // TODO: add test for service.moveComponentUp()
  // TODO: add test for service.moveComponentDown()
  // TODO: add test for service.deconsteComponent()
});

function createNormalSpy() {
  spyOn(configService, 'getConfigParam').and.callFake(param => {
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
    const contentStringReplacedAssetPathActual = service.replaceAssetPaths(contentString);
    expect(configService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldReplaceAssetPathsInHtmlComponentContent() {
  it('should replace asset paths in html component content', () => {
    createNormalSpy();
    const contentString = 'style=\\"background-image: url(\\"background.jpg\\")\\"';
    const contentStringReplacedAssetPathExpected =
      'style=\\"background-image: url(\\"' + projectBaseURL + 'assets/background.jpg\\")\\"';
    const contentStringReplacedAssetPathActual = service.replaceAssetPaths(contentString);
    expect(configService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldNotReplaceAssetPathsInHtmlComponentContent() {
  it('should not replace asset paths in html component content', () => {
    createNormalSpy();
    const contentString = '<source type="video/mp4">';
    const contentStringReplacedAssetPathExpected = '<source type="video/mp4">';
    const contentStringReplacedAssetPathActual = service.replaceAssetPaths(contentString);
    expect(configService.getConfigParam).toHaveBeenCalledWith('projectBaseURL');
    expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
  });
}

function shouldRetrieveProjectWhenConfigProjectURLIsValid() {
  it('should retrieve project when Config.projectURL is valid', () => {
    spyOn(configService, 'getConfigParam').withArgs('projectURL')
        .and.returnValue(projectURL);
    service.retrieveProject().then((response) => {
      expect(response).toEqual(scootersProjectJSON);
    });
    http.expectOne(projectURL);
  });
}

function shouldNotRetrieveProjectWhenConfigProjectURLIsUndefined() {
  it('should not retrieve project when Config.projectURL is undefined', () => {
    spyOn(configService, 'getConfigParam').and.returnValue(null);
    const project = service.retrieveProject();
    expect(configService.getConfigParam).toHaveBeenCalledWith('projectURL');
    expect(project).toBeNull();
  });
}

function shouldSaveProject() {
  it('should save project', () => {
    spyOn(configService, 'getConfigParam')
        .withArgs('canEditProject').and.returnValue(true)
        .withArgs('saveProjectURL').and.returnValue(saveProjectURL)
        .withArgs('mode').and.returnValue('authoring')
        .withArgs('userInfo').and.returnValue({});
    spyOn(configService, 'getProjectId').and.returnValue(projectIdDefault);
    spyOn(configService, 'getMyUserInfo').and.returnValue({id:1});
    service.setProject(scootersProjectJSON);
    service.saveProject();
    expect(configService.getConfigParam).toHaveBeenCalledWith('saveProjectURL');
    http.expectOne(saveProjectURL);
  });
}

function shouldNotSaveProjectWhenTheUserDoesNotHavePermissionToEditTheProject() {
  it('should not save project when the user does not have permission to edit the project', () => {
    service.setProject(scootersProjectJSON);
    spyOn(configService, 'getConfigParam').withArgs('canEditProject').and.returnValue(false);
    expect(service.saveProject()).toEqual(null);
  });
}

function shouldGetDefaultThemePathWhenThemeIsNotDefinedInTheProject() {
  it('should get default theme path when theme is not defined in the project', () => {
    spyOn(configService, 'getConfigParam').and.returnValue(wiseBaseURL);
    service.setProject(scootersProjectJSON);
    const expectedThemePath = wiseBaseURL + '/wise5/themes/default';
    const actualThemePath = service.getThemePath();
    expect(configService.getConfigParam).toHaveBeenCalledWith('wiseBaseURL');
    expect(actualThemePath).toEqual(expectedThemePath);
  });
}

function shouldGetProjectThemePathWhenThemeIsDefinedInTheProject() {
  it('should get project theme path when theme is defined in the project', () => {
    spyOn(configService, 'getConfigParam').and.returnValue(wiseBaseURL);
    service.setProject(demoProjectJSON);
    const demoProjectTheme = demoProjectJSON.theme; // Demo Project has a theme defined
    const expectedThemePath = wiseBaseURL + '/wise5/themes/' + demoProjectTheme;
    const actualThemePath = service.getThemePath();
    expect(configService.getConfigParam).toHaveBeenCalledWith('wiseBaseURL');
    expect(actualThemePath).toEqual(expectedThemePath);
  });
}

function shouldReturnTheStartNodeOfTheProject() {
  it('should return the start node of the project', () => {
    service.setProject(demoProjectJSON);
    const expectedStartNodeId = 'node1'; // Demo project's start node id
    const actualStartNodeId = service.getStartNodeId();
    expect(actualStartNodeId).toEqual(expectedStartNodeId);
  });
}

function shouldReturnTheNodeByNodeId() {
  it('should return the node by nodeId', () => {
    service.setProject(scootersProjectJSON);
    const node1 = service.getNodeById('node1');
    expect(node1.type).toEqual('node');
    expect(node1.title).toEqual('Introduction to Newton Scooters');
    expect(node1.components.length).toEqual(1);

    // Test node that doesn't exist in project and make sure the function returns null
    const nodeNE = service.getNodeById('node999');
    expect(nodeNE).toBeNull();
  });
}

function shouldReturnTheNodeTitleByNodeId() {
  it('should return the node title by nodeId', () => {
    service.setProject(scootersProjectJSON);
    const node1Title = service.getNodeTitleByNodeId('node1');
    expect(node1Title).toEqual('Introduction to Newton Scooters');

    // Test node that doesn't exist in project and make sure the function returns null
    const nodeTitleNE = service.getNodeTitleByNodeId('node999');
    expect(nodeTitleNE).toBeNull();
  });
}

function getNextAvailableNodeId() {
  describe('getNextAvailableNodeId', () => {
    it('should return the next available node id', () => {
      createNormalSpy();
      service.setProject(scootersProjectJSON);
      expect(service.getNextAvailableNodeId()).toEqual('node43');
      expect(service.getNextAvailableNodeId(['node43'])).toEqual('node44');
      expect(service.getNextAvailableNodeId(['node43', 'node44'])).toEqual('node45');
    });
  });
}

function shouldReturnTheNextAvailableGroupId() {
  it('should return the next available group id', () => {
    createNormalSpy();
    service.setProject(scootersProjectJSON);
    const nextGroupIdExpected = 'group7';
    const nextGroupIdActual = service.getNextAvailableGroupId();
    expect(nextGroupIdActual).toEqual(nextGroupIdExpected);
  });
}

function shouldReturnTheGroupIdsInTheProject() {
  it('should return the group ids in the project', () => {
    createNormalSpy();
    service.setProject(scootersProjectJSON);
    const groupIdsExpected = ['group0', 'group1', 'group2', 'group3', 'group4', 'group5', 'group6'];
    const groupIdsActual = service.getGroupIds();
    expect(groupIdsActual).toEqual(groupIdsExpected);
  });
}

function getNodeIds() {
  describe('getNodeIds', () => {
    it('should return the node ids in the project', () => {
      service.setProject(scootersProjectJSON);
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
      const nodeIdsActual = service.getNodeIds();
      expect(nodeIdsActual).toEqual(nodeIdsExpected);
    });
  });
}

function getInactiveNodeIds() {
  describe('getInactiveNodeIds', () => {
    it('should return the inactive nodes in the project', () => {
      service.setProject(scootersProjectJSON);
      expect(service.getInactiveNodeIds()).toEqual(['node41', 'node42']);
    });
  });
}

function shouldGetTheComponentByNodeIdAndComponentId() {
  it('should get the component by node id and component id', () => {
    service.setProject(scootersProjectJSON);
    const nullNodeIdResult = service.getComponentByNodeIdAndComponentId(null, '57lxhwfp5r');
    expect(nullNodeIdResult).toBeNull();

    const nullComponentIdResult = service.getComponentByNodeIdAndComponentId('node13', null);
    expect(nullComponentIdResult).toBeNull();

    const nodeIdDNEResult = service.getComponentByNodeIdAndComponentId(
    'badNodeId',
    '57lxhwfp5r'
    );
    expect(nodeIdDNEResult).toBeNull();

    const componentIdDNEResult = service.getComponentByNodeIdAndComponentId(
    'node13',
    'badComponentId'
    );
    expect(componentIdDNEResult).toBeNull();

    const componentExists = service.getComponentByNodeIdAndComponentId(
    'node13',
    '57lxhwfp5r'
    );
    expect(componentExists).not.toBe(null);
    expect(componentExists.type).toEqual('HTML');

    const componentExists2 = service.getComponentByNodeIdAndComponentId(
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
    service.setProject(scootersProjectJSON);
    const nullNodeIdResult = service.getComponentPositionByNodeIdAndComponentId(
    null,
    '57lxhwfp5r'
    );
    expect(nullNodeIdResult).toEqual(-1);

    const nullComponentIdResult = service.getComponentPositionByNodeIdAndComponentId(
    'node13',
    null
    );
    expect(nullComponentIdResult).toEqual(-1);

    const nodeIdDNEResult = service.getComponentPositionByNodeIdAndComponentId(
    'badNodeId',
    '57lxhwfp5r'
    );
    expect(nodeIdDNEResult).toEqual(-1);

    const componentIdDNEResult = service.getComponentPositionByNodeIdAndComponentId(
    'node13',
    'badComponentId'
    );
    expect(componentIdDNEResult).toEqual(-1);

    const componentExists = service.getComponentPositionByNodeIdAndComponentId(
    'node13',
    '57lxhwfp5r'
    );
    expect(componentExists).toEqual(0);

    const componentExists2 = service.getComponentPositionByNodeIdAndComponentId(
    'node9',
    'mnzx68ix8h'
    );
    expect(componentExists2).toEqual(1);
  });
}

function shouldGetTheComponentsByNodeId() {
  it('should get the components by node id', () => {
    service.setProject(scootersProjectJSON);
    const nullNodeIdResult = service.getComponentsByNodeId(null);
    expect(nullNodeIdResult).toEqual([]);
    const nodeIdDNEResult = service.getComponentsByNodeId('badNodeId');
    expect(nodeIdDNEResult).toEqual([]);
    const nodeWithNullComponentResult = service.getComponentsByNodeId(
    'nodeWithNoComponents'
    );
    expect(nodeWithNullComponentResult).toEqual([]);
    const nodeExistsResult = service.getComponentsByNodeId('node13');
    expect(nodeExistsResult).not.toBe(null);
    expect(nodeExistsResult.length).toEqual(1);
    expect(nodeExistsResult[0].id).toEqual('57lxhwfp5r');

    const nodeExistsResult2 = service.getComponentsByNodeId('node9');
    expect(nodeExistsResult2).not.toBe(null);
    expect(nodeExistsResult2.length).toEqual(7);
    expect(nodeExistsResult2[2].id).toEqual('nm080ntk8e');
    expect(nodeExistsResult2[2].type).toEqual('Table');
  });
}

function shouldReturnTheMaxScoreOfTheProject() {
  it('should return the max score of the project', () => {
    service.setProject(demoProjectJSON);
    const demoProjectMaxScoreActual = service.getMaxScore();
    expect(demoProjectMaxScoreActual).toBeNull();
    service.setProject(scootersProjectJSON);
    const scootersProjectMaxScoreExpected = 18;
    const scootersProjectMaxScoreActual = service.getMaxScore();
    expect(scootersProjectMaxScoreActual).toEqual(scootersProjectMaxScoreExpected);
  });
}

function shouldNotAddSpaceIfItDoesExist() {
  it('should not add space if it does exist', () => {
    service.setProject(scootersProjectJSON);
    const spaces = service.getSpaces();
    expect(spaces.length).toEqual(2);
    const space = {
      id: 'public',
      name: 'Public',
      isPublic: true,
      isShowInNotebook: true
    };
    service.addSpace(space);
    expect(spaces.length).toEqual(2);
    expect(spaces[0].id).toEqual('public');
    expect(spaces[1].id).toEqual('ideasAboutGlobalClimateChange');
  });
}

function shouldAddSpaceIfItDoesntExist() {
  it("should add space if it doesn't exist", () => {
    service.setProject(scootersProjectJSON);
    const spaces = service.getSpaces();
    expect(spaces.length).toEqual(2);
    const space = {
      id: 'newSpace',
      name: 'New Space to share your thoughts',
      isPublic: true,
      isShowInNotebook: false
    };
    service.addSpace(space);
    expect(spaces.length).toEqual(3);
    expect(spaces[0].id).toEqual('public');
    expect(spaces[1].id).toEqual('ideasAboutGlobalClimateChange');
    expect(spaces[2].id).toEqual('newSpace');
  });
}

function shouldNotRemoveASpaceThatDoesNotExist() {
  it('should not remove a space that does not exist', () => {
    service.setProject(demoProjectJSON);
    const spaces = service.getSpaces();
    expect(spaces.length).toEqual(1);
    service.removeSpace('public');
    expect(spaces.length).toEqual(1);
  });
}

function shouldRemoveASpaceThatDoesExist() {
  it('should remove a space that does exist', () => {
    service.setProject(demoProjectJSON);
    const spaces = service.getSpaces();
    expect(spaces.length).toEqual(1);
    service.removeSpace('sharePictures');
    expect(spaces.length).toEqual(0);
  });
}

function shouldCheckOrderBetweenStepAndStepGroup() {
  it('should check order between step and step/group', () => {
    service.setProject(demoProjectJSON);
    expect(service.isNodeIdAfter('node1', 'node2')).toBeTruthy();
    expect(service.isNodeIdAfter('node2', 'node1')).toBeFalsy();
    expect(service.isNodeIdAfter('node1', 'group2')).toBeTruthy();
    expect(service.isNodeIdAfter('node20', 'group1')).toBeFalsy();
  });
}

function shouldCheckOrderBetweenGroupAndStepGroup() {
  it('should check order between group and step/group', () => {
    service.setProject(demoProjectJSON);
    expect(service.isNodeIdAfter('group1', 'group2')).toBeTruthy();
    expect(service.isNodeIdAfter('group2', 'group1')).toBeFalsy();
    expect(service.isNodeIdAfter('group1', 'node20')).toBeTruthy();
    expect(service.isNodeIdAfter('group2', 'node1')).toBeFalsy();
  });
}

function shouldRemoveTransitionsGoingOutOfGroupInChildNodesOfGroup() {
  it('should remove transitions going out of group in child nodes of group', () => {
    service.setProject(demoProjectJSON);
    expect(service.getTransitionsByFromNodeId('node18').length).toEqual(1);
    expect(service.getTransitionsByFromNodeId('node19').length).toEqual(1);
    service.removeTransitionsOutOfGroup('group1');
    expect(service.getTransitionsByFromNodeId('node18').length).toEqual(1);
    expect(service.getTransitionsByFromNodeId('node19').length).toEqual(0);
  });
}

function shouldRemoveNodeFromGroup() {
  it('should remove node from group', () => {
    service.setProject(demoProjectJSON);
    expect(service.getChildNodeIdsById('group1').length).toEqual(19);
    service.removeNodeIdFromGroup(service.getNodeById('group1'), 'node3');
    expect(service.getChildNodeIdsById('group1').length).toEqual(18);
    expect(service.getGroupStartId('group1')).toEqual('node1');
    service.removeNodeIdFromGroup(service.getNodeById('group1'), 'node4');
    expect(service.getChildNodeIdsById('group1').length).toEqual(17);
    expect(service.getGroupStartId('group1')).toEqual('node1');
  });
}

function shouldRemoveStartNodeFromGroup() {
  it('should remove start node from group', () => {
    service.setProject(demoProjectJSON);
    expect(service.getChildNodeIdsById('group1').length).toEqual(19);
    service.removeNodeIdFromGroup(service.getNodeById('group1'), 'node1');
    expect(service.getChildNodeIdsById('group1').length).toEqual(18);
    expect(service.getGroupStartId('group1')).toEqual('node2');
    service.removeNodeIdFromGroup(service.getNodeById('group1'), 'node2');
    expect(service.getChildNodeIdsById('group1').length).toEqual(17);
    expect(service.getGroupStartId('group1')).toEqual('node3');
  });
}

function shouldIdentifyBranchStartPoint() {
  it('should identify branch start point', () => {
    service.setProject(demoProjectJSON);
    expect(service.isBranchStartPoint('group1')).toBeFalsy();
    expect(service.isBranchStartPoint('node29')).toBeFalsy();
    expect(service.isBranchStartPoint('node32')).toBeFalsy();
    expect(service.isBranchStartPoint('node30')).toBeTruthy();
  });
}

function shouldIdentifyBranchMergePoint() {
  it('should identify branch merge point', () => {
    service.setProject(demoProjectJSON);
    expect(service.isBranchMergePoint('group1')).toBeFalsy();
    expect(service.isBranchMergePoint('node30')).toBeFalsy();
    expect(service.isBranchMergePoint('node32')).toBeFalsy();
    expect(service.isBranchMergePoint('node34')).toBeTruthy();
  });
}

function shouldGetPathWhenNodeIdIsFound() {
  it('should get path when nodeId is found', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = service.consumePathsUntilNodeId(paths, 'node3');
    const expectedPath = ['node1', 'node2'];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = service.consumePathsUntilNodeId(paths2, 'node3');
    const expectedPath2 = ['node1', 'node2', 'node4'];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldGetPathWhenNodeIdIsFoundAsFirst() {
  it('should get path when nodeId is found as first', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = service.consumePathsUntilNodeId(paths, 'node1');
    const expectedPath = [];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = service.consumePathsUntilNodeId(paths2, 'node1');
    const expectedPath2 = [];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldGetPathWhenNodeIdIsNotFound() {
  it('should get path when nodeId is not found', () => {
    const paths = [['node1', 'node2', 'node3', 'node4', 'node5']];
    const subPath = service.consumePathsUntilNodeId(paths, 'node6');
    const expectedPath = [];
    expect(JSON.stringify(subPath)).toEqual(JSON.stringify(expectedPath));

    const paths2 = [
      ['node1', 'node2', 'node3', 'node4', 'node5'],
      ['node1', 'node2', 'node4', 'node3', 'node5']
    ];
    const subPath2 = service.consumePathsUntilNodeId(paths2, 'node6');
    const expectedPath2 = [];
    expect(JSON.stringify(subPath2)).toEqual(JSON.stringify(expectedPath2));
  });
}

function shouldBeAbleToInsertAStepNodeAfterAnotherStepNode() {
  it('should be able to insert a step node after another step node', () => {
    service.setProject(demoProjectJSON);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node1'), 'node2')
    ).toBeTruthy();
    service.insertNodeAfterInTransitions(service.getNodeById('node1'), 'node2');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node1'), 'node2')
    ).toBeFalsy();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node2'), 'node1')
    ).toBeTruthy();
  });
}

function shouldBeAbleToInsertAnActivityNodeAfterAnotherActivityNode() {
  it('should be able to insert an activity node after another activity node', () => {
    service.setProject(demoProjectJSON);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group1'), 'group2')
    ).toBeTruthy();
    service.insertNodeAfterInTransitions(service.getNodeById('group1'), 'group2');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group1'), 'group2')
    ).toBeFalsy();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group1')
    ).toBeTruthy();
  });
}

function shouldNotBeAbleToInsertANodeAfterAnotherNodeWhenTheyAreDifferentTypes() {
  it('should not be able to insert a node after another node when they are different types', () => {
    service.setProject(demoProjectJSON);
    expect(() => {
      service.insertNodeAfterInTransitions(service.getNodeById('node1'), 'group2');
    }).toThrow('Error: insertNodeAfterInTransitions() nodes are not the same type');
  });
}

function shouldBeAbleToInsertAStepNodeInsideAGroupNode() {
  it('should be able to insert a step node inside an group node', () => {
    service.setProject(demoProjectJSON);
    const node1 = service.getNodeById('node1');
    const node19 = service.getNodeById('node19');
    expect(service.nodeHasTransitionToNodeId(node1, 'node2')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(node1, 'node20')).toBeFalsy();
    expect(service.nodeHasTransitionToNodeId(node19, 'node20')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(node19, 'node1')).toBeFalsy();
    service.insertNodeInsideOnlyUpdateTransitions('node1', 'group2');
    expect(service.nodeHasTransitionToNodeId(node1, 'node20')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(node1, 'node2')).toBeFalsy();
    expect(service.nodeHasTransitionToNodeId(node19, 'node1')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(node19, 'node20')).toBeFalsy();
  });
}

function shouldBeAbleToInsertAGroupNodeInsideAGroupNode() {
  it('should be able to insert a group node inside a group node', () => {
    service.setProject(demoProjectJSON);
    const group1 = service.getNodeById('group1');
    const group2 = service.getNodeById('group2');
    expect(service.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(group2, 'group1')).toBeFalsy();
    service.insertNodeInsideOnlyUpdateTransitions('group2', 'group0');
    expect(service.nodeHasTransitionToNodeId(group2, 'group1')).toBeTruthy();
    /*
     * the transition from group1 to group2 still remains because it is usually
     * removed by calling removeNodeIdFromTransitions() but we don't call it here
     */
    expect(service.nodeHasTransitionToNodeId(group1, 'group2')).toBeTruthy();
  });
}

function shouldNotBeAbleToInsertAStepNodeInsideAStepNode() {
  it('should not be able to insert a step node inside a step node', () => {
    service.setProject(demoProjectJSON);
    expect(() => {
      service.insertNodeInsideOnlyUpdateTransitions('node1', 'node2');
    }).toThrow('Error: insertNodeInsideOnlyUpdateTransitions() second parameter must be a group');
  });
}

function shouldDeleteAStepFromTheProject() {
  it('should delete a step from the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.getNodes().length).toEqual(54);
    expect(service.getNodeById('node5')).not.toBeNull();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node4'), 'node5')
    ).toBeTruthy();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node5'), 'node6')
    ).toBeTruthy();
    expect(service.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
    service.deleteNode('node5');
    expect(service.getNodes().length).toEqual(53);
    expect(service.getNodeById('node5')).toBeNull();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node4'), 'node6')
    ).toBeTruthy();
    expect(service.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
  });
}

function shouldDeleteAnInactiveStepFromTheProject() {
  it('should delete an inactive step from the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.getInactiveNodes().length).toEqual(1);
    expect(service.getNodeById('node789')).not.toBeNull();
    service.deleteNode('node789');
    expect(service.getInactiveNodes().length).toEqual(0);
    expect(service.getNodeById('node789')).toBeNull();
  });
}

function shouldDeleteAStepThatIsTheStartIdOfTheProject() {
  it('should delete a step that is the start id of the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.getStartNodeId()).toEqual('node1');
    expect(service.getNodesWithTransitionToNodeId('node2').length).toEqual(1);
    service.deleteNode('node1');
    expect(service.getStartNodeId()).toEqual('node2');
    expect(service.getNodesWithTransitionToNodeId('node2').length).toEqual(0);
  });
}

function shouldDeleteAStepThatIsTheLastStepOfTheProject() {
  it('should delete a step that is the last step of the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.getTransitionsByFromNodeId('node802').length).toEqual(1);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node802'), 'node803')
    ).toBeTruthy();
    service.deleteNode('node803');
    expect(service.getTransitionsByFromNodeId('node802').length).toEqual(0);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node802'), 'node803')
    ).toBeFalsy();
  });
}

function shouldDeleteAStepThatIsTheStartIdOfAnAactivityThatIsNotTheFirstActivity() {
  it('should delete a step that is the start id of an activity that is not the first activity',
      () => {
    service.setProject(demoProjectJSON);
    expect(service.getGroupStartId('group2')).toEqual('node20');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node19'), 'node20')
    ).toBeTruthy();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node20'), 'node21')
    ).toBeTruthy();
    service.deleteNode('node20');
    expect(service.getGroupStartId('group2')).toEqual('node21');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node19'), 'node21')
    ).toBeTruthy();
  });
}

function shouldDeleteTheFirstActivityFromTheProject() {
  it('should delete the first activity from the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.getGroupStartId('group0')).toEqual('group1');
    expect(service.getStartNodeId()).toEqual('node1');
    expect(service.getNodes().length).toEqual(54);
    expect(service.getNodesWithTransitionToNodeId('node20').length).toEqual(1);
    service.deleteNode('group1');
    expect(service.getNodeById('group1')).toBeNull();
    expect(service.getGroupStartId('group0')).toEqual('group2');
    expect(service.getStartNodeId()).toEqual('node20');
    expect(service.getNodes().length).toEqual(34);
    expect(service.getNodesWithTransitionToNodeId('node20').length).toEqual(0);
  });
}

function shouldDeleteAnActivityInTheMiddleOfTheProject() {
  it('should delete an activity that is in the middle of the project', () => {
    service.setProject(demoProjectJSON);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group3')
    ).toBeTruthy();
    expect(service.getNodes().length).toEqual(54);
    service.deleteNode('group3');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group3')
    ).toBeFalsy();
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group4')
    ).toBeTruthy();
    expect(service.getNodes().length).toEqual(51);
  });
}

function shouldDeleteTheLastActivityFromTheProject() {
  it('should delete the last activity from the project', () => {
    service.setProject(demoProjectJSON);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group4'), 'group5')
    ).toBeTruthy();
    expect(service.getTransitionsByFromNodeId('group4').length).toEqual(1);
    expect(service.getNodes().length).toEqual(54);
    service.deleteNode('group5');
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('group4'), 'group5')
    ).toBeFalsy();
    expect(service.getTransitionsByFromNodeId('group4').length).toEqual(0);
    expect(service.getNodes().length).toEqual(48);
  });
}

function calculateNodeOrder() {
  describe('calculateNodeOrder', () => {
    it('should calculate the node order', () => {
      service.project = demoProjectJSON;
      service.loadNodes(demoProjectJSON.nodes);
      service.calculateNodeOrder(demoProjectJSON.nodes[0]);
      expect(service.idToOrder['group0'].order).toEqual(0);
      expect(service.idToOrder['group1'].order).toEqual(1);
      expect(service.idToOrder['node1'].order).toEqual(2);
      expect(service.idToOrder['node2'].order).toEqual(3);
      expect(service.idToOrder['node3'].order).toEqual(4);
      expect(service.idToOrder['node4'].order).toEqual(5);
      expect(service.idToOrder['node5'].order).toEqual(6);
      expect(service.idToOrder['node6'].order).toEqual(7);
    });
  });
}

function getGroupNodesIdToOrder() {
  describe('getGroupNodesIdToOrder', () => {
    it('should return only group nodes in idToOrder', () => {
      service.project = demoProjectJSON;
      service.loadNodes(demoProjectJSON.nodes);
      service.calculateNodeOrder(demoProjectJSON.nodes[0]);
      expect(service.getGroupNodesIdToOrder()).toEqual({
        group0: { order: 0 },
        group1: { order: 1 },
        group2: { order: 21 },
        group3: { order: 37 },
        group4: { order: 40 },
        group5: { order: 48 }
      });
    });
  });
}

function getUniqueAuthors() {
  describe('getUniqueAuthors', () => {
    it('should get unique authors when there are no authors', () => {
      const authors = [];
      const uniqueAuthors = service.getUniqueAuthors(authors);
      expect(uniqueAuthors.length).toEqual(0);
    });

    it('should get unique authors when there is one author', () => {
      const authors = [
        { id: 1, firstName: 'a', lastName: 'a' }
      ];
      const uniqueAuthors = service.getUniqueAuthors(authors);
      expect(uniqueAuthors.length).toEqual(1);
      expect(uniqueAuthors[0].id).toEqual(1);
      expect(uniqueAuthors[0].firstName).toEqual('a');
      expect(uniqueAuthors[0].lastName).toEqual('a');
    });

    it('should get unique authors when there are multiple duplicates', () => {
      const authors = [
        { id: 1, firstName: 'a', lastName: 'a' },
        { id: 2, firstName: 'b', lastName: 'b' },
        { id: 1, firstName: 'a', lastName: 'a' },
        { id: 3, firstName: 'c', lastName: 'c' },
        { id: 3, firstName: 'c', lastName: 'c' },
        { id: 1, firstName: 'a', lastName: 'a' }
      ];
      const uniqueAuthors = service.getUniqueAuthors(authors);
      expect(uniqueAuthors.length).toEqual(3);
      expect(uniqueAuthors[0].id).toEqual(1);
      expect(uniqueAuthors[0].firstName).toEqual('a');
      expect(uniqueAuthors[0].lastName).toEqual('a');
      expect(uniqueAuthors[1].id).toEqual(2);
      expect(uniqueAuthors[1].firstName).toEqual('b');
      expect(uniqueAuthors[1].lastName).toEqual('b');
      expect(uniqueAuthors[2].id).toEqual(3);
      expect(uniqueAuthors[2].firstName).toEqual('c');
      expect(uniqueAuthors[2].lastName).toEqual('c');
    });

    it('should get unique authors when there are no duplicates', () => {
      const authors = [
        { id: 1, firstName: 'a', lastName: 'a' },
        { id: 2, firstName: 'b', lastName: 'b' },
        { id: 3, firstName: 'c', lastName: 'c' }
      ];
      const uniqueAuthors = service.getUniqueAuthors(authors);
      expect(uniqueAuthors.length).toEqual(3);
      expect(uniqueAuthors[0].id).toEqual(1);
      expect(uniqueAuthors[0].firstName).toEqual('a');
      expect(uniqueAuthors[0].lastName).toEqual('a');
      expect(uniqueAuthors[1].id).toEqual(2);
      expect(uniqueAuthors[1].firstName).toEqual('b');
      expect(uniqueAuthors[1].lastName).toEqual('b');
      expect(uniqueAuthors[2].id).toEqual(3);
      expect(uniqueAuthors[2].firstName).toEqual('c');
      expect(uniqueAuthors[2].lastName).toEqual('c');
    });
  });
}

function deleteActivityWithBranching() {
  it(`should delete an activity with branching and is also the first activity in the project 
      and properly set the project start node id`, () => {
    service.setProject(demoProjectJSON);
    expect(service.getStartNodeId()).toEqual('node1');
    service.deleteNode('group1');
    expect(service.getStartNodeId()).toEqual('node20');
  });

  it(`should delete an activity in the middle of the project with branching and properly remove
      transitions from remaining steps`, () => {
    service.setProject(demoProjectJSON);
    const node19 = service.getNodeById('node19');
    const node19Transitions = node19.transitionLogic.transitions;
    expect(node19Transitions.length).toEqual(1);
    expect(node19Transitions[0].to).toEqual('node20');
    service.deleteNode('group2');
    expect(node19Transitions.length).toEqual(1);
    expect(node19Transitions[0].to).toEqual('node790');
  });

  it(`should delete an activity at the end of the project with branching and properly remove
      transitions from remaining steps`, () => {
    service.setProject(demoProjectJSON);
    const node798 = service.getNodeById('node798');
    const node798Transitions = node798.transitionLogic.transitions;
    expect(node798Transitions.length).toEqual(1);
    expect(node798Transitions[0].to).toEqual('node799');
    service.deleteNode('group5');
    expect(node798Transitions.length).toEqual(0);
  });
}

function deleteTheLastStepInAnActivity() {
  it(`should delete the last step in an activity in the middle of the project and set previous
      step to transition to the first step of the next activity`, () => {
    service.setProject(demoProjectJSON);
    const node790Transitions = service.getTransitionsByFromNodeId('node790');
    expect(node790Transitions.length).toEqual(1);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node790'), 'node791')
    ).toBeTruthy();
    service.deleteNode('node791');
    expect(node790Transitions.length).toEqual(1);
    expect(
      service.nodeHasTransitionToNodeId(service.getNodeById('node790'), 'node792')
    ).toBeTruthy();
  });
}

function deleteAllStepsInAnActivity() {
  it(`should delete all steps in an activity in the middle of the project and set previous step
      to transition to activity`, () => {
    service.setProject(demoProjectJSON);
    const node34 = service.getNodeById('node34');
    const node34Transitions = node34.transitionLogic.transitions;
    expect(node34Transitions.length).toEqual(1);
    expect(node34Transitions[0].to).toEqual('node790');
    service.deleteNode('node790');
    service.deleteNode('node791');
    expect(node34Transitions.length).toEqual(1);
    expect(node34Transitions[0].to).toEqual('group3');
  });
}

function getTags() {
  it ('should get tags from the project', () => {
    service.setProject(demoProjectJSON);
    const tags = service.getTags();
    expect(tags.length).toEqual(2);
    expect(tags[0].name).toEqual('Group 1');
    expect(tags[1].name).toEqual('Group 2');
  });
}