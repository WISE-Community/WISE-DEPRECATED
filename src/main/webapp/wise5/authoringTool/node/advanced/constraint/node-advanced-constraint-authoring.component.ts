import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';
import { UtilService } from '../../../../services/utilService';

class NodeAdvancedConstraintAuthoringController {
  constraintActions: any[];
  items: any[];
  node: any;
  nodeId: string;
  removalConditionals: any[];
  removalCriteria: any;
  $translate: any;

  static $inject = ['$filter', '$timeout', 'ProjectService', 'TeacherDataService', 'UtilService'];

  constructor(
    private $filter: any,
    private $timeout: any,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
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
        params: []
      }
    ];
  }

  $onInit() {
    this.items = this.ProjectService.idToOrder;
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
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
      removalCriteria: [
        {
          name: '',
          params: {}
        }
      ]
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

  addRemovalCriteria(constraint) {
    const removalCriteria = {
      name: '',
      params: {}
    };
    constraint.removalCriteria.push(removalCriteria);
    this.ProjectService.saveProject();
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
    this.ProjectService.saveProject();
  }

  getRemovalCriteriaParamsByName(name) {
    for (const singleRemovalCriteria of this.removalCriteria) {
      if (singleRemovalCriteria.value === name) {
        return singleRemovalCriteria.params;
      }
    }
    return [];
  }

  constraintRemovalCriteriaNodeIdChanged(criteria) {
    criteria.params.componentId = '';
    this.ProjectService.saveProject();
  }

  constraintRemovalCriteriaComponentIdChanged() {
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

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  saveProject() {
    this.ProjectService.saveProject();
  }
}

export const NodeAdvancedConstraintAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/constraint/node-advanced-constraint-authoring.component.html`,
  controller: NodeAdvancedConstraintAuthoringController
};
