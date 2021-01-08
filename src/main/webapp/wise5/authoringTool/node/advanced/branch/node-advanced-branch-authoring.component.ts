import { ConfigService } from '../../../../services/configService';
import { TagService } from '../../../../services/tagService';
import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { UtilService } from '../../../../services/utilService';

class NodeAdvancedBranchAuthoringController {
  branchCriteria: any;
  createBranchBranches = [];
  createBranchComponentId: string;
  createBranchMergePointNodeId: string;
  createBranchNodeId: string;
  createBranchNumberOfBranches: any;
  createBranchCriterion: any;
  items: any[];
  node: any;
  nodeId: string;
  $translate: any;

  static $inject = [
    '$filter',
    'ConfigService',
    'TagService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    private $filter: any,
    private ConfigService: ConfigService,
    private TagService: TagService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
    this.branchCriteria = [
      {
        value: 'workgroupId',
        text: this.$translate('WORKGROUP_ID')
      },
      {
        value: 'score',
        text: this.$translate('SCORE')
      },
      {
        value: 'choiceChosen',
        text: this.$translate('choiceChosen')
      },
      {
        value: 'random',
        text: this.$translate('random')
      },
      {
        value: 'tag',
        text: this.$translate('tag')
      }
    ];
  }

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.items = this.ProjectService.idToOrder;
    this.populateBranchAuthoring();
  }

  populateBranchAuthoring() {
    if (this.node.transitionLogic != null) {
      this.createBranchBranches = [];
      if (this.node.transitionLogic.transitions != null) {
        this.createBranchNumberOfBranches = this.node.transitionLogic.transitions.length;
      } else {
        this.createBranchNumberOfBranches = 0;
      }
      for (let t = 0; t < this.node.transitionLogic.transitions.length; t++) {
        const transition = this.node.transitionLogic.transitions[t];
        const branch: any = {
          number: t + 1,
          items: this.getBranchItems(),
          checkedItemsInBranchPath: [],
          transition: transition
        };
        this.createBranchBranches.push(branch);
        const criteria = transition.criteria;
        if (criteria != null) {
          for (let criterion of transition.criteria) {
            let name = criterion.name;
            let params = criterion.params;
            if (params != null) {
              this.createBranchNodeId = params.nodeId;
              this.createBranchComponentId = params.componentId;
            }
            if (name === 'score') {
              this.createBranchCriterion = 'score';
              if (params != null && params.scores != null) {
                branch.scores = params.scores;
              }
            } else if (name === 'choiceChosen') {
              this.createBranchCriterion = 'choiceChosen';
              if (params != null && params.choiceIds != null && params.choiceIds.length > 0) {
                branch.choiceId = params.choiceIds[0];
              }

              if (this.createBranchNodeId && this.createBranchComponentId) {
                const choices = this.ProjectService.getChoicesByNodeIdAndComponentId(
                  this.createBranchNodeId,
                  this.createBranchComponentId
                );
                if (choices != null) {
                  branch.choices = this.UtilService.makeCopyOfJSONObject(choices);
                }
              }
            }
          }
        }

        const nodeIdsInBranch = this.ProjectService.getNodeIdsInBranch(this.nodeId, transition.to);
        for (const nodeId of nodeIdsInBranch) {
          const item = branch.items[nodeId];
          if (item != null) {
            item.checked = true;
            branch.checkedItemsInBranchPath.push(item);
          }
        }

        branch.nodeIdsInBranch = nodeIdsInBranch;
        if (nodeIdsInBranch.length > 0) {
          const lastNodeIdInBranch = nodeIdsInBranch[nodeIdsInBranch.length - 1];
          const transitionsFromLastNode = this.ProjectService.getTransitionsByFromNodeId(
            lastNodeIdInBranch
          );
          if (transitionsFromLastNode != null && transitionsFromLastNode.length > 0) {
            const transition = transitionsFromLastNode[0];
            this.createBranchMergePointNodeId = transition.to;
          }
        }
      }

      if (this.createBranchCriterion == null) {
        if (this.node.transitionLogic.howToChooseAmongAvailablePaths === 'workgroupId') {
          this.createBranchCriterion = 'workgroupId';
        } else if (this.node.transitionLogic.howToChooseAmongAvailablePaths === 'random') {
          this.createBranchCriterion = 'random';
        }
      }
    }
  }

  createBranchNumberOfBranchesChanged() {
    if (this.createBranchNumberOfBranches === 0) {
      alert(this.$translate('errorYouCantHave0BranchPaths'));
      this.createBranchNumberOfBranches = this.createBranchBranches.length;
    } else if (this.createBranchNumberOfBranches < this.createBranchBranches.length) {
      const answer = confirm(
        this.$translate('areYouSureYouWantToReduceTheNumberOfBranchesToX', {
          createBranchNumberOfBranches: this.createBranchNumberOfBranches
        })
      );
      if (answer) {
        if (this.createBranchNumberOfBranches === 1) {
          // the author has removed all the branch paths so we will remove the branch
          this.removeBranch();
        } else {
          // the author is reducing the number of branch paths but not removing all of them
          for (let bp = 0; bp < this.createBranchBranches.length; bp++) {
            if (bp >= this.createBranchNumberOfBranches) {
              const branch = this.createBranchBranches[bp];
              this.removeBranchPath(branch);
              // decrement the counter back one because we have just removed a branch path
              bp--;
            }
          }
        }
      } else {
        this.createBranchNumberOfBranches = this.createBranchBranches.length;
      }
    } else if (this.createBranchNumberOfBranches > this.createBranchBranches.length) {
      if (this.createBranchCriterion == null) {
        /*
         * we will default the branching to be based on workgroup id
         * since that is what our researchers use most often
         */
        this.createBranchCriterion = 'workgroupId';
        this.createBranchCriterionChanged();
      }

      for (let b = 0; b < this.createBranchNumberOfBranches; b++) {
        if (b >= this.createBranchBranches.length) {
          // we do not have a branch object for this branch number so we will create it
          const branch: any = {
            number: b + 1
          };

          /*
           * set the mapping of all the ids to order for use when choosing which items are
           * in the branch path
           */
          branch.items = this.getBranchItems();
          this.createBranchBranches.push(branch);
          const transition: any = {};
          if (this.createBranchCriterion === 'score') {
            const criterion: any = {
              name: this.createBranchCriterion,
              params: {
                scores: []
              }
            };
            if (this.createBranchNodeId != null) {
              criterion.params.nodeId = this.createBranchNodeId;
            }
            if (this.createBranchComponentId != null) {
              criterion.params.componentId = this.createBranchComponentId;
            }
            transition.criteria = [criterion];
          } else if (this.createBranchCriterion === 'choiceChosen') {
            const criterion: any = {
              name: this.createBranchCriterion,
              params: {
                choiceIds: []
              }
            };

            if (this.createBranchNodeId != null) {
              criterion.params.nodeId = this.createBranchNodeId;
            }

            if (this.createBranchComponentId != null) {
              criterion.params.componentId = this.createBranchComponentId;
            }
            transition.criteria = [criterion];
          } else if (this.createBranchCriterion === 'workgroupId') {
            // workgroup id branching does not require a transition criterion
          } else if (this.createBranchCriterion === 'random') {
            // random branching does not require a transition criterion
          }
          this.node.transitionLogic.transitions.push(transition);
          branch.transition = transition;
        }
      }
    }
    this.saveProject();
  }

  createBranchCriterionChanged() {
    if (this.createBranchCriterion != null) {
      let nodeId = this.node.id;
      if (this.createBranchCriterion === 'workgroupId') {
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'howToChooseAmongAvailablePaths',
          'workgroupId'
        );
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'enterNode');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion === 'score') {
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'howToChooseAmongAvailablePaths',
          'random'
        );
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'whenToChoosePath',
          'studentDataChanged'
        );
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion === 'choiceChosen') {
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'howToChooseAmongAvailablePaths',
          'random'
        );
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'whenToChoosePath',
          'studentDataChanged'
        );
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion === 'random') {
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'howToChooseAmongAvailablePaths',
          'random'
        );
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'enterNode');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion === 'tag') {
        this.ProjectService.setTransitionLogicField(
          nodeId,
          'howToChooseAmongAvailablePaths',
          'tag'
        );
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'enterNode');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      }
    }
    this.createBranchUpdateTransitions();
    this.saveProject();
  }

  createBranchNodeIdChanged() {
    this.createBranchComponentId = null;
    let selectedNode = this.ProjectService.getNodeById(this.createBranchNodeId);
    if (selectedNode != null) {
      let components = selectedNode.components;
      if (components != null) {
        if (components.length == 1) {
          this.createBranchComponentId = components[0].id;
        }
      }
    }
    this.createBranchUpdateTransitions();
    this.saveProject();
  }

  createBranchComponentIdChanged() {
    this.createBranchUpdateTransitions();
    this.saveProject();
  }

  async createBranchUpdateTransitions() {
    for (let b = 0; b < this.createBranchBranches.length; b++) {
      let branch = this.createBranchBranches[b];
      if (branch != null) {
        let transition = branch.transition;
        if (transition != null) {
          if (this.createBranchCriterion === 'choiceChosen') {
            transition.criteria = [];
            const criterion = {
              name: 'choiceChosen',
              params: {
                nodeId: this.createBranchNodeId,
                componentId: this.createBranchComponentId,
                choiceIds: []
              }
            };
            transition.criteria.push(criterion);
            branch.choiceId = null;
            branch.scores = null;
          } else if (this.createBranchCriterion === 'score') {
            transition.criteria = [];
            const criterion = {
              name: 'score',
              params: {
                nodeId: this.createBranchNodeId,
                componentId: this.createBranchComponentId,
                scores: []
              }
            };
            transition.criteria.push(criterion);
            branch.choiceId = null;
            branch.scores = criterion.params.scores;
          } else if (this.createBranchCriterion === 'workgroupId') {
            /*
             * remove the criteria array since it is not used for
             * branching based on workgroup id
             */
            delete transition['criteria'];
            this.createBranchNodeId = null;
            this.createBranchComponentId = null;

            /*
             * clear the choice id and scores fields since we don't
             * need them in workgroup id branching
             */
            branch.choiceId = null;
            branch.scores = null;
          } else if (this.createBranchCriterion == 'random') {
            /*
             * remove the criteria array since it is not used for
             * branching based on random assignment
             */
            delete transition['criteria'];
            this.createBranchNodeId = null;
            this.createBranchComponentId = null;

            // clear the choice id and scores fields since we don't need them in random branching
            branch.choiceId = null;
            branch.scores = null;
          } else if (this.createBranchCriterion === 'tag') {
            const runId = this.ConfigService.getRunId();
            if (runId != null) {
              await this.TagService.retrieveRunTags().subscribe(() => {});
            }
            transition.criteria = [];
            const criterion = {
              name: 'hasTag',
              params: {
                tag: this.TagService.getNextAvailableTag()
              }
            };
            transition.criteria.push(criterion);
          }
        }
      }
    }

    if (this.createBranchCriterion === 'choiceChosen') {
      this.createBranchUpdateChoiceChosenIds();
    }
  }

  createBranchUpdateChoiceChosenIds() {
    const component = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.createBranchNodeId,
      this.createBranchComponentId
    );
    if (component != null) {
      if (component.type === 'MultipleChoice') {
        this.createBranchUpdateChoiceChosenIdsHelper(component);
      }
    }
  }

  /**
   * We are creating a branch that is based on which choice the student chooses
   * in a multiple choice component. We will populate the drop down with the
   * choices.
   * @param component we are branching based on the choice chosen in this
   * component
   */
  createBranchUpdateChoiceChosenIdsHelper(component) {
    const choices = component.choices;
    if (choices != null) {
      for (let c = 0; c < choices.length; c++) {
        const branch = this.createBranchBranches[c];
        if (branch != null) {
          const id = choices[c].id;
          branch.choiceId = id;
          branch.choices = this.UtilService.makeCopyOfJSONObject(choices);
          const transition = branch.transition;
          if (transition != null) {
            // get the first transition criterion. Assume there is only one transition criterion
            const criterion = transition.criteria[0];
            if (criterion != null) {
              const params = criterion.params;
              if (params != null) {
                params.nodeId = this.createBranchNodeId;
                params.componentId = this.createBranchComponentId;
                if (this.createBranchCriterion === 'choiceChosen') {
                  params.choiceIds = [];
                  params.choiceIds.push(id);
                }
              }
            }
          }
        }
      }
    }
  }

  createBranchStepClicked(branch, item) {
    let orderedItems = this.$filter('orderBy')(this.$filter('toArray')(branch.items), 'order');
    branch.checkedItemsInBranchPath = [];
    let checkedItemsInBranchPath = branch.checkedItemsInBranchPath;
    branch.nodeIdsInBranch = [];
    let previousCheckedNodeId = null;
    let nodeIdAfter = null;

    /*
     * loop through all the items in order and set the transitions so that
     * the steps in a branch path transition to one after the other
     */
    for (var i = 0; i < orderedItems.length; i++) {
      const orderedItem = orderedItems[i];
      if (orderedItem != null && orderedItem.checked) {
        if (previousCheckedNodeId != null) {
          const previousCheckedNode = this.ProjectService.getNodeById(previousCheckedNodeId);
          if (previousCheckedNode != null) {
            const transitionLogic = previousCheckedNode.transitionLogic;
            if (transitionLogic != null) {
              if (transitionLogic.transitions != null) {
                transitionLogic.transitions = [];
                const transition = {
                  to: orderedItem.$key
                };
                transitionLogic.transitions.push(transition);
              }
            }
          }
        }
        checkedItemsInBranchPath.push(orderedItem);
        branch.nodeIdsInBranch.push(orderedItem.$key);
        previousCheckedNodeId = orderedItem.$key;
      }
      let previousOrderedItem = orderedItems[i - 1];
      if (previousOrderedItem != null) {
        if (previousOrderedItem.$key == item.$key) {
          /*
           * the previous item was the node that was checked/unchecked
           * so we will remember this item because it is the node
           * that comes after the node that was checked/unchecked
           */
          nodeIdAfter = orderedItem.$key;
        }
      }
    }

    if (this.createBranchMergePointNodeId != null) {
      /*
       * the merge point is specified so we will make the last checked
       * node in this branch path point to the merge point
       */

      // this is the last node in the branch path so we will make it transition to the merge point
      let node = this.ProjectService.getNodeById(previousCheckedNodeId);
      if (node != null) {
        let transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          if (transitionLogic.transitions != null) {
            transitionLogic.transitions = [];
            const transition = {
              to: this.createBranchMergePointNodeId
            };
            transitionLogic.transitions.push(transition);
          }
        }
      }
    }

    let branchNumber = branch.number;
    let nodeId = item.$key;
    let transition = this.node.transitionLogic.transitions[branchNumber - 1];
    let firstNodeId = null;

    // update the branch point transition in case the first step in the branch path has changed
    if (transition != null) {
      if (checkedItemsInBranchPath.length === 0) {
        transition.to = null;
      } else {
        let firstCheckedItem = checkedItemsInBranchPath[0];
        if (firstCheckedItem != null) {
          firstNodeId = firstCheckedItem.$key;
          transition.to = firstNodeId;
        }
      }
    }

    let node = this.ProjectService.getNodeById(nodeId);
    if (node != null) {
      this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);
      if (item.checked) {
        let fromNodeId = this.nodeId;
        let toNodeId = firstNodeId;
        this.ProjectService.addBranchPathTakenConstraints(nodeId, fromNodeId, toNodeId);
      } else {
        this.ProjectService.setTransition(nodeId, nodeIdAfter);
      }
    }

    // update the constraints of other steps in the branch path if necessary.
    for (const item of checkedItemsInBranchPath) {
      const itemNodeId = item.$key;
      this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(itemNodeId);

      // the branch path taken constraints will be from this node to the first node in the branch path
      const fromNodeId = this.nodeId;
      const toNodeId = firstNodeId;
      this.ProjectService.addBranchPathTakenConstraints(itemNodeId, fromNodeId, toNodeId);
    }
    this.ProjectService.calculateNodeNumbers();
    this.saveProject();
  }

  createBranchScoreChanged(branch) {
    let transition = branch.transition;
    if (transition != null) {
      let scores = branch.scores;
      if (scores != null) {
        let criteria = transition.criteria;
        if (criteria != null) {
          let criterion = criteria[0];
          if (criterion != null) {
            let params = criterion.params;
            if (params != null) {
              params.scores = scores;
            }
          }
        }
      }
    }
    this.saveProject();
  }

  createBranchMergePointNodeIdChanged() {
    let createBranchMergePointNodeId = this.createBranchMergePointNodeId;
    let branches = this.createBranchBranches;
    for (let branch of branches) {
      if (branch != null) {
        let nodeIdsInBranch = branch.nodeIdsInBranch;
        if (nodeIdsInBranch != null && nodeIdsInBranch.length > 0) {
          let lastNodeIdInBranchPath = nodeIdsInBranch[nodeIdsInBranch.length - 1];
          if (lastNodeIdInBranchPath != null) {
            let lastNodeInBranchPath = this.ProjectService.getNodeById(lastNodeIdInBranchPath);
            if (lastNodeInBranchPath != null) {
              let transitionLogic = lastNodeInBranchPath.transitionLogic;
              if (transitionLogic != null) {
                if (transitionLogic.transitions != null) {
                  transitionLogic.transitions = [];
                  let transition = {
                    to: createBranchMergePointNodeId
                  };
                  transitionLogic.transitions.push(transition);
                }
              }
            }
          }
        }
      }
    }
    this.ProjectService.calculateNodeNumbers();
    const parseProject = true;
    this.saveProject(parseProject);
  }

  removeBranchButtonClicked() {
    if (confirm(this.$translate('areYouSureYouWantToRemoveTheBranch'))) {
      this.removeBranch();
    }
  }

  removeBranch() {
    for (let bp = 0; bp < this.createBranchBranches.length; bp++) {
      const branchPath = this.createBranchBranches[bp];
      this.removeBranchPath(branchPath);
      bp--; // shift the counter back one because we have just removed a branch path
    }

    const nodeId = this.node.id; // branch point node
    const nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);

    /*
     * update the transition of this step to point to the next step
     * in the project. this may be different than the next step
     * if it was still the branch point.
     */
    this.ProjectService.setTransition(nodeId, nodeIdAfter);

    this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', null);

    this.createBranchNumberOfBranches = 1;
    this.createBranchCriterion = null;
    this.createBranchNodeId = null;
    this.createBranchComponentId = null;
    this.createBranchMergePointNodeId = null;

    /*
     * branch paths are determined by the transitions. since there is now
     * just one transition, we will create a single branch object to
     * represent it.
     */

    // create a branch object to hold all the related information for that branch
    const branch: any = {
      number: 1
    };

    /*
     * set the mapping of all the ids to order for use when choosing which items are
     * in the branch path
     */
    branch.items = this.getBranchItems();
    branch.checkedItemsInBranchPath = [];
    let transition = null;
    const transitions = this.ProjectService.getTransitionsByFromNodeId(nodeId);
    if (transitions != null && transitions.length > 0) {
      transition = transitions[0];
    }
    branch.transition = transition;
    this.createBranchBranches.push(branch);
    this.ProjectService.calculateNodeNumbers();
    const parseProject = true;
    this.saveProject(parseProject);
  }

  /**
   * Remove a branch path by removing all the branch path taken constraints
   * from the steps in the branch path, resetting the transitions in the
   * steps in the branch path, and removing the transition corresponding to
   * the branch path in this branch point node.
   * @param branch the branch object
   */
  removeBranchPath(branch) {
    const checkedItemsInBranchPath = branch.checkedItemsInBranchPath;
    if (checkedItemsInBranchPath != null) {
      for (const checkedItem of checkedItemsInBranchPath) {
        const nodeId = checkedItem.$key;
        this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);
        /*
         * update the transition of the step to point to the next step
         * in the project. this may be different than the next step
         * if it was still in the branch path.
         */
        const nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);
        this.ProjectService.setTransition(nodeId, nodeIdAfter);
      }
    }
    const branchPathIndex = this.createBranchBranches.indexOf(branch);
    this.createBranchBranches.splice(branchPathIndex, 1);
    this.node.transitionLogic.transitions.splice(branchPathIndex, 1);
  }

  getBranchItems() {
    const items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);
    for (const nodeId of Object.keys(items)) {
      items[nodeId]['$key'] = nodeId;
    }
    return items;
  }

  saveProject(parseProject = false) {
    if (parseProject) {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }
    return this.ProjectService.saveProject();
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }
}

export const NodeAdvancedBranchAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/branch/node-advanced-branch-authoring.component.html`,
  controller: NodeAdvancedBranchAuthoringController
};
