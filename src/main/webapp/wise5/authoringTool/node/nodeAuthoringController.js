'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeAuthoringController = function () {
    function NodeAuthoringController($anchorScroll, $filter, $injector, $location, $mdDialog, $scope, $state, $stateParams, $timeout, ConfigService, ProjectService, UtilService) {
        var _this = this;

        _classCallCheck(this, NodeAuthoringController);

        this.$anchorScroll = $anchorScroll;
        this.$filter = $filter;
        this.$injector = $injector;
        this.$location = $location;
        this.$mdDialog = $mdDialog;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$translate = this.$filter('translate');
        this.ConfigService = ConfigService;
        this.ProjectService = ProjectService;
        this.UtilService = UtilService;
        this.$translate = this.$filter('translate');
        this.projectId = $stateParams.projectId;
        this.nodeId = $stateParams.nodeId;
        this.showCreateComponent = false;
        this.showEditTransitions = false;
        this.selectedComponent = null;
        this.nodeCopy = null;
        this.undoStack = [];
        this.howToChooseAmongAvailablePathsOptions = [null, "random", "workgroupId", "firstAvailable", "lastAvailable"];
        this.whenToChoosePathOptions = [null, "enterNode", "exitNode", "scoreChanged", "studentDataChanged"];
        this.canChangePathOptions = [null, true, false];
        this.createBranchBranches = [];

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
                text: this.$translate('nodeID')
            }]
        }, {
            value: "score",
            text: this.$translate('SCORE'),
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
            value: "branchPathTaken",
            text: this.$translate('branchPathTaken'),
            params: [{
                value: "fromNodeId",
                text: this.$translate('fromNodeID')
            }, {
                value: "toNodeId",
                text: this.$translate('toNodeID')
            }]
        }, {
            value: "choiceChosen",
            text: this.$translate('choiceChosen'),
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
        }, {
            value: "isCorrect",
            text: this.$translate('IS_CORRECT'),
            params: [{
                value: "nodeId",
                text: this.$translate('nodeID')
            }, {
                value: "componentId",
                text: this.$translate('componentID')
            }]
        }, {
            value: "usedXSubmits",
            text: this.$translate('usedXSubmits'),
            params: [{
                value: "nodeId",
                text: this.$translate('nodeID')
            }, {
                value: "componentId",
                text: this.$translate('componentID')
            }, {
                value: "requiredSubmitCount",
                text: this.$translate('requiredSubmitCount')
            }]
        }, {
            value: "isVisible",
            text: this.$translate('isVisible'),
            params: [{
                value: "nodeId",
                text: this.$translate('nodeID')
            }]
        }, {
            value: "isVisitable",
            text: this.$translate('isVisitable'),
            params: [{
                value: "nodeId",
                text: this.$translate('nodeID')
            }]
        }, {
            value: "isVisited",
            text: this.$translate('isVisited'),
            params: [{
                value: "nodeId",
                text: this.$translate('nodeID')
            }]
        }, {
            value: "isPlanningActivityCompleted",
            text: this.$translate('isPlanningActivityCompleted')
        }];

        // available transitionCriterias
        this.transitionCriterias = [{
            value: "score",
            text: this.$translate('SCORE'),
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
            text: this.$translate('choiceChosen'),
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
        this.componentTypes = [{ componentType: 'AudioOscillator', componentName: 'Audio Oscillator' }, { componentType: 'ConceptMap', componentName: 'Concept Map' }, { componentType: 'Discussion', componentName: 'Discussion' }, { componentType: 'Draw', componentName: 'Draw' }, { componentType: 'Embedded', componentName: 'Embedded' }, { componentType: 'Graph', componentName: 'Graph' }, { componentType: 'HTML', componentName: 'HTML' }, { componentType: 'Label', componentName: 'Label' }, { componentType: 'Match', componentName: 'Match' }, { componentType: 'MultipleChoice', componentName: 'Multiple Choice' }, { componentType: 'OpenResponse', componentName: 'Open Response' }, { componentType: 'OutsideURL', componentName: 'Outside URL' }, { componentType: 'Table', componentName: 'Table' }];

        // set the drop down to the first item
        this.selectedComponent = this.componentTypes[0].componentType;

        // get the node
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
        var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, null, 'rubric', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        this.summernoteRubricOptions = {
            toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
            height: 300,
            disableDragAndDrop: true,
            buttons: {
                insertAssetButton: InsertAssetButton
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
         */
        this.$scope.$on('assetSelected', function (event, args) {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == _this.nodeId && args.componentId == null) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + _this.nodeId;
                            }

                            if (summernoteId != '') {
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
                                    videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                    $('#' + summernoteId).summernote('insertNode', videoElement);
                                }
                            }
                        }
                    }
                }
            }

            // close the popup
            _this.$mdDialog.hide();
        });

        this.$scope.$on('componentShowSubmitButtonValueChanged', function (event, args) {
            var nodeId = args.nodeId;
            var componentId = args.componentId;
            var showSubmitButton = args.showSubmitButton;

            if (showSubmitButton) {
                /*
                 * a component is showing their submit button so we will hide
                 * the step save button and submit buttons
                 */

                _this.node.showSaveButton = false;
                _this.node.showSubmitButton = false;

                // turn on the save buttons for all components in this step
                _this.ProjectService.turnOnSaveButtonInComponents(_this.node.id);
            } else {
                /*
                 * a component is hiding their submit button so we may need
                 * to show the step save button
                 */

                if (_this.ProjectService.doesAnyComponentShowSubmitButton(_this.node.id)) {
                    /*
                     * there is at least one component in the step that is showing
                     * their submit button so we will show the save button on
                     * all the components
                     */

                    // turn on the save buttons for all components in this step
                    _this.ProjectService.turnOnSaveButtonInComponents(_this.node.id);
                } else {
                    /*
                     * no components in this step show their submit button so we
                     * will show the step save button
                     */
                    _this.node.showSaveButton = true;
                    _this.node.showSubmitButton = false;

                    // turn off the save buttons for all the components
                    _this.ProjectService.turnOffSaveButtonInComponents(_this.node.id);
                }
            }

            // save changes
            _this.authoringViewNodeChanged();
        });
    }

    /**
     * Populate the branch authoring
     */


    _createClass(NodeAuthoringController, [{
        key: 'populateBranchAuthoring',
        value: function populateBranchAuthoring() {
            if (this.node.transitionLogic != null) {

                // get the number of branches
                if (this.node.transitionLogic.transitions != null) {
                    this.createBranchNumberOfBranches = this.node.transitionLogic.transitions.length;
                } else {
                    this.createBranchNumberOfBranches = 0;
                }

                // loop through all the transitions
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

                            // loop through all the criterion
                            for (var c = 0; c < criteria.length; c++) {

                                // get a criterion
                                var criterion = criteria[c];

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
                                        var choices = this.getChoicesByNodeIdAndComponentId(this.createBranchNodeId, this.createBranchComponentId);

                                        if (choices != null) {
                                            // set the choices into the branch object
                                            branch.choices = this.UtilService.makeCopyOfJSONObject(choices);
                                        }
                                    }
                                }
                            }
                        }

                        // get the node ids in the branch path
                        var nodeIdsInBranch = this.ProjectService.getNodeIdsInBranch(this.nodeId, transition.to);

                        // loop through all the node ids in the branch path
                        for (var n = 0; n < nodeIdsInBranch.length; n++) {

                            // get a node id in the branch path
                            var nodeId = nodeIdsInBranch[n];

                            // get the item
                            var item = branch.items[nodeId];

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
                            var lastNodeIdInBranch = nodeIdsInBranch[nodeIdsInBranch.length - 1];

                            if (lastNodeIdInBranch != null) {

                                var transitionsFromLastNode = this.ProjectService.getTransitionsByFromNodeId(lastNodeIdInBranch);

                                if (transitionsFromLastNode != null && transitionsFromLastNode.length > 0) {
                                    var transition = transitionsFromLastNode[0];

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

    }, {
        key: 'previewStep',
        value: function previewStep() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            var previewStepURL = previewProjectURL + "#/vle/" + this.nodeId;
            window.open(previewStepURL);
        }
    }, {
        key: 'previewStepWithoutConstraints',


        /**
         * Launch VLE with this current step as the initial step without constraints
         */
        value: function previewStepWithoutConstraints() {
            var previewProjectURL = this.ConfigService.getConfigParam("previewProjectURL");
            var previewStepURL = previewProjectURL + "?constraints=false" + "#/vle/" + this.nodeId;
            window.open(previewStepURL);
        }
    }, {
        key: 'close',


        /**
         * Close the node authoring view
         */
        value: function close() {
            // perform any node cleanup if necessary
            //let commitMessage = "Made changes to Step.";
            //this.ProjectService.saveProject(commitMessage);

            this.$scope.$broadcast('exitNode', { nodeToExit: this.node });

            this.$state.go('root.project', { projectId: this.projectId });
        }
    }, {
        key: 'showSaveErrorAdvancedAuthoring',


        /**
         * Display an error saving during advanced authoring, most-likely due to malformed JSON
         */
        value: function showSaveErrorAdvancedAuthoring() {
            alert(this.$translate('saveErrorAdvancedAuthoring'));
        }
    }, {
        key: 'cancel',


        /**
         * The author has clicked the cancel button which will revert all
         * the recent changes since they opened the node.
         */
        value: function cancel() {

            // check if the user has made any changes
            if (!angular.equals(this.node, this.originalNodeCopy)) {
                // the user has made changes

                var result = confirm(this.$translate('confirmUndo'));

                if (result) {
                    // revert the node back to the previous version
                    this.ProjectService.replaceNode(this.nodeId, this.originalNodeCopy);

                    // save the project
                    this.ProjectService.saveProject();

                    // close the node authoring view
                    this.close();
                }
            } else {
                // the user has not made any changes

                //close the node authoring view
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
         * Add a new transition criteria for the specified transition.
         */

    }, {
        key: 'addNewTransitionCriteria',
        value: function addNewTransitionCriteria(transition) {
            var nodeTransitions = this.node.transitionLogic.transitions;
            for (var n = 0; n < nodeTransitions.length; n++) {
                var nodeTransition = nodeTransitions[n];
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
         */

    }, {
        key: 'deleteTransition',
        value: function deleteTransition(transition) {
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

        /**
         * Save transitions for this node
         */

    }, {
        key: 'saveTransitions',
        value: function saveTransitions() {

            // save the project
            this.ProjectService.saveProject();

            // hide the create component elements
            this.showEditTransitions = false;
        }

        /**
         * Create a component in this node
         */

    }, {
        key: 'createComponent',
        value: function createComponent() {
            var _this2 = this;

            // create a component and add it to this node
            this.ProjectService.createComponent(this.nodeId, this.selectedComponent);

            // save the project
            this.ProjectService.saveProject();

            // hide the create component elements
            this.showCreateComponent = false;

            // Scroll to the bottom of the page where the new component was added
            this.$timeout(function () {
                _this2.$location.hash('bottom');
                _this2.$anchorScroll();
            });
        }

        /**
         * Move a component up within this node
         * @param componentId the component id
         */

    }, {
        key: 'moveComponentUp',
        value: function moveComponentUp(componentId) {

            // move the component up within the node
            this.ProjectService.moveComponentUp(this.nodeId, componentId);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Move a component up within this node
         * @param componentId the component id
         */

    }, {
        key: 'moveComponentDown',
        value: function moveComponentDown(componentId) {

            // move the component down within the node
            this.ProjectService.moveComponentDown(this.nodeId, componentId);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Delete the component from this node
         * @param componentId the component id
         */

    }, {
        key: 'deleteComponent',
        value: function deleteComponent(componentId) {

            // ask the user to confirm the delete
            var answer = confirm(this.$translate('confirmDeleteComponent'));

            if (answer) {
                // the user confirmed yes

                // delete the component from the node
                this.ProjectService.deleteComponent(this.nodeId, componentId);

                if (this.ProjectService.doesAnyComponentShowSubmitButton(this.nodeId)) {
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

                // save the project
                this.ProjectService.saveProject();
            }
        }

        /**
         * Hide the save button in all the components
         */

    }, {
        key: 'hideAllComponentSaveButtons',
        value: function hideAllComponentSaveButtons() {

            var components = this.components;

            if (components != null) {

                // loop through all the components
                for (var c = 0; c < components.length; c++) {
                    var component = components[c];

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
            }
        }

        /**
         * The node has changed in the authoring view
         */

    }, {
        key: 'authoringViewNodeChanged',
        value: function authoringViewNodeChanged() {
            // put the previous version of the node on to the undo stack
            this.undoStack.push(this.currentNodeCopy);

            // save the project
            this.ProjectService.saveProject();

            // update the current node copy
            this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
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

                // ask the user to confirm the delete
                var result = confirm(this.$translate('confirmUndoLastChange'));

                if (result) {
                    // perform any node cleanup if necessary
                    this.$scope.$broadcast('exitNode', { nodeToExit: this.node });

                    // get the previous version of the node
                    var nodeCopy = this.undoStack.pop();

                    // revert the node back to the previous version
                    this.ProjectService.replaceNode(this.nodeId, nodeCopy);

                    // get the node
                    this.node = this.ProjectService.getNodeById(this.nodeId);

                    // get the components in the node
                    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

                    // save the project
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

                // loop through all the available removal criteria
                for (var r = 0; r < this.removalCriteria.length; r++) {

                    // get a single removal criteria
                    var singleRemovalCriteria = this.removalCriteria[r];

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

    }, {
        key: 'getTransitionCriteriaParamsByName',
        value: function getTransitionCriteriaParamsByName(name) {
            var params = [];

            if (name != null) {

                // loop through all the available transition criteria
                for (var t = 0; t < this.transitionCriterias.length; t++) {

                    // get a single transition criteria
                    var singleTransitionCriteria = this.transitionCriterias[t];

                    if (singleTransitionCriteria != null) {

                        if (singleTransitionCriteria.value == name) {
                            /*
                             * we have found the removal criteria we are looking for
                             * so we will get its params
                             */
                            params = singleTransitionCriteria.params;
                            break;
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

            var choices = [];

            // get the component
            var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

            if (component != null && component.choices != null) {
                // get the choices
                choices = component.choices;
            }

            return choices;
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

            // get the component
            var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

            if (component != null && component.choiceType != null) {
                // get the choice type
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

            // get the node content
            var node = this.ProjectService.getNodeById(nodeId);

            if (node != null) {

                // get the constraints
                var constraints = node.constraints;

                if (constraints != null) {

                    // loop through all the constraints
                    for (var c = 0; c < constraints.length; c++) {

                        // get a constraint
                        var constraint = constraints[c];

                        if (constraint != null) {

                            // get the id of the constraint
                            var constraintId = constraint.id;

                            // add the constraint id to the array of used constraint ids
                            usedConstraintIds.push(constraintId);
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
         * Add a constraint
         */

    }, {
        key: 'addConstraint',
        value: function addConstraint() {

            // get a new constraint id
            var newNodeConstraintId = this.getNewNodeConstraintId(this.nodeId);

            // create the constraint object
            var constraint = {};
            constraint.id = newNodeConstraintId;
            constraint.action = "";
            constraint.targetId = this.nodeId;
            constraint.removalConditional = "all";
            constraint.removalCriteria = [];

            // create a removal criteria
            var removalCriteria = {};
            removalCriteria.name = "";
            removalCriteria.params = {};

            // add the removal criteria to the constraint
            constraint.removalCriteria.push(removalCriteria);

            // create the constraints array if it does not exist
            if (this.node.constraints == null) {
                this.node.constraints = [];
            }

            // add the constraint to the node
            this.node.constraints.push(constraint);

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Delete a constraint
         * @param constraintIndex delete the constraint at the index
         */

    }, {
        key: 'deleteConstraint',
        value: function deleteConstraint(constraintIndex) {

            if (constraintIndex != null) {
                // get the node content
                var node = this.ProjectService.getNodeById(this.nodeId);

                if (node != null) {

                    // get the constraints
                    var constraints = node.constraints;

                    if (constraints != null) {

                        // remove the constraint at the given index
                        constraints.splice(constraintIndex, 1);
                    }
                }
            }

            // save the project
            this.ProjectService.saveProject();
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
                var removalCriteria = {};
                removalCriteria.name = "";
                removalCriteria.params = {};

                // add the removal criteria to the constraint
                constraint.removalCriteria.push(removalCriteria);
            }

            // save the project
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
            if (constraint != null) {

                // get all the removal criteria
                var removalCriteria = constraint.removalCriteria;

                if (removalCriteria != null) {
                    // remove the single removal criteria
                    removalCriteria.splice(removalCriteriaIndex, 1);
                }
            }

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * Delete a transition criteria from a transition
         * @param constraint remove the removal criteria from this constraint
         * @param removalCriteriaIndex the index of the removal criteria to remove
         */

    }, {
        key: 'deleteTransitionCriteria',
        value: function deleteTransitionCriteria(transition, transitionCriteriaIndex) {
            if (transition != null) {

                // get all the transition criteria
                var transitionCriterias = transition.criteria;

                if (transitionCriterias != null) {
                    // remove the single transition criteria
                    transitionCriterias.splice(transitionCriteriaIndex, 1);
                }
            }

            // save the project
            this.ProjectService.saveProject();
        }

        /**
         * A removal criteria name has changed so we will clear the params so
         * that the params from the previous removal criteria name do not persist
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

                    // loop through all the params
                    for (var p = 0; p < params.length; p++) {
                        var paramObject = params[p];

                        if (paramObject != null) {
                            var value = paramObject.value;

                            // intialize the param value
                            criteria.params[value] = '';

                            if (value == 'nodeId') {
                                // default the node id param to this node
                                criteria.params[value] = this.nodeId;
                            }
                        }
                    }
                }
            }

            // save the project
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

            // save the project
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
                this.showEditTransitions = false;
                this.showConstraints = false;
                this.showEditButtons = false;
                this.showRubric = false;
                this.showCreateBranch = false;
            } else if (view == 'editTransitions') {
                // toggle the edit transitions view and hide all the other views
                this.showCreateComponent = false;
                this.showEditTransitions = !this.showEditTransitions;
                this.showConstraints = false;
                this.showEditButtons = false;
                this.showRubricButton = false;
                this.showCreateBranch = false;
            } else if (view == 'editConstraints') {
                // toggle the edit constraints view and hide all the other views
                this.showCreateComponent = false;
                this.showEditTransitions = false;
                this.showConstraints = !this.showConstraints;
                this.showEditButtons = false;
                this.showRubric = false;
                this.showCreateBranch = false;
            } else if (view == 'editButtons') {
                // toggle the edit buttons view and hide all the other views
                this.showCreateComponent = false;
                this.showEditTransitions = false;
                this.showConstraints = false;
                this.showEditButtons = !this.showEditButtons;
                this.showRubric = false;
                this.showCreateBranch = false;
            } else if (view == 'editRubric') {
                // toggle the edit buttons view and hide all the other views
                this.showCreateComponent = false;
                this.showEditTransitions = false;
                this.showConstraints = false;
                this.showEditButtons = false;
                this.showRubric = !this.showRubric;
                this.showCreateBranch = false;
            } else if (view == 'createBranch') {
                // toggle the edit buttons view and hide all the other views
                this.showCreateComponent = false;
                this.showEditTransitions = false;
                this.showConstraints = false;
                this.showEditButtons = false;
                this.showRubric = false;
                this.showCreateBranch = !this.showCreateBranch;
            }
        }

        /**
         * The author has changed the number of branch paths
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
                    // they answered yes

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

                        // loop through all the branch paths
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
                        var branch = {};

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
                        var transition = {};

                        if (this.createBranchCriterion == 'score') {
                            // the branch is based on score

                            // create a score criterion
                            var criterion = {};
                            criterion.name = this.createBranchCriterion;
                            criterion.params = {};
                            criterion.params.scores = [];

                            if (this.createBranchNodeId != null) {
                                // set the node for which to look for the score
                                criterion.params.nodeId = this.createBranchNodeId;
                            }

                            if (this.createBranchComponentId != null) {
                                // set the component for which to look for the score
                                criterion.params.componentId = this.createBranchComponentId;
                            }

                            transition.criteria = [];
                            transition.criteria.push(criterion);
                        } else if (this.createBranchCriterion == 'choiceChosen') {
                            // the branch is based on choice chosen
                            var criterion = {};
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

                            transition.criteria = [];
                            transition.criteria.push(criterion);
                        } else if (this.createBranchCriterion == 'workgroupId') {
                            // workgroup id branching does not require a transition criterion
                        } else if (this.createBranchCriterion == 'random') {}
                        // random branching does not require a transition criterion


                        // add the transition
                        this.node.transitionLogic.transitions.push(transition);

                        // save a reference to the transition in the branch
                        branch.transition = transition;
                    }
                }
            }

            // save the project
            this.authoringViewNodeChanged();
        }

        /**
         * The branch criterion has changed
         */

    }, {
        key: 'createBranchCriterionChanged',
        value: function createBranchCriterionChanged() {

            if (this.createBranchCriterion != null) {

                // get this node id
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

            // save the project
            this.authoringViewNodeChanged();
        }

        /**
         * The create branch node id has changed
         */

    }, {
        key: 'createBranchNodeIdChanged',
        value: function createBranchNodeIdChanged() {

            this.createBranchComponentId = null;

            // get the selected node
            var node = this.ProjectService.getNodeById(this.createBranchNodeId);

            if (node != null) {

                // get the components of the selected node
                var components = node.components;

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

            // loop through all the branches
            for (var b = 0; b < this.createBranchBranches.length; b++) {

                // get a branch object
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
                            var criterion = {};
                            criterion.name = 'choiceChosen';
                            criterion.params = {};
                            criterion.params.nodeId = this.createBranchNodeId;
                            criterion.params.componentId = this.createBranchComponentId;
                            criterion.params.choiceIds = [];

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
                            var criterion = {};
                            criterion.name = 'score';
                            criterion.params = {};
                            criterion.params.nodeId = this.createBranchNodeId;
                            criterion.params.componentId = this.createBranchComponentId;
                            criterion.params.scores = [];

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
         */

    }, {
        key: 'createBranchUpdateChoiceChosenIds',
        value: function createBranchUpdateChoiceChosenIds() {

            // get the node id and component id
            var nodeId = this.createBranchNodeId;
            var componentId = this.createBranchComponentId;

            // get the component
            var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

            if (component != null) {
                if (component.type == 'MultipleChoice') {
                    // the component is a multiple choice component

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
            }
        }

        /**
         * A step was clicked in the create branch authoring view
         * @param branch the branch path
         * @param item the step that was clicked
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
                    // the item is checked

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
                                    var transition = {};
                                    transition.to = orderedItem.$key;

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
                var node = this.ProjectService.getNodeById(previousCheckedNodeId);

                if (node != null) {
                    var transitionLogic = node.transitionLogic;

                    if (transitionLogic != null) {
                        if (transitionLogic.transitions != null) {

                            // clear the transitions
                            transitionLogic.transitions = [];

                            // make a transition to the merge point
                            var transition = {};
                            transition.to = this.createBranchMergePointNodeId;

                            // add the transition
                            transitionLogic.transitions.push(transition);
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

                // remove all branch path taken constraints from the node
                this.ProjectService.removeBranchPathTakenNodeConstraints(nodeId);

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
            for (var n = 0; n < checkedItemsInBranchPath.length; n++) {

                // get a checked item in the branch path
                var item = checkedItemsInBranchPath[n];
                var itemNodeId = item.$key;

                // remove all branch path taken constraints from the node
                this.ProjectService.removeBranchPathTakenNodeConstraints(itemNodeId);

                /*
                 * the branch path taken constraints will be from this node to
                 * the first node in the branch path
                 */
                var fromNodeId = this.nodeId;
                var toNodeId = firstNodeId;

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

            // save the project
            this.authoringViewNodeChanged();
        }

        /**
         * The score for a path has changed in the branch authoring
         * @param branch the branch for which the score has changed
         */

    }, {
        key: 'createBranchScoreChanged',
        value: function createBranchScoreChanged(branch) {

            if (branch != null) {

                // get the transition of the branch
                var transition = branch.transition;

                if (transition != null) {

                    // get the scores
                    var scores = branch.scores;

                    if (scores != null) {

                        // get the criteria
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
         */

    }, {
        key: 'createBranchMergePointNodeIdChanged',
        value: function createBranchMergePointNodeIdChanged() {

            // get the merge point node id
            var createBranchMergePointNodeId = this.createBranchMergePointNodeId;

            var branches = this.createBranchBranches;

            // loop through all the branches
            for (var b = 0; b < branches.length; b++) {
                var branch = branches[b];

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
                                        var transition = {};
                                        transition.to = createBranchMergePointNodeId;

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
            this.authoringViewNodeChanged();
        }

        /**
         * The remove branch button was clicked
         */

    }, {
        key: 'removeBranchButtonClicked',
        value: function removeBranchButtonClicked() {

            // ask the user if they are sure they want to remove the branch
            var message = this.$translate('areYouSureYouWantToRemoveTheBranch');
            var answer = confirm(message);

            if (answer) {
                // the user answered yes so we will remove the branch
                this.removeBranch();
            }
        }

        /**
         * Remove the branch from the step by removing all the branch paths
         */

    }, {
        key: 'removeBranch',
        value: function removeBranch() {

            // loop through all the branch paths
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
            this.authoringViewNodeChanged();
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

                    // loop through all the checked items in the branch path
                    for (var i = 0; i < checkedItemsInBranchPath.length; i++) {

                        // get an item in the branch path
                        var checkedItem = checkedItemsInBranchPath[i];

                        if (checkedItem != null) {

                            // get the node id of the checked item
                            var nodeId = checkedItem.$key;

                            // remove the branchPathTaken constraints from the step
                            this.ProjectService.removeBranchPathTakenNodeConstraints(nodeId);

                            /*
                             * update the transition of the step to point to the next step
                             * in the project. this may be different than the next step
                             * if it was still in the branch path.
                             */
                            var nodeIdAfter = this.ProjectService.getNodeIdAfter(nodeId);
                            this.ProjectService.setTransition(nodeId, nodeIdAfter);
                        }
                    }
                }

                // get the index of the branch path
                var branchPathIndex = this.createBranchBranches.indexOf(branch);

                // remove the branch path
                this.createBranchBranches.splice(branchPathIndex, 1);

                // remove the transition the corresponds to the branch path
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
    }]);

    return NodeAuthoringController;
}();

;

NodeAuthoringController.$inject = ['$anchorScroll', '$filter', '$injector', '$location', '$mdDialog', '$scope', '$state', '$stateParams', '$timeout', 'ConfigService', 'ProjectService', 'UtilService'];

exports.default = NodeAuthoringController;
//# sourceMappingURL=nodeAuthoringController.js.map