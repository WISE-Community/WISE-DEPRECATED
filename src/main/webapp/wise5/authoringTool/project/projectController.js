'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectController = function () {
  function ProjectController($anchorScroll, $filter, $interval, $mdDialog, $q, $rootScope, $scope, $state, $stateParams, $timeout, AuthorWebSocketService, ConfigService, ProjectAssetService, ProjectService, TeacherDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, ProjectController);

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
    this.currentAuthorsMessage = '';
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
     * The colors chosen are from the 'qualitative', 'Set2'.
     */
    this.stepBackgroundColors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'];

    // start by opening the project, with no node being authored
    this.TeacherDataService.setCurrentNode(null);

    this.metadata = this.ProjectService.getProjectMetadata();
    this.ProjectService.notifyAuthorProjectBegin(this.projectId);
    this.summernoteRubricId = 'summernoteRubric_' + this.projectId;
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());

    var insertAssetToolTipText = this.$translate('INSERT_ASSET');
    var insertAssetButton = this.UtilService.createInsertAssetButton(this, this.projectId, null, null, 'rubric', insertAssetToolTipText);

    // options to display in the summernote tool
    this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        'insertAssetButton': insertAssetButton
      }
    };

    this.projectURL = window.location.origin + this.ConfigService.getConfigParam('projectURL');

    this.$scope.$on('currentAuthorsReceived', function (event, args) {
      var currentAuthorsUsernames = args.currentAuthorsUsernames;
      var myUserName = _this.ConfigService.getMyUserName();
      currentAuthorsUsernames.splice(currentAuthorsUsernames.indexOf(myUserName), 1);
      if (currentAuthorsUsernames.length > 0) {
        _this.currentAuthorsMessage = _this.$translate('concurrentAuthorsWarning', { currentAuthors: currentAuthorsUsernames.join(', ') });
      } else {
        _this.currentAuthorsMessage = '';
      }
    });

    this.$scope.$on('$destroy', function () {
      _this.ProjectService.notifyAuthorProjectEnd(_this.projectId);
    });

    /*
     * Listen for the assetSelected event which occurs when the author
     * selects an asset from the choose asset popup to add to project rubric
     * or choosing the script file.
     */
    this.$scope.$on('assetSelected', function (event, args) {
      if (args != null && args.projectId == _this.projectId && args.assetItem != null && args.assetItem.fileName != null) {
        var assetFileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          var summernoteElement = $('#summernoteRubric_' + _this.projectId);
          var fullAssetPath = _this.ConfigService.getProjectAssetsDirectoryPath() + '/' + assetFileName;
          if (_this.UtilService.isImage(assetFileName)) {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            summernoteElement.summernote('editor.restoreRange');
            summernoteElement.summernote('editor.focus');
            summernoteElement.summernote('insertImage', fullAssetPath, assetFileName);
          } else if (_this.UtilService.isVideo(assetFileName)) {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            summernoteElement.summernote('editor.restoreRange');
            summernoteElement.summernote('editor.focus');
            var videoElement = document.createElement('video');
            videoElement.controls = 'true';
            videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
            summernoteElement.summernote('insertNode', videoElement);
          }
        } else if (args.target === 'scriptFilename') {
          _this.projectScriptFilename = assetFileName;
          _this.projectScriptFilenameChanged();
        }
      }
      _this.$mdDialog.hide();
    });

    this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState != null) {
        var stateName = toState.name;
        if (stateName == 'root.project') {
          _this.saveEvent('projectHomeViewOpened', 'Navigation');
        } else if (stateName == 'root.project.node') {} else if (stateName == 'root.project.asset') {
          _this.saveEvent('assetsViewOpened', 'Navigation');
        } else if (stateName == 'root.project.info') {
          _this.saveEvent('projectInfoViewOpened', 'Navigation');
        } else if (stateName == 'root.project.notebook') {
          _this.saveEvent('notebookViewOpened', 'Navigation');
        }
      }
    });

    this.$rootScope.$on('projectSaved', function () {
      _this.saveEvent('projectSaved', 'Authoring');
    });

    /*
     * Listen for the event to parse the project. This is so other
     * controllers can trigger parsing the project in this controller.
     */
    this.$rootScope.$on('parseProject', function () {
      _this.refreshProject();
    });

    this.saveEvent('projectOpened', 'Navigation');
  }

  _createClass(ProjectController, [{
    key: 'previewProject',


    /**
     * Launch the project in preview mode in a new tab
     */
    value: function previewProject() {
      var previewProjectEventData = { constraints: true };
      this.saveEvent('projectPreviewed', 'Navigation', previewProjectEventData);
      window.open(this.ConfigService.getConfigParam('previewProjectURL'));
    }
  }, {
    key: 'previewProjectWithoutConstraints',


    /**
     * Launch the project in preview mode without constraints in a new tab
     */
    value: function previewProjectWithoutConstraints() {
      var previewProjectEventData = { constraints: false };
      this.saveEvent('projectPreviewed', 'Navigation', previewProjectEventData);
      window.open(this.ConfigService.getConfigParam('previewProjectURL') + '?constraints=false');
    }
  }, {
    key: 'viewProjectAssets',
    value: function viewProjectAssets() {
      this.$state.go('root.project.asset', { projectId: this.projectId });
    }
  }, {
    key: 'viewProjectHistory',
    value: function viewProjectHistory() {
      this.$state.go('root.project.history', { projectId: this.projectId });
    }
  }, {
    key: 'viewNotebookSettings',
    value: function viewNotebookSettings() {
      this.$state.go('root.project.notebook', { projectId: this.projectId });
    }
  }, {
    key: 'saveProject',
    value: function saveProject() {
      var _this2 = this;

      var commitMessage = 'Made changes to the project.';
      try {
        // if projectJSONString is bad json,
        // an exception will be thrown and it will not save.
        this.ProjectService.saveProject(commitMessage).then(function (commitHistoryArray) {
          _this2.commitHistory = commitHistoryArray;
          $('#commitMessageInput').val('');
        });
      } catch (error) {
        // TODO: i18n
        alert('Invalid JSON. Please check syntax. Aborting save.');
        return;
      }
    }
  }, {
    key: 'downloadProject',


    /**
     * Make a request to download this project as a zip file
     */
    value: function downloadProject() {
      window.location.href = this.ConfigService.getWISEBaseURL() + '/project/export/' + this.projectId;
    }

    /**
     * Close authoring for the current project and bring user back to main AT page
     */

  }, {
    key: 'closeProject',
    value: function closeProject() {
      this.$state.go('root.main');
    }
  }, {
    key: 'getNodePositionById',


    /**
     * Get the node position
     * @param nodeId the node id
     * @returns the node position
     */
    value: function getNodePositionById(nodeId) {
      return this.ProjectService.getNodePositionById(nodeId);
    }
  }, {
    key: 'getComponentsByNodeId',


    /**
     * Get the components that are in the specified node id.
     * @param nodeId the node id
     * @returns components in the node
     */
    value: function getComponentsByNodeId(nodeId) {
      return this.ProjectService.getComponentsByNodeId(nodeId);
    }

    /**
     * Returns a list of possible criteria for the specified node and component
     * @param nodeId the node id
     * @param componentId the component id in the node
     */

  }, {
    key: 'getPossibleTransitionCriteria',
    value: function getPossibleTransitionCriteria(nodeId, componentId) {
      return this.ProjectService.getPossibleTransitionCriteria(nodeId, componentId);
    }

    /**
     * Get the node title for a node
     * @param nodeId the node id
     * @returns the node title
     */

  }, {
    key: 'getNodeTitleByNodeId',
    value: function getNodeTitleByNodeId(nodeId) {
      return this.ProjectService.getNodeTitleByNodeId(nodeId);
    }
  }, {
    key: 'isGroupNode',


    /**
     * Check if a node id is for a group
     * @param nodeId
     * @returns whether the node is a group node
     */
    value: function isGroupNode(nodeId) {
      return this.ProjectService.isGroupNode(nodeId);
    }
  }, {
    key: 'nodeClicked',


    /**
     * A node was clicked so we will go to the node authoring view
     * @param nodeId
     */
    value: function nodeClicked(nodeId) {
      this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
      this.$state.go('root.project.node', { projectId: this.projectId, nodeId: nodeId });
    }
  }, {
    key: 'createGroup',


    /**
     * Create a new group (activity)
     */
    value: function createGroup() {
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

  }, {
    key: 'createNode',
    value: function createNode() {
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

  }, {
    key: 'insertInside',
    value: function insertInside(nodeId) {
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

  }, {
    key: 'insertAfter',
    value: function insertAfter(nodeId) {
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

  }, {
    key: 'handleCreateModeInsert',
    value: function handleCreateModeInsert(nodeId, moveTo) {
      var _this3 = this;

      if (moveTo === 'inside') {
        this.ProjectService.createNodeInside(this.nodeToAdd, nodeId);
      } else if (moveTo === 'after') {
        this.ProjectService.createNodeAfter(this.nodeToAdd, nodeId);
      } else {
        // an unspecified moveTo was provided
        return;
      }

      var newNodes = [this.nodeToAdd];
      var newNode = this.nodeToAdd;

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

      this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
        if (newNode != null) {
          var nodeCreatedEventData = {
            'nodeId': newNode.id,
            'title': _this3.ProjectService.getNodePositionAndTitleByNodeId(newNode.id)
          };

          if (_this3.ProjectService.isGroupNode(newNode.id)) {
            _this3.saveEvent('activityCreated', 'Authoring', nodeCreatedEventData);
          } else {
            _this3.saveEvent('stepCreated', 'Authoring', nodeCreatedEventData);
          }
        }
      });
    }

    /**
     * Move a node and insert it in the specified location
     * @param nodeId insert the new node inside or after this node id
     * @param moveTo whether to insert 'inside' or 'after' the nodeId parameter
     */

  }, {
    key: 'handleMoveModeInsert',
    value: function handleMoveModeInsert(nodeId, moveTo) {
      var _this4 = this;

      var selectedNodeIds = this.getSelectedNodeIds();
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
        var movedNodes = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = selectedNodeIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var selectedNodeId = _step.value;

            var node = {
              'nodeId': selectedNodeId,
              'fromTitle': this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
            };
            movedNodes.push(node);
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

        var newNodes = [];
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
        this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
          if (newNodes != null && newNodes.length > 0) {
            var firstNewNode = newNodes[0];
            if (firstNewNode != null && firstNewNode.id != null) {
              for (var n = 0; n < movedNodes.length; n++) {
                var node = movedNodes[n];
                var newNode = newNodes[n];
                if (node != null && newNode != null) {
                  node.toTitle = _this4.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
                }
              }

              if (_this4.ProjectService.isGroupNode(firstNewNode.id)) {
                var nodeMovedEventData = { activitiesMoved: movedNodes };
                _this4.saveEvent('activityMoved', 'Authoring', nodeMovedEventData);
              } else {
                var _nodeMovedEventData = { stepsMoved: movedNodes };
                _this4.saveEvent('stepMoved', 'Authoring', _nodeMovedEventData);
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

  }, {
    key: 'handleCopyModeInsert',
    value: function handleCopyModeInsert(nodeId, moveTo) {
      var _this5 = this;

      var copiedNodes = [];
      var selectedNodeIds = this.getSelectedNodeIds();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = selectedNodeIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var selectedNodeId = _step2.value;

          var node = {
            'fromNodeId': selectedNodeId,
            'fromTitle': this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
          };
          copiedNodes.push(node);
        }
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

      var newNodes = [];
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
      this.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
        if (newNodes != null && newNodes.length > 0) {
          var firstNewNode = newNodes[0];
          if (firstNewNode != null && firstNewNode.id != null) {
            for (var n = 0; n < copiedNodes.length; n++) {
              var node = copiedNodes[n];
              var newNode = newNodes[n];
              if (node != null && newNode != null) {
                node.toNodeId = newNode.id;
                node.toTitle = _this5.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
              }
            }

            if (_this5.ProjectService.isGroupNode(firstNewNode.id)) {
              var nodeCopiedEventData = { activitiesCopied: copiedNodes };
              _this5.saveEvent('activityCopied', 'Authoring', nodeCopiedEventData);
            } else {
              var _nodeCopiedEventData = { stepsCopied: copiedNodes };
              _this5.saveEvent('stepCopied', 'Authoring', _nodeCopiedEventData);
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

  }, {
    key: 'importSelectedNodes',
    value: function importSelectedNodes(nodeIdToInsertInsideOrAfter) {
      var _this6 = this;

      var selectedNodes = this.getSelectedNodesToImport();
      var selectedNodeTitles = this.getSelectedNodeTitlesToImport();
      var toProjectId = this.ConfigService.getConfigParam('projectId');
      var fromProjectId = this.importProjectId;

      this.performImport(nodeIdToInsertInsideOrAfter).then(function (newNodes) {
        _this6.checkPotentialStartNodeIdChangeThenSaveProject().then(function () {
          var doScrollToNewNodes = true;
          _this6.temporarilyHighlightNewNodes(newNodes, doScrollToNewNodes);

          var stepsImported = [];
          for (var n = 0; n < selectedNodes.length; n++) {
            var selectedNode = selectedNodes[n];
            var selectedNodeTitle = selectedNodeTitles[n];
            var newNode = newNodes[n];

            var stepImported = {
              fromProjectId: parseInt(fromProjectId),
              fromNodeId: selectedNode.id,
              fromTitle: selectedNodeTitle,
              toNodeId: newNode.id,
              toTitle: _this6.ProjectService.getNodePositionAndTitleByNodeId(newNode.id)
            };
            stepsImported.push(stepImported);
          }

          var stepsImportedEventData = { 'stepsImported': stepsImported };
          _this6.saveEvent('stepImported', 'Authoring', stepsImportedEventData);
        });
      });
    }

    /**
     * Import the step and place it in the chosen location
     * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
     * new step the first step in the group. If this is a step, we will place
     * the new step after it.
     */

  }, {
    key: 'performImport',
    value: function performImport(nodeIdToInsertInsideOrAfter) {
      var _this7 = this;

      var selectedNodes = this.getSelectedNodesToImport();
      var toProjectId = this.ConfigService.getConfigParam('projectId');
      var fromProjectId = this.importProjectId;

      return this.ProjectService.copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter).then(function (newNodes) {
        _this7.refreshProject();
        _this7.insertNodeMode = false;
        _this7.toggleView('project');

        _this7.importProjectIdToOrder = {};
        _this7.importProjectItems = [];
        _this7.importMyProjectId = null;
        _this7.importLibraryProjectId = null;
        _this7.importProjectId = null;
        _this7.importProject = null;

        /*
         * go back to the project view and
         * refresh the project assets in case any of the imported
         * steps also imported assets
         */
        _this7.showProjectHome();
        _this7.ProjectAssetService.retrieveProjectAssets();
        return newNodes;
      });
    }

    /**
     * Turn on copy mode
     */

  }, {
    key: 'copy',
    value: function copy() {
      // make sure there is at least one item selected
      var selectedNodeIds = this.getSelectedNodeIds();
      if (selectedNodeIds != null && selectedNodeIds.length > 0) {
        var selectedItemTypes = this.getSelectedItemTypes();
        if (selectedItemTypes != null && selectedItemTypes.length > 0) {
          if (selectedItemTypes.length === 0) {
            // TODO: i18n
            alert('Please select an item to copy.');
          } else if (selectedItemTypes.length === 1 && selectedItemTypes[0] === 'node') {
            this.insertNodeMode = true;
            this.copyMode = true;
          } else {
            // TODO: i18n
            alert('You cannot copy the item(s) at this time.');
          }
        }
      }
    }

    /**
     * Turn on move mode
     * TODO refactor. too many nesting. Rename function to "turnOnMoveMode"?
     */

  }, {
    key: 'move',
    value: function move() {
      // make sure there is at least one item selected
      var selectedNodeIds = this.getSelectedNodeIds();
      if (selectedNodeIds != null && selectedNodeIds.length > 0) {
        var selectedItemTypes = this.getSelectedItemTypes();
        if (selectedItemTypes != null && selectedItemTypes.length > 0) {
          if (selectedItemTypes.length == 0) {
            // there are no selected items
            alert('Please select an item to move.');
          } else if (selectedItemTypes.length == 1) {
            // all the items the user selected are the same type
            // TODO: i18n
            if (selectedItemTypes[0] === 'group') {
              this.insertGroupMode = true;
              this.moveMode = true;
            } else if (selectedItemTypes[0] === 'node') {
              this.insertNodeMode = true;
              this.moveMode = true;
            }
          } else if (selectedItemTypes.length > 1) {
            /*
             * the items the user selected are different types but
             * we do not allow moving different types of items at
             * the same time
             * TODO: i18n
             */
            alert('If you want to move multiple items at once, ' + 'they must be of the same type. Please select only activities ' + 'or only steps.');
          }
        }
      }
    }

    /**
     * Delete the selected nodes after asking user for confirmation
     * TODO refactor too many nesting
     */

  }, {
    key: 'delete',
    value: function _delete() {
      var selectedNodeIds = this.getSelectedNodeIds();
      if (selectedNodeIds != null && selectedNodeIds.length !== 0) {
        var confirmMessage = '';
        if (selectedNodeIds.length == 1) {
          // TODO: i18n
          confirmMessage = 'Are you sure you want to delete the selected item?';
        } else if (selectedNodeIds.length > 1) {
          // TODO: i18n
          confirmMessage = 'Are you sure you want to delete the ' + selectedNodeIds.length + ' selected items?';
        }
        if (confirm(confirmMessage)) {
          var deletedStartNodeId = false;
          var activityDeleted = false;
          var stepDeleted = false;
          var stepsDeleted = [];
          var activitiesDeleted = [];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = selectedNodeIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var nodeId = _step3.value;

              var node = this.ProjectService.getNodeById(nodeId);
              var tempNode = {};

              if (node != null) {
                tempNode.nodeId = node.id;
                tempNode.title = this.ProjectService.getNodePositionAndTitleByNodeId(node.id);
              }

              if (this.ProjectService.isStartNodeId(nodeId)) {
                deletedStartNodeId = true;
              }

              if (this.ProjectService.isGroupNode(nodeId)) {
                activityDeleted = true;
                var stepsInActivityDeleted = [];
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                  for (var _iterator4 = node.ids[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var stepNodeId = _step4.value;

                    var stepTitle = this.ProjectService.getNodePositionAndTitleByNodeId(stepNodeId);

                    // create an object with the step id and title
                    var stepObject = {
                      'nodeId': stepNodeId,
                      'title': stepTitle
                    };
                    stepsInActivityDeleted.push(stepObject);
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

                tempNode.stepsInActivityDeleted = stepsInActivityDeleted;
                activitiesDeleted.push(tempNode);
              } else {
                stepDeleted = true;
                stepsDeleted.push(tempNode);
              }
              this.ProjectService.deleteNode(nodeId);
            }
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

          if (deletedStartNodeId) {
            this.updateStartNodeId();
          }

          if (activityDeleted) {
            var activitiesDeletedEventData = {
              'activitiesDeleted': activitiesDeleted
            };
            this.saveEvent('activityDeleted', 'Authoring', activitiesDeletedEventData);
          }

          if (stepDeleted) {
            var stepDeletedEventData = {
              'stepsDeleted': stepsDeleted
            };
            this.saveEvent('stepDeleted', 'Authoring', stepDeletedEventData);
          }

          this.ProjectService.saveProject();
          this.refreshProject();
        }
      }
      this.unselectAllItems();
    }

    /**
     * Get the ids of the selected nodes, both active and inactive.
     * @returns an array of node ids that are selected
     */

  }, {
    key: 'getSelectedNodeIds',
    value: function getSelectedNodeIds() {
      var selectedNodeIds = [];
      angular.forEach(this.items, function (value, key) {
        if (value.checked) {
          selectedNodeIds.push(key);
        }
      }, selectedNodeIds);

      if (this.inactiveNodes != null) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.inactiveNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var inactiveNode = _step5.value;

            if (inactiveNode != null && inactiveNode.checked) {
              selectedNodeIds.push(inactiveNode.id);
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
      return selectedNodeIds;
    }

    /**
     * Get the distinct types of the selected items, both active and inactive.
     * @returns an array of item types. possible items are group or node.
     */

  }, {
    key: 'getSelectedItemTypes',
    value: function getSelectedItemTypes() {
      var selectedItemTypes = [];

      angular.forEach(this.items, function (value, key) {
        if (value.checked) {
          var node = this.ProjectService.getNodeById(key);
          if (node != null) {
            var nodeType = node.type;
            if (selectedItemTypes.indexOf(nodeType) == -1) {
              selectedItemTypes.push(nodeType);
            }
          }
        }
      }, this);

      if (this.inactiveNodes != null) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.inactiveNodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var inactiveNode = _step6.value;

            if (inactiveNode != null && inactiveNode.checked) {
              var inactiveNodeType = inactiveNode.type;
              if (selectedItemTypes.indexOf(inactiveNodeType) == -1) {
                selectedItemTypes.push(inactiveNodeType);
              }
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

      return selectedItemTypes;
    }
  }, {
    key: 'unselectAllItems',
    value: function unselectAllItems() {
      angular.forEach(this.items, function (value, key) {
        value.checked = false;
      });
    }

    /**
     * Toggle the create group input
     */

  }, {
    key: 'creatNewActivityClicked',
    value: function creatNewActivityClicked() {
      this.createGroupTitle = '';
      this.toggleView('createGroup');
      if (this.showCreateGroup) {
        this.$timeout(function () {
          $('#createGroupTitle').focus();
        });
      }
    }

    /**
     * Toggle the create node input
     */

  }, {
    key: 'createNewStepClicked',
    value: function createNewStepClicked() {
      this.createNodeTitle = '';
      this.toggleView('createNode');
      if (this.showCreateNode) {
        this.$timeout(function () {
          $('#createNodeTitle').focus();
        });
      }
    }

    /**
     * Cancel the move mode
     */

  }, {
    key: 'cancelMove',
    value: function cancelMove() {
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

  }, {
    key: 'updateStartNodeId',
    value: function updateStartNodeId() {
      var newStartNodeId = null;
      var startGroupId = this.ProjectService.getStartGroupId();
      var node = this.ProjectService.getNodeById(startGroupId);
      var done = false;

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

  }, {
    key: 'checkPotentialStartNodeIdChange',
    value: function checkPotentialStartNodeIdChange() {
      var _this8 = this;

      return this.$q(function (resolve, reject) {
        var firstLeafNodeId = _this8.ProjectService.getFirstLeafNodeId();
        if (firstLeafNodeId == null) {
          // there are no steps in the project
          // set the start node id to empty string
          _this8.ProjectService.setStartNodeId('');
          resolve();
        } else {
          // we have found a leaf node
          var currentStartNodeId = _this8.ProjectService.getStartNodeId();
          if (currentStartNodeId != firstLeafNodeId) {
            /*
             * the node ids are different which means the first leaf node
             * id is different than the current start node id and that
             * the author may want to use the first leaf node id as the
             * new start node id
             */
            var firstLeafNode = _this8.ProjectService.getNodeById(firstLeafNodeId);
            if (firstLeafNode != null) {
              var firstChildTitle = firstLeafNode.title;

              // ask the user if they would like to change the start
              // step to the step that is now the first child in the group
              var confirmUpdateStartStep = _this8.$translate('confirmUpdateStartStep', { startStepTitle: firstChildTitle });
              if (confirm(confirmUpdateStartStep)) {
                _this8.ProjectService.setStartNodeId(firstLeafNodeId);
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

  }, {
    key: 'checkPotentialStartNodeIdChangeThenSaveProject',
    value: function checkPotentialStartNodeIdChangeThenSaveProject() {
      var _this9 = this;

      return this.checkPotentialStartNodeIdChange().then(function () {
        _this9.ProjectService.saveProject();
        _this9.refreshProject();
        _this9.unselectAllItems();
      });
    }

    /**
     * Recalculates step numbering
     */

  }, {
    key: 'refreshProject',
    value: function refreshProject() {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }

    /**
     * The project title changed so we will update the project title in the
     * project service and save the project
     */

  }, {
    key: 'projectTitleChanged',
    value: function projectTitleChanged() {
      this.ProjectService.setProjectTitle(this.projectTitle);
      this.ProjectService.saveProject();
    }

    /**
     * Toggle the import view and populate the project drop downs if necessary
     */

  }, {
    key: 'importStepClicked',
    value: function importStepClicked() {
      var _this10 = this;

      this.toggleView('importStep');

      if (this.importMode) {
        if (this.myProjectsList == null) {
          this.myProjectsList = this.ConfigService.getAuthorableProjects();
        }

        if (this.libraryProjectsList == null) {
          this.ConfigService.getLibraryProjects().then(function (libraryProjectsList) {
            _this10.libraryProjectsList = libraryProjectsList;
          });
        }
      }
    }

    /**
     * The author has chosen an authorable project to import from
     * @param importProjectId the project id to import from
     */

  }, {
    key: 'showMyImportProject',
    value: function showMyImportProject(importProjectId) {
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
      var _this11 = this;

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
        this.ProjectService.retrieveProjectById(this.importProjectId).then(function (projectJSON) {
          _this11.importProject = projectJSON;
          var nodeOrderOfProject = _this11.ProjectService.getNodeOrderOfProject(_this11.importProject);
          _this11.importProjectIdToOrder = nodeOrderOfProject.idToOrder;
          _this11.importProjectItems = nodeOrderOfProject.nodes;
        });
      }
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
     * Preview the import step in a new tab
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
     * Import the selected steps
     */

  }, {
    key: 'importSteps',
    value: function importSteps() {
      var selectedNodes = this.getSelectedNodesToImport();
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

  }, {
    key: 'getSelectedNodesToImport',
    value: function getSelectedNodesToImport() {
      var selectedNodes = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.importProjectItems[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var item = _step7.value;

          if (item.checked) {
            selectedNodes.push(item.node);
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

      return selectedNodes;
    }

    /**
     * Show the view to edit the project rubric
     */

  }, {
    key: 'editProjectRubricClicked',
    value: function editProjectRubricClicked() {
      this.toggleView('rubric');
    }

    /**
     * Show the advanced authoring view
     */

  }, {
    key: 'advancedClicked',
    value: function advancedClicked() {
      this.toggleView('advanced');
    }

    /**
     * The show JSON button was clicked
     */

  }, {
    key: 'showJSONClicked',
    value: function showJSONClicked() {
      this.showJSONAuthoring = !this.showJSONAuthoring;
      if (this.showJSONAuthoring) {
        this.projectJSONString = angular.toJson(this.ProjectService.project, 4);
      }
    }

    /**
     * Save the project JSON string to the server
     */

  }, {
    key: 'saveProjectJSONString',
    value: function saveProjectJSONString() {
      var project = angular.fromJson(this.projectJSONString);
      this.ProjectService.setProject(project);
      var scriptFilename = this.ProjectService.getProjectScriptFilename();
      if (scriptFilename != null) {
        this.projectScriptFilename = scriptFilename;
      }
      this.checkPotentialStartNodeIdChangeThenSaveProject();
    }

    /**
     * The author has changed the rubric, so save the changes
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {
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

      this.ProjectService.setProjectRubric(html);
      this.ProjectService.saveProject();
    }

    /**
     * Check if the specified node is in any branch path
     * @param nodeId the node id of the node
     * @return whether the node is in any branch path
     */

  }, {
    key: 'isNodeInAnyBranchPath',
    value: function isNodeInAnyBranchPath(nodeId) {
      return this.ProjectService.isNodeInAnyBranchPath(nodeId);
    }

    /**
     * The project script file name changed
     */

  }, {
    key: 'projectScriptFilenameChanged',
    value: function projectScriptFilenameChanged() {
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

  }, {
    key: 'chooseProjectScriptFilename',
    value: function chooseProjectScriptFilename() {
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

  }, {
    key: 'toggleView',
    value: function toggleView(view) {
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

  }, {
    key: 'backButtonClicked',
    value: function backButtonClicked() {
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

  }, {
    key: 'projectHomeClicked',
    value: function projectHomeClicked() {
      // show the regular project view
      this.showProjectHome();
    }

    /**
     * Show the regular project view
     */

  }, {
    key: 'showProjectHome',
    value: function showProjectHome() {
      // we are going to the project view so we will set the current node to null
      this.TeacherDataService.setCurrentNode(null);

      // show the regular project view
      this.toggleView('project');
      this.scrollToTopOfPage();
    }
  }, {
    key: 'scrollToTopOfPage',
    value: function scrollToTopOfPage() {
      this.$anchorScroll('top');
    }

    /**
     * Creating a group was cancelled, so show the project regular project view
     */

  }, {
    key: 'cancelCreateGroupClicked',
    value: function cancelCreateGroupClicked() {
      this.toggleView('project');
    }

    /**
     * Creating a node was cancelled, so show the project view
     */

  }, {
    key: 'cancelCreateNodeClicked',
    value: function cancelCreateNodeClicked() {
      this.toggleView('project');
    }

    /**
     * Temporarily highlight the new nodes to draw attention to them
     * @param newNodes the new nodes to highlight
     * @param doScrollToNewNodes if true, scroll to the first new node added
     * TODO: can we remove the null checks: ensure that newNodes is never null?
     */

  }, {
    key: 'temporarilyHighlightNewNodes',
    value: function temporarilyHighlightNewNodes(newNodes) {
      var _this12 = this;

      var doScrollToNewNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.$timeout(function () {
        if (newNodes != null && newNodes.length > 0) {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = newNodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var newNode = _step8.value;

              if (newNode != null) {
                (function () {
                  var nodeElement = $('#' + newNode.id);
                  var originalBackgroundColor = nodeElement.css('backgroundColor');
                  nodeElement.css('background-color', '#FFFF9C');

                  /*
                   * Use a timeout before starting to transition back to
                   * the original background color. For some reason the
                   * element won't get highlighted in the first place
                   * unless this timeout is used.
                   */
                  _this12.$timeout(function () {
                    nodeElement.css({
                      'transition': 'background-color 3s ease-in-out',
                      'background-color': originalBackgroundColor
                    });
                  });
                })();
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

          if (doScrollToNewNodes) {
            var firstNodeElementAdded = $('#' + newNodes[0].id);
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

  }, {
    key: 'saveEvent',
    value: function saveEvent(eventName, category, data) {
      var context = 'AuthoringTool';
      var nodeId = null;
      var componentId = null;
      var componentType = null;

      if (data == null) {
        data = {};
      }
      this.TeacherDataService.saveEvent(context, nodeId, componentId, componentType, category, eventName, data);
    }

    /**
     * Get the selected node titles that we are importing
     * @return an array of node titles that may include the step numbers
     */

  }, {
    key: 'getSelectedNodeTitlesToImport',
    value: function getSelectedNodeTitlesToImport() {
      var selectedNodeTitles = [];
      var selectedNodes = this.getSelectedNodesToImport();
      for (var n = 0; n < selectedNodes.length; n++) {
        var selectedNode = selectedNodes[n];
        if (selectedNode != null) {
          // get the step number and title from the import project
          var tempNode = this.importProjectIdToOrder[selectedNode.id];
          var stepNumber = tempNode.stepNumber;
          var title = '';

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

  }, {
    key: 'getStepBackgroundColor',
    value: function getStepBackgroundColor(nodeId) {
      var color = null;
      var branchPathLetter = this.ProjectService.getBranchPathLetter(nodeId);
      if (branchPathLetter != null) {
        // the node is in a branch path

        // get the ascii code for the letter. example A=65, B=66, C=67, etc.
        var letterASCIICode = branchPathLetter.charCodeAt(0);

        // get the branch path number A=0, B=1, C=2, etc.
        var branchPathNumber = letterASCIICode - 65;

        // get the color for the branch path number
        color = this.stepBackgroundColors[branchPathNumber];
      }
      return color;
    }

    /**
     * Copy the project URL to the clipboard
     */

  }, {
    key: 'copyProjectURL',
    value: function copyProjectURL() {
      var textArea = document.createElement('textarea');
      textArea.value = this.projectURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    /**
     * Open the project.json file in a new tab
     */

  }, {
    key: 'openProjectURLInNewTab',
    value: function openProjectURLInNewTab() {
      window.open(this.projectURL, '_blank');
    }
  }]);

  return ProjectController;
}();

ProjectController.$inject = ['$anchorScroll', '$filter', '$interval', '$mdDialog', '$q', '$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'AuthorWebSocketService', 'ConfigService', 'ProjectAssetService', 'ProjectService', 'TeacherDataService', 'UtilService'];

exports.default = ProjectController;
//# sourceMappingURL=projectController.js.map
