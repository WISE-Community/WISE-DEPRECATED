'use strict';
import ProjectService from '../services/projectService';

class AuthoringToolProjectService extends ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }

  /**
   * Returns a project template for new projects
   */
  getNewProjectTemplate() {
    return {
      "nodes": [
        {
          "id": "group0",
          "type": "group",
          "title": "Master",
          "startId": "group1",
          "ids": [
            "group1"
          ]
        },
        {
          "id": "group1",
          "type": "group",
          "title": this.$translate('FIRST_ACTIVITY'),
          "startId": "",
          "ids": [
          ],
          "icons": {
            "default": {
              "color": "#2196F3",
              "type": "font",
              "fontSet": "material-icons",
              "fontName": "info"
            }
          }
        }
      ],
      "constraints": [],
      "startGroupId": "group0",
      "startNodeId": "group0",
      "navigationMode": "guided",
      "layout": {
        "template": "starmap|leftNav|rightNav"
      },
      "metadata": {
        "title": ""
      },
      "notebook": {
        "enabled": false,
        "label": this.$translate('NOTEBOOK'),
        "enableAddNew": true,
        "itemTypes": {
          "note": {
            "type": "note",
            "enabled": true,
            "enableLink": true,
            "enableAddNote": true,
            "enableClipping": true,
            "enableStudentUploads": true,
            "requireTextOnEveryNote": false,
            "label": {
              "singular": this.$translate('NOTE_LOWERCASE'),
              "plural": this.$translate('NOTES_LOWERCASE'),
              "link": this.$translate('NOTES'),
              "icon": "note",
              "color": "#1565C0"
            }
          },
          "report": {
            "enabled": false,
            "label": {
              "singular": this.$translate('REPORT_LOWERCASE'),
              "plural": this.$translate('REPORTS_LOWERCASE'),
              "link": this.$translate('REPORT'),
              "icon": "assignment",
              "color": "#AD1457"
            },
            "notes": [
              {
                "reportId": "finalReport",
                "title": this.$translate('FINAL_REPORT'),
                "description": this.$translate('REPORT_DESCRIPTION'),
                "prompt": this.$translate('REPORT_PROMPT'),
                "content": this.$translate('REPORT_CONTENT')
              }
            ]
          }
        }
      },
      "teacherNotebook": {
        "enabled": true,
        "label": this.$translate('TEACHER_NOTEBOOK'),
        "enableAddNew": true,
        "itemTypes": {
          "note": {
            "type": "note",
            "enabled": false,
            "enableLink": true,
            "enableAddNote": true,
            "enableClipping": true,
            "enableStudentUploads": true,
            "requireTextOnEveryNote": false,
            "label": {
              "singular": this.$translate('NOTE_LOWERCASE'),
              "plural": this.$translate('NOTES_LOWERCASE'),
              "link": this.$translate('NOTES'),
              "icon": "note",
              "color": "#1565C0"
            }
          },
          "report": {
            "enabled": true,
            "label": {
              "singular": this.$translate('TEACHER_REPORT_LOWERCASE'),
              "plural": this.$translate('TEACHER_REPORTS_LOWERCASE'),
              "link": this.$translate('TEACHER_REPORT'),
              "icon": "assignment",
              "color": "#AD1457"
            },
            "notes": [
              {
                "reportId": "teacherReport",
                "title": this.$translate('TEACHER_REPORT'),
                "description": this.$translate('TEACHER_REPORT_DESCRIPTION'),
                "prompt": this.$translate('TEACHER_REPORT_PROMPT'),
                "content": this.$translate('TEACHER_REPORT_CONTENT')
              }
            ]
          }
        }
      },
      "inactiveNodes": []
    };
  }

  notifyAuthorProjectBegin(projectId) {
    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('notifyProjectBeginURL') + projectId
    };
    return this.$http(httpParams).then((result) => {
      const otherAuthors = result.data;
      return otherAuthors;
    });
  }

  /**
   * Notifies others that the specified project is no longer being authored
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
      const httpParams = {
        method: 'POST',
        url: this.ConfigService.getConfigParam('notifyProjectEndURL') + projectId
      };
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
   * Copies the project with the specified id and returns
   * a new project id if the project is successfully copied
   */
  copyProject(projectId) {
    const copyProjectURL = this.ConfigService.getConfigParam('copyProjectURL');
    if (copyProjectURL == null) {
      return null;
    }

    const httpParams = {
      method: 'POST',
      url: copyProjectURL + "/" + projectId,
      headers:  {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({})
    };

    return this.$http(httpParams).then((result) => {
      return result.data;  // project Id
    });
  };

  /**
   * Registers a new project having the projectJSON content with the server.
   * Returns a new project Id if the project is successfully registered.
   * Returns null if Config.registerNewProjectURL is undefined.
   * Throws an error if projectJSONString is invalid JSON string
   */
  registerNewProject(projectJSONString, commitMessage = "") {
    const registerNewProjectURL = this.ConfigService.getConfigParam('registerNewProjectURL');
    if (registerNewProjectURL == null) {
      return null;
    }

    try {
      JSON.parse(projectJSONString);
    } catch (e) {
      throw new Error("Invalid projectJSONString.");
    }

    const httpParams = {
      method: 'POST',
      url: registerNewProjectURL,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({
        commitMessage: commitMessage,
        projectJSONString: projectJSONString
      })
    };

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
    return {
      id: this.getNextAvailableGroupId(),
      type: 'group',
      title: title,
      startId: '',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      ids: []
    }
  };

  /**
   * Create a new node
   * @param title the title of the node
   * @returns the node object
   */
  createNode(title) {
    return {
      id: this.getNextAvailableNodeId(),
      title: title,
      type: 'node',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      showSaveButton: false,
      showSubmitButton: false,
      components: []
    }
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
    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('importStepsURL'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({
        steps: angular.toJson(selectedNodes),
        fromProjectId: fromProjectId,
        toProjectId: toProjectId
      })
    };

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
    if (nodeId == 'inactiveNodes' || nodeId == 'inactiveGroups') {
      this.addInactiveNodeInsertAfter(node);
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
        this.insertNodeInsideOnlyUpdateTransitions(node.id, nodeId);
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

      this.addInactiveNodeInsertAfter(node, nodeId);
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

  /**
   * Check if a node is inactive. At the moment only step nodes can be
   * inactive.
   * @param nodeId the node id of the step
   */
  isInactive(nodeId) {
    if (nodeId != null && this.project.inactiveNodes != null) {
      for (let inactiveNode of this.project.inactiveNodes) {
        if (inactiveNode != null) {
          if (nodeId === inactiveNode.id) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if a node id is already being used in the project
   * @param nodeId check if this node id is already being used in the project
   * @return whether the node id is already being used in the project
   */
  isNodeIdUsed(nodeId) {
    for (let node of this.project.nodes) {
      if (node != null) {
        if (nodeId === node.id) {
          return true;
        }
      }
    }

    for (let node of this.project.inactiveNodes) {
      if (node != null) {
        if (nodeId === node.id) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Set a field in the transition logic of a node
   */
  setTransitionLogicField(nodeId, field, value) {
    if (nodeId != null && field != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          transitionLogic[field] = value;
        }
      }
    }
  }

  /**
   * Set the transition to value of a node
   * @param fromNodeId the from node
   * @param toNodeId the to node
   */
  setTransition(fromNodeId, toNodeId) {
    const node = this.getNodeById(fromNodeId);
    if (node != null) {
      const transitionLogic = node.transitionLogic;
      if (transitionLogic != null) {
        let transitions = transitionLogic.transitions;
        if (transitions == null || transitions.length == 0) {
          transitionLogic.transitions = [];
          const transition = {};
          transitionLogic.transitions.push(transition);
          transitions = transitionLogic.transitions;
        }

        if (transitions != null && transitions.length > 0) {
          // get the first transition. we will assume there is only one transition.
          const transition = transitions[0];
          if (transition != null) {
            transition.to = toNodeId;
          }
        }
      }
    }
  }

  /**
   * Get the node id that comes after a given node id
   * @param nodeId get the node id that comes after this node id
   * @param the node id that comes after the one that is passed in as a parameter
   */
  getNodeIdAfter(nodeId) {
    let nodeIdAfter = null;

    // get an array of ordered items. each item represents a node
    const orderedItems = this.$filter('orderBy')(this.$filter('toArray')(this.idToOrder), 'order');

    if (orderedItems != null) {
      let foundNodeId = false;
      for (let item of orderedItems) {
        if (item != null) {
          const tempNodeId = item.$key;

          // check if we have found the node id that was passed in as a parameter
          if (foundNodeId) {
            /*
             * we have previously found the node id that was passed in which means
             * the current temp node id is the one that comes after it
             */
            nodeIdAfter = tempNodeId;
            break;
          } else {
            if (nodeId == tempNodeId) {
              // we have found the node id that was passed in as a parameter
              foundNodeId = true;
            }
          }
        }
      }
    }
    return nodeIdAfter;
  }

  /**
   * Add branch path taken constraints to the node
   * @param targetNodeId the node to add the constraints to
   * @param fromNodeId the from node id of the branch path taken constraint
   * @param toNodeId the to node id of the branch path taken constraint
   */
  addBranchPathTakenConstraints(targetNodeId, fromNodeId, toNodeId) {
    if (targetNodeId != null) {
      const node = this.getNodeById(targetNodeId);
      if (node != null) {
        /*
         * create the constraint that makes the node not visible until
         * the given branch path is taken
         */
        const makeThisNodeNotVisibleConstraint = {
          id: this.getNextAvailableConstraintIdForNodeId(targetNodeId),
          action: 'makeThisNodeNotVisible',
          targetId: targetNodeId,
          removalConditional: 'all',
          removalCriteria: [{
            name: 'branchPathTaken',
            params: {
              fromNodeId: fromNodeId,
              toNodeId: toNodeId
            }
          }]
        };
        node.constraints.push(makeThisNodeNotVisibleConstraint);

        /*
         * create the constraint that makes the node not visitable until
         * the given branch path is taken
         */
        const makeThisNodeNotVisitableConstraint = {
          id: this.getNextAvailableConstraintIdForNodeId(targetNodeId),
          action: 'makeThisNodeNotVisitable',
          targetId: targetNodeId,
          removalConditional: 'all',
          removalCriteria: [{
            name: 'branchPathTaken',
            params: {
              fromNodeId: fromNodeId,
              toNodeId: toNodeId
            }
          }]
        };
        node.constraints.push(makeThisNodeNotVisitableConstraint);
      }
    }
  }

  /**
   * Set the project level rubric
   */
  setProjectRubric(html) {
    this.project.rubric = html;
  }

  /**
   * Get the number of branch paths. This is assuming the node is a branch point.
   * @param nodeId The node id of the branch point node.
   * @return The number of branch paths for this branch point.
   */
  getNumberOfBranchPaths(nodeId) {
    let transitions = this.getTransitionsByFromNodeId(nodeId);
    if (transitions != null) {
      return transitions.length;
    }
    return 0;
  }

  /**
   * If this step is a branch point, we will return the criteria that is used
   * to determine which path the student gets assigned to.
   * @param nodeId The node id of the branch point.
   * @returns A human readable string containing the criteria of how students
   * are assigned branch paths on this branch point.
   */
  getBranchCriteriaDescription(nodeId) {
    let transitionLogic = this.getTransitionLogicByFromNodeId(nodeId);
    let transitions = transitionLogic.transitions;

    // Loop through the transitions to try to find a transition criteria
    for (let transition of transitions) {
      if (transition.criteria != null && transition.criteria.length > 0) {
        for (let singleCriteria of transition.criteria) {
          if (singleCriteria.name == 'choiceChosen') {
            return 'multiple choice';
          } else if (singleCriteria.name == 'score') {
            return 'score';
          }
        }
      }
    }

    /*
     * None of the transitions had a specific criteria so the branching is just
     * based on the howToChooseAmongAvailablePaths field.
     */
    if (transitionLogic.howToChooseAmongAvailablePaths == 'workgroupId') {
      return 'workgroup ID';
    } else if (transitionLogic.howToChooseAmongAvailablePaths == 'random') {
      return 'random assignment';
    }
  }

  /**
   * Get the previous node
   * @param nodeId get the node id that comes before this one
   * @return the node id that comes before
   */
  getPreviousNodeId(nodeId) {
    const flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
    if (flattenedNodeIds != null) {
      const indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
      if (indexOfNodeId != -1) {
        const indexOfPreviousNodeId = indexOfNodeId - 1;
        return flattenedNodeIds[indexOfPreviousNodeId];
      }
    }
    return null;
  }

  /**
   * Set the project script filename
   * @param script the script filename
   */
  setProjectScriptFilename(scriptFilename) {
    this.project.script = scriptFilename;
  }

  /**
   * Get the project script filename
   */
  getProjectScriptFilename() {
    if (this.project != null && this.project.script != null) {
      return this.project.script;
    }
    return null;
  }

  /**
   * Check if a node has rubrics.
   * @param nodeId The node id of the node.
   * @return Whether the node has rubrics authored on it.
   */
  nodeHasRubric(nodeId) {
    let numberOfRubrics = this.getNumberOfRubricsByNodeId(nodeId);
    if (numberOfRubrics > 0) {
      return true;
    }
    return false;
  }

  /**
   * Copy a component and insert it into the step
   * @param nodeId we are copying a component in this node
   * @param componentIds the components to copy
   * @param insertAfterComponentId Which component to place the new components
   * after. If this is null, we will put the new components at the beginning.
   * @return an array of the new components
   */
  copyComponentAndInsert(nodeId, componentIds, insertAfterComponentId) {
    const node = this.getNodeById(nodeId);
    const newComponents = [];
    const newComponentIds = [];
    for (let componentId of componentIds) {
      const newComponent =
        this.copyComponent(nodeId, componentId, newComponentIds);
      newComponents.push(newComponent);
      newComponentIds.push(newComponent.id);
    }

    const components = node.components;
    if (components != null) {
      let insertPosition = 0;
      if (insertAfterComponentId == null) {
        // place the new components at the beginning
        insertPosition = 0;
      } else {
        // place the new components after the specified component id
        insertPosition = this.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
      }

      for (let newComponent of newComponents) {
        components.splice(insertPosition, 0, newComponent);

        /*
         * increment the insert position for cases when we have multiple
         * new components
         */
        insertPosition += 1;
      }
    }
    return newComponents;
  }

  /**
   * Copy a component
   * @param nodeId the node id
   * @param componentId the compnent id
   * @param componentIdsToSkip component ids that we can't use for our new
   * component
   * @return a new component object
   */
  copyComponent(nodeId, componentId, componentIdsToSkip) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    const newComponent = this.UtilService.makeCopyOfJSONObject(component);
    const newComponentId = this.getUnusedComponentId(componentIdsToSkip);
    newComponent.id = newComponentId;
    return newComponent;
  }

  /**
   * Import components from a project. Also import asset files that are
   * referenced in any of those components.
   * @param components an array of component objects that we are importing
   * @param importProjectId the id of the project we are importing from
   * @param nodeId the node we are adding the components to
   * @param insertAfterComponentId insert the components after this component
   * id
   * @return an array of the new components
   */
  importComponents(components, importProjectId, nodeId, insertAfterComponentId) {
    let newComponents = [];
    const newComponentIds = [];

    /*
     * loop through all the components and make sure their ids are not
     * already used in the project
     */
    for (let component of components) {
      if (component != null) {
        const newComponent = this.UtilService.makeCopyOfJSONObject(component);
        let newComponentId = newComponent.id;

        if (this.isComponentIdUsed(newComponentId)) {
          // component id is already used so we will find a new component id
          newComponentId = this.getUnusedComponentId(newComponentIds);
          newComponent.id = newComponentId;
        }

        newComponents.push(newComponent);
        newComponentIds.push(newComponentId);
      }
    }

    const httpParams = {
      method: 'POST',
      url: this.ConfigService.getConfigParam('importStepsURL'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({
        steps: angular.toJson(newComponents),
        fromProjectId: importProjectId,
        toProjectId:  this.ConfigService.getConfigParam('projectId'),
      })
    };

    /*
     * Make the request to import the components. This will copy the asset files
     * and change file names if necessary. If an asset file with the same
     * name exists in both projects we will check if their content is the
     * same. If the content is the same we don't need to copy the file. If
     * the content is different, we need to make a copy of the file with a
     * new name and change all the references in the steps to use the new
     * name.
     */
    return this.$http(httpParams).then((result) => {
      newComponents = result.data;
      const node = this.getNodeById(nodeId);
      const currentComponents = node.components;
      let insertPosition = 0;

      if (insertAfterComponentId == null) {
        // place the new components at the beginning
        insertPosition = 0;
      } else {
        // place the new components after the specified component id
        insertPosition = this.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
      }

      for (let newComponent of newComponents) {
        // insert the new component
        currentComponents.splice(insertPosition, 0, newComponent);

        /*
         * increment the insert position for cases when we have multiple
         * new components
         */
        insertPosition += 1;
      }
      return newComponents;
    });
  }

  /**
   * Get the branch path letter
   * @param nodeId get the branch path letter for this node if it is in a
   * branch
   * @return the branch path letter for the node if it is in a branch
   */
  getBranchPathLetter(nodeId) {
    return this.nodeIdToBranchPathLetter[nodeId];
  }

  /**
   * Set the node into the project by replacing the existing node with the
   * given node id
   * @param nodeId the node id of the node
   * @param node the node object
   */
  setNode(nodeId, node) {
    if (nodeId != null && node != null) {
      for (let n = 0; n < this.project.nodes.length; n++) {
        let tempNode = this.project.nodes[n];
        if (tempNode != null && tempNode.id == nodeId) {
          this.project.nodes[n] = node;
        }
      }

      for (let i = 0; i < this.project.inactiveNodes.length; i++) {
        let tempNode = this.project.inactiveNodes[i];
        if (tempNode != null && tempNode.id == nodeId) {
          this.project.inactiveNodes[i] = node;
        }
      }
      this.idToNode[nodeId] = node;
    }
  }

  /**
   * Get the id to node mappings.
   * @return An object the keys as node ids and the values as nodes.
   */
  getIdToNode() {
    return this.idToNode;
  }

  /**
   * Turn on the save button in all the components in the step
   * @param node the node
   */
  turnOnSaveButtonForAllComponents(node) {
    for (let component of node.components) {
      const service = this.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = true;
      }
    }
  }

  /**
   * Turn off the submit button in all the components in the step
   * @param node the node
   */
  turnOffSaveButtonForAllComponents(node) {
    for (let component of node.components) {
      const service = this.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = false;
      }
    }
  }

  /**
   * Remove the node from the active nodes.
   * If the node is a group node, also remove its children.
   * @param nodeId the node to remove
   * @returns the node that was removed
   */
  removeNodeFromActiveNodes(nodeId) {
    let nodeRemoved = null;
    const activeNodes = this.project.nodes;
    for (let a = 0; a < activeNodes.length; a++) {
      const activeNode = activeNodes[a];
      if (activeNode.id === nodeId) {
        activeNodes.splice(a, 1);
        nodeRemoved = activeNode;
        if (activeNode.type == 'group') {
          this.removeChildNodesFromActiveNodes(activeNode);
        }
        break;
      }
    }
    return nodeRemoved;
  }

  /**
   * Move the child nodes of a group from the active nodes.
   * @param node The group node.
   */
  removeChildNodesFromActiveNodes(node) {
    for (let childId of node.ids) {
      this.removeNodeFromActiveNodes(childId);
    }
  }

  /**
   * Move an active node to the inactive nodes array.
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  moveToInactive(node, nodeIdToInsertAfter) {
    if (this.isActive(node.id)) {
      this.removeNodeFromActiveNodes(node.id);
      this.addInactiveNodeInsertAfter(node, nodeIdToInsertAfter);
    }
  }

  /**
   * Add the node to the inactive nodes array.
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  addInactiveNodeInsertAfter(node, nodeIdToInsertAfter) {
    this.clearTransitionsFromNode(node);

    if (this.isNodeIdToInsertTargetNotSpecified(nodeIdToInsertAfter)) {
      this.insertNodeAtBeginningOfInactiveNodes(node);
    } else {
      this.insertNodeAfterInactiveNode(node, nodeIdToInsertAfter);
    }

    if (node.type == 'group') {
      this.inactiveGroupNodes.push(node.id);
      this.addGroupChildNodesToInactive(node);
    } else {
      this.inactiveStepNodes.push(node.id);
    }
  }

  clearTransitionsFromNode(node) {
    if (node.transitionLogic != null) {
      node.transitionLogic.transitions = [];
    }
  }

  insertNodeAtBeginningOfInactiveNodes(node) {
    this.project.inactiveNodes.splice(0, 0, node);
  }

  insertNodeAfterInactiveNode(node, nodeIdToInsertAfter) {
    const inactiveNodes = this.getInactiveNodes();
    for (let i = 0; i < inactiveNodes.length; i++) {
      if (inactiveNodes[i].id === nodeIdToInsertAfter) {
        let parentGroup = this.getParentGroup(nodeIdToInsertAfter);
        if (parentGroup != null) {
          this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
          this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
        }
        inactiveNodes.splice(i + 1, 0, node);
      }
    }
  }

  isNodeIdToInsertTargetNotSpecified(nodeIdToInsertTarget) {
    return nodeIdToInsertTarget == null ||
        nodeIdToInsertTarget === 'inactiveNodes' ||
        nodeIdToInsertTarget === 'inactiveSteps' ||
        nodeIdToInsertTarget === 'inactiveGroups';
  }

  /**
   * Move the node from active to inside an inactive group
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this
   */
  moveFromActiveToInactiveInsertInside(node, nodeIdToInsertInside) {
    this.removeNodeFromActiveNodes(node.id);
    this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
  }

  /**
   * Move the node from inactive to inside an inactive group
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this
   */
  moveFromInactiveToInactiveInsertInside(node, nodeIdToInsertInside) {
    this.removeNodeFromInactiveNodes(node.id);

    if (this.isGroupNode(node.id)) {
      /*
       * remove the group's child nodes from our data structures so that we can
       * add them back in later
       */
      let childIds = node.ids;
      for (let childId of childIds) {
        let childNode = this.getNodeById(childId);
        let inactiveNodesIndex = this.project.inactiveNodes.indexOf(childNode);
        if (inactiveNodesIndex != -1) {
          this.project.inactiveNodes.splice(inactiveNodesIndex, 1);
        }
        let inactiveStepNodesIndex = this.inactiveStepNodes.indexOf(childNode);
        if (inactiveStepNodesIndex != -1) {
          this.inactiveStepNodes.splice(inactiveStepNodesIndex, 1);
        }
      }
    }

    // add the node to the inactive array
    this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
  }

  /**
   * Add the node to the inactive nodes array.
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  addInactiveNodeInsertInside(node, nodeIdToInsertInside) {
    this.clearTransitionsFromNode(node);
    if (this.isNodeIdToInsertTargetNotSpecified(nodeIdToInsertInside)) {
      this.insertNodeAtBeginningOfInactiveNodes(node);
    } else {
      this.insertNodeInsideInactiveNode(node, nodeIdToInsertInside);
    }
    if (node.type == 'group') {
      this.inactiveGroupNodes.push(node.id);
      this.addGroupChildNodesToInactive(node);
    } else {
      this.inactiveStepNodes.push(node.id);
    }
  }

  insertNodeInsideInactiveNode(node, nodeIdToInsertInside) {
    const inactiveNodes = this.getInactiveNodes();
    const inactiveGroupNodes = this.getInactiveGroupNodes();
    for (let inactiveGroup of inactiveGroupNodes) {
      if (nodeIdToInsertInside == inactiveGroup.id) {
        this.insertNodeInsideOnlyUpdateTransitions(node.id, nodeIdToInsertInside);
        this.insertNodeInsideInGroups(node.id, nodeIdToInsertInside);
        for (let i = 0; i < inactiveNodes.length; i++) {
          if (inactiveNodes[i].id == nodeIdToInsertInside) {
            inactiveNodes.splice(i + 1, 0, node);
          }
        }
      }
    }
  }

  /**
    * Move an inactive node within the inactive nodes array.
    * @param node The node to move.
    * @param nodeIdToInsertAfter Place the node after this.
    */
  moveInactiveNodeToInactiveSection(node, nodeIdToInsertAfter) {
    this.removeNodeFromInactiveNodes(node.id);
    this.addInactiveNodeInsertAfter(node, nodeIdToInsertAfter);
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
