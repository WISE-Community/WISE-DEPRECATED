'use strict';

class ProjectController {

  constructor($anchorScroll,
        $filter,
        $interval,
        $mdDialog,
        $q,
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $timeout,
        AuthorWebSocketService,
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
    this.$timeout = $timeout;
    this.$translate = this.$filter('translate');
    this.AuthorWebSocketService = AuthorWebSocketService;
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
    this.inactiveGroups = this.ProjectService.getInactiveGroups();
    this.inactiveNodes = this.ProjectService.getInactiveNodes();
    this.projectScriptFilename = this.ProjectService.getProjectScriptFilename();
    this.currentAuthorsMessage = "";  // show a message when there is more than one author currently authoring this project

    this.projectMode = true;
    this.showCreateGroup = false;
    this.showCreateNode = false;
    this.showImportView = false;
    this.importMode = false;
    this.editProjectRubricMode = false;
    this.advancedMode = false;
    this.showJSONAuthoring = false;

    /*
     * The colors for the branch path steps. The colors are from
     * http://colorbrewer2.org/
     * http://colorbrewer2.org/export/colorbrewer.js
     * The colors chosen are from the "qualitative", "Set2".
     */
    this.stepBackgroundColors = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"];

    // we are opening the project so we will set the current node to null
    this.TeacherDataService.setCurrentNode(null);

    this.scrollToTopOfPage();

    // process metadata
    this.metadata = this.ProjectService.getProjectMetadata();

    // notify others that this project is being authored
    this.ProjectService.notifyAuthorProjectBegin(this.projectId);

    // generate the summernote rubric element id
    this.summernoteRubricId = 'summernoteRubric_' + this.projectId;

    // set the project rubric into the summernote rubric
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

    // the tooltip text for the insert WISE asset button
    var insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = this.UtilService.createInsertAssetButton(this, this.projectId, null, null, 'rubric', insertAssetString);

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
        insertAssetButton: InsertAssetButton
      }
    };

    this.$scope.$on('currentAuthorsReceived', (event, args) => {
      let currentAuthorsUsernames = args.currentAuthorsUsernames;
      let myUserName = this.ConfigService.getMyUserName();

      // remove my username from the currentAuthors
      currentAuthorsUsernames.splice(currentAuthorsUsernames.indexOf(myUserName),1);
      if (currentAuthorsUsernames.length > 0) {
        this.currentAuthorsMessage = this.$translate('concurrentAuthorsWarning',
            { currentAuthors: currentAuthorsUsernames.join(", ") });
      } else {
        this.currentAuthorsMessage = "";
      }
    });

    this.$scope.$on("$destroy", () => {
      // notify others that this project is no longer being authored
      this.ProjectService.notifyAuthorProjectEnd(this.projectId);
    });

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      // make sure the event was fired for this component
      if (args != null && args.projectId == this.projectId) {
        // the asset was selected for this component
        var assetItem = args.assetItem;

        if (assetItem != null && assetItem.fileName != null) {
          var fileName = assetItem.fileName;

          /*
           * get the assets directory path
           * e.g.
           * /wise/curriculum/3/
           */
          var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
          var fullAssetPath = assetsDirectoryPath + '/' + fileName;
          var summernoteId = '';

          if (args.target == 'rubric') {
            // the target is the summernote rubric element
            summernoteId = 'summernoteRubric_' + this.projectId;

            if (summernoteId != '') {
              if (this.UtilService.isImage(fileName)) {
                /*
                 * move the cursor back to its position when the asset chooser
                 * popup was clicked
                 */
                $('#' + summernoteId).summernote('editor.restoreRange');
                $('#' + summernoteId).summernote('editor.focus');

                // add the image html
                $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
              } else if (this.UtilService.isVideo(fileName)) {
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
          } else if (args.target == 'scriptFilename') {
            // the target is the project script filename
            this.projectScriptFilename = fileName;
            this.projectScriptFilenameChanged();
          }
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
      this.saveEvent('projectSaved', 'Authoring');
    });

    /*
     * Listen for the event to parse the project. This is so other
     * controllers can trigger parsing the project in this controller.
     */
    this.$rootScope.$on('parseProject', () => {
      // refresh the project
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    });
    this.saveEvent('projectOpened', 'Navigation');
  };

  /**
   * Launch the project in preview mode
   */
  previewProject() {
    let data = { constraints: true };
    this.saveEvent('projectPreviewed', 'Navigation', data);
    window.open(this.ConfigService.getConfigParam("previewProjectURL"));
  };

  /**
   * Launch the project in preview mode without constraints
   */
  previewProjectWithoutConstraints() {
    let data = { constraints: false };
    this.saveEvent('projectPreviewed', 'Navigation', data);
    window.open(this.ConfigService.getConfigParam("previewProjectURL") +
        '?constraints=false');
  };

  viewProjectAssets() {
    this.$state.go('root.project.asset', {projectId:this.projectId});
  };

  viewProjectHistory() {
    this.$state.go('root.project.history', {projectId:this.projectId});
  };

  viewNotebookSettings() {
    this.$state.go('root.project.notebook', {projectId:this.projectId});
  }

  saveProject() {
    //let projectJSONString = JSON.stringify(this.project, null, 4);
    //let commitMessage = $("#commitMessageInput").val();
    let commitMessage = "Made changes to Project.";
    try {
      // if projectJSONString is bad json, it will throw an exception and not save.
      //this.ProjectService.project = this.project;

      this.ProjectService.saveProject(commitMessage).then((commitHistoryArray) => {
        this.commitHistory = commitHistoryArray;
        $("#commitMessageInput").val("");  // clear field after commit
      });
    } catch (error) {
      alert("Invalid JSON. Please check syntax. Aborting save.");
      return;
    }
  };

  /**
   * Make a request to download this project as a zip file
   */
  downloadProject() {
    window.location.href = this.ConfigService.getWISEBaseURL()
        + "/project/export/" + this.projectId;
  }

  /**
   * Close authoring for the current project and bring user back to main AT page
   */
  closeProject() {
    this.$state.go('root.main');
  };

  /**
   * Get the node position
   * @param nodeId the node id
   * @returns the node position
   */
  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  };

  /**
   * The the components in the specified node id.
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
    return this.ProjectService.getPossibleTransitionCriteria(nodeId, componentId);
  }

  /**
   * Get the node title for a node
   * @param nodeId the node id
   * @returns the node title
   */
  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  };

  /**
   * Check if a node id is for a group
   * @param nodeId
   * @returns whether the node is a group node
   */
  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  };

  /**
   * A node was clicked so we will go to the node authoring view
   * @param nodeId
   */
  nodeClicked(nodeId) {
    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    this.$state.go('root.project.node', {projectId: this.projectId, nodeId:nodeId});
  };

  /**
   * Create a new group (activity)
   */
  createGroup() {
    const newGroup = this.ProjectService.createGroup(this.createGroupTitle);

    /*
     * set the group into this variable to hold it temporarily while the
     * author decides where to place it
     */
    this.nodeToAdd = newGroup;

    // turn off the create group div
    this.showCreateGroup = false;

    // clear the title from the create group div
    this.createGroupTitle = '';

    // turn on insert mode
    this.insertGroupMode = true;

    // turn on create mode
    this.createMode = true;
  }

  /**
   * Create a new node (step)
   */
  createNode() {
    const newNode = this.ProjectService.createNode(this.createNodeTitle);

    /*
     * set the node into this variable to hold it temporarily while the
     * author decides where to place it
     */
    this.nodeToAdd = newNode;

    // turn off the create node div
    this.showCreateNode = false;

    // clear the title from the create node div
    this.createNodeTitle = '';

    // turn on insert mode
    this.insertNodeMode = true;

    // turn on create mode
    this.createMode = true;
  }

  /**
   * Insert the node(s) inside
   * @param nodeId the node id of the group that we will insert into
   */
  insertInside(nodeId) {
    // TODO check that we are inserting into a group
    if (this.createMode) {
      // create the node inside the group
      this.ProjectService.createNodeInside(this.nodeToAdd, nodeId);

      let newNodes = [this.nodeToAdd];

      // remember the new node
      let newNode = this.nodeToAdd;

      /*
       * clear this variable that we used to hold the node we inserted.
       * since we have inserted the node we don't need a handle to it
       * anymore
       */
      this.nodeToAdd = null;

      // turn off create mode
      this.createMode = false;

      // turn off insert mode
      this.insertGroupMode = false;
      this.insertNodeMode = false;

      // temporarily highlight the new nodes
      this.highlightNewNodes(newNodes);

      // save and refresh the project
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        if (newNode != null) {

          let data = {};
          data.nodeId = newNode.id;
          data.title = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);

          if (this.ProjectService.isGroupNode(newNode.id)) {
            // save the activity created event to the server
            this.saveEvent('activityCreated', 'Authoring', data);
          } else {
            // save the step created event to the server
            this.saveEvent('stepCreated', 'Authoring', data);
          }
        }
      });
    } else if (this.moveMode) {
      let selectedNodeIds = this.getSelectedItems();
      if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
        /*
         * the user is trying to insert the selected node ids into
         * itself so we will not allow that
         */
        if (selectedNodeIds.length == 1) {
          alert('You are not allowed to insert the selected item into itself.');
        } else if (selectedNodeIds.length > 1) {
          alert('You are not allowed to insert the selected items into itself.');
        }
      } else {
        // perform the move

        /*
         * an array of nodes that will be saved in the data for the move
         * event
         */
        let nodes = [];
        for (let n = 0; n < selectedNodeIds.length; n++) {
          let selectedNodeId = selectedNodeIds[n];
          let node = {
            nodeId: selectedNodeId,
            fromTitle: this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
          };
          nodes.push(node);
        }

        // move the nodes into the group
        let newNodes = this.ProjectService.moveNodesInside(selectedNodeIds, nodeId);

        // turn off move mode
        this.moveMode = false;

        // turn off insert mode
        this.insertGroupMode = false;
        this.insertNodeMode = false;

        // temporarily highlight the new nodes
        this.highlightNewNodes(newNodes);

        // save and refresh the project
        this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
          if (newNodes != null && newNodes.length > 0) {
            var firstNewNode = newNodes[0];
            if (firstNewNode != null && firstNewNode.id != null) {

              // loop through all the nodes that will be saved in the event data
              for (let n = 0; n < nodes.length; n++) {
                let node = nodes[n];

                // get the new node object
                let newNode = newNodes[n];

                if (node != null && newNode != null) {

                  // set the new title
                  node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
                }
              }

              if (this.ProjectService.isGroupNode(firstNewNode.id)) {
                let data = { activitiesMoved: nodes };
                this.saveEvent('activityMoved', 'Authoring', data);
              } else {
                let data = { stepsMoved: nodes };
                this.saveEvent('stepMoved', 'Authoring', data);
              }
            }
          }
        });
      }
    } else if (this.copyMode) {
      let selectedNodeIds = this.getSelectedItems();

      /*
       * an array of nodes that will be saved in the data for the move
       * event
       */
      let nodes = [];
      for (let n = 0; n < selectedNodeIds.length; n++) {
        let selectedNodeId = selectedNodeIds[n];
        let node = {
          fromNodeId: selectedNodeId,
          fromTitle: this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
        };
        nodes.push(node);
      }

      // copy the nodes into the group
      let newNodes = this.ProjectService.copyNodesInside(selectedNodeIds, nodeId);

      // turn off copy mode
      this.copyMode = false;

      // turn off insert mode
      this.insertGroupMode = false;
      this.insertNodeMode = false;

      // temporarily highlight the new nodes
      this.highlightNewNodes(newNodes);

      // save and refresh the project
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        if (newNodes != null && newNodes.length > 0) {
          var firstNewNode = newNodes[0];

          if (firstNewNode != null && firstNewNode.id != null) {

            // loop through all the nodes that will be saved in the event data
            for (let n = 0; n < nodes.length; n++) {
              let node = nodes[n];
              let newNode = newNodes[n];

              if (node != null && newNode != null) {

                // set the new id
                node.toNodeId = newNode.id;

                // set the new title
                node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
              }
            }

            if (this.ProjectService.isGroupNode(firstNewNode.id)) {
              let data = { activitiesCopied: nodes };
              this.saveEvent('activityCopied', 'Authoring', data);
            } else {
              let data = { stepsCopied: nodes };
              this.saveEvent('stepCopied', 'Authoring', data);
            }
          }
        }
      });
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
      // create the node after the node id
      this.ProjectService.createNodeAfter(this.nodeToAdd, nodeId);

      let newNodes = [this.nodeToAdd];
      let newNode = this.nodeToAdd;

      /*
       * clear this variable that we used to hold the node we inserted.
       * since we have inserted the node we don't need a handle to it
       * anymore
       */
      this.nodeToAdd = null;

      // turn off create mode
      this.createMode = false;

      // turn off insert mode
      this.insertGroupMode = false;
      this.insertNodeMode = false;

      // temporarily highlight the new nodes
      this.highlightNewNodes(newNodes);

      // save and referesh the project
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        if (newNode != null) {

          let data = {};
          data.nodeId = newNode.id;
          data.title = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);

          if (this.ProjectService.isGroupNode(newNode.id)) {
            // save the activity created event to the server
            this.saveEvent('activityCreated', 'Authoring', data);
          } else {
            // save the step created event to the server
            this.saveEvent('stepCreated', 'Authoring', data);
          }
        }
      });
    } else if (this.moveMode) {
      let selectedNodeIds = this.getSelectedItems();
      if (selectedNodeIds != null && selectedNodeIds.indexOf(nodeId) != -1) {
        /*
         * the user is trying to insert the selected node ids after
         * itself so we will not allow that
         */
        if (selectedNodeIds.length == 1) {
          alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
        } else if (selectedNodeIds.length > 1) {
          alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
        }
      } else {
        // perform the move

        /*
         * an array of nodes that will be saved in the data for the move
         * event
         */
        let nodes = [];
        for (let n = 0; n < selectedNodeIds.length; n++) {
          let selectedNodeId = selectedNodeIds[n];

          // create an object that contains the id and title
          let node = {};
          node.nodeId = selectedNodeId;
          node.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId);

          nodes.push(node);
        }

        // move the nodes after the node id
        let newNodes = this.ProjectService.moveNodesAfter(selectedNodeIds, nodeId);

        // turn off move mode
        this.moveMode = false;

        // turn off insert mode
        this.insertGroupMode = false;
        this.insertNodeMode = false;

        // temporarily highlight the new nodes
        this.highlightNewNodes(newNodes);

        // save and refresh the project
        this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
          if (newNodes != null && newNodes.length > 0) {
            var firstNewNode = newNodes[0];

            if (firstNewNode != null && firstNewNode.id != null) {

              // loop through all the nodes that will be saved in the event data
              for (let n = 0; n < nodes.length; n++) {
                let node = nodes[n];

                // get the new node object
                let newNode = newNodes[n];

                if (node != null && newNode != null) {

                  // set the new title
                  node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
                }
              }

              if (this.ProjectService.isGroupNode(firstNewNode.id)) {
                let data = {};
                data.activitesMoved = nodes;

                // save the activity moved event to the server
                this.saveEvent('activityMoved', 'Authoring', data);
              } else {
                let data = {};
                data.stepsMoved = nodes;

                // save the step moved event to the server
                this.saveEvent('stepMoved', 'Authoring', data);
              }
            }
          }
        });
      }
    } else if (this.copyMode) {
      let selectedNodeIds = this.getSelectedItems();

      /*
       * an array of nodes that will be saved in the data for the move
       * event
       */
      let nodes = [];

      // loop through the selected node ids
      for (let n = 0; n < selectedNodeIds.length; n++) {
        let selectedNodeId = selectedNodeIds[n];

        // create an object that contains the id and title
        let node = {};
        node.fromNodeId = selectedNodeId;
        node.fromTitle = this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId);

        nodes.push(node);
      }

      // copy the nodes and put them after the node id
      let newNodes = this.ProjectService.copyNodesAfter(selectedNodeIds, nodeId);

      // turn off copy mode
      this.copyMode = false;

      // turn off insert mode
      this.insertGroupMode = false;
      this.insertNodeMode = false;

      // temporarily highlight the new nodes
      this.highlightNewNodes(newNodes);

      // save and refresh the project
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        if (newNodes != null && newNodes.length > 0) {
          var firstNewNode = newNodes[0];

          if (firstNewNode != null && firstNewNode.id != null) {

            // loop through all the nodes that will be saved in the event data
            for (let n = 0; n < nodes.length; n++) {
              let node = nodes[n];
              let newNode = newNodes[n];

              if (node != null && newNode != null) {

                // set the new id
                node.toNodeId = newNode.id;

                // set the new title
                node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
              }
            }

            if (this.ProjectService.isGroupNode(firstNewNode.id)) {

              let data = {};
              data.activitiesCopied = nodes;

              // save the activity moved event to the server
              this.saveEvent('activityCopied', 'Authoring', data);
            } else {

              let data = {};
              data.stepsCopied = nodes;

              // save the step moved event to the server
              this.saveEvent('stepCopied', 'Authoring', data);
            }
          }
        }
      });
    } else if (this.importMode) {
      this.importSelectedNodes(nodeId);
    }
  }

  /**
   * Import the step and then create a stepImported event
   * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
   * new step the first step in the group. If this is a step, we will place
   * the new step after it.
   */
  importSelectedNodes(nodeIdToInsertInsideOrAfter) {
    var selectedNodes = this.getSelectedNodesToImport();

    // get the node titles that we are importing
    var selectedNodeTitles = this.getSelectedNodeTitlesToImport();

    // get the project id we are importing into
    var toProjectId = this.ConfigService.getConfigParam('projectId');

    // get the project id we are importing from
    var fromProjectId = this.importProjectId;

    // import the selected nodes and place them after the given group
    this.performImport(nodeIdToInsertInsideOrAfter).then((newNodes) => {
      // save and refresh the project
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {

        /*
         * use a timeout to allow angular to update the UI and then
         * highlight and scroll to the new nodes
         */
        this.$timeout(() => {

          // loop through all the new nodes and highlight them
          for (var n = 0; n < newNodes.length; n++) {
            var newNode = newNodes[n];
            if (newNode != null) {

              // get the node UI element
              let nodeElement = $("#" + newNode.id);

              // save the original background color
              let originalBackgroundColor = nodeElement.css("backgroundColor");

              // highlight the background briefly to draw attention to it
              nodeElement.css("background-color", "#FFFF9C");

              /*
               * Use a timeout before starting to transition back to
               * the original background color. For some reason the
               * element won't get highlighted in the first place
               * unless this timeout is used.
               */
              this.$timeout(() => {
                // slowly fade back to original background color
                nodeElement.css({
                  'transition': 'background-color 2s ease-in-out',
                  'background-color': originalBackgroundColor
                });
              });
            }
          }

          if (newNodes != null && newNodes.length > 0) {
            // get the UI element of the first new node
            let nodeElement = $("#" + newNodes[0].id);
            if (nodeElement != null) {
              // scroll to the first new node that we've added
              $('#content').animate({
                scrollTop: nodeElement.prop("offsetTop") - 60
              }, 1000);
            }
          }
        });

        // the data for the step imported event
        var data = {
          stepsImported: []
        };

        // loop through all the steps that were imported
        for (var n = 0; n < selectedNodes.length; n++) {
          var selectedNode = selectedNodes[n];

          // get the old step title
          var selectedNodeTitle = selectedNodeTitles[n];

          var newNode = newNodes[n];

          // set the from and to ids and titles
          var tempNode = {};
          tempNode.fromProjectId = parseInt(fromProjectId);
          tempNode.fromNodeId = selectedNode.id;
          tempNode.fromTitle = selectedNodeTitle;
          tempNode.toNodeId = newNode.id;
          tempNode.toTitle = this.ProjectService
            .getNodePositionAndTitleByNodeId(newNode.id);

          data.stepsImported.push(tempNode);
        }
        this.saveEvent('stepImported', 'Authoring', data);
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
    var selectedNodes = this.getSelectedNodesToImport();

    // get the project id we are importing into
    var toProjectId = this.ConfigService.getConfigParam('projectId');

    // get the project id we are importing from
    var fromProjectId = this.importProjectId;

    // copy the nodes into the project
    return this.ProjectService.copyNodes(selectedNodes, fromProjectId,
      toProjectId, nodeIdToInsertInsideOrAfter).then((newNodes) => {

      // refresh the project
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;

      this.insertNodeMode = false;

      // go back to the project view
      this.toggleView('project');

      // clear the import fields
      this.importProjectIdToOrder = {};
      this.importProjectItems = [];
      this.importMyProjectId = null;
      this.importLibraryProjectId = null;
      this.importProjectId = null;
      this.importProject = null;

      // go back to the project view
      this.showProjectHome();

      /*
       * refresh the project assets in case any of the imported
       * steps also imported assets
       */
      this.ProjectAssetService.retrieveProjectAssets();
      return newNodes;
    });
  }

  /**
   * Turn on copy mode
   */
  copy() {
    // make sure there is at least one item selected
    var selectedNodeIds = this.getSelectedItems();
    if (selectedNodeIds != null && selectedNodeIds.length > 0) {
      // get the nodes that were selected
      var selectedItemTypes = this.getSelectedItemTypes();
      if (selectedItemTypes != null && selectedItemTypes.length > 0) {
        if (selectedItemTypes.length === 0) {
          // there are no selected items
          alert('Please select an item to copy.');
        } else if (selectedItemTypes.length === 1 &&
          selectedItemTypes[0] === 'node') {
          // turn on insert and copy modes
          this.insertNodeMode = true;
          this.copyMode = true;
        } else {
          alert('You cannot copy the item(s) at this time.');
        }
      }
    }
  }

  /**
   * Turn on move mode
   */
  move() {
    // make sure there is at least one item selected
    var selectedNodeIds = this.getSelectedItems();
    if (selectedNodeIds != null && selectedNodeIds.length > 0) {
      // get the nodes that were selected
      var selectedItemTypes = this.getSelectedItemTypes();

      if (selectedItemTypes != null && selectedItemTypes.length > 0) {

        if (selectedItemTypes.length == 0) {
          // there are no selected items
          alert('Please select an item to move.');
        } else if (selectedItemTypes.length == 1) {
          // all the items the user selected are the same type

          if (selectedItemTypes[0] === 'group') {
            // turn on insert mode
            this.insertGroupMode = true;

            // turn on move mode
            this.moveMode = true;
          } else if (selectedItemTypes[0] === 'node') {
            // turn on insert mode
            this.insertNodeMode = true;

            // turn on move mode
            this.moveMode = true;
          }
        } else if (selectedItemTypes.length > 1) {
          /*
           * the items the user selected are different types but
           * we do not allow moving different types of items at
           * the same time
           */

          alert('If you want to move multiple items at once, they must be of the same type. Please select only activities or only steps.');
        }
      }
    }
  }

  /**
   * Delete the selected nodes after asking user for confirmation
   */
  delete() {
    let selectedNodeIds = this.getSelectedItems();
    if (selectedNodeIds != null) {
      var confirmMessage = null;
      if (selectedNodeIds.length == 1) {
        // the user selected one item
        confirmMessage = 'Are you sure you want to delete the selected item?';
      } else if (selectedNodeIds.length > 1) {
        // the user selected multiple items
        confirmMessage = 'Are you sure you want to delete the ' + selectedNodeIds.length + ' selected items?';
      }
      if (confirmMessage != null) {
        var doDelete = confirm(confirmMessage);
        if (doDelete) {
          // flag that will be set if we have deleted the start node id
          var deletedStartNodeId = false;
          var activityDeleted = false;
          var stepDeleted = false;
          var stepsDeleted = [];
          var activitiesDeleted = [];
          for (var n = 0; n < selectedNodeIds.length; n++) {
            var nodeId = selectedNodeIds[n];
            var node = this.ProjectService.getNodeById(nodeId);
            var tempNode = {};

            if (node != null) {
              tempNode.nodeId = node.id;
              tempNode.title = this.ProjectService.getNodePositionAndTitleByNodeId(node.id);
            }

            if (this.ProjectService.isStartNodeId(nodeId)) {
              // we have deleted the start node id
              deletedStartNodeId = true;
            }

            if (this.ProjectService.isGroupNode(nodeId)) {
              // we are deleting an activity
              activityDeleted = true;

              var stepsInActivityDeleted = [];

              // loop through all the steps in the activity
              for (var s = 0; s < node.ids.length; s++) {
                var stepNodeId = node.ids[s];

                // get the step title
                var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(stepNodeId);

                // create an object with the step id and title
                var stepObject = {};
                stepObject.nodeId = stepNodeId;
                stepObject.title = stepTitle;

                stepsInActivityDeleted.push(stepObject);
              }

              tempNode.stepsInActivityDeleted = stepsInActivityDeleted;

              activitiesDeleted.push(tempNode);
            } else {
              // we are deleting a step
              stepDeleted = true;

              stepsDeleted.push(tempNode);
            }

            // delete the node
            this.ProjectService.deleteNode(nodeId);
          }

          // update start node id if necesary
          if (deletedStartNodeId) {
            this.updateStartNodeId();
          }

          if (activityDeleted) {
            var data = {};
            data.activitiesDeleted = activitiesDeleted;
            this.saveEvent('activityDeleted', 'Authoring', data);
          }

          if (stepDeleted) {
            var data = {};
            data.stepsDeleted = stepsDeleted;
            this.saveEvent('stepDeleted', 'Authoring', data);
          }

          // save the project
          this.ProjectService.saveProject();

          // refresh the project
          this.ProjectService.parseProject();
          this.items = this.ProjectService.idToOrder;
        }
      }
    }

    // uncheck all the checkboxes
    this.unselectAllItems();
  }

  /**
   * Get the selected items
   * @returns an array of node ids that are selected
   */
  getSelectedItems() {
    // an array to hold the node ids of the nodes that are selected
    var selectedNodeIds = [];

    // loop through all the node checkboxes
    angular.forEach(this.items, function(value, key) {
      if (value.checked) {
        // this node is checked
        selectedNodeIds.push(key);
      }
    }, selectedNodeIds);

    if (this.inactiveNodes != null) {

      // loop through all the inactive nodes
      for (var i = 0; i < this.inactiveNodes.length; i++) {
        var inactiveNode = this.inactiveNodes[i];

        if (inactiveNode != null) {
          if (inactiveNode.checked) {
            // the inactive node was checked so we will add it
            selectedNodeIds.push(inactiveNode.id);
          }
        }
      }
    }

    return selectedNodeIds;
  }

  /**
   * Get the types of the selected items
   * @returns an array of item types. possible items are group or node.
   */
  getSelectedItemTypes() {
    var selectedItemTypes = [];

    // loop through all the node checkboxes
    angular.forEach(this.items, function(value, key) {
      if (value.checked) {

        // this node is checked
        var node = this.ProjectService.getNodeById(key);
        if (node != null) {
          var nodeType = node.type;
          if (selectedItemTypes.indexOf(nodeType) == -1) {
            // we have not seen this node type yet so we will add it
            selectedItemTypes.push(nodeType);
          }
        }
      }
    }, this);

    // TODO @geoffreykwan refactor below. too much nesting.
    var inactiveNodes = this.inactiveNodes;
    if (inactiveNodes != null) {

      // loop through all the inactive nodes
      for (var i = 0; i < inactiveNodes.length; i++) {
        var inactiveNode = inactiveNodes[i];

        if (inactiveNode != null) {
          if (inactiveNode.checked) {
            // the node was checked

            // get the node type
            var nodeType = inactiveNode.type;

            if (selectedItemTypes.indexOf(nodeType) == -1) {
              // we have not seen this node type yet so we will add it
              selectedItemTypes.push(nodeType);
            }
          }
        }
      }
    }

    return selectedItemTypes;
  }

  /**
   * Unselect all the items
   */
  unselectAllItems() {
    angular.forEach(this.items, function(value, key) {
      value.checked = false;
    });
  }

  /**
   * Show the create group input
   */
  creatNewActivityClicked() {
    // clear the create group title
    this.createGroupTitle = '';

    // show the create group view
    this.toggleView('createGroup');

    if (this.showCreateGroup) {
      /*
       * we are showing the create node view so we will give focus to the
       * createGroupTitle input element
       */
      this.$timeout(() => {
        var createGroupTitleInput = document.getElementById('createGroupTitle');
        if (createGroupTitleInput != null) {
          createGroupTitleInput.focus();
        }
      });
    }
  }

  /**
   * Toggle the create node input
   */
  createNewStepClicked() {
    // clear the create node title
    this.createNodeTitle = '';

    // show the create node view
    this.toggleView('createNode');

    if (this.showCreateNode) {
      /*
       * we are showing the create node view so we will give focus to the
       * createNodeTitle input element
       */
      this.$timeout(() => {
        var createNodeTitleInput = document.getElementById('createNodeTitle');
        if (createNodeTitleInput != null) {
          createNodeTitleInput.focus();
        }
      });
    }
  }

  /**
   * Cancel the move mode
   */
  cancelMove() {
    this.insertGroupMode = false;
    this.insertNodeMode = false;

    // clear any new node that we might be inserting
    this.nodeToAdd = null;

    // turn off the modes
    this.createMode = false;
    this.moveMode = false;
    this.copyMode = false;
    this.importMode = false;

    // uncheck all the checkboxes
    this.unselectAllItems();
  }

  /**
   * Update the start node id by traversing start ids until a
   * node id is found.
   */
  updateStartNodeId() {
    var newStartNodeId = null;

    // get the start group id
    var startGroupId = this.ProjectService.getStartGroupId();
    var node = this.ProjectService.getNodeById(startGroupId);

    var done = false;

    // recursively traverse the start ids
    while(!done) {

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
      // get the current start node id
      var currentStartNodeId = this.ProjectService.getStartNodeId();

      // get the first leaf node id
      var firstLeafNodeId = this.ProjectService.getFirstLeafNodeId();

      if (firstLeafNodeId == null) {
        // there are no steps in the project

        // set the start node id to empty string
        this.ProjectService.setStartNodeId('');

        resolve();
      } else {
        // we have found a leaf node

        if (currentStartNodeId != firstLeafNodeId) {
          /*
           * the node ids are different which means the first leaf node
           * id is different than the current start node id and that
           * the author may want to use the first leaf node id as the
           * new start node id
           */
          var firstLeafNode = this.ProjectService.getNodeById(firstLeafNodeId);

          if (firstLeafNode != null) {
            var firstChildTitle = firstLeafNode.title;

            // ask the user if they would like to change the start step to the step that is now the first child in the group
            var confirmUpdateStartStep = this.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle });

            var answer = confirm(confirmUpdateStartStep);

            if (answer) {
              // change the project start node id
              this.ProjectService.setStartNodeId(firstLeafNodeId);
              resolve();
            } else {
              resolve();
            }
          } else {
            resolve();
          }
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
    // check if the project start node id should be changed
    return this.checkPotentialStartNodeIdChange().then(() => {
      this.ProjectService.saveProject();

      // refresh the project
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;

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
   * Toggle the import view and load the project drop downs if necessary
   */
  importStepClicked() {
    // show the import step view
    this.toggleView('importStep');

    if (this.importMode) {
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
      this.ProjectService.retrieveProjectById(this.importProjectId).then((projectJSON) => {

        // create the mapping of node id to order for the import project
        this.importProjectIdToOrder = {};
        this.importProject = projectJSON;

        // calculate the node order of the import project
        var result = this.ProjectService.getNodeOrderOfProject(this.importProject);
        this.importProjectIdToOrder = result.idToOrder;
        this.importProjectItems = result.nodes;
      });
    }
  }

  /**
   * Preview the import project in a new tab
   */
  previewImportProject() {
    if (this.importProject != null) {
      // get the preview project url for the import project
      const previewProjectURL = this.importProject.previewProjectURL;
      window.open(previewProjectURL);
    }
  }

  /**
   * Preview the step in a new tab
   * @param node
   */
  previewImportNode(node) {
    if (node != null) {
      const nodeId = node.id;
      const previewProjectURL = this.importProject.previewProjectURL;
      const previewStepURL  = previewProjectURL + "#/vle/" + nodeId;
      window.open(previewStepURL);
    }
  }

  /**
   * Import the selected steps
   */
  importSteps() {
    var selectedNodes = this.getSelectedNodesToImport();
    if (selectedNodes == null || selectedNodes.length == 0) {
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
    for (var n = 0; n < this.importProjectItems.length; n++) {
      let item = this.importProjectItems[n];
      if (item.checked) {
        /*
         * this item is checked so we will add it to the array of nodes
         * that we will import
         */
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
    this.showJSONAuthoring = !this.showJSONAuthoring;
    if (this.showJSONAuthoring) {
      this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
    }
  }

  /**
   * Save the project JSON string to the server
   */
  saveProjectJSONString() {
    // create the project object from the project JSON string
    let project = angular.fromJson(this.projectJSONString);
    this.ProjectService.setProject(project);
    this.checkPotentialStartNodeIdChangeThenSaveProject();
  }

  /**
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {
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

    // update the project rubric
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  /**
   * Check if the node is in any branch path
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
    var openAssetChooserParams = {
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
   * Temporarily highlight the new nodes
   * @param newNodes the new nodes to highlight
   */
  highlightNewNodes(newNodes) {
    this.$timeout(() => {
      if (newNodes != null) {
        for (let n = 0; n < newNodes.length; n++) {
          let newNode = newNodes[n];
          if (newNode != null) {
            let nodeElement = $("#" + newNode.id);

            // save the original background color
            let originalBackgroundColor = nodeElement.css("backgroundColor");

            // highlight the background briefly to draw attention to it
            nodeElement.css("background-color", "#FFFF9C");

            /*
             * Use a timeout before starting to transition back to
             * the original background color. For some reason the
             * element won't get highlighted in the first place
             * unless this timeout is used.
             */
            this.$timeout(() => {
              // slowly fade back to original background color
              nodeElement.css({
                'transition': 'background-color 3s ease-in-out',
                'background-color': originalBackgroundColor
              });
            });
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
    for (var n = 0; n < selectedNodes.length; n++) {
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
   * ndoe is not in a branch path it will return null.
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
  '$timeout',
  'AuthorWebSocketService',
  'ConfigService',
  'ProjectAssetService',
  'ProjectService',
  'TeacherDataService',
  'UtilService'
];

export default ProjectController;
