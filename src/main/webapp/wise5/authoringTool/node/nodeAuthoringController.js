'use strict';

class NodeAuthoringController {

  constructor(
      $anchorScroll,
      $filter,
      $injector,
      $location,
      $mdDialog,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      $timeout,
      ConfigService,
      NodeService,
      ProjectAssetService,
      ProjectService,
      TeacherDataService,
      UtilService) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$injector = $injector;
    this.$location = $location;
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.ProjectAssetService = ProjectAssetService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.projectId = $stateParams.projectId;
    this.nodeId = $stateParams.nodeId;
    this.showCreateComponent = false;
    this.showEditTransitions = false;
    this.selectedComponent = null;
    this.nodeCopy = null;
    this.undoStack = [];
    this.howToChooseAmongAvailablePathsOptions =
        [null, 'random', 'workgroupId', 'firstAvailable', 'lastAvailable'];
    this.whenToChoosePathOptions =
        [null, 'enterNode', 'exitNode', 'scoreChanged', 'studentDataChanged'];
    this.canChangePathOptions = [null, true, false];
    this.createBranchBranches = [];
    this.showComponents = true;
    this.showStepButtons = true;
    this.showComponentAuthoringViews = true;

    // mapping from component id to whether the component checkbox is checked
    this.componentsToChecked = {};

    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

    // the available constraint actions
    this.constraintActions = [
      {
        value: "",
        text: this.$translate('pleaseChooseAnAction')
      },
      {
        value: "makeAllNodesAfterThisNotVisitable",
        text: this.$translate('makeAllNodesAfterThisNotVisitable')
      },
      {
        value: "makeAllNodesAfterThisNotVisible",
        text: this.$translate('makeAllNodesAfterThisNotVisible')
      },
      {
        value: "makeAllOtherNodesNotVisitable",
        text: this.$translate('makeAllOtherNodesNotVisitable')
      },
      {
        value: "makeAllOtherNodesNotVisible",
        text: this.$translate('makeAllOtherNodesNotVisible')
      },
      {
        value: "makeThisNodeNotVisitable",
        text: this.$translate('makeThisNodeNotVisitable')
      },
      {
        value: "makeThisNodeNotVisible",
        text: this.$translate('makeThisNodeNotVisible')
      }
    ];

    // the available removal conditionals
    this.removalConditionals = [
      {
        value: "all",
        text: this.$translate('all')
      },
      {
        value: "any",
        text: this.$translate('any')
      }
    ];

