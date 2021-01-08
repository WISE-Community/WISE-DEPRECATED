'use strict';

import { TeacherProjectService } from '../../services/teacherProjectService';
import { ConfigService } from '../../services/configService';
import { TeacherDataService } from '../../services/teacherDataService';
import { UtilService } from '../../services/utilService';
import * as angular from 'angular';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';

class ProjectController {
  $translate: any;
  createGroupTitle: string;
  projectId: number;
  runId: number;
  items: any;
  nodeIds: [];
  nodeId: string;
  projectTitle: string;
  showCreateGroup: boolean = false;
  showCreateNode: boolean = false;

  inactiveGroupNodes: any[];
  inactiveStepNodes: any[];
  inactiveNodes: any[];
  insertGroupMode: boolean;
  insertNodeMode: boolean;
  idToNode: any;
  copyMode: boolean;
  createNodeTitle: string;
  createMode: boolean;
  nodeToAdd: any;
  projectScriptFilename: string;
  currentAuthorsMessage: string = '';
  stepNodeSelected: boolean = false;
  activityNodeSelected: boolean = false;
  metadata: any;
  moveMode: boolean;
  projectURL: string;
  refreshProjectSubscription: Subscription;
  scrollToBottomOfPageSubscription: Subscription;

  /*
   * The colors for the branch path steps. The colors are from
   * http://colorbrewer2.org/
   * http://colorbrewer2.org/export/colorbrewer.js
   * The colors chosen are from the 'qualitative', 'Set2'.
   */
  stepBackgroundColors: string[] = [
    '#66c2a5',
    '#fc8d62',
    '#8da0cb',
    '#e78ac3',
    '#a6d854',
    '#ffd92f',
    '#e5c494',
    '#b3b3b3'
  ];

  static $inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    '$state',
    '$stomp',
    '$timeout',
    '$transitions',
    '$window',
    'ConfigService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    private $mdDialog,
    private $scope,
    private $state,
    private $stomp,
    private $timeout,
    private $transitions,
    private $window,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$translate = $filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.UtilService = UtilService;
    this.projectId = this.ConfigService.getProjectId();
    this.runId = this.ConfigService.getRunId();
    this.items = this.ProjectService.idToOrder;
    this.nodeIds = this.ProjectService.getFlattenedProjectAsNodeIds();
    this.inactiveGroupNodes = this.ProjectService.getInactiveGroupNodes();
    this.inactiveStepNodes = this.ProjectService.getInactiveStepNodes();
    this.inactiveNodes = this.ProjectService.getInactiveNodes();
    this.idToNode = this.ProjectService.getIdToNode();
    this.projectScriptFilename = this.ProjectService.getProjectScriptFilename();
    this.stepNodeSelected = false;
    this.activityNodeSelected = false;
    this.TeacherDataService.setCurrentNode(null);
    this.metadata = this.ProjectService.getProjectMetadata();
    this.subscribeToCurrentAuthors(this.projectId).then(() => {
      this.ProjectService.notifyAuthorProjectBegin(this.projectId);
    });
    this.projectURL = window.location.origin + this.ConfigService.getConfigParam('projectURL');
    this.$transitions.onSuccess({}, ($transition) => {
      const stateName = $transition.$to().name;
      if (stateName === 'root.at.project') {
        this.saveEvent('projectHomeViewOpened', 'Navigation');
      } else if (stateName === 'root.at.project.asset') {
        this.saveEvent('assetsViewOpened', 'Navigation');
      } else if (stateName === 'root.at.project.info') {
        this.saveEvent('projectInfoViewOpened', 'Navigation');
      } else if (stateName === 'root.at.project.notebook') {
        this.saveEvent('notebookViewOpened', 'Navigation');
      }
    });

    this.refreshProjectSubscription = this.ProjectService.refreshProject$.subscribe(() => {
      this.refreshProject();
    });

    this.scrollToBottomOfPageSubscription = this.ProjectService.scrollToBottomOfPage$.subscribe(
      () => {
        this.scrollToBottomOfPage();
      }
    );

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

  $onDestroy() {
    this.refreshProjectSubscription.unsubscribe();
    this.scrollToBottomOfPageSubscription.unsubscribe();
  }

  endProjectAuthoringSession() {
    this.unSubscribeFromCurrentAuthors(this.projectId).then(() => {
      this.ProjectService.notifyAuthorProjectEnd(this.projectId);
    });
  }

