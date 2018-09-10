'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeAuthoringController = function () {
  function NodeAuthoringController($anchorScroll, $filter, $injector, $location, $mdDialog, $rootScope, $scope, $state, $stateParams, $timeout, ConfigService, NodeService, ProjectAssetService, ProjectService, TeacherDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, NodeAuthoringController);

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
    this.howToChooseAmongAvailablePathsOptions = [null, 'random', 'workgroupId', 'firstAvailable', 'lastAvailable'];
    this.whenToChoosePathOptions = [null, 'enterNode', 'exitNode', 'scoreChanged', 'studentDataChanged'];
    this.canChangePathOptions = [null, true, false];
    this.createBranchBranches = [];
    this.showComponents = true;
    this.showStepButtons = true;
    this.showComponentAuthoringViews = true;

    // mapping from component id to whether the component checkbox is checked
    this.componentsToChecked = {};

    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

    // the available constraint actions
    this.constraintActions = [{
      value: "",
      text: this.$translate('pleaseChooseAnAction')
    }, {
      value: "makeAllNodesAfterThisNotVisitable",
      text: this.$translate('makeAllNodesAfterThisNotVisitable')
    }, {
      value: "makeAllNodesAfterThisNotVisible",
      text: this.$translate('makeAllNodesAfterThisNotVisible')
    }, {
      value: "makeAllOtherNodesNotVisitable",
      text: this.$translate('makeAllOtherNodesNotVisitable')
    }, {
      value: "makeAllOtherNodesNotVisible",
      text: this.$translate('makeAllOtherNodesNotVisible')
    }, {
      value: "makeThisNodeNotVisitable",
      text: this.$translate('makeThisNodeNotVisitable')
    }, {
      value: "makeThisNodeNotVisible",
      text: this.$translate('makeThisNodeNotVisible')
    }];

    // the available removal conditionals
    this.removalConditionals = [{
      value: "all",
      text: this.$translate('all')
    }, {
      value: "any",
      text: this.$translate('any')
    }];

    // the available removal criteria
    this.removalCriteria = [{
      value: "",
      text: this.$translate('pleaseChooseARemovalCriteria')
    }, {
      value: "isCompleted",
      text: this.$translate('isCompleted'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }]
    }, {
      value: "score",
      text: this.$translate('SCORE'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }, {
        value: "component",
        text: this.$translate('component')
      }, {
        value: "scores",
        text: this.$translate('scoresParens')
      }]
    }, {
      value: "branchPathTaken",
      text: this.$translate('branchPathTaken'),
      params: [{
        value: "fromNodeId",
        text: this.$translate('fromStep')
      }, {
        value: "toNodeId",
        text: this.$translate('toStep')
      }]
    }, {
      value: "choiceChosen",
      text: this.$translate('choiceChosen'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }, {
        value: "componentId",
        text: this.$translate('component')
      }, {
        value: "choiceIds",
        text: this.$translate('choices')
      }]
    }, {
      value: "isCorrect",
      text: this.$translate('IS_CORRECT'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }, {
        value: "componentId",
        text: this.$translate('component')
      }]
    }, {
      value: "usedXSubmits",
      text: this.$translate('usedXSubmits'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }, {
        value: "componentId",
        text: this.$translate('component')
      }, {
        value: "requiredSubmitCount",
        text: this.$translate('requiredSubmitCount')
      }]
    }, {
      value: "isVisible",
      text: this.$translate('isVisible'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }]
    }, {
      value: "isVisitable",
      text: this.$translate('isVisitable'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }]
    }, {
      value: "isVisited",
      text: this.$translate('isVisited'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }]
    }, {
      value: "isPlanningActivityCompleted",
      text: this.$translate('isPlanningActivityCompleted')
    }, {
      value: "wroteXNumberOfWords",
      text: this.$translate('wroteXNumberOfWords'),
      params: [{
        value: "nodeId",
        text: this.$translate('step')
      }, {
        value: "componentId",
        text: this.$translate('component')
      }, {
        value: "requiredNumberOfWords",
        text: this.$translate('requiredNumberOfWords')
      }]
    }];

    // available transitionCriterias
    this.transitionCriterias = [{
      value: "score",
      text: this.$translate('getASpecificScoreOnAComponent'),
      params: [{
        value: "nodeId",
        text: this.$translate('nodeID')
      }, {
        value: "componentId",
        text: this.$translate('componentID')
      }, {
        value: "scores",
        text: this.$translate('scoresParens')
      }]
    }, {
      value: "choiceChosen",
      text: this.$translate('chooseASpecificChoiceOnAComponent'),
      params: [{
        value: "nodeId",
        text: this.$translate('nodeID')
      }, {
        value: "componentId",
        text: this.$translate('componentID')
      }, {
        value: "choiceIds",
        text: this.$translate('choices')
      }]
    }];

    this.branchCriteria = [{
      value: "workgroupId",
      text: this.$translate('WORKGROUP_ID')
    }, {
      value: "score",
      text: this.$translate('SCORE')
    }, {
      value: "choiceChosen",
      text: this.$translate('choiceChosen')
    }, {
      value: "random",
      text: this.$translate('random')
    }];

    // the array of component types that can be created
    // TODO: automate by looping through active component types for this WISE instance
    this.componentTypes = [{ componentType: 'Animation', componentName: this.UtilService.getComponentTypeLabel('Animation') }, { componentType: 'AudioOscillator', componentName: this.UtilService.getComponentTypeLabel('AudioOscillator') }, { componentType: 'ConceptMap', componentName: this.UtilService.getComponentTypeLabel('ConceptMap') }, { componentType: 'Discussion', componentName: this.UtilService.getComponentTypeLabel('Discussion') }, { componentType: 'Draw', componentName: this.UtilService.getComponentTypeLabel('Draw') }, { componentType: 'Embedded', componentName: this.UtilService.getComponentTypeLabel('Embedded') }, { componentType: 'Graph', componentName: this.UtilService.getComponentTypeLabel('Graph') }, { componentType: 'HTML', componentName: this.UtilService.getComponentTypeLabel('HTML') }, { componentType: 'Label', componentName: this.UtilService.getComponentTypeLabel('Label') }, { componentType: 'Match', componentName: this.UtilService.getComponentTypeLabel('Match') }, { componentType: 'MultipleChoice', componentName: this.UtilService.getComponentTypeLabel('MultipleChoice') }, { componentType: 'OpenResponse', componentName: this.UtilService.getComponentTypeLabel('OpenResponse') }, { componentType: 'OutsideURL', componentName: this.UtilService.getComponentTypeLabel('OutsideURL') }, { componentType: 'Table', componentName: this.UtilService.getComponentTypeLabel('Table') }];

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
    var insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var insertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, null, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
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
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.node.rubric);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     * TODO refactor too many nesting
     */
    this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == null) {
          // the asset was selected for this component
          if (args.assetItem != null && args.assetItem.fileName != null) {
            var fileName = args.assetItem.fileName;
            /*
             * get the assets directory path
             * e.g.
             * /wise/curriculum/3/
             */
            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

            if (args.target == 'rubric') {
              // the target is the summernote rubric element
              var summernoteId = 'summernoteRubric_' + _this.nodeId;

              if (_this.UtilService.isImage(fileName)) {
                /*
                 * move the cursor back to its position when the asset chooser
                 * popup was clicked
                 */
                $('#' + summernoteId).summernote('editor.restoreRange');
                $('#' + summernoteId).summernote('editor.focus');

                // add the image html
                $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
              } else if (_this.UtilService.isVideo(fileName)) {
                /*
                 * move the cursor back to its position when the asset chooser
                 * popup was clicked
                 */
                $('#' + summernoteId).summernote('editor.restoreRange');
                $('#' + summernoteId).summernote('editor.focus');

                // insert the video element
                var videoElement = document.createElement('video');
                videoElement.controls = 'true';
                videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                $('#' + summernoteId).summernote('insertNode', videoElement);
              }
            }
          }
        }
      }

      // close the popup
      _this.$mdDialog.hide();
    });

    this.$scope.$on('componentShowSubmitButtonValueChanged', function (event, args) {
      var showSubmitButton = args.showSubmitButton;
      if (showSubmitButton) {
        /*
         * a component is showing their submit button so we will hide
         * the step save button and submit buttons
         */
        _this.node.showSaveButton = false;
        _this.node.showSubmitButton = false;

        // turn on the save buttons for all components in this step
        _this.ProjectService.turnOnSaveButtonForAllComponents(_this.node);
      } else {
        /*
         * a component is hiding their submit button so we may need
         * to show the step save button
         */
        if (_this.ProjectService.doesAnyComponentInNodeShowSubmitButton(_this.node.id)) {
          /*
           * there is at least one component in the step that is showing
           * their submit button so we will show the save button on
           * all the components
           */

          // turn on the save buttons for all components in this step
          _this.ProjectService.turnOnSaveButtonForAllComponents(_this.node);
        } else {
          /*
           * no components in this step show their submit button so we
           * will show the step save button
           */
          _this.node.showSaveButton = true;
          _this.node.showSubmitButton = false;

          // turn off the save buttons for all the components
          _this.ProjectService.turnOffSaveButtonForAllComponents(_this.node);
        }
      }

      // save changes
      _this.authoringViewNodeChanged();
    });

    if (this.$state.current.name == 'root.project.nodeConstraints') {
      this.$timeout(function () {
        _this.nodeAuthoringViewButtonClicked('advanced');
        _this.$timeout(function () {
          _this.nodeAuthoringViewButtonClicked('editConstraints');
        });
      });
    }

    if (this.$state.current.name == 'root.project.nodeEditPaths') {
      this.$timeout(function () {
        _this.nodeAuthoringViewButtonClicked('advanced');
        _this.$timeout(function () {
          _this.nodeAuthoringViewButtonClicked('editTransitions');
        });
      });
    }

    this.scrollToTopOfPage();

    var data = {
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


  _createClass(NodeAuthoringController, [{
    key: 'populateBranchAuthoring',
    value: function populateBranchAuthoring() {
      if (this.node.transitionLogic != null) {
        // clear the create branch branches so we can populate them again
        this.createBranchBranches = [];

        // get the number of branches
        if (this.node.transitionLogic.transitions != null) {
          this.createBranchNumberOfBranches = this.node.transitionLogic.transitions.length;
        } else {
          this.createBranchNumberOfBranches = 0;
        }

        for (var t = 0; t < this.node.transitionLogic.transitions.length; t++) {
          var transition = this.node.transitionLogic.transitions[t];

          if (transition != null) {

            // create a branch object to hold all the related information for that branch
            var branch = {};

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
            var criteria = transition.criteria;

            if (criteria != null) {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = criteria[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var criterion = _step.value;

                  if (criterion != null) {
                    var name = criterion.name;
                    var params = criterion.params;

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
                      var choices = this.ProjectService.getChoicesByNodeIdAndComponentId(this.createBranchNodeId, this.createBranchComponentId);

                      if (choices != null) {
                        // set the choices into the branch object
                        branch.choices = this.UtilService.makeCopyOfJSONObject(choices);
                      }
                    }
                  }
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }
            }

            // get the node ids in the branch path
            var nodeIdsInBranch = this.ProjectService.getNodeIdsInBranch(this.nodeId, transition.to);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = nodeIdsInBranch[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var nodeId = _step2.value;

                var item = branch.items[nodeId];
                if (item != null) {
                  // make the item checked
                  item.checked = true;

                  // add the item to the array of checked items in this branch path
                  branch.checkedItemsInBranchPath.push(item);
                }
              }

              // set the node ids in branch array into the branch object
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            branch.nodeIdsInBranch = nodeIdsInBranch;

            if (nodeIdsInBranch.length > 0) {
              // get the last node id in the branch path
              var lastNodeIdInBranch = nodeIdsInBranch[nodeIdsInBranch.length - 1];

              if (lastNodeIdInBranch != null) {
                var transitionsFromLastNode = this.ProjectService.getTransitionsByFromNodeId(lastNodeIdInBranch);
                if (transitionsFromLastNode != null && transitionsFromLastNode.length > 0) {
                  var _transition = transitionsFromLastNode[0];
                  if (_transition != null) {
                    this.createBranchMergePointNodeId = _transition.to;
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

  }, {
    key: 'previewStepInNewWindow',
    value: function previewStepInNewWindow() {
      var data = { "constraints": true };
      this.saveEvent('stepPreviewed', 'Navigation', data);

      var previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');
      var previewStepURL = previewProjectURL + '#/vle/' + this.nodeId;
      window.open(previewStepURL);
    }
  }, {
    key: 'previewStepWithoutConstraintsInNewWindow',


    /**
     * Launch VLE with this current step as the initial step without constraints
     */
    value: function previewStepWithoutConstraintsInNewWindow() {
      var data = { "constraints": false };
      this.saveEvent('stepPreviewed', 'Navigation', data);

      var previewProjectURL = this.ConfigService.getConfigParam('previewProjectURL');
      var previewStepURL = previewProjectURL + '?constraints=false' + '#/vle/' + this.nodeId;
      window.open(previewStepURL);
    }
  }, {
    key: 'close',


    /**
     * Close the node authoring view
     */
    value: function close() {
      this.$scope.$broadcast('exitNode', { nodeToExit: this.node });
      this.TeacherDataService.setCurrentNode(null);
      this.$state.go('root.project', { projectId: this.projectId });
      this.scrollToTopOfPage();
    }
  }, {
    key: 'showSaveErrorAdvancedAuthoring',


    /**
     * Display an error saving during advanced authoring, most-likely due to malformed JSON
     */
    value: function showSaveErrorAdvancedAuthoring() {
      alert(this.$translate('saveErrorAdvancedAuthoring'));
    }

    /**
     * The author has clicked the cancel button which will revert all
     * the recent changes since they opened the node.
     */

  }, {
    key: 'cancel',
    value: function cancel() {
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

  }, {
    key: 'addNewTransition',
    value: function addNewTransition() {
      if (this.node.transitionLogic.transitions == null) {
        this.node.transitionLogic.transitions = [];
      }
      var nodeTransitions = this.node.transitionLogic.transitions;
      if (nodeTransitions.length > 0) {
        // If this node already has transitions, copy the last one.
        var lastNodeTransition = nodeTransitions[nodeTransitions.length - 1];
        var newTransition = {
          "to": lastNodeTransition.to
        };
        nodeTransitions.push(newTransition);
      } else {
        // Otherwise set the new transition to the current nodeId
        var _newTransition = {
          "to": this.nodeId
        };
        nodeTransitions.push(_newTransition);
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

  }, {
    key: 'authoringViewTransitionToNodeIdChanged',
    value: function authoringViewTransitionToNodeIdChanged() {
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

  }, {
    key: 'addNewTransitionCriteria',
    value: function addNewTransitionCriteria(transition) {
      var nodeTransitions = this.node.transitionLogic.transitions;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = nodeTransitions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var nodeTransition = _step3.value;

          if (nodeTransition == transition) {
            if (nodeTransition.criteria == null) {
              nodeTransition.criteria = [];
            }
            var newTransitionCriteria = {
              "name": "",
              "params": {
                "nodeId": "",
                "componentId": ""
              }
            };
            nodeTransition.criteria.push(newTransitionCriteria);
          }
        }
        // save changes
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.authoringViewNodeChanged();
    }

    /**
     * The transition criteria node id changed so we will update the params
     * accordingly.
     * @param transitionCriteria the transition criteria object that changed
     */

  }, {
    key: 'transitionCriteriaNodeIdChanged',
    value: function transitionCriteriaNodeIdChanged(transitionCriteria) {
      if (transitionCriteria != null && transitionCriteria.params != null) {
        // remember the node id
        var nodeId = transitionCriteria.params.nodeId;

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

  }, {
    key: 'transitionCriteriaComponentIdChanged',
    value: function transitionCriteriaComponentIdChanged(transitionCriteria) {
      if (transitionCriteria != null && transitionCriteria.params != null) {
        // remember the node id and component id
        var nodeId = transitionCriteria.params.nodeId;
        var componentId = transitionCriteria.params.componentId;

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

  }, {
    key: 'deleteTransition',
    value: function deleteTransition(transition) {
      var stepTitle = '';
      if (transition != null) {
        stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(transition.to);
      }
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisPath', { stepTitle: stepTitle }));
      if (answer) {
        var nodeTransitions = this.node.transitionLogic.transitions;
        var index = nodeTransitions.indexOf(transition);
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

  }, {
    key: 'saveTransitions',
    value: function saveTransitions() {
      this.ProjectService.saveProject();
      this.showEditTransitions = false;
    }

    /**
     * The add component button was clicked
     */

  }, {
    key: 'addComponentButtonClicked',
    value: function addComponentButtonClicked() {
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

  }, {
    key: 'deleteComponent',
    value: function deleteComponent(componentId) {
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

  }, {
    key: 'hideAllComponentSaveButtons',
    value: function hideAllComponentSaveButtons() {
      var components = this.components;
      if (components != null) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = components[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var component = _step4.value;

            if (component != null) {
              var componentType = component.type;

              // get the service for the component type
              var service = this.$injector.get(componentType + 'Service');
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
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
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

  }, {
    key: 'authoringViewNodeChanged',
    value: function authoringViewNodeChanged(parseProject) {
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

  }, {
    key: 'undo',
    value: function undo() {
      if (this.undoStack.length === 0) {
        // the undo stack is empty so there are no changes to undo
        alert(this.$translate('noUndoAvailable'));
      } else if (this.undoStack.length > 0) {
        // the undo stack has elements

        if (confirm(this.$translate('confirmUndoLastChange'))) {
          // perform any node cleanup if necessary
          this.$scope.$broadcast('exitNode', { nodeToExit: this.node });

          // get the previous version of the node
          var nodeCopy = this.undoStack.pop();

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

  }, {
    key: 'getRemovalCriteriaParamsByName',
    value: function getRemovalCriteriaParamsByName(name) {
      var params = [];
      if (name != null) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.removalCriteria[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var singleRemovalCriteria = _step5.value;

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
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
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

  }, {
    key: 'getTransitionCriteriaParamsByName',
    value: function getTransitionCriteriaParamsByName(name) {
      var params = [];
      if (name != null) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.transitionCriterias[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var singleTransitionCriteria = _step6.value;

            if (singleTransitionCriteria != null && singleTransitionCriteria.value == name) {
              /*
               * we have found the removal criteria we are looking for
               * so we will get its params
               */
              params = singleTransitionCriteria.params;
              break;
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
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

  }, {
    key: 'getChoicesByNodeIdAndComponentId',
    value: function getChoicesByNodeIdAndComponentId(nodeId, componentId) {
      return this.ProjectService.getChoicesByNodeIdAndComponentId(nodeId, componentId);
    }

    /**
     * Get the choice type of a component
     * @param nodeId the node id
     * @param componentId the component id
     * @return the choice type e.g. 'radio' or 'checkbox'
     */

  }, {
    key: 'getChoiceTypeByNodeIdAndComponentId',
    value: function getChoiceTypeByNodeIdAndComponentId(nodeId, componentId) {
      var choiceType = null;
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

  }, {
    key: 'getNewNodeConstraintId',
    value: function getNewNodeConstraintId(nodeId) {
      var newNodeConstraintId = null;
      var usedConstraintIds = [];
      var node = this.ProjectService.getNodeById(nodeId);
      if (node != null && node.constraints != null) {
        var nodeConstraints = node.constraints;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = nodeConstraints[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var constraint = _step7.value;

            if (constraint != null) {
              var constraintId = constraint.id;
              usedConstraintIds.push(constraintId);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }

      // counter used for finding a constraint id that hasn't been used yet
      var constraintCounter = 1;

      // loop until we have found an unused constraint id
      while (newNodeConstraintId == null) {
        // create a potential constraint id
        var potentialNewNodeConstraintId = nodeId + 'Constraint' + constraintCounter;

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

  }, {
    key: 'addConstraint',
    value: function addConstraint() {
      // get a new constraint id
      var newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);

      // create the constraint object
      var constraint = {
        "id": newNodeConstraintId,
        "action": '',
        "targetId": this.nodeId,
        "removalConditional": 'any',
        "removalCriteria": []
      };

      // create a removal criteria
      var removalCriteria = {
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

  }, {
    key: 'addConstraintAndScrollToBottom',
    value: function addConstraintAndScrollToBottom() {
      var _this2 = this;

      var newNodeConstraintId = this.addConstraint();
      this.$timeout(function () {
        _this2.$rootScope.$broadcast('scrollToBottom');
        _this2.UtilService.temporarilyHighlightElement(newNodeConstraintId);
      });
    }

    /**
     * Delete a constraint
     * @param constraintIndex delete the constraint at the index
     */

  }, {
    key: 'deleteConstraint',
    value: function deleteConstraint(constraintIndex) {
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConstraint'));
      if (answer) {
        if (constraintIndex != null) {
          var node = this.ProjectService.getNodeById(this.nodeId);
          if (node != null) {
            var constraints = node.constraints;
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

  }, {
    key: 'addRemovalCriteria',
    value: function addRemovalCriteria(constraint) {
      if (constraint != null) {
        // create the removal criteria
        var removalCriteria = {
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

  }, {
    key: 'deleteRemovalCriteria',
    value: function deleteRemovalCriteria(constraint, removalCriteriaIndex) {
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisRemovalCriteria'));
      if (answer) {
        if (constraint != null) {
          // get all the removal criteria
          var removalCriteria = constraint.removalCriteria;
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

  }, {
    key: 'deleteTransitionCriteria',
    value: function deleteTransitionCriteria(transition, transitionCriteriaIndex) {
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisRequirement'));
      if (answer) {
        if (transition != null) {
          // get all the transition criteria
          var transitionCriterias = transition.criteria;
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

  }, {
    key: 'removalCriteriaNameChanged',
    value: function removalCriteriaNameChanged(criteria) {
      if (criteria != null) {
        // clear the params
        criteria.params = {};

        // get the params for the given criteria name
        var params = this.getRemovalCriteriaParamsByName(criteria.name);
        if (params != null) {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = params[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var paramObject = _step8.value;

              if (paramObject != null) {
                var value = paramObject.value;

                // initialize the param value
                criteria.params[value] = '';

                if (value == 'nodeId') {
                  // default the node id param to this node
                  criteria.params[value] = this.nodeId;
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
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

  }, {
    key: 'transitionCriteriaNameChanged',
    value: function transitionCriteriaNameChanged(transitionCriteria) {
      if (transitionCriteria != null) {
        var nodeId = null;
        var componentId = null;

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

  }, {
    key: 'nodeAuthoringViewButtonClicked',
    value: function nodeAuthoringViewButtonClicked(view) {
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
        var prevNodeId = this.ProjectService.getPreviousNodeId(this.nodeId);
        if (prevNodeId != null) {
          // there is a previous node id so we will go to it
          this.$state.go('root.project.node', { projectId: this.projectId, nodeId: prevNodeId });
        } else {
          // there is no previous node id so we will display a message
          var thereIsNoPreviousStep = this.$translate('thereIsNoPreviousStep');
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
        var nextNodeId = this.ProjectService.getNextNodeId(this.nodeId);
        if (nextNodeId != null) {
          // there is a next node id so we will go to it
          this.$state.go('root.project.node', { projectId: this.projectId, nodeId: nextNodeId });
        } else {
          // there is no next node id so we will display a message
          var thereIsNoNextStep = this.$translate('thereIsNoNextStep');
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
  }, {
    key: 'isJSONValid',
    value: function isJSONValid() {
      try {
        angular.fromJson(this.authoringNodeContentJSONString);
        return true;
      } catch (e) {
        return false;
      }
    }
  }, {
    key: 'toggleJSONAuthoringView',
    value: function toggleJSONAuthoringView() {
      this.showJSON = !this.showJSON;
    }

    /**
     * The author has changed the number of branch paths
     * TODO refactor long function
     */

  }, {
    key: 'createBranchNumberOfBranchesChanged',
    value: function createBranchNumberOfBranchesChanged() {
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
        var answer = confirm(this.$translate('areYouSureYouWantToReduceTheNumberOfBranchesToX', { createBranchNumberOfBranches: this.createBranchNumberOfBranches }));

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
            for (var bp = 0; bp < this.createBranchBranches.length; bp++) {
              if (bp >= this.createBranchNumberOfBranches) {
                // this is a branch we want to remove
                var branch = this.createBranchBranches[bp];
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
        for (var b = 0; b < this.createBranchNumberOfBranches; b++) {
          if (b >= this.createBranchBranches.length) {
            /*
             * we do not have a branch object for this branch number so
             * we will create it
             */

            // create the branch object
            var _branch = {};

            // set the branch number
            _branch.number = b + 1;

            /*
             * set the mapping of all the ids to order for use when choosing which items are
             * in the branch path
             */
            _branch.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

            // add the branch to the array of branches
            this.createBranchBranches.push(_branch);

            // create a transition to represent the branch
            var transition = {};

            if (this.createBranchCriterion == 'score') {
              // the branch is based on score

              // create a score criterion
              var criterion = {
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
              var _criterion = {};
              _criterion.name = this.createBranchCriterion;
              _criterion.params = {};
              _criterion.params.choiceIds = [];

              if (this.createBranchNodeId != null) {
                // set the node for which to look for the score
                _criterion.params.nodeId = this.createBranchNodeId;
              }

              if (this.createBranchComponentId != null) {
                // set the component for which to look for the score
                _criterion.params.componentId = this.createBranchComponentId;
              }

              transition.criteria = [_criterion];
            } else if (this.createBranchCriterion == 'workgroupId') {
              // workgroup id branching does not require a transition criterion
            } else if (this.createBranchCriterion == 'random') {}
            // random branching does not require a transition criterion


            // add the transition
            this.node.transitionLogic.transitions.push(transition);

            // save a reference to the transition in the branch
            _branch.transition = transition;
          }
        }
      }
      this.authoringViewNodeChanged();
    }

    /**
     * The branch criterion has changed
     */

  }, {
    key: 'createBranchCriterionChanged',
    value: function createBranchCriterionChanged() {
      if (this.createBranchCriterion != null) {
        var nodeId = this.node.id;
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

  }, {
    key: 'createBranchNodeIdChanged',
    value: function createBranchNodeIdChanged() {
      this.createBranchComponentId = null;
      var selectedNode = this.ProjectService.getNodeById(this.createBranchNodeId);
      if (selectedNode != null) {
        var components = selectedNode.components;
        if (components != null) {
          if (components.length == 1) {
            /*
             * there is only one component in the node so we will
             * automatically select it in the drop down
             */
            var component = components[0];
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

  }, {
    key: 'createBranchComponentIdChanged',
    value: function createBranchComponentIdChanged() {

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

  }, {
    key: 'createBranchUpdateTransitions',
    value: function createBranchUpdateTransitions() {
      for (var b = 0; b < this.createBranchBranches.length; b++) {
        var branch = this.createBranchBranches[b];
        if (branch != null) {
          // get the transition corresponding to the branch
          var transition = branch.transition;
          if (transition != null) {
            if (this.createBranchCriterion == 'choiceChosen') {
              // we are branching based on choice chosen

              // clear the criteria array
              transition.criteria = [];

              // create a new choice chosen criterion
              var criterion = {
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
              var _criterion2 = {
                "name": 'score',
                "params": {
                  "nodeId": this.createBranchNodeId,
                  "componentId": this.createBranchComponentId,
                  "scores": []
                }
              };

              // re-use scores if available

              // add the criterion to the array of criteria
              transition.criteria.push(_criterion2);

              /*
               * clear the choice id since we don't need it in score
               * branching
               */
              branch.choiceId = null;

              // set the scores into the branch object
              branch.scores = _criterion2.params.scores;
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

  }, {
    key: 'createBranchUpdateChoiceChosenIds',
    value: function createBranchUpdateChoiceChosenIds() {
      var nodeId = this.createBranchNodeId;
      var componentId = this.createBranchComponentId;
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

  }, {
    key: 'createBranchUpdateChoiceChosenIdsHelper',
    value: function createBranchUpdateChoiceChosenIdsHelper(component) {
      var nodeId = this.createBranchNodeId;
      var componentId = this.createBranchComponentId;

      // get the choices from the component
      var choices = component.choices;

      if (choices != null) {

        // loop through all the choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];
          if (choice != null) {

            // get the fields of the choice
            var id = choice.id;
            var text = choice.text;
            var feedback = choice.feedback;
            var isCorrect = choice.isCorrect;

            // get the branch that corresponds to the choice
            var branch = this.createBranchBranches[c];

            if (branch != null) {
              // get the choice for this branch
              branch.choiceId = id;

              // make a copy of the choices from the component
              branch.choices = this.UtilService.makeCopyOfJSONObject(choices);

              // get the transition corresponding to the branch
              var transition = branch.transition;

              if (transition != null) {

                /*
                 * get the first transition criterion. we will assume
                 * there is only one transition criterion
                 */
                var criterion = transition.criteria[0];

                if (criterion != null) {

                  // get the params
                  var params = criterion.params;

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

  }, {
    key: 'createBranchStepClicked',
    value: function createBranchStepClicked(branch, item) {
      // get all the steps in order
      var orderedItems = this.$filter('orderBy')(this.$filter('toArray')(branch.items), 'order');

      // an array that will hold the items that were checked
      branch.checkedItemsInBranchPath = [];
      var checkedItemsInBranchPath = branch.checkedItemsInBranchPath;

      // an array that will hold the node ids that were checked
      branch.nodeIdsInBranch = [];

      // used to hold the previously checked node id
      var previousCheckedNodeId = null;

      // the node id after the node that was clicked
      var nodeIdAfter = null;

      /*
       * loop through all the items in order and set the transitions so that
       * the steps in a branch path transition to one after the other
       */
      for (var i = 0; i < orderedItems.length; i++) {
        var orderedItem = orderedItems[i];
        if (orderedItem != null && orderedItem.checked) {
          if (previousCheckedNodeId != null) {
            // make the previous node id point to the current item
            var previousCheckedNode = this.ProjectService.getNodeById(previousCheckedNodeId);
            if (previousCheckedNode != null) {
              // get the transition logic
              var transitionLogic = previousCheckedNode.transitionLogic;
              if (transitionLogic != null) {
                if (transitionLogic.transitions != null) {
                  // clear the transitions
                  transitionLogic.transitions = [];

                  // create a new transition object to the current item
                  var _transition2 = {
                    "to": orderedItem.$key
                  };
                  // add the transition
                  transitionLogic.transitions.push(_transition2);
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
        var previousOrderedItem = orderedItems[i - 1];
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
        var _node = this.ProjectService.getNodeById(previousCheckedNodeId);
        if (_node != null) {
          var _transitionLogic = _node.transitionLogic;
          if (_transitionLogic != null) {
            if (_transitionLogic.transitions != null) {
              // clear the transitions
              _transitionLogic.transitions = [];

              // make a transition to the merge point
              var _transition3 = {};
              _transition3.to = this.createBranchMergePointNodeId;

              // add the transition
              _transitionLogic.transitions.push(_transition3);
            }
          }
        }
      }

      // get the branch number
      var branchNumber = branch.number;

      // get the node id that was clicked
      var nodeId = item.$key;

      // get the transition that corresponds to the branch
      var transition = this.node.transitionLogic.transitions[branchNumber - 1];

      var firstNodeId = null;

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
          var firstCheckedItem = checkedItemsInBranchPath[0];

          if (firstCheckedItem != null) {
            // set the branch point transition to the first step in the path
            firstNodeId = firstCheckedItem.$key;
            transition.to = firstNodeId;
          }
        }
      }

      // get the node that was clicked
      var node = this.ProjectService.getNodeById(nodeId);

      if (node != null) {
        this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);

        if (item.checked) {
          // the item was checked so we will add the branch path taken constraints to it

          /*
           * the branch path taken constraints will be from this node to
           * the first node in the branch path
           */
          var fromNodeId = this.nodeId;
          var toNodeId = firstNodeId;

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
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = checkedItemsInBranchPath[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _item = _step9.value;

          var itemNodeId = _item.$key;
          this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(itemNodeId);

          /*
           * the branch path taken constraints will be from this node to
           * the first node in the branch path
           */
          var _fromNodeId = this.nodeId;
          var _toNodeId = firstNodeId;

          // add the branch path taken constraints
          this.ProjectService.addBranchPathTakenConstraints(itemNodeId, _fromNodeId, _toNodeId);
        }

        /*
         * update the node numbers now that a step has been added to a branch path
         * e.g. if this is a branching step that is called
         * 1.5 B View the Potential Energy
         * then the node number is 1.5 B
         */
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      this.ProjectService.calculateNodeNumbers();
      this.authoringViewNodeChanged();
    }

    /**
     * The score for a path has changed in the branch authoring
     * @param branch the branch for which the score has changed
     * TODO refactor too many nesting
     */

  }, {
    key: 'createBranchScoreChanged',
    value: function createBranchScoreChanged(branch) {
      if (branch != null) {
        var transition = branch.transition;
        if (transition != null) {
          var scores = branch.scores;
          if (scores != null) {
            var criteria = transition.criteria;
            if (criteria != null) {
              // get the first criteria. we will assume there is only one criteria
              var criterion = criteria[0];
              if (criterion != null) {
                // get the params of the criterion
                var params = criterion.params;
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

  }, {
    key: 'createBranchMergePointNodeIdChanged',
    value: function createBranchMergePointNodeIdChanged() {
      // get the merge point node id
      var createBranchMergePointNodeId = this.createBranchMergePointNodeId;
      var branches = this.createBranchBranches;
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = branches[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var branch = _step10.value;

          if (branch != null) {
            // get the node ids in the branch path
            var nodeIdsInBranch = branch.nodeIdsInBranch;
            if (nodeIdsInBranch != null && nodeIdsInBranch.length > 0) {
              // get the last node id in the branch path
              var lastNodeIdInBranchPath = nodeIdsInBranch[nodeIdsInBranch.length - 1];
              if (lastNodeIdInBranchPath != null) {
                // get the last node in the branch path
                var lastNodeInBranchPath = this.ProjectService.getNodeById(lastNodeIdInBranchPath);
                if (lastNodeInBranchPath != null) {
                  // get the transition logic of the last node
                  var transitionLogic = lastNodeInBranchPath.transitionLogic;
                  if (transitionLogic != null) {
                    if (transitionLogic.transitions != null) {
                      // clear the transitions
                      transitionLogic.transitions = [];

                      // make a new transition to the merge point
                      var transition = {
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
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      this.ProjectService.calculateNodeNumbers();

      // save the project
      var parseProject = true;
      this.authoringViewNodeChanged(parseProject);
    }

    /**
     * Remove the branch after confirming with the user
     */

  }, {
    key: 'removeBranchButtonClicked',
    value: function removeBranchButtonClicked() {
      if (confirm(this.$translate('areYouSureYouWantToRemoveTheBranch'))) {
        this.removeBranch();
      }
    }

    /**
     * Remove the branch from the step by removing all the branch paths
     */

  }, {
    key: 'removeBranch',
    value: function removeBranch() {
      for (var bp = 0; bp < this.createBranchBranches.length; bp++) {
        // remove a branch path
        var branchPath = this.createBranchBranches[bp];
        this.removeBranchPath(branchPath);

        /*
         * shift the counter back one because we have just removed a branch
         * path
         */
        bp--;
      }

      // get the node id of this node (which is the branch point)
      var nodeId = this.node.id;

      // get the node id that comes after this node
      var nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);

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
      var branch = {};

      // set the branch number for display purposes
      branch.number = 1;

      /*
       * set the mapping of all the ids to order for use when choosing which items are
       * in the branch path
       */
      branch.items = this.UtilService.makeCopyOfJSONObject(this.ProjectService.idToOrder);

      // an array that will hold all the checked items in the branch path
      branch.checkedItemsInBranchPath = [];

      var transition = null;

      // get the transition from the node
      var transitions = this.ProjectService.getTransitionsByFromNodeId(nodeId);

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
      var parseProject = true;
      this.authoringViewNodeChanged(parseProject);
    }

    /**
     * Remove a branch path by removing all the branch path taken constraints
     * from the steps in the branch path, resetting the transitions in the
     * steps in the branch path, and removing the transition corresponding to
     * the branch path in this branch point node.
     * @param branch the branch object
     */

  }, {
    key: 'removeBranchPath',
    value: function removeBranchPath(branch) {
      if (branch != null) {
        // get the checked items in the branch path
        var checkedItemsInBranchPath = branch.checkedItemsInBranchPath;
        if (checkedItemsInBranchPath != null) {
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = checkedItemsInBranchPath[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var checkedItem = _step11.value;

              if (checkedItem != null) {
                // get the node id of the checked item
                var nodeId = checkedItem.$key;
                this.ProjectService.removeBranchPathTakenNodeConstraintsIfAny(nodeId);

                /*
                 * update the transition of the step to point to the next step
                 * in the project. this may be different than the next step
                 * if it was still in the branch path.
                 */
                var nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);
                this.ProjectService.setTransition(nodeId, nodeIdAfter);
              }
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }
        }
        // get the index of the branch path
        var branchPathIndex = this.createBranchBranches.indexOf(branch);

        // remove the branch path
        this.createBranchBranches.splice(branchPathIndex, 1);

        // remove the transition that corresponds to the branch path
        this.node.transitionLogic.transitions.splice(branchPathIndex, 1);
      }
    }

    /**
     * The author has changed the step rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {
      // get the summernote rubric html
      var html = this.summernoteRubricHTML;

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

  }, {
    key: 'showComponentAuthoring',
    value: function showComponentAuthoring() {
      this.showComponentAuthoringViews = true;
    }

    /**
     * Hide the component authoring views so that the auther only sees
     * the component numbers and component names
     */

  }, {
    key: 'hideComponentAuthoring',
    value: function hideComponentAuthoring() {
      this.showComponentAuthoringViews = false;
    }

    /**
     * Show the insert buttons. This is used when choosing where to insert a
     * component.
     */

  }, {
    key: 'turnOnInsertComponentMode',
    value: function turnOnInsertComponentMode() {
      this.insertComponentMode = true;
    }

    /**
     * Hide the insert buttons.
     */

  }, {
    key: 'turnOffInsertComponentMode',
    value: function turnOffInsertComponentMode() {
      this.insertComponentMode = false;
    }

    /**
     * Turn on the add component mode
     */

  }, {
    key: 'turnOnAddComponentMode',
    value: function turnOnAddComponentMode() {
      this.addComponentMode = true;
    }

    /**
     * Turn off the add component mode
     */

  }, {
    key: 'turnOffAddComponentMode',
    value: function turnOffAddComponentMode() {
      this.addComponentMode = false;
    }

    /**
     * Turn on the move component mode
     */

  }, {
    key: 'turnOnMoveComponentMode',
    value: function turnOnMoveComponentMode() {
      this.moveComponentMode = true;
    }

    /**
     * Turn off the move component mode
     */

  }, {
    key: 'turnOffMoveComponentMode',
    value: function turnOffMoveComponentMode() {
      this.moveComponentMode = false;
    }

    /**
     * Turn on the copy component mode
     */

  }, {
    key: 'turnOnCopyComponentMode',
    value: function turnOnCopyComponentMode() {
      this.copyComponentMode = true;
    }

    /**
     * Turn off the copy component mode
     */

  }, {
    key: 'turnOffCopyComponentMode',
    value: function turnOffCopyComponentMode() {
      this.copyComponentMode = false;
    }

    /**
     * Turn on the import component mode
     */

  }, {
    key: 'turnOnImportComponentMode',
    value: function turnOnImportComponentMode() {
      this.importComponentMode = true;
    }

    /**
     * Turn off the import component mode
     */

  }, {
    key: 'turnOffImportComponentMode',
    value: function turnOffImportComponentMode() {
      this.importComponentMode = false;
    }

    /**
     * Get the components that have been selected
     * @return an array of component ids that have been selected
     */

  }, {
    key: 'getSelectedComponentIds',
    value: function getSelectedComponentIds() {
      var selectedComponents = [];
      if (this.components != null) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = this.components[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var component = _step12.value;

            if (component != null && component.id != null) {
              // see if the component is checked
              var checked = this.componentsToChecked[component.id];
              if (checked) {
                selectedComponents.push(component.id);
              }
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      }
      return selectedComponents;
    }

    /**
     * Uncheck all the components
     */

  }, {
    key: 'clearComponentsToChecked',
    value: function clearComponentsToChecked() {
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

  }, {
    key: 'getSelectedComponentNumbersAndTypes',
    value: function getSelectedComponentNumbersAndTypes(componentIds) {
      var selectedComponents = [];
      if (this.components != null) {
        for (var c = 0; c < this.components.length; c++) {
          var component = this.components[c];
          if (component != null && component.id != null) {
            // see if the component is checked
            var checked = this.componentsToChecked[component.id];
            if (checked) {
              // get the component number and type example "1. OpenResponse"
              var componentNumberAndType = c + 1 + '. ' + component.type;

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

  }, {
    key: 'importButtonClicked',
    value: function importButtonClicked() {
      var _this3 = this;

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
          this.ConfigService.getLibraryProjects().then(function (libraryProjectsList) {
            _this3.libraryProjectsList = libraryProjectsList;
          });
        }
      }
    }

    /**
     * The move component button was clicked
     */

  }, {
    key: 'moveButtonClicked',
    value: function moveButtonClicked() {
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
        this.turnOnInsertComponentMode();

        // hide the component authoring
        this.hideComponentAuthoring();
      }
    }

    /**
     * The copy component button was clicked
     */

  }, {
    key: 'copyButtonClicked',
    value: function copyButtonClicked() {
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

  }, {
    key: 'deleteButtonClicked',
    value: function deleteButtonClicked() {
      var _this4 = this;

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
        this.$timeout(function () {
          var confirmMessage = '';

          // get the selected component numbers and types
          var selectedComponentNumbersAndTypes = _this4.getSelectedComponentNumbersAndTypes();

          if (selectedComponentNumbersAndTypes.length == 1) {
            // there is one selected component
            confirmMessage = _this4.$translate('areYouSureYouWantToDeleteThisComponent');
          } else if (selectedComponentNumbersAndTypes.length > 1) {
            // there are multiple selected components
            confirmMessage = _this4.$translate('areYouSureYouWantToDeleteTheseComponents');
          }

          // loop through all the selected components
          for (var c = 0; c < selectedComponentNumbersAndTypes.length; c++) {

            // get a component number and type
            var selectedComponentNumberAndType = selectedComponentNumbersAndTypes[c];

            // show the component number and type in the message
            confirmMessage += '\n' + selectedComponentNumberAndType;
          }

          // ask the user if they are sure they want to delete
          if (confirm(confirmMessage)) {
            var selectedComponents = _this4.getSelectedComponentIds();

            // data saved in the component deleted event
            var data = {
              "componentsDeleted": _this4.getComponentObjectsForEventData(selectedComponents)
            };

            /*
             * loop through all the selected component ids and delete the
             * components
             */
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
              for (var _iterator13 = selectedComponents[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var componentId = _step13.value;

                _this4.ProjectService.deleteComponent(_this4.nodeId, componentId);
              }
            } catch (err) {
              _didIteratorError13 = true;
              _iteratorError13 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                  _iterator13.return();
                }
              } finally {
                if (_didIteratorError13) {
                  throw _iteratorError13;
                }
              }
            }

            _this4.saveEvent('componentDeleted', 'Authoring', data);

            // check if we need to show the node save or node submit buttons
            _this4.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();

            _this4.ProjectService.saveProject();
          } else {
            // uncheck the component check boxes
            _this4.clearComponentsToChecked();
          }

          /*
           * Wait a small amount of time before returning the UI back to the
           * normal view. This allows the author to see the component number
           * and type view a little longer so that they can see the change
           * they just made before we switch back to the normal view.
           */
          _this4.$timeout(function () {
            // turn off the insert component mode
            _this4.turnOffInsertComponentMode();

            // uncheck the component check boxes
            _this4.clearComponentsToChecked();

            // show the component authoring
            _this4.showComponentAuthoring();
          }, 2000);
        });
      }
    }

    /**
     * The cancel insert button was clicked
     */

  }, {
    key: 'cancelInsertClicked',
    value: function cancelInsertClicked() {
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

  }, {
    key: 'checkIfNeedToShowNodeSaveOrNodeSubmitButtons',
    value: function checkIfNeedToShowNodeSaveOrNodeSubmitButtons() {
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

  }, {
    key: 'insertComponentAsFirst',
    value: function insertComponentAsFirst() {
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

  }, {
    key: 'insertComponentAfter',
    value: function insertComponentAfter(componentId) {
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

  }, {
    key: 'handleAddComponent',
    value: function handleAddComponent(componentId) {
      var newComponents = [];
      // create a component and add it to this node
      var newComponent = this.ProjectService.createComponent(this.nodeId, this.selectedComponent, componentId);

      var data = {
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

  }, {
    key: 'handleMoveComponent',
    value: function handleMoveComponent(componentId) {
      var newComponents = [];
      var selectedComponentIds = this.getSelectedComponentIds();
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
        var data = {
          "componentsMoved": this.getComponentObjectsForEventData(selectedComponentIds)
        };

        // move the components to their new location
        newComponents = this.ProjectService.moveComponent(this.nodeId, selectedComponentIds, componentId);

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

  }, {
    key: 'handleCopyComponent',
    value: function handleCopyComponent(componentId) {
      var newComponents = [];
      var selectedComponentIds = this.getSelectedComponentIds();

      // data saved in the component copied event
      var data = {};
      var componentsCopied = this.getComponentObjectsForEventData(selectedComponentIds);

      // copy the components to their new location
      newComponents = this.ProjectService.copyComponentAndInsert(this.nodeId, selectedComponentIds, componentId);

      // get the information for all the components that were copied
      for (var c = 0; c < componentsCopied.length; c++) {
        var componentCopied = componentsCopied[c];
        var newComponent = newComponents[c];

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

  }, {
    key: 'handleImportComponent',
    value: function handleImportComponent(componentId) {
      var _this5 = this;

      // import the selected components and insert them
      this.importComponents(this.nodeId, componentId).then(function (newComponents) {
        _this5.turnOffImportComponentMode();
        _this5.ProjectService.saveProject();
        _this5.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);

        /*
         * refresh the project assets in case any of the imported
         * components also imported assets
         */
        _this5.ProjectAssetService.retrieveProjectAssets();
      });
    }

    /**
     * Temporarily highlight the new components and then show the component
     * authoring views. Used to bring user's attention to new changes.
     * @param newComponents an array of the new components we have just added
     */

  }, {
    key: 'highlightNewComponentsAndThenShowComponentAuthoring',
    value: function highlightNewComponentsAndThenShowComponentAuthoring(newComponents) {
      var _this6 = this;

      // use a timeout to allow the components time to show up in the UI
      this.$timeout(function () {
        if (newComponents != null) {
          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = newComponents[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var newComponent = _step14.value;

              if (newComponent != null) {
                _this6.UtilService.temporarilyHighlightElement(newComponent.id);
              }
            }
          } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion14 && _iterator14.return) {
                _iterator14.return();
              }
            } finally {
              if (_didIteratorError14) {
                throw _iteratorError14;
              }
            }
          }
        }

        /*
         * Wait a small amount of time before returning the UI back to the
         * normal view. This allows the author to see the component number
         * and type view a little longer so that they can see the change
         * they just made before we switch back to the normal view.
         */
        _this6.$timeout(function () {
          _this6.showComponentAuthoring();
          _this6.turnOffInsertComponentMode();
          _this6.nodeAuthoringViewButtonClicked();
          _this6.clearComponentsToChecked();

          /*
           * use a timeout to wait for the UI to update and then scroll
           * to the first new component
           */
          _this6.$timeout(function () {
            if (newComponents != null && newComponents.length > 0) {
              // get the UI element of the first new component
              var componentElement = $('#' + newComponents[0].id);

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

  }, {
    key: 'showMyImportProject',
    value: function showMyImportProject(importProjectId) {
      // clear the select drop down for the library project
      this.importLibraryProjectId = null;

      this.showImportProject(importProjectId);
    }

    /**
     * The author has chosen a library project to import from
     * @param importProjectId the project id to import from
     */

  }, {
    key: 'showLibraryImportProject',
    value: function showLibraryImportProject(importProjectId) {
      this.importMyProjectId = null;
      this.showImportProject(importProjectId);
    }

    /**
     * Show the project we want to import steps from
     * @param importProjectId the import project id
     */

  }, {
    key: 'showImportProject',
    value: function showImportProject(importProjectId) {
      var _this7 = this;

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
        this.ProjectService.retrieveProjectById(this.importProjectId).then(function (projectJSON) {

          // create the mapping of node id to order for the import project
          _this7.importProjectIdToOrder = {};
          _this7.importProject = projectJSON;

          // calculate the node order of the import project
          var result = _this7.ProjectService.getNodeOrderOfProject(_this7.importProject);
          _this7.importProjectIdToOrder = result.idToOrder;
          _this7.importProjectItems = result.nodes;
        });
      }
    }

    /**
     * Import the selected steps
     */

  }, {
    key: 'importComponentsButtonClicked',
    value: function importComponentsButtonClicked() {
      var selectedComponents = this.getSelectedComponentsToImport();
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

  }, {
    key: 'getSelectedComponentsToImport',
    value: function getSelectedComponentsToImport() {
      var selectedComponents = [];
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.importProjectItems[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var item = _step15.value;

          if (item != null && item.node != null && item.node.components != null) {
            var componentsInNode = item.node.components;
            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
              for (var _iterator16 = componentsInNode[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                var component = _step16.value;

                if (component != null && component.checked) {
                  /*
                   * this component is checked so we will add it to
                   * the array of components that we will import
                   */
                  selectedComponents.push(component);
                }
              }
            } catch (err) {
              _didIteratorError16 = true;
              _iteratorError16 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                  _iterator16.return();
                }
              } finally {
                if (_didIteratorError16) {
                  throw _iteratorError16;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
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

  }, {
    key: 'importComponents',
    value: function importComponents(nodeId, insertAfterComponentId) {
      var _this8 = this;

      // data saved in the component imported event
      var data = {
        "componentsImported": this.getComponentObjectsForImportEventData()
      };

      var selectedComponents = this.getSelectedComponentsToImport();
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = selectedComponents[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var selectedComponent = _step17.value;

          if (selectedComponent != null) {
            // remove the checked field
            delete selectedComponent.checked;
          }
        }

        // insert the components into the project
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      return this.ProjectService.importComponents(selectedComponents, this.importProjectId, nodeId, insertAfterComponentId).then(function (newComponents) {
        for (var c = 0; c < data.componentsImported.length; c++) {
          var componentImported = data.componentsImported[c];
          var newComponent = newComponents[c];
          var newComponentId = newComponent.id;

          /*
          * set the toComponentId so the event knows what the new
          * component id is
          */
          componentImported.toComponentId = newComponentId;
        }

        _this8.saveEvent('componentImported', 'Authoring', data);
        return newComponents;
      });
    }
  }, {
    key: 'scrollToTopOfPage',
    value: function scrollToTopOfPage() {
      this.$anchorScroll('top');
    }

    /**
     * Preview the import project in a new tab
     */

  }, {
    key: 'previewImportProject',
    value: function previewImportProject() {
      if (this.importProject != null) {
        window.open(this.importProject.previewProjectURL);
      }
    }

    /**
     * Preview the step in a new tab
     * @param node
     */

  }, {
    key: 'previewImportNode',
    value: function previewImportNode(node) {
      if (node != null) {
        var nodeId = node.id;
        var previewProjectURL = this.importProject.previewProjectURL;
        var previewStepURL = previewProjectURL + '#/vle/' + nodeId;
        window.open(previewStepURL);
      }
    }

    /**
     * Preview the component in a new tab
     * @param node the node
     * @param componentId the component id
     */

  }, {
    key: 'previewImportComponent',
    value: function previewImportComponent(node, componentId) {
      if (node != null) {
        var nodeId = node.id;
        var previewProjectURL = this.importProject.previewProjectURL;
        var previewStepURL = previewProjectURL + '#/vle/' + nodeId + '/' + componentId;
        window.open(previewStepURL);
      }
    }

    /**
     * We are in the create a new component mode and the user has clicked
     * on a component type
     * @param componentType the component type the author clicked
     */

  }, {
    key: 'componentTypeClicked',
    value: function componentTypeClicked(componentType) {
      this.selectedComponent = componentType;
    }

    /**
     * We are in the create a new component mode and the user has clicked
     * on the cancel button
     */

  }, {
    key: 'cancelCreateComponentClicked',
    value: function cancelCreateComponentClicked() {
      // hide all the authoring views
      this.nodeAuthoringViewButtonClicked();

      this.turnOffAddComponentMode();
      this.turnOffMoveComponentMode();
      this.turnOffInsertComponentMode();
      this.showComponentAuthoring();
    }

    /**
     * Get the component type label
     * @param componentType the component type
     * @return the component type label
     * example
     * "Open Response"
     */

  }, {
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel(componentType) {
      return this.UtilService.getComponentTypeLabel(componentType);
    }

    /**
     * The author has clicked the back button
     */

  }, {
    key: 'backButtonClicked',
    value: function backButtonClicked() {
      if (this.showImportView || this.showRubric || this.showAdvanced) {
        this.UtilService.hideJSONValidMessage();

        // we are in the import view so we will go back to the node view
        this.nodeAuthoringViewButtonClicked();

        this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
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

  }, {
    key: 'saveEvent',
    value: function saveEvent(eventName, category, data) {
      var context = 'AuthoringTool';
      var nodeId = this.nodeId;
      var componentId = null;
      var componentType = null;
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

  }, {
    key: 'getComponentObjectsForEventData',
    value: function getComponentObjectsForEventData(componentIds) {
      var componentObjects = [];
      if (componentIds != null) {
        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = componentIds[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var componentId = _step18.value;

            if (componentId != null) {
              var component = this.ProjectService.getComponentByNodeIdAndComponentId(this.nodeId, componentId);

              if (component != null) {
                var tempComponent = {
                  "componentId": component.id,
                  "type": component.type
                };
                componentObjects.push(tempComponent);
              }
            }
          }
        } catch (err) {
          _didIteratorError18 = true;
          _iteratorError18 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion18 && _iterator18.return) {
              _iterator18.return();
            }
          } finally {
            if (_didIteratorError18) {
              throw _iteratorError18;
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

  }, {
    key: 'getComponentObjectsForImportEventData',
    value: function getComponentObjectsForImportEventData() {
      var componentObjects = [];
      var _iteratorNormalCompletion19 = true;
      var _didIteratorError19 = false;
      var _iteratorError19 = undefined;

      try {
        for (var _iterator19 = this.importProjectItems[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
          var item = _step19.value;

          if (item != null && item.node != null && item.node.components != null) {
            var _iteratorNormalCompletion20 = true;
            var _didIteratorError20 = false;
            var _iteratorError20 = undefined;

            try {
              for (var _iterator20 = item.node.components[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                var component = _step20.value;

                if (component != null && component.checked) {
                  var tempComponent = {
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
            } catch (err) {
              _didIteratorError20 = true;
              _iteratorError20 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion20 && _iterator20.return) {
                  _iterator20.return();
                }
              } finally {
                if (_didIteratorError20) {
                  throw _iteratorError20;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion19 && _iterator19.return) {
            _iterator19.return();
          }
        } finally {
          if (_didIteratorError19) {
            throw _iteratorError19;
          }
        }
      }

      return componentObjects;
    }

    /**
     * Save the project JSON to the server if the JSON is valid.
     */

  }, {
    key: 'autoSaveJSON',
    value: function autoSaveJSON() {
      var _this9 = this;

      try {
        // create the updated node object
        var updatedNode = angular.fromJson(this.authoringNodeContentJSONString);

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
        this.authoringViewNodeChanged().then(function () {
          _this9.$rootScope.$broadcast('parseProject');
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

  }, {
    key: 'componentAdvancedButtonClicked',
    value: function componentAdvancedButtonClicked(componentId) {
      this.$rootScope.$broadcast('componentAdvancedButtonClicked', { componentId: componentId });
    }

    /**
     * A constraint removal criteria step has changed.
     * @param criteria The removal criteria object.
     */

  }, {
    key: 'authoringViewConstraintRemovalCriteriaNodeIdChanged',
    value: function authoringViewConstraintRemovalCriteriaNodeIdChanged(criteria) {
      criteria.params.componentId = '';
      this.authoringViewNodeChanged();
    }

    /**
     * A constraint removal criteria component has changed.
     * @param criteria The removal criteria object.
     */

  }, {
    key: 'authoringViewConstraintRemovalCriteriaComponentIdChanged',
    value: function authoringViewConstraintRemovalCriteriaComponentIdChanged(criteria) {
      this.authoringViewNodeChanged();
    }
  }]);

  return NodeAuthoringController;
}();

NodeAuthoringController.$inject = ['$anchorScroll', '$filter', '$injector', '$location', '$mdDialog', '$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'ConfigService', 'NodeService', 'ProjectAssetService', 'ProjectService', 'TeacherDataService', 'UtilService'];

exports.default = NodeAuthoringController;
//# sourceMappingURL=nodeAuthoringController.js.map
