'use strict';
import ProjectService from '../services/projectService';

class AuthoringToolProjectService extends ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }


  /**
   * Notifies others that the specified project is being authored
   * @param projectId id of the project
   */
  notifyAuthorProjectBegin(projectId = null) {
    if (projectId == null) {
      if (this.project != null) {
        projectId = this.project.id;
      } else {
        return;
      }
    }
    let notifyProjectBeginURL = this.ConfigService
      .getConfigParam('notifyProjectBeginURL') + projectId;
    let httpParams = {
      method: "POST",
      url: notifyProjectBeginURL
    };

    return this.$http(httpParams).then((result) => {
      let otherAuthors = result.data;
      return otherAuthors;
    });
  }

  /**
   * Notifies others that the specified project is being authored
   * @param projectId id of the project
   */
  notifyAuthorProjectEnd(projectId = null) {
    return this.$q((resolve, reject) => {
      if (projectId == null) {
        if (this.project != null) {
          projectId = this.ConfigService.getProjectId();
        } else {
          resolve();
        }
      }
      let notifyProjectEndURL = this.ConfigService.getConfigParam('notifyProjectEndURL') + projectId;
      let httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = notifyProjectEndURL;

      this.$http(httpParams).then(() => {
        resolve();
      })
    });
  }

  /**
   * Returns all possible transition criteria for the specified node and component.
   */
  getPossibleTransitionCriteria(nodeId, componentId) {
    let component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      let componentType = component.type;
      let componentService = this.$injector.get(componentType + 'Service');
      if (componentService.getPossibleTransitionCriteria) {
        return componentService.getPossibleTransitionCriteria(nodeId, componentId, component);
      } else {
        return [];
      }
    } else {
      return [];
    }
  };

  /**
   * Copies the project with the specified id and returns a new project id if the project is
   * successfully copied
   */
  copyProject(projectId) {
    const copyProjectURL = this.ConfigService.getConfigParam('copyProjectURL');
    if (copyProjectURL == null) {
      return null;
    }

    const httpParams = {};
    httpParams.method = 'POST';
    httpParams.url = copyProjectURL + "/" + projectId;
    httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

    const params = {};
    httpParams.data = $.param(params);

    return this.$http(httpParams).then((result) => {
      const projectId = result.data;
      return projectId;
    });
  };

  /**
   * Registers a new project having the projectJSON content with the server.
   * Returns a new project Id if the project is successfully registered.
   * Returns null if Config.registerNewProjectURL is undefined.
   * Throws an error if projectJSONString is invalid JSON string
   */
  registerNewProject(projectJSONString, commitMessage) {
    const registerNewProjectURL = this.ConfigService.getConfigParam('registerNewProjectURL');
    if (registerNewProjectURL == null) {
      return null;
    }

    try {
      // Try parsing the JSON string and throw an error if there's an issue parsing it.
      JSON.parse(projectJSONString);
    } catch (e) {
      throw new Error("Invalid projectJSONString.");
    }

    if (!commitMessage) {
      commitMessage = "";
    }

    const httpParams = {};
    httpParams.method = 'POST';
    httpParams.url = registerNewProjectURL;
    httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

    const params = {};
    params.commitMessage = commitMessage;
    params.projectJSONString = projectJSONString;
    httpParams.data = $.param(params);

    return this.$http(httpParams).then((result) => {
      const projectId = result.data;
      return projectId;
    });
  };

  /**
   * Retrieves and returns the project's commit history.
   */
  getCommitHistory() {
    const commitProjectURL = this.ConfigService.getConfigParam('commitProjectURL');
    return this.$http({
      url: commitProjectURL,
      method: 'GET'
    }).then((result) => {
      return result.data;
    });
  };

  /**
   * Replace a component
   * @param nodeId the node id
   * @param componentId the component id
   * @param component the new component
   */
  replaceComponent(nodeId, componentId, component) {
    if (nodeId != null && componentId != null && component != null) {
      const components = this.getComponentsByNodeId(nodeId);
      if (components != null) {
        for (let c = 0; c < components.length; c++) {
          const tempComponent = components[c];
          if (tempComponent != null) {
            if (tempComponent.id === componentId) {
              components[c] = component;
              break;
            }
          }
        }
      }
    }
  };

  /**
   * Create a new group
   * @param title the title of the group
   * @returns the group object
   */
  createGroup(title) {
    const newGroupId = this.getNextAvailableGroupId();
    const newGroup = {};
    newGroup.id = newGroupId;
    newGroup.type = 'group';
    newGroup.title = title;
    newGroup.startId = '';
    newGroup.ids = [];
    return newGroup;
  };

  /**
   * Create a new node
   * @param title the title of the node
   * @returns the node object
   */
  createNode(title) {
    const newNodeId = this.getNextAvailableNodeId();
    const newNode = {};
    newNode.id = newNodeId;
    newNode.title = title;
    newNode.type = 'node';
    newNode.constraints = [];
    newNode.transitionLogic = {};
    newNode.transitionLogic.transitions = [];
    newNode.showSaveButton = false;
    newNode.showSubmitButton = false;
    newNode.components = [];
    return newNode;
  };

  /**
   * Copy nodes and put them after a certain node id
   * @param nodeIds the node ids to copy
   * @param nodeId the node id we will put the copied nodes after
   */
  copyNodesInside(nodeIds, nodeId) {
    const newNodes = [];
    for (let n = 0; n < nodeIds.length; n++) {
      const nodeIdToCopy = nodeIds[n];
      const newNode = this.copyNode(nodeIdToCopy);
      const newNodeId = newNode.id;

      if (n == 0) {
        // this is the first node we are copying so we will insert it
        // into the beginning of the group
        this.createNodeInside(newNode, nodeId);
      } else {
        // this is not the first node we are copying so we will insert
        // it after the node we previously inserted
        this.createNodeAfter(newNode, nodeId);
      }

      // remember the node id so we can put the next node (if any) after this one
      nodeId = newNodeId;
      this.parseProject();  // refresh project and update references because a new node have been added.

      newNodes.push(newNode);
    }
    return newNodes;
  }

  /**
   * Copy the nodes into the project
   * @param selectedNodes the nodes to import
   * @param fromProjectId copy the nodes from this project
   * @param toProjectId copy the nodes into this project
   * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
   * new step the first step in the group. If this is a step, we will place
   * the new step after it.
   */
  copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter) {
    const importStepsURL = this.ConfigService.getConfigParam('importStepsURL');

    const httpParams = {};
    httpParams.method = 'POST';
    httpParams.url = importStepsURL;
    httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

    const params = {};
    params.steps = angular.toJson(selectedNodes);
    params.fromProjectId = fromProjectId;
    params.toProjectId = toProjectId;
    httpParams.data = $.param(params);

    /*
     * Make the request to import the steps. This will copy the asset files
     * and change file names if necessary. If an asset file with the same
     * name exists in both projects we will check if their content is the
     * same. If the content is the same we don't need to copy the file. If
     * the content is different, we need to make a copy of the file with a
     * new name and change all the references in the steps to use the new
     * name.
     */
    return this.$http(httpParams).then((result) => {
      selectedNodes = result.data;

      const inactiveNodes = this.getInactiveNodes();
      const newNodes = [];
      const newNodeIds = [];

      for (let selectedNode of selectedNodes) {
        if (selectedNode != null) {
          // make a copy of the node so that we don't modify the source
          const tempNode = this.UtilService.makeCopyOfJSONObject(selectedNode);

          // check if the node id is already being used in the current project
          if (this.isNodeIdUsed(tempNode.id)) {
            // the node id is already being used in the current project

            // get the next available node id
            const nextAvailableNodeId = this.getNextAvailableNodeId(newNodeIds);

            // change the node id of the node we are importing
            tempNode.id = nextAvailableNodeId;
          }

          // get the components in the node
          const tempComponents = tempNode.components;

          if (tempComponents != null) {
            for (let tempComponent of tempComponents) {
              if (tempComponent != null) {
                if (this.isComponentIdUsed(tempComponent.id)) {
                  // we are already using the component id so we will need to change it

                  const newComponentId = this.getUnusedComponentId();
                  tempComponent.id = newComponentId;
                }
              }
            }
          }

          // clear the constraints
          tempNode.constraints = [];

          // add the new node and new node id to our arrays
          newNodes.push(tempNode);
          newNodeIds.push(tempNode.id);
        }
      }

      if (nodeIdToInsertInsideOrAfter == null) {
        /*
         * the place to put the new node has not been specified so we
         * will place it in the inactive steps section
         */

        /*
         * Insert the node after the last inactive node. If there
         * are no inactive nodes it will just be placed in the
         * inactive nodes section. In the latter case we do this by
         * setting nodeIdToInsertInsideOrAfter to 'inactiveSteps'.
         */
        if (inactiveNodes != null && inactiveNodes.length > 0) {
          nodeIdToInsertInsideOrAfter = inactiveNodes[inactiveNodes.length - 1];
        } else {
          nodeIdToInsertInsideOrAfter = 'inactiveSteps';
        }
      }

      for (let newNode of newNodes) {
        if (this.isGroupNode(nodeIdToInsertInsideOrAfter)) {
          // we want to make the new step the first step in the given activity
          this.createNodeInside(newNode, nodeIdToInsertInsideOrAfter);
        } else {
          // we want to place the new step after the given step
          this.createNodeAfter(newNode, nodeIdToInsertInsideOrAfter);
        }

        /*
         * Update the nodeIdToInsertInsideOrAfter so that when we are
         * importing multiple steps, the steps get placed in the correct
         * order.
         *
         * Example
         * We are importing nodeA and nodeB and want to place them after
         * nodeX. Therefore we want the order to be
         *
         * nodeX
         * nodeA
         * nodeB
         *
         * This means after we add nodeA, we must update
         * nodeIdToInsertInsideOrAfter to be nodeA so that when we add
         * nodeB, it will be placed after nodeA.
         */
        nodeIdToInsertInsideOrAfter = newNode.id;
      }
      return newNodes;
    });
  }

  /**
   * Create a node inside the group
   * @param node the new node
   * @param nodeId the node id of the group to create the node in
   */
  createNodeInside(node, nodeId) {
    if (nodeId == 'inactiveNodes') {
      this.addInactiveNode(node);
      this.setIdToNode(node.id, node);
      this.setIdToElement(node.id, node);
    } else if (nodeId == 'inactiveGroups') {
      this.addInactiveNode(node);
      this.setIdToNode(node.id, node);
      this.setIdToElement(node.id, node);
    } else {
      this.setIdToNode(node.id, node);
      if (this.isInactive(nodeId)) {
        // we are creating an inactive node
        this.addInactiveNodeInsertInside(node, nodeId);
      } else {
        // we are creating an active node
        this.addNode(node);
        this.insertNodeInsideInTransitions(node.id, nodeId);
        this.insertNodeInsideInGroups(node.id, nodeId);
      }
    }
  }

  /**
   * Create a node after the given node id
   * @param node the new node
   * @param nodeId the node to add after
   */
  createNodeAfter(node, nodeId) {
    if (this.isInactive(nodeId)) {
      // we are adding the node after a node that is inactive

      this.addInactiveNode(node, nodeId);
      this.setIdToNode(node.id, node);
      this.setIdToElement(node.id, node);
    } else {
      // we are adding the node after a node that is active

      this.addNode(node);
      this.setIdToNode(node.id, node);
      this.insertNodeAfterInGroups(node.id, nodeId);
      this.insertNodeAfterInTransitions(node, nodeId);
    }

    if (this.isGroupNode(node.id)) {
      /*
       * we are creating a group node so we will update/create the
       * transitions that traverse from the previous group to this group
       */
      // TODO geoffreykwan oldToGroupIds is declared here and below. Refactor
      var oldToGroupIds = [];

      const transitionsFromGroup = this.getTransitionsByFromNodeId(nodeId);
      if (transitionsFromGroup != null) {
        /*
         * loop through all the transitions that come out of the previous group
         * and get the node ids that the group transitions to
         */
        for (let transitionFromGroup of transitionsFromGroup) {
          if (transitionFromGroup != null) {
            const toNodeId = transitionFromGroup.to;
            if (toNodeId != null) {
              oldToGroupIds.push(toNodeId);
            }
          }
        }
      }

      const fromGroupId = nodeId;
      // TODO geoffreykwan oldToGroupIds is declared here and above. Refactor
      var oldToGroupIds = oldToGroupIds;
      const newToGroupId = node.id;

      /*
       * make the transitions point to the new group and make the new
       * group transition to the old group
       */
      this.updateTransitionsForInsertingGroup(fromGroupId, oldToGroupIds, newToGroupId);
    }
  }

  /**
   * Copy nodes and put them after a certain node id
   * @param nodeIds the node ids to copy
   * @param nodeId the node id we will put the copied nodes after
   */
  copyNodesAfter(nodeIds, nodeId) {
    const newNodes = [];
    for (let nodeIdToCopy of nodeIds) {
      const newNode = this.copyNode(nodeIdToCopy);
      const newNodeId = newNode.id;
      this.createNodeAfter(newNode, nodeId);

      // remember the node id so we can put the next node (if any) after this one
      nodeId = newNodeId;
      this.parseProject();  // refresh project and update references because a new node have been added.

      newNodes.push(newNode);
    }
    return newNodes;
  }
}

AuthoringToolProjectService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'ConfigService',
  'UtilService'
];

export default AuthoringToolProjectService;
