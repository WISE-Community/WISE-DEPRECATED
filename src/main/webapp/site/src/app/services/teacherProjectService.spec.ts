import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { TeacherProjectService } from '../../../../wise5/services/teacherProjectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import demoProjectJSON_import from './sampleData/curriculum/Demo.project.json';
import scootersProjectJSON_import from './sampleData/curriculum/SelfPropelledVehiclesChallenge.project.json';
import teacherProjctJSON_import from './sampleData/curriculum/TeacherProjectServiceSpec.project.json';
import { SessionService } from '../../../../wise5/services/sessionService';
let service: TeacherProjectService;
let configService: ConfigService;
let sessionService: SessionService;
let utilService: UtilService;
let http: HttpTestingController;
let demoProjectJSON: any;
let scootersProjectJSON: any;
let teacherProjectJSON: any;

const scootersProjectJSONString = JSON.stringify(demoProjectJSON_import);
const scootersProjectName = 'scooters';
const projectIdDefault = 1;
const projectBaseURL = 'http://localhost:8080/curriculum/12345/';
const projectURL = projectBaseURL + 'project.json';
const registerNewProjectURL = 'http://localhost:8080/wise/project/new';
const saveProjectURL = 'http://localhost:8080/wise/project/save/' + projectIdDefault;
const wiseBaseURL = '/wise';
const getLibraryProjectsURL = '/api/project/library';
const libraryProjects = [
  {
    children: [
      { id: 3, name: 'three' },
      { id: 1, name: 'one' }
    ]
  },
  {
    children: [
      { id: 2, name: 'two' },
      { id: 1, name: 'one' }
    ]
  }
];

describe('TeacherProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [TeacherProjectService, ConfigService, SessionService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(TeacherProjectService);
    configService = TestBed.get(ConfigService);
    sessionService = TestBed.get(SessionService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope');
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSON_import));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSON_import));
    teacherProjectJSON = JSON.parse(JSON.stringify(teacherProjctJSON_import));
  });
  registerNewProject();
  isNodeIdUsed();
  isNodeIdToInsertTargetNotSpecified();
  testDeleteComponent();
  testDeleteTransition();
  testGetNodeIdAfter();
  testCreateNodeAfter();
  getLibraryProjects();
  sortAndFilterUniqueLibraryProjects();
  filterUniqueProjects();
  shouldGetTheNodeIdAndComponentIdObjects();
  shouldGetTheBranchLetter();
  lockNode();
  unlockNode();
  getNextAvailableNodeId();
  shouldReturnTheNextAvailableGroupId();
  shouldReturnTheGroupIdsInTheProject();
  shouldReturnTheMaxScoreOfTheProject();
  shouldNotAddSpaceIfItDoesExist();
  shouldAddSpaceIfItDoesntExist();
  shouldRemoveSpaces();
  shouldRemoveTransitionsGoingOutOfGroupInChildNodesOfGroup();
  removeNodeFromGroup();
  insertNodeAfterInTransitions();
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
  getUniqueAuthors();
  deleteActivityWithBranching();
  deleteTheLastStepInAnActivity();
  deleteAllStepsInAnActivity();
  addCurrentUserToAuthors_CM_shouldAddUserInfo();
  getNodeIds();
  getInactiveNodeIds();
  shouldHandleSaveProjectResponse();
  shouldNotSaveProjectWhenTheUserDoesNotHavePermissionToEditTheProject();
  shouldSaveProject();
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

function createConfigServiceGetConfigParamSpy() {
  spyOn(configService, 'getConfigParam').and.callFake((param) => {
    if (param === 'projectBaseURL') {
      return projectBaseURL;
    } else if (param === 'projectURL') {
      return projectURL;
    } else if (param === 'registerNewProjectURL') {
      return registerNewProjectURL;
    } else if (param === 'saveProjectURL') {
      return saveProjectURL;
    } else if (param === 'wiseBaseURL') {
      return wiseBaseURL;
    } else if (param === 'getLibraryProjectsURL') {
      return getLibraryProjectsURL;
    }
  });
}

