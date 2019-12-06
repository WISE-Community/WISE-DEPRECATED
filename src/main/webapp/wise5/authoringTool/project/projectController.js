'use strict';

class ProjectController {

  constructor(
      $anchorScroll,
      $filter,
      $interval,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      $stomp,
      $timeout,
      $window,
      ConfigService,
      ProjectAssetService,
      ProjectService,
      TeacherDataService,
      UtilService) {
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
    this.$interval = $interval;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$stomp = $stomp;
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.$window = $window;
    this.ConfigService = ConfigService;
    this.ProjectAssetService = ProjectAssetService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;

    this.projectId = this.$stateParams.projectId;
    this.runId = this.ConfigService.getRunId();
    this.items = this.ProjectService.idToOrder;
    this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
    this.showCreateGroup = false;
    this.showCreateNode = false;
    this.projectTitle = this.ProjectService.getProjectTitle();
    this.inactiveGroupNodes = this.ProjectService.getInactiveGroupNodes();
    this.inactiveStepNodes = this.ProjectService.getInactiveStepNodes();
    this.inactiveNodes = this.ProjectService.getInactiveNodes();
    this.idToNode = this.ProjectService.getIdToNode();
    this.projectScriptFilename = this.ProjectService.getProjectScriptFilename();
    this.currentAuthorsMessage = '';
    this.projectMode = true;
    this.showCreateGroup = false;
    this.showCreateNode = false;
    this.showImportView = false;
    this.importMode = false;
    this.editProjectRubricMode = false;
    this.advancedMode = false;
    this.showJSONAuthoring = false;

    // whether there are any step nodes checked
    this.stepNodeSelected = false;

    // whether there are any activity nodes checked
    this.activityNodeSelected = false;

    /*
     * The colors for the branch path steps. The colors are from
     * http://colorbrewer2.org/
     * http://colorbrewer2.org/export/colorbrewer.js
     * The colors chosen are from the 'qualitative', 'Set2'.
     */
    this.stepBackgroundColors = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3',
        '#a6d854','#ffd92f','#e5c494','#b3b3b3'];

    // start by opening the project, with no node being authored
    this.TeacherDataService.setCurrentNode(null);

    this.metadata = this.ProjectService.getProjectMetadata();

    this.subscribeToCurrentAuthors(this.projectId).then(() => {
      this.ProjectService.notifyAuthorProjectBegin(this.projectId);
    });

    this.summernoteRubricId = 'summernoteRubric_' + this.projectId;
    this.summernoteRubricHTML = this.ProjectService
        .replaceAssetPaths(this.ProjectService.getProjectRubric());

    let insertAssetToolTipText = this.$translate('INSERT_ASSET');
    let insertAssetButton = this.UtilService.createInsertAssetButton(this,
          this.projectId, null, null, 'rubric', insertAssetToolTipText);

