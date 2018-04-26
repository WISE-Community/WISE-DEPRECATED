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
    this.idToPosition = {};
    this.idToOrder = {};
    this.nodeCount = 0;
    this.componentServices = {};
    this.nodeIdToNumber = {};
    this.nodeIdToIsInBranchPath = {};
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
    this.idToPosition = {};
    this.idToOrder = {};
    this.nodeCount = 0;
    this.nodeIdToIsInBranchPath = {};
    this.achievements = [];
    this.clearBranchesCache();
  };

  getStyle() {
    let style = '';
    const project = this.project;
    if (project != null) {
      style = project.style;
    }
    return style;
  };

  getFilters() {
    return this.filters;
  };

  /**
   * Returns the name/title of the current project
   */
  getProjectTitle() {
    const name = this.getProjectMetadata().title;
    return name ? name : 'A WISE Project (No name)';
  };

  /**
   * Set the project title
   */
  setProjectTitle(projectTitle) {
    const metadata = this.getProjectMetadata();
    if (metadata != null) {
      metadata.title = projectTitle;
    }
  }

  getProjectMetadata() {
    return this.metadata ? this.metadata : {};
  };

  getNodes() {
    const project = this.project;
    if (project != null) {
      return project.nodes;
    }
    return null;
  };

  getPlanningNodes() {
    const project = this.project;
    if (project != null) {
      return project.planningNodes;
    }
    return null;
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
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null) {
          const nodeId = node.id;
          if (nodeId === id) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // adds or update transition if exists
  addTransition(transition) {
    const existingTransitions = this.getTransitions();
    let replaced = false;
    for (let t = 0; t < existingTransitions.length; t++) {
      const existingTransition = existingTransitions[t];
      if (existingTransition.id === transition.id) {
        existingTransitions.splice(t, 1, transition);
        replaced = true;
      }
    }
    if (!replaced) {
      existingTransitions.push(transition);
    }
  };

  addNode(node) {
    const existingNodes = this.project.nodes;
    let replaced = false;
    if (node != null && existingNodes != null) {
      for (let n = 0; n < existingNodes.length; n++) {
        const existingNode = existingNodes[n];
        const existingNodeId = existingNode.id;
        if (existingNodeId === node.id) {
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
    const groupNode = this.getNodeById(id);
    if (groupNode != null) {
      const type = groupNode.type;
      if (type === 'group') {
        return true;
      }
    }
    return false;
  };

  isApplicationNode(id) {
    const applicationNode = this.getNodeById(id);
    if (applicationNode != null) {
      const type = applicationNode.type;
      if (type !== 'group') {
        return true;
      }
    }
    return false;
  };

  getGroups() {
    return this.groupNodes;
  };

  /**
   * Get the inactive group nodes.
   * @return An array of inactive group nodes.
   */
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
      this.setNodeOrder(this.rootNode, this.nodeCount);

      let n = nodes.length;
      const branches = this.getBranches();
      const branchNodeIds = [];

      // set node positions
      let id, pos;

      while (n--) {
        id = nodes[n].id;
        if (id === this.rootNode.id) {
          this.setIdToPosition(id, '0');
        } else if (this.isNodeIdInABranch(branches, id)) {
          // node is in a branch, so process later
          branchNodeIds.push(id);
        } else {
          pos = this.getPositionById(id);
          this.setIdToPosition(id, pos);
        }
      }

      // set branch node positions
      let b = branchNodeIds.length;
      while (b--) {
        id = branchNodeIds[b];
        pos = this.getBranchNodePositionById(id);
        this.setIdToPosition(id, pos);
      }

      /*
       * calculate the node numbers
       * e.g. if the step is called
       * 1.5 View the Potential Energy
       * then the node number is 1.5
       */
      this.calculateNodeNumbers();

      if (this.project.achievements != null) {
        this.achievements = this.project.achievements;
      }
    }

    this.$rootScope.$broadcast('projectChanged');
  };

  setNodeOrder(node) {
    this.idToOrder[node.id] = {'order': this.nodeCount};
    this.nodeCount++;
    if (this.isGroupNode(node.id)) {
      let childIds = node.ids;
      for (let childId of childIds) {
        let child = this.getNodeById(childId);
        this.setNodeOrder(child);
      }

      if (this.ConfigService.getMode() === 'classroomMonitor') {
        // we're viewing the classroom monitor, so include planning nodes in the project structure
        let planningIds = node.availablePlanningNodes;
        if (planningIds) {
          for (let planningId of planningIds) {
            let child = this.getNodeById(planningId.nodeId);
            this.setNodeOrder(child);
          }
        }
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
    const idToOrder = {};
    idToOrder.nodeCount = 0;
    const startGroupId = project.startGroupId;
    const rootNode = this.getNodeById(startGroupId, project);
    const stepNumber = '';
    const nodes = [];
    const importProjectIdToOrder = this.getNodeOrderOfProjectHelper(project, rootNode, idToOrder, stepNumber, nodes);
    delete importProjectIdToOrder.nodeCount;
    const result = {};
    result.idToOrder = importProjectIdToOrder;
    result.nodes = nodes;
    return result;
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
   * Returns the position in the project for the branch node with the given id. Returns null if no node with id exists or node is not a branch node.
   * @param id a node id
   * @return string position of the given node id in the project
   */
  getBranchNodePositionById(id) {
    const branches = this.getBranches();
    let b = branches.length;

    // TODO: should we localize this? should we support more than 26?
    const integerToAlpha = function(int) {
      const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
      if (int > -1 && int < 26) {
        return alphabet[int];
      } else {
        return int;
      }
    };

    while (b--) {
      const branch = branches[b];
      const branchPaths = branch.branchPaths;
      for (let p = 0; p < branchPaths.length; p++) {
        const branchPath = branchPaths[p];
        const nodeIndex = branchPath.indexOf(id);
        if (nodeIndex > -1) {
          const startPoint = branch.branchStartPoint;
          const startPointPos = this.idToPosition[startPoint];
          const branchPathPos = startPointPos + ' ' + integerToAlpha(p);
          return branchPathPos + (nodeIndex+1);
        }
      }
    }
    return null;
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
      const branches = this.getBranches();
      for (let nodeId of node.ids) {
        if (this.isNodeIdInABranch(branches, nodeId)) {
          this.getBranchNodePositionById(nodeId);
        } else {
          ++num;
          const pos = this.getPathToNode(this.getNodeById(nodeId), (path) + '.' + (num), id);
          if (pos) {
            return pos;
          }
        }
      }
    }
  };

  setIdToPosition(id, pos) {
    if (id != null) {
      this.idToPosition[id] = pos;
    }
  };

  getNodePositionById(id) {
    let position = null;
    if (id != null) {
      position = this.nodeIdToNumber[id];
    }
    return position;
  };

  getNodeIdByOrder(order) {
    let id = null;
    if (order != null) {
      for (let [nodeId, value] of Object.entries(this.idToOrder)) {
        if (value.order === order) {
          id = nodeId;
          break;
        }
      }
    }
    return id;
  }

  getNodeOrderById(id) {
    let order = null;
    if (id != null) {
      order = this.idToOrder[id] ? this.idToOrder[id].order : null;
    }
    return order;
  };

  setIdToNode(id, element) {
    if (id != null) {
      this.idToNode[id] = element;
    }
  };

  setIdToElement(id, element) {
    if (id != null) {
      this.idToElement[id] = element;
    }
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
        new RegExp('(\'|\"|\\\\\'|\\\\\")[^:][^\/]?[^\/]?[a-zA-Z0-9@%&;\\._\\/\\s\\-]*[\.](png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html.*?|js).*?(\'|\"|\\\\\'|\\\\\")', 'gi'),
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
      // the project argument is null so we will get it from the current project
      if (nodeId != null && this.idToNode[nodeId]) {
        return this.idToNode[nodeId];
      }
    } else {
      /*
       * the project argument is not null so we will get the node from
       * project that was passed in
       */
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
      const nodeType = node.type;

      // set defaults (TODO: get from configService?)
      const defaultName = (nodeType === 'group') ? 'explore' : 'school';
      nodeIcon = {
        color: 'rgba(0,0,0,0.54)',
        type: 'font',
        fontSet: 'material-icons',
        fontName: defaultName,
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

  isStartNode(node) {
    let result = false;
    if (node != null) {
      const nodeId = node.id;
      const projectStartId = this.getStartNodeId();
      if (nodeId === projectStartId) {
        result = true;
      }

      const groups = this.getGroups();
      for (let group of groups) {
        if (group != null) {
          const groupStartId = group.startId;
          if (nodeId === groupStartId) {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  };

  /**
   * Returns the Project's start node id, or null if it's not defined in the project
   */
  getStartNodeId() {
    const project = this.project;
    if (project != null) {
      return project.startNodeId;
    }
    return null;
  };

  /**
   * Set the start node id
   * @param nodeId the new start node id
   */
  setStartNodeId(nodeId) {
    if (nodeId != null) {
      const project = this.project;
      if (project != null) {
        project.startNodeId = nodeId;
      }
    }
  }

  /**
   * Get the start group id
   * @return the start group id
   */
  getStartGroupId() {
    const project = this.project;
    if (project != null) {
      return project.startGroupId;
    }
    return null;
  }

  /**
   * Check if the given node id is the start node id
   * @return whether the node id is the start node id
   */
  isStartNodeId(nodeId) {
    const project = this.project;
    if (project != null) {
      const startNodeId = project.startNodeId;
      if (nodeId === startNodeId) {
        return true;
      }
    }
    return false;
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
   * Get the constraints authored on the node.
   * @param nodeId The node id of the node.
   * @return An array of constraint JSON objects.
   */
  getConstraintsOnNode(nodeId) {
    let node = this.getNodeById(nodeId);
    return node.constraints;
  }

  /**
   * Check if a node has constraints.
   * @param nodeId The node id of the node.
   * @return Whether the node has constraints authored on it.
   */
  nodeHasConstraint(nodeId) {
    let constraints = this.getConstraintsOnNode(nodeId);
    if (constraints.length > 0) {
      return true;
    }
    return false;
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
    let result = false;
    if (node != null && constraint != null) {
      // check if we have previously calculated the result before
      const rememberedResult = this.getIsNodeAffectedByConstraintResult(node.id, constraint.id, result);
      if (rememberedResult != null) {
        // we have calculated the result before

        // use the remembered result
        result = rememberedResult;
      } else {
        // we have not calculated the result before
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
            if (nodeType === 'node') {
              if (nodeId === targetId) {
                result = true;
              }
            } else if (nodeType === 'group') {
              if (nodeId === targetId) {
                result = true;
              }
              if (this.isNodeDescendentOfGroup(node, targetNode)) {
                result = true;
              }
            }
          }
        }

        // remember the result so we can look it up in the future
        this.setIsNodeAffectedByConstraintResult(node.id, constraint.id, result);
      }
    }
    return result;
  };

  /**
   * Check if a node id comes after another node id in the project
   * @param nodeIdBefore the node id before
   * @param nodeIdAfter the node id after
   */
  isNodeIdAfter(nodeIdBefore, nodeIdAfter) {
    let result = false;
    if (nodeIdBefore != null && nodeIdAfter != null) {
      if (this.isApplicationNode(nodeIdBefore)) {
        // the node id before is a step

        // get all the paths from the beforeNodeId to the end of the project
        const pathsToEnd = this.getAllPaths([], nodeIdBefore, true);

        if (pathsToEnd != null) {
          for (let pathToEnd of pathsToEnd) {
            if (pathToEnd != null) {
              /*
               * remove the first node id and its parent id because
               * we will check the remaining node ids in the array
               * for the nodeIdAfter
               */

              // get the index of the node id before
              const index = pathToEnd.indexOf(nodeIdBefore);

              if (index != -1) {
                // remove the node id before
                pathToEnd.splice(index, 1);
              }

              // get the parent group of the node id before
              const parentGroup = this.getParentGroup(nodeIdBefore);

              if (parentGroup != null) {
                // remove the parent group of the node id before
                const parentGroupId = parentGroup.id;
                const parentGroupIndex = pathToEnd.indexOf(parentGroupId);
                if (parentGroupIndex != -1) {
                  pathToEnd.splice(parentGroupIndex, 1);
                }
              }

              if (pathToEnd.indexOf(nodeIdAfter) != -1) {
                // we have found the nodeIdAfter in the path to the end of the project
                result = true;
              }
            }
          }
        }
      } else {
        // the node id before is an activity

        const group = this.getNodeById(nodeIdBefore);
        if (group != null) {
          const transitions = this.getTransitionsByFromNodeId(nodeIdBefore);
          if (transitions != null) {
            for (let transition of transitions) {
              if (transition != null) {
                const toNodeId = transition.to;

                // get the paths between to toNodeId and the end of the project
                const pathsToEnd = this.getAllPaths([], toNodeId, true);

                for (let pathToEnd of pathsToEnd) {
                  if (pathToEnd != null) {
                    if (pathToEnd.indexOf(nodeIdAfter) != -1) {
                      // we have found the nodeIdAfter in the path to the end of the project
                      result = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return result;
  }

  getNavigationMode() {
    const project = this.project;
    if (project != null) {
      return project.navigationMode;
    }
    return null;
  };

  getTransitions() {
    const project = this.project;
    if (project != null) {
      return project.transitions;
    }
    return null;
  };

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
   * Get the transition logic for a node
   * @param fromNodeId the from node id
   * @returns the transition logic object
   */
  getTransitionLogicByFromNodeId(fromNodeId) {
    if (fromNodeId != null) {
      // get the node
      const node = this.getNodeById(fromNodeId);

      if (node != null) {
        // get the transition logic
        return node.transitionLogic;
      }
    }
    return null;
  };

  /**
   * Get the transitions for a node
   * @param fromNodeId the node to get transitions from
   * @returns an array of transitions
   */
  getTransitionsByFromNodeId(fromNodeId) {
    if (fromNodeId != null) {
      // get the transition logic
      const transitionLogic = this.getTransitionLogicByFromNodeId(fromNodeId);

      if (transitionLogic != null) {
        // get the transitions
        return transitionLogic.transitions;
      }
    }
    return null;
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
    const transitionLogic = node.transitionLogic;
    if (transitionLogic != null) {
      const transitions = transitionLogic.transitions;
      if (transitions != null) {
        for (let transition of transitions) {
          if (transition != null) {
            if (toNodeId === transition.to) {
              return true;
            }
          }
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
  getNodeIdsByToNodeId(toNodeId) {
    const nodeIds = [];
    const nodes = this.getNodesByToNodeId(toNodeId);
    if (nodes != null) {
      for (let node of nodes) {
        if (node != null) {
          nodeIds.push(node.id);
        }
      }
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
        if (group != null) {
          if (this.hasTransitionTo(group, toNodeId)) {
            groupsThatPointToNodeId.push(group);
          }
        }
      }
    }
    return groupsThatPointToNodeId;
  }

  /**
   * Check if a node has a transition to a node id
   * @param node check if this node has a transition to the node id
   * @param toNodeId we will look for a transition to this node id
   * @returns whether the node has a transition to the node id
   */
  hasTransitionTo(node, toNodeId) {
    if (node != null && toNodeId != null) {
      const transitionLogic = node.transitionLogic;
      if (transitionLogic != null) {
        const transitions = transitionLogic.transitions;
        if (transitions != null) {
          for (let transition of transitions) {
            if (toNodeId === transition.to) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Get the transitions that traverse from the fromNodeId and to the toNodeId
   * @param fromNodeId the from node id
   * @param toNodeId the to node id
   * @returns an array of transitions that traverse from the fromNodeId and
   * to the toNodeId
   */
  getTransitionsByFromAndToNodeId(fromNodeId, toNodeId) {
    const transitionsResults = [];
    if (fromNodeId != null && toNodeId != null) {
      const node = this.getNodeById(fromNodeId);
      if (node != null) {
        const transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          const transitions = transitionLogic.transitions;
          if (transitions != null) {
            for (let transition of transitions) {
              if (transition != null) {
                const to = transition.to;
                if (toNodeId === to) {
                  transitionsResults.push(transition);
                }
              }
            }
          }
        }
      }
    }
    return transitionsResults;
  };

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
    if (projectId != null) {
      // get the config URL for the project
      const configURL = window.configURL + '/' + projectId;

      // get the config for the project
      return this.$http.get(configURL).then((result) => {
        const configJSON = result.data;

        if (configJSON != null) {
          // get the project URL and preview project URL
          const projectURL = configJSON.projectURL;
          const previewProjectURL = configJSON.previewProjectURL;

          if (projectURL != null) {
            // get the project JSON
            return this.$http.get(projectURL).then((result) => {
              const projectJSON = result.data;

              /*
               * set the preview project URL into the project JSON
               * so that we easily obtain the preview project URL
               * later
               */
              projectJSON.previewProjectURL = previewProjectURL;

              return projectJSON;
            });
          }
        }
      });
    }
  }

  /**
   * Saves the project to Config.saveProjectURL and returns commit history promise.
   * if Config.saveProjectURL or Config.projectId are undefined, does not save and returns null
   */
  saveProject(commitMessage = "") {
    this.$rootScope.$broadcast('savingProject');
    // perform any cleanup before saving the project
    this.cleanupBeforeSave();

    const projectId = this.ConfigService.getProjectId();
    const saveProjectURL = this.ConfigService.getConfigParam('saveProjectURL');
    if (projectId == null || saveProjectURL == null) {
      return null;
    }

    // Get the project from this service
    const projectJSONString = angular.toJson(this.project, 4);

    const httpParams = {};
    httpParams.method = 'POST';
    httpParams.url = saveProjectURL;
    httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

    const params = {};
    params.projectId = projectId;
    params.commitMessage = commitMessage;
    params.projectJSONString = projectJSONString;
    httpParams.data = $.param(params);

    return this.$http(httpParams).then((result) => {
      const commitHistory = result.data;
      this.$rootScope.$broadcast('projectSaved');
      return commitHistory;
    });
  };

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
   * Remove any fields that are used temporarily for display purposes.
   * @param node The node object.
   */
  cleanupNode(node) {
    /*
     * Remove fields that are added when the project is loaded in the authoring
     * tool and grading tool.
     */
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
   * Remove any fields that are used temporarily for display purposes.
   * @param component The component object.
   */
  cleanupComponent(component) {
    /*
     * Remove fields that are added when the project is loaded in the authoring
     * tool and grading tool.
     */
    delete component.checked;
    delete component.hasWork;
  }

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
   * Returns the theme path for the current project
   */
  getThemePath() {
    let wiseBaseURL = this.ConfigService.getWISEBaseURL();
    let project = this.project;
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

    // get the start node id
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
    let consumedNodeIds = [];

    if (paths != null && nodeId != null) {
      for (let p = 0; p < paths.length; p++) {
        const path = paths[p];

        // check if the path contains the node id to stop consuming at
        if (path != null && path.indexOf(nodeId) != -1) {
          /*
           * the path does contain the node id to stop consuming at
           * so we will consume the node ids in this path until
           * we get to the given node id to stop consuming at
           */

          for (let x = 0; x < path.length; x++) {
            const tempNodeId = path[x];

            if (nodeId === tempNodeId) {
              /*
               * the node id is the same as the one we need to
               * stop consuming at so we will stop looking
               * at this path
               */
              break;
            } else {
              /*
               * the node id is not the one that we need to stop consuming at
               * so we will consume it
               */

              // get all the paths that contain the node id
              const pathsThatContainNodeId = this.getPathsThatContainNodeId(tempNodeId, paths);

              if (pathsThatContainNodeId.length === 1) {
                // there is only one path with this node id

                // remove the node id from the path
                this.removeNodeIdFromPath(tempNodeId, paths, p);

                // move the counter back one since we have just removed a node id
                x--;

                // add the node id to the consumed node ids array
                consumedNodeIds.push(tempNodeId);
              } else {
                // there are multiple paths with this node id

                // tempNodeId must come before nodeId

                const pathsToConsume = [];

                for (let pathThatContainsNodeId of pathsThatContainNodeId) {
                  // get the index of the node id we want to remove
                  const tempNodeIdIndex = pathThatContainsNodeId.indexOf(tempNodeId);

                  // get the index of the node id we want to stop consuming at
                  const nodeIdIndex = pathThatContainsNodeId.indexOf(nodeId);

                  /*
                   * check if the node id we want to remove comes before
                   * the node id we want to stop consuming at. we need to
                   * do this to prevent an infinite loop. an example of
                   * when this can happen is if there are two paths
                   *
                   * path1 = 1, 2, 3, 4, 5
                   * path2 = 1, 2, 4, 3, 5
                   *
                   * as we consume path1 we will need to consume 3. in order to
                   * consume 3, we must consume consume up to 3 in path2.
                   * in order to consume up to 3 in path2 we must consume 4.
                   * in order to consume 4, we must consume everything before
                   * 4 in path1. everything before 4 in path1 is 1, 2, 3.
                   * this means we need to consume 3 which brings us back up
                   * to the top of this paragraph creating an infinite loop.
                   *
                   * this check below will prevent infinite loops by only
                   * adding paths that have the tempNodeId come before the
                   * nodeId to stop consuming at.
                   */
                  if (tempNodeIdIndex < nodeIdIndex) {
                    pathsToConsume.push(pathThatContainsNodeId);
                  }
                }

                /*
                 * take the paths that contain the given node id and consume
                 * the paths until the given node id
                 */
                const tempConsumedNodeIds = this.consumePathsUntilNodeId(pathsToConsume, tempNodeId);

                // remove the node id from the paths that contain it
                this.removeNodeIdFromPaths(tempNodeId, pathsThatContainNodeId);

                // add the temp consumed node ids to our consumed node ids array
                consumedNodeIds = consumedNodeIds.concat(tempConsumedNodeIds);

                // move the counter back one since we have just removed a node id
                x--;

                // add the node id to the consumed node ids array
                consumedNodeIds.push(tempNodeId);
              }
            }
          }
        }
      }
    }
    return consumedNodeIds;
  };

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

  /**
   * Remove the branches cache.
   */
  clearBranchesCache() {
    this.branchesCache = null;
  }

  /**
   * Get the branches in the project
   */
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
   * Check if a node id is in any branch
   * @param branches an array of branch objects
   * @param nodeId the node id to check
   * @return whether the node id is in any branch
   */
  isNodeIdInABranch(branches, nodeId) {
    if (branches != null && nodeId != null) {
      for (let branch of branches) {
        if (branch != null) {
          const branchPaths = branch.branchPaths;
          if (branchPaths != null) {
            for (let branchPath of branchPaths) {
              if (branchPath != null) {
                const index = branchPath.indexOf(nodeId);
                if (index != -1) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
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
    let nodeContent = null;
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        nodeContent = node;
      }
    }
    return nodeContent;
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
   * Update the transitions to handle inserting a node after another node
   * @param node the node to insert
   * @param nodeId the node id to insert after
   */
  insertNodeAfterInTransitions(node, nodeId) {
    const previousNode = this.getNodeById(nodeId);

    if (previousNode != null) {
      if (previousNode.transitionLogic == null) {
        previousNode.transitionLogic = {};
        previousNode.transitionLogic.transitions = [];
      }

      if (node.transitionLogic == null) {
        node.transitionLogic = {};
      }

      if (node.transitionLogic.transitions == null) {
        node.transitionLogic.transitions = [];
      }

      if (this.isGroupNode(node.id)) {
        /*
         * the node we are inserting is a group so we will update
         * the transitions of its children so that they transition
         * to the correct node
         */
        this.updateChildrenTransitionsForMovingGroup(node, nodeId);
      }

      const previousNodeTransitionLogic = previousNode.transitionLogic;

      if (previousNodeTransitionLogic != null) {
        const transitions = previousNodeTransitionLogic.transitions;

        if (transitions != null) {
          const transitionsJSONString = angular.toJson(transitions);
          const transitionsCopy = angular.fromJson(transitionsJSONString);

          // set the transitions from the before node into the inserted node
          node.transitionLogic.transitions = transitionsCopy;
        }
      }

      if (node.transitionLogic.transitions.length == 0) {
        /*
         * The node does not have any transitions so we will look for
         * a transition on the parent group. If the parent has a
         * transition we will use it for the node.
         */

        const parentGroupId = this.getParentGroupId(nodeId);

        if (parentGroupId != null &&
            parentGroupId != '' &&
            parentGroupId != 'group0') {
          const parentTransitions = this.getTransitionsByFromNodeId(parentGroupId);

          if (parentTransitions != null) {
            for (let parentTransition of parentTransitions) {
              const newTransition = {};
              if (parentTransition != null) {
                const toNodeId = parentTransition.to;
                if (this.isGroupNode(toNodeId)) {
                  const startId = this.getGroupStartId(toNodeId);
                  if (startId == null || startId == '') {
                    // there is no start id so we will just use the group id
                    newTransition.to = toNodeId;
                  } else {
                    // there is a start id so we will use it as the to node
                    newTransition.to = startId;
                  }
                } else {
                  newTransition.to = toNodeId;
                }
              }
              node.transitionLogic.transitions.push(newTransition);
            }
          }
        }
      }

      const newNodeId = node.id;

      // TODO handle branching case

      previousNode.transitionLogic.transitions = [];

      const transitionObject = {};
      transitionObject.to = newNodeId;
      previousNode.transitionLogic.transitions.push(transitionObject);
      this.removeBranchPathTakenNodeConstraints(node.id);
      const branchPathTakenConstraints = this.getBranchPathTakenConstraintsByNodeId(nodeId);

      /*
       * if the previous node was in a branch path, we will also put the
       * inserted node into the branch path
       */
      if (branchPathTakenConstraints != null &&
          branchPathTakenConstraints.length > 0) {
        if (node.constraints == null) {
          node.constraints = [];
        }

        for (let branchPathTakenConstraint of branchPathTakenConstraints) {
          if (branchPathTakenConstraint != null) {
            // create a new constraint with the same branch path taken parameters
            const newConstraint = {};
            newConstraint.id = this.getNextAvailableConstraintIdForNodeId(node.id);
            newConstraint.action = branchPathTakenConstraint.action;
            newConstraint.targetId = node.id;
            newConstraint.removalCriteria = this.UtilService.makeCopyOfJSONObject(branchPathTakenConstraint.removalCriteria);
            node.constraints.push(newConstraint);
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
   * Update the transitions to handle inserting a node into a group
   * @param nodeIdToInsert node id that we will insert
   * @param nodeIdToInsertInside the node id of the group we are inserting into
   */
  insertNodeInsideInTransitions(nodeIdToInsert, nodeIdToInsertInside) {
    const nodeToInsert = this.getNodeById(nodeIdToInsert);

    if (nodeToInsert != null &&
        nodeToInsert.transitionLogic != null &&
        nodeToInsert.transitionLogic.transitions != null) {
      nodeToInsert.transitionLogic.transitions = [];

      /*
       * remove the branch path taken constraints from the node we are
       * inserting
       */
      this.removeBranchPathTakenNodeConstraints(nodeIdToInsert);
    }

    const group = this.getNodeById(nodeIdToInsertInside);
    if (this.isGroupNode(nodeIdToInsert)) {
      /*
       * the node we are inserting is a group so we will update
       * the transitions of its children so that they transition
       * to the correct node
       */
      this.updateChildrenTransitionsForMovingGroup(nodeToInsert, null);
    }

    /*
     * since we are inserting a node into a group, the node will become
     * the first node in the group. this means we need to update any nodes
     * that point to the old start id and make them point to the node
     * we are inserting.
     */
    if (nodeToInsert != null && group != null) {
      const startId = group.startId;
      const previousNodes = this.getNodesByToNodeId(startId);

      if (previousNodes == null || previousNodes.length == 0) {
        const previousGroups = this.getGroupNodesByToNodeId(nodeIdToInsertInside);
        for (let previousGroup of previousGroups) {
          if (previousGroup != null) {
            // get the nodes that do not have a transition in the previous group
            const lastNodesInGroup = this.getLastNodesInGroup(previousGroup.id);

            for (let node of lastNodesInGroup) {
              // add a transition from the node to the node we are inserting
              this.addToTransition(node, nodeIdToInsert);
            }
          }
        }
      } else {
        for (let previousNode of previousNodes) {
          if (previousNode != null && previousNode.id != 'group0') {
            // change the transition to point to the node we are inserting
            this.updateToTransition(previousNode, startId, nodeIdToInsert);
          }
        }
      }

      /*
       * update all the transitions that point to the group and change
       * them to point to the new start id
       */
      const nodesThatTransitionToGroup = this.getNodesByToNodeId(nodeIdToInsertInside);

      if (nodesThatTransitionToGroup != null) {
        for (let nodeThatTransitionsToGroup of nodesThatTransitionToGroup) {
          if (!this.isGroupNode(nodeThatTransitionsToGroup.id)) {
            this.updateToTransition(nodeThatTransitionsToGroup, nodeIdToInsertInside, nodeIdToInsert);
          }
        }
      }

      /*
       * create a transition from the node we are inserting to the node that
       * was previously the start node
       */
      if (startId != null && startId != '') {
        const startNode = this.getNodeById(startId);

        if (startNode != null) {
          // the group has a start node which will become the transition to node

          if (nodeToInsert.transitionLogic == null) {
            nodeToInsert.transitionLogic = {};
          }

          if (nodeToInsert.transitionLogic.transitions == null) {
            nodeToInsert.transitionLogic.transitions = [];
          }

          /*
           * make the inserted node transition to the previous start node
           */
          const transitionObject = {};
          transitionObject.to = startId;
          nodeToInsert.transitionLogic.transitions.push(transitionObject);
        }
      }

      // check if the node we inserted has any transitions now
      const transitions = this.getTransitionsByFromNodeId(nodeIdToInsert);

      if (transitions == null || transitions.length == 0) {
        /*
         * the node doesn't have any transitions so we will see if
         * the parent group transitions to anything and use that
         * transition
         */

        const parentTransitions = this.getTransitionsByFromNodeId(nodeIdToInsertInside);

        if (parentTransitions != null) {
          for (let parentTransition of parentTransitions) {
            if (parentTransition != null) {
              const toNodeId = parentTransition.to;
              if (this.isGroupNode(toNodeId)) {
                const nextGroup = this.getNodeById(toNodeId);

                if (nextGroup != null) {
                  const startId = nextGroup.startId;

                  if (startId == null || startId == '') {
                    // there is no start id so we will just transition to the group
                    this.addToTransition(nodeToInsert, toNodeId);
                  } else {
                    // there is a start id so we will transition to that
                    this.addToTransition(nodeToInsert, startId);
                  }
                }
              } else {
                // the to node is not a group

                /*
                 * we will add a transition from the node we are inserting to
                 * to that node
                 */
                this.addToTransition(nodeToInsert, toNodeId);
              }
            }
          }
        }
      }
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
   * Get the nodes in a group that do not have transitions
   * @param groupId the group id
   * @returns the nodes in the group that do not have transitions
   */
  getLastNodesInGroup(groupId) {
    const lastNodes = [];
    if (groupId != null) {
      const group = this.getNodeById(groupId);
      if (group != null) {
        const childIds = group.ids;
        if (childIds != null) {
          for (let childId of childIds) {
            if (childId != null) {
              const child = this.getNodeById(childId);
              if (child != null) {
                const transitionLogic = child.transitionLogic;
                if (transitionLogic != null) {
                  const transitions = transitionLogic.transitions;
                  if (transitions == null || transitions.length == 0) {
                    lastNodes.push(child);
                  }
                }
              }
            }
          }
        }
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

    if (nodeIdsToSkip != null) {
      // there are node ids to skip

      for (let nodeIdToSkip of nodeIdsToSkip) {
        // get the number from the node id e.g. the number of 'node2' would be 2
        let nodeIdNumber = nodeIdToSkip.replace('node', '');

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
    }

    const nextAvailableNodeId = 'node' + (largestNodeIdNumber + 1);
    return nextAvailableNodeId;
  }

  /**
   * Get all the node ids from steps (not groups)
   * @returns an array with all the node ids
   */
  getNodeIds() {
    const nodeIds = [];
    for (let node of this.applicationNodes) {
      if (node != null) {
        const nodeId = node.id;
        if (nodeId != null) {
          nodeIds.push(nodeId);
        }
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
        // we are moving from active to active

        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideInTransitions(tempNodeId, nodeId);
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
        // we are moving from active to inactive

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
        // we are moving from inactive to active

        this.moveToActive(tempNode);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideInTransitions(tempNodeId, nodeId);
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
        // we are moving from inactive to inactive

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
          this.moveInactiveNode(tempNode, nodeId);
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
        // we are moving from active to active

        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (movingNodeIsActive && !stationaryNodeIsActive) {
        // we are moving from active to inactive

        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveToInactive(node, nodeId);
      } else if (!movingNodeIsActive && stationaryNodeIsActive) {
        // we are moving from inactive to active

        this.moveToActive(node);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (!movingNodeIsActive && !stationaryNodeIsActive) {
        // we are moving from inactive to inactive

        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveInactiveNode(node, nodeId);
      }

      // remember the node id so we can put the next node (if any) after this one
      nodeId = node.id;
    }
    return movedNodes;
  }

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
   * Delete a node
   * @param nodeId the node id
   */
  deleteNode(nodeId) {
    /*
     * flag for whether we are deleting the project start node id.
     * if we are deleting the project start node id, we will need
     * to change it to the next logical node id that will be used
     * as the project start.
     */
    let removingProjectStartNodeId = false;

    if (this.isGroupNode(nodeId)) {
      // the node is a group node so we will also remove all of its children
      const group = this.getNodeById(nodeId);

      // TODO check if the child is in another group, if so do not remove

      if (group != null) {
        const ids = group.ids;
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          this.removeNodeIdFromTransitions(id);
          this.removeNodeIdFromGroups(id);
          this.removeNodeIdFromNodes(id);

          if (this.project.startNodeId == id) {
            removingProjectStartNodeId = true;
          }

          /*
           * move the counter back because we have removed a child
           * from the parent group's array of child ids so all of
           * the child ids were shifted back one and the next child
           * we want will be at i--
           */
          i--;
        }
      }
    }

    const parentGroup = this.getParentGroup(nodeId);

    // check if we need to update the start id of the parent group
    if (parentGroup != null) {

      /*
       * the node is the start node of the parent group so we need
       * to update the start id of the parent group to point to
       * the next node
       */
      if (nodeId === parentGroup.startId) {
        let hasSetNewStartId = false;

        const node = this.getNodeById(nodeId);
        if (node != null) {
          const transitionLogic = node.transitionLogic;
          if (transitionLogic != null) {
            const transitions = transitionLogic.transitions;
            if (transitions != null && transitions.length > 0) {
              const transition = transitions[0];
              if (transition != null) {
                const toNodeId = transition.to;
                if (toNodeId != null) {
                  if (this.isNodeInGroup(toNodeId, parentGroup.id)) {
                    parentGroup.startId = toNodeId;
                    hasSetNewStartId = true;
                  }
                }
              }
            }
          }
        }

        if (!hasSetNewStartId) {
          parentGroup.startId = '';
        }
      }
    }

    if (nodeId === this.getStartNodeId()) {
      removingProjectStartNodeId = true;
    }

    if (removingProjectStartNodeId) {
      /*
       * we are removing the project start node id so we need to update
       * the startNodeId to something else
       */

      if (this.isGroupNode(nodeId)) {
        /*
         * we are removing a group so we need to set the startNodeId to
         * the first node of the next group or if the next group doesn't
         * have any nodes, we will just use the next group
         */

        // get the transitions of the group we are removing
        const transitions = this.getTransitionsByFromNodeId(nodeId);

        if (transitions == null || transitions.length == 0) {
          /*
           * the group doesn't have any transitions so we will set
           * the startNodeId to 'group0'
           */
          this.setStartNodeId('group0');
        } else {
          // the group has transitions

          let nextNodeId = null;

          if (transitions[0] != null && transitions[0].to != null) {
            nextNodeId = transitions[0].to;
          }

          if (nextNodeId != null) {
            if (this.isGroupNode(nextNodeId)) {
              const nextGroupNode = this.getNodeById(nextNodeId);

              if (nextGroupNode != null) {
                const nextGroupStartId = nextGroupNode.startId;

                if (nextGroupStartId == null) {
                  /*
                   * the next group does not have a start id so we
                   * will just use the next group id as the project
                   * start node id
                   */
                  this.setStartNodeId(nextNodeId);
                } else {
                  /*
                   * the next group has a start id so we will use
                   * it as the project start node id
                   */
                  this.setStartNodeId(nextGroupStartId);
                }
              }
            } else {
              /*
               * the transition is to a step so we will use it as the
               * project start node id
               */
              this.setStartNodeId(nextNodeId);
            }
          }
        }
      } else {
        /*
         * we are removing a step node so we will set the startNodeId to
         * the next node in the transitions, or if there are no
         * transitions, we will use the parent group
         */

        // get the transitions from the step we are removing
        const transitions = this.getTransitionsByFromNodeId(nodeId);
        const parentGroupId = this.getParentGroupId(nodeId);
        if (transitions == null || transitions.length == 0) {
          this.setStartNodeId(parentGroupId);
        } else {
          if (transitions[0] != null && transitions[0].to != null) {
            let toNodeId = transitions[0].to;
            if (this.isNodeInGroup(toNodeId, parentGroupId)) {
              this.setStartNodeId(toNodeId);
            } else {
              this.setStartNodeId(this.getParentGroupId(nodeId));
            }
          }
        }
      }
    }

    this.removeNodeIdFromTransitions(nodeId);
    this.removeNodeIdFromGroups(nodeId);
    this.removeNodeIdFromNodes(nodeId);

    if (parentGroup != null) {
      this.recalculatePositionsInGroup(parentGroup.id);
    }
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
      /*
       * this is a group node so we will remove all child transitions that
       * go out of this group
       */
      this.removeTransitionsOutOfGroup(nodeId);
    }
  };

  /**
   * Remove the node id from a group
   * @param nodeId the node id to remove
   */
  removeNodeIdFromGroups(nodeId) {
    const groups = this.getGroupNodes();
    for (let group of groups) {
      this.removeNodeIdFromGroup(group, nodeId);
    }
    const inactiveGroups = this.getInactiveGroupNodes();
    for (let inactiveGroup of inactiveGroups) {
      this.removeNodeIdFromGroup(inactiveGroup, nodeId);
    }
  }

  /**
   * Remove a node id from a group.
   * @param group The group to remove from.
   * @param nodeId The node id to remove.
   */
  removeNodeIdFromGroup(group, nodeId) {
    const startId = group.startId;
    const ids = group.ids;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (nodeId === id) {
        ids.splice(i, 1);

        if (nodeId === startId) {
          /*
           * the node id is also the start id so we will get the
           * next node id and set it as the new start id
           */

          let hasSetNewStartId = false;

          const node = this.getNodeById(id);

          if (node != null) {
            const transitionLogic = node.transitionLogic;
            if (transitionLogic != null) {
              const transitions = transitionLogic.transitions;
              if (transitions != null && transitions.length > 0) {
                // get the first transition
                // TODO handle the case when the node we are removing is a branch point
                const transition = transitions[0];

                if (transition != null) {
                  const to = transition.to;

                  if (to != null) {
                    group.startId = to;
                    hasSetNewStartId = true;
                  }
                }
              }
            }
          }

          if (!hasSetNewStartId) {
            /*
             * the node we are removing did not have a transition
             * so there will be no start id
             */
            group.startId = '';
          }
        }
      }
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
          if (nodeId === inactiveNodeId) {
            /*
             * we have found the node we are looking for so we will
             * remove it
             */
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
      // get the node we will create the component in
      const node = this.getNodeById(nodeId);

      // get the service for the component type
      const service = this.$injector.get(componentType + 'Service');

      if (node != null && service != null) {
        // create the new component
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
            // the step is not showing a save button

            if (this.doesAnyComponentShowSubmitButton(node.id)) {
              /*
               * at least one of the other components in the step are
               * showing a submit button so we will also show the save
               * button on this new component
               */

              // turn on the component save button
              component.showSaveButton = true;
            } else {
              /*
               * none of the other components are showing a submit button
               * so we will show the save button on the step
               */

              // turn on the step save button
              node.showSaveButton = true;
            }
          }
        }

        // add the component to the node
        this.addComponentToNode(node, component, insertAfterComponentId);
      }
    }
    return component;
  }

  /**
   * Does any component in the step generate work
   * @param nodeId the node id
   * @return whether any components in the step generates work
   */
  doesAnyComponentHaveWork(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            const componentType = component.type;
            const service = this.$injector.get(componentType + 'Service');
            if (service != null) {
              if (service.componentHasWork()) {
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
   * Check if any of the components in the node are showing their save button
   * @param nodeId the node id to check
   * @return whether any of the components in the node show their save button
   */
  doesAnyComponentShowSaveButton(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            if (component.showSaveButton == true) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if any of the components in the node are showing their submit button
   * @param nodeId the node id to check
   * @return whether any of the components in the node show their submit button
   */
  doesAnyComponentShowSubmitButton(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            if (component.showSubmitButton == true) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Turn on the save button in all the components in the step
   * @param nodeId the node id
   */
  turnOnSaveButtonInComponents(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            const componentType = component.type;
            if (componentType != null) {
              const service = this.$injector.get(componentType + 'Service');
              if (service != null) {
                if (service.componentUsesSaveButton()) {
                  component.showSaveButton = true;
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Turn off the submit button in all the components in the step
   * @param nodeId the node id
   */
  turnOffSaveButtonInComponents(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            const componentType = component.type;
            if (componentType != null) {
              const service = this.$injector.get(componentType + 'Service');
              if (service != null) {
                if (service.componentUsesSaveButton()) {
                  component.showSaveButton = false;
                }
              }
            }
          }
        }
      }
    }
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

            // add the component
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
    // get the node for which we are moving components
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
    if (nodeId != null && componentId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const components = node.components;
        if (components != null) {
          for (let c = 0; c < components.length; c++) {
            const component = components[c];
            if (component.id === componentId) {
              // we have found the component we want to delete

              // remove the component
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
   * @param nodeId the node id
   * @returns the max score for the node
   */
  getMaxScoreForNode(nodeId) {
    let maxScore = null;
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const components = node.components;
      if (components != null) {
        for (let component of components) {
          if (component != null) {
            const componentMaxScore = component.maxScore;

            // check if the component has a max score
            if (componentMaxScore != null) {
              // make sure the max score is a valid number
              if (!isNaN(componentMaxScore)) {
                if (maxScore == null) {
                  maxScore = componentMaxScore;
                } else {
                  // accumulate the max score
                  maxScore += componentMaxScore;
                }
              }
            }
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
    const childIds = group.ids;
    if (childIds != null) {
      if (childIds.indexOf(nodeId) != -1) {
        return true;
      }
    }
    return false;
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
        // set the first leaf node id to the group id for now
        firstLeafNodeId = node.id;

        node = this.getNodeById(node.startId);
      } else if (this.isApplicationNode(node.id)) {
        // the current node is a leaf
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
   * Check if a node is a planning node
   * @param nodeId the node id
   * @returns whether the node is a planning node
   */
  isPlanning(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        if (node.planning) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a node is a planning node instance
   * @param nodeId the node id
   * @returns whether the node is a planning node instance
   */
  isPlanningInstance(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node.planningNodeTemplateId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the available planning node ids for a node
   * @param nodeId the node we want available planning nodes for
   * @returns an array of available planning node ids
   */
  getAvailablePlanningNodeIds(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null && node.availablePlanningNodeIds != null) {
        return node.availablePlanningNodeIds;
      }
    }
    return [];
  }

  /**
   * Get the available planning nodes for a given group
   * @param nodeId the node id of the group
   * @returns an array of planning node templates
   */
  getAvailablePlanningNodes(nodeId) {
    const availablePlanningNodesSoFar = [];
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null && node.availablePlanningNodes != null) {
        let availablePlanningNodes = node.availablePlanningNodes;
        for (let availablePlanningNode of availablePlanningNodes) {
          if (availablePlanningNode != null) {
            const availablePlanningNodeActual =
                this.getNodeById(availablePlanningNode.nodeId);
            if (availablePlanningNodeActual != null) {
              if (availablePlanningNode.max != null) {
                availablePlanningNodeActual.max = availablePlanningNode.max;
              }
              availablePlanningNodesSoFar.push(availablePlanningNodeActual);
            }
          }
        }
      }
    }
    return availablePlanningNodesSoFar;
  }

  /**
   * Create a planning node instance and add it to the project
   * @param groupId the group id to add the planning node instance to
   * @param nodeId the node id of the planning node template
   */
  createPlanningNodeInstance(groupId, nodeId, nextAvailablePlanningNodeId) {
    let planningNodeInstance = null;
    if (nodeId != null && nextAvailablePlanningNodeId != null) {
      // create a planning node instance by copying the planning node template
      planningNodeInstance = this.copyNode(nodeId);

      // set the template id to point back to the planning template node
      planningNodeInstance.planningNodeTemplateId = nodeId;

      // set the planning node instance node id
      planningNodeInstance.id = nextAvailablePlanningNodeId;
    }
    return planningNodeInstance;
  }

  /**
   * Add a planning node instance inside a group node
   * @param nodeIdToInsertInside the group id to insert into
   * @param planningNodeInstance the planning node instance to add
   */
  addPlanningNodeInstanceInside(nodeIdToInsertInside, planningNodeInstance) {
    const planningNodeInstanceNodeId = planningNodeInstance.id;

    // add an entry in our mapping data structures of node id to object
    this.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
    this.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);

    // add the node to the nodes array in the project
    this.addNode(planningNodeInstance);

    // update the transitions
    this.insertNodeInsideInTransitions(planningNodeInstanceNodeId, nodeIdToInsertInside);

    // update the child ids of the group
    this.insertNodeInsideInGroups(planningNodeInstanceNodeId, nodeIdToInsertInside);

    // recalculate all the position values in the group
    this.recalculatePositionsInGroup(nodeIdToInsertInside);

    /*
     * set the order of the planning node instance so that it shows up
     * in the select step drop down in the correct order
     */
    this.setNodeOrder(this.rootNode, 0);
  }

  /**
   * Add a planning node instance after a node
   * @param nodeIdToInsertAfter the node to insert after
   * @param planningNodeInstance the planning node instance to add
   */
  addPlanningNodeInstanceAfter(nodeIdToInsertAfter, planningNodeInstance) {
    const planningNodeInstanceNodeId = planningNodeInstance.id;

    // add an entry in our mapping data structures of node id to object
    this.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
    this.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);

    // add the node to the nodes array in the project
    this.addNode(planningNodeInstance);

    // update the transitions
    this.insertNodeAfterInTransitions(planningNodeInstance, nodeIdToInsertAfter);

    // update the child ids of the group
    this.insertNodeAfterInGroups(planningNodeInstanceNodeId, nodeIdToInsertAfter);

    const parentGroup = this.getParentGroup(nodeIdToInsertAfter);

    if (parentGroup != null) {
      const parentGroupId = parentGroup.id;

      // recalculate all the position values in the group
      this.recalculatePositionsInGroup(parentGroupId);
    }

    /*
     * set the order of the planning node instance so that it shows up
     * in the select step drop down in the correct order
     */
    this.setNodeOrder(this.rootNode, 0);
  }

  /**
   * Move a planning node instance inside a group
   * @param nodeIdToMove the node to move
   * @param nodeIdToInsertInside the group to move the node into
   */
  movePlanningNodeInstanceInside(nodeIdToMove, nodeIdToInsertInside) {
    this.moveNodesInside([nodeIdToMove], nodeIdToInsertInside);
    this.recalculatePositionsInGroup(nodeIdToInsertInside);

    /*
     * set the order of the planning node instance so that it shows up
     * in the select step drop down in the correct order
     */
    this.setNodeOrder(this.rootNode, 0);
  }

  /**
   * Move a planning node instance after a node
   * @param nodeIdToMove the node to move
   * @param nodeIdToInsertAfter the other node to move the node after
   */
  movePlanningNodeInstanceAfter(nodeIdToMove, nodeIdToInsertAfter) {
    this.moveNodesAfter([nodeIdToMove], nodeIdToInsertAfter);
    const parentGroup = this.getParentGroup(nodeIdToInsertAfter);

    if (parentGroup != null) {
      const parentGroupId = parentGroup.id;
      this.recalculatePositionsInGroup(parentGroupId);
    }

    /*
     * set the order of the planning node instance so that it shows up
     * in the select step drop down in the correct order
     */
    this.setNodeOrder(this.rootNode, 0);
  }

  /**
   * Recalculate the positions of the children in the group.
   * The positions are the numbers usually seen before the title
   * e.g. if the step is seen as 1.3: Gather Evidence, then 1.3
   * is the position
   * @param groupId recalculate all the children of this group
   */
  recalculatePositionsInGroup(groupId) {
    if (groupId != null) {
      let childIds = this.getChildNodeIdsById(groupId);
      for (let childId of childIds) {
        let pos = this.getPositionById(childId);
        this.setIdToPosition(childId, pos);
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

        // get the number of times the student must submit
        const requiredSubmitCount = params.requiredSubmitCount;

        if (nodeId != null) {
          // get the step number and title
          nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        }

        // generate the message
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
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);

      if (node != null) {
        return node.startId;
      }
    }
    return null;
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
  updateChildrenTransitionsForMovingGroup(node, nodeId) {
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
            // get the first activity
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

  /**
   * Check if a component is a connected component
   * @param nodeId the node id of the component
   * @param componentId the component that is listening for connected changes
   * @param connectedComponentId the component that is broadcasting connected changes
   * @returns whether the componentId is connected to the connectedComponentId
   */
  isConnectedComponent(nodeId, componentId, connectedComponentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      const connectedComponents = component.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
          if (connectedComponent != null) {
            /*
             * check if the connected component id matches the one
             * we are looking for. connectedComponent.id is the old
             * field we used to store the component id in so we will
             * look for that field for the sake of backwards
             * compatibility. connectedComponent.componentId is the
             * new field we store the component id in.
             */
            if (connectedComponentId === connectedComponent.id ||
                connectedComponentId === connectedComponent.componentId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Get a connected component params
   * @param componentId the connected component id
   * @returns the params for the connected component
   */
  getConnectedComponentParams(componentContent, componentId) {
    let connectedComponentParams = null;
    if (componentContent != null && componentId != null) {
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
          if (connectedComponent != null) {
            /*
             * check if the connected component id matches the one
             * we are looking for. connectedComponent.id is the old
             * field we used to store the component id in so we will
             * look for that field for the sake of backwards
             * compatibility. connectedComponent.componentId is the
             * new field we store the component id in.
             */
            if (componentId === connectedComponent.id ||
                componentId === connectedComponent.componentId) {
              connectedComponentParams = connectedComponent;
            }
          }
        }
      }
    }
    return connectedComponentParams;
  }

  /**
   * Get the active nodes.
   * @return An array of the active node objects.
   */
  getActiveNodes() {
    return this.project.nodes;
  }

  /**
   * Get the inactive nodes
   * @returns the inactive nodes
   */
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
   * Remove the node from the active nodes
   * @param nodeId the node to remove
   * @returns the node that we have removed
   */
  removeNodeFromActiveNodes(nodeId) {
    let node = null;
    if (nodeId != null) {
      const activeNodes = this.project.nodes;
      if (activeNodes != null) {
        for (let a = 0; a < activeNodes.length; a++) {
          const activeNode = activeNodes[a];
          if (activeNode != null) {
            if (nodeId === activeNode.id) {
              node = activeNode;

              // remove the node from the array
              activeNodes.splice(a, 1);

              if (activeNode.type == 'group') {
                this.removeChildNodesFromActiveNodes(activeNode);
              }
              break;
            }
          }
        }
      }
    }
    return node;
  }

  /**
   * Move the child nodes of a group from the active nodes and put them into
   * the inactive nodes.
   * @param node The group node.
   */
  removeChildNodesFromActiveNodes(node) {
    if (node != null) {
      let childIds = node.ids;
      for (let childId of childIds) {
        this.removeNodeFromActiveNodes(childId);
      }
    }
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
        // The node has a parent so we will remove it from the parent.
        this.removeChildFromParent(nodeId);
      }

      let inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        for (let i = 0; i < inactiveNodes.length; i++) {
          let inactiveNode = inactiveNodes[i];
          if (inactiveNode != null) {
            if (nodeId === inactiveNode.id) {
              node = inactiveNode;

              // remove the node from the array
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
   * Check if the node is active
   * @param nodeId the node to check
   * @param componentId (optional) the component to check
   * @returns whether the node or component is active
   */
  isActive(nodeId, componentId) {
    if (nodeId != null) {
      if (nodeId === 'inactiveNodes') {
        // this occurs when the author puts a step into the inactive nodes
        return false;
      } else if (nodeId === 'inactiveGroups') {
        // this occurs when the author puts a group into the inactive groups
        return false;
      } else if (this.isGroupNode(nodeId)) {
        return this.isGroupActive(nodeId);
      } else {
        // the node is a step node

        const activeNodes = this.project.nodes;
        if (activeNodes != null) {
          for (let activeNode of activeNodes) {
            if (activeNode != null) {
              const activeNodeId = activeNode.id;
              if (nodeId == activeNodeId) {
                // we have found the node id we are looking for

                if (componentId != null) {
                  // we need to find the node id and component id

                  const activeComponents = activeNode.components;

                  if (activeComponents != null) {
                    for (let activeComponent of activeComponents) {
                      if (activeComponent != null) {
                        const activeComponentId = activeComponent.id;
                        if (componentId == activeComponentId) {
                          /*
                           * we have found the component id we are
                           * looking for so we are done
                           */
                          return true;
                        }
                      }
                    }
                  }
                } else {
                  //we only need to find the node id so we are done
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
   * Check if a group is active.
   * @param nodeId the node id of the group
   */
  isGroupActive(nodeId) {
    for (let activeNode of this.project.nodes) {
      if (nodeId == activeNode.id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Move the node to the active nodes array
   */
  moveToActive(node) {
    if (node != null) {
      if (!this.isActive(node.id)) {
        // the node is inactive so we will move it to the active array

        // remove the node from inactive nodes array
        this.removeNodeFromInactiveNodes(node.id);

        this.addNode(node);

        if (this.isGroupNode(node.id)) {
          /*
           * This is a group node so we will also move all of its
           * children to active.
           */
          let childIds = node.ids;
          for (let childId of childIds) {
            let childNode = this.removeNodeFromInactiveNodes(childId);
            this.addNode(childNode);
          }
        }
      }
    }
  }

  /**
   * Move the node to the inactive nodes array
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  moveToInactive(node, nodeIdToInsertAfter) {
    if (node != null) {
      if (this.isActive(node.id)) {
        // the node is active so we will move it to the inactive array

        this.removeNodeFromActiveNodes(node.id);

        // add the node to the inactive array
        this.addInactiveNode(node, nodeIdToInsertAfter);
      }
    }
  }

  /**
   * Move the node from active to inside an inactive group
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this
   */
  moveFromActiveToInactiveInsertInside(node, nodeIdToInsertInside) {
    this.removeNodeFromActiveNodes(node.id);

    // add the node to the inactive array
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
   * Add the node to the inactive nodes array
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  addInactiveNode(node, nodeIdToInsertAfter) {
    if (node != null) {
      const inactiveNodes = this.project.inactiveNodes;

      if (inactiveNodes != null) {
        // clear the transitions from this node
        if (node.transitionLogic != null) {
          node.transitionLogic.transitions = [];
        }

        if (nodeIdToInsertAfter == null || nodeIdToInsertAfter === 'inactiveNodes' || nodeIdToInsertAfter === 'inactiveSteps' || nodeIdToInsertAfter === 'inactiveGroups') {
          // put the node at the beginning of the inactive steps
          inactiveNodes.splice(0, 0, node);
        } else {
          // put the node after one of the inactive nodes

          let added = false;
          for (let i = 0; i < inactiveNodes.length; i++) {
            const inactiveNode = inactiveNodes[i];
            if (inactiveNode != null) {
              if (nodeIdToInsertAfter === inactiveNode.id) {
                let parentGroup = this.getParentGroup(nodeIdToInsertAfter);
                if (parentGroup != null) {
                  this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
                  this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
                }
                // we have found the position to place the node
                inactiveNodes.splice(i + 1, 0, node);
                added = true;
              }
            }
          }

          if (!added) {
            /*
             * we haven't added the node yet so we will just add it
             * to the end of the array
             */
            inactiveNodes.push(node);
          }
        }

        if (node.type == 'group') {
          this.inactiveGroupNodes.push(node.id);
          this.addGroupChildNodesToInactive(node);
        } else {
          this.inactiveStepNodes.push(node.id);
        }
      }
    }
  }

  /**
   * Add the node to the inactive nodes array
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this group
   */
  addInactiveNodeInsertInside(node, nodeIdToInsertInside) {
    if (node != null) {
      const inactiveNodes = this.project.inactiveNodes;
      const inactiveGroups = this.getInactiveGroupNodes();

      if (inactiveNodes != null) {
        // clear the transitions from this node
        if (node.transitionLogic != null) {
          node.transitionLogic.transitions = [];
        }

        if (nodeIdToInsertInside == null || nodeIdToInsertInside === 'inactiveNodes' || nodeIdToInsertInside === 'inactiveSteps' || nodeIdToInsertInside === 'inactiveGroups') {
          // put the node at the beginning of the inactive steps
          inactiveNodes.splice(0, 0, node);
        } else {
          // put the node after one of the inactive nodes

          let added = false;
          for (let inactiveGroup of inactiveGroups) {
            if (nodeIdToInsertInside == inactiveGroup.id) {
              // we have found the group we want to insert into
              this.insertNodeInsideInTransitions(node.id, nodeIdToInsertInside);
              this.insertNodeInsideInGroups(node.id, nodeIdToInsertInside);

              /*
               * Loop through the inactive nodes array which contains all
               * inactive groups and inactive nodes in a flattened array.
               * Find the inactive group and place the node right after it
               * for the sake of keeping things organized.
               */
              for (let i = 0; i < inactiveNodes.length; i++) {
                let inactiveNode = inactiveNodes[i];
                if (nodeIdToInsertInside == inactiveNode.id) {
                  inactiveNodes.splice(i + 1, 0, node);
                  added = true;
                }
              }
            }
          }

          if (!added) {
            /*
             * we haven't added the node yet so we will just add it
             * to the end of the array
             */
            inactiveNodes.push(node);
          }
        }

        if (node.type == 'group') {
          this.inactiveGroupNodes.push(node.id);
          this.addGroupChildNodesToInactive(node);
        } else {
          this.inactiveStepNodes.push(node.id);
        }
      }
    }
  }

  /**
   * Add a group's child nodes to the inactive nodes.
   * @param node The group node.
   */
  addGroupChildNodesToInactive(node) {
    if (node != null) {
      let childIds = node.ids;
      for (let childId of childIds) {
        let childNode = this.getNodeById(childId);
        this.project.inactiveNodes.push(childNode);
        this.inactiveStepNodes.push(childNode);
      }
    }
  }

  /**
   * Move an inactive node within the inactive nodes array
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  moveInactiveNode(node, nodeIdToInsertAfter) {
    if (node != null) {
      const inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        // remove the node from inactive nodes

        for (let i = 0; i < inactiveNodes.length; i++) {
          const inactiveNode = inactiveNodes[i];
          if (inactiveNode != null) {
            if (node.id === inactiveNode.id) {
              // we have found the node we want to remove
              inactiveNodes.splice(i, 1);
            }
          }
        }

        // add the node back into the inactive nodes

        if (nodeIdToInsertAfter == null || nodeIdToInsertAfter === 'inactiveSteps' || nodeIdToInsertAfter === 'inactiveNodes') {
          // put the node at the beginning of the inactive nodes
          inactiveNodes.splice(0, 0, node);
        } else {
          // put the node after one of the inactive nodes

          let added = false;
          for (let i = 0; i < inactiveNodes.length; i++) {
            const inactiveNode = inactiveNodes[i];
            if (inactiveNode != null) {
              if (nodeIdToInsertAfter === inactiveNode.id) {
                // we have found the position to place the node
                let parentGroup = this.getParentGroup(nodeIdToInsertAfter);
                if (parentGroup != null) {
                  this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
                  this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
                }
                inactiveNodes.splice(i + 1, 0, node);
                added = true;
              }
            }
          }

          if (!added) {
            /*
             * we haven't added the node yet so we will just add it
             * to the end of the array
             */
            inactiveNodes.push(node);
          }
        }
      }
    }
  }

  /**
   * Remove transitions that go into the group
   * @param nodeId the group id
   */
  removeTransitionsIntoGroup(nodeId) {
    if (nodeId != null) {
      const group = this.getNodeById(nodeId);
      if (group != null) {
        const childIds = group.ids;
        if (childIds != null) {
          for (let childId of childIds) {
            if (childId != null) {
              this.removeTransitionsThatPointToNodeIdFromOutsideGroup(childId);
            }
          }
        }
      }
    }
  }

  /**
   * Remove the transitions that point to the node that does not have
   * the same parent
   * @param nodeId remove transitions to this node
   */
  removeTransitionsThatPointToNodeIdFromOutsideGroup(nodeId) {
    if (nodeId != null) {
      const parentGroupId = this.getParentGroupId(nodeId);
      const nodesThatPointToTargetNode = this.getNodesByToNodeId(nodeId);

      if (nodesThatPointToTargetNode != null) {
        for (let nodeThatPointsToTargetNode of nodesThatPointToTargetNode) {
          if (nodeThatPointsToTargetNode != null) {
            const nodeThatPointsToTargetNodeParentGroupId =
                this.getParentGroupId(nodeThatPointsToTargetNode.id);

            if (parentGroupId != nodeThatPointsToTargetNodeParentGroupId) {
              /*
               * the parent groups are different so we will remove
               * the transition
               */
              this.removeTransition(nodeThatPointsToTargetNode, nodeId);
            }
          }
        }
      }
    }
  }

  /**
   * Remove a transition
   * @param node remove a transition in this node
   * @param toNodeId remove the transition that goes to this node id
   */
  removeTransition(node, toNodeId) {
    if (node != null && toNodeId != null) {
      const transitionLogic = node.transitionLogic;
      if (transitionLogic != null) {
        const transitions = transitionLogic.transitions;
        if (transitions != null) {
          for (let t = 0; t < transitions.length; t++) {
            const transition = transitions[t];
            if (transition != null) {
              if (toNodeId === transition.to) {
                // we have found a transition that goes to the toNodeId

                // remove the transition
                transitions.splice(t, 1);
                t--;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Remove transitions that go out of the group
   * @param nodeId the group id
   */
  removeTransitionsOutOfGroup(nodeId) {
    if (nodeId != null) {
      const group = this.getNodeById(nodeId);
      if (group != null) {
        const childIds = group.ids;
        if (childIds != null) {
          for (let childId of childIds) {
            if (childId != null) {
              const transitions = this.getTransitionsByFromNodeId(childId);
              if (transitions != null) {
                for (let t = 0; t < transitions.length; t++) {
                  const transition = transitions[t];
                  if (transition != null) {
                    const toNodeId = transition.to;
                    if (toNodeId != null) {
                      const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);
                      if (nodeId != toNodeIdParentGroupId) {
                        /*
                         * the parent group is different which means it is a
                         * transition that goes out of the group
                         */

                        // remove the transition
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

                    // get the parent group id of the toNodeId
                    const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

                    if (groupIdWeAreMoving === toNodeIdParentGroupId) {
                      // the transition is to a child in the group we are moving

                      // remove the transition
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
   * Get the node ids and component ids in a node
   * @param nodeId get the node ids and component ids in this node
   * @returns an array of objects. the objects contain a node id
   * and component id.
   */
  getNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    if (nodeId != null) {
      const nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent != null) {
        const components = nodeContent.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              const componentId = component.id;
              const nodeIdAndComponentId = {};
              nodeIdAndComponentId.nodeId = nodeId;
              nodeIdAndComponentId.componentId = componentId;
              nodeIdAndComponentIds.push(nodeIdAndComponentId);
            }
          }
        }
      }
    }
    return nodeIdAndComponentIds;
  }

  /**
   * Get the show previous work node ids and component ids in a node
   * @param nodeId get the show previous work node ids and component ids in
   * this node
   * @returns an array of objects. the objects contain a node id
   * and component id.
   */
  getShowPreviousWorkNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    if (nodeId != null) {
      const nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent != null) {
        const components = nodeContent.components;
        if (components != null) {
          for (let component of components) {
            if (component != null) {
              const showPreviousWorkNodeId = component.showPreviousWorkNodeId;
              const showPreviousWorkComponentId =
                  component.showPreviousWorkComponentId;
              if (showPreviousWorkNodeId != null &&
                  showPreviousWorkComponentId != null) {
                const nodeIdAndComponentId = {};
                nodeIdAndComponentId.nodeId = showPreviousWorkNodeId;
                nodeIdAndComponentId.componentId = showPreviousWorkComponentId;
                nodeIdAndComponentIds.push(nodeIdAndComponentId);
              }
            }
          }
        }
      }
    }
    return nodeIdAndComponentIds;
  }

  /**
   * Check if we need to display the annotation to the student
   * @param annotation the annotation
   * @returns whether we need to display the annotation to the student
   */
  displayAnnotation(annotation) {
    let result = true;
    if (annotation != null) {
      const nodeId = annotation.nodeId;
      const componentId = annotation.componentId;
      const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
        const componentType = component.type;

        // get the component service
        const componentService = this.$injector.get(componentType + 'Service');

        if (componentService != null && componentService.displayAnnotation != null) {
          result = componentService.displayAnnotation(component, annotation);
        }
      }
    }
    return result;
  }

  /**
   * Get the global annotation properties for the specified component and score, if exists.
   * @param component the component content
   * @param previousScore the previousScore we want the annotation properties for, can be null, which means we just want to look at
   * the currentScore
   * @param currentScore the currentScore we want the annotation properties for
   * @returns the annotation properties for the given score
   */
  getGlobalAnnotationGroupByScore(component, previousScore, currentScore) {
    let annotationGroup = null;
    if (component.globalAnnotationSettings != null &&
        component.globalAnnotationSettings.globalAnnotationGroups != null) {
      let globalAnnotationGroups = component.globalAnnotationSettings.globalAnnotationGroups;
      for (let globalAnnotationGroup of globalAnnotationGroups) {
        if (globalAnnotationGroup.enableCriteria != null &&
            globalAnnotationGroup.enableCriteria.scoreSequence != null) {
          let scoreSequence = globalAnnotationGroup.enableCriteria.scoreSequence;
          if (scoreSequence != null) {
            /*
             * get the expected previous score and current score
             * that will satisfy the rule
             */
            let previousScoreMatch = scoreSequence[0];
            let currentScoreMatch = scoreSequence[1];

            if (previousScore == null) {
              // just matching on the current score
              if (previousScoreMatch == "" &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                // found a match
                annotationGroup = globalAnnotationGroup;
                break;
              }
            } else {
              if (previousScore.toString().match("[" + previousScoreMatch + "]") &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                /*
                 * the previous score and current score match the
                 * expected scores so we have found the rule we want
                 */
                annotationGroup = globalAnnotationGroup;
                break;
              }
            }
          }
        }
      }
    }
    return annotationGroup;
  }

  /**
   * Get the notification for the given score, if exists.
   * @param component the component content
   * @param previousScore the previousScore we want notification for, can be null, which means we just want to look at
   * the currentScore
   * @param currentScore the currentScore we want notification for
   * @returns the notification for the given score
   */
  getNotificationByScore(component, previousScore, currentScore) {
    let notificationResult = null;
    if (component.notificationSettings != null &&
        component.notificationSettings.notifications != null) {
      let notifications = component.notificationSettings.notifications;
      for (let notification of notifications) {
        if (notification.enableCriteria != null &&
            notification.enableCriteria.scoreSequence != null) {
          let scoreSequence = notification.enableCriteria.scoreSequence;
          if (scoreSequence != null) {
            /*
             * get the expected previous score and current score
             * that will satisfy the rule
             */
            let previousScoreMatch = scoreSequence[0];
            let currentScoreMatch = scoreSequence[1];

            if (previousScore == null) {
              // just matching on the current score
              if (previousScoreMatch == "" &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                notificationResult = notification;
                break;
              }
            } else {
              if (previousScore.toString().match("[" + previousScoreMatch + "]") &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                /*
                 * the previous score and current score match the
                 * expected scores so we have found the rule we want
                 */
                notificationResult = notification;
                break;
              }
            }
          }
        }
      }
    }
    return notificationResult;
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
          "question": {
            "type": "question",
            "enabled": false,
            "enableLink": true,
            "enableClipping": true,
            "enableStudentUploads": true,
            "label": {
              "singular": this.$translate('QUESTION_LOWER_CASE'),
              "plural": this.$translate('QUESTIONS_LOWER_CASE'),
              "link": this.$translate('QUESTIONS'),
              "icon": "live_help",
              "color": "#F57C00"
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
      "inactiveNodes": []
    };
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
   * @param nodeId the node id
   * @param componentId the component id
   * @return whether the component generates work
   */
  componentHasWorkByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null) {
      const nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent != null) {
        const components = nodeContent.components;
        if (components != null) {
          for (let component of components) {
            if (component != null && componentId == component.id) {
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
        // generate a new id
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
   * Get the next available constraint id for a node
   * @param nodeId get the next available constraint id for this node
   * e.g. node8Constraint2
   * @return the next available constraint id for the node
   */
  getNextAvailableConstraintIdForNodeId(nodeId) {
    let nextAvailableConstraintId = null;
    if (nodeId != null) {
      // an array to hold the constraint ids that are already being used
      const usedConstraintIds = [];
      const node = this.getNodeById(nodeId);

      if (node != null) {
        const constraints = node.constraints;
        if (constraints != null) {
          for (let constraint of constraints) {
            if (constraint != null) {
              const constraintId = constraint.id;

              // add the constraint id to the array of used constraint ids
              usedConstraintIds.push(constraintId);
            }
          }
        }
      }

      let foundNextAvailableConstraintId = false;
      let counter = 1;

      while (!foundNextAvailableConstraintId) {
        const potentialConstraintId = nodeId + 'Constraint' + counter;
        // check if the constraint id has been used
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
   * Set the criteria params field
   * @param criteria the criteria object
   * @param field the field name
   * @param value the value to set into the field
   */
  setCriteriaParamsField(criteria, field, value) {
    if (criteria != null) {
      if (criteria.params == null) {
        criteria.params = {};
      }
      criteria.params[field] = value;
    }
  }

  /**
   * Get the criteria params field
   * @param criteria the criteria object
   * @param field the field name
   */
  getCriteriaParamsField(criteria, field) {
    if (criteria != null) {
      const params = criteria.params;
      if (params != null) {
        return params[field];
      }
    }
    return null;
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
            /*
             * this node has the the branch path taken constraint we are
             * looking for
             */
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
    if (node != null) {
      const constraints = node.constraints;
      if (constraints != null) {
        for (let constraint of constraints) {
          if (constraint != null) {
            const removalCriteria = constraint.removalCriteria;
            if (removalCriteria != null) {
              for (let removalCriterion of removalCriteria) {
                if (removalCriterion != null) {
                  const name = removalCriterion.name;
                  if (name == 'branchPathTaken') {
                    const params = removalCriterion.params;
                    if (params != null) {
                      if (fromNodeId == params.fromNodeId && toNodeId == params.toNodeId) {
                        return true;
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
    return false;
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
        const makeThisNodeNotVisibleConstraint = {};
        makeThisNodeNotVisibleConstraint.id = this.getNextAvailableConstraintIdForNodeId(targetNodeId);
        makeThisNodeNotVisibleConstraint.action = 'makeThisNodeNotVisible';
        makeThisNodeNotVisibleConstraint.targetId = targetNodeId;
        makeThisNodeNotVisibleConstraint.removalCriteria = [];
        const notVisibleRemovalCriterion = {};
        notVisibleRemovalCriterion.name = 'branchPathTaken';
        notVisibleRemovalCriterion.params = {};
        notVisibleRemovalCriterion.params.fromNodeId = fromNodeId;
        notVisibleRemovalCriterion.params.toNodeId = toNodeId;
        makeThisNodeNotVisibleConstraint.removalConditional = 'all';
        makeThisNodeNotVisibleConstraint.removalCriteria.push(notVisibleRemovalCriterion);
        node.constraints.push(makeThisNodeNotVisibleConstraint);

        /*
         * create the constraint that makes the node not visitable until
         * the given branch path is taken
         */
        const makeThisNodeNotVisitableConstraint = {};
        makeThisNodeNotVisitableConstraint.id = this.getNextAvailableConstraintIdForNodeId(targetNodeId);
        makeThisNodeNotVisitableConstraint.action = 'makeThisNodeNotVisitable';
        makeThisNodeNotVisitableConstraint.targetId = targetNodeId;
        makeThisNodeNotVisitableConstraint.removalCriteria = [];
        const notVisitableRemovalCriterion = {};
        notVisitableRemovalCriterion.name = 'branchPathTaken';
        notVisitableRemovalCriterion.params = {};
        notVisitableRemovalCriterion.params.fromNodeId = fromNodeId;
        notVisitableRemovalCriterion.params.toNodeId = toNodeId;
        makeThisNodeNotVisitableConstraint.removalConditional = 'all';
        makeThisNodeNotVisitableConstraint.removalCriteria.push(notVisitableRemovalCriterion);
        node.constraints.push(makeThisNodeNotVisitableConstraint);
      }
    }
  }

  /**
   * Remove the branch path taken constraints from a node
   * @param nodeId remove the constraints from this node
   */
  removeBranchPathTakenNodeConstraints(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const constraints = node.constraints;
      if (constraints != null) {
        for (let c = 0; c < constraints.length; c++) {
          const constraint = constraints[c];
          if (constraint != null) {
            const removalCriteria = constraint.removalCriteria;

            if (removalCriteria != null) {
              for (let removalCriterion of removalCriteria) {
                if (removalCriterion != null) {
                  if (removalCriterion.name == 'branchPathTaken') {
                    const params = removalCriterion.params;
                    constraints.splice(c, 1);
                    // move the counter back one because we just removed a constraint
                    c--;
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
   * Get the branch path taken constraints from a node
   * @param nodeId get the branch path taken constraints from this node
   * @return an array of branch path taken constraints from the node
   */
  getBranchPathTakenConstraintsByNodeId(nodeId) {
    const branchPathTakenConstraints = [];
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const constraints = node.constraints;
        if (constraints != null) {
          for (let constraint of constraints) {
            if (constraint != null) {
              const removalCriteria = constraint.removalCriteria;
              if (removalCriteria != null) {
                for (let removalCriterion of removalCriteria) {
                  if (removalCriterion != null) {
                    if (removalCriterion.name == 'branchPathTaken') {
                      /*
                       * we have found a branch path taken constraint so
                       * we will add the constraint to the array
                       */
                      branchPathTakenConstraints.push(constraint);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return branchPathTakenConstraints;
  }

  /**
   * Update the branch path taken constraint
   * @param node update the branch path taken constraints in this node
   * @param currentFromNodeId the current from node id
   * @param currentToNodeId the current to node id
   * @param newFromNodeId the new from node id
   * @param newToNodeId the new to node id
   */
  updateBranchPathTakenConstraint(node, currentFromNodeId, currentToNodeId,
      newFromNodeId, newToNodeId) {
    if (node != null) {
      const constraints = node.constraints;
      if (constraints != null) {
        for (let constraint of constraints) {
          if (constraint != null) {
            const removalCriteria = constraint.removalCriteria;
            if (removalCriteria != null) {
              for (let removalCriterion of removalCriteria) {
                if (removalCriterion != null) {
                  if (removalCriterion.name === 'branchPathTaken') {
                    const params = removalCriterion.params;
                    if (params != null) {
                      if (params.fromNodeId === currentFromNodeId &&
                        params.toNodeId === currentToNodeId) {
                        /*
                         * we have found a branchPathTaken removal criterion
                         * with the fromNodeId and toNodeId that we are
                         * looking for so we will now update the values
                         */
                        params.fromNodeId = newFromNodeId;
                        params.toNodeId = newToNodeId;
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
   * Get the project level rubric
   * @return the project level rubric
   */
  getProjectRubric() {
    return this.project.rubric;
  }

  /**
   * Set the project level rubric
   */
  setProjectRubric(html) {
    this.project.rubric = html;
  }

  /**
   * Check if a node is a branch point
   * @param nodeId the node id
   * @return whether the node is a branch point
   */
  isBranchPoint(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    if (transitions != null) {
      if (transitions.length > 1) {
        /*
         * the node contains more than one transition which means it is
         * a branch point
         */
        return true;
      }
    }
    return false;
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

      const branches = this.getBranches();
      result = this.isNodeIdInABranch(branches, nodeId);

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
    /*
     * Get all the branches. Each branch is represented as an object that
     * contains the branchStartPoint, branchEndPoint, and branchPaths.
     */
    const branches = this.getBranches();

    if (branches != null) {
      for (let branch of branches) {
        if (branch != null) {
          if (branch.branchStartPoint == nodeId) {
            /*
             * we have found a branch with the given nodeId as the
             * start point
             */
            return true;
          }
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
    /*
     * Get all the branches. Each branch is represented as an object that
     * contains the branchStartPoint, branchEndPoint, and branchPaths.
     */
    const branches = this.getBranches();

    if (branches != null) {
      for (let branch of branches) {
        if (branch != null) {
          if (branch.branchEndPoint == nodeId) {
            /*
             * we have found a branch with the given nodeId as the
             * end point
             */
            return true;
          }
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

    // recursively calculate the node numbers by traversing the project tree
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
             * this is used to obtain the max step number that has
             * been used in the branch paths so that we know what
             * step number to give the merge end point
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

  /**
   * Get script for this project
   */
  getProjectScript() {
    return this.project.script;
  }

  /**
   * Retrieve the script with the provided script filename
   * @param scriptFilename
   */
  retrieveScript(scriptFilename) {
    let assetDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    let scriptPath = assetDirectoryPath + "/" + scriptFilename;
    return this.$http.get(scriptPath).then((result) => {
      return result.data;
    });
  };

  /**
   * Registers an additionalProcessingFunction for the specified node and component
   * @param nodeId the node id
   * @param componentId the component id
   * @param additionalProcessingFunction the function to register for the node and component.
   */
  addAdditionalProcessingFunction(nodeId, componentId, additionalProcessingFunction) {
    let key = nodeId + "_" + componentId;
    if (this.additionalProcessingFunctionsMap[key] == null) {
      this.additionalProcessingFunctionsMap[key] = [];
    }
    this.additionalProcessingFunctionsMap[key].push(additionalProcessingFunction);
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
   * Get the next node
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
   * Get all the achievements object in the project. The achievements object
   * contains the isEnabled field and an array of items.
   * @return the achievement object
   */
  getAchievements() {
    if (this.project != null) {
      if (this.project.achievements == null) {
        this.project.achievements = {
          isEnabled: true,
          items: []
        };
      }
      return this.project.achievements;
    }
    return null;
  }

  /**
   * Get the achievement items in the project
   * @return the achievement items
   */
  getAchievementItems() {
    const achievements = this.getAchievements();
    if (achievements != null) {
      if (achievements.items == null) {
        achievements.items = [];
      }
      return achievements.items;
    }
    return null;
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
   * Check if there are any rubrics in the project. There can potentially be
   * a project rubric, node rubrics, and component rubrics.
   * @return whether there are any rubrics in the project
   */
  hasRubrics() {
    if (this.project != null) {
      if (this.project.rubric != null && this.project.rubric != "") {
        return true;
      }

      for (let node of this.project.nodes) {
        if (node != null) {
          if (node.rubric != null && node.rubric != "") {
            return true;
          }

          if (node.components != null) {
            for (let component of node.components) {
              if (component != null) {
                if (component.rubric != null && component.rubric != "") {
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
   * Get the branch letter in the node position string if the node is in a
   * branch path
   * @param nodeId the node id we want the branch letter for
   * @return the branch letter in the node position if the node is in a branch
   * path
   */
  getBranchLetter(nodeId) {
    if (nodeId != null) {
      // get the node position e.g. "1.8" or "1.9 A"
      const nodePosition = this.getNodePositionById(nodeId);

      if (nodePosition != null) {
        // regex for extracting the branch letter
        const branchLetterRegex = /.*([A-Z])/;

        // run the regex on the node position string
        const match = branchLetterRegex.exec(nodePosition);

        if (match != null) {
          /*
           * the node position has a branch letter so we will get it
           * from the matched group
           */
          return match[1];
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
    let n = 0;
    let nodeContent = this.getNodeContentByNodeId(nodeId);
    if (nodeContent) {
      let nodeRubric = nodeContent.rubric;
      if (nodeRubric != null && nodeRubric != '') {
        n++;
      }

      let components = nodeContent.components;
      if (components && components.length) {
        for (let component of components) {
          if (component) {
            const componentRubric = component.rubric;
            if (componentRubric != null && componentRubric != '') {
              n++;
            }
          }
        }
      }
    }
    return n;
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

    const importStepsURL = this.ConfigService.getConfigParam('importStepsURL');
    const httpParams = {};
    httpParams.method = 'POST';
    httpParams.url = importStepsURL;
    httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};

    const toProjectId = this.ConfigService.getConfigParam('projectId');
    const fromProjectId = importProjectId;

    const params = {};
    params.steps = angular.toJson(newComponents);
    params.fromProjectId = fromProjectId;
    params.toProjectId = toProjectId;
    httpParams.data = $.param(params);

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
   * Remember the result for whether the node is affected by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @param whether the node is affected by the constraint
   */
  setIsNodeAffectedByConstraintResult(nodeId, constraintId, result) {
    this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId] = result;
  }

  /**
   * Check if we have calculated the result for whether the node is affected
   * by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @return Return the result if we have calculated the result before. If we
   * have not calculated the result before, we will return null.
   */
  getIsNodeAffectedByConstraintResult(nodeId, constraintId) {
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