    // the available removal criteria
    this.removalCriteria = [
      {
        value: "",
        text: this.$translate('pleaseChooseARemovalCriteria')
      },
      {
        value: "isCompleted",
        text: this.$translate('isCompleted'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          }
        ]
      },
      {
        value: "score",
        text: this.$translate('SCORE'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "component",
            text: this.$translate('component')
          },
          {
            value: "scores",
            text: this.$translate('scoresParens')
          }
        ]
      },
      {
        value: "branchPathTaken",
        text: this.$translate('branchPathTaken'),
        params: [
          {
            value: "fromNodeId",
            text: this.$translate('fromStep')
          },
          {
            value: "toNodeId",
            text: this.$translate('toStep')
          }
        ]
      },
      {
        value: "choiceChosen",
        text: this.$translate('choiceChosen'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "componentId",
            text: this.$translate('component')
          },
          {
            value: "choiceIds",
            text: this.$translate('choices')
          }
        ]
      },
      {
        value: "isCorrect",
        text: this.$translate('IS_CORRECT'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "componentId",
            text: this.$translate('component')
          }
        ]
      },
      {
        value: "usedXSubmits",
        text: this.$translate('usedXSubmits'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "componentId",
            text: this.$translate('component')
          },
          {
            value: "requiredSubmitCount",
            text: this.$translate('requiredSubmitCount')
          }
        ]
      },
      {
        value: "isVisible",
        text: this.$translate('isVisible'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          }
        ]
      },
      {
        value: "isVisitable",
        text: this.$translate('isVisitable'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          }
        ]
      },
      {
        value: "isVisited",
        text: this.$translate('isVisited'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          }
        ]
      },
      {
        value: "isPlanningActivityCompleted",
        text: this.$translate('isPlanningActivityCompleted')
      },
      {
        value: "wroteXNumberOfWords",
        text: this.$translate('wroteXNumberOfWords'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "componentId",
            text: this.$translate('component')
          },
          {
            value: "requiredNumberOfWords",
            text: this.$translate('requiredNumberOfWords')
          }
        ]
      },
      {
        value: "addXNumberOfNotesOnThisStep",
        text: this.$translate('addXNumberOfNotesOnThisStep'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "requiredNumberOfNotes",
            text: this.$translate('requiredNumberOfNotes')
          }
        ]
      },
      {
        value: "fillXNumberOfRows",
        text: this.$translate('fillXNumberOfRows'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('step')
          },
          {
            value: "componentId",
            text: this.$translate('component')
          },
          {
            value: "requiredNumberOfFilledRows",
            defaultValue: null,
            text: this.$translate('requiredNumberOfFilledRowsNotIncludingHeaderRow')
          },
          {
            value: "tableHasHeaderRow",
            defaultValue: true,
            text: this.$translate('tableHasHeaderRow')
          },
          {
            value: "requireAllCellsInARowToBeFilled",
            defaultValue: true,
            text: this.$translate('requireAllCellsInARowToBeFilled')
          }
        ]
      }
    ];

    // available transitionCriterias
    this.transitionCriterias = [
      {
        value: "score",
        text: this.$translate('getASpecificScoreOnAComponent'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('nodeID')
          },
          {
            value: "componentId",
            text: this.$translate('componentID')
          },
          {
            value: "scores",
            text: this.$translate('scoresParens')
          }
        ]
      },
      {
        value: "choiceChosen",
        text: this.$translate('chooseASpecificChoiceOnAComponent'),
        params: [
          {
            value: "nodeId",
            text: this.$translate('nodeID')
          },
          {
            value: "componentId",
            text: this.$translate('componentID')
          },
          {
            value: "choiceIds",
            text: this.$translate('choices')
          }
        ]
      }
    ];

    this.branchCriteria = [
      {
        value: "workgroupId",
        text: this.$translate('WORKGROUP_ID')
      },
      {
        value: "score",
        text: this.$translate('SCORE')
      },
      {
        value: "choiceChosen",
        text: this.$translate('choiceChosen')
      },
      {
        value: "random",
        text: this.$translate('random')
      }
    ];

    // the array of component types that can be created
    // TODO: automate by looping through active component types for this WISE instance
    this.componentTypes = [
      {componentType: 'Animation', componentName: this.UtilService.getComponentTypeLabel('Animation')},
      {componentType: 'AudioOscillator', componentName: this.UtilService.getComponentTypeLabel('AudioOscillator')},
      {componentType: 'ConceptMap', componentName: this.UtilService.getComponentTypeLabel('ConceptMap')},
      {componentType: 'Discussion', componentName: this.UtilService.getComponentTypeLabel('Discussion')},
      {componentType: 'Draw', componentName: this.UtilService.getComponentTypeLabel('Draw')},
      {componentType: 'Embedded', componentName: this.UtilService.getComponentTypeLabel('Embedded')},
      {componentType: 'Graph', componentName: this.UtilService.getComponentTypeLabel('Graph')},
      {componentType: 'HTML', componentName: this.UtilService.getComponentTypeLabel('HTML')},
      {componentType: 'Label', componentName: this.UtilService.getComponentTypeLabel('Label')},
      {componentType: 'Match', componentName: this.UtilService.getComponentTypeLabel('Match')},
      {componentType: 'MultipleChoice', componentName: this.UtilService.getComponentTypeLabel('MultipleChoice')},
      {componentType: 'OpenResponse', componentName: this.UtilService.getComponentTypeLabel('OpenResponse')},
      {componentType: 'OutsideURL', componentName: this.UtilService.getComponentTypeLabel('OutsideURL')},
      {componentType: 'Summary', componentName: this.UtilService.getComponentTypeLabel('Summary')},
      {componentType: 'Table', componentName: this.UtilService.getComponentTypeLabel('Table')}
    ];

    // select the first component type by default
    this.selectedComponent = this.componentTypes[0].componentType;
    this.node = this.ProjectService.getNodeById(this.nodeId);

    // get the step number e.g. 1.3
    this.nodePosition = this.ProjectService.getNodePositionById(this.nodeId);

    // get the components in the node
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

    /*
     * remember a copy of the node at the beginning of this node authoring
     * session in case we need to roll back if the user decides to
     * cancel/revert all the changes.
     */
    this.originalNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

    /*
     * remember the current version of the node. this will be updated each
     * time the user makes a change.
     */
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

    // populate the branch authoring if any
    this.populateBranchAuthoring();

    // create the summernote rubric element id
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId;

    // the tooltip text for the insert WISE asset button
    let insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    let insertAssetButton = this.UtilService.createInsertAssetButton(
        this, null, this.nodeId, null, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
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
      }
    };

    /*
     * inject the asset paths into the rubric html and set the summernote
     * rubric html
     */
    this.summernoteRubricHTML =
        this.ProjectService.replaceAssetPaths(this.node.rubric);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     * TODO refactor too many nesting
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null) {
        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == null) {
          // the asset was selected for this component
          if (args.assetItem != null && args.assetItem.fileName != null) {
            let fileName = args.assetItem.fileName;
            /*
             * get the assets directory path
             * e.g.
             * /wise/curriculum/3/
             */
            let assetsDirectoryPath =
                this.ConfigService.getProjectAssetsDirectoryPath();
            let fullAssetPath = assetsDirectoryPath + '/' + fileName;

            if (args.target == 'rubric') {
              // the target is the summernote rubric element
              let summernoteId = 'summernoteRubric_' + this.nodeId;

              if (this.UtilService.isImage(fileName)) {
                /*
                 * move the cursor back to its position when the asset chooser
                 * popup was clicked
                 */
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                // add the image html
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
              } else if (this.UtilService.isVideo(fileName)) {
                /*
                 * move the cursor back to its position when the asset chooser
                 * popup was clicked
                 */
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                // insert the video element
                let videoElement = document.createElement('video');
                videoElement.controls = 'true';
                videoElement.innerHTML =
                    '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
              }
            }
          }
        }
      }

      // close the popup
      this.$mdDialog.hide();
    });

    this.$scope.$on('componentShowSubmitButtonValueChanged', (event, args) => {
      let showSubmitButton = args.showSubmitButton;
      if (showSubmitButton) {
        /*
         * a component is showing their submit button so we will hide
         * the step save button and submit buttons
         */
        this.node.showSaveButton = false;
        this.node.showSubmitButton = false;

        // turn on the save buttons for all components in this step
        this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
      } else {
        /*
         * a component is hiding their submit button so we may need
         * to show the step save button
         */
        if (this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.node.id)) {
          /*
           * there is at least one component in the step that is showing
           * their submit button so we will show the save button on
           * all the components
           */

          // turn on the save buttons for all components in this step
          this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
        } else {
          /*
           * no components in this step show their submit button so we
           * will show the step save button
           */
          this.node.showSaveButton = true;
          this.node.showSubmitButton = false;

          // turn off the save buttons for all the components
          this.ProjectService.turnOffSaveButtonForAllComponents(this.node);
        }
      }

      // save changes
      this.authoringViewNodeChanged();
    });

    if (this.$state.current.name == 'root.project.nodeConstraints') {
      this.$timeout(() => {
        this.nodeAuthoringViewButtonClicked('advanced');
        this.$timeout(() => {
          this.nodeAuthoringViewButtonClicked('editConstraints');
        });
      });
    }

    if (this.$state.current.name == 'root.project.nodeEditPaths') {
      this.$timeout(() => {
        this.nodeAuthoringViewButtonClicked('advanced');
        this.$timeout(() => {
          this.nodeAuthoringViewButtonClicked('editTransitions');
        });
      });
    }

    this.scrollToTopOfPage();

    let data = {
      "title": this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId)
    };

    if (this.ProjectService.isGroupNode(this.nodeId)) {
      this.saveEvent('activityViewOpened', 'Navigation', data);
    } else {
      this.saveEvent('stepViewOpened', 'Navigation', data);
    }
  }

  /**
   * Populate the branch authoring
   * TODO refactor too much nesting
   */
  populateBranchAuthoring() {
    if (this.node.transitionLogic != null) {
      // clear the create branch branches so we can populate them again
      this.createBranchBranches = [];

      // get the number of branches
      if (this.node.transitionLogic.transitions != null) {
        this.createBranchNumberOfBranches = this.node.transitionLogic.transitions.length;
      } else {
        this.createBranchNumberOfBranches = 0;
      }

      for (let t = 0; t < this.node.transitionLogic.transitions.length; t++) {
        let transition = this.node.transitionLogic.transitions[t];

        if (transition != null) {

          // create a branch object to hold all the related information for that branch
          let branch = {};

          // set the branch number for display purposes
          branch.number = t + 1;

          /*
           * set the mapping of all the ids to order for use when choosing which items are
           * in the branch path
           */
          branch.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

          // an array that will hold all the checked items in the branch path
          branch.checkedItemsInBranchPath = [];

          // set the transition into the branch so we can access it easily later
          branch.transition = transition;

          // add the branch to the array of branches
          this.createBranchBranches.push(branch);

          // get the transition criteria
          let criteria = transition.criteria;

          if (criteria != null) {
            for (let criterion of criteria) {
              if (criterion != null) {
                let name = criterion.name;
                let params = criterion.params;

                if (params != null) {
                  // get the node id and component id params if any
                  this.createBranchNodeId = params.nodeId;
                  this.createBranchComponentId = params.componentId;
                }

                if (name == 'score') {
                  // this is a score criteria

                  // set the branch criterion to score
                  this.createBranchCriterion = 'score';

                  if (params != null && params.scores != null) {
                    // set the scores into the branch object
                    branch.scores = params.scores;
                  }
                } else if (name == 'choiceChosen') {
                  // this is a choice chosen criteria

                  // set the branch criterion to choice chosen
                  this.createBranchCriterion = 'choiceChosen';

                  if (params != null && params.choiceIds != null && params.choiceIds.length > 0) {
                    // set the choice id into the branch object
                    branch.choiceId = params.choiceIds[0];
                  }

                  // get the choices from the component
                  let choices = this.ProjectService.getChoicesByNodeIdAndComponentId(this.createBranchNodeId, this.createBranchComponentId);

                  if (choices != null) {
                    // set the choices into the branch object
                    branch.choices = this.UtilService.makeCopyOfJSONObject(choices);
                  }
                }
              }
            }
          }

          // get the node ids in the branch path
          let nodeIdsInBranch = this.ProjectService
              .getNodeIdsInBranch(this.nodeId, transition.to);
          for (let nodeId of nodeIdsInBranch) {
            let item = branch.items[nodeId];
            if (item != null) {
              // make the item checked
              item.checked = true;

              // add the item to the array of checked items in this branch path
              branch.checkedItemsInBranchPath.push(item);
            }
          }

          // set the node ids in branch array into the branch object
          branch.nodeIdsInBranch = nodeIdsInBranch;

          if (nodeIdsInBranch.length > 0) {
            // get the last node id in the branch path
            let lastNodeIdInBranch = nodeIdsInBranch[nodeIdsInBranch.length - 1];

            if (lastNodeIdInBranch != null) {
              let transitionsFromLastNode = this.ProjectService
                  .getTransitionsByFromNodeId(lastNodeIdInBranch);
              if (transitionsFromLastNode != null &&
                  transitionsFromLastNode.length > 0) {
                let transition = transitionsFromLastNode[0];
                if (transition != null) {
                  this.createBranchMergePointNodeId = transition.to;
                }
              }
            }
          }
        }
      }

      if (this.createBranchCriterion == null) {
        /*
         * we have not been able to determine the branch criterion yet
         * so we will look at the howToChooseAmongAvailablePaths field
         */
        if (this.node.transitionLogic.howToChooseAmongAvailablePaths == 'workgroupId') {
          // set the branch criterion to workgroup id
          this.createBranchCriterion = 'workgroupId';
        } else if (this.node.transitionLogic.howToChooseAmongAvailablePaths == 'random') {
          // set the branch criterion to random
          this.createBranchCriterion = 'random';
        }
      }
    }
  }

  /**
   * Launch VLE with this current step as the initial step
   */
  previewStepInNewWindow() {
    const data = { 'constraints': true };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}` +
        `#!/project/${this.projectId}/${this.nodeId}`);
  };

  /**
   * Launch VLE with this current step as the initial step without constraints
   */
  previewStepWithoutConstraintsInNewWindow() {
    const data = { 'constraints': false };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}` +
        `?constraints=false#!/project/${this.projectId}/${this.nodeId}`);
  };

  /**
   * Close the node authoring view
   */
  close() {
    this.$scope.$broadcast('exitNode', {nodeToExit: this.node});
    this.TeacherDataService.setCurrentNode(null);
    this.$state.go('root.project', {projectId: this.projectId});
    this.scrollToTopOfPage();
  };

  /**
   * Display an error saving during advanced authoring, most-likely due to malformed JSON
   */
  showSaveErrorAdvancedAuthoring() {
    alert(this.$translate('saveErrorAdvancedAuthoring'));
  }

  /**
   * The author has clicked the cancel button which will revert all
   * the recent changes since they opened the node.
   */
  cancel() {
    // check if the user has made any changes
    if (!angular.equals(this.node, this.originalNodeCopy)) {
      // the user has made changes
      if (confirm(this.$translate('confirmUndo'))) {
        // revert the node back to the previous version
        this.ProjectService.replaceNode(this.nodeId, this.originalNodeCopy);
        this.ProjectService.saveProject();
        this.close();
      }
    } else {
      // the user has not made any changes, so close the node authoring view
      this.close();
    }
  }

  /**
   * Add a new transition for this node.
   */
  addNewTransition() {
    if (this.node.transitionLogic.transitions == null) {
      this.node.transitionLogic.transitions = [];
    }
    let nodeTransitions = this.node.transitionLogic.transitions;
    if (nodeTransitions.length > 0) {
      // If this node already has transitions, copy the last one.
      let lastNodeTransition = nodeTransitions[nodeTransitions.length - 1];
      let newTransition = {
        "to": lastNodeTransition.to
      };
      nodeTransitions.push(newTransition);
    } else {
      // Otherwise set the new transition to the current nodeId
      let newTransition = {
        "to": this.nodeId
      };
      nodeTransitions.push(newTransition);
    }

    if (nodeTransitions.length > 1) {
      /*
       * there is more than one transition so we will set default values
       * for the transition logic parameters if they haven't already been
       * set
       */
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
    // save changes
    this.authoringViewNodeChanged();
  }

  /**
   * The transition to node id has changed so need to recalculate the step
   * numbers
   */
  authoringViewTransitionToNodeIdChanged() {
    /*
     * update the node numbers now that a step has been added to a branch path
     * e.g. if this is a branching step that is called
     * 1.5 B View the Potential Energy
     * then the node number is 1.5 B
    */
    this.ProjectService.calculateNodeNumbers();

    // save changes
    this.authoringViewNodeChanged();
  }

  /**
   * Add a new transition criteria for the specified transition.
   */
  addNewTransitionCriteria(transition) {
    let nodeTransitions = this.node.transitionLogic.transitions;
    for (let nodeTransition of nodeTransitions) {
      if (nodeTransition == transition) {
        if (nodeTransition.criteria == null) {
          nodeTransition.criteria = [];
        }
        let newTransitionCriteria = {
          "name":"",
          "params": {
            "nodeId": "",
            "componentId": ""
          }
        };
        nodeTransition.criteria.push(newTransitionCriteria);
      }
    }
    // save changes
    this.authoringViewNodeChanged();
  }

  /**
   * The transition criteria node id changed so we will update the params
   * accordingly.
   * @param transitionCriteria the transition criteria object that changed
   */
  transitionCriteriaNodeIdChanged(transitionCriteria) {
    if (transitionCriteria!= null && transitionCriteria.params != null) {
      // remember the node id
      let nodeId = transitionCriteria.params.nodeId;

      // clear the params
      transitionCriteria.params = {};

      if (nodeId != null) {
        // set the node id back into the params
        transitionCriteria.params.nodeId = nodeId;
      }
    }

    // save the node
    this.authoringViewNodeChanged();
  }

  /**
   * The transition criteria component id changed so we will update the params
   * accordingly.
   * @param transitionCriteria the transition criteria object that changed
   */
  transitionCriteriaComponentIdChanged(transitionCriteria) {
    if (transitionCriteria!= null && transitionCriteria.params != null) {
      // remember the node id and component id
      let nodeId = transitionCriteria.params.nodeId;
      let componentId = transitionCriteria.params.componentId;

      // clear the params
      transitionCriteria.params = {};

      if (nodeId != null) {
        // set the node id back into the params
        transitionCriteria.params.nodeId = nodeId;
      }

      if (componentId != null) {
        // set the component id back into the params
        transitionCriteria.params.componentId = componentId;
      }
    }

    // save the node
    this.authoringViewNodeChanged();
  }

  /**
   * Deletes the specified transition from this node
   * @param transition the transition to delete
   */
  deleteTransition(transition) {
    let stepTitle = '';
    if (transition != null) {
      stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(transition.to);
    }
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisPath', { stepTitle: stepTitle }));
    if (answer) {
      let nodeTransitions = this.node.transitionLogic.transitions;
      let index = nodeTransitions.indexOf(transition);
      if (index > -1) {
        nodeTransitions.splice(index, 1);
      }
      if (nodeTransitions.length <= 1) {
        /*
         * there is zero or one transition so we will clear the parameters
         * below since they only apply when there are multiple transitions
         */
        this.node.transitionLogic.howToChooseAmongAvailablePaths = null;
        this.node.transitionLogic.whenToChoosePath = null;
        this.node.transitionLogic.canChangePath = null;
        this.node.transitionLogic.maxPathsVisitable = null;
      }
      // save changes
      this.authoringViewNodeChanged();
    }
  }

  /**
   * Save transitions for this node
   */
  saveTransitions() {
    this.ProjectService.saveProject();
    this.showEditTransitions = false;
  }

  /**
   * The add component button was clicked
   */
  addComponentButtonClicked() {
    // select the first component type by default
    this.selectedComponent = this.componentTypes[0].componentType;

    // show the add component UI elements
    this.nodeAuthoringViewButtonClicked('addComponent');

    // turn on add component mode
    this.turnOnAddComponentMode();

    // turn on the move component mode
    this.turnOffMoveComponentMode();

    // turn on the insert component mode
    this.turnOnInsertComponentMode();

    // hide the component authoring
    this.hideComponentAuthoring();
  }

  /**
   * Delete the component from this node
   * @param componentId the component id
   */
  deleteComponent(componentId) {
    if (confirm(this.$translate('confirmDeleteComponent'))) {
      // delete the component from the node
      this.ProjectService.deleteComponent(this.nodeId, componentId);

      // check if we need to show the node save or node submit buttons
      this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();
      this.ProjectService.saveProject();
    }
  }

  /**
   * Hide the save button in all the components
   * TODO refactor too much nesting
   */
  hideAllComponentSaveButtons() {
    let components = this.components;
    if (components != null) {
      for (let component of components) {
        if (component != null) {
          let componentType = component.type;

          // get the service for the component type
          let service = this.$injector.get(componentType + 'Service');
          if (service != null) {
            if (service.componentUsesSaveButton()) {
              /*
               * this component uses a save button so we will hide
               * it
               */
              component.showSaveButton = false;
            }
          }
        }
      }
    }
  }

  /**
   * The node has changed in the authoring view
   * @param parseProject whether to parse the whole project to recalculate
   * significant changes such as branch paths
   */
  authoringViewNodeChanged(parseProject) {
    // put the previous version of the node on to the undo stack
    this.undoStack.push(this.currentNodeCopy);

    // update the current node copy
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

    if (parseProject) {
      // refresh the project
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }

    return this.ProjectService.saveProject();
  }

  /**
   * Undo the last change by reverting the node to the previous version
   */
  undo() {
    if (this.undoStack.length === 0) {
      // the undo stack is empty so there are no changes to undo
      alert(this.$translate('noUndoAvailable'));
    } else if (this.undoStack.length > 0) {
      // the undo stack has elements

      if (confirm(this.$translate('confirmUndoLastChange'))) {
        // perform any node cleanup if necessary
        this.$scope.$broadcast('exitNode', {nodeToExit: this.node});

        // get the previous version of the node
        let nodeCopy = this.undoStack.pop();

        // revert the node back to the previous version
        this.ProjectService.replaceNode(this.nodeId, nodeCopy);

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
    let params = [];
    if (name != null) {
      for (let singleRemovalCriteria of this.removalCriteria) {
        if (singleRemovalCriteria != null) {
          if (singleRemovalCriteria.value == name) {
            /*
             * we have found the removal criteria we are looking for
             * so we will get its params
             */
            params = singleRemovalCriteria.params;
            break;
          }
        }
      }
    }
    return params;
  }

  /**
   * Get the transition criteria params for a transition criteria name
   * @param name a transition criteria name e.g.  'score', 'choiceChosen'
   * @return the params for the given transition criteria name
   */
  getTransitionCriteriaParamsByName(name) {
    let params = [];
    if (name != null) {
      for (let singleTransitionCriteria of this.transitionCriterias) {
        if (singleTransitionCriteria != null &&
            singleTransitionCriteria.value == name) {
          /*
           * we have found the removal criteria we are looking for
           * so we will get its params
           */
          params = singleTransitionCriteria.params;
          break;
        }
      }
    }
    return params;
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
    let component = this.ProjectService
        .getComponentByNodeIdAndComponentId(nodeId, componentId);
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
    let usedConstraintIds = [];
    let node = this.ProjectService.getNodeById(nodeId);
    if (node != null && node.constraints != null) {
      let nodeConstraints = node.constraints;
      for (let constraint of nodeConstraints) {
        if (constraint != null) {
          let constraintId = constraint.id;
          usedConstraintIds.push(constraintId);
        }
      }
    }

    // counter used for finding a constraint id that hasn't been used yet
    let constraintCounter = 1;

    // loop until we have found an unused constraint id
    while (newNodeConstraintId == null) {
      // create a potential constraint id
      let potentialNewNodeConstraintId = nodeId + 'Constraint' + constraintCounter;

      // check if the constraint id has been used already
      if (usedConstraintIds.indexOf(potentialNewNodeConstraintId) == -1) {
        // the constraint id has not been used so we can use it
        newNodeConstraintId = potentialNewNodeConstraintId;
      } else {
        /*
         * the constraint id has been used so we will increment the
         * counter to try another contraint id
         */
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
    // get a new constraint id
    let newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);

    // create the constraint object
    let constraint = {
      "id": newNodeConstraintId,
      "action": '',
      "targetId": this.nodeId,
      "removalConditional": 'any',
      "removalCriteria": []
    };

    // create a removal criteria
    let removalCriteria = {
      "name": '',
      "params": {}
    };

    // add the removal criteria to the constraint
    constraint.removalCriteria.push(removalCriteria);

    // create the constraints array if it does not exist
    if (this.node.constraints == null) {
      this.node.constraints = [];
    }
    this.node.constraints.push(constraint);
    this.ProjectService.saveProject();

    return newNodeConstraintId;
  }

  /**
   * Add a new constraint and then scroll to the bottom of the screen because
   * that's where the new constraint will appear.
   */
  addConstraintAndScrollToBottom() {
    let newNodeConstraintId = this.addConstraint();
    this.$timeout(() => {
      this.$rootScope.$broadcast('scrollToBottom');
      this.UtilService.temporarilyHighlightElement(newNodeConstraintId);
    });
  }

  /**
   * Delete a constraint
   * @param constraintIndex delete the constraint at the index
   */
  deleteConstraint(constraintIndex) {
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConstraint'));
    if (answer) {
      if (constraintIndex != null) {
        let node = this.ProjectService.getNodeById(this.nodeId);
        if (node != null) {
          let constraints = node.constraints;
          if (constraints != null) {
            // remove the constraint at the given index
            constraints.splice(constraintIndex, 1);
          }
        }
      }
      this.ProjectService.saveProject();
    }
  }

  /**
   * Add a removal criteria
   * @param constraint add the removal criteria to this constraint
   */
  addRemovalCriteria(constraint) {
    if (constraint != null) {
      // create the removal criteria
      let removalCriteria = {
        "name": '',
        "params": {}
      };
      // add the removal criteria to the constraint
      constraint.removalCriteria.push(removalCriteria);
    }
    this.ProjectService.saveProject();
  }

  /**
   * Delete a removal criteria from a constraint
   * @param constraint remove the removal criteria from this constraint
   * @param removalCriteriaIndex the index of the removal criteria to remove
   */
  deleteRemovalCriteria(constraint, removalCriteriaIndex) {
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisRemovalCriteria'));
    if (answer) {
      if (constraint != null) {
        // get all the removal criteria
        let removalCriteria = constraint.removalCriteria;
        if (removalCriteria != null) {
          // remove the single removal criteria
          removalCriteria.splice(removalCriteriaIndex, 1);
        }
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
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisRequirement'));
    if (answer) {
      if (transition != null) {
        // get all the transition criteria
        let transitionCriterias = transition.criteria;
        if (transitionCriterias != null) {
          // remove the single transition criteria
          transitionCriterias.splice(transitionCriteriaIndex, 1);
        }
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
    if (criteria != null) {
      // clear the params
      criteria.params = {};

      // get the params for the given criteria name
      let params = this.getRemovalCriteriaParamsByName(criteria.name);
      if (params != null) {
        for (let paramObject of params) {
          if (paramObject != null) {
            let value = paramObject.value;

            if (paramObject.hasOwnProperty('defaultValue')) {
              criteria.params[value] = paramObject.defaultValue;
            } else {
              criteria.params[value] = '';
            }

            if (value == 'nodeId') {
              // default the node id param to this node
              criteria.params[value] = this.nodeId;
            }
          }
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
    if (transitionCriteria != null) {
      let nodeId = null;
      let componentId = null;

      if (transitionCriteria.params != null) {
        // remember the node id and component id
        nodeId = transitionCriteria.params.nodeId;
        componentId = transitionCriteria.params.componentId;
      }

      // clear the params
      transitionCriteria.params = {};

      if (nodeId != null) {
        // set the node id back into the params
        transitionCriteria.params.nodeId = nodeId;
      }

      if (componentId != null) {
        // set the component id back into the params
        transitionCriteria.params.componentId = componentId;
      }
    }
    this.authoringViewNodeChanged();
  }

  /**
   * A button to author a specific view of the node was clicked
   * @param view the view name
   */
  nodeAuthoringViewButtonClicked(view) {
    if (view == 'addComponent') {
      // toggle the add component view and hide all the other views
      this.showCreateComponent = !this.showCreateComponent;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = true;
      this.showComponents = true;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'generalAdvanced') {
      // toggle the edit transitions view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = !this.showGeneralAdvanced;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubricButton = false;
      this.showCreateBranch = false;
      //this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'editTransitions') {
      // toggle the edit transitions view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = !this.showEditTransitions;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubricButton = false;
      this.showCreateBranch = false;
      //this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'editConstraints') {
      // toggle the edit constraints view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = !this.showConstraints;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      //this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'editButtons') {
      // toggle the edit buttons view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = !this.showEditButtons;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'editRubric') {
      // toggle the edit buttons view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = !this.showRubric;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'createBranch') {
      // toggle the edit buttons view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = !this.showCreateBranch;
      //this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'previousNode') {
      // hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
      let prevNodeId = this.ProjectService.getPreviousNodeId(this.nodeId);
      if (prevNodeId != null) {
        // there is a previous node id so we will go to it
        this.$state.go('root.project.node', {projectId: this.projectId, nodeId:prevNodeId});
      } else {
        // there is no previous node id so we will display a message
        let thereIsNoPreviousStep = this.$translate('thereIsNoPreviousStep');
        alert(thereIsNoPreviousStep);
      }
    } else if (view == 'nextNode') {
      // hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
      let nextNodeId = this.ProjectService.getNextNodeId(this.nodeId);
      if (nextNodeId != null) {
        // there is a next node id so we will go to it
        this.$state.go('root.project.node', {projectId: this.projectId, nodeId:nextNodeId});
      } else {
        // there is no next node id so we will display a message
        let thereIsNoNextStep = this.$translate('thereIsNoNextStep');
        alert(thereIsNoNextStep);
      }
    } else if (view == 'advanced') {
      // toggle the advanced view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = !this.showAdvanced;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'copy') {
      // toggle the copy view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = true;
      this.showComponents = true;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'move') {
      // toggle the move view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = true;
      this.showComponents = true;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'import') {
      // toggle the import view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = !this.showImportView;
      this.showStepButtons = false;
      this.showComponents = true;
      this.showJSON = false;
      this.UtilService.hideJSONValidMessage();
    } else if (view == 'showJSON') {
      // toggle the import view and hide all the other views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      //this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = false;
      this.showComponents = false;
      if (this.showJSON) {
        // we were showing the JSON view and the author now wants to hide it
        if (!this.isJSONValid()) {
          if (confirm(this.$translate('jsonInvalidErrorMessage'))) {
            // the author wants to revert back to the last valid JSON
            this.toggleJSONAuthoringView();
            this.UtilService.hideJSONValidMessage();
          }
        } else {
          this.toggleJSONAuthoringView();
          this.UtilService.hideJSONValidMessage();
        }
      } else {
        // we were not showing the JSON view and now the author wants to show it
        this.toggleJSONAuthoringView();
        this.authoringNodeContentJSONString = angular.toJson(this.node, 4);
        this.UtilService.showJSONValidMessage();
      }
    } else {
      // hide all the views
      this.showCreateComponent = false;
      this.showGeneralAdvanced = false;
      this.showEditTransitions = false;
      this.showConstraints = false;
      this.showEditButtons = false;
      this.showRubric = false;
      this.showCreateBranch = false;
      this.showAdvanced = false;
      this.showImportView = false;
      this.showStepButtons = true;
      this.showComponents = true;
      this.showJSON = false;
    }
  }

  isJSONValid() {
    try {
      angular.fromJson(this.authoringNodeContentJSONString);
      return true;
    } catch(e) {
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
    if (this.createBranchNumberOfBranches == 0) {
      // the author has set the number of branch paths to 0 which is not allowed
      alert(this.$translate('errorYouCantHave0BranchPaths'));

      // revert the number of branch paths value
      this.createBranchNumberOfBranches = this.createBranchBranches.length;
    } else if (this.createBranchNumberOfBranches < this.createBranchBranches.length) {
      /*
       * the author is reducing the number of branches so we want to
       * confirm they want to do so
       */
      let answer = confirm(this.$translate('areYouSureYouWantToReduceTheNumberOfBranchesToX', {createBranchNumberOfBranches:this.createBranchNumberOfBranches}));

      if (answer) {
        if (this.createBranchNumberOfBranches == 1) {
          /*
           * the author has removed all the branch paths so we will
           * remove the branch
           */
          this.removeBranch();
        } else {
          /*
           * the author is reducing the number of branch paths but
           * not removing all of them
           */
          for (let bp = 0; bp < this.createBranchBranches.length; bp++) {
            if (bp >= this.createBranchNumberOfBranches) {
              // this is a branch we want to remove
              let branch = this.createBranchBranches[bp];
              this.removeBranchPath(branch);

              /*
               * decrement the counter back one because we have
               * just removed a branch path
               */
              bp--;
            }
          }
        }
      } else {
        // they answered no so we will revert the number of branches value
        this.createBranchNumberOfBranches = this.createBranchBranches.length;
      }
    } else if (this.createBranchNumberOfBranches > this.createBranchBranches.length) {
      // the author is increasing the number of branches
      if (this.createBranchCriterion == null) {
        /*
         * we will default the branching to be based on workgroup id
         * since that is what our researchers use most often
         */
        this.createBranchCriterion = 'workgroupId';
        this.createBranchCriterionChanged();
      }

      // loop for the number of branches and create new branches objects
      for (let b = 0; b < this.createBranchNumberOfBranches; b++) {
        if (b >= this.createBranchBranches.length) {
          /*
           * we do not have a branch object for this branch number so
           * we will create it
           */

          // create the branch object
          let branch = {};

          // set the branch number
          branch.number = b + 1;

          /*
           * set the mapping of all the ids to order for use when choosing which items are
           * in the branch path
           */
          branch.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

          // add the branch to the array of branches
          this.createBranchBranches.push(branch);

          // create a transition to represent the branch
          let transition = {};

          if (this.createBranchCriterion == 'score') {
            // the branch is based on score

            // create a score criterion
            let criterion = {
              "name": this.createBranchCriterion,
              "params": {
                "scores": []
              }
            };

            if (this.createBranchNodeId != null) {
              // set the node for which to look for the score
              criterion.params.nodeId = this.createBranchNodeId;
            }

            if (this.createBranchComponentId != null) {
              // set the component for which to look for the score
              criterion.params.componentId = this.createBranchComponentId;
            }

            transition.criteria = [criterion];
          } else if (this.createBranchCriterion == 'choiceChosen') {
            // the branch is based on choice chosen
            let criterion = {};
            criterion.name = this.createBranchCriterion;
            criterion.params = {};
            criterion.params.choiceIds = [];

            if (this.createBranchNodeId != null) {
              // set the node for which to look for the score
              criterion.params.nodeId = this.createBranchNodeId;
            }

            if (this.createBranchComponentId != null) {
              // set the component for which to look for the score
              criterion.params.componentId = this.createBranchComponentId;
            }

            transition.criteria = [criterion];
          } else if (this.createBranchCriterion == 'workgroupId') {
            // workgroup id branching does not require a transition criterion
          } else if (this.createBranchCriterion == 'random') {
            // random branching does not require a transition criterion
          }

          // add the transition
          this.node.transitionLogic.transitions.push(transition);

          // save a reference to the transition in the branch
          branch.transition = transition;
        }
      }
    }
    this.authoringViewNodeChanged();
  }

  /**
   * The branch criterion has changed
   */
  createBranchCriterionChanged() {
    if (this.createBranchCriterion != null) {
      let nodeId = this.node.id;
      if (this.createBranchCriterion == 'workgroupId') {
        // the branch is based on workgroup id
        this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', 'workgroupId');
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'enterNode');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion == 'score') {
        // the branch is based on score
        this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', 'random');
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'studentDataChanged');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion == 'choiceChosen') {
        // the branch is based on choice chosen
        this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', 'random');
        this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', 'studentDataChanged');
        this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', false);
        this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', 1);
      } else if (this.createBranchCriterion == 'random') {
        // the branch is based on random assignment
        this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', 'random');
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

  /**
   * The create branch node id has changed
   */
  createBranchNodeIdChanged() {
    this.createBranchComponentId = null;
    let selectedNode = this.ProjectService.getNodeById(this.createBranchNodeId);
    if (selectedNode != null) {
      let components = selectedNode.components;
      if (components != null) {
        if (components.length == 1) {
          /*
           * there is only one component in the node so we will
           * automatically select it in the drop down
           */
          let component = components[0];
          this.createBranchComponentId = component.id;
        }
      }
    }

    /*
     * update the transitions so that they have the necessary parameter
     * fields for the given branch criterion
     */
    this.createBranchUpdateTransitions();

    // save the project
    this.authoringViewNodeChanged();
  }

  /**
   * The create branch component id has changed
   */
  createBranchComponentIdChanged() {

    /*
     * update the transitions so that they have the necessary parameter
     * fields for the given branch criterion
     */
    this.createBranchUpdateTransitions();

    // save the project
    this.authoringViewNodeChanged();
  }

  /**
   * Update the transitions so that they have the necessary parameter
   * fields for the given branch criterion
   */
  createBranchUpdateTransitions() {
    for (let b = 0; b < this.createBranchBranches.length; b++) {
      let branch = this.createBranchBranches[b];
      if (branch != null) {
        // get the transition corresponding to the branch
        let transition = branch.transition;
        if (transition != null) {
          if (this.createBranchCriterion == 'choiceChosen') {
            // we are branching based on choice chosen

            // clear the criteria array
            transition.criteria = [];

            // create a new choice chosen criterion
            let criterion = {
              "name": 'choiceChosen',
              "params": {
                "nodeId": this.createBranchNodeId,
                "componentId": this.createBranchComponentId,
                "choiceIds": []
              }
            };

            // add the criterion to the array of criteria
            transition.criteria.push(criterion);

            /*
             * clear the choice id. we will set the choice id in
             * the branch object when we call createBranchUpdateChoiceChosenIds()
             */
            branch.choiceId = null;

            /*
             * clear the scores since we don't need it in choice
             * chosen branching
             */
            branch.scores = null;
          } else if (this.createBranchCriterion == 'score') {
            // we are branching based on score

            // clear the criteria array
            transition.criteria = [];

            // create a new score criterion
            let criterion = {
              "name": 'score',
              "params": {
                "nodeId": this.createBranchNodeId,
                "componentId": this.createBranchComponentId,
                "scores": []
              },
            };

            // re-use scores if available

            // add the criterion to the array of criteria
            transition.criteria.push(criterion);

            /*
             * clear the choice id since we don't need it in score
             * branching
             */
            branch.choiceId = null;

            // set the scores into the branch object
            branch.scores = criterion.params.scores;
          } else if (this.createBranchCriterion == 'workgroupId') {
            // we are branching based on workgroup id

            /*
             * remove the criteria array since it is not used for
             * branching based on workgroup id
             */
            delete transition['criteria'];

            // clear the node id and component id
            this.createBranchNodeId = null;
            this.createBranchComponentId = null;

            /*
             * clear the choice id and scores fields since we don't
             * need them in workgroup id branching
             */
            branch.choiceId = null;
            branch.scores = null;
          } else if (this.createBranchCriterion == 'random') {
            // we are branching based on random assignment

            /*
             * remove the criteria array since it is not used for
             * branching based on random assignment
             */
            delete transition['criteria'];

            // clear the node id and component id
            this.createBranchNodeId = null;
            this.createBranchComponentId = null;

            /*
             * clear the choice id and scores fields since we don't
             * need them in random branching
             */
            branch.choiceId = null;
            branch.scores = null;
          }
        }
      }
    }

    if (this.createBranchCriterion == 'choiceChosen') {
      /*
       * the branching is based on choice chosen so we will populate the
       * choice ids
       */
      this.createBranchUpdateChoiceChosenIds();
    }
  }

  /**
   * Automatically populate the selected choices if the branch is based on
   * choice chosen and the selected component is a multiple choice component
   * TODO refactor too many nesting
   */
  createBranchUpdateChoiceChosenIds() {
    let nodeId = this.createBranchNodeId;
    let componentId = this.createBranchComponentId;
    let component = this.ProjectService
        .getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      if (component.type == 'MultipleChoice') {
        // populate the drop down with the choices
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
    let nodeId = this.createBranchNodeId;
    let componentId = this.createBranchComponentId;

    // get the choices from the component
    let choices = component.choices;

    if (choices != null) {

      // loop through all the choices
      for (let c = 0; c < choices.length; c++) {
        let choice = choices[c];
        if (choice != null) {

          // get the fields of the choice
          let id = choice.id;
          let text = choice.text;
          let feedback = choice.feedback;
          let isCorrect = choice.isCorrect;

          // get the branch that corresponds to the choice
          let branch = this.createBranchBranches[c];

          if (branch != null) {
            // get the choice for this branch
            branch.choiceId = id;

            // make a copy of the choices from the component
            branch.choices = this.UtilService.makeCopyOfJSONObject(choices);

            // get the transition corresponding to the branch
            let transition = branch.transition;

            if (transition != null) {

              /*
               * get the first transition criterion. we will assume
               * there is only one transition criterion
               */
              let criterion = transition.criteria[0];

              if (criterion != null) {

                // get the params
                let params = criterion.params;

                if (params != null) {

                  // set the node id and component id
                  params.nodeId = nodeId;
                  params.componentId = componentId;

                  if (this.createBranchCriterion == 'choiceChosen') {
                    // set the choice id
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
  }

  /**
   * A step was clicked in the create branch authoring view
   * @param branch the branch path
   * @param item the step that was clicked
   * TODO refactor function too long
   */
  createBranchStepClicked(branch, item) {
    // get all the steps in order
    let orderedItems = this.$filter('orderBy')(this.$filter('toArray')(branch.items), 'order');

    // an array that will hold the items that were checked
    branch.checkedItemsInBranchPath = [];
    let checkedItemsInBranchPath = branch.checkedItemsInBranchPath;

    // an array that will hold the node ids that were checked
    branch.nodeIdsInBranch = [];

    // used to hold the previously checked node id
    let previousCheckedNodeId = null;

    // the node id after the node that was clicked
    let nodeIdAfter = null;

    /*
     * loop through all the items in order and set the transitions so that
     * the steps in a branch path transition to one after the other
     */
    for (var i = 0; i < orderedItems.length; i++) {
      var orderedItem = orderedItems[i];
      if (orderedItem != null && orderedItem.checked) {
        if (previousCheckedNodeId != null) {
          // make the previous node id point to the current item
          let previousCheckedNode = this.ProjectService.getNodeById(previousCheckedNodeId);
          if (previousCheckedNode != null) {
            // get the transition logic
            let transitionLogic = previousCheckedNode.transitionLogic;
            if (transitionLogic != null) {
              if (transitionLogic.transitions != null) {
                // clear the transitions
                transitionLogic.transitions = [];

                // create a new transition object to the current item
                let transition = {
                  "to": orderedItem.$key
                };
                // add the transition
                transitionLogic.transitions.push(transition);
              }
            }
          }
        }

        // add the item to the checked items array
        checkedItemsInBranchPath.push(orderedItem);

        // add the node id to the array of node ids in the branch path
        branch.nodeIdsInBranch.push(orderedItem.$key);

        // remember the previously checked node id
        previousCheckedNodeId = orderedItem.$key;
      }

      // get the previous ordered item (checked or unchecked)
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

      /*
       * this is the last node in the branch path so we will make it
       * transition to the merge point
       */
      let node = this.ProjectService.getNodeById(previousCheckedNodeId);
      if (node != null) {
        let transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          if (transitionLogic.transitions != null) {
            // clear the transitions
            transitionLogic.transitions = [];

            // make a transition to the merge point
            let transition = {};
            transition.to = this.createBranchMergePointNodeId;

            // add the transition
            transitionLogic.transitions.push(transition);
          }
        }
      }
    }

    // get the branch number
    let branchNumber = branch.number;

    // get the node id that was clicked
    let nodeId = item.$key;

    // get the transition that corresponds to the branch
    let transition = this.node.transitionLogic.transitions[branchNumber - 1];

    let firstNodeId = null;

    /*
     * update the branch point transition in case the first step in the
     * branch path has changed
     */
    if (transition != null) {

      if (checkedItemsInBranchPath.length == 0) {
        // there are no steps in the path
        transition.to = null;
      } else {
        // get the first step in the path
        let firstCheckedItem = checkedItemsInBranchPath[0];

        if (firstCheckedItem != null) {
          // set the branch point transition to the first step in the path
          firstNodeId = firstCheckedItem.$key;
          transition.to = firstNodeId;
        }
      }
    }

    // get the node that was clicked
    let node = this.ProjectService.getNodeById(nodeId);

    if (node != null) {
      this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);

      if (item.checked) {
        // the item was checked so we will add the branch path taken constraints to it

        /*
         * the branch path taken constraints will be from this node to
         * the first node in the branch path
         */
        let fromNodeId = this.nodeId;
        let toNodeId = firstNodeId;

        // add the branch path taken constraints
        this.ProjectService.addBranchPathTakenConstraints(nodeId, fromNodeId, toNodeId);
      } else {
        /*
         * the item was unchecked so we will change its transition to
         * point to the node that comes right after it
         */
        this.ProjectService.setTransition(nodeId, nodeIdAfter);
      }
    }

    /*
     * update the constraints of other steps in the branch path if necessary.
     * loop through all theh checked items in the path
     */
    for (let item of checkedItemsInBranchPath) {
      let itemNodeId = item.$key;
      this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(itemNodeId);

      /*
       * the branch path taken constraints will be from this node to
       * the first node in the branch path
       */
      let fromNodeId = this.nodeId;
      let toNodeId = firstNodeId;

      // add the branch path taken constraints
      this.ProjectService.addBranchPathTakenConstraints(itemNodeId, fromNodeId, toNodeId);
    }

    /*
     * update the node numbers now that a step has been added to a branch path
     * e.g. if this is a branching step that is called
     * 1.5 B View the Potential Energy
     * then the node number is 1.5 B
     */
    this.ProjectService.calculateNodeNumbers();
    this.authoringViewNodeChanged();
  }

  /**
   * The score for a path has changed in the branch authoring
   * @param branch the branch for which the score has changed
   * TODO refactor too many nesting
   */
  createBranchScoreChanged(branch) {
    if (branch != null) {
      let transition = branch.transition;
      if (transition != null) {
        let scores = branch.scores;
        if (scores != null) {
          let criteria = transition.criteria;
          if (criteria != null) {
            // get the first criteria. we will assume there is only one criteria
            let criterion = criteria[0];
            if (criterion != null) {
              // get the params of the criterion
              let params = criterion.params;
              if (params != null) {
                // update the scores into the params
                params.scores = scores;
              }
            }
          }
        }
      }
    }

    // save the project
    this.authoringViewNodeChanged();
  }

  /**
   * The merge point has changed in the branch authoring
   * TODO refactor too many nesting
   */
  createBranchMergePointNodeIdChanged() {
    // get the merge point node id
    let createBranchMergePointNodeId = this.createBranchMergePointNodeId;
    let branches = this.createBranchBranches;
    for (let branch of branches) {
      if (branch != null) {
        // get the node ids in the branch path
        let nodeIdsInBranch = branch.nodeIdsInBranch;
        if (nodeIdsInBranch != null && nodeIdsInBranch.length > 0) {
          // get the last node id in the branch path
          let lastNodeIdInBranchPath = nodeIdsInBranch[nodeIdsInBranch.length - 1];
          if (lastNodeIdInBranchPath != null) {
            // get the last node in the branch path
            let lastNodeInBranchPath =
                this.ProjectService.getNodeById(lastNodeIdInBranchPath);
            if (lastNodeInBranchPath != null) {
              // get the transition logic of the last node
              let transitionLogic = lastNodeInBranchPath.transitionLogic;
              if (transitionLogic != null) {
                if (transitionLogic.transitions != null) {
                  // clear the transitions
                  transitionLogic.transitions = [];

                  // make a new transition to the merge point
                  let transition = {
                    "to": createBranchMergePointNodeId
                  };
                  // add the transition
                  transitionLogic.transitions.push(transition);
                }
              }
            }
          }
        }
      }
    }

    /*
     * calculate the node numbers
     * e.g. if the step is called
     * 1.5 View the Potential Energy
     * then the node number is 1.5
     */
    this.ProjectService.calculateNodeNumbers();

    // save the project
    let parseProject = true;
    this.authoringViewNodeChanged(parseProject);
  }

  /**
   * Remove the branch after confirming with the user
   */
  removeBranchButtonClicked() {
    if (confirm(this.$translate('areYouSureYouWantToRemoveTheBranch'))) {
      this.removeBranch();
    }
  }

  /**
   * Remove the branch from the step by removing all the branch paths
   */
  removeBranch() {
    for (let bp = 0; bp < this.createBranchBranches.length; bp++) {
      // remove a branch path
      let branchPath = this.createBranchBranches[bp];
      this.removeBranchPath(branchPath);

      /*
       * shift the counter back one because we have just removed a branch
       * path
       */
      bp--;
    }

    // get the node id of this node (which is the branch point)
    let nodeId = this.node.id;

    // get the node id that comes after this node
    let nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);

    /*
     * update the transition of this step to point to the next step
     * in the project. this may be different than the next step
     * if it was still the branch point.
     */
    this.ProjectService.setTransition(nodeId, nodeIdAfter);

    // clear the transition logic fields
    this.ProjectService.setTransitionLogicField(nodeId, 'howToChooseAmongAvailablePaths', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'whenToChoosePath', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'canChangePath', null);
    this.ProjectService.setTransitionLogicField(nodeId, 'maxPathsVisitable', null);

    // clear the branch authoring fields
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
    let branch = {};

    // set the branch number for display purposes
    branch.number = 1;

    /*
     * set the mapping of all the ids to order for use when choosing which items are
     * in the branch path
     */
    branch.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

    // an array that will hold all the checked items in the branch path
    branch.checkedItemsInBranchPath = [];

    let transition = null;

    // get the transition from the node
    let transitions = this.ProjectService.getTransitionsByFromNodeId(nodeId);

    if (transitions != null && transitions.length > 0) {
      transition = transitions[0];
    }

    // set the transition into the branch so we can access it easily later
    branch.transition = transition;

    // add the branch to the array of branches
    this.createBranchBranches.push(branch);

    /*
     * calculate the node numbers
     * e.g. if the step is called
     * 1.5 View the Potential Energy
     * then the node number is 1.5
     */
    this.ProjectService.calculateNodeNumbers();

    // save the project
    let parseProject = true;
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
    if (branch != null) {
      // get the checked items in the branch path
      let checkedItemsInBranchPath = branch.checkedItemsInBranchPath;
      if (checkedItemsInBranchPath != null) {
        for (let checkedItem of checkedItemsInBranchPath) {
          if (checkedItem != null) {
            // get the node id of the checked item
            let nodeId = checkedItem.$key;
            this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);

            /*
             * update the transition of the step to point to the next step
             * in the project. this may be different than the next step
             * if it was still in the branch path.
             */
            let nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);
            this.ProjectService.setTransition(nodeId, nodeIdAfter);
          }
        }
      }
      // get the index of the branch path
      let branchPathIndex = this.createBranchBranches.indexOf(branch);

      // remove the branch path
      this.createBranchBranches.splice(branchPathIndex, 1);

      // remove the transition that corresponds to the branch path
      this.node.transitionLogic.transitions.splice(branchPathIndex, 1);
    }
  }

  /**
   * The author has changed the step rubric
   */
  summernoteRubricHTMLChanged() {
    // get the summernote rubric html
    let html = this.summernoteRubricHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    html = this.ConfigService.removeAbsoluteAssetPaths(html);

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    html = this.UtilService.insertWISELinks(html);

    // update the step rubric
    this.node.rubric = html;

    // save the project
    this.authoringViewNodeChanged();
  }

  /**
   * Show the component authoring views
   */
  showComponentAuthoring() {
    this.showComponentAuthoringViews = true;
  }

  /**
   * Hide the component authoring views so that the auther only sees
   * the component numbers and component names
   */
  hideComponentAuthoring() {
    this.showComponentAuthoringViews = false;
  }

  /**
   * Show the insert buttons. This is used when choosing where to insert a
   * component.
   */
  turnOnInsertComponentMode() {
    this.insertComponentMode = true;
  }

  /**
   * Hide the insert buttons.
   */
  turnOffInsertComponentMode() {
    this.insertComponentMode = false;
  }

  /**
   * Turn on the add component mode
   */
  turnOnAddComponentMode() {
    this.addComponentMode = true;
  }

  /**
   * Turn off the add component mode
   */
  turnOffAddComponentMode() {
    this.addComponentMode = false;
  }

  /**
   * Turn on the move component mode
   */
  turnOnMoveComponentMode() {
    this.moveComponentMode = true;
  }

  /**
   * Turn off the move component mode
   */
  turnOffMoveComponentMode() {
    this.moveComponentMode = false;
  }

  /**
   * Turn on the copy component mode
   */
  turnOnCopyComponentMode() {
    this.copyComponentMode = true;
  }

  /**
   * Turn off the copy component mode
   */
  turnOffCopyComponentMode() {
    this.copyComponentMode = false;
  }

  /**
   * Turn on the import component mode
   */
  turnOnImportComponentMode() {
    this.importComponentMode = true;
  }

  /**
   * Turn off the import component mode
   */
  turnOffImportComponentMode() {
    this.importComponentMode = false;
  }

  /**
   * Get the components that have been selected
   * @return an array of component ids that have been selected
   */
  getSelectedComponentIds() {
    let selectedComponents = [];
    if (this.components != null) {
      for (let component of this.components) {
        if (component != null && component.id != null) {
          // see if the component is checked
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            selectedComponents.push(component.id);
          }
        }
      }
    }
    return selectedComponents;
  }

  /**
   * Uncheck all the components
   */
  clearComponentsToChecked() {
    /*
     * clear the components to checked mappings so that all the component
     * checkboxes are no longer checked
     */
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
  getSelectedComponentNumbersAndTypes(componentIds) {
    let selectedComponents = [];
    if (this.components != null) {
      for (let c = 0; c < this.components.length; c++) {
        let component = this.components[c];
        if (component != null && component.id != null) {
          // see if the component is checked
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            // get the component number and type example "1. OpenResponse"
            let componentNumberAndType = (c + 1) + '. ' + component.type;

            // the component is checked
            selectedComponents.push(componentNumberAndType);
          }
        }
      }
    }
    return selectedComponents;
  }

  /**
   * The import button was clicked to turn on the import view
   */
  importButtonClicked() {
    // clear all the import project values
    this.importProjectIdToOrder = {};
    this.importProjectItems = [];
    this.importMyProjectId = null;
    this.importLibraryProjectId = null;
    this.importProjectId = null;
    this.importProject = null;

    // hide the other views
    this.nodeAuthoringViewButtonClicked('import');

    if (this.showImportView) {
      // turn on import mode
      this.turnOnImportComponentMode();

      if (this.myProjectsList == null) {
        // populate the authorable projects drop down
        this.myProjectsList = this.ConfigService.getAuthorableProjects();
      }

      if (this.libraryProjectsList == null) {
        // populate the library projects drop down
        this.ConfigService.getLibraryProjects().then((libraryProjectsList) => {
          this.libraryProjectsList = libraryProjectsList;
        });
      }
    }
  }

  /**
   * The move component button was clicked
   */
  moveButtonClicked() {
    if (this.getSelectedComponentIds().length == 0) {
      alert(this.$translate('pleaseSelectAComponentToMoveAndThenClickTheMoveButtonAgain'));
    } else {
      // hide the other views
      this.nodeAuthoringViewButtonClicked('move');

      // turn off add component mode
      this.turnOffAddComponentMode();

      // turn on the move component mode
      this.turnOnMoveComponentMode();

      // turn on the insert component mode
      this.turnOnInsertComponentMode()

      // hide the component authoring
      this.hideComponentAuthoring();
    }
  }

  /**
   * The copy component button was clicked
   */
  copyButtonClicked() {
    if (this.getSelectedComponentIds().length == 0) {
      alert(this.$translate('pleaseSelectAComponentToCopyAndThenClickTheCopyButtonAgain'));
    } else {
      // hide the other views
      this.nodeAuthoringViewButtonClicked('copy');

      // turn on the move component mode
      this.turnOnCopyComponentMode();

      // turn on the insert component mode
      this.turnOnInsertComponentMode();

      // hide the component authoring views
      this.hideComponentAuthoring();
    }
  }

  /**
   * The delete button was clicked
   * TODO refactor too many nesting
   */
  deleteButtonClicked() {
    if (this.getSelectedComponentIds().length == 0) {
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

        // get the selected component numbers and types
        let selectedComponentNumbersAndTypes = this.getSelectedComponentNumbersAndTypes();

        if (selectedComponentNumbersAndTypes.length == 1) {
          // there is one selected component
          confirmMessage = this.$translate('areYouSureYouWantToDeleteThisComponent');
        } else if (selectedComponentNumbersAndTypes.length > 1) {
          // there are multiple selected components
          confirmMessage = this.$translate('areYouSureYouWantToDeleteTheseComponents');
        }

        // loop through all the selected components
        for (let c = 0; c < selectedComponentNumbersAndTypes.length; c++) {

          // get a component number and type
          let selectedComponentNumberAndType = selectedComponentNumbersAndTypes[c];

          // show the component number and type in the message
          confirmMessage += '\n' + selectedComponentNumberAndType;
        }

        // ask the user if they are sure they want to delete
        if (confirm(confirmMessage)) {
          let selectedComponents = this.getSelectedComponentIds();

          // data saved in the component deleted event
          let data = {
            "componentsDeleted": this.getComponentObjectsForEventData(selectedComponents)
          };

          /*
           * loop through all the selected component ids and delete the
           * components
           */
          for (let componentId of selectedComponents) {
            this.ProjectService.deleteComponent(this.nodeId, componentId);
          }

          this.saveEvent('componentDeleted', 'Authoring', data);

          // check if we need to show the node save or node submit buttons
          this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();

          this.ProjectService.saveProject();
        } else {
          // uncheck the component check boxes
          this.clearComponentsToChecked();
        }

        // turn off the insert component mode
        this.turnOffInsertComponentMode();

        // uncheck the component check boxes
        this.clearComponentsToChecked();

        // show the component authoring
        this.showComponentAuthoring();
      });
    }
  }

  /**
   * The cancel insert button was clicked
   */
  cancelInsertClicked() {
    // hide all the authoring views
    this.nodeAuthoringViewButtonClicked();

    this.turnOffAddComponentMode();
    this.turnOffMoveComponentMode();
    this.turnOffInsertComponentMode();
    this.clearComponentsToChecked();
    this.showComponentAuthoring();
  }

  /**
   * Check if we need to show the node save or node submit buttons
   */
  checkIfNeedToShowNodeSaveOrNodeSubmitButtons() {
    if (this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.nodeId)) {
      /*
       * there is a component in this step that is showing their
       * submit button
       */
    } else {
      /*
       * there is no component in this step that is showing their
       * submit button
       */

      if (this.ProjectService.doesAnyComponentHaveWork(this.nodeId)) {
        /*
         * there is a component that generates work so we will show
         * the step save button
         */
        this.node.showSaveButton = true;
        this.node.showSubmitButton = false;

        // hide the save button in all the components
        this.hideAllComponentSaveButtons();
      } else {
        /*
         * there are no components in the step that generates work
         * so we will not show the step save button
         */
        this.node.showSaveButton = false;
        this.node.showSubmitButton = false;
      }
    }
  }

  /**
   * Insert the component so it becomes the first component in the step
   */
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

  /**
   * Insert the component after the given component id.
   * @param componentId insert the component after this given component id
   */
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
  handleAddComponent(componentId) {
    let newComponents = [];
    // create a component and add it to this node
    let newComponent = this.ProjectService
        .createComponent(this.nodeId, this.selectedComponent, componentId);

    let data = {
      "componentId": newComponent.id,
      "componentType": newComponent.type
    };
    this.saveEvent('componentCreated', 'Authoring', data);
    newComponents.push(newComponent);
    this.turnOffAddComponentMode();
    this.ProjectService.saveProject();
    this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
  }

  /**
   * Move components in this step.
   * @param componentId (optional) Put the moved components after this component
   * id. If the componentId is not provided, we will put the components at the
   * beginning of the step.
   */
  handleMoveComponent(componentId) {
    let newComponents = [];
    let selectedComponentIds = this.getSelectedComponentIds();
    if (selectedComponentIds != null && selectedComponentIds.indexOf(componentId) != -1) {
      /*
       * the author is trying to move a component and place it after
       * itself which we will not allow
       */
      if (selectedComponentIds.length == 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
      } else if (selectedComponentIds.length > 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
      }
    } else {
      // data saved in the component moved event
      let data = {
        "componentsMoved": this.getComponentObjectsForEventData(selectedComponentIds)
      };

      // move the components to their new location
      newComponents = this.ProjectService
          .moveComponent(this.nodeId, selectedComponentIds, componentId);

      this.saveEvent('componentMoved', 'Authoring', data);
      this.turnOffMoveComponentMode();
      this.ProjectService.saveProject();
      this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
    }
  }

  /**
   * Copy components in this step.
   * @param componentId (optional) Put the copied components after this
   * component id. If the componentId is not provided, we will put the
   * components at the beginning of the step.
   */
  handleCopyComponent(componentId) {
    let newComponents = [];
    let selectedComponentIds = this.getSelectedComponentIds();

    // data saved in the component copied event
    let data = {};
    let componentsCopied = this.getComponentObjectsForEventData(selectedComponentIds);

    // copy the components to their new location
    newComponents = this.ProjectService.copyComponentAndInsert(this.nodeId, selectedComponentIds, componentId);

    // get the information for all the components that were copied
    for (let c = 0; c < componentsCopied.length; c++) {
      let componentCopied = componentsCopied[c];
      let newComponent = newComponents[c];

      componentCopied.fromComponentId = componentCopied.componentId;
      componentCopied.toComponentId = newComponent.id;
      delete componentCopied.componentId;
    }

    data.componentsCopied = componentsCopied;
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
  handleImportComponent(componentId) {
    // import the selected components and insert them
    this.importComponents(this.nodeId, componentId).then((newComponents) => {
      this.turnOffImportComponentMode();
      this.ProjectService.saveProject();
      this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);

      /*
       * refresh the project assets in case any of the imported
       * components also imported assets
       */
      this.ProjectAssetService.retrieveProjectAssets();
    });
  }

  /**
   * Temporarily highlight the new components and then show the component
   * authoring views. Used to bring user's attention to new changes.
   * @param newComponents an array of the new components we have just added
   */
  highlightNewComponentsAndThenShowComponentAuthoring(newComponents) {
    // use a timeout to allow the components time to show up in the UI
    this.$timeout(() => {
      if (newComponents != null) {
        for (let newComponent of newComponents) {
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
        this.nodeAuthoringViewButtonClicked();
        this.clearComponentsToChecked();

        /*
         * use a timeout to wait for the UI to update and then scroll
         * to the first new component
         */
        this.$timeout(() => {
          if (newComponents != null && newComponents.length > 0) {
            // get the UI element of the first new component
            let componentElement = $('#' + newComponents[0].id);

            if (componentElement != null) {
              // scroll to the first new component that we've added
              $('#content').animate({
                scrollTop: componentElement.offset().top - 200
              }, 1000);
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
    // clear the select drop down for the library project
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
      // clear all the import project values
      this.importProjectIdToOrder = {};
      this.importProjectItems = [];
      this.importMyProjectId = null;
      this.importLibraryProjectId = null;
      this.importProjectId = null;
      this.importProject = null;
    } else {
      // get the import project
      this.ProjectService.retrieveProjectById(this.importProjectId)
          .then((projectJSON) => {

        // create the mapping of node id to order for the import project
        this.importProjectIdToOrder = {};
        this.importProject = projectJSON;

        // calculate the node order of the import project
        let result = this.ProjectService.getNodeOrderOfProject(this.importProject);
        this.importProjectIdToOrder = result.idToOrder;
        this.importProjectItems = result.nodes;
      });
    }
  }

  previewImportNode(node) {
    window.open(`${this.importProject.previewProjectURL}#!/project/${this.importProjectId}/${node.id}`);
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}#!/project/${this.importProjectId}`);
  }

  previewImportComponent(node, componentId) {
    this.previewImportNode(node);
  }

  /**
   * Import the selected steps
   */
  importComponentsButtonClicked() {
    let selectedComponents = this.getSelectedComponentsToImport();
    if (selectedComponents == null || selectedComponents.length == 0) {
      // the author did not select any components to import
      alert('Please select a component to import.');
    } else {
      /*
       * hide the import view because we want to go back to the
       * project view so that the author can choose where to place
       * the new steps
       */
      this.showImportView = false;
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
      this.scrollToTopOfPage();
    }
  }

  /**
   * Get the selected components to import
   * @return an array of selected components
   * TODO refactor too many nesting
   */
  getSelectedComponentsToImport() {
    let selectedComponents = [];
    for (let item of this.importProjectItems) {
      if (item != null && item.node != null && item.node.components != null) {
        let componentsInNode = item.node.components;
        for (let component of componentsInNode) {
          if (component != null && component.checked) {
            /*
             * this component is checked so we will add it to
             * the array of components that we will import
             */
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
    // data saved in the component imported event
    let data = {
      "componentsImported": this.getComponentObjectsForImportEventData()
    };

    let selectedComponents = this.getSelectedComponentsToImport();
    for (let selectedComponent of selectedComponents) {
      if (selectedComponent != null) {
        // remove the checked field
        delete selectedComponent.checked;
      }
    }

    // insert the components into the project
    return this.ProjectService.importComponents(selectedComponents,
        this.importProjectId, nodeId, insertAfterComponentId)
        .then((newComponents) => {
      for (let c = 0; c < data.componentsImported.length; c++) {
        let componentImported = data.componentsImported[c];
        let newComponent = newComponents[c];
        let newComponentId = newComponent.id;

        /*
        * set the toComponentId so the event knows what the new
        * component id is
        */
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
   * We are in the create a new component mode and the user has clicked
   * on a component type
   * @param componentType the component type the author clicked
   */
  componentTypeClicked(componentType) {
    this.selectedComponent = componentType;
  }

  /**
   * We are in the create a new component mode and the user has clicked
   * on the cancel button
   */
  cancelCreateComponentClicked() {
    // hide all the authoring views
    this.nodeAuthoringViewButtonClicked();

    this.turnOffAddComponentMode();
    this.turnOffMoveComponentMode();
    this.turnOffInsertComponentMode()
    this.showComponentAuthoring();
  }

  /**
   * Get the component type label
   * @param componentType the component type
   * @return the component type label
   * example
   * "Open Response"
   */
  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  /**
   * The author has clicked the back button
   */
  backButtonClicked() {
    if (this.showImportView || this.showRubric || this.showAdvanced) {
      this.UtilService.hideJSONValidMessage();

      // we are in the import view so we will go back to the node view
      this.nodeAuthoringViewButtonClicked();

      this.$state
        .go('root.project.node', {projectId: this.projectId, nodeId: this.nodeId});
    } else {
      // we are in the node view so we will go back to the project view
      this.close();
    }
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   * @param data (optional) an object that contains more specific data about
   * the event
   */
  saveEvent(eventName, category, data) {
    let context = 'AuthoringTool';
    let nodeId = this.nodeId;
    let componentId = null;
    let componentType = null;
    if (data == null) {
      data = {};
    }
    this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data);
  }

  /**
   * Get an array of objects that contain the component id and type
   * @param componentIds an array of component ids
   * @return an array of objects that contain the component id and type
   * TODO refactor too many nesting
   */
  getComponentObjectsForEventData(componentIds) {
    let componentObjects = [];
    if (componentIds != null) {
      for (let componentId of componentIds) {
        if (componentId != null) {
          let component = this.ProjectService
              .getComponentByNodeIdAndComponentId(this.nodeId, componentId);

          if (component != null) {
            let tempComponent = {
              "componentId": component.id,
              "type": component.type
            };
            componentObjects.push(tempComponent);
          }
        }
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
    let componentObjects = [];
    for (let item of this.importProjectItems) {
      if (item != null && item.node != null && item.node.components != null) {
        for (let component of item.node.components) {
          if (component != null && component.checked) {
            let tempComponent = {
              "fromProjectId": parseInt(this.importProjectId),
              "fromNodeId": item.node.id,
              "fromComponentId": component.id,
              "type": component.type
            };

            /*
             * this component is checked so we will add it to
             * the array of components that we will import
             */
            componentObjects.push(tempComponent);
          }
        }
      }
    }
    return componentObjects;
  }

  /**
   * Save the project JSON to the server if the JSON is valid.
   */
  autoSaveJSON() {
    try {
      // create the updated node object
      let updatedNode = angular.fromJson(this.authoringNodeContentJSONString);

      // set the updated node into the project
      this.ProjectService.setNode(this.nodeId, updatedNode);

      // set the updated node into this controller
      this.node = updatedNode;

      // set the components into this controller
      this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

      // set the current node
      this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

      // update the branch authoring fields into the controller
      this.populateBranchAuthoring();

      // save the project
      this.authoringViewNodeChanged().then(() => {
        this.$rootScope.$broadcast('parseProject');
      });
      this.UtilService.showJSONValidMessage();
    } catch(e) {
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

  /**
   * A constraint removal criteria step has changed.
   * @param criteria The removal criteria object.
   */
  authoringViewConstraintRemovalCriteriaNodeIdChanged(criteria) {
    criteria.params.componentId = '';
    this.authoringViewNodeChanged();
  }

  /**
   * A constraint removal criteria component has changed.
   * @param criteria The removal criteria object.
   */
  authoringViewConstraintRemovalCriteriaComponentIdChanged(criteria) {
    this.authoringViewNodeChanged();
  }
}

NodeAuthoringController.$inject = [
    '$anchorScroll',
    '$filter',
    '$injector',
    '$location',
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
    'TeacherDataService',
    'UtilService'
];

export default NodeAuthoringController;