  previewProject(enableConstraints: boolean = true) {
    const previewProjectEventData = { constraints: enableConstraints };
    this.saveEvent('projectPreviewed', 'Navigation', previewProjectEventData);
    window.open(
      `${this.ConfigService.getConfigParam('previewProjectURL')}?constraints=${enableConstraints}`
    );
  }

  previewProjectWithoutConstraints() {
    this.previewProject(false);
  }

  viewProjectAssets() {
    this.$state.go('root.at.project.asset', { projectId: this.projectId });
  }

  viewNotebookSettings() {
    this.$state.go('root.at.project.notebook', { projectId: this.projectId });
  }

  showOtherConcurrentAuthors(authors) {
    const myUsername = this.ConfigService.getMyUsername();
    authors.splice(authors.indexOf(myUsername), 1);
    if (authors.length > 0) {
      this.currentAuthorsMessage = this.$translate('concurrentAuthorsWarning', {
        currentAuthors: authors.join(', ')
      });
    } else {
      this.currentAuthorsMessage = '';
    }
  }

  saveProject() {
    try {
      // if projectJSONString is bad json,
      // an exception will be thrown and it will not save.
      this.ProjectService.saveProject();
    } catch (error) {
      // TODO: i18n
      alert('Invalid JSON. Please check syntax. Aborting save.');
      return;
    }
  }

  closeProject() {
    this.$state.go('root.at.main');
  }

