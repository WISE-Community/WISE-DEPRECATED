'use strict';

import { AuthoringToolProjectService } from '../authoringToolProjectService';
import { ConfigService } from '../../services/configService';
import NodeService from '../../services/nodeService';
import ProjectAssetService from '../../services/projectAssetService';
import TeacherDataService from '../../services/teacherDataService';
import { UtilService } from '../../services/utilService';
import * as angular from 'angular';
import * as $ from 'jquery';
import { TagService } from '../../services/tagService';

class NodeAuthoringController {
  $translate: any;
  addComponentMode: boolean = false;
  authoringNodeContentJSONString: string;
  branchCriteria: any;
  canChangePathOptions = [null, true, false];
  components: any;
  componentsToChecked = {};
  componentTypes: any;
  constraintActions: any[];
  copyComponentMode: boolean = false;
  createBranchBranches = [];
  createBranchCriterion: any;
  createBranchMergePointNodeId: string;
  createBranchNodeId: string;
  createBranchComponentId: string;
  createBranchNumberOfBranches: any;
  currentNodeCopy: any;
  howToChooseAmongAvailablePathsOptions = [
    null,
    'random',
    'workgroupId',
    'firstAvailable',
    'lastAvailable',
    'tag'
  ];
  importComponentMode: boolean = false;
  importLibraryProjectId: any;
  importMyProjectId: any;
  importProject: any;
  importProjectId: any;
  importProjectIdToOrder: any;
  importProjectItems: any;
  insertComponentMode: boolean = false;
  items: any[];
  libraryProjectsList: any;
  moveComponentMode: boolean = false;
  myProjectsList: any;
  node: any;
  nodeCopy: any = null;
  nodeId: string;
  nodePosition: any;
  originalNodeCopy: any;
  projectId: number;
  removalConditionals: any;
  removalCriteria: any;
  selectedComponent: any = null;
  showAdvanced: boolean = false;
  showComponentAuthoringViews: boolean = true;
  showComponents: boolean = true;
  showConstraints: boolean = false;
  showCreateComponent: boolean = false;
  showCreateBranch: boolean = false;
  showEditTransitions: boolean = false;
  showGeneralAdvanced: boolean = false;
  showImport: boolean = false;
  showJSON: boolean = false;
  showRubric: boolean = false;
  showRubricButton: boolean = true;
  showStepButtons: boolean = true;
  summernoteRubricHTML: string;
  summernoteRubricId: string;
  summernoteRubricOptions: any;
  transitionCriterias: any;
  undoStack: any[] = [];
  whenToChoosePathOptions = [null, 'enterNode', 'exitNode', 'scoreChanged', 'studentDataChanged'];

  static $inject = [
    '$anchorScroll',
    '$filter',
    '$injector',
    '$mdDialog',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'ConfigService',
    'NodeService',
    'ProjectAssetService',
    'ProjectService',
    'TagService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    private $anchorScroll: any,
    private $filter: any,
    private $injector: any,
    private $mdDialog: any,
    private $rootScope: any,
    private $scope: any,
    private $state: any,
    private $stateParams: any,
    private $timeout: any,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private ProjectAssetService: ProjectAssetService,
    private ProjectService: AuthoringToolProjectService,
    private TagService: TagService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
    this.projectId = $stateParams.projectId;
    this.nodeId = $stateParams.nodeId;

    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);
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

    // the array of component types that can be created
    // TODO: automate by looping through active component types for this WISE instance
    this.componentTypes = [
      {
        componentType: 'Animation',
        componentName: this.UtilService.getComponentTypeLabel('Animation')
      },
      {
        componentType: 'AudioOscillator',
        componentName: this.UtilService.getComponentTypeLabel('AudioOscillator')
      },
      {
        componentType: 'ConceptMap',
        componentName: this.UtilService.getComponentTypeLabel('ConceptMap')
      },
      {
        componentType: 'Discussion',
        componentName: this.UtilService.getComponentTypeLabel('Discussion')
      },
      { componentType: 'Draw', componentName: this.UtilService.getComponentTypeLabel('Draw') },
      {
        componentType: 'Embedded',
        componentName: this.UtilService.getComponentTypeLabel('Embedded')
      },
      { componentType: 'Graph', componentName: this.UtilService.getComponentTypeLabel('Graph') },
      { componentType: 'HTML', componentName: this.UtilService.getComponentTypeLabel('HTML') },
      { componentType: 'Label', componentName: this.UtilService.getComponentTypeLabel('Label') },
      { componentType: 'Match', componentName: this.UtilService.getComponentTypeLabel('Match') },
      {
        componentType: 'MultipleChoice',
        componentName: this.UtilService.getComponentTypeLabel('MultipleChoice')
      },
      {
        componentType: 'OpenResponse',
        componentName: this.UtilService.getComponentTypeLabel('OpenResponse')
      },
      {
        componentType: 'OutsideURL',
        componentName: this.UtilService.getComponentTypeLabel('OutsideURL')
      },
      {
        componentType: 'Summary',
        componentName: this.UtilService.getComponentTypeLabel('Summary')
      },
      { componentType: 'Table', componentName: this.UtilService.getComponentTypeLabel('Table') }
    ];

