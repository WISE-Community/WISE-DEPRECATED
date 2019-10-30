'use strict';

class ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    this.$filter = $filter;
    this.$http = $http;
    this.$injector = $injector;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.UtilService = UtilService;
    this.project = null;
    this.transitions = [];
    this.applicationNodes = [];
    this.inactiveStepNodes = [];
    this.inactiveGroupNodes = [];
    this.groupNodes = [];
    this.idToNode = {};
    this.idToElement = {};
    this.metadata = {};
    this.activeConstraints = [];
    this.rootNode = null;
    this.idToOrder = {};
    this.nodeCount = 0;
    this.componentServices = {};
    this.nodeIdToNumber = {};
    this.nodeIdToIsInBranchPath = {};
    this.nodeIdsInAnyBranch = [];
    this.nodeIdToBranchPathLetter = {};
    this.achievements = [];
    this.isNodeAffectedByConstraintResult = {};
    this.flattenedProjectAsNodeIds = null;

    this.$translate = this.$filter('translate');

    // map from nodeId_componentId to array of additionalProcessingFunctions
    this.additionalProcessingFunctionsMap = {};

    // filtering options for navigation displays
    this.filters = [
      {'name': 'all', 'label': 'All'}
      //{'name': 'todo', 'label': 'Todo'},
      //{'name': 'completed', 'label': 'Completed'}
    ];
  };

  setProject(project) {
    this.project = project;
    this.parseProject();
  };

  /**
   * Initialize the data structures used to hold project information
   */
  clearProjectFields() {
    this.transitions = [];
    this.applicationNodes = [];
    this.inactiveStepNodes = [];
    this.inactiveGroupNodes = [];
    this.groupNodes = [];
    this.idToNode = {};
    this.idToElement = {};
    this.metadata = {};
    this.activeConstraints = [];
    this.rootNode = null;
    this.idToOrder = {};
    this.nodeCount = 0;
    this.nodeIdToIsInBranchPath = {};
    this.nodeIdsInAnyBranch = [];
    this.achievements = [];
    this.clearBranchesCache();
  };

  getStyle() {
    return this.project.style;
  };

  getFilters() {
    return this.filters;
  };

  getProjectTitle() {
    const name = this.getProjectMetadata().title;
    return name ? name : 'A WISE Project (No name)';
  };

  setProjectTitle(projectTitle) {
    const metadata = this.getProjectMetadata();
    metadata.title = projectTitle;
  }

  getProjectMetadata() {
    return this.metadata ? this.metadata : {};
  };

  getNodes() {
    return this.project.nodes;
  };

  getChildNodeIdsById(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node.ids) {
      return node.ids;
    }
    return [];
  };

  getGroupNodes() {
    return this.groupNodes;
  };

  isNode(id) {
    const nodes = this.getNodes();
    for (let node of nodes) {
      if (node.id === id) {
        return true;
      }
    }
    return false;
  };

  addNode(node) {
    const existingNodes = this.project.nodes;
    let replaced = false;
    if (node != null && existingNodes != null) {
      for (let n = 0; n < existingNodes.length; n++) {
        const existingNode = existingNodes[n];
        if (existingNode.id === node.id) {
          existingNodes.splice(n, 1, node);
          replaced = true;
        }
      }
    }
    if (!replaced) {
      existingNodes.push(node);
    }
  };

  addApplicationNode(node) {
    const applicationNodes = this.applicationNodes;
    if (node != null && applicationNodes != null) {
      applicationNodes.push(node);
    }
  };

  addGroupNode(node) {
    const groupNodes = this.groupNodes;
    if (node != null && groupNodes != null) {
      groupNodes.push(node);
    }
    this.$rootScope.$broadcast('groupsChanged');
  };

  addNodeToGroupNode(groupId, nodeId) {
    if (groupId != null && nodeId != null) {
      const group = this.getNodeById(groupId);
      if (group != null) {
        const groupChildNodeIds = group.ids;
        if (groupChildNodeIds != null) {
          if (groupChildNodeIds.indexOf(nodeId) === -1) {
            groupChildNodeIds.push(nodeId);
          }
        }
      }
    }
  };

  isGroupNode(id) {
    const node = this.getNodeById(id);
    return node != null && node.type == 'group';
  };

  isApplicationNode(id) {
    const node = this.getNodeById(id);
    return node != null && node.type !== 'group';
  };

  getGroups() {
    return this.groupNodes;
  };

  getInactiveGroupNodes() {
    return this.inactiveGroupNodes;
  }

  /**
   * Get the inactive step nodes. This will include the inactive steps that
   * are in an inactive group.
   * @return An array of inactive step nodes.
   */
  getInactiveStepNodes() {
    return this.inactiveStepNodes;
  }

  loadNodes(nodes) {
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null) {
          const nodeId = node.id;
          const nodeType = node.type;
          const content = node.content;
          const constraints = node.constraints;

          if (content != null) {
            //node.content = this.injectAssetPaths(content);
          }

          this.setIdToNode(nodeId, node);
          this.setIdToElement(nodeId, node);
          this.addNode(node);

          if (nodeType === 'group') {
            this.addGroupNode(node);
          } else {
            this.addApplicationNode(node);
          }

          const groupId = node.groupId;
          if (groupId != null) {
            this.addNodeToGroupNode(groupId, nodeId);
          }

          if (constraints != null) {
            if (this.ConfigService.isPreview() == true && this.ConfigService.getConfigParam('constraints') === false) {
              /*
               * if we are in preview mode and constraints are set
               * to false, we will not add the constraints
               */
            } else {
              // all other cases we will add the constraints
              for (let constraint of constraints) {
                this.activeConstraints.push(constraint);
              }
            }
          }
        }
      }
    }
  };

  /**
   * Load the planning template nodes
   * @param planning template nodes
   */
  loadPlanningNodes(planningNodes) {
    if (planningNodes != null) {
      for (let planningNode of planningNodes) {
        if (planningNode != null) {
          const nodeId = planningNode.id;
          this.setIdToNode(nodeId, planningNode);
          this.setIdToElement(nodeId, planningNode);

          // TODO: may need to add more function calls here to add the planning
        }
      }
    }
  }

  /**
   * Parse the project to detect the nodes, branches, node numbers, etc.
   */
  parseProject() {
    const project = this.project;
    if (project != null) {
      this.clearProjectFields();

      if (project.metadata) {
        this.metadata = project.metadata;
      }

      const nodes = project.nodes;
      this.loadNodes(nodes);

      const planningNodes = project.planningNodes;
      this.loadPlanningNodes(planningNodes);

      const inactiveNodes = project.inactiveNodes;
      this.loadInactiveNodes(inactiveNodes);

      const constraints = project.constraints;

      if (constraints != null) {
        for (let constraint of constraints) {
          if (constraint != null) {
            const constraintId = constraint.id;
            constraint.active = true;
            this.setIdToElement(constraintId, constraint);
          }
        }
      }

      this.rootNode = this.getRootNode(nodes[0].id);
      this.calculateNodeOrderOfProject();

      const branches = this.getBranches();
      for (const branch of branches) {
        for (const branchPath of branch.branchPaths) {
          this.nodeIdsInAnyBranch = this.nodeIdsInAnyBranch.concat(branchPath);
        }
      }

      /*
       * calculate the node numbers
       * e.g. if the step is called
       * 1.5 View the Potential Energy
       * then the node number is 1.5
       */
      this.calculateNodeNumbers();

      if (this.project.projectAchievements != null) {
        this.achievements = this.project.projectAchievements;
      }
    }

    this.$rootScope.$broadcast('projectChanged');
  };

  calculateNodeOrderOfProject() {
    this.calculateNodeOrder(this.rootNode);
  }

  /**
   * Recursively calculates the node order.
   * @param node
   */
  calculateNodeOrder(node) {
    this.idToOrder[node.id] = {'order': this.nodeCount};
    this.nodeCount++;
    if (this.isGroupNode(node.id)) {
      for (let childId of node.ids) {
        const child = this.getNodeById(childId);
        this.calculateNodeOrder(child);
      }
    }
  };

  /**
   * Get the node order mappings of the project
   * @param project the project JSOn
   * @return an object containing the idToOrder mapping and also the array
   * of nodes
   */
  getNodeOrderOfProject(project) {
    const rootNode = this.getNodeById(project.startGroupId, project);
    const idToOrder = {
      nodeCount: 0
    };
    const stepNumber = '';
    const nodes = [];
    const importProjectIdToOrder = this.getNodeOrderOfProjectHelper(project, rootNode, idToOrder, stepNumber, nodes);
    delete importProjectIdToOrder.nodeCount;
    return {
      idToOrder: importProjectIdToOrder,
      nodes: nodes
    };
  }

  /**
   * Recursively traverse the project to calculate the node order and step numbers
   * @param project the project JSON
   * @param node the current node we are on
   * @param idToOrder the mapping of node id to item
   * @param stepNumber the current step number
   * @param nodes the array of nodes
   */
  getNodeOrderOfProjectHelper(project, node, idToOrder, stepNumber, nodes) {
    /*
     * Create the item that we will add to the idToOrder mapping.
     * The 'order' field determines how the project nodes are displayed
     * when we flatten the project for displaying.
     */
    const item = {
      'order': idToOrder.nodeCount,
      'node': node,
      'stepNumber': stepNumber
    };

    idToOrder[node.id] = item;
    idToOrder.nodeCount++;
    nodes.push(item);

    if (node.type == 'group') {
      const childIds = node.ids;
      for (let c = 0; c < childIds.length; c++) {
        const childId = childIds[c];
        const child = this.getNodeById(childId, project);
        let childStepNumber = stepNumber;

        if (childStepNumber != '') {
          // add the . separator for the step number e.g. 1.
          childStepNumber += '.';
        }

        childStepNumber += (c + 1);
        this.getNodeOrderOfProjectHelper(project, child, idToOrder, childStepNumber, nodes);
      }
    }
    return idToOrder;
  }

  /**
   * Returns the position in the project for the node with the given id. Returns null if no node with id exists.
   * @param id a node id
   * @return string position of the given node id in the project
   */
  getPositionById(id) {
    for (let i = 0; i < this.rootNode.ids.length; i++) {
      const node = this.getNodeById(this.rootNode.ids[i]);
      const path = this.getPathToNode(node, i + 1, id);
      if (path != undefined && path != null) {
        return path;
      }
    }
    return null;
  };

  /**
   * Returns the order of the given node id in the project. Returns null if no node with id exists.
   * @param id String node id
   * @return Number order of the given node id in the project
   */
  getOrderById(id) {
    if (this.idToOrder[id]) {
      return this.idToOrder[id].order;
    }
    return null;
  };

  /**
   * Returns the id of the node with the given order in the project. Returns null if no order with node exists.
   * @param order Number
   * @return Number node id of the given order in the project
   */
  getIdByOrder(order) {
    let nodeId = null;
    for (let id in this.idToOrder) {
      if (this.idToOrder[id].order === order) {
        if (this.isGroupNode(id) && order > 1) {
          nodeId = this.getIdByOrder(order-1);
        } else {
          nodeId = id;
        }
        break;
      }
    }
    return nodeId;
  };

  /**
   * Recursively searches for the given node id from the point of the given node down and returns the path number (position)
   * @param node a node to start searching down
   * @param path the position of the given node
   * @param id the node id to search for
   * @return string path of the given node id in the project
   */
  getPathToNode(node, path, id) {
    if (node.id === id) {
      return path + '';
    } else if (node.type === 'group') {
      let num = 0;
      for (let nodeId of node.ids) {
        if (this.nodeIdsInAnyBranch.indexOf(nodeId) === -1) {
          ++num;
          const pos = this.getPathToNode(this.getNodeById(nodeId), (path) + '.' + (num), id);
          if (pos) {
            return pos;
          }
        }
      }
    }
  };

  getNodePositionById(id) {
    if (id != null) {
      return this.nodeIdToNumber[id];
    }
    return null;
  };

  getNodeIdByOrder(order) {
    for (let [nodeId, value] of Object.entries(this.idToOrder)) {
      if (value.order === order) {
        return nodeId;
      }
    }
    return null;
  };

  getNodeOrderById(id) {
    return this.idToOrder[id] ? this.idToOrder[id].order : null;
  };

  setIdToNode(id, element) {
    this.idToNode[id] = element;
  };

  setIdToElement(id, element) {
    this.idToElement[id] = element;
  };

  /**
   * Replace relative asset paths with absolute paths
   * e.g.
   * assets/myimage.jpg
   * will be replaced with
   * http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg
   * @param content a string or JSON object
   * @return the same type of object that was passed in as the content
   * but with relative asset paths replaced with absolute paths
   */
  injectAssetPaths(content) {
    if (content != null) {
      if (typeof content === 'object') {
        let contentString = JSON.stringify(content);
        if (contentString != null) {
          // replace the relative asset paths with the absolute paths
          contentString = this.replaceAssetPaths(contentString);
          content = JSON.parse(contentString);
        }
      } else if (typeof content === 'string') {
        // replace the relative asset paths with the absolute paths
        content = this.replaceAssetPaths(content);
      }
    }
    return content;
  };

  /**
   * Replace the relative asset paths with absolute paths
   * @param contentString the content string
   * @return the content string with relative asset paths replaced
   * with absolute asset paths
   */
  replaceAssetPaths(contentString) {
    if (contentString != null) {
      // get the content base url e.g. http://wise.berkeley.edu/curriculum/123456/
      const contentBaseURL = this.ConfigService.getConfigParam('projectBaseURL');

      // only look for string that starts with ' or " and ends in png, jpg, jpeg, pdf, etc.
      // the string we're looking for can't start with '/ and "/.
      // note that this also works for \"abc.png and \'abc.png, where the quotes are escaped
      contentString = contentString.replace(
        new RegExp('(\'|\"|\\\\\'|\\\\\")[^:][^\/]?[^\/]?[a-zA-Z0-9@%&;\\._\\/\\s\\-\']*[\.](png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html.*?|js).*?(\'|\"|\\\\\'|\\\\\")', 'gi'),
        (matchedString) => {
          // once found, we prepend the contentBaseURL + "assets/" to the string within the quotes and keep everything else the same.
          let delimiter = '';
          let matchedStringWithoutQuotes = '';

          if (matchedString.length > 2 && matchedString.substr(0,1) == '\\') {
            // the string has escaped quotes for example \"hello.png\"

            // get everything between the escaped quotes
            matchedStringWithoutQuotes = matchedString.substr(2, matchedString.length - 4);

            // get the delimiter which will be \' or \"
            delimiter = matchedString.substr(0,2);
          } else {
            // the string does not have escaped quotes for example "hello.png"

            // get everything between the quotes
            matchedStringWithoutQuotes = matchedString.substr(1, matchedString.length - 2);

            // get the delimiter which will be ' or "
            delimiter = matchedString.substr(0,1);
          }

          if (matchedStringWithoutQuotes != null && matchedStringWithoutQuotes.length > 0 && matchedStringWithoutQuotes.charAt(0) == "/") {
            /*
             * the matched string starts with a "/" which means it's
             * an absolute path and does not require path prepending
             * so we will just return the original unmodified string
             */
            return delimiter + matchedStringWithoutQuotes + delimiter;
          } else {
            //const matchedStringWithoutFirstAndLastQuote = matchedString.substr(1, matchedString.length - 2);  // everything but the beginning and end quote (' or ")
            // make a new string with the contentBaseURL + assets/ prepended to the path
            return delimiter + contentBaseURL + "assets/" + matchedStringWithoutQuotes + delimiter;
          }
        }
      );
    }
    return contentString;
  };

  /**
   * Inject the ng-click attribute that will call the snipImage function
   * @param content the content
   * @returns the modified content
   */
  injectClickToSnipImage(content) {
    if (content != null) {
      if (typeof content === 'object') {
        let contentString = JSON.stringify(content);
        if (contentString != null) {
          // replace the relative asset paths with the absolute paths
          contentString = this.injectClickToSnipImageIntoContentString(contentString);

          content = JSON.parse(contentString);
        }
      } else if (typeof content === 'string') {
        // replace the relative asset paths with the absolute paths
        content = this.injectClickToSnipImageIntoContentString(content);
      }
    }
    return content;
  }

  /**
   * Inject the ng-click attribute that will call the snipImage function
   * @param contentString the content in string format
   * @returns the modified content string
   */
  injectClickToSnipImageIntoContentString(contentString) {
    if (contentString != null) {
      // regex to match image elements
      const imgMatcher = new RegExp('<img.*?src=\\\\?[\'"](.*?)\\\\?[\'"].*?>', 'gi');

      // replace all instances that match
      contentString = contentString.replace(imgMatcher,
        (matchedString, matchGroup1) => {
          /*
           * insert the ng-click attribute
           * Before: <img src="abc.png"/>
           * After: <img ng-click="vleController.snipImage($event)" src="abc.png" />
           */
          const newString = matchedString.replace('img', 'img ng-click=\\\"$emit(\'snipImage\', $event)\\\"');
          return newString;
        }
      );
    }
    return contentString;
  }

  /**
   * Returns the node specified by the nodeId
   * @param nodeId get the node with this node id
   * @param (optional) the project to retrieve the node from. this is used in
   * the case when we want the node from another project such as when we are
   * importing a step from another project
   * Return null if nodeId param is null or the specified node does not exist in the project.
   */
  getNodeById(nodeId, project) {
    if (project == null) {
      if (this.idToNode[nodeId]) {
        return this.idToNode[nodeId];
      }
    } else {
      for (let tempNode of project.nodes) {
        if (tempNode != null && tempNode.id == nodeId) {
          return tempNode;
        }
      }

      for (let tempNode of project.inactiveNodes) {
        if (tempNode != null && tempNode.id == nodeId) {
          return tempNode;
        }
      }
    }
    return null;
  };

  /**
   * Returns the title of the node with the nodeId
   * Return null if nodeId param is null or the specified node does not exist in the project.
   */
  getNodeTitleByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      return node.title;
    }
    return null;
  };

  /**
   * Get the node position and title
   * @param nodeId the node id
   * @returns the node position and title, e.g. "1.1 Introduction"
   */
  getNodePositionAndTitleByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const position = this.getNodePositionById(nodeId);
      if (position != null) {
        return position + ': ' + node.title;
      } else {
        return node.title;
      }
    }
    return null;
  };

  getNodeIconByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    let nodeIcon = null;
    if (node != null) {
      // set defaults (TODO: get from configService?)
      nodeIcon = {
        color: 'rgba(0,0,0,0.54)',
        type: 'font',
        fontSet: 'material-icons',
        fontName: (node.type === 'group') ? 'explore' : 'school',
        imgSrc: '',
        imgAlt: 'node icon'
      };

      // TODO: check for different statuses
      const icons = node.icons;
      if (!!icons && !!icons.default) {
        const icon = icons.default;
        nodeIcon = $.extend(true, nodeIcon, icon);
      }

      // check for empty image source
      if (!nodeIcon.imgSrc) {
        // revert to font icon
        nodeIcon.type = 'font';
      }
    }
    return nodeIcon;
  };

  getParentGroup(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        // Check if the node is a child of an active group.
        const groupNodes = this.getGroupNodes();
        for (let groupNode of groupNodes) {
          if (this.isNodeDirectChildOfGroup(node, groupNode)) {
            return groupNode;
          }
        }

        // Check if the node is a child of an inactive group.
        const inactiveGroupNodes = this.getInactiveGroupNodes();
        for (let inactiveGroupNode of inactiveGroupNodes) {
          if (this.isNodeDirectChildOfGroup(node, inactiveGroupNode)) {
            return inactiveGroupNode;
          }
        }
      }
    }
    return null;
  };

  /**
   * Get the parent group id
   * @param nodeId the parent group id
   * @returns the parent group id
   */
  getParentGroupId(nodeId) {
    if (nodeId != null) {
      const parentGroup = this.getParentGroup(nodeId);
      if (parentGroup != null) {
        return parentGroup.id;
      }
    }
    return null;
  }

  getNodeDepth(nodeId, val) {
    if (nodeId != null) {
      let depth = (typeof val === "number") ? val : 0;
      const parent = this.getParentGroup(nodeId);
      if (parent) {
        depth = this.getNodeDepth(parent.id, depth + 1);
      }
      return depth;
    }
    return null;
  };

  getRootNode(nodeId) {
    const parentGroup = this.getParentGroup(nodeId);
    if (parentGroup == null) {
      return this.getNodeById(nodeId);
    } else {
      return this.getRootNode(parentGroup.id);
    }
    return null;
  };

  isNodeDirectChildOfGroup(node, group) {
    if (node != null && group != null) {
      const nodeId = node.id;
      const groupIds = group.ids;
      if (groupIds != null && groupIds.indexOf(nodeId) != -1) {
        return true;
      }
    }
    return false;
  };

  isNodeDescendentOfGroup(node, group) {
    if (node != null && group != null) {
      const descendents = this.getDescendentsOfGroup(group);
      const nodeId = node.id;
      if (descendents.indexOf(nodeId) != -1) {
        return true;
      }
    }
    return false;
  };

  getDescendentsOfGroup(group) {
    let descendents = [];
    if (group != null) {
      const childIds = group.ids;
      if (childIds != null) {
        descendents = childIds;
        for (let childId of childIds) {
          const node = this.getNodeById(childId);
          if (node != null) {
            const childDescendents = this.getDescendentsOfGroup(node);
            descendents = descendents.concat(childDescendents);
          }
        }
      }
    }
    return descendents;
  };

  getStartNodeId() {
    return this.project.startNodeId;
  };

  setStartNodeId(nodeId) {
    this.project.startNodeId = nodeId;
  }

  getStartGroupId() {
    return this.project.startGroupId;
  }

  isStartNodeId(nodeId) {
    return this.project.startNodeId === nodeId;
  }

  getConstraintsForNode(node) {
    const constraints = [];
    const allConstraints = this.activeConstraints;
    for (let constraint of allConstraints) {
      if (this.isNodeAffectedByConstraint(node, constraint)) {
        constraints.push(constraint);
      }
    }
    return constraints;
  };

  /**
   * Get the constraints on the node.
   * @param nodeId The node id of the node.
   * @return An array of constraint objects.
   */
  getConstraintsOnNode(nodeId) {
    let node = this.getNodeById(nodeId);
    return node.constraints;
  }

  /**
   * @param node A node object.
   * @param constraint A constraint object.
   */
  addConstraintToNode(node, constraint) {
    if (node.constraints == null) {
      node.constraints = [];
    }
    node.constraints.push(constraint);
  }

  /**
   * Check if a node has constraints.
   * @param nodeId The node id of the node.
   * @return true iff the node has constraints authored on it.
   */
  nodeHasConstraint(nodeId) {
    let constraints = this.getConstraintsOnNode(nodeId);
    return constraints.length > 0;
  }

  /**
   * Order the constraints so that they show up in the same order as in the
   * project.
   * @param constraints An array of constraint objects.
   * @return An array of ordered constraints.
   */
  orderConstraints(constraints) {
    let orderedNodeIds = this.getFlattenedProjectAsNodeIds();
    return constraints.sort(this.constraintsComparatorGenerator(orderedNodeIds));
  }

  /**
   * Create the constraints comparator function that is used for sorting an
   * array of constraint objects.
   * @param orderedNodeIds An array of node ids in the order in which they
   * show up in the project.
   * @return A comparator that orders constraint objects in the order in which
   * the target ids show up in the project.
   */
  constraintsComparatorGenerator(orderedNodeIds) {
    return function(constraintA, constraintB) {
      let constraintAIndex = orderedNodeIds.indexOf(constraintA.targetId);
      let constraintBIndex = orderedNodeIds.indexOf(constraintB.targetId);
      if (constraintAIndex < constraintBIndex) {
        return -1;
      } else if (constraintAIndex > constraintBIndex) {
        return 1;
      }
      return 0;
    }
  }

  /**
   * Check if a node is affected by the constraint
   * @param node check if the node is affected
   * @param constraint the constraint that might affect the node
   * @returns whether the node is affected by the constraint
   */
  isNodeAffectedByConstraint(node, constraint) {
    const cachedResult =
        this.getCachedIsNodeAffectedByConstraintResult(node.id, constraint.id);
    if (cachedResult != null) {
      return cachedResult;
    } else {
      let result = false;
      const nodeId = node.id;
      const targetId = constraint.targetId;
      const action = constraint.action;

      if (action === 'makeAllNodesAfterThisNotVisible') {
        if (this.isNodeIdAfter(targetId, node.id)) {
          result = true;
        }
      } else if (action === 'makeAllNodesAfterThisNotVisitable') {
        if (this.isNodeIdAfter(targetId, node.id)) {
          result = true;
        }
      } else {
        const targetNode = this.getNodeById(targetId);
        if (targetNode != null) {
          const nodeType = targetNode.type;
          if (nodeType === 'node' && nodeId === targetId) {
            result = true;
          } else if (nodeType === 'group' &&
              (nodeId === targetId || this.isNodeDescendentOfGroup(node, targetNode))) {
            result = true;
          }
        }
      }

      this.cacheIsNodeAffectedByConstraintResult(node.id, constraint.id, result);
      return result;
    }
  };

  /**
   * Check if a node id comes after another node id in the project.
   * @param nodeId1 The node id of a step or group.
   * @param nodeId2 The node id of a step or group.
   * @returns {boolean} True iff nodeId2 comes after nodeId1.
   */
  isNodeIdAfter(nodeId1, nodeId2) {
    if (this.isApplicationNode(nodeId1)) {
      if (nodeId1 == nodeId2) {
        return false;
      } else {
        const pathsFromNodeId1ToEnd = this.getAllPaths([], nodeId1, true);
        for (let pathToEnd of pathsFromNodeId1ToEnd) {
          if (pathToEnd.indexOf(nodeId2) != -1) {
            return true;
          }
        }
      }
    } else {
      return this.isNodeAfterGroup(nodeId1, nodeId2);
    }
    return false;
  }

  /**
   * @param groupId
   * @param nodeId The node id of a step or group.
   * @returns {boolean} True iff nodeId comes after groupId.
   */
  isNodeAfterGroup(groupId, nodeId) {
    const transitions = this.getTransitionsByFromNodeId(groupId);
    try {
      for (let transition of transitions) {
        const pathFromGroupToEnd = this.getAllPaths([], transition.to, true);
        for (let pathToEnd of pathFromGroupToEnd) {
          if (pathToEnd.indexOf(nodeId) != -1) {
            return true;
          }
        }
      }
    } catch(e) {

    }
    return false;
  }

  /**
   * Get the transition logic for a node
   * @param fromNodeId the from node id
   * @returns the transition logic object
   */
  getTransitionLogicByFromNodeId(fromNodeId) {
    const node = this.getNodeById(fromNodeId);
    if (node.transitionLogic == null) {
      node.transitionLogic = {
        transitions: []
      }
    }
    return node.transitionLogic;
  };

  /**
   * Get the transitions for a node
   * @param fromNodeId the node to get transitions from
   * @returns {Array} an array of transitions
   */
  getTransitionsByFromNodeId(fromNodeId) {
    const transitionLogic = this.getTransitionLogicByFromNodeId(fromNodeId);
    return transitionLogic.transitions;
  }

  /**
   * Get nodes that have a transition to the given node id
   * @param toNodeId the node id
   * @returns an array of node objects that transition to the
   * given node id
   */
  getNodesByToNodeId(toNodeId) {
    const nodesByToNodeId = [];
    if (toNodeId != null) {
      const nodes = this.project.nodes;
      for (let node of nodes) {
        if (this.nodeHasTransitionToNodeId(node, toNodeId)) {
          nodesByToNodeId.push(node);
        }
      }
      const inactiveNodes = this.getInactiveNodes();
      for (let inactiveNode of inactiveNodes) {
        if (this.nodeHasTransitionToNodeId(inactiveNode, toNodeId)) {
          nodesByToNodeId.push(inactiveNode);
        }
      }
    }
    return nodesByToNodeId;
  };

  /**
   * Check if a node has a transition to the given nodeId.
   * @param node The node to check.
   * @param toNodeId We are looking for a transition to this node id.
   * @returns Whether the node has a transition to the given nodeId.
   */
  nodeHasTransitionToNodeId(node, toNodeId) {
    const transitions = this.getTransitionsByFromNodeId(node.id);
    if (transitions != null) {
      for (let transition of transitions) {
        if (toNodeId === transition.to) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get node ids of all the nodes that have a to transition to the given node id
   * @param toNodeId
   * @returns all the node ids that have a transition to the given node id
   */
  getNodesWithTransitionToNodeId(toNodeId) {
    const nodeIds = [];
    const nodes = this.getNodesByToNodeId(toNodeId);
    for (let node of nodes) {
      nodeIds.push(node.id);
    }
    return nodeIds;
  }

  /**
   * Get the group nodes that point to a given node id
   * @param toNodeId
   */
  getGroupNodesByToNodeId(toNodeId) {
    const groupsThatPointToNodeId = [];
    if (toNodeId != null) {
      const groups = this.getGroups();
      for (let group of groups) {
        if (this.nodeHasTransitionToNodeId(group, toNodeId)) {
          groupsThatPointToNodeId.push(group);
        }
      }
    }
    return groupsThatPointToNodeId;
  }

  /**
   * Retrieves the project JSON from Config.projectURL and returns it.
   * If Config.projectURL is undefined, returns null.
   */
  retrieveProject() {
    let projectURL = this.ConfigService.getConfigParam('projectURL');
    if (projectURL == null) {
      return null;
    } else {
      /*
       * add a unique GET parameter value so that it always retrieves the
       * latest version of the project file from the server and never
       * retrieves the project from cache.
       */
      projectURL += '?noCache=' + (new Date()).getTime();
    }

    return this.$http.get(projectURL).then((result) => {
      const projectJSON = result.data;
      this.setProject(projectJSON);
      return projectJSON;
    });
  };

  /**
   * Retrieve the project JSON
   * @param projectId retrieve the project JSON with this id
   * @return a promise to return the project JSON
   */
  retrieveProjectById(projectId) {
    return this.$http.get(`/authorConfig/${projectId}`).then((result) => {
      const configJSON = result.data;
      const projectURL = configJSON.projectURL;
      const previewProjectURL = configJSON.previewProjectURL;
      return this.$http.get(projectURL).then((result) => {
        const projectJSON = result.data;
        projectJSON.previewProjectURL = previewProjectURL;
        return projectJSON;
      });
    });
  }

  /**
   * Saves the project to Config.saveProjectURL and returns commit history promise.
   * if Config.saveProjectURL or Config.projectId are undefined, does not save and returns null
   */
  saveProject(commitMessage = "") {
    this.$rootScope.$broadcast('savingProject');
    this.cleanupBeforeSave();

    const projectId = this.ConfigService.getProjectId();
    const saveProjectURL = this.ConfigService.getConfigParam('saveProjectURL');
    if (projectId == null || saveProjectURL == null) {
      return null;
    }

    const authors = this.project.metadata.authors ? this.project.metadata.authors : [];
    const userInfo = this.ConfigService.getMyUserInfo();
    let exists = false;
    for (let [index, author] of authors.entries()) {
      if (author.id === userInfo.id) {
        author = userInfo;
        exists = true;
        break;
      }
    }
    if (!exists) {
      authors.push(userInfo);
    }
    this.project.metadata.authors = authors;

    const httpParams = {
      method: 'POST',
      url: saveProjectURL,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({
        projectId: projectId,
        commitMessage: commitMessage,
        projectJSONString: angular.toJson(this.project, false)
      })
    };

    return this.$http(httpParams).then((result) => {
      const commitHistory = result.data;
      this.$rootScope.$broadcast('projectSaved');
      return commitHistory;
    });
  };

  /**
   * Perform any necessary cleanup before we save the project.
   * For example we need to remove the checked field in the inactive node
   * objects.
   */
  cleanupBeforeSave() {
    let activeNodes = this.getActiveNodes();
    for (let activeNode of activeNodes) {
      this.cleanupNode(activeNode);
    }

    let inactiveNodes = this.getInactiveNodes();
    for (let inactiveNode of inactiveNodes) {
      this.cleanupNode(inactiveNode);
    }
  }

  /**
   * Remove any fields that are used temporarily for display purposes like when
   * the project is loaded in the authoring tool and grading tool
   * @param node The node object.
   */
  cleanupNode(node) {
    delete node.checked;
    delete node.hasWork;
    delete node.hasAlert;
    delete node.hasNewAlert;
    delete node.isVisible;
    delete node.completionStatus;
    delete node.score;
    delete node.hasScore;
    delete node.maxScore;
    delete node.hasMaxScore;
    delete node.scorePct;
    delete node.order;
    delete node.show;

    let components = node.components;
    // activity nodes do not have components but step nodes do have components
    if (components != null) {
      for (let component of components) {
        this.cleanupComponent(component);
      }
    }
  }

  /**
   * Remove any fields that are used temporarily for display purposes like when
   * the project is loaded in the authoring tool and grading tool
   * @param component The component object.
   */
  cleanupComponent(component) {
    delete component.checked;
    delete component.hasWork;
  }

  /**
   * Returns the theme path for the current project
   */
  getThemePath() {
    const wiseBaseURL = this.ConfigService.getWISEBaseURL();
    const project = this.project;
    if (project && project.theme) {
      // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
      return wiseBaseURL + '/wise5/themes/' + project.theme;
    } else {
      // TODO: get default theme name from ConfigService
      return wiseBaseURL + '/wise5/themes/default';
    }
  };

  /**
   * Returns the theme settings for the current project
   */
  getThemeSettings() {
    let themeSettings = {};
    let project = this.project;
    if (project && project.themeSettings) {
      if (project.theme) {
        // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
        themeSettings = project.themeSettings[project.theme];
      } else {
        // TODO: get default theme name from ConfigService
        themeSettings = project.themeSettings["default"];
      }
    }
    return themeSettings ? themeSettings : {};
  };

  /**
   * Flatten the project to obtain a list of node ids
   * @param recalculate Whether to force recalculating the flattened node ids.
   * @return An array of the flattened node ids in the project.
   */
  getFlattenedProjectAsNodeIds(recalculate) {
    if (!recalculate && this.flattenedProjectAsNodeIds != null) {
      // use the previously calculated flattened node ids
      return this.flattenedProjectAsNodeIds;
    }

    const startNodeId = this.getStartNodeId();

    /*
     * an array to keep track of the node ids in the path that
     * we are currently on as we traverse the nodes in the project
     * depth first
     */
    const pathsSoFar = [];

    // get all the possible paths through the project
    const allPaths = this.getAllPaths(pathsSoFar, startNodeId);

    // consolidate all the paths to create a single list of node ids
    const nodeIds = this.consolidatePaths(allPaths);

    /*
     * Remember the flattened node ids so that we don't have to calculate
     * it again.
     */
    this.flattenedProjectAsNodeIds = nodeIds;

    return nodeIds;
  };

  /**
   * Get all the possible paths through the project. This function
   * recursively calls itself to traverse the project depth first.
   * @param pathSoFar the node ids in the path so far. the node ids
   * in this array are referenced to make sure we don't loop back
   * on the path.
   * @param nodeId the node id we want to get the paths from
   * @param includeGroups whether to include the group node ids in the paths
   * @return an array of paths. each path is an array of node ids.
   */
  getAllPaths(pathSoFar, nodeId, includeGroups) {
    const allPaths = [];
    if (nodeId != null) {
      if (this.isApplicationNode(nodeId)) {
        const path = [];
        const transitions = this.getTransitionsByFromNodeId(nodeId);
        if (transitions != null) {
          if (includeGroups) {
            const parentGroup = this.getParentGroup(nodeId);
            if (parentGroup != null) {
              const parentGroupId = parentGroup.id;
              if (parentGroupId != null && pathSoFar.indexOf(parentGroupId) == -1) {
                pathSoFar.push(parentGroup.id);
              }
            }
          }

          /*
           * add the node id to the path so far so we can later check
           * which nodes are already in the path to prevent looping
           * back in the path
           */
          pathSoFar.push(nodeId);

          if (transitions.length === 0) {
            /*
             * there are no transitions from the node id so we will
             * look for a transition in the parent group
             */

            let addedCurrentNodeId = false;
            const parentGroupId = this.getParentGroupId(nodeId);
            const parentGroupTransitions = this.getTransitionsByFromNodeId(parentGroupId);

            if (parentGroupTransitions != null) {
              for (let parentGroupTransition of parentGroupTransitions) {
                if (parentGroupTransition != null) {
                  const toNodeId = parentGroupTransition.to;
                  if (pathSoFar.indexOf(toNodeId) == -1) {
                    /*
                     * recursively get the paths by getting all
                     * the paths for the to node
                     */
                    const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                    for (let tempPath of allPathsFromToNode) {
                      tempPath.unshift(nodeId);
                      allPaths.push(tempPath);
                      addedCurrentNodeId = true;
                    }
                  }
                }
              }
            }

            if (!addedCurrentNodeId) {
              /*
               * if the parent group doesn't have any transitions we will
               * need to add the current node id to the path
               */
              path.push(nodeId);
              allPaths.push(path);
            }
          } else {
            // there are transitions from this node id

            for (let transition of transitions) {
              if (transition != null) {
                const toNodeId = transition.to;
                if (toNodeId != null && pathSoFar.indexOf(toNodeId) == -1) {
                  // we have not found the to node in the path yet so we can traverse it

                  /*
                   * recursively get the paths by getting all
                   * the paths from the to node
                   */
                  const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                  if (allPathsFromToNode != null) {
                    for (let tempPath of allPathsFromToNode) {
                      if (includeGroups) {
                        // we need to add the group id to the path

                        if (tempPath.length > 0) {
                          const firstNodeId = tempPath[0];
                          const firstParentGroupId = this.getParentGroupId(firstNodeId);
                          const parentGroupId = this.getParentGroupId(nodeId);
                          if (parentGroupId != firstParentGroupId) {
                            /*
                             * the parent ids are different which means this is a boundary
                             * between two groups. for example if the project looked like
                             * group1>node1>node2>group2>node3>node4
                             * and the current node was node2 then the first node in the
                             * path would be node3 which means we would need to place
                             * group2 on the path before node3
                             */
                            tempPath.unshift(firstParentGroupId);
                          }
                        }
                      }

                      tempPath.unshift(nodeId);
                      allPaths.push(tempPath);
                    }
                  }
                } else {
                  /*
                   * the node is already in the path so far which means
                   * the transition is looping back to a previous node.
                   * we do not want to take this transition because
                   * it will lead to an infinite loop. we will just
                   * add the current node id to the path and not take
                   * the transition which essentially ends the path.
                   */
                  path.push(nodeId);
                  allPaths.push(path);
                }
              }
            }
          }

          if (pathSoFar.length > 0) {
            const lastNodeId = pathSoFar[pathSoFar.length - 1];
            if (this.isGroupNode(lastNodeId)) {
              /*
               * the last node id is a group id so we will remove it
               * since we are moving back up the path as we traverse
               * the nodes depth first
               */
              pathSoFar.pop();
            }
          }

          /*
           * remove the latest node id (this will be a step node id)
           * since we are moving back up the path as we traverse the
           * nodes depth first
           */
          pathSoFar.pop();

          if (includeGroups) {
            if (pathSoFar.length == 1) {
              /*
               * we are including groups and we have traversed
               * back up to the start node id for the project.
               * the only node id left in pathSoFar is now the
               * parent group of the start node id. we will
               * now add this parent group of the start node id
               * to all of the paths
               */

              for (let path of allPaths) {
                if (path != null) {
                  /*
                   * prepend the parent group of the start node id
                   * to the path
                   */
                  path.unshift(pathSoFar[0]);
                }
              }

              /*
               * remove the parent group of the start node id from
               * pathSoFar which leaves us with an empty pathSoFar
               * which means we are completely done with
               * calculating all the paths
               */
              pathSoFar.pop();
            }
          }
        }
      } else if (this.isGroupNode(nodeId)) {

        /*
         * add the node id to the path so far so we can later check
         * which nodes are already in the path to prevent looping
         * back in the path
         */
        pathSoFar.push(nodeId);

        const groupNode = this.getNodeById(nodeId);
        if (groupNode != null) {
          const startId = groupNode.startId;
          if (startId == null || startId == "") {
            // there is no start id so we will take the transition from the group
            // TODO? there is no start id so we will loop through all the child nodes

            const transitions = this.getTransitionsByFromNodeId(groupNode.id);
            if (transitions != null && transitions.length > 0) {
              for (let transition of transitions) {
                if (transition != null) {
                  const toNodeId = transition.to;

                  const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                  if (allPathsFromToNode != null) {
                    for (let tempPath of allPathsFromToNode) {
                      tempPath.unshift(nodeId);
                      allPaths.push(tempPath);
                    }
                  }
                }
              }
            } else {
              /*
               * this activity does not have any transitions so
               * we have reached the end of this path
               */

              const tempPath = [];
              tempPath.unshift(nodeId);
              allPaths.push(tempPath);
            }
          } else {
            // there is a start id so we will traverse it

            const allPathsFromToNode = this.getAllPaths(pathSoFar, startId, includeGroups);

            if (allPathsFromToNode != null) {
              for (let tempPath of allPathsFromToNode) {
                tempPath.unshift(nodeId);
                allPaths.push(tempPath);
              }
            }
          }
        }

        /*
         * remove the latest node id since we are moving back
         * up the path as we traverse the nodes depth first
         */
        pathSoFar.pop();
      }
    }
    return allPaths;
  };

  /**
   * Consolidate all the paths into a linear list of node ids
   * @param paths an array of paths. each path is an array of node ids.
   * @return an array of node ids that have been properly ordered
   */
  consolidatePaths(paths) {
    let consolidatedPath = [];

    if (paths != null) {
      /*
       * continue until all the paths are empty. as we consolidate
       * node ids, we will remove them from the paths. once all the
       * paths are empty we will be done consolidating the paths.
       */
      while(!this.arePathsEmpty(paths)) {
        // start with the first path
        const currentPath = this.getNonEmptyPathIndex(paths);

        // get the first node id in the current path
        const nodeId = this.getFirstNodeIdInPathAtIndex(paths, currentPath);
        if (this.areFirstNodeIdsInPathsTheSame(paths)) {
          // the first node ids in all the paths are the same

          // remove the node id from all the paths
          this.removeNodeIdFromPaths(nodeId, paths);

          // add the node id to our consolidated path
          consolidatedPath.push(nodeId);
        } else {
          // not all the top node ids are the same which means we have branched

          // get all the paths that contain the node id
          const pathsThatContainNodeId = this.getPathsThatContainNodeId(nodeId, paths);

          if (pathsThatContainNodeId != null) {
            if (pathsThatContainNodeId.length === 1) {
              // only the current path we are on has the node id

              // remove the node id from the path
              this.removeNodeIdFromPath(nodeId, paths, currentPath);

              // add the node id to our consolidated path
              consolidatedPath.push(nodeId);
            } else {
              // there are multiple paths that have this node id

              // consume all the node ids up to the given node id
              const consumedPath = this.consumePathsUntilNodeId(paths, nodeId);

              // remove the node id from the paths
              this.removeNodeIdFromPaths(nodeId, paths);

              // add the node id to the end of the consumed path
              consumedPath.push(nodeId);

              // add the consumed path to our consolidated path
              consolidatedPath = consolidatedPath.concat(consumedPath);
            }
          }
        }
      }
    }
    return consolidatedPath;
  };

  /**
   * Consume the node ids in the paths until we get to the given node id
   * @param paths the paths to consume
   * @param nodeId the node id to stop consuming at
   * @return an array of node ids that we have consumed
   */
  consumePathsUntilNodeId(paths, nodeId) {
    let consumedNodes = [];
    for (let path of paths) {
      if (path.includes(nodeId)) {
        let subPath = path.slice(0, path.indexOf(nodeId));
        for (let nodeIdInPath of subPath) {
          if (!consumedNodes.includes(nodeIdInPath)) {
            consumedNodes.push(nodeIdInPath);
          }
        }
      }
    }
    return consumedNodes;
  }

  /**
   * Get the path at the given index and get the first node id in
   * the path
   * @param paths an array of paths. each path is an array of node ids
   * @param index the index of the path we want
   * @return the first node in the given path
   */
  getFirstNodeIdInPathAtIndex(paths, index) {
    let nodeId = null;
    if (paths != null && index != null) {
      const path = paths[index];
      if (path != null && path.length > 0) {
        nodeId = path[0];
      }
    }
    return nodeId;
  };

  /**
   * Remove the node ifrom the paths
   * @param nodeId the node id to remove
   * @param paths an array of paths. each path is an array of node ids
   */
  removeNodeIdFromPaths(nodeId, paths) {
    if (nodeId != null && paths != null) {
      for (let path of paths) {
        for (let x = 0; x < path.length; x++) {
          const tempNodeId = path[x];

          /*
           * check if the node id matches the one we are looking
           * for
           */
          if (nodeId === tempNodeId) {
            /*
             * we have found the node id we are looking for so
             * we will remove it from the path
             */
            path.splice(x, 1);

            /*
             * move the counter back since we just removed a
             * node id. we will continue searching this path
             * for the node id in case the path contains it
             * multiple times.
             */
            x--;
          }
        }
      }
    }
  };

  /**
   * Remove the node id from the path
   * @param nodeId the node id to remove
   * @param paths an array of paths. each path is an array of node ids
   * @param pathIndex the path to remove from
   */
  removeNodeIdFromPath(nodeId, paths, pathIndex) {
    if (nodeId != null && paths != null && pathIndex != null) {
      const path = paths[pathIndex];
      if (path != null) {
        for (let x = 0; x < path.length; x++) {
          const tempNodeId = path[x];

          /*
           * check if the node id matches the one we are looking
           * for
           */
          if (nodeId === tempNodeId) {
            /*
             * we have found the node id we are looking for so
             * we will remove it from the path
             */
            path.splice(x, 1);

            /*
             * move the counter back since we just removed a
             * node id. we will continue searching this path
             * for the node id in case the path contains it
             * multiple times.
             */
            x--;
          }
        }
      }
    }
  };

  /**
   * Check if the first node ids in the paths are the same
   * @param paths an array of paths. each path is an array of node ids
   * @return whether all the paths have the same first node id
   */
  areFirstNodeIdsInPathsTheSame(paths) {
    let result = true;
    let nodeId = null;
    if (paths != null) {
      for (let path of paths) {
        const tempNodeId = path[0];
        if (nodeId == null) {
          /*
           * this is the first path we have looked at so we will
           * remember the node id
           */
          nodeId = tempNodeId;
        } else if (nodeId != tempNodeId) {
          /*
           * the node id does not match the first node id from a
           * previous path so the paths do not all have the same
           * first node id
           */
          result = false;
          break;
        }
      }
    }
    return result;
  };

  /**
   * Check if all the paths are empty
   * @param paths an array of paths. each path is an array of node ids
   * @return whether all the paths are empty
   */
  arePathsEmpty(paths) {
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          if (path.length !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  };

  /**
   * Get the paths that contain the node id
   * @param nodeId the node id we are looking for
   * @param paths an array of paths. each path is an array of node ids
   * @return an array of paths that contain the given node id
   */
  getPathsThatContainNodeId(nodeId, paths) {
    const pathsThatContainNodeId = [];
    if (nodeId != null && paths != null) {
      for (let path of paths) {
        // check if the path contains the node id
        if (path.indexOf(nodeId) != -1) {
          /*
           * add the path to the array of paths that contain
           * the node id
           */
          pathsThatContainNodeId.push(path);
        }
      }
    }
    return pathsThatContainNodeId;
  };

  /**
   * Get a non empty path index. It will loop through the paths and
   * return the index of the first non empty path.
   * @param paths an array of paths. each path is an array of node ids
   * @return the index of the path that is not empty
   */
  getNonEmptyPathIndex(paths) {
    if (paths != null) {
      for (let p = 0; p < paths.length; p++) {
        const path = paths[p];
        if (path.length !== 0) {
          return p;
        }
      }
    }
    return null;
  };

  /**
   * Remember the branches.
   * @param branches An array of arrays of node ids.
   */
  setBranchesCache(branches) {
    this.branchesCache = branches;
  }

  /**
   * Get the branches that were previously calculated.
   * @returns An array of arrays of node ids.
   */
  getBranchesCache() {
    return this.branchesCache;
  }

  clearBranchesCache() {
    this.branchesCache = null;
  }

  getBranches() {
    /*
     * Do not use the branches cache in the authoring tool because the branches
     * may change when the author changes the project. In all other modes the
     * branches can't change so we can use the cache.
     */
    if (this.ConfigService.getMode() != 'author') {
      let branchesCache = this.getBranchesCache();
      if (branchesCache != null) {
        return branchesCache;
      }
    }

    const startNodeId = this.getStartNodeId();

    /*
     * an array to keep track of the node ids in the path that
     * we are currently on as we traverse the nodes in the project
     * depth first
     */
    const pathsSoFar = [];

    const allPaths = this.getAllPaths(pathsSoFar, startNodeId);
    const branches = this.findBranches(allPaths);
    if (this.ConfigService.getMode() != 'author') {
      this.setBranchesCache(branches);
    }
    return branches;
  };

  /**
   * Find the branches in the project
   * @param paths all the possible paths through the project
   * @return an array of branch objects. each branch object contains
   * the branch start point, the branch paths, and the branch
   * end point
   */
  findBranches(paths) {
    let branches = [];
    let previousNodeId = null;

    /*
     * continue until all the paths are empty. we will remove
     * node ids from the paths as we traverse the paths to find
     * the branches
     */
    while (!this.arePathsEmpty(paths)) {
      const nodeId = this.getFirstNodeIdInPathAtIndex(paths, 0);

      if (this.areFirstNodeIdsInPathsTheSame(paths)) {
        // the first node ids in all the paths are the same

        this.removeNodeIdFromPaths(nodeId, paths);
        previousNodeId = nodeId;
      } else {
        // not all the top node ids are the same which means we have branched

        const branchMetaObject = this.createBranchMetaObject(previousNodeId);
        branchMetaObject.branchStartPoint = previousNodeId;

        const nextCommonNodeId = this.findNextCommonNodeId(paths);
        branchMetaObject.branchEndPoint = nextCommonNodeId;

        let branchPaths = this.extractPathsUpToNodeId(paths, nextCommonNodeId);
        branchPaths = this.removeDuplicatePaths(branchPaths);
        branchMetaObject.branchPaths = branchPaths;
        branches.push(branchMetaObject);

        // trim the paths so that they start at the branch end point
        this.trimPathsUpToNodeId(paths, nextCommonNodeId);

        // remember this node id for the next iteration of the loop
        previousNodeId = nextCommonNodeId;
      }
    }
    return branches;
  };

  /**
   * Create a branch meta object that will contain the branch start
   * point, branch paths, and branch end point
   * @return an object that contains a branch start point, branch paths,
   * and a branch end point
   */
  createBranchMetaObject() {
    const branchMetaObject = {};
    branchMetaObject.branchStartPoint = null;
    branchMetaObject.branchPaths = [];
    branchMetaObject.branchEndPoint = null;
    return branchMetaObject;
  };

  /**
   * Find the next common node id in all the paths
   * @param paths the paths to find the common node id in
   * @return a node id that is in all the paths or null
   * if there is no node id that is in all the paths
   */
  findNextCommonNodeId(paths) {
    let nextCommonNodeId = null;
    if (paths != null) {
      if (paths.length > 0) {
        const path = paths[0];
        for (let tempNodeId of path) {
          if (this.allPathsContainNodeId(paths, tempNodeId)) {
            /*
             * the node id is in all the paths so we have found
             * what we were looking for
             */
            nextCommonNodeId = tempNodeId;
            break;
          }
        }
      }
    }
    return nextCommonNodeId;
  };

  /**
   * Check if all the paths contain the node id
   * @param paths an array of paths. each path contains an array of node ids
   * @param nodeId the node id that we will check is in all the paths
   * @return whether the node id is in all the paths
   */
  allPathsContainNodeId(paths, nodeId) {
    let result = false;
    if (paths != null) {
      for (let path of paths) {
        const index = path.indexOf(nodeId);
        if (index == -1) {
          result = false;
          break;
        } else {
          result = true;
        }
      }
    }
    return result;
  };

  /**
   * Trim the paths up to the given node id so that the paths will contain
   * the given node id and all the node ids after it. This function will
   * modify the paths.
   * @param paths the paths to trim
   * @param nodeId the node id to trim up to
   */
  trimPathsUpToNodeId(paths, nodeId) {
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          let index = path.indexOf(nodeId);

          if (index == -1) {
            /*
             * the node id is not in the path so we will
             * trim the path to the end which will make
             * the path empty
             */
            index = path.length;
          }

          /*
           * trim the path up to the node id index. this will
           * modify the path array.
           */
          path.splice(0, index);
        }
      }
    }
  };


  /**
   * Extract the paths up to a given node id. This will be used to
   * obtain branch paths.
   * @param paths the paths to extract from
   * @param nodeId the node id to extract up to
   * @return paths that go up to but do not include the node id
   */
  extractPathsUpToNodeId(paths, nodeId) {
    const extractedPaths = [];
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          let index = path.indexOf(nodeId);
          if (index == -1) {
            /*
             * the node id is not in the path so we will
             * extract up to the end of the path
             */
            index = path.length;
          }

          /*
           * get the path up to the node id index. this does
           * not modify the path array.
           */
          const extractedPath = path.slice(0, index);
          extractedPaths.push(extractedPath);
        }
      }
    }
    return extractedPaths;
  };

  /**
   * Removes duplicate paths
   * @param paths an array of paths. each path contains an array of node ids
   * @return an array of unique paths
   */
  removeDuplicatePaths(paths) {
    const uniquePaths = [];
    if (paths != null) {
      for (let path of paths) {
        let isPathInUniquePaths = false;
        for (let uniquePath of uniquePaths) {
          if (this.pathsEqual(path, uniquePath)) {
            isPathInUniquePaths = true;
          }
        }

        if (!isPathInUniquePaths) {
          // the path is not equal to any paths in the unique
          // paths array so we will add it to the unique paths array
          uniquePaths.push(path);
        }
      }
    }
    return uniquePaths;
  };

  /**
   * Check if two paths are equal
   * @param path1 an array of node ids
   * @param path2 an array of node ids
   * @return whether the two paths contain the same node ids
   * in the same order
   */
  pathsEqual(path1, path2) {
    let result = false;
    if (path1 != null && path2 != null) {
      if (path1.length === path2.length) {
        result = true;

        for (let x = 0; x < path1.length; x++) {
          const path1NodeId = path1[x];
          const path2NodeId = path2[x];
          if (path1NodeId !== path2NodeId) {
            result = false;
            break;
          }
        }
      }
    }
    return result;
  };

  /**
   * Get the branch paths that a node id is in
   * @param branches an array of branch objects
   * @param nodeId the node id to check
   * @return an array of the branch paths that the node id is in
   */
  getBranchPathsByNodeId(branches, nodeId) {
    const branchPathsIn = [];
    if (branches != null && nodeId != null) {
      for (let branch of branches) {
        if (branch != null) {
          const branchPaths = branch.branchPaths;
          if (branchPaths != null) {
            for (let branchPath of branchPaths) {
              if (branchPath != null) {
                const index = branchPath.indexOf(nodeId);
                if (index != -1) {
                  /*
                   * the node is in this branch path so we will
                   * add the branch path to our array
                   */
                  branchPathsIn.push(branchPath);
                }
              }
            }
          }
        }
      }
    }
    return branchPathsIn;
  }

  /**
   * Get the component by node id and component id
   * @param nodeId the node id
   * @param componentId the component id
   * @returns the component or null if the nodeId or componentId are null or does not exist in the project.
   */
  getComponentByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null && componentId != null) {
      const components = this.getComponentsByNodeId(nodeId);
      for (let tempComponent of components) {
        if (tempComponent != null) {
          const tempComponentId = tempComponent.id;
          if (componentId === tempComponentId) {
            return tempComponent;
          }
        }
      }
    }
    return null;
  };

  /**
   * Returns the position of the component in the node by node id and
   * component id, 0-indexed.
   * @param nodeId the node id
   * @param componentId the component id
   * @returns the component's position or -1 if nodeId or componentId are null
   * or doesn't exist in the project.
   */
  getComponentPositionByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null && componentId != null) {
      const components = this.getComponentsByNodeId(nodeId);
      for (let c = 0; c < components.length; c++) {
        const tempComponent = components[c];
        if (tempComponent != null) {
          const tempComponentId = tempComponent.id;
          if (componentId === tempComponentId) {
            return c;
          }
        }
      }
    }
    return -1;
  };

  /**
   * Get the components in a node
   * @param nodeId the node id
   * @returns an array of components or empty array if nodeId is null or
   * doesn't exist in the project.
   * if the node exists but doesn't have any components, returns an empty array.
   */
  getComponentsByNodeId(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        if (node.components != null) {
          return node.components;
        }
      }
    }
    return [];
  };


  // TODO: how is this different from straight-up calling getNodeById?
  getNodeContentByNodeId(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        return node;
      }
    }
    return null;
  };

  /**
   * Insert the node after the given node id in the group's
   * array of children ids
   * @param nodeIdToInsert the node id we want to insert
   * @param nodeIdToInsertAfter the node id we want to insert after
   */
  insertNodeAfterInGroups(nodeIdToInsert, nodeIdToInsertAfter) {
    const groupNodes = this.getGroupNodes();
    if (groupNodes != null) {
      for (let group of groupNodes) {
        if (group != null) {
          this.insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter);
        }
      }
    }
    const inactiveGroupNodes = this.getInactiveGroupNodes();
    if (inactiveGroupNodes != null) {
      for (let inactiveGroup of inactiveGroupNodes) {
        if (inactiveGroup != null) {
          this.insertNodeAfterInGroup(inactiveGroup, nodeIdToInsert, nodeIdToInsertAfter);
        }
      }
    }
  }

  /**
   * Insert a node id in a group after another specific node id.
   * @param group A group object.
   * @param nodeIdToInsert The node id to insert.
   * @param nodeIdToInsertAfter The node id to insert after.
   * @returns {boolean} Whether we inserted the node id.
   */
  insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter) {
    const ids = group.ids;
    if (ids != null) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (nodeIdToInsertAfter === id) {
          ids.splice(i + 1, 0, nodeIdToInsert);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Update the transitions to handle inserting a node after another node.
   * The two nodes must either both be steps or both be activities.
   * @param nodeToInsert the node to insert
   * @param nodeIdToInsertAfter the node id to insert after
   */
  insertNodeAfterInTransitions(nodeToInsert, nodeIdToInsertAfter) {
    const nodeToInsertAfter = this.getNodeById(nodeIdToInsertAfter);
    if (nodeToInsert.type != nodeToInsertAfter.type) {
      throw 'Error: insertNodeAfterInTransitions() nodes are not the same type';
    }
    if (nodeToInsertAfter.transitionLogic == null) {
      nodeToInsertAfter.transitionLogic = {
        transitions: []
      };
    }
    if (nodeToInsert.transitionLogic == null) {
      nodeToInsert.transitionLogic = {
        transitions: []
      };
    }
    if (this.isGroupNode(nodeToInsert.id)) {
      this.updateChildrenTransitionsInAndOutOfGroup(nodeToInsert, nodeIdToInsertAfter);
    }
    this.copyTransitions(nodeToInsertAfter, nodeToInsert);
    if (nodeToInsert.transitionLogic.transitions.length == 0) {
      this.copyParentTransitions(nodeIdToInsertAfter, nodeToInsert);
    }
    const transitionObject = {
      to: nodeToInsert.id
    };
    nodeToInsertAfter.transitionLogic.transitions = [transitionObject];
    this.updateBranchPathTakenConstraints(nodeToInsert, nodeIdToInsertAfter);
  }

  /*
   * Copy the transitions from nodeId's parent and add to node's transitions.
   * @param nodeId Copy the transition of this nodeId's parent.
   * @param node The node to add transitions to.
   */
  copyParentTransitions(nodeId, node) {
    const parentGroupId = this.getParentGroupId(nodeId);
    if (parentGroupId != 'group0') {
      const parentTransitions = this.getTransitionsByFromNodeId(parentGroupId);
      for (let parentTransition of parentTransitions) {
        const newTransition = {};
        const toNodeId = parentTransition.to;
        if (this.isGroupNode(toNodeId)) {
          const startId = this.getGroupStartId(toNodeId);
          if (startId == null || startId == '') {
            newTransition.to = toNodeId;
          } else {
            newTransition.to = startId;
          }
        }
        node.transitionLogic.transitions.push(newTransition);
      }
    }
  }

  copyTransitions(previousNode, node) {
    const transitionsJSONString = angular.toJson(previousNode.transitionLogic.transitions);
    const transitionsCopy = angular.fromJson(transitionsJSONString);
    node.transitionLogic.transitions = transitionsCopy;
  }

  /**
   * If the previous node was in a branch path, we will also put the
   * inserted node into the branch path.
   * @param node The node that is in the branch path.
   * @param nodeId The node we are adding to the branch path.
   */
  updateBranchPathTakenConstraints(node, nodeId) {
    this.removeBranchPathTakenNodeConstraintsIfAny(node.id);
    const branchPathTakenConstraints = this.getBranchPathTakenConstraintsByNodeId(nodeId);
    for (let branchPathTakenConstraint of branchPathTakenConstraints) {
      const newConstraint = {
        id: this.getNextAvailableConstraintIdForNodeId(node.id),
        action: branchPathTakenConstraint.action,
        targetId: node.id,
        removalCriteria: this.UtilService.makeCopyOfJSONObject(branchPathTakenConstraint.removalCriteria)
      };
      this.addConstraintToNode(newConstraint);
    }
  }

  /**
   * Update a node's branchPathTaken constraint's fromNodeId and toNodeId
   * @param node update the branch path taken constraints in this node
   * @param currentFromNodeId the current from node id
   * @param currentToNodeId the current to node id
   * @param newFromNodeId the new from node id
   * @param newToNodeId the new to node id
   */
  updateBranchPathTakenConstraint(node, currentFromNodeId, currentToNodeId,
      newFromNodeId, newToNodeId) {
    for (let constraint of node.constraints) {
      for (let removalCriterion of constraint.removalCriteria) {
        if (removalCriterion.name === 'branchPathTaken') {
          const params = removalCriterion.params;
          if (params.fromNodeId === currentFromNodeId &&
            params.toNodeId === currentToNodeId) {
            params.fromNodeId = newFromNodeId;
            params.toNodeId = newToNodeId;
          }
        }
      }
    }
  }

  /**
   * Insert a node into a group
   * @param nodeIdToInsert the node id to insert
   * @param nodeIdToInsertInside the node id of the group we will insert into
   */
  insertNodeInsideInGroups(nodeIdToInsert, nodeIdToInsertInside) {
    const group = this.getNodeById(nodeIdToInsertInside);
    if (group != null) {
      const ids = group.ids;
      if (ids != null) {
        ids.splice(0, 0, nodeIdToInsert);
        group.startId = nodeIdToInsert;
      }
    }
  }

  /**
   * Update the transitions to handle inserting a node as the first step in a group.
   * @param nodeIdToInsert node id that we will insert
   * @param nodeIdToInsertInside the node id of the group we are inserting into
   */
  insertNodeInsideOnlyUpdateTransitions(nodeIdToInsert, nodeIdToInsertInside) {
    if (!this.isGroupNode(nodeIdToInsertInside)) {
      throw 'Error: insertNodeInsideOnlyUpdateTransitions() second parameter must be a group';
    }

    const nodeToInsert = this.getNodeById(nodeIdToInsert);
    nodeToInsert.transitionLogic.transitions = [];
    this.removeBranchPathTakenNodeConstraintsIfAny(nodeIdToInsert);

    if (this.isGroupNode(nodeIdToInsert)) {
      this.updateChildrenTransitionsInAndOutOfGroup(nodeToInsert);
    }

    /*
     * the node will become the first node in the group. this means we need to update any nodes
     * that point to the old start id and make them point to the node we are inserting.
     */
    const group = this.getNodeById(nodeIdToInsertInside);
    const startId = group.startId;
    this.updateTransitionsToStartId(startId, nodeIdToInsert);
    this.updateStepTransitionsToGroup(nodeIdToInsertInside, nodeIdToInsert);
    this.createTransitionFromNodeToInsertToOldStartNode(startId, nodeToInsert);
    const transitions = this.getTransitionsByFromNodeId(nodeIdToInsert);
    if (transitions.length == 0) {
      this.inheritParentTransitions(nodeIdToInsertInside, nodeToInsert);
    }
  }

  /**
   * Copy the transitions from the parent to the node we are inserting.
   * @param nodeIdToInsertInside
   * @param nodeToInsert
   */
  inheritParentTransitions(nodeIdToInsertInside, nodeToInsert) {
    const parentTransitions = this.getTransitionsByFromNodeId(nodeIdToInsertInside);
    for (let parentTransition of parentTransitions) {
      const toNodeId = parentTransition.to;
      if (this.isGroupNode(toNodeId)) {
        const nextGroup = this.getNodeById(toNodeId);
        const startId = nextGroup.startId;
        if (startId == null || startId == '') {
          this.addToTransition(nodeToInsert, toNodeId);
        } else {
          this.addToTransition(nodeToInsert, startId);
        }
      } else {
        this.addToTransition(nodeToInsert, toNodeId);
      }
    }
  }

  /*
   * Create a transition from the node we are inserting to the node that
   * was the start node.
   * @param startId
   * @param nodeToInsert
   */
  createTransitionFromNodeToInsertToOldStartNode(startId, nodeToInsert) {
    const startNode = this.getNodeById(startId);
    if (startNode != null) {
      const transitions = this.getTransitionsByFromNodeId(nodeToInsert.id);
      const transitionObject = {
        to: startId
      };
      transitions.push(transitionObject);
    }
  }

  /*
   * Update all the transitions that point to the group and change
   * them to point to the new start id
   */
  updateStepTransitionsToGroup(nodeIdToInsertInside, nodeIdToInsert) {
    const nodesThatTransitionToGroup = this.getNodesByToNodeId(nodeIdToInsertInside);
    for (let nodeThatTransitionsToGroup of nodesThatTransitionToGroup) {
      if (!this.isGroupNode(nodeThatTransitionsToGroup.id)) {
        this.updateToTransition(nodeThatTransitionsToGroup, nodeIdToInsertInside, nodeIdToInsert);
      }
    }
  }

  updateTransitionsToStartId(startId, nodeIdToInsert) {
    const nodesThatTransitionToStartId = this.getNodesByToNodeId(startId);
    for (let nodeThatTransitionToStartId of nodesThatTransitionToStartId) {
      this.updateToTransition(nodeThatTransitionToStartId, startId, nodeIdToInsert);
    }
  }

  /**
   * Add a transition to a node
   * @param node the node we are adding a transition to
   * @param toNodeId the node id we going to transition to
   * @param criteria (optional) a criteria object specifying
   * what needs to be satisfied in order to use this transition
   */
  addToTransition(node, toNodeId, criteria) {
    if (node != null) {
      if (node.transitionLogic == null) {
        node.transitionLogic = {};
      }
      if (node.transitionLogic.transitions == null) {
        node.transitionLogic.transitions = [];
      }
      const transition = {};
      transition.to = toNodeId;
      if (criteria != null) {
        transition.criteria = criteria;
      }
      node.transitionLogic.transitions.push(transition);
    }
  }

  /**
   * Update the to value of aa transition
   * @param node the node to update
   * @param oldToNodeId the previous to node id
   * @param newToNodeId the new to node id
   */
  updateToTransition(node, oldToNodeId, newToNodeId) {
    if (node != null) {
      if (node.transitionLogic == null) {
        node.transitionLogic = {};
      }

      if (node.transitionLogic.transitions == null) {
        node.transitionLogic.transitions = [];
      }

      const transitions = node.transitionLogic.transitions;
      for (let transition of transitions) {
        if (transition != null) {
          const toNodeId = transition.to;
          if (oldToNodeId === toNodeId) {
            transition.to = newToNodeId;
          }
        }
      }
    }
  }

  /**
   * @param group The group object.
   * @returns {Array} The nodes in the group that do not have transitions.
   */
  getChildNodesWithoutTransitions(group) {
    const lastNodes = [];
    for (let childId of group.ids) {
      const child = this.getNodeById(childId);
      const transitionLogic = child.transitionLogic;
      const transitions = transitionLogic.transitions;
      if (transitions.length == 0) {
        lastNodes.push(child);
      }
    }
    return lastNodes;
  }

  /**
   * Get the next available group id
   * @returns the next available group id
   */
  getNextAvailableGroupId() {
    const groupIds = this.getGroupIds();
    let largestGroupIdNumber = null;
    for (let groupId of groupIds) {
      // get the number from the group id e.g. the number of 'group2' would be 2
      let groupIdNumber = groupId.replace('group', '');

      // make sure the number is an actual number
      if (!isNaN(groupIdNumber)) {
        groupIdNumber = parseInt(groupIdNumber);

        // update the largest group id number if necessary
        if (largestGroupIdNumber == null) {
          largestGroupIdNumber = groupIdNumber;
        } else if (groupIdNumber > largestGroupIdNumber) {
          largestGroupIdNumber = groupIdNumber;
        }
      }
    }

    const nextAvailableGroupId = 'group' + (largestGroupIdNumber + 1);
    return nextAvailableGroupId;
  }

  /**
   * Get all the group ids
   * @returns an array with all the group ids
   */
  getGroupIds() {
    const groupIds = [];
    const groupNodes = this.groupNodes;
    for (let group of groupNodes) {
      if (group != null) {
        const groupId = group.id;
        if (groupId != null) {
          groupIds.push(groupId);
        }
      }
    }

    const inactiveGroupNodes = this.getInactiveGroupNodes();
    for (let inactiveGroup of inactiveGroupNodes) {
      if (inactiveGroup != null) {
        const inactiveGroupId = inactiveGroup.id;
        if (inactiveGroupId != null) {
          groupIds.push(inactiveGroupId);
        }
      }
    }
    return groupIds;
  }

  /**
   * Get the next available node id
   * @param nodeIdsToSkip (optional) An array of additional node ids to not
   * use. This parameter is used in cases where we are creating multiple new
   * nodes at once.
   * Example
   * We ask for two new node ids by calling getNextAvailableNodeId() twice.
   * The first time it returns "node10".
   * If we ask the second time without actually creating and adding node10,
   * it will return "node10" again. If we provide "node10" in the
   * nodeIdsToSkip, then getNextAvailableNodeId() will properly return to us
   * "node11".
   * @returns the next available node id
   */
  getNextAvailableNodeId(nodeIdsToSkip) {
    const nodeIds = this.getNodeIds();
    let largestNodeIdNumber = null;

    for (let nodeId of nodeIds) {
      // get the number from the node id e.g. the number of 'node2' would be 2
      let nodeIdNumber = nodeId.replace('node', '');

      // make sure the number is an actual number
      if (!isNaN(nodeIdNumber)) {
        nodeIdNumber = parseInt(nodeIdNumber);

        // update the largest node id number if necessary
        if (largestNodeIdNumber == null) {
          largestNodeIdNumber = nodeIdNumber;
        } else if (nodeIdNumber > largestNodeIdNumber) {
          largestNodeIdNumber = nodeIdNumber;
        }
      }
    }

    const inactiveNodeIds = this.getInactiveNodeIds();
    for (let inactiveNodeId of inactiveNodeIds) {
      // get the number from the node id e.g. the number of 'node2' would be 2
      let nodeIdNumber = inactiveNodeId.replace('node', '');

      if (!isNaN(nodeIdNumber)) {
        nodeIdNumber = parseInt(nodeIdNumber);

        // update the largest node id number if necessary
        if (largestNodeIdNumber == null) {
          largestNodeIdNumber = nodeIdNumber;
        } else if (nodeIdNumber > largestNodeIdNumber) {
          largestNodeIdNumber = nodeIdNumber;
        }
      }
    }

    if (nodeIdsToSkip != null) {
      for (let nodeIdToSkip of nodeIdsToSkip) {
        // get the number from the node id e.g. the number of 'node2' would be 2
        let nodeIdNumber = nodeIdToSkip.replace('node', '');

        if (!isNaN(nodeIdNumber)) {
          nodeIdNumber = parseInt(nodeIdNumber);

          // update the largest node id number if necessary
          if (largestNodeIdNumber == null) {
            largestNodeIdNumber = nodeIdNumber;
          } else if (nodeIdNumber > largestNodeIdNumber) {
            largestNodeIdNumber = nodeIdNumber;
          }
        }
      }
    }
    return 'node' + (largestNodeIdNumber + 1);
  }

  /**
   * Get all the node ids from steps (not groups)
   * @returns an array with all the node ids
   */
  getNodeIds() {
    const nodeIds = [];
    for (let node of this.applicationNodes) {
      const nodeId = node.id;
      if (nodeId != null) {
        nodeIds.push(nodeId);
      }
    }
    return nodeIds;
  }

  /**
   * Get all the node ids from inactive steps
   * @returns an array with all the inactive node ids
   */
  getInactiveNodeIds() {
    const nodeIds = [];
    const inactiveNodes = this.project.inactiveNodes;
    if (inactiveNodes != null) {
      for (let inactiveNode of inactiveNodes) {
        if (inactiveNode != null) {
          const nodeId = inactiveNode.id;
          if (nodeId != null) {
            nodeIds.push(nodeId);
          }
        }
      }
    }
    return nodeIds;
  }

  /**
   * Move nodes inside a group node
   * @param nodeIds the node ids to move
   * @param nodeId the node id of the group we are moving the nodes inside
   */
  moveNodesInside(nodeIds, nodeId) {
    const movedNodes = [];

    for (let n = 0; n < nodeIds.length; n++) {
      const tempNodeId = nodeIds[n];
      const tempNode = this.getNodeById(tempNodeId);
      movedNodes.push(tempNode);

      const movingNodeIsActive = this.isActive(tempNodeId);
      const stationaryNodeIsActive = this.isActive(nodeId);

      if (movingNodeIsActive && stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideOnlyUpdateTransitions(tempNodeId, nodeId);
          this.insertNodeInsideInGroups(tempNodeId, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.insertNodeAfterInTransitions(tempNode, nodeId);
          this.insertNodeAfterInGroups(tempNodeId, nodeId);
        }
      } else if (movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.moveFromActiveToInactiveInsertInside(tempNode, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.moveToInactive(tempNode, nodeId);
        }
      } else if (!movingNodeIsActive && stationaryNodeIsActive) {
        this.moveToActive(tempNode);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideOnlyUpdateTransitions(tempNodeId, nodeId);
          this.insertNodeInsideInGroups(tempNodeId, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.insertNodeAfterInTransitions(tempNode, nodeId);
          this.insertNodeAfterInGroups(tempNodeId, nodeId);
        }
      } else if (!movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.moveFromInactiveToInactiveInsertInside(tempNode, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.moveInactiveNodeToInactiveSection(tempNode, nodeId);
        }
      }

      /*
       * remember the node id so we can put the next node (if any)
       * after this one
       */
      nodeId = tempNode.id;
    }
    return movedNodes;
  }

  /**
   * Move nodes after a certain node id
   * @param nodeIds the node ids to move
   * @param nodeId the node id we will put the moved nodes after
   */
  moveNodesAfter(nodeIds, nodeId) {
    const movedNodes = [];

    for (let tempNodeId of nodeIds) {
      const node = this.getNodeById(tempNodeId);
      movedNodes.push(node);

      const movingNodeIsActive = this.isActive(tempNodeId);
      const stationaryNodeIsActive = this.isActive(nodeId);

      if (movingNodeIsActive && stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveToInactive(node, nodeId);
      } else if (!movingNodeIsActive && stationaryNodeIsActive) {
        this.moveToActive(node);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (!movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveInactiveNodeToInactiveSection(node, nodeId);
      }

      // remember the node id so we can put the next node (if any) after this one
      nodeId = node.id;
    }
    return movedNodes;
  }

  /**
   * Copy the node with the specified nodeId
   * @param nodeId the node id to copy
   * @return copied node
   */
  copyNode(nodeId) {
    const node = this.getNodeById(nodeId);
    const nodeCopy = this.UtilService.makeCopyOfJSONObject(node);
    nodeCopy.id = this.getNextAvailableNodeId();
    nodeCopy.transitionLogic = {};  // clear transition logic
    nodeCopy.constraints = [];  // clear constraints

    const newComponentIds = [];
    for (let component of nodeCopy.components) {
      const newComponentId = this.getUnusedComponentId(newComponentIds);
      newComponentIds.push(newComponentId);
      component.id = newComponentId;
    }
    return nodeCopy;
  }

  /**
   * Delete a node from the project and update transitions.
   *
   * If we are deleting the project start node id, we will need
   * to change it to the next logical node id that will be used
   * as the project start.
   *
   * @param nodeId the node id to delete from the project. It can be a step
   * or an activity.
   */
  deleteNode(nodeId) {
    const parentGroup = this.getParentGroup(nodeId);
    if (parentGroup.startId === nodeId) {
      this.setGroupStartIdToNextChildId(parentGroup)
    }

    if (this.isProjectStartNodeIdOrContainsProjectStartNodeId(nodeId)) {
      this.updateProjectStartNodeIdToNextLogicalNode(nodeId);
    }

    if (this.isGroupNode(nodeId)) {
      this.removeChildNodes(nodeId);
    }

    this.removeNodeIdFromTransitions(nodeId);
    this.removeNodeIdFromGroups(nodeId);
    this.removeNodeIdFromNodes(nodeId);
  }

  updateProjectStartNodeIdToNextLogicalNode(nodeId) {
    if (this.isGroupNode(nodeId)) {
      this.updateProjectStartNodeIdToNextLogicalNodeForRemovingGroup(nodeId);
    } else {
      this.updateProjectStartNodeIdToNextLogicalNodeForRemovingStep(nodeId);
    }
  }

  /**
   * Set the startNodeId of the specified group to the first node of the next group.
   * If the next group doesn't have any nodes, startNodeId should point
   * to the next group.
   */
  updateProjectStartNodeIdToNextLogicalNodeForRemovingGroup(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    if (transitions.length == 0) {
      this.setStartNodeId('group0');
    } else {
      let nextNodeId = transitions[0].to;
      if (this.isGroupNode(nextNodeId)) {
        const nextGroupStartId = this.getGroupStartId(nextNodeId);
        if (nextGroupStartId == null) {
          this.setStartNodeId(nextNodeId);
        } else {
          this.setStartNodeId(nextGroupStartId);
        }
      } else {
        this.setStartNodeId(nextNodeId);
      }
    }
  }

  /**
   * Set the startNodeId to the next node in the transitions.
   * If there are no transitions, set it to the parent group of the node.
   */
  updateProjectStartNodeIdToNextLogicalNodeForRemovingStep(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    const parentGroupId = this.getParentGroupId(nodeId);
    if (transitions.length == 0) {
      this.setStartNodeId(parentGroupId);
    } else {
      let nextNodeId = transitions[0].to;
      if (this.isNodeInGroup(nextNodeId, parentGroupId)) {
        this.setStartNodeId(nextNodeId);
      } else {
        this.setStartNodeId(this.getParentGroupId(nodeId));
      }
    }
  }

  setGroupStartIdToNextChildId(group) {
    let hasSetNewStartId = false;
    const transitions = this.getTransitionsByFromNodeId(group.startId);
    if (transitions.length > 0) {
      const transition = transitions[0];
      const toNodeId = transition.to;
      if (this.isNodeInGroup(toNodeId, group.id)) {
        group.startId = toNodeId;
        hasSetNewStartId = true;
      }
    }

    if (!hasSetNewStartId) {
      group.startId = '';
    }
  }

  removeChildNodes(groupId) {
    const group = this.getNodeById(groupId);
    for (let i = 0; i < group.ids.length; i++) {
      const childId = group.ids[i];
      this.removeNodeIdFromTransitions(childId);
      this.removeNodeIdFromGroups(childId);
      this.removeNodeIdFromNodes(childId);
      i--; // so it won't skip the next element
    }
  }

  isProjectStartNodeIdOrContainsProjectStartNodeId(nodeId) {
    return this.getStartNodeId() === nodeId ||
      (this.isGroupNode(nodeId) && this.containsStartNodeId(nodeId));
  }

  containsStartNodeId(groupId) {
    const group = this.getNodeById(groupId);
    const projectStartNodeId = this.getStartNodeId();
    for (let childId of group.ids) {
      if (childId === projectStartNodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update the transitions to handle removing a node
   * @param nodeId the node id to remove
   */
  removeNodeIdFromTransitions(nodeId) {
    const nodeToRemove = this.getNodeById(nodeId);
    const nodesByToNodeId = this.getNodesByToNodeId(nodeId);

    const nodeToRemoveTransitionLogic = nodeToRemove.transitionLogic;
    let nodeToRemoveTransitions = [];

    if (nodeToRemoveTransitionLogic != null && nodeToRemoveTransitionLogic.transitions != null) {
      nodeToRemoveTransitions = nodeToRemoveTransitionLogic.transitions;
    }

    const parentIdOfNodeToRemove = this.getParentGroupId(nodeId);
    const parentGroup = this.getNodeById(parentIdOfNodeToRemove);

    // update the start id if we are removing the start node of a group
    if (parentGroup != null) {
      const parentGroupStartId = parentGroup.startId;
      if (parentGroupStartId != null) {
        if (parentGroupStartId === nodeId) {
          // the node we are removing is the start node

          if (nodeToRemoveTransitions != null && nodeToRemoveTransitions.length > 0) {
            for (let nodeToRemoveTransition of nodeToRemoveTransitions) {
              if (nodeToRemoveTransition != null) {
                const toNodeId = nodeToRemoveTransition.to;
                if (toNodeId != null) {
                  /*
                   * we need to check that the to node id is in the
                   * same group. some transitions point to a node id
                   * in the next group which we would not want to use
                   * for the start id.
                   */
                  if (this.getParentGroupId(toNodeId) == parentIdOfNodeToRemove) {
                    // set the new start id
                    parentGroup.startId = toNodeId;
                  }
                }
              }
            }
          } else {
            // there are no transitions so we will have an empty start id
            parentGroup.startId = '';
          }
        }
      }
    }

    for (let n = 0; n < nodesByToNodeId.length; n++) {
      const node = nodesByToNodeId[n];
      if (node != null) {
        const parentIdOfFromNode = this.getParentGroupId(node.id);
        const transitionLogic = node.transitionLogic;

        if (transitionLogic != null) {
          const transitions = transitionLogic.transitions;
          for (let t = 0; t < transitions.length; t++) {
            const transition = transitions[t];
            if (nodeId === transition.to) {
              // we have found the transition to the node we are removing

              // copy the transitions from the node we are removing
              let transitionsCopy = angular.toJson(nodeToRemoveTransitions);
              transitionsCopy = angular.fromJson(transitionsCopy);

              /*
               * if the parent from group is different than the parent removing group
               * remove transitions that are to a node in a different group than
               * the parent removing group
               */

              if (parentIdOfFromNode != parentIdOfNodeToRemove) {
                for (let tc = 0; tc < transitionsCopy.length; tc++) {
                  const tempTransition = transitionsCopy[tc];
                  if (tempTransition != null) {
                    const tempToNodeId = tempTransition.to;
                    if (tempToNodeId != null) {
                      const parentIdOfToNode = this.getParentGroupId(tempToNodeId);
                      if (parentIdOfNodeToRemove != parentIdOfToNode) {
                        // remove the transition
                        transitionsCopy.splice(tc, 1);
                        tc--;
                      }
                    }
                  }
                }
              }

              if (this.isFirstNodeInBranchPath(nodeId)) {
                /*
                 * Get the node ids that have a branchPathTaken
                 * constraint from the before node and to the node
                 * we are removing. If there are any, we need to
                 * update the branchPathTaken constraint with the
                 * next nodeId that comes after the node we are
                 * removing.
                 */
                const nodeIdsInBranch = this.getNodeIdsInBranch(node.id, nodeId);

                if (nodeIdsInBranch != null) {
                  for (let nodeIdInBranch of nodeIdsInBranch) {
                    const nodeInBranch = this.getNodeById(nodeIdInBranch);
                    for (let transitionCopy of transitionsCopy) {
                      if (transitionCopy != null) {
                        const currentFromNodeId = node.id;
                        const currentToNodeId = nodeId;
                        const newFromNodeId = node.id;
                        const newToNodeId = transitionCopy.to;

                        /*
                         * change the branch path taken constraint by changing
                         * the toNodeId
                         */
                        this.updateBranchPathTakenConstraint(nodeInBranch, currentFromNodeId, currentToNodeId, newFromNodeId, newToNodeId);
                      }
                    }
                  }
                }
              } else if (this.isBranchPoint(nodeId)) {
                /*
                 * get all the branches that have the node we
                 * are removing as the start point
                 */
                const branches = this.getBranchesByBranchStartPointNodeId(nodeId);

                for (let branch of branches) {
                  if (branch != null) {
                    /*
                     * get the branch paths. these paths do not
                     * contain the start point or merge point.
                     */
                    const branchPaths = branch.branchPaths;

                    if (branchPaths != null) {
                      for (let branchPath of branchPaths) {
                        if (branchPath != null) {
                          const currentFromNodeId = nodeId;
                          const currentToNodeId = branchPath[0];
                          const newFromNodeId = node.id;
                          const newToNodeId = branchPath[0];
                          for (let branchPathNodeId of branchPath) {
                            const branchPathNode = this.getNodeById(branchPathNodeId);
                            this.updateBranchPathTakenConstraint(branchPathNode, currentFromNodeId, currentToNodeId, newFromNodeId, newToNodeId);
                          }
                        }
                      }
                    }
                  }
                }
              }

              // remove the transition to the node we are removing
              transitions.splice(t, 1);

              if (transitionsCopy != null) {
                let insertIndex = t;

                /*
                 * loop through all the transitions from the node we are removing
                 * and insert them into the transitions of the from node
                 * e.g.
                 * the node that comes before the node we are removing has these transitions
                 * "transitions": [
                 *     {
                 *         "to": "node4"
                 *     },
                 *     {
                 *         "to": "node6"
                 *     }
                 * ]
                 *
                 * we are removing node4. node4 has a transition to node5.
                 *
                 * the node that comes before the node we are removing now has these transitions
                 * "transitions": [
                 *     {
                 *         "to": "node5"
                 *     },
                 *     {
                 *         "to": "node6"
                 *     }
                 * ]
                 */
                for (let transitionCopy of transitionsCopy) {
                  // insert a transition from the node we are removing
                  transitions.splice(insertIndex, 0, transitionCopy);
                  insertIndex++;
                }
              }

              // check if the node we are moving is a group
              if (this.isGroupNode(nodeId)) {
                /*
                 * we are moving a group so we need to update transitions that
                 * go into the group
                 */
                const groupIdWeAreMoving = nodeId;
                const groupThatTransitionsToGroupWeAreMoving = node;
                this.updateChildrenTransitionsIntoGroupWeAreMoving(groupThatTransitionsToGroupWeAreMoving, groupIdWeAreMoving);
              }
            }
          }

          if (this.isBranchPoint(nodeId)) {
            /*
             * the node we are deleting is a branch point so we to
             * copy the transition logic to the node that comes
             * before it
             */
            node.transitionLogic = this.UtilService.makeCopyOfJSONObject(nodeToRemoveTransitionLogic);

            /*
             * set the transitions for the node that comes before
             * the one we are removing
             */
            node.transitionLogic.transitions = transitions;
          }
        }
      }
    }

    if (nodeToRemoveTransitionLogic != null) {
      nodeToRemoveTransitionLogic.transitions = [];
    }

    if (this.isGroupNode(nodeId)) {
      this.removeTransitionsOutOfGroup(nodeId);
    }
  };

  /**
   * Remove the node id from all groups
   * @param nodeId the node id to remove
   */
  removeNodeIdFromGroups(nodeId) {
    for (let group of this.getGroupNodes()) {
      this.removeNodeIdFromGroup(group, nodeId);
    }
    for (let inactiveGroup of this.getInactiveGroupNodes()) {
      this.removeNodeIdFromGroup(inactiveGroup, nodeId);
    }
  }

  /**
   * Remove a node from a group.
   * If the node is a start node of the group, update the group's start node to
   * the next node in the group after removing.
   * @param group The group to remove from.
   * @param nodeId The node id to remove.
   */
  removeNodeIdFromGroup(group, nodeId) {
    const ids = group.ids;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id === nodeId) {
        ids.splice(i, 1);
        if (id === group.startId) {
          this.shiftGroupStartNodeByOne(group);
        }
      }
    }
  }

  // TODO handle the case when the start node of the group is a branch point
  shiftGroupStartNodeByOne(group) {
    const transitionsFromStartNode =
        this.getTransitionsByFromNodeId(group.startId);
    if (transitionsFromStartNode.length > 0) {
      group.startId = transitionsFromStartNode[0].to;
    } else {
      group.startId = '';
    }
  }

  /**
   * Remove the node from the array of nodes
   * @param nodeId the node id to remove
   */
  removeNodeIdFromNodes(nodeId) {
    const nodes = this.project.nodes;
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n];
      if (node != null) {
        if (nodeId === node.id) {
          nodes.splice(n, 1);
        }
      }
    }

    const inactiveNodes = this.project.inactiveNodes;
    if (inactiveNodes != null) {
      for (let i = 0; i < inactiveNodes.length; i++) {
        const inactiveNode = inactiveNodes[i];
        if (inactiveNode != null) {
          if (nodeId === inactiveNode.id) {
            inactiveNodes.splice(i, 1);
          }
        }
      }
    }

    this.idToNode[nodeId] = null;
  }

  /**
   * Remove the node from the inactive nodes array
   * @param nodeId the node to remove from the inactive nodes array
   */
  removeNodeIdFromInactiveNodes(nodeId) {
    const inactiveNodes = this.project.inactiveNodes;
    if (inactiveNodes != null) {
      for (let i = 0; i < inactiveNodes.length; i++) {
        const inactiveNode = inactiveNodes[i];
        if (inactiveNode != null) {
          const inactiveNodeId = inactiveNode.id;
          if (inactiveNodeId === nodeId) {
            inactiveNodes.splice(i, 1);
          }
        }
      }
    }
  }

  /**
   * Create a new component
   * @param nodeId the node id to create the component in
   * @param componentType the component type
   * @param insertAfterComponentId Insert the new compnent after the given
   * component id. If this argument is null, we will place the new component
   * in the first position.
   */
  createComponent(nodeId, componentType, insertAfterComponentId) {
    let component = null;
    if (nodeId != null && componentType != null) {
      const node = this.getNodeById(nodeId);
      const service = this.$injector.get(componentType + 'Service');
      if (node != null && service != null) {
        component = service.createComponent();

        if (service.componentHasWork()) {
          /*
           * the component has student work so we will need to
           * determine if we need to show the save button on the
           * component or the step
           */

          if (node.showSaveButton == true) {
            /*
             * the step is showing a save button so we will not show
             * the save button on this new component
             */
          } else {
            if (this.doesAnyComponentInNodeShowSubmitButton(node.id)) {
              /*
               * at least one of the other components in the step are
               * showing a submit button so we will also show the save
               * button on this new component
               */
              component.showSaveButton = true;
            } else {
              /*
               * none of the other components are showing a submit button
               * so we will show the save button on the step
               */
              node.showSaveButton = true;
            }
          }
        }
        this.addComponentToNode(node, component, insertAfterComponentId);
      }
    }
    return component;
  }

  /**
   * Returns true iff any component in the step generates work
   * @param nodeId the node id
   * @return whether any components in the step generates work
   */
  doesAnyComponentHaveWork(nodeId) {
    const node = this.getNodeById(nodeId);
    for (let component of node.components) {
      const service = this.$injector.get(component.type + 'Service');
      if (service != null && service.componentHasWork()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if any of the components in the node are showing their submit button.
   * @param nodeId {string} The node id to check.
   * @return {boolean} Whether any of the components in the node show their submit button.
   */
  doesAnyComponentInNodeShowSubmitButton(nodeId) {
    const node = this.getNodeById(nodeId);
    for (let component of node.components) {
      if (component.showSubmitButton == true) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add the component to the node
   * @param node the node
   * @param component the component
   * @param insertAfterComponentId Insert the component after this given
   * component id. If this argument is null, we will place the new component
   * in the first position.
   */
  addComponentToNode(node, component, insertAfterComponentId) {
    if (node != null && component != null) {
      if (insertAfterComponentId == null) {
        /*
         * insertAfterComponentId is null so we will place the new
         * component in the first position
         */
        node.components.splice(0, 0, component);
      } else {
        // place the new component after the insertAfterComponentId

        // boolean flag for whether we have added the component yet
        let added = false;

        const components = node.components;
        for (let c = 0; c < components.length; c++) {
          const tempComponent = components[c];
          if (tempComponent != null && tempComponent.id != null &&
              tempComponent.id == insertAfterComponentId) {
            /*
             * we have found the component we want to add the new
             * one after
             */

            components.splice(c + 1, 0, component);
            added = true;
            break;
          }
        }

        if (!added) {
          /*
           * the component has not been added yet so we will just add
           * it at the end
           */
          node.components.push(component);
        }
      }
    }
  }

  /**
   * Move the component(s) within the node
   * @param nodeId we are moving component(s) in this node
   * @param componentIds the component(s) we are moving
   * @param insertAfterComponentId Insert the component(s) after this given
   * component id. If this argument is null, we will place the new
   * component(s) in the first position.
   */
  moveComponent(nodeId, componentIds, insertAfterComponentId) {
    const node = this.getNodeById(nodeId);
    const components = node.components;
    const componentsToMove = [];

    // remove the component(s)
    for (let a = components.length - 1; a >= 0; a--) {
      const tempComponent = components[a];
      if (tempComponent != null) {
        if (componentIds.indexOf(tempComponent.id) != -1) {
          // we have found a component we want to move

          // add the component to our array of components we are moving
          componentsToMove.splice(0, 0, tempComponent);

          // remove the component from the components array in the node
          components.splice(a, 1);
        }
      }
    }

    // insert the component(s)
    if (insertAfterComponentId == null) {
      // insert the components at the beginning of the components list

      for (let c = 0; c < componentsToMove.length; c++) {
        // insert a component
        components.splice(c, 0, componentsToMove[c]);
      }
    } else {
      // insert the component(s) after the given insertAfterComponentId

      for (let b = 0; b < components.length; b++) {
        const tempComponent = components[b];
        if (tempComponent != null && tempComponent.id == insertAfterComponentId) {
          // we have found the component we want to add after

          for (let c = 0; c < componentsToMove.length; c++) {
            // insert a component
            components.splice(b + 1 + c, 0, componentsToMove[c]);
          }
          break;
        }
      }
    }
    return componentsToMove;
  }

  /**
   * Delete the component
   * @param nodeId the node id
   * @param componentId the component id
   */
  deleteComponent(nodeId, componentId) {
    // TODO refactor and move to authoringToolProjectService
    if (nodeId != null && componentId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const components = node.components;
        if (components != null) {
          for (let c = 0; c < components.length; c++) {
            const component = components[c];
            if (component.id === componentId) {
              components.splice(c, 1);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * TODO: Deprecated, should be removed; replaced by getMaxScoreForWorkgroupId in StudentStatusService
   * Get the max score for the project. If the project contains branches, we
   * will only calculate the max score for a single path from the first node
   * to the last node in the project.
   * @returns the max score for the project or null if none of the components in the project
   * has max scores.
   */
  getMaxScore() {
    let maxScore = null;
    const startNodeId = this.getStartNodeId();

    // get all the paths in the project
    const allPaths = this.getAllPaths([], startNodeId);

    if (allPaths != null && allPaths.length > 0) {
      const firstPath = allPaths[0];
      for (let nodeId of firstPath) {
        const nodeMaxScore = this.getMaxScoreForNode(nodeId);
        if (nodeMaxScore != null) {
          if (maxScore == null) {
            maxScore = nodeMaxScore;
          } else {
            maxScore += nodeMaxScore;
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score for the node
   * @param nodeId the node id which can be a step or an activity
   * @returns the max score for the node which can be null or a number
   * if null, author/teacher has not set a max score for the node
   */
  getMaxScoreForNode(nodeId) {
    let maxScore = null;
    if (!this.isGroupNode(nodeId)) {
      const node = this.getNodeById(nodeId);
      for (let component of node.components) {
        const componentMaxScore = component.maxScore;
        if (typeof componentMaxScore == 'number') {
          if (maxScore == null) {
            maxScore = componentMaxScore;
          } else {
            maxScore += componentMaxScore;
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score for a component
   * @param nodeId get the max score from a component in this node
   * @param componentId get the max score from this component
   */
  getMaxScoreForComponent(nodeId, componentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      return component.maxScore;
    }
    return null;
  }

  /**
   * Set the max score for a component
   * @param nodeId set the max score from a component in this node
   * @param componentId set the max score from this component
   * @param maxScore set it to this maxScore
   */
  setMaxScoreForComponent(nodeId, componentId, maxScore) {
    if (nodeId != null && componentId != null && maxScore != null && typeof maxScore === 'number') {
      let component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        component.maxScore = maxScore;
      }
    }
  }

  /**
   * Determine if a node id is a direct child of a group
   * @param nodeId the node id
   * @param groupId the group id
   */
  isNodeInGroup(nodeId, groupId) {
    const group = this.getNodeById(groupId);
    return group.ids.indexOf(nodeId) != -1;
  }

  /**
   * Get the first leaf node by traversing all the start ids
   * until a leaf node id is found
   */
  getFirstLeafNodeId() {
    let firstLeafNodeId = null;
    const startGroupId = this.project.startGroupId;
    let node = this.getNodeById(startGroupId);
    let done = false;

    // loop until we have found a leaf node id or something went wrong
    while (!done) {
      if (node == null) {
        done = true;
      } else if (this.isGroupNode(node.id)) {
        firstLeafNodeId = node.id;
        node = this.getNodeById(node.startId);
      } else if (this.isApplicationNode(node.id)) {
        firstLeafNodeId = node.id;
        done = true;
      } else {
        done = true;
      }
    }
    return firstLeafNodeId;
  }

  /**
   * Replace a node. This is used when we want to revert a node back to a
   * previous version in the authoring tool.
   * @param nodeId the node id
   * @param node the node object
   */
  replaceNode(nodeId, node) {
    if (nodeId != null && node != null) {
      this.setIdToNode(nodeId, node);
      this.setIdToElement(nodeId, node);
      const nodes = this.getNodes();
      if (nodes != null) {
        for (let n = 0; n < nodes.length; n++) {
          const tempNode = nodes[n];
          if (tempNode != null) {
            const tempNodeId = tempNode.id;
            if (nodeId === tempNodeId) {
              nodes.splice(n, 1, node);
              break;
            }
          }
        }
      }

      const applicationNodes = this.applicationNodes;
      if (applicationNodes != null) {
        for (let a = 0; a < applicationNodes.length; a++) {
          const tempApplicationNode = applicationNodes[a];
          if (tempApplicationNode != null) {
            const tempApplicationNodeId = tempApplicationNode.id;
            if (nodeId === tempApplicationNodeId) {
              applicationNodes.splice(a, 1, node);
            }
          }
        }
      }
    }
  }

  /**
   * Get the message that describes how to disable the constraint
   * @param nodeId the node the student is trying to go to
   * @param constraint the constraint that is preventing the student
   * from going to the node
   * @returns the message to display to the student that describes how
   * to disable the constraint
   */
  getConstraintMessage(nodeId, constraint) {
    let message = '';

    if (nodeId != null && constraint != null) {
      // get the node title the student is trying to go to
      const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);

      const removalConditional = constraint.removalConditional;
      const removalCriteria = constraint.removalCriteria;

      if (removalCriteria != null) {
        let criteriaMessages = '';
        for (let tempRemovalCriteria of removalCriteria) {
          if (tempRemovalCriteria != null) {
            // get the message that describes the criteria that needs to be satisfied
            const criteriaMessage = this.getCriteriaMessage(tempRemovalCriteria);

            if (criteriaMessage != null && criteriaMessage != '') {
              // separate criteria messages with a line break
              if (criteriaMessages != '') {
                criteriaMessages += '<br/>';
              }
              criteriaMessages += criteriaMessage;
            }
          }
        }
        message += criteriaMessages;
      }
    }
    return message;
  }

  /**
   * Get the human readable description of the constraint.
   * @param constraint The constraint object.
   * @returns A human readable text string that describes the constraint.
   * example
   * 'All steps after this one will not be visitable until the student completes "3.7 Revise Your Bowls Explanation"'
   */
  getConstraintDescription(constraint) {
    let message = '';
    let action = constraint.action;
    let actionMessage = this.getActionMessage(action);
    for (let singleRemovalCriteria of constraint.removalCriteria) {
      if (message != '') {
        // this constraint has multiple removal criteria
        if (constraint.removalConditional == 'any') {
          message += ' or ';
        } else if (constraint.removalConditional == 'all') {
          message += ' and ';
        }
      }
      message += this.getCriteriaMessage(singleRemovalCriteria);
    }
    message = actionMessage + message;
    return message;
  }

  /**
   * Get the constraint action as human readable text.
   * @param action A constraint action.
   * @return A human readable text string that describes the action
   * example
   * 'All steps after this one will not be visitable until '
   */
  getActionMessage(action) {
    if (action == 'makeAllNodesAfterThisNotVisitable') {
      return this.$translate('allStepsAfterThisOneWillNotBeVisitableUntil');
    } else if (action == 'makeAllNodesAfterThisNotVisible') {
      return this.$translate('allStepsAfterThisOneWillNotBeVisibleUntil');
    } else if (action == 'makeAllOtherNodesNotVisitable') {
      return this.$translate('allOtherStepsWillNotBeVisitableUntil');
    } else if (action == 'makeAllOtherNodesNotVisible') {
      return this.$translate('allOtherStepsWillNotBeVisibleUntil');
    } else if (action == 'makeThisNodeNotVisitable') {
      return this.$translate('thisStepWillNotBeVisitableUntil');
    } else if (action == 'makeThisNodeNotVisible') {
      return this.$translate('thisStepWillNotBeVisibleUntil');
    }
  }

  /**
   * Get the message that describes how to satisfy the criteria
   * TODO: check if the criteria is satisfied
   * @param criteria the criteria object that needs to be satisfied
   * @returns the message to display to the student that describes how to
   * satisfy the criteria
   */
  getCriteriaMessage(criteria) {
    let message = '';

    if (criteria != null) {
      const name = criteria.name;
      const params = criteria.params;

      if (name === 'isCompleted') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('completeNodeTitle', { nodeTitle: nodeTitle });
        }
      } else if (name === 'isVisited') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('visitNodeTitle', { nodeTitle: nodeTitle });
        }
      } else if (name === 'isCorrect') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('correctlyAnswerNodeTitle', { nodeTitle: nodeTitle });
        }
      } else if (name === 'score') {
        const nodeId = params.nodeId;
        let nodeTitle = '';
        let scoresString = '';

        if (nodeId != null) {
          nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        }

        const scores = params.scores;
        if (scores != null) {
          // get the required score
          scoresString = scores.join(', ');
        }

        // generate the message
        message += this.$translate('obtainAScoreOfXOnNodeTitle', { score: scoresString, nodeTitle: nodeTitle });
      } else if (name === 'choiceChosen') {
        const nodeId = params.nodeId;
        const componentId = params.componentId;
        const choiceIds = params.choiceIds;
        let nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        let choices = this.getChoiceTextByNodeIdAndComponentId(nodeId, componentId, choiceIds);
        let choiceText = choices.join(', ');
        message += this.$translate('chooseChoiceOnNodeTitle', { choiceText: choiceText, nodeTitle: nodeTitle });
      } else if (name === 'usedXSubmits') {
        const nodeId = params.nodeId;
        let nodeTitle = '';

        const requiredSubmitCount = params.requiredSubmitCount;

        if (nodeId != null) {
          nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        }

        if (requiredSubmitCount == 1) {
          message += this.$translate('submitXTimeOnNodeTitle', { requiredSubmitCount: requiredSubmitCount, nodeTitle: nodeTitle });
        } else {
          message += this.$translate('submitXTimesOnNodeTitle', { requiredSubmitCount: requiredSubmitCount, nodeTitle: nodeTitle });
        }
      } else if (name === 'branchPathTaken') {
        const fromNodeId = params.fromNodeId;
        const fromNodeTitle = this.getNodePositionAndTitleByNodeId(fromNodeId);
        const toNodeId = params.toNodeId;
        const toNodeTitle = this.getNodePositionAndTitleByNodeId(toNodeId);
        message += this.$translate('branchPathTakenFromTo', { fromNodeTitle: fromNodeTitle, toNodeTitle: toNodeTitle });
      } else if (name === 'isPlanningActivityCompleted') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('completeNodeTitle', { nodeTitle: nodeTitle });
        }
      } else if (name === 'wroteXNumberOfWords') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const requiredNumberOfWords = params.requiredNumberOfWords;
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('writeXNumberOfWordsOnNodeTitle',
              { requiredNumberOfWords: requiredNumberOfWords, nodeTitle: nodeTitle });
        }
      } else if (name === 'isVisible') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('nodeTitleIsVisible', { nodeTitle: nodeTitle });
        }
      } else if (name === 'isVisitable') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.$translate('nodeTitleIsVisitable', { nodeTitle: nodeTitle });
        }
      } else if (name === 'addXNumberOfNotesOnThisStep') {
        const nodeId = params.nodeId;
        const requiredNumberOfNotes = params.requiredNumberOfNotes;
        const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        if (requiredNumberOfNotes == 1) {
          message += this.$translate('addXNumberOfNotesOnThisStepSingular',
            { requiredNumberOfNotes: requiredNumberOfNotes, nodeTitle: nodeTitle });
        } else {
          message += this.$translate('addXNumberOfNotesOnThisStepPlural',
            { requiredNumberOfNotes: requiredNumberOfNotes, nodeTitle: nodeTitle });
        }
      } else if (name === 'fillXNumberOfRows') {
        const requiredNumberOfFilledRows = params.requiredNumberOfFilledRows;
        const nodeId = params.nodeId;
        const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        if (requiredNumberOfFilledRows == 1) {
          message += this.$translate('youMustFillInXRow',
            { requiredNumberOfFilledRows: requiredNumberOfFilledRows, nodeTitle: nodeTitle });
        } else {
          message += this.$translate('youMustFillInXRows',
            { requiredNumberOfFilledRows: requiredNumberOfFilledRows, nodeTitle: nodeTitle });
        }
      }
    }
    return message;
  }

  /**
   * Get the choices of a Multiple Choice component.
   * @param nodeId The node id.
   * @param componentId The component id.
   * @return The choices from the component.
   */
  getChoicesByNodeIdAndComponentId(nodeId, componentId) {
    let choices = [];
    let component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null && component.choices != null) {
      choices = component.choices;
    }
    return choices;
  }

  /**
   * Get the choice text for the given choice ids of a multiple choice component.
   * @param nodeId The node id of the component.
   * @param componentId The component id of the component.
   * @param choiceIds An array of choice ids.
   * @return An array of choice text strings.
   */
  getChoiceTextByNodeIdAndComponentId(nodeId, componentId, choiceIds) {
    let choices = this.getChoicesByNodeIdAndComponentId(nodeId, componentId);
    let choicesText = [];
    for (let choice of choices) {
      if (choiceIds.indexOf(choice.id) != -1) {
        choicesText.push(choice.text);
      }
    }
    return choicesText;
  }

  /**
   * Get the start id of a group
   * @param nodeId get the start id of this group
   * @returns the start id of the group
   */
  getGroupStartId(nodeId) {
    const node = this.getNodeById(nodeId);
    return node.startId;
  }

  /**
   * Get the start id of the node's parent group
   * @param nodeId we will get the parent of this node and then look
   * for the start id of the parent
   * @returns the start id of the parent
   */
  getParentGroupStartId(nodeId) {
    if (nodeId != null) {
      const parentGroup = this.getParentGroup(nodeId);
      if (parentGroup != null) {
        return parentGroup.startId;
      }
    }
    return null;
  }

  /**
   * Update the transitions so that the fromGroup points to the newToGroup
   *
   * Before
   * fromGroup -> oldToGroup -> newToGroup
   *
   * After
   * fromGroup -> newToGroup
   * oldToGroup becomes dangling and has no transitions to or from it
   */
  updateTransitionsForExtractingGroup(fromGroupId, oldToGroupId, newToGroupId) {
    /*
     * make the transitions
     * fromGroup -> newToGroup
     */
    if (fromGroupId != null && oldToGroupId != null) {
      const fromGroup = this.getNodeById(fromGroupId);
      const oldToGroup = this.getNodeById(oldToGroupId);
      let newToGroup = null;
      let newToGroupStartId = null;

      if (newToGroupId != null) {
        newToGroup = this.getNodeById(newToGroupId);
      }

      if (newToGroup != null) {
        newToGroupStartId = newToGroup.startId;
      }

      if (fromGroup != null && oldToGroup != null) {
        const childIds = fromGroup.ids;

        // update the children of the from group to point to the new to group
        if (childIds != null) {
          for (let childId of childIds) {
            const child = this.getNodeById(childId);
            const transitions = this.getTransitionsByFromNodeId(childId);

            if (transitions != null) {
              for (let t = 0; t < transitions.length; t++) {
                const transition = transitions[t];
                if (transition != null) {
                  const toNodeId = transition.to;
                  if (toNodeId === oldToGroupId) {
                    // the transition is to the group
                    if (newToGroupId == null && newToGroupStartId == null) {
                      // there is no new to group so we will remove the transition
                      transitions.splice(t, 1);
                      t--;
                    } else {
                      // make the transition point to the new to group
                      transition.to = newToGroupId;
                    }
                  } else if (this.isNodeInGroup(toNodeId, oldToGroupId)) {
                    // the transition is to a node in the group
                    if (newToGroupId == null && newToGroupStartId == null) {
                      // there is no new to group so we will remove the transition
                      transitions.splice(t, 1);
                      t--;
                    } else if (newToGroupStartId == null || newToGroupStartId == '') {
                      // make the transition point to the new to group
                      transition.to = newToGroupId;
                    } else {
                      // make the transition point to the new group start id
                      transition.to = newToGroupStartId;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /*
     * remove the transitions from the oldToGroup
     */
    if (oldToGroupId != null && newToGroupId != null) {
      const oldToGroup = this.getNodeById(oldToGroupId);
      if (oldToGroup != null) {
        const childIds = oldToGroup.ids;

        // remove the transitions from the old to group that point to the new to group
        if (childIds != null) {
          for (let childId of childIds) {
            const child = this.getNodeById(childId);
            const transitions = this.getTransitionsByFromNodeId(childId);
            if (transitions != null) {
              for (let t = 0; t < transitions.length; t++) {
                const transition = transitions[t];
                if (transition != null) {
                  const toNodeId = transition.to;
                  if (toNodeId === newToGroupId) {
                    // the transition is to the group so we will remove it
                    transitions.splice(t, 1);
                    t--;
                  } else if (this.isNodeInGroup(toNodeId, newToGroupId)) {
                    // the transition is to a node in the group so we will remove it
                    transitions.splice(t, 1);
                    t--;
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
   * Update the transitions so that the fromGroup points to the newToGroup
   *
   * Before
   * fromGroup -> oldToGroup
   * newToGroup is dangling and has no transitions to or from it
   *
   * After
   * fromGroup -> newToGroup -> oldToGroup
   */
  updateTransitionsForInsertingGroup(fromGroupId, oldToGroupIds, newToGroupId) {
    let fromGroup = null;
    let newToGroup = null;
    if (fromGroupId != null) {
      fromGroup = this.getNodeById(fromGroupId);
    }

    if (newToGroupId != null) {
      newToGroup = this.getNodeById(newToGroupId);
    }

    /*
     * make the transitions that point to the old group now point
     * to the new group
     * fromGroup -> newToGroup
     */
    if (fromGroup != null && newToGroup != null) {
      const childIds = fromGroup.ids;
      const newToGroupStartId = newToGroup.startId;
      if (childIds != null) {
        for (let childId of childIds) {
          const child = this.getNodeById(childId);

          // get the transitions from the child
          const transitions = this.getTransitionsByFromNodeId(childId);

          if (transitions == null || transitions.length == 0) {
            /*
             * the child does not have any transitions so we will make it
             * point to the new group
             */
            if (newToGroupStartId == null || newToGroupStartId == '') {
              this.addToTransition(child, newToGroupId);
            } else {
              this.addToTransition(child, newToGroupStartId)
            }
          } else if (transitions != null) {
            for (let transition of transitions) {
              if (transition != null) {
                const toNodeId = transition.to;
                if (oldToGroupIds != null) {
                  for (let oldToGroupId of oldToGroupIds) {
                    if (toNodeId === oldToGroupId) {
                      /*
                       * the transition is to the group so we will update the transition
                       * to the new group
                       */
                      transition.to = newToGroupId;
                    } else if (this.isNodeInGroup(toNodeId, oldToGroupId)) {
                      /*
                       * the transition is to a node in the old group so we will update
                       * the transition to point to the new group
                       */
                      if (newToGroupStartId == null || newToGroupStartId == '') {
                        transition.to = newToGroupId;
                      } else {
                        transition.to = newToGroupStartId;
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

    /*
     * make the steps that do not have a transition now point to the old
     * group
     * newToGroup -> oldToGroup
     */
    if (newToGroup != null) {
      const childIds = newToGroup.ids;
      if (childIds != null) {
        for (let childId of childIds) {
          const child = this.getNodeById(childId);
          const transitions = this.getTransitionsByFromNodeId(childId);

          if (transitions == null || transitions.length == 0) {
            if (oldToGroupIds != null) {
              for (let oldToGroupId of oldToGroupIds) {
                const oldToGroup = this.getNodeById(oldToGroupId);
                if (oldToGroup != null) {
                  const oldToGroupStartId = oldToGroup.startId;
                  const transition = {};
                  let toNodeId = '';
                  if (oldToGroupStartId == null) {
                    // there is no start node id so we will just point to the group
                    toNodeId = oldToGroup;
                  } else {
                    // there is a start node id so we will point to it
                    toNodeId = oldToGroupStartId;
                  }

                  // create the transition from the child to the old group
                  this.addToTransition(child, toNodeId);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Update the child transitions because we are moving a group. We will
   * update the transitions into and out of the group in the location
   * we are extracting the group from and also in the location we are
   * inserting the group into.
   * @param node the group we are moving
   * @param nodeId we will put the group after this node id
   */
  updateChildrenTransitionsInAndOutOfGroup(node, nodeId = null) {
    let transitionsBefore = null;

    // get the group nodes that point to the group we are moving
    const previousGroupNodes = this.getGroupNodesByToNodeId(node.id);

    // get all the transitions from the group we are moving
    const transitionsAfter = this.getTransitionsByFromNodeId(node.id);

    let extracted = false;

    /*
     * extract the group we are moving by updating the transitions of the
     * from group and the new to group. also remove the transitions from the
     * group we are moving.
     */

    for (let previousGroupNode of previousGroupNodes) {
      if (transitionsAfter == null || transitionsAfter.length == 0) {
        // the group we are moving does not have any transitions

        /*
         * remove the transitions to the group we are moving and make
         * new transitions from the from group to the new to group
         */
        this.updateTransitionsForExtractingGroup(previousGroupNode.id, node.id, null);
        extracted = true;
      } else {
        // the group we are moving has transitions

        // make the previous group point to the new to group
        for (let transitionAfter of transitionsAfter) {
          if (transitionAfter != null) {
            const toNodeId = transitionAfter.to;

            /*
             * remove the transitions to the group we are moving and make
             * new transitions from the from group to the new to group
             */
            this.updateTransitionsForExtractingGroup(previousGroupNode.id, node.id, toNodeId);
            extracted = true;
          }
        }
      }
    }

    if (!extracted) {
      /*
       * we have not removed the transitions yet because the group
       * we are moving does not have any groups before it
       */

      if (transitionsAfter != null) {
        // remove the transitions from the group we are moving
        for (let transitionAfter of transitionsAfter) {
          if (transitionAfter != null) {
            const toNodeId = transitionAfter.to;

            // remove the transitions to the group we are moving
            this.updateTransitionsForExtractingGroup(null, node.id, toNodeId);
            extracted = true;
          }
        }
      }
    }

    let inserted = false;

    /*
     * create the transitions from the from group to the group we are moving
     * and the transitions from the group we are moving to the old to group
     */
    if (nodeId != null) {
      // get the transitions from the previous group to the next group
      const transitionsAfter = this.getTransitionsByFromNodeId(nodeId);

      for (let transitionAfter of transitionsAfter) {
        if (transitionAfter != null) {
          const toNodeId = transitionAfter.to;

          /*
           * create the transitions that traverse from the from group
           * to the group we are moving. also create the transitions
           * that traverse from the group we are moving to the old
           * to group.
           */
          this.updateTransitionsForInsertingGroup(nodeId, [toNodeId], node.id);
          inserted = true;
        }
      }
    }

    if (!inserted) {
      /*
       * we have not inserted the transitions yet because there were no
       * previous group transitions
       */

      if (nodeId == null) {
        /*
         * the previous node id is null which means there was no previous
         * group. this means the group we are inserting will become the
         * first group. this happens when the group we are moving
         * is moved inside the root (group0).
         */

        const startGroupId = this.getStartGroupId();

        if (startGroupId != null) {
          // get the start group for the whole project (group0)
          const startGroup = this.getNodeById(startGroupId);

          if (startGroup != null) {
            const firstGroupId = startGroup.startId;

            /*
             * create the transitions that traverse from the group
             * we are moving to the previous first activity.
             */
            this.updateTransitionsForInsertingGroup(nodeId, [firstGroupId], node.id);
          }
        }
      } else {
        /*
         * we have not inserted the group yet because the from group doesn't
         * have a group after it
         */

        /*
         * create the transitions that traverse from the from group
         * to the group we are moving.
         */
        this.updateTransitionsForInsertingGroup(nodeId, null, node.id);
      }
    }
  }

  getActiveNodes() {
    return this.project.nodes;
  }

  getInactiveNodes() {
    let inactiveNodes = [];
    if (this.project != null) {
      if (this.project.inactiveNodes == null) {
        this.project.inactiveNodes = [];
      }
      inactiveNodes = this.project.inactiveNodes;
    }
    return inactiveNodes;
  }

  /**
   * Remove the node from the inactive nodes array
   * @param nodeId the node to remove
   * @returns the node that was removed
   */
  removeNodeFromInactiveNodes(nodeId) {
    let node = null;
    if (nodeId != null) {
      let parentGroup = this.getParentGroup(nodeId);
      if (parentGroup != null) {
        this.removeChildFromParent(nodeId);
      }

      let inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        for (let i = 0; i < inactiveNodes.length; i++) {
          let inactiveNode = inactiveNodes[i];
          if (inactiveNode != null) {
            if (nodeId === inactiveNode.id) {
              node = inactiveNode;
              inactiveNodes.splice(i, 1);
              break;
            }
          }
        }
      }
      this.removeNodeFromInactiveStepNodes(nodeId);
      this.removeNodeFromInactiveGroupNodes(nodeId);
    }
    return node;
  }

  /**
   * Remove the child node from the parent group.
   * @param nodeId The child node to remove from the parent.
   */
  removeChildFromParent(nodeId) {
    let parentGroup = this.getParentGroup(nodeId);
    if (parentGroup != null) {
      // Remove the child from the parent
      for (let i = 0; i < parentGroup.ids.length; i++) {
        let childId = parentGroup.ids[i];
        if (nodeId == childId) {
          parentGroup.ids.splice(i, 1);
          break;
        }
      }
      if (nodeId == parentGroup.startId) {
        /*
         * The child we removed was the start id of the group so we
         * will update the start id.
         */
        let startIdUpdated = false;
        let transitions = this.getTransitionsByFromNodeId(nodeId);
        if (transitions != null &&
          transitions.length > 0 &&
          transitions[0] != null &&
          transitions[0].to != null) {
          parentGroup.startId = transitions[0].to;
          startIdUpdated = true;
        }
        if (!startIdUpdated && parentGroup.ids.length > 0) {
          parentGroup.startId = parentGroup.ids[0];
          startIdUpdated = true;
        }
        if (!startIdUpdated) {
          parentGroup.startId = '';
        }
      }
    }
  }

  /**
   * Remove the node from the inactive step nodes array.
   * @param nodeId The node id of the node we want to remove from the
   * inactive step nodes array.
   */
  removeNodeFromInactiveStepNodes(nodeId) {
    for (let i = 0; i < this.inactiveStepNodes.length; i++) {
      let inactiveStepNode = this.inactiveStepNodes[i];
      if (nodeId == inactiveStepNode.id) {
        this.inactiveStepNodes.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Remove the node from the inactive group nodes array.
   * @param nodeId The node id of the group we want to remove from the
   * inactive group nodes array.
   */
  removeNodeFromInactiveGroupNodes(nodeId) {
    for (let i = 0; i < this.inactiveGroupNodes.length; i++) {
      let inactiveGroupNode = this.inactiveGroupNodes[i];
      if (nodeId == inactiveGroupNode.id) {
        this.inactiveGroupNodes.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Load the inactive nodes
   * @param nodes the inactive nodes
   */
  loadInactiveNodes(nodes) {
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null) {
          const nodeId = node.id;
          this.setIdToNode(nodeId, node);
          this.setIdToElement(nodeId, node);
          if (node.type == 'group') {
            this.inactiveGroupNodes.push(node);
          } else {
            this.inactiveStepNodes.push(node);
          }
        }
      }
    }
  }

  /**
   * Check if the target is active
   * @param target the node id or inactiveNodes/inactiveGroups to check
   * @returns whether the target is active
   */
  isActive(target) {
    if (target === 'inactiveNodes' || target === 'inactiveGroups') {
      return false;
    } else {
      return this.isNodeActive(target);
    }
  }

  /**
   * Check if a node is active.
   * @param nodeId the id of the node
   */
  isNodeActive(nodeId) {
    for (let activeNode of this.project.nodes) {
      if (activeNode.id == nodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Move the node to the active nodes array. If the node is a group node,
   * also move all of its children to active.
   */
  moveToActive(node) {
    if (!this.isActive(node.id)) {
      this.removeNodeFromInactiveNodes(node.id);
      this.addNode(node);
      if (this.isGroupNode(node.id)) {
        for (let childId of node.ids) {
          const childNode = this.removeNodeFromInactiveNodes(childId);
          this.addNode(childNode);
        }
      }
    }
  }

  /**
   * Add a group's child nodes to the inactive nodes.
   * @param node The group node.
   */
  addGroupChildNodesToInactive(node) {
    for (let childId of node.ids) {
      const childNode = this.getNodeById(childId);
      this.project.inactiveNodes.push(childNode);
      this.inactiveStepNodes.push(childNode);
    }
  }

  /**
   * Remove transition from nodes in the specified group that go out of the group
   * @param nodeId the group id
   */
  removeTransitionsOutOfGroup(groupId) {
    const group = this.getNodeById(groupId);
    for (let childId of group.ids) {
      const transitions = this.getTransitionsByFromNodeId(childId);
      for (let t = 0; t < transitions.length; t++) {
        const transition = transitions[t];
        const parentGroupId = this.getParentGroupId(transition.to);
        if (parentGroupId != groupId) {
          // this is a transition that goes out of the specified group
          transitions.splice(t, 1);
          t--; // so it won't skip the next element
        }
      }
    }
  }

  /*
   * Update the step transitions that point into the group we are moving
   * For example
   * group1 has children node1 and node2 (node2 transitions to node3)
   * group2 has children node3 and node4 (node4 transitions to node5)
   * group3 has children node5 and node6
   * if we move group2 after group3 we will need to change the
   * transition from node2 to node3 and make node2 transition to node5
   * the result will be
   * group1 has children node1 and node2 (node2 transitions to node5)
   * group3 has children node5 and node6
   * group2 has children node3 and node4 (node4 transitions to node5)
   * note: the (node4 transition to node5) will be removed later
   * when is called removeTransitionsOutOfGroup
   * note: when group2 is added in a later function call, we will add
   * the node6 to node3 transition
   * @param groupThatTransitionsToGroupWeAreMoving the group object
   * that transitions to the group we are moving. we may need to update
   * the transitions of this group's children.
   * @param groupIdWeAreMoving the group id of the group we are moving
   */
  updateChildrenTransitionsIntoGroupWeAreMoving(
      groupThatTransitionsToGroupWeAreMoving, groupIdWeAreMoving) {
    if (groupThatTransitionsToGroupWeAreMoving != null &&
        groupIdWeAreMoving != null) {
      const group = this.getNodeById(groupIdWeAreMoving);
      if (group != null) {
        // get all the nodes that have a transition to the node we are removing
        const nodesByToNodeId = this.getNodesByToNodeId(groupIdWeAreMoving);

        // get the transitions of the node we are removing
        const nodeToRemoveTransitionLogic = group.transitionLogic;
        let nodeToRemoveTransitions = [];

        if (nodeToRemoveTransitionLogic != null && nodeToRemoveTransitionLogic.transitions != null) {
          nodeToRemoveTransitions = nodeToRemoveTransitionLogic.transitions;
        }

        if (nodeToRemoveTransitions.length == 0) {
          /*
           * The group we are moving is the last group in the project
           * and does not have any transitions. We will loop through
           * all the nodes that transition into this group and remove
           * those transitions.
           */

          // get child ids of the group that comes before the group we are moving
          const childIds = groupThatTransitionsToGroupWeAreMoving.ids;

          if (childIds != null) {
            for (let childId of childIds) {
              const transitionsFromChild = this.getTransitionsByFromNodeId(childId);
              if (transitionsFromChild != null) {
                for (let tfc = 0; tfc < transitionsFromChild.length; tfc++) {
                  const transitionFromChild = transitionsFromChild[tfc];
                  if (transitionFromChild != null) {
                    const toNodeId = transitionFromChild.to;
                    const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

                    if (groupIdWeAreMoving === toNodeIdParentGroupId) {
                      // the transition is to a child in the group we are moving
                      transitionsFromChild.splice(tfc, 1);

                      /*
                       * move the counter back one because we have just removed an
                       * element from the array
                       */
                      tfc--;
                    }
                  }
                }
              }
            }
          }
        } else if (nodeToRemoveTransitions.length > 0) {
          // get the first group that comes after the group we are removing
          const firstNodeToRemoveTransition = nodeToRemoveTransitions[0];
          const firstNodeToRemoveTransitionToNodeId = firstNodeToRemoveTransition.to;

          if (this.isGroupNode(firstNodeToRemoveTransitionToNodeId)) {
            // get the group that comes after the group we are moving
            const groupNode = this.getNodeById(firstNodeToRemoveTransitionToNodeId);

            // get child ids of the group that comes before the group we are moving
            const childIds = groupThatTransitionsToGroupWeAreMoving.ids;

            if (childIds != null) {
              for (let childId of childIds) {
                const transitionsFromChild = this.getTransitionsByFromNodeId(childId);
                if (transitionsFromChild != null) {
                  for (let transitionFromChild of transitionsFromChild) {
                    if (transitionFromChild != null) {
                      const toNodeId = transitionFromChild.to;

                      // get the parent group id of the toNodeId
                      const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

                      if (groupIdWeAreMoving === toNodeIdParentGroupId) {
                        // the transition is to a child in the group we are moving

                        if (groupNode.startId == null) {
                          // change the transition to point to the after group
                          transitionFromChild.to = firstNodeToRemoveTransitionToNodeId;
                        } else {
                          // change the transition to point to the start id of the after group
                          transitionFromChild.to = groupNode.startId;
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
  }

  /**
   * Check if a node generates work by looking at all of its components
   * @param nodeId the node id
   * @return whether the node generates work
   */
  nodeHasWork(nodeId) {
    if (nodeId != null) {
      const nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent != null) {
        const components = nodeContent.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              const componentHasWork = this.componentHasWork(component);
              if (componentHasWork) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if a component generates work
   * @param component check if this component generates work
   * @return whether the component generates work
   */
  componentHasWork(component) {
    if (component != null) {
      const componentType = component.type;
      const componentService = this.getComponentService(componentType);
      if (componentService != null) {
        return componentService.componentHasWork(component);
      }
    }
    return false;
  }

  /**
   * Get a component service
   * @param componentType the component type
   * @return the component service
   */
  getComponentService(componentType) {
    let componentService = null;
    if (componentType != null) {
      const componentServiceName = componentType + 'Service';

      /*
       * check if we have previously retrieved the component service.
       * if have previously retrieved the component service it will
       * be in the componentServices map
       */
      componentService = this.componentServices[componentServiceName];

      if (componentService == null) {
        /*
         * we have not previously retrieved the component service so
         * we will get it now
         */
        componentService = this.$injector.get(componentServiceName);

        /*
         * save the component service to the map so we can easily
         * retrieve it later
         */
        this.componentServices[componentServiceName] = componentService;
      }
    }
    return componentService;
  }

  /**
   * Get an unused component id
   * @param componentIdsToSkip (optional) An array of additional component ids
   * to skip. This is used when we are creating multiple new components. There
   * is avery small chance that we create duplicate component ids that aren't
   * already in the project. We avoid this problem by using this parameter.
   * Example
   * We want to create two new components. We first generate a new component
   * id for the first new component for example "1234567890". Then we generate
   * a new component id for the second new component and pass in
   * ["1234567890"] as componentIdsToSkip because the new "1234567890"
   * component hasn't actually been added to the project yet.
   * @return a component id that isn't already being used in the project
   */
  getUnusedComponentId(componentIdsToSkip) {
    // we want to make an id with 10 characters
    const idLength = 10;

    let newComponentId = this.UtilService.generateKey(idLength);

    // check if the component id is already used in the project
    if (this.isComponentIdUsed(newComponentId)) {
      /*
       * the component id is already used in the project so we need to
       * try generating another one
       */
      let alreadyUsed = true;

      /*
       * keep trying to generate a new component id until we have found
       * one that isn't already being used
       */
      while(!alreadyUsed) {
        newComponentId = this.UtilService.generateKey(idLength);

        // check if the id is already being used in the project
        alreadyUsed = this.isComponentIdUsed(newComponentId);

        if (componentIdsToSkip != null && componentIdsToSkip.indexOf(newComponentId) != -1) {
          /*
           * the new component is in the componentIdsToSkip so it has
           * already been used
           */
          alreadyUsed = true;
        }
      }
    }
    return newComponentId;
  }

  /**
   * Check if the component id is already being used in the project
   * @param componentId check if this component id is already being used in
   * the project
   * @return whether the component id is already being used in the project
   */
  isComponentIdUsed(componentId) {
    for (let node of this.project.nodes) {
      if (node != null) {
        const components = node.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              if (componentId === component.id) {
                return true;
              }
            }
          }
        }
      }
    }

    for (let node of this.project.inactiveNodes) {
      if (node != null) {
        const components = node.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              if (componentId === component.id) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Get the next available constraint id for a node
   * @param nodeId get the next available constraint id for this node
   * e.g. node8Constraint2
   * @return the next available constraint id for the node
   */
  getNextAvailableConstraintIdForNodeId(nodeId) {
    let nextAvailableConstraintId = null;
    if (nodeId != null) {
      const usedConstraintIds = [];
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const constraints = node.constraints;
        if (constraints != null) {
          for (let constraint of constraints) {
            if (constraint != null) {
              const constraintId = constraint.id;
              usedConstraintIds.push(constraintId);
            }
          }
        }
      }

      let foundNextAvailableConstraintId = false;
      let counter = 1;

      while (!foundNextAvailableConstraintId) {
        const potentialConstraintId = nodeId + 'Constraint' + counter;
        if (usedConstraintIds.indexOf(potentialConstraintId) == -1) {
          nextAvailableConstraintId = potentialConstraintId;
          foundNextAvailableConstraintId = true;
        } else {
          counter++;
        }
      }
    }
    return nextAvailableConstraintId;
  }

  /**
   * Get the node ids in the branch by looking for nodes that have branch
   * path taken constraints with the given fromNodeId and toNodeId
   * @param fromNodeId the from node id
   * @param toNodeId the to node id
   * @return an array of nodes that are in the branch path
   */
  getNodeIdsInBranch(fromNodeId, toNodeId) {
    const nodeIdsInBranch = [];
    const nodes = this.getNodes();
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null) {
          if (this.hasBranchPathTakenConstraint(node, fromNodeId, toNodeId)) {
            nodeIdsInBranch.push(node.id);
          }
        }
      }
    }
    this.orderNodeIds(nodeIdsInBranch);
    return nodeIdsInBranch;
  }

  /**
   * Order the node ids so that they show up in the same order as in the
   * project.
   * @param constraints An array of node ids.
   * @return An array of ordered node ids.
   */
  orderNodeIds(nodeIds) {
    let orderedNodeIds = this.getFlattenedProjectAsNodeIds();
    return nodeIds.sort(this.nodeIdsComparatorGenerator(orderedNodeIds));
  }

  /**
   * Create the node ids comparator function that is used for sorting an
   * array of node ids.
   * @param orderedNodeIds An array of node ids in the order in which they
   * show up in the project.
   * @return A comparator that orders node ids in the order in which they show
   * up in the project.
   */
  nodeIdsComparatorGenerator(orderedNodeIds) {
    return function(nodeIdA, nodeIdB) {
      let nodeIdAIndex = orderedNodeIds.indexOf(nodeIdA);
      let nodeIdBIndex = orderedNodeIds.indexOf(nodeIdB);
      if (nodeIdAIndex < nodeIdBIndex) {
        return -1;
      } else if (nodeIdAIndex > nodeIdBIndex) {
        return 1;
      }
      return 0;
    }
  }

  /**
   * Check if a node has a branch path taken constraint
   * @param node the node to check
   * @param fromNodeId the from node id of the branch path taken
   * @param toNodeId the to node id of the branch path taken
   * @return whether the node has a branch path taken constraint with the
   * given from node id and to node id
   */
  hasBranchPathTakenConstraint(node, fromNodeId, toNodeId) {
    const constraints = node.constraints;
    if (constraints != null) {
      for (let constraint of constraints) {
        for (let removalCriterion of constraint.removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            const params = removalCriterion.params;
            if (params.fromNodeId == fromNodeId &&
                params.toNodeId == toNodeId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Remove all branch path taken constraints from a node.
   * @param nodeId Remove the constraints from this node.
   */
  removeBranchPathTakenNodeConstraintsIfAny(nodeId) {
    const node = this.getNodeById(nodeId);
    const constraints = node.constraints;
    if (constraints != null) {
      for (let c = 0; c < constraints.length; c++) {
        const constraint = constraints[c];
        const removalCriteria = constraint.removalCriteria;
        for (let removalCriterion of removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            constraints.splice(c, 1);
            c--; // update the counter so we don't skip over the next element
          }
        }
      }
    }
  }

  /**
   * @param nodeId Get the branch path taken constraints from this node.
   * @return {Array} An array of branch path taken constraints from the node.
   */
  getBranchPathTakenConstraintsByNodeId(nodeId) {
    const branchPathTakenConstraints = [];
    const node = this.getNodeById(nodeId);
    const constraints = node.constraints;
    if (constraints != null) {
      for (let constraint of constraints) {
        for (let removalCriterion of constraint.removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            branchPathTakenConstraints.push(constraint);
            break;
          }
        }
      }
    }
    return branchPathTakenConstraints;
  }

  /**
   * Get the project level rubric
   * @return the project level rubric
   */
  getProjectRubric() {
    return this.project.rubric;
  }

  /**
   * Check if a node is a branch point. A branch point is a node with more
   * than one transition.
   * @param nodeId the node id
   * @return whether the node is a branch point
   */
  isBranchPoint(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    return transitions != null && transitions.length > 1;
  }

  /**
   * Check if a node is the first node in a branch path
   * @param nodeId the node id
   * @return whether the node is the first node in a branch path
   */
  isFirstNodeInBranchPath(nodeId) {
    const nodes = this.getNodes();
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null &&
            node.transitionLogic != null &&
            node.transitionLogic.transitions != null) {
          const transitions = node.transitionLogic.transitions;

          if (transitions.length > 1) {
            /*
             * there is more than one transition from this node
             * which means it is a branch point
             */
            for (let transition of transitions) {
              if (transition != null) {
                const transitionTo = transition.to;
                if (transitionTo === nodeId) {
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if the node is in any branch path
   * @param nodeId the node id of the node
   * @return whether the node is in any branch path
   */
  isNodeInAnyBranchPath(nodeId) {
    let result = false;
    if (this.nodeIdToIsInBranchPath[nodeId] == null) {
      /*
       * we have not calculated whether the node id is in a branch path
       * before so we will now
       */
      result = this.nodeIdsInAnyBranch.indexOf(nodeId) !== -1;

      // remember the result for this node id
      this.nodeIdToIsInBranchPath[nodeId] = result;
    } else {
      /*
       * we have calculated whether the node id is in a branch path
       * before
       */
      result = this.nodeIdToIsInBranchPath[nodeId];
    }
    return result;
  }

  /**
   * Check if a node is a branch start point
   * @param nodeId look for a branch with this start node id
   * @return whether the node is a branch start point
   */
  isBranchStartPoint(nodeId) {
    const branches = this.getBranches();
    if (branches != null) {
      for (let branch of branches) {
        if (branch.branchStartPoint == nodeId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a node is a branch end point
   * @param nodeId look for a branch with this end node id
   * @return whether the node is a branch end point
   */
  isBranchMergePoint(nodeId) {
    const branches = this.getBranches();
    if (branches != null) {
      for (let branch of branches) {
        if (branch.branchEndPoint == nodeId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all the branches whose branch start point is the given node id
   * @param nodeId the branch start point
   * @return an array of branches that have the given branch start point
   */
  getBranchesByBranchStartPointNodeId(nodeId) {
    const branches = [];
    const allBranches = this.getBranches();

    if (allBranches != null) {
      for (let branch of allBranches) {
        if (branch != null) {
          if (nodeId == branch.branchStartPoint) {
            /*
             * the branch start point matches the node id we are
             * looking for
             */
            branches.push(branch);
          }
        }
      }
    }
    return branches;
  }

  /**
   * Calculate the node numbers and set them into the nodeIdToNumber map
   */
  calculateNodeNumbers() {
    this.nodeIdToNumber = {};
    this.nodeIdToBranchPathLetter = {};
    const startNodeId = this.getStartNodeId();
    const currentActivityNumber = 0;
    const currentStepNumber = 0;
    this.calculateNodeNumbersHelper(
        startNodeId, currentActivityNumber, currentStepNumber);
  }

  /**
   * Recursively calcualte the node numbers by traversing the project tree
   * using transitions
   * @param nodeId the current node id we are on
   * @param currentActivityNumber the current activity number
   * @param currentStepNumber the current step number
   * @param branchLetterCode (optional) the character code for the branch
   * letter e.g. 1=A, 2=B, etc.
   */
  calculateNodeNumbersHelper(nodeId, currentActivityNumber, currentStepNumber, branchLetterCode) {
    if (nodeId != null) {
      if (this.isApplicationNode(nodeId)) {
        const node = this.getNodeById(nodeId);
        if (node != null) {
          const parentGroup = this.getParentGroup(nodeId);
          if (parentGroup != null) {
            if (this.nodeIdToNumber[parentGroup.id] == null) {
              /*
               * the parent group has not been assigned a number so
               * we will assign a number now
               */

              currentActivityNumber = parseInt(currentActivityNumber) + 1;

              /*
               * set the current step number to 1 now that we have
               * entered a new group
               */
              currentStepNumber = 1;

              this.nodeIdToNumber[parentGroup.id] = "" + currentActivityNumber;
            } else {
              /*
               * the parent group has previously been assigned a number so we
               * will use it
               */
              currentActivityNumber = this.nodeIdToNumber[parentGroup.id];
            }
          }

          if (this.isBranchMergePoint(nodeId)) {
            /*
             * the node is a merge point so we will not use a letter
             * anymore now that we are no longer in a branch path
             */
            branchLetterCode = null;
          }

          if (this.isBranchStartPoint(nodeId)) {
            const branchesByBranchStartPointNodeId =
                this.getBranchesByBranchStartPointNodeId(nodeId);
            const branchesObject = branchesByBranchStartPointNodeId[0];

            /*
             * been used in the branch paths so that we know what
             * step number to give the merge end point
             * this is used to obtain the max step number that has
             */
            let maxCurrentStepNumber = 0;

            // set the step number for the branch start point
            this.nodeIdToNumber[nodeId] = currentActivityNumber + '.' + currentStepNumber;

            currentStepNumber++;
            const branchPaths = branchesObject.branchPaths;

            for (let bp = 0; bp < branchPaths.length; bp++) {
              const branchPath = branchPaths[bp];
              let branchCurrentStepNumber = currentStepNumber;

              // get the letter code e.g. 1=A, 2=B, etc.
              const branchLetterCode = bp;

              for (let bpn = 0; bpn < branchPath.length; bpn++) {
                if (bpn == 0) {
                  /*
                   * Recursively call calculateNodeNumbersHelper on the
                   * first step in this branch path. This will recursively
                   * calculate the numbers for all the nodes in this
                   * branch path.
                   */
                  const branchPathNodeId = branchPath[bpn];
                  this.calculateNodeNumbersHelper(branchPathNodeId, currentActivityNumber, branchCurrentStepNumber, branchLetterCode);
                }

                branchCurrentStepNumber++;

                /*
                 * update the max current step number if we have found
                 * a larger number
                 */
                if (branchCurrentStepNumber > maxCurrentStepNumber) {
                  maxCurrentStepNumber = branchCurrentStepNumber;
                }
              }
            }

            // get the step number we should use for the end point
            currentStepNumber = maxCurrentStepNumber;

            const branchEndPointNodeId = branchesObject.branchEndPoint;

            /*
             * calculate the node number for the branch end point and
             * continue calculating node numbers for the nodes that
             * come after it
             */
            this.calculateNodeNumbersHelper(branchEndPointNodeId, currentActivityNumber, currentStepNumber);
          } else {
            // the node is not a branch start point

            /*
             * check if we have already set the number for this node so
             * that we don't need to unnecessarily re-calculate the
             * node number
             */
            if (this.nodeIdToNumber[nodeId] == null) {
              // we have not calculated the node number yet

              let number = null;

              if (branchLetterCode == null) {
                // we do not need to add a branch letter

                // get the node number e.g. 1.5
                number = currentActivityNumber + '.' + currentStepNumber;
              } else {
                // we need to add a branch letter

                // get the branch letter
                const branchLetter = String.fromCharCode(65 + branchLetterCode);

                // get the node number e.g. 1.5 A
                number = currentActivityNumber + '.' + currentStepNumber + ' ' + branchLetter;

                // remember the branch path letter for this node
                this.nodeIdToBranchPathLetter[nodeId] = branchLetter;
              }

              // set the number for the node
              this.nodeIdToNumber[nodeId] = number;
            } else {
              /*
               * We have calculated the node number before so we
               * will return. This will prevent infinite looping
               * within the project.
               */
              return;
            }

            // increment the step number for the next node to use
            currentStepNumber++;

            let transitions = [];

            if (node.transitionLogic != null && node.transitionLogic.transitions) {
              transitions = node.transitionLogic.transitions;
            }

            if (transitions.length > 0) {
              /*
               * loop through all the transitions, there should only
               * be one but we will loop through them just to be complete.
               * if there was more than one transition, it would mean
               * this node is a branch start point in which case we
               * would have gone inside the other block of code where
               * this.isBranchStartPoint() is true.
               */
              for (let transition of transitions) {
                if (transition != null) {
                  if (this.isBranchMergePoint(transition.to)) {

                  } else {
                    this.calculateNodeNumbersHelper(transition.to, currentActivityNumber, currentStepNumber, branchLetterCode);
                  }
                }
              }
            } else {
              // if there are no transitions, check if the parent group has a transition

              if (parentGroup != null &&
                  parentGroup.transitionLogic != null &&
                  parentGroup.transitionLogic.transitions != null &&
                  parentGroup.transitionLogic.transitions.length > 0) {
                for (let transition of parentGroup.transitionLogic.transitions) {
                  if (transition != null) {
                    this.calculateNodeNumbersHelper(transition.to, currentActivityNumber, currentStepNumber, branchLetterCode);
                  }
                }
              }
            }
          }
        }
      } else {
        // the node is a group node

        const node = this.getNodeById(nodeId);
        if (node != null) {
          // check if the group has previously been assigned a number
          if (this.nodeIdToNumber[nodeId] == null) {
            /*
             * the group has not been assigned a number so
             * we will assign a number now
             */
            if (nodeId == 'group0') {
              // group 0 will always be given the activity number of 0
              this.nodeIdToNumber[nodeId] = "" + 0;
            } else {
              // set the activity number
              currentActivityNumber = parseInt(currentActivityNumber) + 1;

              /*
               * set the current step number to 1 now that we have
               * entered a new group
               */
              currentStepNumber = 1;

              // set the activity number
              this.nodeIdToNumber[nodeId] = "" + currentActivityNumber;
            }
          } else {
            /*
             * We have calculated the node number before so we
             * will return. This will prevent infinite looping
             * within the project.
             */
            return;
          }

          if (node.startId != null && node.startId != '') {
            /*
             * calculate the node number for the first step in this
             * activity and any steps after it
             */
            this.calculateNodeNumbersHelper(node.startId, currentActivityNumber, currentStepNumber, branchLetterCode);
          } else {
            /*
             * this activity doesn't have a start step so we will
             * look for a transition
             */

            if (node != null &&
                node.transitionLogic != null &&
                node.transitionLogic.transitions != null &&
                node.transitionLogic.transitions.length > 0) {
              for (let transition of node.transitionLogic.transitions) {
                if (transition != null) {
                  /*
                   * calculate the node number for the next group
                   * and all its children steps
                   */
                  this.calculateNodeNumbersHelper(
                      transition.to, currentActivityNumber, currentStepNumber,
                      branchLetterCode);
                }
              }
            }
          }
        }
      }
    }
  }

  getProjectScript() {
    return this.project.script;
  }

  /**
   * Get the next node after the specified node
   * @param nodeId get the node id that comes after this one
   * @return the node id that comes after
   */
  getNextNodeId(nodeId) {
    const flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
    if (flattenedNodeIds != null) {
      const indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
      if (indexOfNodeId != -1) {
        const indexOfNextNodeId = indexOfNodeId + 1;
        return flattenedNodeIds[indexOfNextNodeId];
      }
    }
    return null;
  }

  /**
   * Get all the projectAchievements object in the project. The projectAchievements object
   * contains the isEnabled field and an array of items.
   * @return the achievement object
   */
  getAchievements() {
    if (this.project.achievements == null) {
      this.project.achievements = {
        isEnabled: false,
        items: []
      };
    }
    return this.project.achievements;
  }

  /**
   * Get the achievement items in the project
   * @return the achievement items
   */
  getAchievementItems() {
    const achievements = this.getAchievements();
    if (achievements.items == null) {
      achievements.items = [];
    }
    return achievements.items;
  }

  /**
   * Get an achievement by the 10 character alphanumeric achievement id
   * @param achievementId the 10 character alphanumeric achievement id
   * @return the achievement with the given achievement id
   */
  getAchievementByAchievementId(achievementId) {
    if (achievementId != null) {
      const achievements = this.getAchievements();
      if (achievements != null) {
        const achievementItems = achievements.items;
        if (achievementItems != null) {
          for (let achievement of achievementItems) {
            if (achievement != null && achievement.id == achievementId) {
              return achievement;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Get the total number of rubrics (step + components) for the given nodeId
   * @param nodeId the node id
   * @return Number of rubrics for the node
   */
  getNumberOfRubricsByNodeId(nodeId) {
    let numRubrics = 0;
    let nodeContent = this.getNodeContentByNodeId(nodeId);
    if (nodeContent) {
      let nodeRubric = nodeContent.rubric;
      if (nodeRubric != null && nodeRubric != '') {
        numRubrics++;
      }

      let components = nodeContent.components;
      if (components && components.length) {
        for (let component of components) {
          if (component) {
            const componentRubric = component.rubric;
            if (componentRubric != null && componentRubric != '') {
              numRubrics++;
            }
          }
        }
      }
    }
    return numRubrics;
  }

  /**
   * Remember the result for whether the node is affected by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @param whether the node is affected by the constraint
   */
  cacheIsNodeAffectedByConstraintResult(nodeId, constraintId, result) {
    this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId] = result;
  }

  /**
   * Check if we have calculated the result for whether the node is affected
   * by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @return Return the result if we have calculated the result before. If we
   * have not calculated the result before, we will return null
   */
  getCachedIsNodeAffectedByConstraintResult(nodeId, constraintId) {
    return this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId];
  }

  /**
   * Get the id to node mappings.
   * @return An object the keys as node ids and the values as nodes.
   */
  getIdToNode() {
    return this.idToNode;
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

  getSpaces() {
    if (this.project.spaces != null) {
      return this.project.spaces;
    } else {
      return [];
    }
  }

  addSpace(space) {
    if (this.project.spaces == null) {
      this.project.spaces = [];
    }
    if (!this.isSpaceExists(space.id)) {
      this.project.spaces.push(space);
      this.saveProject();
    }
  }

  isSpaceExists(id) {
    const spaces = this.getSpaces();
    for (let space of spaces) {
      if (space.id === id) {
        return true;
      }
    }
    return false;
  }

  removeSpace(id) {
    let spaces = this.getSpaces();
    for (let s = 0; s < spaces.length; s++) {
      if (spaces[s].id == id) {
        spaces.splice(s, 1);
        this.saveProject();
        return;
      }
    }
  }

  /**
   * Returns true iff the specified node and component has any registered additionalProcessingFunctions
   * @param nodeId the node id
   * @param componentId the component id
   * @returns true/false
   */
  hasAdditionalProcessingFunctions(nodeId, componentId) {
    return this.getAdditionalProcessingFunctions(nodeId, componentId) != null;
  }

  /**
   * Returns an array of registered additionalProcessingFunctions for the specified node and component
   * @param nodeId the node id
   * @param componentId the component id
   * @returns an array of additionalProcessingFunctions
   */
  getAdditionalProcessingFunctions(nodeId, componentId) {
    let key = nodeId + "_" + componentId;
    return this.additionalProcessingFunctionsMap[key];
  }

  getFeaturedProjectIcons() {
    const featuredProjectIconsURL = this.ConfigService.getConfigParam('featuredProjectIcons');
    return this.$http.get(featuredProjectIconsURL).then((result) => {
      return result.data;
    });
  }

  setFeaturedProjectIcon(projectIcon) {
    const featuredProjectIconURL = this.ConfigService.getConfigParam('featuredProjectIcon');
    return this.setProjectIcon(projectIcon, featuredProjectIconURL);
  }

  setCustomProjectIcon(projectIcon) {
    const customProjectIconURL = this.ConfigService.getConfigParam('customProjectIcon');
    return this.setProjectIcon(projectIcon, customProjectIconURL);
  }

  setProjectIcon(projectIcon, projectIconURL) {
    let projectId = this.ConfigService.getProjectId();
    const httpParams = {
      method: 'POST',
      url: projectIconURL,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({
        projectId: projectId,
        projectIcon: projectIcon
      })
    };
    return this.$http(httpParams).then((result) => {
      return result.data;
    });
  }
}

ProjectService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'ConfigService',
  'UtilService'
];

export default ProjectService;