  getNodePositionById(nodeId) {
    return this.ProjectService.getNodePositionById(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }

  getNodeTitleByNodeId(nodeId) {
    return this.ProjectService.getNodeTitleByNodeId(nodeId);
  }

  isGroupNode(nodeId) {
    return this.ProjectService.isGroupNode(nodeId);
  }

  nodeClicked(nodeId) {
    this.unselectAllItems();
    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    this.$state.go('root.at.project.node', { projectId: this.projectId, nodeId: nodeId });
  }

  constraintIconClicked(nodeId) {
    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
    this.$state.go('root.at.project.node.advanced.constraint', {
      projectId: this.projectId,
      nodeId: nodeId
    });
  }

  branchIconClicked(nodeId) {
    this.TeacherDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
    this.$state.go('root.at.project.node.advanced.path', {
      projectId: this.projectId,
      nodeId: nodeId
    });
  }

  createGroup() {
    this.nodeToAdd = this.ProjectService.createGroup(this.createGroupTitle);
    this.showCreateGroup = false;
    this.createGroupTitle = '';
    this.insertGroupMode = true;
    this.createMode = true;
  }

  createNode() {
    this.nodeToAdd = this.ProjectService.createNode(this.createNodeTitle);
    this.showCreateNode = false;
    this.createNodeTitle = '';
    this.insertNodeMode = true;
    this.createMode = true;
  }

  insertInside(nodeId) {
    // TODO check that we are inserting into a group
    if (this.createMode) {
      this.handleCreateModeInsert(nodeId, 'inside');
    } else if (this.moveMode) {
      this.handleMoveModeInsert(nodeId, 'inside');
    } else if (this.copyMode) {
      this.handleCopyModeInsert(nodeId, 'inside');
    }
  }

  insertAfter(nodeId) {
    if (this.createMode) {
      this.handleCreateModeInsert(nodeId, 'after');
    } else if (this.moveMode) {
      this.handleMoveModeInsert(nodeId, 'after');
    } else if (this.copyMode) {
      this.handleCopyModeInsert(nodeId, 'after');
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
    this.nodeToAdd = null;
    this.createMode = false;
    this.insertGroupMode = false;
    this.insertNodeMode = false;
    this.temporarilyHighlightNewNodes(newNodes);

    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.refreshProject();
      if (newNode != null) {
        let nodeCreatedEventData = {
          nodeId: newNode.id,
          title: this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id)
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
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
      } else if (selectedNodeIds.length > 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
      }
    } else {
      let movedNodes = [];
      for (let selectedNodeId of selectedNodeIds) {
        let node = {
          nodeId: selectedNodeId,
          fromTitle: this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
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
      this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
        this.refreshProject();
        if (newNodes != null && newNodes.length > 0) {
          let firstNewNode = newNodes[0];
          if (firstNewNode != null && firstNewNode.id != null) {
            for (let n = 0; n < movedNodes.length; n++) {
              let node = movedNodes[n];
              let newNode = newNodes[n];
              if (node != null && newNode != null) {
                node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
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
        fromNodeId: selectedNodeId,
        fromTitle: this.ProjectService.getNodePositionAndTitleByNodeId(selectedNodeId)
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
    this.ProjectService.checkPotentialStartNodeIdChangeThenSaveProject().then(() => {
      this.refreshProject();
      if (newNodes != null && newNodes.length > 0) {
        let firstNewNode = newNodes[0];
        if (firstNewNode != null && firstNewNode.id != null) {
          for (let n = 0; n < copiedNodes.length; n++) {
            let node = copiedNodes[n];
            let newNode = newNodes[n];
            if (node != null && newNode != null) {
              node.toNodeId = newNode.id;
              node.toTitle = this.ProjectService.getNodePositionAndTitleByNodeId(newNode.id);
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

  deleteSelectedNodes() {
    const selectedNodeIds = this.getSelectedNodeIds();
    let confirmMessage = '';
    if (selectedNodeIds.length === 1) {
      confirmMessage = this.$translate('areYouSureYouWantToDeleteTheSelectedItem');
    } else {
      confirmMessage = this.$translate('areYouSureYouWantToDeleteTheXSelectedItems', {
        numItems: selectedNodeIds.length
      });
    }
    if (confirm(confirmMessage)) {
      this.deleteNodesById(selectedNodeIds);
    }
  }

  deleteNodesById(nodeIds) {
    let deletedStartNodeId = false;
    const stepsDeleted = [];
    const activitiesDeleted = [];
    for (const nodeId of nodeIds) {
      const node = this.ProjectService.getNodeById(nodeId);
      const tempNode = {
        nodeId: node.id,
        title: this.ProjectService.getNodePositionAndTitleByNodeId(node.id),
        stepsInActivityDeleted: []
      };
      if (this.ProjectService.isStartNodeId(nodeId)) {
        deletedStartNodeId = true;
      }
      if (this.ProjectService.isGroupNode(nodeId)) {
        const stepsInActivityDeleted = [];
        for (const stepNodeId of node.ids) {
          const stepObject = {
            nodeId: stepNodeId,
            title: this.ProjectService.getNodePositionAndTitleByNodeId(stepNodeId)
          };
          stepsInActivityDeleted.push(stepObject);
        }
        tempNode.stepsInActivityDeleted = stepsInActivityDeleted;
        activitiesDeleted.push(tempNode);
      } else {
        stepsDeleted.push(tempNode);
      }
      this.ProjectService.deleteNode(nodeId);
    }
    if (deletedStartNodeId) {
      this.updateStartNodeId();
    }
    if (activitiesDeleted.length > 0) {
      this.saveEvent('activityDeleted', 'Authoring', { activitiesDeleted: activitiesDeleted });
    }
    if (stepsDeleted.length > 0) {
      this.saveEvent('stepDeleted', 'Authoring', { stepsDeleted: stepsDeleted });
    }
    this.ProjectService.saveProject();
    this.refreshProject();
  }

  getSelectedNodeIds() {
    const selectedNodeIds = [];
    angular.forEach(
      this.items,
      function (value, key) {
        if (value.checked) {
          selectedNodeIds.push(key);
        }
      },
      selectedNodeIds
    );

    if (this.inactiveNodes != null) {
      for (const inactiveNode of this.inactiveNodes) {
        if (inactiveNode.checked) {
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
    const selectedItemTypes = [];
    angular.forEach(
      this.items,
      function (value, key) {
        if (value.checked) {
          let node = this.ProjectService.getNodeById(key);
          if (node != null) {
            let nodeType = node.type;
            if (selectedItemTypes.indexOf(nodeType) == -1) {
              selectedItemTypes.push(nodeType);
            }
          }
        }
      },
      this
    );

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
    angular.forEach(this.items, function (value, key) {
      value.checked = false;
    });
    angular.forEach(this.inactiveGroupNodes, function (value, key) {
      value.checked = false;
    });
    angular.forEach(this.inactiveStepNodes, function (value, key) {
      value.checked = false;
    });
    this.stepNodeSelected = false;
    this.activityNodeSelected = false;
  }

  creatNewActivityClicked() {
    this.createGroupTitle = '';
    this.toggleView('createGroup');
    if (this.showCreateGroup) {
      this.$timeout(() => {
        $('#createGroupTitle').focus();
      });
    }
  }

  createNewStepClicked() {
    this.createNodeTitle = '';
    this.toggleView('createNode');
    if (this.showCreateNode) {
      this.$timeout(() => {
        $('#createNodeTitle').focus();
      });
    }
  }

  addStructure() {
    this.$state.go('root.at.project.structure.choose');
  }

  cancelMove() {
    this.insertGroupMode = false;
    this.insertNodeMode = false;
    this.nodeToAdd = null;
    this.createMode = false;
    this.moveMode = false;
    this.copyMode = false;
    this.unselectAllItems();
  }

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

  importStep() {
    this.$state.go('root.at.project.import-step.choose-step', { projectId: this.projectId });
  }

  editProjectRubric() {
    this.$state.go('root.at.project.rubric', {
      projectId: this.projectId
    });
  }

  goToAdvancedAuthoring() {
    this.$state.go('root.at.project.advanced', {
      projectId: this.projectId
    });
  }

  isNodeInAnyBranchPath(nodeId) {
    return this.ProjectService.isNodeInAnyBranchPath(nodeId);
  }

  showProjectView() {
    this.clearNodeAndGroupTitle();
    this.showCreateGroup = false;
    this.showCreateNode = false;
  }

  toggleView(view) {
    this.clearNodeAndGroupTitle();
    if (view === 'createGroup') {
      this.showCreateGroup = !this.showCreateGroup;
      this.showCreateNode = false;
    } else if (view === 'createNode') {
      this.showCreateGroup = false;
      this.showCreateNode = !this.showCreateNode;
    }
  }

  clearNodeAndGroupTitle() {
    this.createGroupTitle = '';
    this.createNodeTitle = '';
  }

  goBackToProjectList() {
    this.$state.go('root.at.main');
  }

  scrollToBottomOfPage() {
    $('#content').animate(
      {
        scrollTop: $('#bottom').prop('offsetTop')
      },
      1000
    );
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
            $('#content').animate(
              {
                scrollTop: firstNodeElementAdded.prop('offsetTop') - 60
              },
              1000
            );
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
  saveEvent(eventName, category, data = null) {
    let context = 'AuthoringTool';
    let nodeId = null;
    let componentId = null;
    let componentType = null;
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
   * Get the background color for a step
   * @param nodeId get the background color for a step in the project view
   * @return If the node is in a branch path it will return a color. If the
   * node is not in a branch path it will return null.
   */
  getStepBackgroundColor(nodeId) {
    let color = null;
    let branchPathLetter = this.ProjectService.getBranchPathLetter(nodeId);
    if (branchPathLetter != null) {
      // get the ascii code for the letter. example A=65, B=66, C=67, etc.
      let letterASCIICode = branchPathLetter.charCodeAt(0);

      // get the branch path number A=0, B=1, C=2, etc.
      let branchPathNumber = letterASCIICode - 65;

      // get the color for the branch path number
      color = this.stepBackgroundColors[branchPathNumber];
    }
    return color;
  }

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
        if (
          inactiveNode.type == 'node' &&
          this.ProjectService.getParentGroup(inactiveNode.id) == null
        ) {
          count++;
        }
      }
    }
    return count;
  }

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

  isBranchPoint(nodeId) {
    return this.ProjectService.isBranchPoint(nodeId);
  }

  getNumberOfBranchPaths(nodeId) {
    return this.ProjectService.getNumberOfBranchPaths(nodeId);
  }

  getBranchCriteriaDescription(nodeId) {
    return this.ProjectService.getBranchCriteriaDescription(nodeId);
  }

  nodeHasConstraint(nodeId) {
    return this.ProjectService.nodeHasConstraint(nodeId);
  }

  getNumberOfConstraintsOnNode(nodeId) {
    const constraints = this.ProjectService.getConstraintsOnNode(nodeId);
    return constraints.length;
  }

  getConstraintDescriptions(nodeId) {
    let constraintDescriptions = '';
    const constraints = this.ProjectService.getConstraintsOnNode(nodeId);
    for (let c = 0; c < constraints.length; c++) {
      let constraint = constraints[c];
      let description = this.ProjectService.getConstraintDescription(constraint);
      constraintDescriptions += c + 1 + ' - ' + description + '\n';
    }
    return constraintDescriptions;
  }

  nodeHasRubric(nodeId) {
    return this.ProjectService.nodeHasRubric(nodeId);
  }

  hasSelectedNodes() {
    return this.getSelectedNodeIds().length > 0;
  }

  subscribeToCurrentAuthors(projectId) {
    return this.$stomp.connect(this.ConfigService.getWebSocketURL()).then((frame) => {
      this.$stomp.subscribe(
        `/topic/current-authors/${projectId}`,
        (authors, headers, res) => {
          this.showOtherConcurrentAuthors(authors);
        },
        {}
      );
    });
  }

  unSubscribeFromCurrentAuthors(projectId) {
    return this.$stomp.disconnect();
  }
}

export default ProjectController;