function registerNewProject() {
  describe('registerNewProject', () => {
    it('should register new project', () => {
      createConfigServiceGetConfigParamSpy();
      const newProjectIdExpected = projectIdDefault;
      const newProjectIdActual = service.registerNewProject(
        scootersProjectName,
        scootersProjectJSONString
      );
      http.expectOne(registerNewProjectURL).flush(newProjectIdExpected);
      newProjectIdActual.then((result) => {
        expect(result).toEqual(newProjectIdExpected);
      });
    });
  });
}

function isNodeIdUsed() {
  describe('isNodeIdUsed', () => {
    beforeEach(() => {
      service.setProject(demoProjectJSON);
    });
    it('should find used node id in active nodes', () => {
      expect(service.isNodeIdUsed('node1')).toEqual(true);
    });

    it('should find used node id in inactive nodes', () => {
      expect(service.isNodeIdUsed('node789')).toEqual(true);
    });

    it('should not find used node id in active or inactive nodes', () => {
      expect(service.isNodeIdUsed('nodedoesnotexist')).toEqual(false);
    });
  });
}

function isNodeIdToInsertTargetNotSpecified() {
  describe('isNodeIdToInsertTargetNotSpecified', () => {
    it('should return true for null, inactive nodes, steps, and activities', () => {
      expect(service.isNodeIdToInsertTargetNotSpecified('inactiveNodes')).toBeTruthy();
      expect(service.isNodeIdToInsertTargetNotSpecified('inactiveSteps')).toBeTruthy();
      expect(service.isNodeIdToInsertTargetNotSpecified('inactiveGroups')).toBeTruthy();
      expect(service.isNodeIdToInsertTargetNotSpecified(null)).toBeTruthy();
    });

    it('should return false for active nodes and groups', () => {
      expect(service.isNodeIdToInsertTargetNotSpecified('activeNodes')).toBeFalsy();
      expect(service.isNodeIdToInsertTargetNotSpecified('activeGroups')).toBeFalsy();
    });
  });
}

function testDeleteComponent() {
  describe('deleteComponent', () => {
    it('should delete the component from the node', () => {
      service.setProject(demoProjectJSON);
      expect(service.getComponentByNodeIdAndComponentId('node1', 'zh4h1urdys')).not.toBeNull();
      service.deleteComponent('node1', 'zh4h1urdys');
      expect(service.getComponentByNodeIdAndComponentId('node1', 'zh4h1urdys')).toBeNull();
    });
  });
}

function testDeleteTransition() {
  describe('deleteTransition', () => {
    it('should delete existing transition from the node', () => {
      service.setProject(demoProjectJSON);
      const node1 = service.getNodeById('node1');
      expect(service.nodeHasTransitionToNodeId(node1, 'node2')).toBeTruthy();
      service.deleteTransition(node1, node1.transitionLogic.transitions[0]);
      expect(service.nodeHasTransitionToNodeId(node1, 'node2')).toBeFalsy();
    });
  });
}

function testGetNodeIdAfter() {
  describe('getNodeIdAfter', () => {
    it('should return the next node in the sequence', () => {
      service.setProject(demoProjectJSON);
      expect(service.getNodeIdAfter('node12')).toEqual('node13');
      expect(service.getNodeIdAfter('node19')).toEqual('group2');
    });
    it('should return null if the node is last', () => {
      service.setProject(demoProjectJSON);
      expect(service.getNodeIdAfter('node39')).toBeNull();
    });
  });
}

function testCreateNodeAfter() {
  describe('createNodeAfter', () => {
    it('should put a new step node after a step node', () => {
      const newNode: any = {
        id: 'node1000',
        type: 'node'
      };
      service.setProject(demoProjectJSON);
      service.createNodeAfter(newNode, 'node19');
      service.parseProject();
      expect(service.idToNode[newNode.id]).toEqual(newNode);
      expect(newNode.transitionLogic.transitions[0].to).toEqual('node20');
      expect(service.getNodeIdAfter('node19')).toEqual('node1000');
    });
  });
}