    this.selectedComponent = this.componentTypes[0].componentType;
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.nodePosition = this.ProjectService.getNodePositionById(this.nodeId);
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

    /*
     * remember a copy of the node at the beginning of this node authoring
     * session in case we need to roll back if the user decides to
     * cancel/revert all the changes.
     */
    this.originalNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    this.populateBranchAuthoring();
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId;
    let insertAssetString = this.$translate('INSERT_ASSET');
    let insertAssetButton = this.UtilService.createInsertAssetButton(
      null,
      this.nodeId,
      null,
      'rubric',
      insertAssetString
    );
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: insertAssetButton
      },
      dialogsInBody: true
    };
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.node.rubric);

    this.$scope.$on('assetSelected', (event, { assetItem, target }) => {
      if (target === 'rubric') {
        this.UtilService.insertFileInSummernoteEditor(
          `summernoteRubric_${this.nodeId}`,
          `${this.ConfigService.getProjectAssetsDirectoryPath()}/${assetItem.fileName}`,
          assetItem.fileName
        );
      }
      this.$mdDialog.hide();
    });

    this.$scope.$on('componentShowSubmitButtonValueChanged', (event, { showSubmitButton }) => {
      if (showSubmitButton) {
        this.node.showSaveButton = false;
        this.node.showSubmitButton = false;
        this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
      } else {
        if (this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.node.id)) {
          this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
        } else {
          this.node.showSaveButton = true;
          this.node.showSubmitButton = false;
          this.ProjectService.turnOffSaveButtonForAllComponents(this.node);
        }
      }
      this.authoringViewNodeChanged();
    });

    if (this.$state.current.name === 'root.at.project.nodeConstraints') {
      this.$timeout(() => {
        this.showAdvancedView();
        this.$timeout(() => {
          this.showEditConstraintsView();
        });
      });
    }

    if (this.$state.current.name === 'root.at.project.nodeEditPaths') {
      this.$timeout(() => {
        this.showAdvancedView();
        this.$timeout(() => {
          this.showEditTransitionsView();
        });
      });
    }

    const data = {
      title: this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId)
    };
    if (this.ProjectService.isGroupNode(this.nodeId)) {
      this.saveEvent('activityViewOpened', 'Navigation', data);
    } else {
      this.saveEvent('stepViewOpened', 'Navigation', data);
    }
    this.scrollToTopOfPage();
  }

  /**
   * Populate the branch authoring
   * TODO refactor too much nesting
   */
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
          items: this.authoringViewGetBranchItems(),
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
        /*
         * we have not been able to determine the branch criterion yet
         * so we will look at the howToChooseAmongAvailablePaths field
         */
        if (this.node.transitionLogic.howToChooseAmongAvailablePaths === 'workgroupId') {
          this.createBranchCriterion = 'workgroupId';
        } else if (this.node.transitionLogic.howToChooseAmongAvailablePaths === 'random') {
          this.createBranchCriterion = 'random';
        }
      }
    }
  }

  previewStepInNewWindow() {
    const data = { constraints: true };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(
      `${this.ConfigService.getConfigParam('previewProjectURL')}/${this.nodeId}`
    );
  }

  previewStepWithoutConstraintsInNewWindow() {
    const data = { constraints: false };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(
      `${this.ConfigService.getConfigParam('previewProjectURL')}/${this.nodeId}` +
        `?constraints=false`
    );
  }

  close() {
    this.$scope.$broadcast('exitNode', { nodeToExit: this.node });
    this.TeacherDataService.setCurrentNode(null);
    this.$state.go('root.at.project', { projectId: this.projectId });
    this.scrollToTopOfPage();
  }

  showSaveErrorAdvancedAuthoring() {
    alert(this.$translate('saveErrorAdvancedAuthoring'));
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

  authoringViewTransitionToNodeIdChanged() {
    this.ProjectService.calculateNodeNumbers();
    this.authoringViewNodeChanged();
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

  /**
   * The transition criteria node id changed so we will update the params accordingly.
   * @param transitionCriteria the transition criteria object that changed
   */
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

  /**
   * The transition criteria component id changed so we will update the param accordingly.
   * @param transitionCriteria the transition criteria object that changed
   */
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

  /**
   * Deletes the specified transition from this node
   * @param transition the transition to delete
   */
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

  saveTransitions() {
    this.ProjectService.saveProject();
    this.showEditTransitions = false;
  }

  addComponentButtonClicked() {
    this.selectedComponent = this.componentTypes[0].componentType;
    this.showAddComponentView();
    this.turnOnAddComponentMode();
    this.turnOffMoveComponentMode();
    this.turnOnInsertComponentMode();
    this.hideComponentAuthoring();
  }

  deleteComponent(componentId) {
    if (confirm(this.$translate('confirmDeleteComponent'))) {
      this.ProjectService.deleteComponent(this.nodeId, componentId);
      this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();
      this.ProjectService.saveProject();
    }
  }

  hideAllComponentSaveButtons() {
    for (const component of this.components) {
      const service = this.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = false;
      }
    }
  }

  /**
   * The node has changed in the authoring view
   * @param parseProject whether to parse the whole project to recalculate
   * significant changes such as branch paths
   */
  authoringViewNodeChanged(parseProject = false) {
    this.undoStack.push(this.currentNodeCopy);
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    if (parseProject) {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }
    return this.ProjectService.saveProject();
  }

  undo() {
    if (this.undoStack.length === 0) {
      alert(this.$translate('noUndoAvailable'));
    } else if (this.undoStack.length > 0) {
      if (confirm(this.$translate('confirmUndoLastChange'))) {
        this.$scope.$broadcast('exitNode', { nodeToExit: this.node });
        const nodePreviousVersion = this.undoStack.pop();
        this.ProjectService.replaceNode(this.nodeId, nodePreviousVersion);
        this.node = this.ProjectService.getNodeById(this.nodeId);
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
        this.ProjectService.saveProject();
      }
    }
  }

  /**
   * Get the removal criteria params for a removal criteria name
   * @param name a removal criteria name e.g. 'isCompleted', 'score', 'branchPathTaken'
   * @return the params for the given removal criteria name
   */
  getRemovalCriteriaParamsByName(name) {
    for (const singleRemovalCriteria of this.removalCriteria) {
      if (singleRemovalCriteria.value === name) {
        return singleRemovalCriteria.params;
      }
    }
    return [];
  }

  /**
   * Get the transition criteria params for a transition criteria name
   * @param name a transition criteria name e.g.  'score', 'choiceChosen'
   * @return the params for the given transition criteria name
   */
  getTransitionCriteriaParamsByName(name) {
    for (const singleTransitionCriteria of this.transitionCriterias) {
      if (singleTransitionCriteria.value === name) {
        return singleTransitionCriteria.params;
      }
    }
    return [];
  }

  /**
   * Get the choices of a component
   * @param nodeId the node id
   * @param componentId the component id
   * @return the choices from the component
   */
  getChoicesByNodeIdAndComponentId(nodeId, componentId) {
    return this.ProjectService.getChoicesByNodeIdAndComponentId(nodeId, componentId);
  }

  /**
   * Get the choice type of a component
   * @param nodeId the node id
   * @param componentId the component id
   * @return the choice type e.g. 'radio' or 'checkbox'
   */
  getChoiceTypeByNodeIdAndComponentId(nodeId, componentId) {
    let choiceType = null;
    let component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null && component.choiceType != null) {
      choiceType = component.choiceType;
    }
    return choiceType;
  }

  /**
   * Get the next available constraint id for a node
   * @param nodeId the node id
   * @return a constraint id that hasn't been used yet
   */
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

  /**
   * Add a new constraint.
   * @return The id of the DOM element associated with the constraint.
   */
  addConstraint() {
    const newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);
    const constraint = {
      id: newNodeConstraintId,
      action: '',
      targetId: this.nodeId,
      emovalConditional: 'any',
      removalCriteria: []
    };

    const removalCriteria = {
      name: '',
      params: {}
    };

    constraint.removalCriteria.push(removalCriteria);
    if (this.node.constraints == null) {
      this.node.constraints = [];
    }
    this.node.constraints.push(constraint);
    this.ProjectService.saveProject();
    return newNodeConstraintId;
  }

  addConstraintAndScrollToBottom() {
    const newNodeConstraintId = this.addConstraint();
    this.$timeout(() => {
      this.$rootScope.$broadcast('scrollToBottom'); // this is where the new constraint appears
      this.UtilService.temporarilyHighlightElement(newNodeConstraintId);
    });
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

  /**
   * Delete a removal criteria from a constraint
   * @param constraint remove the removal criteria from this constraint
   * @param removalCriteriaIndex the index of the removal criteria to remove
   */
  deleteRemovalCriteria(constraint, removalCriteriaIndex) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisRemovalCriteria'))) {
      const removalCriteria = constraint.removalCriteria;
      if (removalCriteria != null) {
        removalCriteria.splice(removalCriteriaIndex, 1);
      }
      this.ProjectService.saveProject();
    }
  }

  /**
   * Delete a transition criteria from a transition
   * @param constraint remove the removal criteria from this constraint
   * @param removalCriteriaIndex the index of the removal criteria to remove
   */
  deleteTransitionCriteria(transition, transitionCriteriaIndex) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisRequirement'))) {
      const transitionCriterias = transition.criteria;
      if (transitionCriterias != null) {
        transitionCriterias.splice(transitionCriteriaIndex, 1);
      }
      this.ProjectService.saveProject();
    }
  }

  /**
   * A removal criteria name has changed so we will clear the params so
   * that the params from the previous removal criteria name do not persist
   * TODO refactor too many nesting
   */
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

  /**
   * A removal criteria name has changed so we will clear the params so
   * that the params from the previous removal criteria name do not persist.
   * @param transitionCriteria the transition criteria object
   */
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

  hideAllViews() {
    this.showCreateComponent = false;
    this.showGeneralAdvanced = false;
    this.showEditTransitions = false;
    this.showConstraints = false;
    this.showRubric = false;
    this.showCreateBranch = false;
    this.showAdvanced = false;
    this.showImport = false;
    this.showStepButtons = false;
    this.showComponents = false;
    this.showJSON = false;
    this.UtilService.hideJSONValidMessage();
  }

  showDefaultComponentsView() {
    this.hideAllViews();
    this.showStepButtons = true;
    this.showComponents = true;
  }

  showAddComponentView() {
    this.showDefaultComponentsView();
    this.showCreateComponent = true;
  }

  showGeneralAdvancedView() {
    this.showAdvancedView();
    this.showGeneralAdvanced = true;
  }

  showAdvancedView() {
    this.hideAllViews();
    this.showAdvanced = true;
  }

  showEditTransitionsView() {
    this.showAdvancedView();
    this.showEditTransitions = true;
  }

  showEditConstraintsView() {
    this.showAdvancedView();
    this.showConstraints = true;
  }

  showEditRubricView() {
    this.hideAllViews();
    this.showRubric = true;
  }

  showCreateBranchView() {
    this.showAdvancedView();
    this.showCreateBranch = true;
  }

  showImportView() {
    this.hideAllViews();
    this.showImport = true;
    this.showComponents = true;
  }

  showJSONView() {
    this.showAdvancedView();
    if (this.showJSON) {
      if (!this.isJSONValid()) {
        if (confirm(this.$translate('jsonInvalidErrorMessage'))) {
          this.toggleJSONAuthoringView();
          this.UtilService.hideJSONValidMessage();
        }
      } else {
        this.toggleJSONAuthoringView();
        this.UtilService.hideJSONValidMessage();
      }
    } else {
      this.toggleJSONAuthoringView();
      this.authoringNodeContentJSONString = angular.toJson(this.node, 4);
      this.UtilService.showJSONValidMessage();
    }
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

  /**
   * The author has changed the number of branch paths
   * TODO refactor long function
   */
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
          branch.items = this.authoringViewGetBranchItems();
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

    /*
     * update the transitions so that they have the necessary parameter
     * fields for the given branch criterion
     */
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

    /*
     * update the transitions so that they have the necessary parameter
     * fields for the given branch criterion
     */
    this.createBranchUpdateTransitions();
    this.authoringViewNodeChanged();
  }

  createBranchComponentIdChanged() {
    /*
     * update the transitions so that they have the necessary parameter
     * fields for the given branch criterion
     */
    this.createBranchUpdateTransitions();
    this.authoringViewNodeChanged();
  }

  /**
   * Update the transitions so that they have the necessary parameter
   * fields for the given branch criterion
   */
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

            /*
             * clear the choice id. we will set the choice id in
             * the branch object when we call createBranchUpdateChoiceChosenIds()
             */
            branch.choiceId = null;

            // clear the scores since we don't need it in choice chosen branching
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
              await this.TagService.retrieveTags().subscribe(() => {});
            }
            transition.criteria = [];
            const criterion = {
              name: 'tag',
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

  /**
   * Automatically populate the selected choices if the branch is based on
   * choice chosen and the selected component is a multiple choice component
   */
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

  /**
   * A step was clicked in the create branch authoring view
   * @param branch the branch path
   * @param item the step that was clicked
   * TODO refactor function too long
   */
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

  /**
   * The score for a path has changed in the branch authoring
   * @param branch the branch for which the score has changed
   * TODO refactor too many nesting
   */
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

  /**
   * The merge point has changed in the branch authoring
   * TODO refactor too many nesting
   */
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
    branch.items = this.authoringViewGetBranchItems();
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

  summernoteRubricHTMLChanged() {
    let html = this.summernoteRubricHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    html = this.ConfigService.removeAbsoluteAssetPaths(html);

    // replace <a> and <button> elements with <wiselink> elements when applicable
    html = this.UtilService.insertWISELinks(html);
    this.node.rubric = html;
    this.authoringViewNodeChanged();
  }

  showComponentAuthoring() {
    this.showComponentAuthoringViews = true;
  }

  hideComponentAuthoring() {
    this.showComponentAuthoringViews = false;
  }

  turnOnInsertComponentMode() {
    this.insertComponentMode = true;
  }

  turnOffInsertComponentMode() {
    this.insertComponentMode = false;
  }

  turnOnAddComponentMode() {
    this.addComponentMode = true;
  }

  turnOffAddComponentMode() {
    this.addComponentMode = false;
  }

  turnOnMoveComponentMode() {
    this.moveComponentMode = true;
  }

  turnOffMoveComponentMode() {
    this.moveComponentMode = false;
  }

  turnOnCopyComponentMode() {
    this.copyComponentMode = true;
  }

  turnOffCopyComponentMode() {
    this.copyComponentMode = false;
  }

  turnOnImportComponentMode() {
    this.importComponentMode = true;
  }

  turnOffImportComponentMode() {
    this.importComponentMode = false;
  }

  getSelectedComponentIds() {
    const selectedComponents = [];
    if (this.components != null) {
      for (let component of this.components) {
        if (component != null && component.id != null) {
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            selectedComponents.push(component.id);
          }
        }
      }
    }
    return selectedComponents;
  }

  clearComponentsToChecked() {
    this.componentsToChecked = {};
  }

  /**
   * Get the component numbers and component types that have been selected
   * @return an array of strings
   * example
   * [
   *   "1. OpenResponse",
   *   "3. MultipleChoice"
   * ]
   */
  getSelectedComponentNumbersAndTypes() {
    let selectedComponents = [];
    if (this.components != null) {
      for (let c = 0; c < this.components.length; c++) {
        let component = this.components[c];
        if (component != null && component.id != null) {
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            let componentNumberAndType = c + 1 + '. ' + component.type;
            selectedComponents.push(componentNumberAndType);
          }
        }
      }
    }
    return selectedComponents;
  }

  importButtonClicked() {
    this.importProjectIdToOrder = {};
    this.importProjectItems = [];
    this.importMyProjectId = null;
    this.importLibraryProjectId = null;
    this.importProjectId = null;
    this.importProject = null;
    this.showImportView();
    if (this.showImport) {
      this.turnOnImportComponentMode();
      if (this.myProjectsList == null) {
        this.myProjectsList = this.ConfigService.getAuthorableProjects();
      }

      if (this.libraryProjectsList == null) {
        this.ProjectService.getLibraryProjects().then(libraryProjects => {
          this.libraryProjectsList = this.ProjectService.sortAndFilterUniqueLibraryProjects(
            libraryProjects
          );
        });
      }
    }
  }

  moveButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToMoveAndThenClickTheMoveButtonAgain'));
    } else {
      this.showDefaultComponentsView();
      this.turnOffAddComponentMode();
      this.turnOnMoveComponentMode();
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
    }
  }

  copyButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToCopyAndThenClickTheCopyButtonAgain'));
    } else {
      this.showDefaultComponentsView();
      this.turnOnCopyComponentMode();
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
    }
  }

  deleteButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToDeleteAndThenClickTheDeleteButtonAgain'));
    } else {
      this.scrollToTopOfPage();

      /*
       * hide all the component authoring so that the author only sees the
       * component numbers and component types
       */
      this.hideComponentAuthoring();

      /*
       * Use a timeout to allow the effects of hideComponentAuthoring() to
       * take effect. If we don't use a timeout, the user won't see any change
       * in the UI.
       */
      this.$timeout(() => {
        let confirmMessage = '';
        const selectedComponentNumbersAndTypes = this.getSelectedComponentNumbersAndTypes();
        if (selectedComponentNumbersAndTypes.length == 1) {
          confirmMessage = this.$translate('areYouSureYouWantToDeleteThisComponent');
        } else if (selectedComponentNumbersAndTypes.length > 1) {
          confirmMessage = this.$translate('areYouSureYouWantToDeleteTheseComponents');
        }
        for (let c = 0; c < selectedComponentNumbersAndTypes.length; c++) {
          confirmMessage += '\n' + selectedComponentNumbersAndTypes[c];
        }
        if (confirm(confirmMessage)) {
          const selectedComponents = this.getSelectedComponentIds();
          const data = {
            componentsDeleted: this.getComponentObjectsForEventData(selectedComponents)
          };
          for (const componentId of selectedComponents) {
            this.ProjectService.deleteComponent(this.nodeId, componentId);
          }
          this.saveEvent('componentDeleted', 'Authoring', data);
          this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();
          this.ProjectService.saveProject();
        } else {
          this.clearComponentsToChecked();
        }
        this.turnOffInsertComponentMode();
        this.clearComponentsToChecked();
        this.showComponentAuthoring();
      });
    }
  }

  cancelInsertClicked() {
    this.showDefaultComponentsView();
    this.turnOffAddComponentMode();
    this.turnOffMoveComponentMode();
    this.turnOffInsertComponentMode();
    this.clearComponentsToChecked();
    this.showComponentAuthoring();
  }

  checkIfNeedToShowNodeSaveOrNodeSubmitButtons() {
    if (!this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.nodeId)) {
      if (this.ProjectService.doesAnyComponentHaveWork(this.nodeId)) {
        this.node.showSaveButton = true;
        this.node.showSubmitButton = false;
        this.hideAllComponentSaveButtons();
      } else {
        this.node.showSaveButton = false;
        this.node.showSubmitButton = false;
      }
    }
  }

  insertComponentAsFirst() {
    if (this.addComponentMode) {
      this.handleAddComponent();
    } else if (this.moveComponentMode) {
      this.handleMoveComponent();
    } else if (this.copyComponentMode) {
      this.handleCopyComponent();
    } else if (this.importComponentMode) {
      this.handleImportComponent();
    }
  }

  insertComponentAfter(componentId) {
    if (this.addComponentMode) {
      this.handleAddComponent(componentId);
    } else if (this.moveComponentMode) {
      this.handleMoveComponent(componentId);
    } else if (this.copyComponentMode) {
      this.handleCopyComponent(componentId);
    } else if (this.importComponentMode) {
      this.handleImportComponent(componentId);
    }
  }

  /**
   * Add components to this step.
   * @param componentId (optional) Add the components after this component id.
   * If the componentId is not provided, we will put the components at the
   * beginning of the step.
   */
  handleAddComponent(componentId = null) {
    const newComponent = this.ProjectService.createComponent(
      this.nodeId,
      this.selectedComponent,
      componentId
    );
    const data = {
      componentId: newComponent.id,
      componentType: newComponent.type
    };
    this.saveEvent('componentCreated', 'Authoring', data);
    this.turnOffAddComponentMode();
    this.ProjectService.saveProject();
    this.highlightNewComponentsAndThenShowComponentAuthoring([newComponent]);
  }

  /**
   * Move components in this step.
   * @param componentId (optional) Put the moved components after this component
   * id. If the componentId is not provided, we will put the components at the
   * beginning of the step.
   */
  handleMoveComponent(componentId = null) {
    const selectedComponentIds = this.getSelectedComponentIds();
    if (selectedComponentIds != null && selectedComponentIds.indexOf(componentId) != -1) {
      if (selectedComponentIds.length === 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
      } else if (selectedComponentIds.length > 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
      }
    } else {
      const newComponents = this.NodeService.moveComponent(
        this.nodeId,
        selectedComponentIds,
        componentId
      );
      this.ProjectService.saveProject();
      const eventData = {
        componentsMoved: this.getComponentObjectsForEventData(selectedComponentIds)
      };
      this.saveEvent('componentMoved', 'Authoring', eventData);
      this.turnOffMoveComponentMode();
      this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
    }
  }

  /**
   * Copy components in this step.
   * @param componentId (optional) Put the copied components after this
   * component id. If the componentId is not provided, we will put the
   * components at the beginning of the step.
   */
  handleCopyComponent(componentId = null) {
    let newComponents = [];
    let selectedComponentIds = this.getSelectedComponentIds();
    let componentsCopied = this.getComponentObjectsForEventData(selectedComponentIds);
    newComponents = this.ProjectService.copyComponentAndInsert(
      this.nodeId,
      selectedComponentIds,
      componentId
    );
    for (let c = 0; c < componentsCopied.length; c++) {
      let componentCopied = componentsCopied[c];
      let newComponent = newComponents[c];
      componentCopied.fromComponentId = componentCopied.componentId;
      componentCopied.toComponentId = newComponent.id;
      delete componentCopied.componentId;
    }
    const data = {
      componentsCopied: componentsCopied
    };
    this.saveEvent('componentCopied', 'Authoring', data);
    this.turnOffCopyComponentMode();
    this.ProjectService.saveProject();
    this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
  }

  /**
   * Import components into this step.
   * @param componentId (optional) Put the imported components after this
   * component id. If the componentId is not provided, we will put the
   * components at the beginning of the step.
   */
  handleImportComponent(componentId = null) {
    this.importComponents(this.nodeId, componentId).then(newComponents => {
      this.turnOffImportComponentMode();
      this.ProjectService.saveProject();
      this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);

      // refresh the project assets in case any of the imported components also imported assets
      this.ProjectAssetService.retrieveProjectAssets();
    });
  }

  /**
   * Temporarily highlight the new components and then show the component
   * authoring views. Used to bring user's attention to new changes.
   * @param newComponents an array of the new components we have just added
   */
  highlightNewComponentsAndThenShowComponentAuthoring(newComponents) {
    this.$timeout(() => {
      // allow the components time to show up in the UI
      if (newComponents != null) {
        for (const newComponent of newComponents) {
          if (newComponent != null) {
            this.UtilService.temporarilyHighlightElement(newComponent.id);
          }
        }
      }

      /*
       * Wait a small amount of time before returning the UI back to the
       * normal view. This allows the author to see the component number
       * and type view a little longer so that they can see the change
       * they just made before we switch back to the normal view.
       */
      this.$timeout(() => {
        this.showComponentAuthoring();
        this.turnOffInsertComponentMode();
        this.showDefaultComponentsView();
        this.clearComponentsToChecked();

        /*
         * use a timeout to wait for the UI to update and then scroll
         * to the first new component
         */
        this.$timeout(() => {
          if (newComponents != null && newComponents.length > 0) {
            let componentElement = $('#' + newComponents[0].id);
            if (componentElement != null) {
              $('#content').animate(
                {
                  scrollTop: componentElement.offset().top - 200
                },
                1000
              );
            }
          }
        }, 1000);
      }, 1000);
    });
  }

  /**
   * The author has chosen an authorable project to import from
   * @param importProjectId the project id to import from
   */
  showMyImportProject(importProjectId) {
    this.importLibraryProjectId = null;
    this.showImportProject(importProjectId);
  }

  /**
   * The author has chosen a library project to import from
   * @param importProjectId the project id to import from
   */
  showLibraryImportProject(importProjectId) {
    this.importMyProjectId = null;
    this.showImportProject(importProjectId);
  }

  /**
   * Show the project we want to import steps from
   * @param importProjectId the import project id
   */
  showImportProject(importProjectId) {
    this.importProjectId = importProjectId;
    if (this.importProjectId == null) {
      this.importProjectIdToOrder = {};
      this.importProjectItems = [];
      this.importMyProjectId = null;
      this.importLibraryProjectId = null;
      this.importProjectId = null;
      this.importProject = null;
    } else {
      this.ProjectService.retrieveProjectById(this.importProjectId).then(projectJSON => {
        this.importProjectIdToOrder = {};
        this.importProject = projectJSON;
        const result = this.ProjectService.getNodeOrderOfProject(this.importProject);
        this.importProjectIdToOrder = result.idToOrder;
        this.importProjectItems = result.nodes;
      });
    }
  }

  previewImportNode(node) {
    window.open(
      `${this.importProject.previewProjectURL}/${node.id}`
    );
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}`);
  }

  importComponentsButtonClicked() {
    let selectedComponents = this.getSelectedComponentsToImport();
    if (selectedComponents == null || selectedComponents.length == 0) {
      alert('Please select a component to import.');
    } else {
      /*
       * hide the import view because we want to go back to the
       * project view so that the author can choose where to place
       * the new steps
       */
      this.showImport = false;
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
      this.scrollToTopOfPage();
    }
  }

  getSelectedComponentsToImport() {
    const selectedComponents = [];
    for (const item of this.importProjectItems) {
      if (item.node.components != null) {
        for (const component of item.node.components) {
          if (component.checked) {
            selectedComponents.push(component);
          }
        }
      }
    }
    return selectedComponents;
  }

  /**
   * Get the components that were selected
   * @param insertAfterComponentId (optional) Insert the components after this
   * component id. If this is null, we will insert the components at the
   * beginning of the step.
   */
  importComponents(nodeId, insertAfterComponentId) {
    const data = {
      componentsImported: this.getComponentObjectsForImportEventData()
    };
    const selectedComponents = this.getSelectedComponentsToImport();
    for (const selectedComponent of selectedComponents) {
      delete selectedComponent.checked;
    }
    return this.ProjectService.importComponents(
      selectedComponents,
      this.importProjectId,
      nodeId,
      insertAfterComponentId
    ).then(newComponents => {
      for (let c = 0; c < data.componentsImported.length; c++) {
        const componentImported = data.componentsImported[c];
        let newComponentId = newComponents[c].id;
        componentImported.toComponentId = newComponentId;
      }
      this.saveEvent('componentImported', 'Authoring', data);
      return newComponents;
    });
  }

  scrollToTopOfPage() {
    this.$anchorScroll('top');
  }

  /**
   * We are in the create a new component mode and the user has clicked on a component type
   * @param componentType the component type the author clicked
   */
  componentTypeClicked(componentType) {
    this.selectedComponent = componentType;
  }

  cancelCreateComponentClicked() {
    this.showDefaultComponentsView();
    this.turnOffAddComponentMode();
    this.turnOffMoveComponentMode();
    this.turnOffInsertComponentMode();
    this.showComponentAuthoring();
  }

  /**
   * Get the component type label
   * @param componentType the component type
   * @return the component type label
   * example: "Open Response"
   */
  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  backButtonClicked() {
    if (this.showImport || this.showRubric || this.showAdvanced) {
      this.UtilService.hideJSONValidMessage();
      this.showDefaultComponentsView();
      this.$state.go('root.at.project.node', { projectId: this.projectId, nodeId: this.nodeId });
    } else {
      this.close();
    }
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   * @param data (optional) an object that contains more specific data about the event
   */
  saveEvent(eventName, category, data) {
    const context = 'AuthoringTool';
    const nodeId = this.nodeId;
    const componentId = null;
    const componentType = null;
    if (data == null) {
      data = {};
    }
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
    );
  }

  /**
   * Get an array of objects that contain the component id and type
   * @param componentIds an array of component ids
   * @return an array of objects that contain the component id and type
   * TODO refactor too many nesting
   */
  getComponentObjectsForEventData(componentIds) {
    const componentObjects = [];
    for (let componentId of componentIds) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId,
        componentId
      );
      if (component != null) {
        const tempComponent = {
          componentId: component.id,
          type: component.type
        };
        componentObjects.push(tempComponent);
      }
    }
    return componentObjects;
  }

  /**
   * Get an array of objects that contain the node id, component id and type
   * @return an array of objects that contain the node id, component id and type
   * TODO refactor too many nesting
   */
  getComponentObjectsForImportEventData() {
    const componentObjects = [];
    for (let item of this.importProjectItems) {
      if (item != null && item.node != null && item.node.components != null) {
        for (let component of item.node.components) {
          if (component != null && component.checked) {
            const tempComponent = {
              fromProjectId: parseInt(this.importProjectId),
              fromNodeId: item.node.id,
              fromComponentId: component.id,
              type: component.type
            };
            componentObjects.push(tempComponent);
          }
        }
      }
    }
    return componentObjects;
  }

  autoSaveJSON() {
    try {
      let updatedNode = angular.fromJson(this.authoringNodeContentJSONString);
      this.ProjectService.setNode(this.nodeId, updatedNode);
      this.node = updatedNode;
      this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
      this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);
      this.populateBranchAuthoring();
      this.authoringViewNodeChanged().then(() => {
        this.$rootScope.$broadcast('parseProject');
      });
      this.UtilService.showJSONValidMessage();
    } catch (e) {
      this.UtilService.showJSONInvalidMessage();
    }
  }

  /**
   * The advanced button was clicked on a component. We will broadcast an event
   * so that the appropriate child component can display their advanced
   * authoring options.
   * @param componentId The component id whose advanced button was clicked.
   */
  componentAdvancedButtonClicked(componentId) {
    this.$rootScope.$broadcast('componentAdvancedButtonClicked', { componentId: componentId });
  }

  authoringViewConstraintRemovalCriteriaNodeIdChanged(criteria) {
    criteria.params.componentId = '';
    this.authoringViewNodeChanged();
  }

  authoringViewConstraintRemovalCriteriaComponentIdChanged(criteria) {
    this.authoringViewNodeChanged();
  }

  authoringViewGetBranchItems() {
    const items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);
    for (const nodeId of Object.keys(items)) {
      items[nodeId]['$key'] = nodeId;
    }
    return items;
  }
}

export default NodeAuthoringController;
