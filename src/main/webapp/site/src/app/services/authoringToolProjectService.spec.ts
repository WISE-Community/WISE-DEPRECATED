import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AuthoringToolProjectService } from '../../../../wise5/authoringTool/authoringToolProjectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import demoProjectJSON_import from './sampleData/curriculum/Demo.project.json';
import scootersProjectJSON_import from './sampleData/curriculum/SelfPropelledVehiclesChallenge.project.json';
let service: AuthoringToolProjectService;
let configService: ConfigService;
let utilService: UtilService;
let http: HttpTestingController;
let demoProjectJSON: any;
let scootersProjectJSON: any;

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

describe('AuthoringToolProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ AuthoringToolProjectService, ConfigService, UtilService ]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(AuthoringToolProjectService);
    configService = TestBed.get(ConfigService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope');
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSON_import));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSON_import));
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
});

function createConfigServiceGetConfigParamSpy() {
  spyOn(configService, 'getConfigParam').and.callFake(param => {
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
      const newProjectIdActual = service.registerNewProject(scootersProjectName,
          scootersProjectJSONString);
      http.expectOne(registerNewProjectURL).flush(newProjectIdExpected);
      newProjectIdActual.then(result => {
        expect(result).toEqual(newProjectIdExpected);
      });
    });
  });
}

function isNodeIdUsed() {
  describe('isNodeIdUsed', () => {
    it('should find used node id in active nodes', () => {
      service.setProject(demoProjectJSON);
      expect(service.isNodeIdUsed('node1')).toEqual(true);
    });

    it('should find used node id in inactive nodes', () => {
      service.setProject(demoProjectJSON);
      expect(service.isNodeIdUsed('node789')).toEqual(true);
    });

    it('should not find used node id in active or inactive nodes', () => {
      service.setProject(demoProjectJSON);
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
      expect(
        service.getComponentByNodeIdAndComponentId('node1', 'zh4h1urdys')
      ).not.toBeNull();
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
      result.then(projects => {
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