function getLibraryProjects() {
  describe('getLibraryProjects', () => {
    it('should get the library projects', () => {
      createConfigServiceGetConfigParamSpy();
      const result = service.getLibraryProjects();
      http.expectOne(getLibraryProjectsURL).flush(libraryProjects);
      result.then((projects) => {
        expect(projects).toEqual(libraryProjects);
      });
    });
  });
}

function sortAndFilterUniqueLibraryProjects() {
  describe('sortAndFilterUniqueLibraryProjects', () => {
    it('should filter and sort library projects', () => {
      const result = service.sortAndFilterUniqueLibraryProjects(libraryProjects);
      expect(result).toEqual([
        { id: 3, name: 'three' },
        { id: 2, name: 'two' },
        { id: 1, name: 'one' }
      ]);
    });
  });
}

function filterUniqueProjects() {
  describe('filterUniqueProjects', () => {
    it('should filter unique projects based on id', () => {
      const nonUniqueProjects = [
        { id: 3, name: 'three' },
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
        { id: 1, name: 'one' }
      ];
      const uniqueProjects = service.filterUniqueProjects(nonUniqueProjects);
      expect(uniqueProjects.length).toEqual(3);
      expect(uniqueProjects[0].id).toEqual(3);
      expect(uniqueProjects[1].id).toEqual(1);
      expect(uniqueProjects[2].id).toEqual(2);
    });
  });
}

function shouldGetTheNodeIdAndComponentIdObjects() {
  it('should get the node id and component id objects', () => {
    const project = {
      nodes: [
        {
          id: 'node1',
          components: [
            {
              id: 'node1component1'
            }
          ]
        },
        {
          id: 'node2',
          components: [
            {
              id: 'node2component1'
            },
            {
              id: 'node2component2'
            }
          ]
        }
      ]
    };
    service.setProject(project);
    let nodeIdAndComponentIds = service.getNodeIdsAndComponentIds('node1');
    expect(nodeIdAndComponentIds.length).toEqual(1);
    expect(nodeIdAndComponentIds[0].nodeId).toEqual('node1');
    expect(nodeIdAndComponentIds[0].componentId).toEqual('node1component1');
    nodeIdAndComponentIds = service.getNodeIdsAndComponentIds('node2');
    expect(nodeIdAndComponentIds.length).toEqual(2);
    expect(nodeIdAndComponentIds[0].nodeId).toEqual('node2');
    expect(nodeIdAndComponentIds[0].componentId).toEqual('node2component1');
    expect(nodeIdAndComponentIds[1].nodeId).toEqual('node2');
    expect(nodeIdAndComponentIds[1].componentId).toEqual('node2component2');
  });
}

function shouldGetTheBranchLetter() {
  it('should get the branch letter', () => {
    service.setProject(teacherProjectJSON);
    let branchLetter = service.getBranchLetter('node1');
    expect(branchLetter).toEqual(null);
    branchLetter = service.getBranchLetter('node2');
    expect(branchLetter).toEqual('A');
    branchLetter = service.getBranchLetter('node3');
    expect(branchLetter).toEqual('A');
    branchLetter = service.getBranchLetter('node4');
    expect(branchLetter).toEqual('B');
    branchLetter = service.getBranchLetter('node5');
    expect(branchLetter).toEqual('B');
    branchLetter = service.getBranchLetter('node6');
    expect(branchLetter).toEqual(null);
  });
}

function lockNode() {
  describe('lockNode()', () => {
    it('should add teacherRemoval constraint to node', () => {
      service.setProject(teacherProjectJSON);
      const group1 = service.getNodeById('group1');
      const periodIdToLock = 123;
      expect(group1.constraints).toBeUndefined();
      service.addTeacherRemovalConstraint(group1, periodIdToLock);
      expect(group1.constraints.length).toEqual(1);
      const contraintRemovalCriteria = group1.constraints[0].removalCriteria[0];
      expect(contraintRemovalCriteria.name).toEqual('teacherRemoval');
      expect(contraintRemovalCriteria.params.periodId).toEqual(periodIdToLock);
    });
  });
}