    // options to display in the summernote tool
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
        'insertAssetButton': insertAssetButton
      }
    };

    this.projectURL = window.location.origin + this.ConfigService.getConfigParam('projectURL');

    /*
     * Listen for the assetSelected event which occurs when the author
     * selects an asset from the choose asset popup to add to project rubric
     * or choosing the script file.
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null && args.projectId == this.projectId &&
          args.assetItem != null && args.assetItem.fileName != null) {
        let assetFileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          const summernoteElement = angular.element(document.querySelector(`#summernoteRubric_${this.projectId}`));
          let fullAssetPath =
              this.ConfigService.getProjectAssetsDirectoryPath() +
                  '/' + assetFileName;
          if (this.UtilService.isImage(assetFileName)) {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            summernoteElement.summernote('editor.restoreRange');
            summernoteElement.summernote('editor.focus');
            summernoteElement.summernote(
                'insertImage', fullAssetPath, assetFileName);
          } else if (this.UtilService.isVideo(assetFileName)) {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            summernoteElement.summernote('editor.restoreRange');
            summernoteElement.summernote('editor.focus');
            let videoElement = document.createElement('video');
            videoElement.controls = 'true';
            videoElement.innerHTML =
                '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
            summernoteElement.summernote('insertNode', videoElement);
          }
        } else if (args.target === 'scriptFilename') {
          this.projectScriptFilename = assetFileName;
          this.projectScriptFilenameChanged();
        }
      }
      this.$mdDialog.hide();
    });

    this.$rootScope.$on('$stateChangeSuccess',
        (event, toState, toParams, fromState, fromParams) => {
      if (toState != null) {
        let stateName = toState.name;
        if (stateName == 'root.project') {
          this.saveEvent('projectHomeViewOpened', 'Navigation');
        } else if (stateName == 'root.project.node') {
        } else if (stateName == 'root.project.asset') {
          this.saveEvent('assetsViewOpened', 'Navigation');
        } else if (stateName == 'root.project.info') {
          this.saveEvent('projectInfoViewOpened', 'Navigation');
        } else if (stateName == 'root.project.notebook') {
          this.saveEvent('notebookViewOpened', 'Navigation');
        }
      }
    });

    this.$rootScope.$on('projectSaved', () => {
      //this.saveEvent('projectSaved', 'Authoring');
    });

    /*
     * Listen for the event to parse the project. This is so other
     * controllers can trigger parsing the project in this controller.
     */
    this.$rootScope.$on('parseProject', () => {
      this.refreshProject();
    });

    this.$rootScope.$on('scrollToBottom', () => {
      this.scrollToBottomOfPage();
    });

    this.saveEvent('projectOpened', 'Navigation');

    /*
     * When the project is loaded from the project list view, we display a
     * "Loading Project" message using the mdDialog. Now that the project
     * has loaded, we will hide the message.
     */
    this.$mdDialog.hide();

    this.$scope.$on('$destroy', () => {
      this.endProjectAuthoringSession();
    });

    this.$window.onbeforeunload = (event) => {
      this.endProjectAuthoringSession();
    };
  }

  endProjectAuthoringSession() {
    this.unSubscribeFromCurrentAuthors(this.projectId).then(() => {
      this.ProjectService.notifyAuthorProjectEnd(this.projectId);
    });
  }

  /**
   * Launch the project in preview mode in a new tab
   */
  previewProject() {
    let previewProjectEventData = { constraints: true };
    this.saveEvent('projectPreviewed', 'Navigation', previewProjectEventData);
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}#!/project/${this.projectId}`);
  }

  /**
   * Launch the project in preview mode without constraints in a new tab
   */
  previewProjectWithoutConstraints() {
    let previewProjectEventData = { constraints: false };
    this.saveEvent('projectPreviewed', 'Navigation', previewProjectEventData);
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}` +
        `?constraints=false#!/project/${this.projectId}`);
  }

  viewProjectAssets() {
    this.$state.go('root.project.asset', {projectId: this.projectId});
  }

  viewProjectHistory() {
    this.$state.go('root.project.history', {projectId: this.projectId});
  }

  viewNotebookSettings() {
    this.$state.go('root.project.notebook', {projectId: this.projectId});
  }

  showOtherConcurrentAuthors(authors) {
    const myUsername = this.ConfigService.getMyUsername();
    authors.splice(authors.indexOf(myUsername), 1);
    if (authors.length > 0) {
      this.currentAuthorsMessage = this.$translate('concurrentAuthorsWarning',
        { currentAuthors: authors.join(', ') });
    } else {
      this.currentAuthorsMessage = '';
    }
  }

  saveProject() {
    let commitMessage = 'Made changes to the project.';
    try {
      // if projectJSONString is bad json,
      // an exception will be thrown and it will not save.
      this.ProjectService.saveProject(commitMessage)
          .then((commitHistoryArray) => {
        this.commitHistory = commitHistoryArray;
        $('#commitMessageInput').val('');
      });
    } catch (error) {
      // TODO: i18n
      alert('Invalid JSON. Please check syntax. Aborting save.');
      return;
    }
  }

  /**
   * Make a request to download this project as a zip file
   */
  downloadProject() {
    window.location.href = this.ConfigService.getWISEBaseURL()
        + '/project/export/' + this.projectId;
  }

  /**
   * Close authoring for the current project and bring user back to main AT page
   */
  closeProject() {
    this.$state.go('root.main');
  }

  /**
   * Get the node position
   * @param nodeId the node id
   * @returns the node position
   */
  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  /**
   * Get the components that are in the specified node id.
   * @param nodeId the node id
   * @returns components in the node
   */
  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  /**
   * Returns a list of possible criteria for the specified node and component
   * @param nodeId the node id
   * @param componentId the component id in the node
   */
  getPossibleTransitionCriteria(nodeId, componentId) {
    return this.ProjectService
        .getPossibleTransitionCriteria(nodeId, componentId);
  }

  /**
   * Get the node title for a node
   * @param nodeId the node id
   * @returns the node title
   */
  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  /**
   * Check if a node id is for a group
   * @param nodeId
   * @returns whether the node is a group node
   */
  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  /**
   * A node was clicked so we will go to the node authoring view
   * @param nodeId
   */
  nodeClicked(nodeId) {
    this.unselectAllItems();
    this.TeacherDataService
        .endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    this.$state
        .go('root.project.node', {projectId: this.projectId, nodeId: nodeId});
  }

  /**
   * The constraint icon on a step in the project view was clicked.
   * We will open the constraint view for the step.
   * @param nodeId The node id of the step.
   */
  constraintIconClicked(nodeId) {
    this.TeacherDataService
      .endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
    this.$state
      .go('root.project.nodeConstraints', {projectId: this.projectId, nodeId: nodeId});
  }

  /**
   * The branch icon on a step in the project view was clicked.
   * We will open the transitions view for the step.
   * @param nodeId The node id of the step.
   */
  branchIconClicked(nodeId) {
    this.TeacherDataService
      .endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
    this.$state
      .go('root.project.nodeEditPaths', {projectId: this.projectId, nodeId: nodeId});
  }

  /**
   * Create a new group (activity)
   */
  createGroup() {
    /*
     * set the group into this variable to hold it temporarily while the
     * author decides where to place it
     */
    this.nodeToAdd = this.ProjectService.createGroup(this.createGroupTitle);

    this.showCreateGroup = false;
    this.createGroupTitle = '';
    this.insertGroupMode = true;
    this.createMode = true;
  }

  /**
   * Create a new node (step)
   */
  createNode() {
    /*
     * set the node into this variable to hold it temporarily while the
     * author decides where to place it
     */
    this.nodeToAdd = this.ProjectService.createNode(this.createNodeTitle);

    this.showCreateNode = false;
    this.createNodeTitle = '';
    this.insertNodeMode = true;
    this.createMode = true;
  }

  /**
   * Insert the node(s) inside
   * @param nodeId the node id of the group that we will insert into
   */
  insertInside(nodeId) {
    // TODO check that we are inserting into a group
    if (this.createMode) {
      this.handleCreateModeInsert(nodeId, 'inside');
    } else if (this.moveMode) {
      this.handleMoveModeInsert(nodeId, 'inside');
    } else if (this.copyMode) {
      this.handleCopyModeInsert(nodeId, 'inside');
    } else if (this.importMode) {
      this.importSelectedNodes(nodeId);
    }
  }

  /**
   * Insert the node(s) after
   * @param nodeId the node id of the node we will insert after
   */
  insertAfter(nodeId) {
    if (this.createMode) {
      this.handleCreateModeInsert(nodeId, 'after');
    } else if (this.moveMode) {
      this.handleMoveModeInsert(nodeId, 'after');
    } else if (this.copyMode) {
      this.handleCopyModeInsert(nodeId, 'after');
    } else if (this.importMode) {
      this.importSelectedNodes(nodeId);
    }
  }

  /**
   * Create a node and then insert it in the specified location
   * @param nodeId insert the new node inside or after this node id
   * @param moveTo whether to insert 'inside' or 'after' the nodeId parameter
   */
  handleCreateModeInsert(nodeId, moveTo) {
    if (moveTo === 'inside') {
      this.ProjectService.createNodeInside(this.nodeToAdd, nodeId);
    } else if (moveTo === 'after') {
      this.ProjectService.createNodeAfter(this.nodeToAdd, nodeId);
    } else {
      // an unspecified moveTo was provided
      return;
    }

    let newNodes = [this.nodeToAdd];
    let newNode = this.nodeToAdd;

    /*
     * clear this variable that we used to hold the node we inserted.
     * since we have inserted the node we don't need a handle to it
     * anymore
     */
    this.nodeToAdd = null;

    this.createMode = false;
    this.insertGroupMode = false;
    this.insertNodeMode = false;
    this.temporarilyHighlightNewNodes(newNodes);

    this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      if (newNode != null) {
        let nodeCreatedEventData = {
          'nodeId': newNode.id,
          'title': this.ProjectService
              .getNodePositionAndTitleByNodeId(newNode.id)
        };

        if (this.ProjectService.isGroupNode(newNode.id)) {
          this.saveEvent('activityCreated', 'Authoring', nodeCreatedEventData);
        } else {
          this.saveEvent('stepCreated', 'Authoring', nodeCreatedEventData);
        }
      }
    });
  }

  /**
   * Move a node and insert it in the specified location
   * @param nodeId insert the new node inside or after this node id
   * @param moveTo whether to insert 'inside' or 'after' the nodeId parameter
   */
  handleMoveModeInsert(nodeId, moveTo) {
    let selectedNodeIds = this.getSelectedNodeIds();
    if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
      /*
       * the user is trying to insert the selected node ids after
       * itself so we will not allow that
       */
      if (selectedNodeIds.length == 1) {
        alert(this
            .$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
      } else if (selectedNodeIds.length > 1) {
        alert(this
            .$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
      }
    } else {
      let movedNodes = [];
      for (let selectedNodeId of selectedNodeIds) {
        let node = {
          'nodeId': selectedNodeId,
          'fromTitle': this.ProjectService
              .getNodePositionAndTitleByNodeId(selectedNodeId)
        };
        movedNodes.push(node);
      }

      let newNodes = [];
      if (moveTo === 'inside') {
        newNodes = this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);
      } else if (moveTo === 'after') {
        newNodes = this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);
      } else {
        // an unspecified moveTo was provided
        return;
      }

      this.moveMode = false;
      this.insertGroupMode = false;
      this.insertNodeMode = false;
      this.temporarilyHighlightNewNodes(newNodes);
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        if (newNodes != null && newNodes.length > 0) {
          let firstNewNode = newNodes[0];
          if (firstNewNode != null && firstNewNode.id != null) {
            for (let n = 0; n < movedNodes.length; n++) {
              let node = movedNodes[n];
              let newNode = newNodes[n];
              if (node != null && newNode != null) {
                node.toTitle = this.ProjectService
                    .getNodePositionAndTitleByNodeId(newNode.id);
              }
            }

            if (this.ProjectService.isGroupNode(firstNewNode.id)) {
              let nodeMovedEventData = { activitiesMoved: movedNodes };
              this.saveEvent('activityMoved', 'Authoring', nodeMovedEventData);
            } else {
              let nodeMovedEventData = { stepsMoved: movedNodes };
              this.saveEvent('stepMoved', 'Authoring', nodeMovedEventData);
            }
          }
        }
      });
    }
  }

  /**
   * Copy a node and insert it in the specified location
   * @param nodeId insert the new node inside or after this node id
   * @param moveTo whether to insert 'inside' or 'after' the nodeId parameter
   */
  handleCopyModeInsert(nodeId, moveTo) {
    let copiedNodes = [];
    let selectedNodeIds = this.getSelectedNodeIds();
    for (let selectedNodeId of selectedNodeIds) {
      let node = {
        'fromNodeId': selectedNodeId,
        'fromTitle': this.ProjectService
            .getNodePositionAndTitleByNodeId(selectedNodeId)
      };
      copiedNodes.push(node);
    }

    let newNodes = [];
    if (moveTo === 'inside') {
      newNodes = this.ProjectService.copyNodesInside(selectedNodeIds, nodeId);
    } else if (moveTo === 'after') {
      newNodes = this.ProjectService.copyNodesAfter(selectedNodeIds, nodeId);
    } else {
      // an unspecified moveTo was provided
      return;
    }

    this.copyMode = false;
    this.insertGroupMode = false;
    this.insertNodeMode = false;
    this.temporarilyHighlightNewNodes(newNodes);
    this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      if (newNodes != null && newNodes.length > 0) {
        let firstNewNode = newNodes[0];
        if (firstNewNode != null && firstNewNode.id != null) {
          for (let n = 0; n < copiedNodes.length; n++) {
            let node = copiedNodes[n];
            let newNode = newNodes[n];
            if (node != null && newNode != null) {
              node.toNodeId = newNode.id;
              node.toTitle = this.ProjectService
                  .getNodePositionAndTitleByNodeId(newNode.id);
            }
          }

          if (this.ProjectService.isGroupNode(firstNewNode.id)) {
            let nodeCopiedEventData = { activitiesCopied: copiedNodes };
            this.saveEvent('activityCopied', 'Authoring', nodeCopiedEventData);
          } else {
            let nodeCopiedEventData = { stepsCopied: copiedNodes };
            this.saveEvent('stepCopied', 'Authoring', nodeCopiedEventData);
          }
        }
      }
    });
  }

  /**
   * Import the selected steps and draw attention to them by highlighting them
   * and scrolling to them.
   * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
   * new step the first step in the group. If this is a step, we will place
   * the new step after it.
   */
  importSelectedNodes(nodeIdToInsertInsideOrAfter) {
    let selectedNodes = this.getSelectedNodesToImport();
    let selectedNodeTitles = this.getSelectedNodeTitlesToImport();
    let toProjectId = this.ConfigService.getConfigParam('projectId');
    let fromProjectId = this.importProjectId;

    this.performImport(nodeIdToInsertInsideOrAfter).then((newNodes) => {
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        let doScrollToNewNodes = true;
        this.temporarilyHighlightNewNodes(newNodes, doScrollToNewNodes);

        let stepsImported = [];
        for (let n = 0; n < selectedNodes.length; n++) {
          let selectedNode = selectedNodes[n];
          let selectedNodeTitle = selectedNodeTitles[n];
          let newNode = newNodes[n];

          let stepImported = {
            fromProjectId: parseInt(fromProjectId),
            fromNodeId: selectedNode.id,
            fromTitle: selectedNodeTitle,
            toNodeId: newNode.id,
            toTitle: this.ProjectService
              .getNodePositionAndTitleByNodeId(newNode.id)
          };
          stepsImported.push(stepImported);
        }

        let stepsImportedEventData = { 'stepsImported': stepsImported };
        this.saveEvent('stepImported', 'Authoring', stepsImportedEventData);
      });
    });
  }

  /**
   * Import the step and place it in the chosen location
   * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
   * new step the first step in the group. If this is a step, we will place
   * the new step after it.
   */
  performImport(nodeIdToInsertInsideOrAfter) {
    let selectedNodes = this.getSelectedNodesToImport();
    let toProjectId = this.ConfigService.getConfigParam('projectId');
    let fromProjectId = this.importProjectId;

    return this.ProjectService.copyNodes(selectedNodes, fromProjectId,
        toProjectId, nodeIdToInsertInsideOrAfter).then((newNodes) => {
      this.refreshProject();
      this.insertNodeMode = false;
      this.toggleView('project');

      this.importProjectIdToOrder = {};
      this.importProjectItems = [];
      this.importMyProjectId = null;
      this.importLibraryProjectId = null;
      this.importProjectId = null;
      this.importProject = null;

      /*
       * go back to the project view and
       * refresh the project assets in case any of the imported
       * steps also imported assets
       */
      this.showProjectHome();
      this.ProjectAssetService.retrieveProjectAssets();
      return newNodes;
    });
  }

  /**
   * Turn on copy mode
   */
  copy() {
    // make sure there is at least one item selected
    let selectedNodeIds = this.getSelectedNodeIds();
    if (selectedNodeIds == null || selectedNodeIds.length == 0) {
      alert(this.$translate('pleaseSelectAnItemToCopyAndThenClickTheCopyButtonAgain'));
    } else {
      let selectedItemTypes = this.getSelectedItemTypes();
      if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'node') {
        this.insertNodeMode = true;
        this.copyMode = true;
      } else if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'group') {
        alert(this.$translate('youCannotCopyActivitiesAtThisTime'));
      }
    }
  }

  /**
   * Turn on move mode
   * TODO refactor. too many nesting. Rename function to "turnOnMoveMode"?
   */
  move() {
    // make sure there is at least one item selected
    let selectedNodeIds = this.getSelectedNodeIds();
    if (selectedNodeIds == null || selectedNodeIds.length == 0) {
      alert(this.$translate('pleaseSelectAnItemToMoveAndThenClickTheMoveButtonAgain'));
    } else {
      let selectedItemTypes = this.getSelectedItemTypes();
      if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'node') {
        this.insertNodeMode = true;
        this.moveMode = true;
      } else if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'group') {
        this.insertGroupMode = true;
        this.moveMode = true;
      }
    }
  }

  /**
   * Delete the selected nodes after asking user for confirmation
   * TODO refactor too many nesting
   */
  delete() {
    let selectedNodeIds = this.getSelectedNodeIds();
    if (selectedNodeIds == null || selectedNodeIds.length == 0) {
      alert(this.$translate('pleaseSelectAnItemToDeleteAndThenClickTheDeleteButtonAgain'));
    } else {
      let confirmMessage = '';
      if (selectedNodeIds.length == 1) {
        confirmMessage = this.$translate('areYouSureYouWantToDeleteTheSelectedItem');
      } else if (selectedNodeIds.length > 1) {
        confirmMessage = this.$translate('areYouSureYouWantToDeleteTheXSelectedItems',
            { numItems: selectedNodeIds.length });
      }
      if (confirm(confirmMessage)) {
        let deletedStartNodeId = false;
        let activityDeleted = false;
        let stepDeleted = false;
        let stepsDeleted = [];
        let activitiesDeleted = [];
        for (let nodeId of selectedNodeIds) {
          let node = this.ProjectService.getNodeById(nodeId);
          let tempNode = {};

          if (node != null) {
            tempNode.nodeId = node.id;
            tempNode.title =
                this.ProjectService.getNodePositionAndTitleByNodeId(node.id);
          }

          if (this.ProjectService.isStartNodeId(nodeId)) {
            deletedStartNodeId = true;
          }

          if (this.ProjectService.isGroupNode(nodeId)) {
            activityDeleted = true;
            let stepsInActivityDeleted = [];
            for (let stepNodeId of node.ids) {
              let stepTitle = this.ProjectService
                  .getNodePositionAndTitleByNodeId(stepNodeId);

              // create an object with the step id and title
              let stepObject = {
                'nodeId': stepNodeId,
                'title': stepTitle
              };
              stepsInActivityDeleted.push(stepObject);
            }
            tempNode.stepsInActivityDeleted = stepsInActivityDeleted;
            activitiesDeleted.push(tempNode);
          } else {
            stepDeleted = true;
            stepsDeleted.push(tempNode);
          }
          this.ProjectService.deleteNode(nodeId);
        }

        if (deletedStartNodeId) {
          this.updateStartNodeId();
        }

        if (activityDeleted) {
          let activitiesDeletedEventData = {
            'activitiesDeleted': activitiesDeleted
          };
          this.saveEvent('activityDeleted', 'Authoring',
              activitiesDeletedEventData);
        }

        if (stepDeleted) {
          let stepDeletedEventData = {
            'stepsDeleted': stepsDeleted
          };
          this.saveEvent('stepDeleted', 'Authoring', stepDeletedEventData);
        }

        this.ProjectService.saveProject();
        this.refreshProject();
      }
    }
  }

  /**
   * Get the ids of the selected nodes, both active and inactive.
   * @returns an array of node ids that are selected
   */
  getSelectedNodeIds() {
    let selectedNodeIds = [];
    angular.forEach(this.items, function(value, key) {
      if (value.checked) {
        selectedNodeIds.push(key);
      }
    }, selectedNodeIds);

    if (this.inactiveNodes != null) {
      for (let inactiveNode of this.inactiveNodes) {
        if (inactiveNode != null && inactiveNode.checked) {
          selectedNodeIds.push(inactiveNode.id);
        }
      }
    }
    return selectedNodeIds;
  }

  /**
   * Get the distinct types of the selected items, both active and inactive.
   * @returns an array of item types. possible items are group or node.
   */
  getSelectedItemTypes() {
    let selectedItemTypes = [];

    angular.forEach(this.items, function(value, key) {
      if (value.checked) {
        let node = this.ProjectService.getNodeById(key);
        if (node != null) {
          let nodeType = node.type;
          if (selectedItemTypes.indexOf(nodeType) == -1) {
            selectedItemTypes.push(nodeType);
          }
        }
      }
    }, this);

    if (this.inactiveNodes != null) {
      for (let inactiveNode of this.inactiveNodes) {
        if (inactiveNode != null && inactiveNode.checked) {
          let inactiveNodeType = inactiveNode.type;
          if (selectedItemTypes.indexOf(inactiveNodeType) == -1) {
            selectedItemTypes.push(inactiveNodeType);
          }
        }
      }
    }

    return selectedItemTypes;
  }

  unselectAllItems() {
    angular.forEach(this.items, function(value, key) {
      value.checked = false;
    });
    angular.forEach(this.inactiveGroupNodes, function(value, key) {
      value.checked = false;
    });
    angular.forEach(this.inactiveStepNodes, function(value, key) {
      value.checked = false;
    });
    this.stepNodeSelected = false;
    this.activityNodeSelected = false;
  }

  /**
   * Toggle the create group input
   */
  creatNewActivityClicked() {
    this.createGroupTitle = '';
    this.toggleView('createGroup');
    if (this.showCreateGroup) {
      this.$timeout(() => {
        $('#createGroupTitle').focus();
      });
    }
  }

  /**
   * Toggle the create node input
   */
  createNewStepClicked() {
    this.createNodeTitle = '';
    this.toggleView('createNode');
    if (this.showCreateNode) {
      this.$timeout(() => {
        $('#createNodeTitle').focus();
      });
    }
  }

  /**
   * Cancel the move mode
   */
  cancelMove() {
    this.insertGroupMode = false;
    this.insertNodeMode = false;
    this.nodeToAdd = null;
    this.createMode = false;
    this.moveMode = false;
    this.copyMode = false;
    this.importMode = false;
    this.unselectAllItems();
  }

  /**
   * Update the start node id by traversing start ids until a
   * node id is found.
   */
  updateStartNodeId() {
    let newStartNodeId = null;
    let startGroupId = this.ProjectService.getStartGroupId();
    let node = this.ProjectService.getNodeById(startGroupId);
    let done = false;

    // recursively traverse the start ids
    while (!done) {
      if (node == null) {
        // base case in case something went wrong
        done = true;
      } else if (this.ProjectService.isGroupNode(node.id)) {
        // the node is a group node so we will get its start node
        node = this.ProjectService.getNodeById(node.startId);
      } else if (this.ProjectService.isApplicationNode(node.id)) {
        // the node is a step node so we have found the new start node id
        newStartNodeId = node.id;
        done = true;
      } else {
        // base case in case something went wrong
        done = true;
      }
    }

    if (newStartNodeId) {
      this.ProjectService.setStartNodeId(newStartNodeId);
    }
  }

  /**
   * Check if the start node id for the project could potentially
   * change.
   */
  checkPotentialStartNodeIdChange() {
    return this.$q((resolve, reject) => {
      let firstLeafNodeId = this.ProjectService.getFirstLeafNodeId();
      if (firstLeafNodeId == null) {
        // there are no steps in the project
        // set the start node id to empty string
        this.ProjectService.setStartNodeId('');
        resolve();
      } else {
        // we have found a leaf node
        let currentStartNodeId = this.ProjectService.getStartNodeId();
        if (currentStartNodeId != firstLeafNodeId) {
          // update the start node id
          this.ProjectService.setStartNodeId(firstLeafNodeId);
          resolve();
        } else {
          resolve();
        }
      }
    });
  }

  /**
   * Check if the start node id has changed and then save the project
   */
  checkPotentialStartNodeIdChangeThenSaveProject() {
    return this.checkPotentialStartNodeIdChange().then(() => {
      this.ProjectService.saveProject();
      this.refreshProject();
    });
  }

  /**
   * Recalculates step numbering
   */
  refreshProject() {
    /*
     * Use a timeout before we refresh the project in order to allow the
     * spinning progress indicator to show up before the browser starts
     * blocking/freezing.
     */
    this.$timeout(() => {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
      this.inactiveGroupNodes = this.ProjectService.getInactiveGroupNodes();
      this.inactiveStepNodes = this.ProjectService.getInactiveStepNodes();
      this.inactiveNodes = this.ProjectService.getInactiveNodes();
      this.idToNode = this.ProjectService.getIdToNode();
      this.unselectAllItems();
    });
  }

  /**
   * The project title changed so we will update the project title in the
   * project service and save the project
   */
  projectTitleChanged() {
    this.ProjectService.setProjectTitle(this.projectTitle);
    this.ProjectService.saveProject();
  }

  /**
   * Toggle the import view and populate the project drop downs if necessary
   */
  importStepClicked() {
    this.toggleView('importStep');

    if (this.importMode) {
      if (this.myProjectsList == null) {
        this.myProjectsList = this.ConfigService.getAuthorableProjects();
      }

      if (this.libraryProjectsList == null) {
        this.ConfigService.getLibraryProjects().then((libraryProjectsList) => {
          this.libraryProjectsList = libraryProjectsList;
        });
      }
    }
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
      // clear all the import project values
      this.importProjectIdToOrder = {};
      this.importProjectItems = [];
      this.importMyProjectId = null;
      this.importLibraryProjectId = null;
      this.importProjectId = null;
      this.importProject = null;
    } else {
      this.ProjectService.retrieveProjectById(this.importProjectId)
          .then((projectJSON) => {
        this.importProject = projectJSON;
        const nodeOrderOfProject = this.ProjectService
            .getNodeOrderOfProject(this.importProject);
        this.importProjectIdToOrder = nodeOrderOfProject.idToOrder;
        this.importProjectItems = nodeOrderOfProject.nodes;
      });
    }
  }

  previewImportNode(node) {
    window.open(`${this.importProject.previewProjectURL}#!/project/${this.importProjectId}/${node.id}`);
  }

  previewImportProject() {
    window.open(`${this.importProject.previewProjectURL}#!/project/${this.importProjectId}`);
  }

  /**
   * Import the selected steps
   */
  importSteps() {
    let selectedNodes = this.getSelectedNodesToImport();
    if (selectedNodes == null || selectedNodes.length == 0) {
      // TODO i18n
      alert('Please select a step to import.');
    } else {
      /*
       * hide the import view because we want to go back to the
       * project view so that the author can choose where to place
       * the new steps
       */
      this.showImportView = false;
      this.insertNodeMode = true;
      this.projectMode = true;
    }
  }

  /**
   * Get the selected nodes to import
   * @return an array of selected nodes
   */
  getSelectedNodesToImport() {
    let selectedNodes = [];
    for (let item of this.importProjectItems) {
      if (item.checked) {
        selectedNodes.push(item.node);
      }
    }
    return selectedNodes;
  }

  /**
   * Show the view to edit the project rubric
   */
  editProjectRubricClicked() {
    this.toggleView('rubric');
  }

  /**
   * Show the advanced authoring view
   */
  advancedClicked() {
    this.toggleView('advanced');
  }

  /**
   * The show JSON button was clicked
   */
  showJSONClicked() {
    if (this.showJSONAuthoring) {
      // we were showing the JSON view and the author now wants to hide it
      if (this.isJSONValid()) {
        this.toggleJSONAuthoringView();
        this.UtilService.hideJSONValidMessage();
      } else {
        let answer = confirm(this.$translate('jsonInvalidErrorMessage'));
        if (answer) {
          // the author wants to revert back to the last valid JSON
          this.toggleJSONAuthoringView();
          this.UtilService.hideJSONValidMessage();
        }
      }
    } else {
      // we were not showing the JSON view and now the author wants to show it
      this.toggleJSONAuthoringView();
      this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
      this.UtilService.showJSONValidMessage();
    }
  }

  isJSONValid() {
    try {
      angular.fromJson(this.projectJSONString);
      return true;
    } catch(e) {
      return false;
    }
  }

  toggleJSONAuthoringView() {
    this.showJSONAuthoring = !this.showJSONAuthoring;
  }

  /**
   * Save the project JSON to the server if the JSON is valid.
   */
  autoSaveProjectJSONString() {
    try {
      this.saveProjectJSON(this.projectJSONString);
      this.UtilService.showJSONValidMessage();
    } catch(e) {
      this.UtilService.showJSONInvalidMessage();
    }
  }

  /**
   * Save the project JSON string to the server
   * @param projectJSONString
   */
  saveProjectJSON(projectJSONString) {
    let project = angular.fromJson(projectJSONString);
    this.ProjectService.setProject(project);
    let scriptFilename = this.ProjectService.getProjectScriptFilename();
    if (scriptFilename != null) {
      this.projectScriptFilename = scriptFilename;
    }
    this.checkPotentialStartNodeIdChangeThenSaveProject();
  }

  /**
   * The author has changed the rubric, so save the changes
   */
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

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    html = this.UtilService.insertWISELinks(html);

    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  /**
   * Check if the specified node is in any branch path
   * @param nodeId the node id of the node
   * @return whether the node is in any branch path
   */
  isNodeInAnyBranchPath(nodeId) {
    return this.ProjectService.isNodeInAnyBranchPath(nodeId);
  }

  /**
   * The project script file name changed
   */
  projectScriptFilenameChanged() {
    // update the project script file name in the project service
    this.ProjectService.setProjectScriptFilename(this.projectScriptFilename);

    if (this.showJSONAuthoring) {
      /*
       * we are showing the project JSON authoring so we need to update
       * the JSON string that we are showing in the textarea
       */
      this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
    }
    this.ProjectService.saveProject();
  }

  /**
   * Show the asset popup to allow the author to choose an image for the
   * project script filename
   */
  chooseProjectScriptFilename() {
    let openAssetChooserParams = {
      popup: true,
      projectId: this.projectId,
      target: 'scriptFilename'
    };
    this.$rootScope.$broadcast('openAssetChooser', openAssetChooserParams);
  }

  /**
   * Show the appropriate authoring view
   * @param view the view to show
   */
  toggleView(view) {
    // clear the input element for creating a new activity
    this.createGroupTitle = '';

    // clear the input element for creating a new step
    this.createNodeTitle = '';

    if (view == 'project') {
      // we are showing the regular project view
      this.showCreateGroup = false;
      this.showCreateNode = false;
      this.importMode = false;
      this.showImportView = false;
      this.editProjectRubricMode = false;
      this.advancedMode = false;
      this.showJSONAuthoring = false;
      this.projectMode = true;
    } else if (view == 'createGroup') {
      // toggle the create activity view
      this.showCreateGroup = !this.showCreateGroup;
      this.showCreateNode = false;
      this.importMode = false;
      this.showImportView = false;
      this.editProjectRubricMode = false;
      this.advancedMode = false;
      this.showJSONAuthoring = false;

      // also show the project view
      this.projectMode = true;
    } else if (view == 'createNode') {
      // toggle the create step view
      this.showCreateGroup = false;
      this.showCreateNode = !this.showCreateNode;
      this.importMode = false;
      this.showImportView = false;
      this.editProjectRubricMode = false;
      this.advancedMode = false;
      this.showJSONAuthoring = false;

      // also show the project view
      this.projectMode = true;
    } else if (view == 'importStep') {
      // toggle the import step view
      this.showCreateGroup = false;
      this.showCreateNode = false;
      this.importMode = !this.importMode;
      this.showImportView = !this.showImportView;
      this.editProjectRubricMode = false;
      this.advancedMode = false;
      this.showJSONAuthoring = false;

      // if the import view is shown, do not show the project view
      this.projectMode = !this.importMode;
    } else if (view == 'rubric') {
      // toggle the rubric view
      this.showCreateGroup = false;
      this.showCreateNode = false;
      this.importMode = false;
      this.showImportView = false;
      this.editProjectRubricMode = !this.editProjectRubricMode;
      this.advancedMode = false;
      this.showJSONAuthoring = false;

      // if the rubric view is shown, do not show the project view
      this.projectMode = !this.editProjectRubricMode;
    } else if (view == 'advanced') {
      // toggle the advanced view
      this.showCreateGroup = false;
      this.showCreateNode = false;
      this.importMode = false;
      this.showImportView = false;
      this.editProjectRubricMode = false;
      this.advancedMode = !this.advancedMode;
      this.showJSONAuthoring = false;

      // if the advanced view is shown, do not show the project view
      this.projectMode = !this.advancedMode;
    }
    if (!this.showJSONAuthoring) {
      this.UtilService.hideJSONValidMessage();
    }
  }

  /**
   * Go back to a previous page, which is different based on which page
   * the author is currently on.
   */
  backButtonClicked() {
    if (this.showImportView) {
      this.toggleView('project');
    } else if (this.editProjectRubricMode) {
      this.toggleView('project');
    } else if (this.advancedMode) {
      this.toggleView('project');
    } else {
      this.$state.go('root.main');
    }
  }

  /**
   * Show the regular project view
   */
  projectHomeClicked() {
    // show the regular project view
    this.showProjectHome();
  }

  /**
   * Show the regular project view
   */
  showProjectHome() {
    // we are going to the project view so we will set the current node to null
    this.TeacherDataService.setCurrentNode(null);

    // show the regular project view
    this.toggleView('project');
    this.scrollToTopOfPage();
  }

  scrollToTopOfPage() {
    this.$anchorScroll('top');
  }

  scrollToBottomOfPage() {
    $('#content').animate({
      scrollTop: $('#bottom').prop('offsetTop')
    }, 1000);
  }

  /**
   * Creating a group was cancelled, so show the project regular project view
   */
  cancelCreateGroupClicked() {
    this.toggleView('project');
  }

  /**
   * Creating a node was cancelled, so show the project view
   */
  cancelCreateNodeClicked() {
    this.toggleView('project');
  }

  /**
   * Temporarily highlight the new nodes to draw attention to them
   * @param newNodes the new nodes to highlight
   * @param doScrollToNewNodes if true, scroll to the first new node added
   * TODO: can we remove the null checks: ensure that newNodes is never null?
   */
  temporarilyHighlightNewNodes(newNodes, doScrollToNewNodes = false) {
    this.$timeout(() => {
      if (newNodes != null && newNodes.length > 0) {
        for (let newNode of newNodes) {
          if (newNode != null) {
            this.UtilService.temporarilyHighlightElement(newNode.id);
          }
        }
        if (doScrollToNewNodes) {
          let firstNodeElementAdded = $('#' + newNodes[0].id);
          if (firstNodeElementAdded != null) {
            $('#content').animate({
              scrollTop: firstNodeElementAdded.prop('offsetTop') - 60
            }, 1000);
          }
        }
      }
    });
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
    let nodeId = null;
    let componentId = null;
    let componentType = null;

    if (data == null) {
      data = {};
    }
    this.TeacherDataService.saveEvent(context, nodeId, componentId,
      componentType, category, eventName, data);
  }

  /**
   * Get the selected node titles that we are importing
   * @return an array of node titles that may include the step numbers
   */
  getSelectedNodeTitlesToImport() {
    let selectedNodeTitles = [];
    let selectedNodes = this.getSelectedNodesToImport();
    for (let n = 0; n < selectedNodes.length; n++) {
      let selectedNode = selectedNodes[n];
      if (selectedNode != null) {
        // get the step number and title from the import project
        let tempNode = this.importProjectIdToOrder[selectedNode.id];
        let stepNumber = tempNode.stepNumber;
        let title = '';

        if (stepNumber == null) {
          title = selectedNode.title;
        } else {
          title = stepNumber + ': ' + selectedNode.title;
        }
        selectedNodeTitles[n] = title;
      }
    }
    return selectedNodeTitles;
  }

  /**
   * Get the background color for a step
   * @param nodeId get the background color for a step in the project view
   * @return If the node is in a branch path it will return a color. If the
   * node is not in a branch path it will return null.
   */
  getStepBackgroundColor(nodeId) {
    let color = null;
    let branchPathLetter = this.ProjectService.getBranchPathLetter(nodeId);
    if (branchPathLetter != null) {
      // the node is in a branch path

      // get the ascii code for the letter. example A=65, B=66, C=67, etc.
      let letterASCIICode = branchPathLetter.charCodeAt(0);

      // get the branch path number A=0, B=1, C=2, etc.
      let branchPathNumber = letterASCIICode - 65;

      // get the color for the branch path number
      color = this.stepBackgroundColors[branchPathNumber];
    }
    return color;
}

  /**
   * Copy the project URL to the clipboard
   */
  copyProjectURL() {
    let textArea = document.createElement('textarea');
    textArea.value = this.projectURL;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  /**
   * Open the project.json file in a new tab
   */
  openProjectURLInNewTab() {
    window.open(this.projectURL, '_blank');
  }

  /**
   * Get the number of inactive groups.
   * @return The number of inactive groups.
   */
  getNumberOfInactiveGroups() {
    let count = 0;
    for (let n = 0; n < this.inactiveNodes.length; n++) {
      let inactiveNode = this.inactiveNodes[n];
      if (inactiveNode != null) {
        if (inactiveNode.type == 'group') {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get the number of inactive steps. This only counts the inactive steps that
   * are not in an inactive group.
   * @return The number of inactive steps (not including the inactive steps that
   * are in an inactive group).
   */
  getNumberOfInactiveSteps() {
    let count = 0;
    for (let n = 0; n < this.inactiveNodes.length; n++) {
      let inactiveNode = this.inactiveNodes[n];
      if (inactiveNode != null) {
        if (inactiveNode.type == 'node' &&
              this.ProjectService.getParentGroup(inactiveNode.id) == null) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get the parent of a node.
   * @param nodeId Get the parent of this node.
   * @return The parent group node or null if the node does not have a parent.
   */
  getParentGroup(nodeId) {
    return this.ProjectService.getParentGroup(nodeId);
  }

  /**
   * The checkbox for a node was clicked. We will determine whether there are
   * any activity nodes that are selected or whether there are any step nodes
   * that are selected. We do this because we do not allow selecting a mix of
   * activities and steps. If there are any activity nodes that are selected,
   * we will disable all the step node check boxes. Alternatively, if there are
   * any step nodes selected, we will disable all the activity node check boxes.
   * @param nodeId The node id of the node that was clicked.
   */
  projectItemClicked(nodeId) {
    this.stepNodeSelected = false;
    this.activityNodeSelected = false;

    // this will check the items that are used in the project
    for (let nodeId in this.items) {
      let node = this.items[nodeId];
      if (node.checked) {
        if (this.isGroupNode(nodeId)) {
          this.activityNodeSelected = true;
        } else {
          this.stepNodeSelected = true;
        }
      }
    }

    // this will check the items that are unused in the project
    for (let key in this.idToNode) {
      let node = this.idToNode[key];
      if (node.checked) {
        if (this.isGroupNode(key)) {
          this.activityNodeSelected = true;
        } else {
          this.stepNodeSelected = true;
        }
      }
    }
  }

  /**
   * Check if a node is a branch point.
   * @param nodeId The node id of the node.
   * @return Whether the node is a branch point.
   */
  isBranchPoint(nodeId) {
    return this.ProjectService.isBranchPoint(nodeId);
  }

  /**
   * Get the number of branch paths. This is assuming the node is a branch point.
   * @param nodeId The node id of the branch point node.
   * @return The number of branch paths for this branch point.
   */
  getNumberOfBranchPaths(nodeId) {
    return this.ProjectService.getNumberOfBranchPaths(nodeId);
  }

  /**
   * Get the description of the branch criteria.
   * @param nodeId The node id of the branch point node.
   * @returns A human readable string describing how we will decide which
   * branch path a student goes down.
   */
  getBranchCriteriaDescription(nodeId) {
    return this.ProjectService.getBranchCriteriaDescription(nodeId);
  }

  /**
   * Check if a node has a constraint.
   * @param nodeId The node id of the node.
   * @return Whether the node has a constraint authored on it.
   */
  nodeHasConstraint(nodeId) {
    return this.ProjectService.nodeHasConstraint(nodeId);
  }

  /**
   * Get the number of constraints authored on a node.
   * @param nodeId The node id of the node.
   * @return The number of constraints authored on a node.
   */
  getNumberOfConstraintsOnNode(nodeId) {
    let constraints = this.ProjectService.getConstraintsOnNode(nodeId);
    return constraints.length;
  }

  /**
   * Get the description of the constraints authored on the given step.
   * @param nodeId The node id.
   * @return A human readable string containing the description of the
   * constraints authored on the given step.
   */
  getConstraintDescriptions(nodeId) {
    let constraintDescriptions = '';
    let constraints = this.ProjectService.getConstraintsOnNode(nodeId);
    for (let c = 0; c < constraints.length; c++) {
      let constraint = constraints[c];
      let description = this.ProjectService.getConstraintDescription(constraint);
      constraintDescriptions += (c + 1) + ' - ' + description + '\n';
    }
    return constraintDescriptions;
  }

  /**
   * Check if a node has a rubric.
   * @param nodeId The node id of the node.
   * @return Whether the node or one of the node's components has a rubric
   * authored on it.
   */
  nodeHasRubric(nodeId) {
    return this.ProjectService.nodeHasRubric(nodeId);
  }

  subscribeToCurrentAuthors(projectId) {
    return this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
      this.$stomp.subscribe(`/topic/current-authors/${projectId}`, (authors, headers, res) => {
        this.showOtherConcurrentAuthors(authors);
      }, {});
    });
  }

  unSubscribeFromCurrentAuthors(projectId) {
    return this.$stomp.disconnect();
  }
}

ProjectController.$inject = [
    '$anchorScroll',
    '$filter',
    '$interval',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$stomp',
    '$timeout',
    '$window',
    'ConfigService',
    'ProjectAssetService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
];

export default ProjectController;
