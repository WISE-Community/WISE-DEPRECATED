import { TeacherDataService } from '../../../../services/teacherDataService';
import { TeacherProjectService } from '../../../../services/teacherProjectService';

class NodeAdvancedPathAuthoringController {
  canChangePathOptions = [null, true, false];
  items: any[];
  node: any;
  nodeId: string;
  whenToChoosePathOptions = [null, 'enterNode', 'exitNode', 'scoreChanged', 'studentDataChanged'];
  transitionCriterias: any;
  $translate: any;

  static $inject = ['$filter', 'ProjectService', 'TeacherDataService'];

  constructor(
    private $filter: any,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService
  ) {
    this.$translate = this.$filter('translate');
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
    this.items = this.ProjectService.idToOrder;
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
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
    this.saveProject();
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

  addNewTransitionsIfNeeded() {
    if (this.node.transitionLogic.transitions == null) {
      this.node.transitionLogic.transitions = [];
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
    this.saveProject();
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

  getTransitionCriteriaParamsByName(name) {
    for (const singleTransitionCriteria of this.transitionCriterias) {
      if (singleTransitionCriteria.value === name) {
        return singleTransitionCriteria.params;
      }
    }
    return [];
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
    this.saveProject();
  }

  transitionCriteriaNodeIdChanged(transitionCriteria) {
    if (transitionCriteria != null && transitionCriteria.params != null) {
      let nodeId = transitionCriteria.params.nodeId;
      transitionCriteria.params = {};
      if (nodeId != null) {
        transitionCriteria.params.nodeId = nodeId;
      }
    }
    this.saveProject();
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
    this.saveProject();
  }

  transitionToNodeIdChanged() {
    this.ProjectService.calculateNodeNumbers();
    this.saveProject();
  }

  deleteTransition(transition) {
    const stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(transition.to);
    const answer = confirm(
      this.$translate('areYouSureYouWantToDeleteThisPath', { stepTitle: stepTitle })
    );
    if (answer) {
      this.ProjectService.deleteTransition(this.node, transition);
      this.saveProject();
    }
  }

  saveProject() {
    return this.ProjectService.saveProject();
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

export const NodeAdvancedPathAuthoringComponent = {
  templateUrl: `/wise5/authoringTool/node/advanced/path/node-advanced-path-authoring.component.html`,
  controller: NodeAdvancedPathAuthoringController
};
