import vleModule from '../../classroomMonitor/classroomMonitor';

describe('ClassroomMonitorProjectService Unit Test', () => {

  beforeEach(angular.mock.module(vleModule.name));

  let ConfigService, ProjectService, $rootScope, $httpBackend, demoProjectJSON, scootersProjectJSON;
  beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
  }));

  describe('ClassroomMonitorProjectService', () => {

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
      ProjectService.setProject(project);
      let nodeIdAndComponentIds = ProjectService.getNodeIdsAndComponentIds('node1');
      expect(nodeIdAndComponentIds.length).toEqual(1);
      expect(nodeIdAndComponentIds[0].nodeId).toEqual('node1');
      expect(nodeIdAndComponentIds[0].componentId).toEqual('node1component1');
      nodeIdAndComponentIds = ProjectService.getNodeIdsAndComponentIds('node2');
      expect(nodeIdAndComponentIds.length).toEqual(2);
      expect(nodeIdAndComponentIds[0].nodeId).toEqual('node2');
      expect(nodeIdAndComponentIds[0].componentId).toEqual('node2component1');
      expect(nodeIdAndComponentIds[1].nodeId).toEqual('node2');
      expect(nodeIdAndComponentIds[1].componentId).toEqual('node2component2');
    });

    it('should get the branch letter', () => {
      const project = {
        "startGroupId": "group0",
        "startNodeId": "node1",
        "nodes": [
          {
            "id": "group0",
            "type": "group",
            "title": "Master",
            "startId": "group1",
            "ids": [
                "group1"
            ],
            "transitionLogic": {
                "transitions": []
            }
          },
          {
              "id": "group1",
              "type": "group",
              "title": "First Activity",
              "startId": "node1",
              "ids": [
                  "node1",
                  "node2",
                  "node3",
                  "node4",
                  "node5",
                  "node6"
              ],
              "icons": {
                  "default": {
                      "color": "#2196F3",
                      "type": "font",
                      "fontSet": "material-icons",
                      "fontName": "info"
                  }
              },
              "transitionLogic": {
                  "transitions": []
              }
          },
          {
            "id": "node1",
            "title": "Start",
            "type": "node",
            "constraints": [],
            "transitionLogic": {
              "transitions": [{
                  "to": "node2"
                },
                {
                  "to": "node4"
                }
              ],
              "howToChooseAmongAvailablePaths": "workgroupId",
              "whenToChoosePath": "enterNode",
              "canChangePath": false,
              "maxPathsVisitable": 1
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          },
          {
            "id": "node2",
            "title": "Step 1",
            "type": "node",
            "constraints": [{
                "id": "node2Constraint1",
                "action": "makeThisNodeNotVisible",
                "targetId": "node2",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node2"
                  }
                }]
              },
              {
                "id": "node2Constraint2",
                "action": "makeThisNodeNotVisitable",
                "targetId": "node2",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node2"
                  }
                }]
              }
            ],
            "transitionLogic": {
              "transitions": [{
                "to": "node3"
              }]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          },
          {
            "id": "node3",
            "title": "Step 2",
            "type": "node",
            "constraints": [{
                "id": "node3Constraint1",
                "action": "makeThisNodeNotVisible",
                "targetId": "node3",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node2"
                  }
                }]
              },
              {
                "id": "node3Constraint2",
                "action": "makeThisNodeNotVisitable",
                "targetId": "node3",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node2"
                  }
                }]
              }
            ],
            "transitionLogic": {
              "transitions": [{
                "to": "node6"
              }]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          },
          {
            "id": "node4",
            "title": "Step 3",
            "type": "node",
            "constraints": [{
                "id": "node4Constraint1",
                "action": "makeThisNodeNotVisible",
                "targetId": "node4",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node4"
                  }
                }]
              },
              {
                "id": "node4Constraint2",
                "action": "makeThisNodeNotVisitable",
                "targetId": "node4",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node4"
                  }
                }]
              }
            ],
            "transitionLogic": {
              "transitions": [{
                "to": "node5"
              }]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          },
          {
            "id": "node5",
            "title": "Step 4",
            "type": "node",
            "constraints": [{
                "id": "node5Constraint1",
                "action": "makeThisNodeNotVisible",
                "targetId": "node5",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node4"
                  }
                }]
              },
              {
                "id": "node5Constraint2",
                "action": "makeThisNodeNotVisitable",
                "targetId": "node5",
                "removalConditional": "all",
                "removalCriteria": [{
                  "name": "branchPathTaken",
                  "params": {
                    "fromNodeId": "node1",
                    "toNodeId": "node4"
                  }
                }]
              }
            ],
            "transitionLogic": {
              "transitions": [{
                "to": "node6"
              }]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          },
          {
            "id": "node6",
            "title": "End",
            "type": "node",
            "constraints": [],
            "transitionLogic": {
              "transitions": []
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
          }
        ]
      };
      ProjectService.setProject(project);
      let branchLetter = ProjectService.getBranchLetter('node1');
      expect(branchLetter).toEqual(null);
      branchLetter = ProjectService.getBranchLetter('node2');
      expect(branchLetter).toEqual('A');
      branchLetter = ProjectService.getBranchLetter('node3');
      expect(branchLetter).toEqual('A');
      branchLetter = ProjectService.getBranchLetter('node4');
      expect(branchLetter).toEqual('B');
      branchLetter = ProjectService.getBranchLetter('node5');
      expect(branchLetter).toEqual('B');
      branchLetter = ProjectService.getBranchLetter('node6');
      expect(branchLetter).toEqual(null);
    });

  });
});
