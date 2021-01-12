import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ProjectService } from '../../../../wise5/services/projectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import demoProjectJSON_import from './sampleData/curriculum/Demo.project.json';
import oneBranchTwoPathsProjectJSON_import from './sampleData/curriculum/OneBranchTwoPaths.project.json';
import scootersProjectJSON_import from './sampleData/curriculum/SelfPropelledVehiclesChallenge.project.json';
import twoStepsProjectJSON_import from './sampleData/curriculum/TwoSteps.project.json';
import { SessionService } from '../../../../wise5/services/sessionService';
const projectIdDefault = 1;
const projectBaseURL = 'http://localhost:8080/curriculum/12345/';
const projectURL = projectBaseURL + 'project.json';
const saveProjectURL = 'http://localhost:8080/wise/project/save/' + projectIdDefault;
const wiseBaseURL = '/wise';
let service: ProjectService;
let configService: ConfigService;
let sessionService: SessionService;
let utilService: UtilService;
let http: HttpTestingController;
let demoProjectJSON: any;
let oneBranchTwoPathsProjectJSON: any;
let scootersProjectJSON: any;
let twoStepsProjectJSON: any;

describe('ProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ProjectService, ConfigService, SessionService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    sessionService = TestBed.get(SessionService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope').and.callFake(() => {});
    service = TestBed.get(ProjectService);
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSON_import));
    oneBranchTwoPathsProjectJSON = JSON.parse(JSON.stringify(oneBranchTwoPathsProjectJSON_import));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSON_import));
    twoStepsProjectJSON = JSON.parse(JSON.stringify(twoStepsProjectJSON_import));
  });
  shouldReplaceAssetPathsInNonHtmlComponentContent();
  shouldReplaceAssetPathsInHtmlComponentContent();
  shouldNotReplaceAssetPathsInHtmlComponentContent();
  shouldRetrieveProjectWhenConfigProjectURLIsValid();
  shouldNotRetrieveProjectWhenConfigProjectURLIsUndefined();
  shouldGetDefaultThemePathWhenThemeIsNotDefinedInTheProject();
  shouldGetProjectThemePathWhenThemeIsDefinedInTheProject();
  shouldReturnTheStartNodeOfTheProject();
  shouldReturnTheNodeByNodeId();
  shouldReturnTheNodeTitleByNodeId();
  shouldGetTheComponentByNodeIdAndComponentId();
  shouldGetTheComponentPositionByNodeIdAndComonentId();
  shouldGetTheComponentsByNodeId();
  shouldCheckOrderBetweenStepGroupAndStepGroup();
  shouldIdentifyBranchStartAndMergePoints();
  shouldGetPaths();
  calculateNodeOrder();
  getGroupNodesIdToOrder();
  getTags();
  getAllPaths();
  consolidatePaths();
  getParentGroup();
  // TODO: add test for service.getFlattenedProjectAsNodeIds()
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
  spyOn(configService, 'getConfigParam').and.callFake((param) => {
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
    spyOn(configService, 'getConfigParam').withArgs('projectURL').and.returnValue(projectURL);
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

function shouldGetTheComponentByNodeIdAndComponentId() {
  it('should get the component by node id and component id', () => {
    service.setProject(scootersProjectJSON);
    const nullNodeIdResult = service.getComponentByNodeIdAndComponentId(null, '57lxhwfp5r');
    expect(nullNodeIdResult).toBeNull();

    const nullComponentIdResult = service.getComponentByNodeIdAndComponentId('node13', null);
    expect(nullComponentIdResult).toBeNull();

    const nodeIdDNEResult = service.getComponentByNodeIdAndComponentId('badNodeId', '57lxhwfp5r');
    expect(nodeIdDNEResult).toBeNull();

    const componentIdDNEResult = service.getComponentByNodeIdAndComponentId(
      'node13',
      'badComponentId'
    );
    expect(componentIdDNEResult).toBeNull();

    const componentExists = service.getComponentByNodeIdAndComponentId('node13', '57lxhwfp5r');
    expect(componentExists).not.toBe(null);
    expect(componentExists.type).toEqual('HTML');

    const componentExists2 = service.getComponentByNodeIdAndComponentId('node9', 'mnzx68ix8h');
    expect(componentExists2).not.toBe(null);
    expect(componentExists2.type).toEqual('embedded');
    expect(componentExists2.url).toEqual('NewtonScooters-potential-kinetic.html');
  });
}

function shouldGetTheComponentPositionByNodeIdAndComonentId() {
  it('should get the component position by node id and comonent id', () => {
    service.setProject(scootersProjectJSON);
    const nullNodeIdResult = service.getComponentPositionByNodeIdAndComponentId(null, '57lxhwfp5r');
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
    const nodeWithNullComponentResult = service.getComponentsByNodeId('nodeWithNoComponents');
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

function shouldCheckOrderBetweenStepGroupAndStepGroup() {
  it('should check order between step/group and step/group', () => {
    service.setProject(demoProjectJSON);
    expect(service.isNodeIdAfter('node1', 'node2')).toBeTruthy();
    expect(service.isNodeIdAfter('node2', 'node1')).toBeFalsy();
    expect(service.isNodeIdAfter('node1', 'group2')).toBeTruthy();
    expect(service.isNodeIdAfter('node20', 'group1')).toBeFalsy();
    expect(service.isNodeIdAfter('group1', 'group2')).toBeTruthy();
    expect(service.isNodeIdAfter('group2', 'group1')).toBeFalsy();
    expect(service.isNodeIdAfter('group1', 'node20')).toBeTruthy();
    expect(service.isNodeIdAfter('group2', 'node1')).toBeFalsy();
  });
}

function shouldIdentifyBranchStartAndMergePoints() {
  it('should identify branch start point', () => {
    service.setProject(demoProjectJSON);
    expectFunctionCallToReturnValue('isBranchStartPoint', ['group1', 'node29', 'node32'], false);
    expectFunctionCallToReturnValue('isBranchStartPoint', ['node30'], true);
    expectFunctionCallToReturnValue('isBranchMergePoint', ['group1', 'node30', 'node32'], false);
    expectFunctionCallToReturnValue('isBranchMergePoint', ['node34'], true);
  });
}

function expectFunctionCallToReturnValue(func, nodeIdArray, expectedValue) {
  nodeIdArray.forEach((nodeId) => {
    expect(service[func](nodeId)).toEqual(expectedValue);
  });
}

function shouldGetPaths() {
  const paths1 = [['node1', 'node2', 'node3', 'node4', 'node5']];
  const paths2 = [
    ['node1', 'node2', 'node3', 'node4', 'node5'],
    ['node1', 'node2', 'node4', 'node3', 'node5']
  ];
  it('should get path when nodeId is found', () => {
    expectPaths(paths1, 'node3', ['node1', 'node2']);
    expectPaths(paths2, 'node3', ['node1', 'node2', 'node4']);
  });
  it('should get path when nodeId is found as first', () => {
    expectPaths(paths1, 'node1', []);
    expectPaths(paths2, 'node1', []);
  });
  it('should get path when nodeId is not found', () => {
    expectPaths(paths1, 'node6', []);
    expectPaths(paths2, 'node6', []);
  });
}

function expectPaths(paths, nodeId, expectedPath) {
  const subPath = service.consumePathsUntilNodeId(paths, nodeId);
  expect(subPath).toEqual(expectedPath);
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

function getTags() {
  it('should get tags from the project', () => {
    service.setProject(demoProjectJSON);
    const tags = service.getTags();
    expect(tags.length).toEqual(2);
    expect(tags[0].name).toEqual('Group 1');
    expect(tags[1].name).toEqual('Group 2');
  });
}

function getAllPaths() {
  describe('getAllPaths()', () => {
    it('should get all paths in a unit with no branches', () => {
      service.setProject(twoStepsProjectJSON);
      const allPaths = service.getAllPaths([], service.getStartNodeId(), true);
      expect(allPaths.length).toEqual(1);
      expect(allPaths[0]).toEqual(['group1', 'node1', 'node2']);
    });
    it('should get all paths in a unit with a branch with two paths', () => {
      service.setProject(oneBranchTwoPathsProjectJSON);
      const allPaths = service.getAllPaths([], service.getStartNodeId(), true);
      expect(allPaths.length).toEqual(2);
      expect(allPaths[0]).toEqual(['group1', 'node1', 'node2', 'node3', 'node4', 'node8']);
      expect(allPaths[1]).toEqual(['group1', 'node1', 'node2', 'node5', 'node6', 'node7', 'node8']);
    });
    it('should get all paths in a unit starting with a node in a branch path', () => {
      service.setProject(oneBranchTwoPathsProjectJSON);
      const allPaths1 = service.getAllPaths(['group1', 'node1', 'node2'], 'node3', true);
      expect(allPaths1.length).toEqual(1);
      expect(allPaths1[0]).toEqual(['node3', 'node4', 'node8']);
      const allPaths2 = service.getAllPaths(['group1', 'node1', 'node2'], 'node5', true);
      expect(allPaths2.length).toEqual(1);
      expect(allPaths2[0]).toEqual(['node5', 'node6', 'node7', 'node8']);
    });
  });
}

function consolidatePaths() {
  describe('consolidatePaths()', () => {
    it('should consolidate all the paths into a linear list of node ids', () => {
      service.setProject(oneBranchTwoPathsProjectJSON);
      const allPaths = service.getAllPaths([], service.getStartNodeId(), true);
      const consolidatedPaths = service.consolidatePaths(allPaths);
      expect(consolidatedPaths).toEqual([
        'group1',
        'node1',
        'node2',
        'node3',
        'node4',
        'node5',
        'node6',
        'node7',
        'node8'
      ]);
    });
  });
}

function getParentGroup() {
  describe('getParentGroup()', () => {
    beforeEach(() => {
      service.setProject(twoStepsProjectJSON);
    });
    it('should get the parent group of an active node', () => {
      expect(service.getParentGroup('node1').id).toEqual('group1');
    });
    it('should get the parent group of an inactive node', () => {
      expect(service.getParentGroup('node3').id).toEqual('group2');
    });
  });
}
