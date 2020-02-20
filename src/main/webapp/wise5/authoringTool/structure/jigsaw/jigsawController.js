'use strict';

import ConfigureStructureController from '../configureStructureController';

class JigsawController extends ConfigureStructureController {
  constructor($filter, $rootScope, $state, $stateParams, $scope, UtilService) {
    super($filter, $rootScope, $state, $stateParams, $scope, UtilService);
    this.numGroups = '2';
  }

  injectGroup(numGroups) {
    if (numGroups === 2) {
      this.injectGroupsWithTwoGroups();
    } else if (numGroups === 3) {
      this.injectGroupsWithThreeGroups();
    } else if (numGroups === 4) {
      this.injectGroupsWithFourGroups();
    }
  }

  injectNodes(numGroups) {
    if (numGroups === 2) {
      this.injectNodesWithTwoGroups();
    } else if (numGroups === 3) {
      this.injectNodesWithThreeGroups();
    } else if (numGroups === 4) {
      this.injectNodesWithFourGroups();
    }
  }

  injectGroupsWithTwoGroups() {
    this.structure.group = {
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

  injectGroupsWithThreeGroups() {
    this.structure.group = {
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

  injectGroupsWithFourGroups() {
    this.structure.group = {
      id: 'group1',
      type: 'group',
      title: 'Jigsaw',
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
    };
  }

  injectNodesWithTwoGroups() {
    this.structure.nodes = [
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

  injectNodesWithThreeGroups() {
    this.structure.nodes = [
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

  injectNodesWithFourGroups() {
    this.structure.nodes = [
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
            },
            {
              to: 'node5'
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
              to: 'node6'
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
              to: 'node6'
            }
          ]
        },
        showSaveButton: false,
        showSubmitButton: false,
        components: []
      },
      {
        id: 'node5',
        title: 'Group 4 Step 1',
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
                  toNodeId: 'node5'
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
                  toNodeId: 'node5'
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

  injectGroupAndNodes(numGroups = 2) {
    this.injectGroup(numGroups);
    this.injectNodes(numGroups);
  }

  chooseLocation() {
    this.injectGroupAndNodes(parseInt(this.numGroups));
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