function unlockNode() {
  describe('unlockNode()', () => {
    it('should remove teacherRemoval constraint from node', () => {
      service.setProject(teacherProjectJSON);
      const node6 = service.getNodeById('node6');
      expect(node6.constraints.length).toEqual(2);
      service.removeTeacherRemovalConstraint(node6, 123);
      expect(node6.constraints.length).toEqual(1);
      service.removeTeacherRemovalConstraint(node6, 124);
      expect(node6.constraints.length).toEqual(0);
      service.removeTeacherRemovalConstraint(node6, 999);
      expect(node6.constraints.length).toEqual(0);
    });
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

function shouldRemoveSpaces() {
  let spaces;
  describe('removeSpace', () => {
    beforeEach(() => {
      service.setProject(demoProjectJSON);
      spaces = service.getSpaces();
      expect(spaces.length).toEqual(1);
    });
    it('should not remove a space that does not exist', () => {
      service.removeSpace('public');
      expect(spaces.length).toEqual(1);
    });
    it('should remove a space that does exist', () => {
      service.removeSpace('sharePictures');
      expect(spaces.length).toEqual(0);
    });
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

function expectChildNodeIdLength(nodeId, expectedLength) {
  expect(service.getChildNodeIdsById(nodeId).length).toEqual(expectedLength);
}

function expectGroupStartId(groupId, expectedStartNodeId) {
  expect(service.getGroupStartId(groupId)).toEqual(expectedStartNodeId);
}

function removeNodeFromGroup() {
  it('should remove node from group', () => {
    service.setProject(demoProjectJSON);
    expectChildNodeIdLength('group1', 19);
    const group1 = service.getNodeById('group1');
    service.removeNodeIdFromGroup(group1, 'node3');
    expectChildNodeIdLength('group1', 18);
    service.removeNodeIdFromGroup(group1, 'node4');
    expectChildNodeIdLength('group1', 17);
    expectGroupStartId('group1', 'node1');
    service.removeNodeIdFromGroup(group1, 'node1');
    expectChildNodeIdLength('group1', 16);
    expectGroupStartId('group1', 'node2');
    service.removeNodeIdFromGroup(group1, 'node2');
    expectChildNodeIdLength('group1', 15);
    expectGroupStartId('group1', 'node3');
  });
}

function expectInsertNodeAfterInTransition(nodeIdBefore, nodeIdAfter) {
  service.setProject(demoProjectJSON);
  expect(
    service.nodeHasTransitionToNodeId(service.getNodeById(nodeIdBefore), nodeIdAfter)
  ).toBeTruthy();
  service.insertNodeAfterInTransitions(service.getNodeById(nodeIdBefore), nodeIdAfter);
  expect(
    service.nodeHasTransitionToNodeId(service.getNodeById(nodeIdBefore), nodeIdAfter)
  ).toBeFalsy();
  expect(
    service.nodeHasTransitionToNodeId(service.getNodeById(nodeIdAfter), nodeIdBefore)
  ).toBeTruthy();
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
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node4'), 'node5')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node5'), 'node6')).toBeTruthy();
    expect(service.getNodesWithTransitionToNodeId('node6').length).toEqual(1);
    service.deleteNode('node5');
    expect(service.getNodes().length).toEqual(53);
    expect(service.getNodeById('node5')).toBeNull();
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node4'), 'node6')).toBeTruthy();
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
  it('should delete a step that is the start id of an activity that is not the first activity', () => {
    service.setProject(demoProjectJSON);
    expect(service.getGroupStartId('group2')).toEqual('node20');
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node19'), 'node20')).toBeTruthy();
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node20'), 'node21')).toBeTruthy();
    service.deleteNode('node20');
    expect(service.getGroupStartId('group2')).toEqual('node21');
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('node19'), 'node21')).toBeTruthy();
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
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group3')).toBeTruthy();
    expect(service.getNodes().length).toEqual(54);
    service.deleteNode('group3');
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group3')).toBeFalsy();
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('group2'), 'group4')).toBeTruthy();
    expect(service.getNodes().length).toEqual(51);
  });
}

