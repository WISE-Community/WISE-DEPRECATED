import { ConfigService } from "../../../services/configService";
import { NotificationService } from "../../../services/notificationService";
import { TeacherDataService } from "../../../services/teacherDataService";
import * as angular from 'angular';
import { TeacherProjectService } from "../../../services/teacherProjectService";
import { UtilService } from "../../../services/utilService";
import { TagService } from "../../../services/tagService";

class NodeAdvancedAuthoringController {

  $translate: any;
  constraintActions: any[];
  items: any[];
  node: any;
  nodeId: string;
  authoringNodeContentJSONString: string;
  branchCriteria: any;
  createBranchBranches = [];
  createBranchComponentId: string;
  createBranchMergePointNodeId: string;
  createBranchNodeId: string;
  createBranchNumberOfBranches: any;
  createBranchCriterion: any;
  removalConditionals: any[];
  removalCriteria: any;
  showConstraints: boolean = false;
  showCreateBranch: boolean = false;
  showEditTransitions: boolean = false;
  showJSON: boolean = false;
  transitionCriterias: any;

  static $injector = ['$filter', '$state', '$timeout', 'ConfigService', 'NotificationService',
      'ProjectService', 'TagService', 'TeacherDataService', 'UtilService'];

  constructor(private $filter: any, private $state: any, private $timeout: any,
      private ConfigService: ConfigService,
      private NotificationService: NotificationService,
      private ProjectService: TeacherProjectService,
      private TagService: TagService,
      private TeacherDataService: TeacherDataService,
      private UtilService: UtilService) {
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
    this.constraintActions = [
      {
        value: '',
        text: this.$translate('pleaseChooseAnAction')
      },
      {
        value: 'makeAllNodesAfterThisNotVisitable',
        text: this.$translate('makeAllNodesAfterThisNotVisitable')
      },
      {
        value: 'makeAllNodesAfterThisNotVisible',
        text: this.$translate('makeAllNodesAfterThisNotVisible')
      },
      {
        value: 'makeAllOtherNodesNotVisitable',
        text: this.$translate('makeAllOtherNodesNotVisitable')
      },
      {
        value: 'makeAllOtherNodesNotVisible',
        text: this.$translate('makeAllOtherNodesNotVisible')
      },
      {
        value: 'makeThisNodeNotVisitable',
        text: this.$translate('makeThisNodeNotVisitable')
      },
      {
        value: 'makeThisNodeNotVisible',
        text: this.$translate('makeThisNodeNotVisible')
      }
    ];
    this.removalConditionals = [
      {
        value: 'all',
        text: this.$translate('all')
      },
      {
        value: 'any',
        text: this.$translate('any')
      }
    ];
    this.removalCriteria = [
      {
        value: '',
        text: this.$translate('pleaseChooseARemovalCriteria')
      },
      {
        value: 'isCompleted',
        text: this.$translate('isCompleted'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          }
        ]
      },
      {
        value: 'score',
        text: this.$translate('SCORE'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'component',
            text: this.$translate('component')
          },
          {
            value: 'scores',
            text: this.$translate('scoresParens')
          }
        ]
      },
      {
        value: 'branchPathTaken',
        text: this.$translate('branchPathTaken'),
        params: [
          {
            value: 'fromNodeId',
            text: this.$translate('fromStep')
          },
          {
            value: 'toNodeId',
            text: this.$translate('toStep')
          }
        ]
      },
      {
        value: 'choiceChosen',
        text: this.$translate('choiceChosen'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'componentId',
            text: this.$translate('component')
          },
          {
            value: 'choiceIds',
            text: this.$translate('choices')
          }
        ]
      },
      {
        value: 'isCorrect',
        text: this.$translate('IS_CORRECT'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'componentId',
            text: this.$translate('component')
          }
        ]
      },
      {
        value: 'usedXSubmits',
        text: this.$translate('usedXSubmits'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'componentId',
            text: this.$translate('component')
          },
          {
            value: 'requiredSubmitCount',
            text: this.$translate('requiredSubmitCount')
          }
        ]
      },
      {
        value: 'isVisible',
        text: this.$translate('isVisible'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          }
        ]
      },
      {
        value: 'isVisitable',
        text: this.$translate('isVisitable'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          }
        ]
      },
      {
        value: 'isVisited',
        text: this.$translate('isVisited'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          }
        ]
      },
      {
        value: 'wroteXNumberOfWords',
        text: this.$translate('wroteXNumberOfWords'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'componentId',
            text: this.$translate('component')
          },
          {
            value: 'requiredNumberOfWords',
            text: this.$translate('requiredNumberOfWords')
          }
        ]
      },
      {
        value: 'addXNumberOfNotesOnThisStep',
        text: this.$translate('addXNumberOfNotesOnThisStep'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'requiredNumberOfNotes',
            text: this.$translate('requiredNumberOfNotes')
          }
        ]
      },
      {
        value: 'fillXNumberOfRows',
        text: this.$translate('fillXNumberOfRows'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('step')
          },
          {
            value: 'componentId',
            text: this.$translate('component')
          },
          {
            value: 'requiredNumberOfFilledRows',
            defaultValue: null,
            text: this.$translate('requiredNumberOfFilledRowsNotIncludingHeaderRow')
          },
          {
            value: 'tableHasHeaderRow',
            defaultValue: true,
            text: this.$translate('tableHasHeaderRow')
          },
          {
            value: 'requireAllCellsInARowToBeFilled',
            defaultValue: true,
            text: this.$translate('requireAllCellsInARowToBeFilled')
          }
        ]
      },
      {
        value: 'teacherRemoval',
        text: this.$translate('teacherRemoval'),
        params: [
        ]
      }
    ];
    this.transitionCriterias = [
      {
        value: 'score',
        text: this.$translate('getASpecificScoreOnAComponent'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('nodeID')
          },
          {
            value: 'componentId',
            text: this.$translate('componentID')
          },
          {
            value: 'scores',
            text: this.$translate('scoresParens')
          }
        ]
      },
      {
        value: 'choiceChosen',
        text: this.$translate('chooseASpecificChoiceOnAComponent'),
        params: [
          {
            value: 'nodeId',
            text: this.$translate('nodeID')
          },
          {
            value: 'componentId',
            text: this.$translate('componentID')
          },
          {
            value: 'choiceIds',
            text: this.$translate('choices')
          }
        ]
      },
      {
        value: 'tag',
        text: this.$translate('tagAssignedToWorkgroup'),
        params: [
          {
            value: 'tag',
            text: this.$translate('tag')
          }
        ]
      }
    ];
  }

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.items = this.ProjectService.idToOrder;
    this.populateBranchAuthoring()

    if (this.$state.current.name === 'root.at.project.nodeEditPaths') {
      this.$timeout(() => {
        this.showEditTransitionsView();
      });
    }

    if (this.$state.current.name === 'root.at.project.nodeConstraints') {
      this.$timeout(() => {
        this.showEditConstraintsView();
      });
    }
  }

  goBack() {
    this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId });
  }

  showCreateBranchView() {
    this.hideAllViews();
    this.showCreateBranch = true;
  }

  showEditTransitionsView() {
    this.hideAllViews();
    this.showEditTransitions = true;
  }

  showEditConstraintsView() {
    this.hideAllViews();
    this.showConstraints = true;
  }

  showGeneralAdvancedView() {
    this.$state.go('root.at.project.node.advanced.general');
  }

  showJSONView() {
    this.hideAllViews();
    if (this.showJSON) {
      if (!this.isJSONValid()) {
        if (confirm(this.$translate('jsonInvalidErrorMessage'))) {
          this.toggleJSONAuthoringView();
          this.NotificationService.hideJSONValidMessage();
        }
      } else {
        this.toggleJSONAuthoringView();
        this.NotificationService.hideJSONValidMessage();
      }
    } else {
      this.toggleJSONAuthoringView();
      this.authoringNodeContentJSONString = angular.toJson(this.node, 4);
      this.NotificationService.showJSONValidMessage();
    }
  }

  hideAllViews() {
    this.showJSON = false;
    this.showEditTransitions = false;
    this.showConstraints = false;
    this.showCreateBranch = false;
    this.NotificationService.hideJSONValidMessage();
  }

  authoringViewTransitionToNodeIdChanged() {
    this.ProjectService.calculateNodeNumbers();
    this.authoringViewNodeChanged();
  }

  isJSONValid() {
    try {
      angular.fromJson(this.authoringNodeContentJSONString);
      return true;
    } catch (e) {
      return false;
    }
  }

  toggleJSONAuthoringView() {
    this.showJSON = !this.showJSON;
  }

  autoSaveJSON() {
    try {
      let updatedNode = angular.fromJson(this.authoringNodeContentJSONString);
      this.ProjectService.setNode(this.nodeId, updatedNode);
      this.node = updatedNode;
      this.populateBranchAuthoring();
      this.authoringViewNodeChanged().then(() => {
        this.ProjectService.refreshProject();
      });
      this.NotificationService.showJSONValidMessage();
    } catch (e) {
      this.NotificationService.showJSONInvalidMessage();
    }
  }

  authoringViewNodeChanged(parseProject = false) {
    if (parseProject) {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }
    return this.ProjectService.saveProject();
  }

  addNewTransition() {
    this.addNewTransitionsIfNeeded();
    const nodeTransitions = this.node.transitionLogic.transitions;
    if (nodeTransitions.length > 0) {
      const lastNodeTransition = nodeTransitions[nodeTransitions.length - 1];
      const newTransition = {
        to: lastNodeTransition.to
      };
      nodeTransitions.push(newTransition);
    } else {
      const newTransition = {
        to: this.nodeId
      };
      nodeTransitions.push(newTransition);
    }
    if (this.isABranchNode()) {
      this.setDefaultBranchNodeTransitionLogic();
    }
    this.authoringViewNodeChanged();
  }

  addNewTransitionsIfNeeded() {
    if (this.node.transitionLogic.transitions == null) {
      this.node.transitionLogic.transitions = [];
    }
  }

  getChoicesByNodeIdAndComponentId(nodeId, componentId) {
    return this.ProjectService.getChoicesByNodeIdAndComponentId(nodeId, componentId);
  }

  getChoiceTypeByNodeIdAndComponentId(nodeId, componentId) {
    let choiceType = null;
    let component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null && component.choiceType != null) {
      choiceType = component.choiceType;
    }
    return choiceType;
  }

  getTransitionCriteriaParamsByName(name) {
    for (const singleTransitionCriteria of this.transitionCriterias) {
      if (singleTransitionCriteria.value === name) {
        return singleTransitionCriteria.params;
      }
    }
    return [];
  }

  deleteTransitionCriteria(transition, transitionCriteriaIndex) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisRequirement'))) {
      const transitionCriterias = transition.criteria;
      if (transitionCriterias != null) {
        transitionCriterias.splice(transitionCriteriaIndex, 1);
      }
      this.ProjectService.saveProject();
    }
  }

  addRemovalCriteria(constraint) {
    const removalCriteria = {
      name: '',
      params: {}
    };
    constraint.removalCriteria.push(removalCriteria);
    this.ProjectService.saveProject();
  }

  deleteRemovalCriteria(constraint, removalCriteriaIndex) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisRemovalCriteria'))) {
      const removalCriteria = constraint.removalCriteria;
      if (removalCriteria != null) {
        removalCriteria.splice(removalCriteriaIndex, 1);
      }
      this.ProjectService.saveProject();
    }
  }

  transitionCriteriaNameChanged(transitionCriteria) {
    let nodeId = null;
    let componentId = null;
    if (transitionCriteria.params != null) {
      nodeId = transitionCriteria.params.nodeId;
      componentId = transitionCriteria.params.componentId;
    }
    transitionCriteria.params = {};
    if (nodeId != null) {
      transitionCriteria.params.nodeId = nodeId;
    }
    if (componentId != null) {
      transitionCriteria.params.componentId = componentId;
    }
    this.authoringViewNodeChanged();
  }

  isABranchNode() {
    return this.node.transitionLogic.transitions.length > 1;
  }

  setDefaultBranchNodeTransitionLogic() {
    if (this.node.transitionLogic.howToChooseAmongAvailablePaths == null) {
      this.node.transitionLogic.howToChooseAmongAvailablePaths = 'workgroupId';
    }
    if (this.node.transitionLogic.whenToChoosePath == null) {
      this.node.transitionLogic.whenToChoosePath = 'enterNode';
    }
    if (this.node.transitionLogic.canChangePath == null) {
      this.node.transitionLogic.canChangePath = false;
    }
    if (this.node.transitionLogic.maxPathsVisitable == null) {
      this.node.transitionLogic.maxPathsVisitable = 1;
    }
  }

  addNewTransitionCriteria(transition) {
    for (const nodeTransition of this.node.transitionLogic.transitions) {
      if (nodeTransition == transition) {
        if (nodeTransition.criteria == null) {
          nodeTransition.criteria = [];
        }
        const newTransitionCriteria = {
          name: '',
          params: {
            nodeId: '',
            componentId: ''
          }
        };
        nodeTransition.criteria.push(newTransitionCriteria);
      }
    }
    this.authoringViewNodeChanged();
  }

  transitionCriteriaNodeIdChanged(transitionCriteria) {
    if (transitionCriteria != null && transitionCriteria.params != null) {
      let nodeId = transitionCriteria.params.nodeId;
      transitionCriteria.params = {};
      if (nodeId != null) {
        transitionCriteria.params.nodeId = nodeId;
      }
    }
    this.authoringViewNodeChanged();
  }

  transitionCriteriaComponentIdChanged(transitionCriteria) {
    if (transitionCriteria != null && transitionCriteria.params != null) {
      let nodeId = transitionCriteria.params.nodeId;
      let componentId = transitionCriteria.params.componentId;
      transitionCriteria.params = {};
      if (nodeId != null) {
        transitionCriteria.params.nodeId = nodeId;
      }
      if (componentId != null) {
        transitionCriteria.params.componentId = componentId;
      }
    }
    this.authoringViewNodeChanged();
  }

  deleteTransition(transition) {
    const stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(transition.to);
    const answer = confirm(
      this.$translate('areYouSureYouWantToDeleteThisPath', { stepTitle: stepTitle })
    );
    if (answer) {
      this.ProjectService.deleteTransition(this.node, transition);
      this.authoringViewNodeChanged();
    }
  }

  addConstraintAndScrollToBottom() {
    const newNodeConstraintId = this.addConstraint();
    this.$timeout(() => {
      this.ProjectService.scrollToBottomOfPage();
      this.UtilService.temporarilyHighlightElement(newNodeConstraintId);
    });
  }

  addConstraint() {
    const newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);
    const constraint = {
      id: newNodeConstraintId,
      action: '',
      targetId: this.nodeId,
      removalConditional: 'any',
      removalCriteria: [{
        name: '',
        params: {}
      }]
    };
    if (this.node.constraints == null) {
      this.node.constraints = [];
    }
    this.node.constraints.push(constraint);
    this.ProjectService.saveProject();
    return newNodeConstraintId;
  }

  getNewNodeConstraintId(nodeId) {
    let newNodeConstraintId = null;
    const usedConstraintIds = [];
    const node = this.ProjectService.getNodeById(nodeId);
    if (node != null && node.constraints != null) {
      for (const constraint of node.constraints) {
        if (constraint != null) {
          usedConstraintIds.push(constraint.id);
        }
      }
    }
    let constraintCounter = 1;
    while (newNodeConstraintId == null) {
      let potentialNewNodeConstraintId = nodeId + 'Constraint' + constraintCounter;
      if (usedConstraintIds.indexOf(potentialNewNodeConstraintId) == -1) {
        newNodeConstraintId = potentialNewNodeConstraintId;
      } else {
        constraintCounter++;
      }
    }
    return newNodeConstraintId;
  }

  deleteConstraint(constraintIndex) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisConstraint'))) {
      const node = this.ProjectService.getNodeById(this.nodeId);
      const constraints = node.constraints;
      if (constraints != null) {
        constraints.splice(constraintIndex, 1);
      }
      this.ProjectService.saveProject();
    }
  }

  constraintRemovalCriteriaNodeIdChanged(criteria) {
    criteria.params.componentId = '';
    this.authoringViewNodeChanged();
  }

  constraintRemovalCriteriaComponentIdChanged(criteria) {
    this.authoringViewNodeChanged();
  }

  removalCriteriaNameChanged(criteria) {
    criteria.params = {};
    const params = this.getRemovalCriteriaParamsByName(criteria.name);
    if (params != null) {
      for (const paramObject of params) {
        const value = paramObject.value;
        if (paramObject.hasOwnProperty('defaultValue')) {
          criteria.params[value] = paramObject.defaultValue;
        } else {
          criteria.params[value] = '';
        }
        if (value === 'nodeId') {
          criteria.params[value] = this.nodeId;
        }
      }
    }
    this.authoringViewNodeChanged();
  }

  getRemovalCriteriaParamsByName(name) {
    for (const singleRemovalCriteria of this.removalCriteria) {
      if (singleRemovalCriteria.value === name) {
        return singleRemovalCriteria.params;
      }
    }
    return [];
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
    this.authoringViewNodeChanged();
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
    this.authoringViewNodeChanged();
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
    this.authoringViewNodeChanged();
  }

  createBranchComponentIdChanged() {
    this.createBranchUpdateTransitions();
    this.authoringViewNodeChanged();
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
    this.authoringViewNodeChanged();
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
    this.authoringViewNodeChanged();
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
    this.authoringViewNodeChanged(parseProject);
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
    this.authoringViewNodeChanged(parseProject);
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

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }
}

export const NodeAdvancedAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/node-advanced-authoring.component.html`,
  controller: NodeAdvancedAuthoringController
}
