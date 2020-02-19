'use strict';

import ConfigureStructureController from '../configureStructureController';

class JigsawController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  injectGroup(structure, numGroups) {
    if (numGroups === 2) {
      this.injectGroupsWithTwoGroups(structure);
    } else if (numGroups === 3) {
      this.injectGroupsWithThreeGroups(structure);
    } else if (numGroups === 4) {
      this.injectGroupsWithFourGroups(structure);
    }
  }

  injectNodes(structure, numGroups) {
    if (numGroups === 2) {
      this.injectNodesWithTwoGroups(structure);
    } else if (numGroups === 3) {
      this.injectNodesWithThreeGroups(structure);
    } else if (numGroups === 4) {
      this.injectNodesWithFourGroups(structure);
    }
  }

  injectGroupsWithTwoGroups(structure) {
    structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Jigsaw Activity',
      startId: 'node1',
      ids: ['node1', 'node2', 'node3', 'node4'],
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
    };
  }

  injectGroupsWithThreeGroups(structure) {
    structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Jigsaw Activity',
      startId: 'node1',
      ids: ['node1', 'node2', 'node3', 'node4', 'node5'],
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
    };
  }

  injectNodesWithTwoGroups(structure) {
    structure.nodes = [
      {
        id: 'node1',
        type: 'node',
        title: 'First Step (everyone)',
        components: [],
        constraints: [],
        showSaveButton: false,
        showSubmitButton: false,
        transitionLogic: {
          transitions: [
            {
              to: 'node2'
            },
            {
              to: 'node3'
            }
          ],
          howToChooseAmongAvailablePaths: 'workgroupId',
          whenToChoosePath: 'enterNode',
          canChangePath: false,
          maxPathsVisitable: 1
        }
      },
      {
        id: 'node2',
        title: 'Group 1 Step 1',
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
              to: 'node4'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node3',
        title: 'Group 2 Step 1',
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
                  toNodeId: 'node3'
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
                  toNodeId: 'node3'
                }
              }
            ]
          }
        ],
        transitionLogic: {
          transitions: [
            {
              to: 'node4'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node4',
        title: 'Synthesis Step (everyone)',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      }
    ];
  }

  injectNodesWithThreeGroups(structure) {
    structure.nodes = [
      {
        id: 'node1',
        type: 'node',
        title: 'First Step (everyone)',
        components: [],
        constraints: [],
        showSaveButton: false,
        showSubmitButton: false,
        transitionLogic: {
          transitions: [
            {
              to: 'node2'
            },
            {
              to: 'node3'
            },
            {
              to: 'node4'
            }
          ],
          howToChooseAmongAvailablePaths: 'workgroupId',
          whenToChoosePath: 'enterNode',
          canChangePath: false,
          maxPathsVisitable: 1
        }
      },
      {
        id: 'node2',
        title: 'Group 1 Step 1',
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
              to: 'node5'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node3',
        title: 'Group 2 Step 1',
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
                  toNodeId: 'node3'
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
                  toNodeId: 'node3'
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
        id: 'node4',
        title: 'Group 3 Step 1',
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
        title: 'Synthesis Step (everyone)',
        type: 'node',
        constraints: [],
        transitionLogic: {
          transitions: []
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      }
    ];
  }

  injectGroupAndNodes(structure, numGroups = 2) {
    this.injectGroup(structure, numGroups);
    this.injectNodes(structure, numGroups);
  }

  chooseLocation() {
    this.injectGroupAndNodes(this.structure, parseInt(this.numGroups));
    this.$state.go('root.project.structure.location', { structure: this.structure });
  }
}

JigsawController.$inject = [
  '$filter',
  '$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  'UtilService'
];

export default JigsawController;