function shouldDeleteTheLastActivityFromTheProject() {
  it('should delete the last activity from the project', () => {
    service.setProject(demoProjectJSON);
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('group4'), 'group5')).toBeTruthy();
    expect(service.getTransitionsByFromNodeId('group4').length).toEqual(1);
    expect(service.getNodes().length).toEqual(54);
    service.deleteNode('group5');
    expect(service.nodeHasTransitionToNodeId(service.getNodeById('group4'), 'group5')).toBeFalsy();
    expect(service.getTransitionsByFromNodeId('group4').length).toEqual(0);
    expect(service.getNodes().length).toEqual(48);
  });
}

function insertNodeAfterInTransitions() {
  it('should be able to insert a step node after another step node', () => {
    expectInsertNodeAfterInTransition('node1', 'node2');
  });
  it('should be able to insert an activity node after another activity node', () => {
    expectInsertNodeAfterInTransition('group1', 'group2');
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
      const authors = [{ id: 1, firstName: 'a', lastName: 'a' }];
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

function addCurrentUserToAuthors_CM_shouldAddUserInfo() {
  it('should add current user to authors in CM mode', () => {
    spyOn(configService, 'getMyUserInfo').and.returnValue({
      userIds: [1],
      firstName: 'wise',
      lastName: 'panda',
      username: 'wisepanda'
    });
    spyOn(configService, 'isClassroomMonitor').and.returnValue(true);
    const authors = service.addCurrentUserToAuthors([]);
    expect(authors.length).toEqual(1);
    expect(authors[0].id).toEqual(1);
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

function shouldHandleSaveProjectResponse() {
  it('should broadcast project saved', () => {
    shouldHandleSaveProjectResponseSuccessHelper('broadcastProjectSaved');
  });
  it('should broadcast not logged in project not saved', () => {
    shouldHandleSaveProjectResponseErrorHelper(
      'notSignedIn',
      'broadcastNotLoggedInProjectNotSaved'
    );
  });
  it('should broadcast not allowed to edit this project', () => {
    shouldHandleSaveProjectResponseErrorHelper(
      'notAllowedToEditThisProject',
      'broadcastNotAllowedToEditThisProject'
    );
  });
  it('should broadcast error saving project', () => {
    shouldHandleSaveProjectResponseErrorHelper('errorSavingProject', 'broadcastErrorSavingProject');
  });
}

function shouldHandleSaveProjectResponseSuccessHelper(functionName: any) {
  shouldHandleSaveProjectResponseHelper('success', '', functionName);
}

function shouldHandleSaveProjectResponseErrorHelper(messageCode: string, functionName: any) {
  shouldHandleSaveProjectResponseHelper('error', messageCode, functionName);
}

function shouldHandleSaveProjectResponseHelper(
  status: string,
  messageCode: string,
  functionName: any
) {
  const response = {
    status: status,
    messageCode: messageCode
  };
  spyOn(service, functionName).and.callFake(() => {});
  service.handleSaveProjectResponse(response);
  expect(service[functionName]).toHaveBeenCalled();
}

function shouldNotSaveProjectWhenTheUserDoesNotHavePermissionToEditTheProject() {
  it('should not save project when the user does not have permission to edit the project', () => {
    service.setProject(scootersProjectJSON);
    spyOn(configService, 'getConfigParam').withArgs('canEditProject').and.returnValue(false);
    expect(service.saveProject()).toEqual(null);
  });
}

function shouldSaveProject() {
  it('should save project', () => {
    spyOn(configService, 'getConfigParam')
      .withArgs('canEditProject')
      .and.returnValue(true)
      .withArgs('saveProjectURL')
      .and.returnValue(saveProjectURL)
      .withArgs('mode')
      .and.returnValue('authoring')
      .withArgs('userInfo')
      .and.returnValue({});
    spyOn(configService, 'getProjectId').and.returnValue(projectIdDefault);
    spyOn(configService, 'getMyUserInfo').and.returnValue({ id: 1 });
    service.setProject(scootersProjectJSON);
    service.saveProject();
    expect(configService.getConfigParam).toHaveBeenCalledWith('saveProjectURL');
    http.expectOne(saveProjectURL);
  });
}
