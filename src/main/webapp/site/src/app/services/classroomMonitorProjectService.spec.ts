import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ClassroomMonitorProjectService } from '../../../../wise5/classroomMonitor/classroomMonitorProjectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
let service: ClassroomMonitorProjectService;
let configService: ConfigService;
let utilService: UtilService;
let http: HttpTestingController;

describe('ClassroomMonitorProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ClassroomMonitorProjectService, ConfigService, UtilService ]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(ClassroomMonitorProjectService);
    configService = TestBed.get(ConfigService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope');
  });
  shouldGetTheNodeIdAndComponentIdObjects();
  shouldGetTheBranchLetter();
});

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
    const project = {
      startGroupId: 'group0',
      startNodeId: 'node1',
      nodes: [
        {
          id: 'group0',
          type: 'group',
          title: 'Master',
          startId: 'group1',
          ids: ['group1'],
          transitionLogic: {
            transitions: []
          }
        },
        {
          id: 'group1',
          type: 'group',
          title: 'First Activity',
          startId: 'node1',
          ids: ['node1', 'node2', 'node3', 'node4', 'node5', 'node6'],
          icons: {
            default: {
              color: '#2196F3',
              type: 'font',
              fontSet: 'material-icons',
              fontName: 'info'
            }
          },
          transitionLogic: {
            transitions: []
          }
        },
        {
          id: 'node1',
          title: 'Start',
          type: 'node',
          constraints: [],
          transitionLogic: {
            transitions: [
              {
                to: 'node2'
              },
              {
                to: 'node4'
              }
            ],
            howToChooseAmongAvailablePaths: 'workgroupId',
            whenToChoosePath: 'enterNode',
            canChangePath: false,
            maxPathsVisitable: 1
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        },
        {
          id: 'node2',
          title: 'Step 1',
          type: 'node',
          constraints: [
            {
              id: 'node2Constraint1',
              action: 'makeThisNodeNotVisible',
              targetId: 'node2',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node2'
                  }
                }
              ]
            },
            {
              id: 'node2Constraint2',
              action: 'makeThisNodeNotVisitable',
              targetId: 'node2',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node2'
                  }
                }
              ]
            }
          ],
          transitionLogic: {
            transitions: [
              {
                to: 'node3'
              }
            ]
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        },
        {
          id: 'node3',
          title: 'Step 2',
          type: 'node',
          constraints: [
            {
              id: 'node3Constraint1',
              action: 'makeThisNodeNotVisible',
              targetId: 'node3',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node2'
                  }
                }
              ]
            },
            {
              id: 'node3Constraint2',
              action: 'makeThisNodeNotVisitable',
              targetId: 'node3',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node2'
                  }
                }
              ]
            }
          ],
          transitionLogic: {
            transitions: [
              {
                to: 'node6'
              }
            ]
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        },
        {
          id: 'node4',
          title: 'Step 3',
          type: 'node',
          constraints: [
            {
              id: 'node4Constraint1',
              action: 'makeThisNodeNotVisible',
              targetId: 'node4',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node4'
                  }
                }
              ]
            },
            {
              id: 'node4Constraint2',
              action: 'makeThisNodeNotVisitable',
              targetId: 'node4',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node4'
                  }
                }
              ]
            }
          ],
          transitionLogic: {
            transitions: [
              {
                to: 'node5'
              }
            ]
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        },
        {
          id: 'node5',
          title: 'Step 4',
          type: 'node',
          constraints: [
            {
              id: 'node5Constraint1',
              action: 'makeThisNodeNotVisible',
              targetId: 'node5',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node4'
                  }
                }
              ]
            },
            {
              id: 'node5Constraint2',
              action: 'makeThisNodeNotVisitable',
              targetId: 'node5',
              removalConditional: 'all',
              removalCriteria: [
                {
                  name: 'branchPathTaken',
                  params: {
                    fromNodeId: 'node1',
                    toNodeId: 'node4'
                  }
                }
              ]
            }
          ],
          transitionLogic: {
            transitions: [
              {
                to: 'node6'
              }
            ]
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        },
        {
          id: 'node6',
          title: 'End',
          type: 'node',
          constraints: [],
          transitionLogic: {
            transitions: []
          },
          showSaveButton: false,
          showSubmitButton: false,
          components: []
        }
      ]
    };
    service.setProject(project);
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
