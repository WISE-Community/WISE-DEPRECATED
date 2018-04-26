'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProjectService = function () {
  function ProjectService($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    _classCallCheck(this, ProjectService);

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
    this.filters = [{ 'name': 'all', 'label': 'All' }
    //{'name': 'todo', 'label': 'Todo'},
    //{'name': 'completed', 'label': 'Completed'}
    ];
  }

  _createClass(ProjectService, [{
    key: 'setProject',
    value: function setProject(project) {
      this.project = project;
      this.parseProject();
    }
  }, {
    key: 'clearProjectFields',


    /**
     * Initialize the data structures used to hold project information
     */
    value: function clearProjectFields() {
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
    }
  }, {
    key: 'getStyle',
    value: function getStyle() {
      var style = '';
      var project = this.project;
      if (project != null) {
        style = project.style;
      }
      return style;
    }
  }, {
    key: 'getFilters',
    value: function getFilters() {
      return this.filters;
    }
  }, {
    key: 'getProjectTitle',


    /**
     * Returns the name/title of the current project
     */
    value: function getProjectTitle() {
      var name = this.getProjectMetadata().title;
      return name ? name : 'A WISE Project (No name)';
    }
  }, {
    key: 'setProjectTitle',


    /**
     * Set the project title
     */
    value: function setProjectTitle(projectTitle) {
      var metadata = this.getProjectMetadata();
      if (metadata != null) {
        metadata.title = projectTitle;
      }
    }
  }, {
    key: 'getProjectMetadata',
    value: function getProjectMetadata() {
      return this.metadata ? this.metadata : {};
    }
  }, {
    key: 'getNodes',
    value: function getNodes() {
      var project = this.project;
      if (project != null) {
        return project.nodes;
      }
      return null;
    }
  }, {
    key: 'getPlanningNodes',
    value: function getPlanningNodes() {
      var project = this.project;
      if (project != null) {
        return project.planningNodes;
      }
      return null;
    }
  }, {
    key: 'getChildNodeIdsById',
    value: function getChildNodeIdsById(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node.ids) {
        return node.ids;
      }
      return [];
    }
  }, {
    key: 'getGroupNodes',
    value: function getGroupNodes() {
      return this.groupNodes;
    }
  }, {
    key: 'isNode',
    value: function isNode(id) {
      var nodes = this.getNodes();
      if (nodes != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var node = _step.value;

            if (node != null) {
              var nodeId = node.id;
              if (nodeId === id) {
                return true;
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
      return false;
    }
  }, {
    key: 'addNode',
    value: function addNode(node) {
      var existingNodes = this.project.nodes;
      var replaced = false;
      if (node != null && existingNodes != null) {
        for (var n = 0; n < existingNodes.length; n++) {
          var existingNode = existingNodes[n];
          var existingNodeId = existingNode.id;
          if (existingNodeId === node.id) {
            existingNodes.splice(n, 1, node);
            replaced = true;
          }
        }
      }
      if (!replaced) {
        existingNodes.push(node);
      }
    }
  }, {
    key: 'addApplicationNode',
    value: function addApplicationNode(node) {
      var applicationNodes = this.applicationNodes;
      if (node != null && applicationNodes != null) {
        applicationNodes.push(node);
      }
    }
  }, {
    key: 'addGroupNode',
    value: function addGroupNode(node) {
      var groupNodes = this.groupNodes;
      if (node != null && groupNodes != null) {
        groupNodes.push(node);
      }
      this.$rootScope.$broadcast('groupsChanged');
    }
  }, {
    key: 'addNodeToGroupNode',
    value: function addNodeToGroupNode(groupId, nodeId) {
      if (groupId != null && nodeId != null) {
        var group = this.getNodeById(groupId);
        if (group != null) {
          var groupChildNodeIds = group.ids;
          if (groupChildNodeIds != null) {
            if (groupChildNodeIds.indexOf(nodeId) === -1) {
              groupChildNodeIds.push(nodeId);
            }
          }
        }
      }
    }
  }, {
    key: 'isGroupNode',
    value: function isGroupNode(id) {
      var groupNode = this.getNodeById(id);
      if (groupNode != null) {
        var type = groupNode.type;
        if (type === 'group') {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(id) {
      var applicationNode = this.getNodeById(id);
      if (applicationNode != null) {
        var type = applicationNode.type;
        if (type !== 'group') {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'getGroups',
    value: function getGroups() {
      return this.groupNodes;
    }
  }, {
    key: 'getInactiveGroupNodes',


    /**
     * Get the inactive group nodes.
     * @return An array of inactive group nodes.
     */
    value: function getInactiveGroupNodes() {
      return this.inactiveGroupNodes;
    }

    /**
     * Get the inactive step nodes. This will include the inactive steps that
     * are in an inactive group.
     * @return An array of inactive step nodes.
     */

  }, {
    key: 'getInactiveStepNodes',
    value: function getInactiveStepNodes() {
      return this.inactiveStepNodes;
    }
  }, {
    key: 'loadNodes',
    value: function loadNodes(nodes) {
      if (nodes != null) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;

            if (node != null) {
              var nodeId = node.id;
              var nodeType = node.type;
              var content = node.content;
              var constraints = node.constraints;

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

              var groupId = node.groupId;
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
                  var _iteratorNormalCompletion3 = true;
                  var _didIteratorError3 = false;
                  var _iteratorError3 = undefined;

                  try {
                    for (var _iterator3 = constraints[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                      var constraint = _step3.value;

                      this.activeConstraints.push(constraint);
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
                }
              }
            }
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
      }
    }
  }, {
    key: 'loadPlanningNodes',


    /**
     * Load the planning template nodes
     * @param planning template nodes
     */
    value: function loadPlanningNodes(planningNodes) {
      if (planningNodes != null) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = planningNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var planningNode = _step4.value;

            if (planningNode != null) {
              var nodeId = planningNode.id;
              this.setIdToNode(nodeId, planningNode);
              this.setIdToElement(nodeId, planningNode);

              // TODO: may need to add more function calls here to add the planning
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
     * Parse the project to detect the nodes, branches, node numbers, etc.
     */

  }, {
    key: 'parseProject',
    value: function parseProject() {
      var project = this.project;
      if (project != null) {
        this.clearProjectFields();

        if (project.metadata) {
          this.metadata = project.metadata;
        }

        var nodes = project.nodes;
        this.loadNodes(nodes);

        var planningNodes = project.planningNodes;
        this.loadPlanningNodes(planningNodes);

        var inactiveNodes = project.inactiveNodes;
        this.loadInactiveNodes(inactiveNodes);

        var constraints = project.constraints;

        if (constraints != null) {
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = constraints[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var constraint = _step5.value;

              if (constraint != null) {
                var constraintId = constraint.id;
                constraint.active = true;
                this.setIdToElement(constraintId, constraint);
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

        this.rootNode = this.getRootNode(nodes[0].id);
        this.setNodeOrder(this.rootNode, this.nodeCount);

        var n = nodes.length;
        var branches = this.getBranches();
        var branchNodeIds = [];

        // set node positions
        var id = void 0,
            pos = void 0;

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
        var b = branchNodeIds.length;
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
    }
  }, {
    key: 'setNodeOrder',
    value: function setNodeOrder(node) {
      this.idToOrder[node.id] = { 'order': this.nodeCount };
      this.nodeCount++;
      if (this.isGroupNode(node.id)) {
        var childIds = node.ids;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = childIds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var childId = _step6.value;

            var _child = this.getNodeById(childId);
            this.setNodeOrder(_child);
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

        if (this.ConfigService.getMode() === 'classroomMonitor') {
          // we're viewing the classroom monitor, so include planning nodes in the project structure
          var planningIds = node.availablePlanningNodes;
          if (planningIds) {
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = planningIds[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var planningId = _step7.value;

                var child = this.getNodeById(planningId.nodeId);
                this.setNodeOrder(child);
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
        }
      }
    }
  }, {
    key: 'getNodeOrderOfProject',


    /**
     * Get the node order mappings of the project
     * @param project the project JSOn
     * @return an object containing the idToOrder mapping and also the array
     * of nodes
     */
    value: function getNodeOrderOfProject(project) {
      var idToOrder = {};
      idToOrder.nodeCount = 0;
      var startGroupId = project.startGroupId;
      var rootNode = this.getNodeById(startGroupId, project);
      var stepNumber = '';
      var nodes = [];
      var importProjectIdToOrder = this.getNodeOrderOfProjectHelper(project, rootNode, idToOrder, stepNumber, nodes);
      delete importProjectIdToOrder.nodeCount;
      var result = {};
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

  }, {
    key: 'getNodeOrderOfProjectHelper',
    value: function getNodeOrderOfProjectHelper(project, node, idToOrder, stepNumber, nodes) {
      /*
       * Create the item that we will add to the idToOrder mapping.
       * The 'order' field determines how the project nodes are displayed
       * when we flatten the project for displaying.
       */
      var item = {
        'order': idToOrder.nodeCount,
        'node': node,
        'stepNumber': stepNumber
      };

      idToOrder[node.id] = item;
      idToOrder.nodeCount++;
      nodes.push(item);

      if (node.type == 'group') {
        var childIds = node.ids;
        for (var c = 0; c < childIds.length; c++) {
          var childId = childIds[c];
          var child = this.getNodeById(childId, project);
          var childStepNumber = stepNumber;

          if (childStepNumber != '') {
            // add the . separator for the step number e.g. 1.
            childStepNumber += '.';
          }

          childStepNumber += c + 1;
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

  }, {
    key: 'getPositionById',
    value: function getPositionById(id) {
      for (var i = 0; i < this.rootNode.ids.length; i++) {
        var node = this.getNodeById(this.rootNode.ids[i]);
        var path = this.getPathToNode(node, i + 1, id);
        if (path != undefined && path != null) {
          return path;
        }
      }
      return null;
    }
  }, {
    key: 'getOrderById',


    /**
     * Returns the order of the given node id in the project. Returns null if no node with id exists.
     * @param id String node id
     * @return Number order of the given node id in the project
     */
    value: function getOrderById(id) {
      if (this.idToOrder[id]) {
        return this.idToOrder[id].order;
      }
      return null;
    }
  }, {
    key: 'getIdByOrder',


    /**
     * Returns the id of the node with the given order in the project. Returns null if no order with node exists.
     * @param order Number
     * @return Number node id of the given order in the project
     */
    value: function getIdByOrder(order) {
      var nodeId = null;
      for (var id in this.idToOrder) {
        if (this.idToOrder[id].order === order) {
          if (this.isGroupNode(id) && order > 1) {
            nodeId = this.getIdByOrder(order - 1);
          } else {
            nodeId = id;
          }
          break;
        }
      }
      return nodeId;
    }
  }, {
    key: 'getBranchNodePositionById',


    /**
     * Returns the position in the project for the branch node with the given id. Returns null if no node with id exists or node is not a branch node.
     * @param id a node id
     * @return string position of the given node id in the project
     */
    value: function getBranchNodePositionById(id) {
      var branches = this.getBranches();
      var b = branches.length;

      // TODO: should we localize this? should we support more than 26?
      var integerToAlpha = function integerToAlpha(int) {
        var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        if (int > -1 && int < 26) {
          return alphabet[int];
        } else {
          return int;
        }
      };

      while (b--) {
        var branch = branches[b];
        var branchPaths = branch.branchPaths;
        for (var p = 0; p < branchPaths.length; p++) {
          var branchPath = branchPaths[p];
          var nodeIndex = branchPath.indexOf(id);
          if (nodeIndex > -1) {
            var startPoint = branch.branchStartPoint;
            var startPointPos = this.idToPosition[startPoint];
            var branchPathPos = startPointPos + ' ' + integerToAlpha(p);
            return branchPathPos + (nodeIndex + 1);
          }
        }
      }
      return null;
    }
  }, {
    key: 'getPathToNode',


    /**
     * Recursively searches for the given node id from the point of the given node down and returns the path number (position)
     * @param node a node to start searching down
     * @param path the position of the given node
     * @param id the node id to search for
     * @return string path of the given node id in the project
     */
    value: function getPathToNode(node, path, id) {
      if (node.id === id) {
        return path + '';
      } else if (node.type === 'group') {
        var num = 0;
        var branches = this.getBranches();
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = node.ids[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var nodeId = _step8.value;

            if (this.isNodeIdInABranch(branches, nodeId)) {
              this.getBranchNodePositionById(nodeId);
            } else {
              ++num;
              var pos = this.getPathToNode(this.getNodeById(nodeId), path + '.' + num, id);
              if (pos) {
                return pos;
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
  }, {
    key: 'setIdToPosition',
    value: function setIdToPosition(id, pos) {
      if (id != null) {
        this.idToPosition[id] = pos;
      }
    }
  }, {
    key: 'getNodePositionById',
    value: function getNodePositionById(id) {
      var position = null;
      if (id != null) {
        position = this.nodeIdToNumber[id];
      }
      return position;
    }
  }, {
    key: 'getNodeIdByOrder',
    value: function getNodeIdByOrder(order) {
      var id = null;
      if (order != null) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = Object.entries(this.idToOrder)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _step9$value = _slicedToArray(_step9.value, 2),
                nodeId = _step9$value[0],
                value = _step9$value[1];

            if (value.order === order) {
              id = nodeId;
              break;
            }
          }
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
      }
      return id;
    }
  }, {
    key: 'getNodeOrderById',
    value: function getNodeOrderById(id) {
      var order = null;
      if (id != null) {
        order = this.idToOrder[id] ? this.idToOrder[id].order : null;
      }
      return order;
    }
  }, {
    key: 'setIdToNode',
    value: function setIdToNode(id, element) {
      if (id != null) {
        this.idToNode[id] = element;
      }
    }
  }, {
    key: 'setIdToElement',
    value: function setIdToElement(id, element) {
      if (id != null) {
        this.idToElement[id] = element;
      }
    }
  }, {
    key: 'injectAssetPaths',


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
    value: function injectAssetPaths(content) {
      if (content != null) {
        if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
          var contentString = JSON.stringify(content);
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
    }
  }, {
    key: 'replaceAssetPaths',


    /**
     * Replace the relative asset paths with absolute paths
     * @param contentString the content string
     * @return the content string with relative asset paths replaced
     * with absolute asset paths
     */
    value: function replaceAssetPaths(contentString) {
      if (contentString != null) {
        // get the content base url e.g. http://wise.berkeley.edu/curriculum/123456/
        var contentBaseURL = this.ConfigService.getConfigParam('projectBaseURL');

        // only look for string that starts with ' or " and ends in png, jpg, jpeg, pdf, etc.
        // the string we're looking for can't start with '/ and "/.
        // note that this also works for \"abc.png and \'abc.png, where the quotes are escaped
        contentString = contentString.replace(new RegExp('(\'|\"|\\\\\'|\\\\\")[^:][^\/]?[^\/]?[a-zA-Z0-9@%&;\\._\\/\\s\\-]*[\.](png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html.*?|js).*?(\'|\"|\\\\\'|\\\\\")', 'gi'), function (matchedString) {
          // once found, we prepend the contentBaseURL + "assets/" to the string within the quotes and keep everything else the same.
          var delimiter = '';
          var matchedStringWithoutQuotes = '';

          if (matchedString.length > 2 && matchedString.substr(0, 1) == '\\') {
            // the string has escaped quotes for example \"hello.png\"

            // get everything between the escaped quotes
            matchedStringWithoutQuotes = matchedString.substr(2, matchedString.length - 4);

            // get the delimiter which will be \' or \"
            delimiter = matchedString.substr(0, 2);
          } else {
            // the string does not have escaped quotes for example "hello.png"

            // get everything between the quotes
            matchedStringWithoutQuotes = matchedString.substr(1, matchedString.length - 2);

            // get the delimiter which will be ' or "
            delimiter = matchedString.substr(0, 1);
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
        });
      }
      return contentString;
    }
  }, {
    key: 'injectClickToSnipImage',


    /**
     * Inject the ng-click attribute that will call the snipImage function
     * @param content the content
     * @returns the modified content
     */
    value: function injectClickToSnipImage(content) {
      if (content != null) {
        if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
          var contentString = JSON.stringify(content);
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

  }, {
    key: 'injectClickToSnipImageIntoContentString',
    value: function injectClickToSnipImageIntoContentString(contentString) {
      if (contentString != null) {
        // regex to match image elements
        var imgMatcher = new RegExp('<img.*?src=\\\\?[\'"](.*?)\\\\?[\'"].*?>', 'gi');

        // replace all instances that match
        contentString = contentString.replace(imgMatcher, function (matchedString, matchGroup1) {
          /*
           * insert the ng-click attribute
           * Before: <img src="abc.png"/>
           * After: <img ng-click="vleController.snipImage($event)" src="abc.png" />
           */
          var newString = matchedString.replace('img', 'img ng-click=\\\"$emit(\'snipImage\', $event)\\\"');
          return newString;
        });
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

  }, {
    key: 'getNodeById',
    value: function getNodeById(nodeId, project) {
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
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = project.nodes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var tempNode = _step10.value;

            if (tempNode != null && tempNode.id == nodeId) {
              return tempNode;
            }
          }
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

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = project.inactiveNodes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var _tempNode = _step11.value;

            if (_tempNode != null && _tempNode.id == nodeId) {
              return _tempNode;
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
      return null;
    }
  }, {
    key: 'getNodeTitleByNodeId',


    /**
     * Returns the title of the node with the nodeId
     * Return null if nodeId param is null or the specified node does not exist in the project.
     */
    value: function getNodeTitleByNodeId(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        return node.title;
      }
      return null;
    }
  }, {
    key: 'getNodePositionAndTitleByNodeId',


    /**
     * Get the node position and title
     * @param nodeId the node id
     * @returns the node position and title, e.g. "1.1 Introduction"
     */
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var position = this.getNodePositionById(nodeId);
        if (position != null) {
          return position + ': ' + node.title;
        } else {
          return node.title;
        }
      }
      return null;
    }
  }, {
    key: 'getNodeIconByNodeId',
    value: function getNodeIconByNodeId(nodeId) {
      var node = this.getNodeById(nodeId);
      var nodeIcon = null;
      if (node != null) {
        var nodeType = node.type;

        // set defaults (TODO: get from configService?)
        var defaultName = nodeType === 'group' ? 'explore' : 'school';
        nodeIcon = {
          color: 'rgba(0,0,0,0.54)',
          type: 'font',
          fontSet: 'material-icons',
          fontName: defaultName,
          imgSrc: '',
          imgAlt: 'node icon'
        };

        // TODO: check for different statuses
        var icons = node.icons;
        if (!!icons && !!icons.default) {
          var icon = icons.default;
          nodeIcon = $.extend(true, nodeIcon, icon);
        }

        // check for empty image source
        if (!nodeIcon.imgSrc) {
          // revert to font icon
          nodeIcon.type = 'font';
        }
      }
      return nodeIcon;
    }
  }, {
    key: 'getParentGroup',
    value: function getParentGroup(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          // Check if the node is a child of an active group.
          var groupNodes = this.getGroupNodes();
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = groupNodes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var groupNode = _step12.value;

              if (this.isNodeDirectChildOfGroup(node, groupNode)) {
                return groupNode;
              }
            }

            // Check if the node is a child of an inactive group.
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

          var inactiveGroupNodes = this.getInactiveGroupNodes();
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = inactiveGroupNodes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var inactiveGroupNode = _step13.value;

              if (this.isNodeDirectChildOfGroup(node, inactiveGroupNode)) {
                return inactiveGroupNode;
              }
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
        }
      }
      return null;
    }
  }, {
    key: 'getParentGroupId',


    /**
     * Get the parent group id
     * @param nodeId the parent group id
     * @returns the parent group id
     */
    value: function getParentGroupId(nodeId) {
      if (nodeId != null) {
        var parentGroup = this.getParentGroup(nodeId);
        if (parentGroup != null) {
          return parentGroup.id;
        }
      }
      return null;
    }
  }, {
    key: 'getNodeDepth',
    value: function getNodeDepth(nodeId, val) {
      if (nodeId != null) {
        var depth = typeof val === "number" ? val : 0;
        var parent = this.getParentGroup(nodeId);
        if (parent) {
          depth = this.getNodeDepth(parent.id, depth + 1);
        }
        return depth;
      }
      return null;
    }
  }, {
    key: 'getRootNode',
    value: function getRootNode(nodeId) {
      var parentGroup = this.getParentGroup(nodeId);
      if (parentGroup == null) {
        return this.getNodeById(nodeId);
      } else {
        return this.getRootNode(parentGroup.id);
      }
      return null;
    }
  }, {
    key: 'isNodeDirectChildOfGroup',
    value: function isNodeDirectChildOfGroup(node, group) {
      if (node != null && group != null) {
        var nodeId = node.id;
        var groupIds = group.ids;

        if (groupIds != null && groupIds.indexOf(nodeId) != -1) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'isNodeDescendentOfGroup',
    value: function isNodeDescendentOfGroup(node, group) {
      if (node != null && group != null) {
        var descendents = this.getDescendentsOfGroup(group);
        var nodeId = node.id;

        if (descendents.indexOf(nodeId) != -1) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'getDescendentsOfGroup',
    value: function getDescendentsOfGroup(group) {
      var descendents = [];
      if (group != null) {
        var childIds = group.ids;
        if (childIds != null) {
          descendents = childIds;
          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = childIds[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var childId = _step14.value;

              var node = this.getNodeById(childId);
              if (node != null) {
                var childDescendents = this.getDescendentsOfGroup(node);
                descendents = descendents.concat(childDescendents);
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
      }
      return descendents;
    }
  }, {
    key: 'isStartNode',
    value: function isStartNode(node) {
      var result = false;
      if (node != null) {
        var nodeId = node.id;
        var projectStartId = this.getStartNodeId();
        if (nodeId === projectStartId) {
          result = true;
        }

        var groups = this.getGroups();
        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = groups[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var group = _step15.value;

            if (group != null) {
              var groupStartId = group.startId;
              if (nodeId === groupStartId) {
                result = true;
                break;
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
      }
      return result;
    }
  }, {
    key: 'getStartNodeId',


    /**
     * Returns the Project's start node id, or null if it's not defined in the project
     */
    value: function getStartNodeId() {
      var project = this.project;
      if (project != null) {
        return project.startNodeId;
      }
      return null;
    }
  }, {
    key: 'setStartNodeId',


    /**
     * Set the start node id
     * @param nodeId the new start node id
     */
    value: function setStartNodeId(nodeId) {
      if (nodeId != null) {
        var project = this.project;
        if (project != null) {
          project.startNodeId = nodeId;
        }
      }
    }

    /**
     * Get the start group id
     * @return the start group id
     */

  }, {
    key: 'getStartGroupId',
    value: function getStartGroupId() {
      var project = this.project;
      if (project != null) {
        return project.startGroupId;
      }
      return null;
    }

    /**
     * Check if the given node id is the start node id
     * @return whether the node id is the start node id
     */

  }, {
    key: 'isStartNodeId',
    value: function isStartNodeId(nodeId) {
      var project = this.project;
      if (project != null) {
        var startNodeId = project.startNodeId;
        if (nodeId === startNodeId) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'getConstraintsForNode',
    value: function getConstraintsForNode(node) {
      var constraints = [];
      var allConstraints = this.activeConstraints;
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = allConstraints[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var constraint = _step16.value;

          if (this.isNodeAffectedByConstraint(node, constraint)) {
            constraints.push(constraint);
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

      return constraints;
    }
  }, {
    key: 'getConstraintsOnNode',


    /**
     * Get the constraints authored on the node.
     * @param nodeId The node id of the node.
     * @return An array of constraint JSON objects.
     */
    value: function getConstraintsOnNode(nodeId) {
      var node = this.getNodeById(nodeId);
      return node.constraints;
    }

    /**
     * Check if a node has constraints.
     * @param nodeId The node id of the node.
     * @return Whether the node has constraints authored on it.
     */

  }, {
    key: 'nodeHasConstraint',
    value: function nodeHasConstraint(nodeId) {
      var constraints = this.getConstraintsOnNode(nodeId);
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

  }, {
    key: 'orderConstraints',
    value: function orderConstraints(constraints) {
      var orderedNodeIds = this.getFlattenedProjectAsNodeIds();
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

  }, {
    key: 'constraintsComparatorGenerator',
    value: function constraintsComparatorGenerator(orderedNodeIds) {
      return function (constraintA, constraintB) {
        var constraintAIndex = orderedNodeIds.indexOf(constraintA.targetId);
        var constraintBIndex = orderedNodeIds.indexOf(constraintB.targetId);
        if (constraintAIndex < constraintBIndex) {
          return -1;
        } else if (constraintAIndex > constraintBIndex) {
          return 1;
        }
        return 0;
      };
    }

    /**
     * Check if a node is affected by the constraint
     * @param node check if the node is affected
     * @param constraint the constraint that might affect the node
     * @returns whether the node is affected by the constraint
     */

  }, {
    key: 'isNodeAffectedByConstraint',
    value: function isNodeAffectedByConstraint(node, constraint) {
      var result = false;
      if (node != null && constraint != null) {
        // check if we have previously calculated the result before
        var rememberedResult = this.getIsNodeAffectedByConstraintResult(node.id, constraint.id, result);
        if (rememberedResult != null) {
          // we have calculated the result before

          // use the remembered result
          result = rememberedResult;
        } else {
          // we have not calculated the result before
          var nodeId = node.id;
          var targetId = constraint.targetId;
          var action = constraint.action;

          if (action === 'makeAllNodesAfterThisNotVisible') {
            if (this.isNodeIdAfter(targetId, node.id)) {
              result = true;
            }
          } else if (action === 'makeAllNodesAfterThisNotVisitable') {
            if (this.isNodeIdAfter(targetId, node.id)) {
              result = true;
            }
          } else {
            var targetNode = this.getNodeById(targetId);
            if (targetNode != null) {
              var nodeType = targetNode.type;
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
    }
  }, {
    key: 'isNodeIdAfter',


    /**
     * Check if a node id comes after another node id in the project
     * @param nodeIdBefore the node id before
     * @param nodeIdAfter the node id after
     */
    value: function isNodeIdAfter(nodeIdBefore, nodeIdAfter) {
      var result = false;
      if (nodeIdBefore != null && nodeIdAfter != null) {
        if (this.isApplicationNode(nodeIdBefore)) {
          // the node id before is a step

          // get all the paths from the beforeNodeId to the end of the project
          var pathsToEnd = this.getAllPaths([], nodeIdBefore, true);

          if (pathsToEnd != null) {
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
              for (var _iterator17 = pathsToEnd[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                var pathToEnd = _step17.value;

                if (pathToEnd != null) {
                  /*
                   * remove the first node id and its parent id because
                   * we will check the remaining node ids in the array
                   * for the nodeIdAfter
                   */

                  // get the index of the node id before
                  var index = pathToEnd.indexOf(nodeIdBefore);

                  if (index != -1) {
                    // remove the node id before
                    pathToEnd.splice(index, 1);
                  }

                  // get the parent group of the node id before
                  var parentGroup = this.getParentGroup(nodeIdBefore);

                  if (parentGroup != null) {
                    // remove the parent group of the node id before
                    var parentGroupId = parentGroup.id;
                    var parentGroupIndex = pathToEnd.indexOf(parentGroupId);
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
          }
        } else {
          // the node id before is an activity

          var group = this.getNodeById(nodeIdBefore);
          if (group != null) {
            var transitions = this.getTransitionsByFromNodeId(nodeIdBefore);
            if (transitions != null) {
              var _iteratorNormalCompletion18 = true;
              var _didIteratorError18 = false;
              var _iteratorError18 = undefined;

              try {
                for (var _iterator18 = transitions[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                  var transition = _step18.value;

                  if (transition != null) {
                    var toNodeId = transition.to;

                    // get the paths between to toNodeId and the end of the project
                    var _pathsToEnd = this.getAllPaths([], toNodeId, true);

                    var _iteratorNormalCompletion19 = true;
                    var _didIteratorError19 = false;
                    var _iteratorError19 = undefined;

                    try {
                      for (var _iterator19 = _pathsToEnd[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                        var _pathToEnd = _step19.value;

                        if (_pathToEnd != null) {
                          if (_pathToEnd.indexOf(nodeIdAfter) != -1) {
                            // we have found the nodeIdAfter in the path to the end of the project
                            result = true;
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
          }
        }
      }
      return result;
    }

    /**
     * Get the transition logic for a node
     * @param fromNodeId the from node id
     * @returns the transition logic object
     */

  }, {
    key: 'getTransitionLogicByFromNodeId',
    value: function getTransitionLogicByFromNodeId(fromNodeId) {
      if (fromNodeId != null) {
        // get the node
        var node = this.getNodeById(fromNodeId);

        if (node != null) {
          // get the transition logic
          return node.transitionLogic;
        }
      }
      return null;
    }
  }, {
    key: 'getTransitionsByFromNodeId',


    /**
     * Get the transitions for a node
     * @param fromNodeId the node to get transitions from
     * @returns an array of transitions
     */
    value: function getTransitionsByFromNodeId(fromNodeId) {
      if (fromNodeId != null) {
        // get the transition logic
        var transitionLogic = this.getTransitionLogicByFromNodeId(fromNodeId);

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

  }, {
    key: 'getNodesByToNodeId',
    value: function getNodesByToNodeId(toNodeId) {
      var nodesByToNodeId = [];
      if (toNodeId != null) {
        var nodes = this.project.nodes;
        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = nodes[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var node = _step20.value;

            if (this.nodeHasTransitionToNodeId(node, toNodeId)) {
              nodesByToNodeId.push(node);
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

        var inactiveNodes = this.getInactiveNodes();
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = inactiveNodes[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var inactiveNode = _step21.value;

            if (this.nodeHasTransitionToNodeId(inactiveNode, toNodeId)) {
              nodesByToNodeId.push(inactiveNode);
            }
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21.return) {
              _iterator21.return();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }
      }
      return nodesByToNodeId;
    }
  }, {
    key: 'nodeHasTransitionToNodeId',


    /**
     * Check if a node has a transition to the given nodeId.
     * @param node The node to check.
     * @param toNodeId We are looking for a transition to this node id.
     * @returns Whether the node has a transition to the given nodeId.
     */
    value: function nodeHasTransitionToNodeId(node, toNodeId) {
      var transitionLogic = node.transitionLogic;
      if (transitionLogic != null) {
        var transitions = transitionLogic.transitions;
        if (transitions != null) {
          var _iteratorNormalCompletion22 = true;
          var _didIteratorError22 = false;
          var _iteratorError22 = undefined;

          try {
            for (var _iterator22 = transitions[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
              var transition = _step22.value;

              if (transition != null) {
                if (toNodeId === transition.to) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError22 = true;
            _iteratorError22 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion22 && _iterator22.return) {
                _iterator22.return();
              }
            } finally {
              if (_didIteratorError22) {
                throw _iteratorError22;
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

  }, {
    key: 'getNodeIdsByToNodeId',
    value: function getNodeIdsByToNodeId(toNodeId) {
      var nodeIds = [];
      var nodes = this.getNodesByToNodeId(toNodeId);
      if (nodes != null) {
        var _iteratorNormalCompletion23 = true;
        var _didIteratorError23 = false;
        var _iteratorError23 = undefined;

        try {
          for (var _iterator23 = nodes[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
            var node = _step23.value;

            if (node != null) {
              nodeIds.push(node.id);
            }
          }
        } catch (err) {
          _didIteratorError23 = true;
          _iteratorError23 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion23 && _iterator23.return) {
              _iterator23.return();
            }
          } finally {
            if (_didIteratorError23) {
              throw _iteratorError23;
            }
          }
        }
      }
      return nodeIds;
    }

    /**
     * Get the group nodes that point to a given node id
     * @param toNodeId
     */

  }, {
    key: 'getGroupNodesByToNodeId',
    value: function getGroupNodesByToNodeId(toNodeId) {
      var groupsThatPointToNodeId = [];
      if (toNodeId != null) {
        var groups = this.getGroups();
        var _iteratorNormalCompletion24 = true;
        var _didIteratorError24 = false;
        var _iteratorError24 = undefined;

        try {
          for (var _iterator24 = groups[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
            var group = _step24.value;

            if (group != null) {
              if (this.hasTransitionTo(group, toNodeId)) {
                groupsThatPointToNodeId.push(group);
              }
            }
          }
        } catch (err) {
          _didIteratorError24 = true;
          _iteratorError24 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion24 && _iterator24.return) {
              _iterator24.return();
            }
          } finally {
            if (_didIteratorError24) {
              throw _iteratorError24;
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

  }, {
    key: 'hasTransitionTo',
    value: function hasTransitionTo(node, toNodeId) {
      if (node != null && toNodeId != null) {
        var transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          var transitions = transitionLogic.transitions;
          if (transitions != null) {
            var _iteratorNormalCompletion25 = true;
            var _didIteratorError25 = false;
            var _iteratorError25 = undefined;

            try {
              for (var _iterator25 = transitions[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
                var transition = _step25.value;

                if (toNodeId === transition.to) {
                  return true;
                }
              }
            } catch (err) {
              _didIteratorError25 = true;
              _iteratorError25 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion25 && _iterator25.return) {
                  _iterator25.return();
                }
              } finally {
                if (_didIteratorError25) {
                  throw _iteratorError25;
                }
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

  }, {
    key: 'getTransitionsByFromAndToNodeId',
    value: function getTransitionsByFromAndToNodeId(fromNodeId, toNodeId) {
      var transitionsResults = [];
      if (fromNodeId != null && toNodeId != null) {
        var node = this.getNodeById(fromNodeId);
        if (node != null) {
          var transitionLogic = node.transitionLogic;
          if (transitionLogic != null) {
            var transitions = transitionLogic.transitions;
            if (transitions != null) {
              var _iteratorNormalCompletion26 = true;
              var _didIteratorError26 = false;
              var _iteratorError26 = undefined;

              try {
                for (var _iterator26 = transitions[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
                  var transition = _step26.value;

                  if (transition != null) {
                    var to = transition.to;
                    if (toNodeId === to) {
                      transitionsResults.push(transition);
                    }
                  }
                }
              } catch (err) {
                _didIteratorError26 = true;
                _iteratorError26 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion26 && _iterator26.return) {
                    _iterator26.return();
                  }
                } finally {
                  if (_didIteratorError26) {
                    throw _iteratorError26;
                  }
                }
              }
            }
          }
        }
      }
      return transitionsResults;
    }
  }, {
    key: 'retrieveProject',


    /**
     * Retrieves the project JSON from Config.projectURL and returns it.
     * If Config.projectURL is undefined, returns null.
     */
    value: function retrieveProject() {
      var _this = this;

      var projectURL = this.ConfigService.getConfigParam('projectURL');
      if (projectURL == null) {
        return null;
      } else {
        /*
         * add a unique GET parameter value so that it always retrieves the
         * latest version of the project file from the server and never
         * retrieves the project from cache.
         */
        projectURL += '?noCache=' + new Date().getTime();
      }

      return this.$http.get(projectURL).then(function (result) {
        var projectJSON = result.data;
        _this.setProject(projectJSON);
        return projectJSON;
      });
    }
  }, {
    key: 'retrieveProjectById',


    /**
     * Retrieve the project JSON
     * @param projectId retrieve the project JSON with this id
     * @return a promise to return the project JSON
     */
    value: function retrieveProjectById(projectId) {
      var _this2 = this;

      if (projectId != null) {
        // get the config URL for the project
        var configURL = window.configURL + '/' + projectId;

        // get the config for the project
        return this.$http.get(configURL).then(function (result) {
          var configJSON = result.data;

          if (configJSON != null) {
            // get the project URL and preview project URL
            var projectURL = configJSON.projectURL;
            var previewProjectURL = configJSON.previewProjectURL;

            if (projectURL != null) {
              // get the project JSON
              return _this2.$http.get(projectURL).then(function (result) {
                var projectJSON = result.data;

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

  }, {
    key: 'saveProject',
    value: function saveProject() {
      var _this3 = this;

      var commitMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      this.$rootScope.$broadcast('savingProject');
      // perform any cleanup before saving the project
      this.cleanupBeforeSave();

      var projectId = this.ConfigService.getProjectId();
      var saveProjectURL = this.ConfigService.getConfigParam('saveProjectURL');
      if (projectId == null || saveProjectURL == null) {
        return null;
      }

      // Get the project from this service
      var projectJSONString = angular.toJson(this.project, 4);

      var httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = saveProjectURL;
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      var params = {};
      params.projectId = projectId;
      params.commitMessage = commitMessage;
      params.projectJSONString = projectJSONString;
      httpParams.data = $.param(params);

      return this.$http(httpParams).then(function (result) {
        var commitHistory = result.data;
        _this3.$rootScope.$broadcast('projectSaved');
        return commitHistory;
      });
    }
  }, {
    key: 'cleanupBeforeSave',


    /**
     * Perform any necessary cleanup before we save the project.
     * For example we need to remove the checked field in the inactive node
     * objects.
     */
    value: function cleanupBeforeSave() {
      var activeNodes = this.getActiveNodes();
      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        for (var _iterator27 = activeNodes[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          var activeNode = _step27.value;

          this.cleanupNode(activeNode);
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27.return) {
            _iterator27.return();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      var inactiveNodes = this.getInactiveNodes();
      var _iteratorNormalCompletion28 = true;
      var _didIteratorError28 = false;
      var _iteratorError28 = undefined;

      try {
        for (var _iterator28 = inactiveNodes[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
          var inactiveNode = _step28.value;

          this.cleanupNode(inactiveNode);
        }
      } catch (err) {
        _didIteratorError28 = true;
        _iteratorError28 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion28 && _iterator28.return) {
            _iterator28.return();
          }
        } finally {
          if (_didIteratorError28) {
            throw _iteratorError28;
          }
        }
      }
    }

    /**
     * Remove any fields that are used temporarily for display purposes.
     * @param node The node object.
     */

  }, {
    key: 'cleanupNode',
    value: function cleanupNode(node) {
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

      var components = node.components;
      // activity nodes do not have components but step nodes do have components
      if (components != null) {
        var _iteratorNormalCompletion29 = true;
        var _didIteratorError29 = false;
        var _iteratorError29 = undefined;

        try {
          for (var _iterator29 = components[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
            var component = _step29.value;

            this.cleanupComponent(component);
          }
        } catch (err) {
          _didIteratorError29 = true;
          _iteratorError29 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion29 && _iterator29.return) {
              _iterator29.return();
            }
          } finally {
            if (_didIteratorError29) {
              throw _iteratorError29;
            }
          }
        }
      }
    }

    /**
     * Remove any fields that are used temporarily for display purposes.
     * @param component The component object.
     */

  }, {
    key: 'cleanupComponent',
    value: function cleanupComponent(component) {
      /*
       * Remove fields that are added when the project is loaded in the authoring
       * tool and grading tool.
       */
      delete component.checked;
      delete component.hasWork;
    }

    /**
     * Returns the theme path for the current project
     */

  }, {
    key: 'getThemePath',
    value: function getThemePath() {
      var wiseBaseURL = this.ConfigService.getWISEBaseURL();
      var project = this.project;
      if (project && project.theme) {
        // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
        return wiseBaseURL + '/wise5/themes/' + project.theme;
      } else {
        // TODO: get default theme name from ConfigService
        return wiseBaseURL + '/wise5/themes/default';
      }
    }
  }, {
    key: 'getThemeSettings',


    /**
     * Returns the theme settings for the current project
     */
    value: function getThemeSettings() {
      var themeSettings = {};
      var project = this.project;
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
    }
  }, {
    key: 'getFlattenedProjectAsNodeIds',


    /**
     * Flatten the project to obtain a list of node ids
     * @param recalculate Whether to force recalculating the flattened node ids.
     * @return An array of the flattened node ids in the project.
     */
    value: function getFlattenedProjectAsNodeIds(recalculate) {
      if (!recalculate && this.flattenedProjectAsNodeIds != null) {
        // use the previously calculated flattened node ids
        return this.flattenedProjectAsNodeIds;
      }

      // get the start node id
      var startNodeId = this.getStartNodeId();

      /*
       * an array to keep track of the node ids in the path that
       * we are currently on as we traverse the nodes in the project
       * depth first
       */
      var pathsSoFar = [];

      // get all the possible paths through the project
      var allPaths = this.getAllPaths(pathsSoFar, startNodeId);

      // consolidate all the paths to create a single list of node ids
      var nodeIds = this.consolidatePaths(allPaths);

      /*
       * Remember the flattened node ids so that we don't have to calculate
       * it again.
       */
      this.flattenedProjectAsNodeIds = nodeIds;

      return nodeIds;
    }
  }, {
    key: 'getAllPaths',


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
    value: function getAllPaths(pathSoFar, nodeId, includeGroups) {
      var allPaths = [];
      if (nodeId != null) {
        if (this.isApplicationNode(nodeId)) {
          var path = [];
          var transitions = this.getTransitionsByFromNodeId(nodeId);
          if (transitions != null) {
            if (includeGroups) {
              var parentGroup = this.getParentGroup(nodeId);
              if (parentGroup != null) {
                var parentGroupId = parentGroup.id;
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

              var addedCurrentNodeId = false;
              var _parentGroupId = this.getParentGroupId(nodeId);
              var parentGroupTransitions = this.getTransitionsByFromNodeId(_parentGroupId);

              if (parentGroupTransitions != null) {
                var _iteratorNormalCompletion30 = true;
                var _didIteratorError30 = false;
                var _iteratorError30 = undefined;

                try {
                  for (var _iterator30 = parentGroupTransitions[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
                    var parentGroupTransition = _step30.value;

                    if (parentGroupTransition != null) {
                      var toNodeId = parentGroupTransition.to;
                      if (pathSoFar.indexOf(toNodeId) == -1) {
                        /*
                         * recursively get the paths by getting all
                         * the paths for the to node
                         */
                        var allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                        var _iteratorNormalCompletion31 = true;
                        var _didIteratorError31 = false;
                        var _iteratorError31 = undefined;

                        try {
                          for (var _iterator31 = allPathsFromToNode[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
                            var tempPath = _step31.value;

                            tempPath.unshift(nodeId);
                            allPaths.push(tempPath);
                            addedCurrentNodeId = true;
                          }
                        } catch (err) {
                          _didIteratorError31 = true;
                          _iteratorError31 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion31 && _iterator31.return) {
                              _iterator31.return();
                            }
                          } finally {
                            if (_didIteratorError31) {
                              throw _iteratorError31;
                            }
                          }
                        }
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError30 = true;
                  _iteratorError30 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion30 && _iterator30.return) {
                      _iterator30.return();
                    }
                  } finally {
                    if (_didIteratorError30) {
                      throw _iteratorError30;
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

              var _iteratorNormalCompletion32 = true;
              var _didIteratorError32 = false;
              var _iteratorError32 = undefined;

              try {
                for (var _iterator32 = transitions[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
                  var transition = _step32.value;

                  if (transition != null) {
                    var _toNodeId = transition.to;
                    if (_toNodeId != null && pathSoFar.indexOf(_toNodeId) == -1) {
                      // we have not found the to node in the path yet so we can traverse it

                      /*
                       * recursively get the paths by getting all
                       * the paths from the to node
                       */
                      var _allPathsFromToNode = this.getAllPaths(pathSoFar, _toNodeId, includeGroups);

                      if (_allPathsFromToNode != null) {
                        var _iteratorNormalCompletion33 = true;
                        var _didIteratorError33 = false;
                        var _iteratorError33 = undefined;

                        try {
                          for (var _iterator33 = _allPathsFromToNode[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
                            var _tempPath = _step33.value;

                            if (includeGroups) {
                              // we need to add the group id to the path

                              if (_tempPath.length > 0) {
                                var firstNodeId = _tempPath[0];
                                var firstParentGroupId = this.getParentGroupId(firstNodeId);
                                var _parentGroupId2 = this.getParentGroupId(nodeId);
                                if (_parentGroupId2 != firstParentGroupId) {
                                  /*
                                   * the parent ids are different which means this is a boundary
                                   * between two groups. for example if the project looked like
                                   * group1>node1>node2>group2>node3>node4
                                   * and the current node was node2 then the first node in the
                                   * path would be node3 which means we would need to place
                                   * group2 on the path before node3
                                   */
                                  _tempPath.unshift(firstParentGroupId);
                                }
                              }
                            }

                            _tempPath.unshift(nodeId);
                            allPaths.push(_tempPath);
                          }
                        } catch (err) {
                          _didIteratorError33 = true;
                          _iteratorError33 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion33 && _iterator33.return) {
                              _iterator33.return();
                            }
                          } finally {
                            if (_didIteratorError33) {
                              throw _iteratorError33;
                            }
                          }
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
              } catch (err) {
                _didIteratorError32 = true;
                _iteratorError32 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion32 && _iterator32.return) {
                    _iterator32.return();
                  }
                } finally {
                  if (_didIteratorError32) {
                    throw _iteratorError32;
                  }
                }
              }
            }

            if (pathSoFar.length > 0) {
              var lastNodeId = pathSoFar[pathSoFar.length - 1];
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

                var _iteratorNormalCompletion34 = true;
                var _didIteratorError34 = false;
                var _iteratorError34 = undefined;

                try {
                  for (var _iterator34 = allPaths[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
                    var _path = _step34.value;

                    if (_path != null) {
                      /*
                       * prepend the parent group of the start node id
                       * to the path
                       */
                      _path.unshift(pathSoFar[0]);
                    }
                  }

                  /*
                   * remove the parent group of the start node id from
                   * pathSoFar which leaves us with an empty pathSoFar
                   * which means we are completely done with
                   * calculating all the paths
                   */
                } catch (err) {
                  _didIteratorError34 = true;
                  _iteratorError34 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion34 && _iterator34.return) {
                      _iterator34.return();
                    }
                  } finally {
                    if (_didIteratorError34) {
                      throw _iteratorError34;
                    }
                  }
                }

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

          var groupNode = this.getNodeById(nodeId);
          if (groupNode != null) {
            var startId = groupNode.startId;
            if (startId == null || startId == "") {
              // there is no start id so we will take the transition from the group
              // TODO? there is no start id so we will loop through all the child nodes

              var _transitions = this.getTransitionsByFromNodeId(groupNode.id);
              if (_transitions != null && _transitions.length > 0) {
                var _iteratorNormalCompletion35 = true;
                var _didIteratorError35 = false;
                var _iteratorError35 = undefined;

                try {
                  for (var _iterator35 = _transitions[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
                    var _transition = _step35.value;

                    if (_transition != null) {
                      var _toNodeId2 = _transition.to;

                      var _allPathsFromToNode2 = this.getAllPaths(pathSoFar, _toNodeId2, includeGroups);

                      if (_allPathsFromToNode2 != null) {
                        var _iteratorNormalCompletion36 = true;
                        var _didIteratorError36 = false;
                        var _iteratorError36 = undefined;

                        try {
                          for (var _iterator36 = _allPathsFromToNode2[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
                            var _tempPath2 = _step36.value;

                            _tempPath2.unshift(nodeId);
                            allPaths.push(_tempPath2);
                          }
                        } catch (err) {
                          _didIteratorError36 = true;
                          _iteratorError36 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion36 && _iterator36.return) {
                              _iterator36.return();
                            }
                          } finally {
                            if (_didIteratorError36) {
                              throw _iteratorError36;
                            }
                          }
                        }
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError35 = true;
                  _iteratorError35 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion35 && _iterator35.return) {
                      _iterator35.return();
                    }
                  } finally {
                    if (_didIteratorError35) {
                      throw _iteratorError35;
                    }
                  }
                }
              } else {
                /*
                 * this activity does not have any transitions so
                 * we have reached the end of this path
                 */

                var _tempPath3 = [];
                _tempPath3.unshift(nodeId);
                allPaths.push(_tempPath3);
              }
            } else {
              // there is a start id so we will traverse it

              var _allPathsFromToNode3 = this.getAllPaths(pathSoFar, startId, includeGroups);

              if (_allPathsFromToNode3 != null) {
                var _iteratorNormalCompletion37 = true;
                var _didIteratorError37 = false;
                var _iteratorError37 = undefined;

                try {
                  for (var _iterator37 = _allPathsFromToNode3[Symbol.iterator](), _step37; !(_iteratorNormalCompletion37 = (_step37 = _iterator37.next()).done); _iteratorNormalCompletion37 = true) {
                    var _tempPath4 = _step37.value;

                    _tempPath4.unshift(nodeId);
                    allPaths.push(_tempPath4);
                  }
                } catch (err) {
                  _didIteratorError37 = true;
                  _iteratorError37 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion37 && _iterator37.return) {
                      _iterator37.return();
                    }
                  } finally {
                    if (_didIteratorError37) {
                      throw _iteratorError37;
                    }
                  }
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
    }
  }, {
    key: 'consolidatePaths',


    /**
     * Consolidate all the paths into a linear list of node ids
     * @param paths an array of paths. each path is an array of node ids.
     * @return an array of node ids that have been properly ordered
     */
    value: function consolidatePaths(paths) {
      var consolidatedPath = [];

      if (paths != null) {
        /*
         * continue until all the paths are empty. as we consolidate
         * node ids, we will remove them from the paths. once all the
         * paths are empty we will be done consolidating the paths.
         */
        while (!this.arePathsEmpty(paths)) {
          // start with the first path
          var currentPath = this.getNonEmptyPathIndex(paths);

          // get the first node id in the current path
          var nodeId = this.getFirstNodeIdInPathAtIndex(paths, currentPath);
          if (this.areFirstNodeIdsInPathsTheSame(paths)) {
            // the first node ids in all the paths are the same

            // remove the node id from all the paths
            this.removeNodeIdFromPaths(nodeId, paths);

            // add the node id to our consolidated path
            consolidatedPath.push(nodeId);
          } else {
            // not all the top node ids are the same which means we have branched

            // get all the paths that contain the node id
            var pathsThatContainNodeId = this.getPathsThatContainNodeId(nodeId, paths);

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
                var consumedPath = this.consumePathsUntilNodeId(paths, nodeId);

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
    }
  }, {
    key: 'consumePathsUntilNodeId',


    /**
     * Consume the node ids in the paths until we get to the given node id
     * @param paths the paths to consume
     * @param nodeId the node id to stop consuming at
     * @return an array of node ids that we have consumed
     */
    value: function consumePathsUntilNodeId(paths, nodeId) {
      var consumedNodeIds = [];

      if (paths != null && nodeId != null) {
        for (var p = 0; p < paths.length; p++) {
          var path = paths[p];

          // check if the path contains the node id to stop consuming at
          if (path != null && path.indexOf(nodeId) != -1) {
            /*
             * the path does contain the node id to stop consuming at
             * so we will consume the node ids in this path until
             * we get to the given node id to stop consuming at
             */

            for (var x = 0; x < path.length; x++) {
              var tempNodeId = path[x];

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
                var pathsThatContainNodeId = this.getPathsThatContainNodeId(tempNodeId, paths);

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

                  var pathsToConsume = [];

                  var _iteratorNormalCompletion38 = true;
                  var _didIteratorError38 = false;
                  var _iteratorError38 = undefined;

                  try {
                    for (var _iterator38 = pathsThatContainNodeId[Symbol.iterator](), _step38; !(_iteratorNormalCompletion38 = (_step38 = _iterator38.next()).done); _iteratorNormalCompletion38 = true) {
                      var pathThatContainsNodeId = _step38.value;

                      // get the index of the node id we want to remove
                      var tempNodeIdIndex = pathThatContainsNodeId.indexOf(tempNodeId);

                      // get the index of the node id we want to stop consuming at
                      var nodeIdIndex = pathThatContainsNodeId.indexOf(nodeId);

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
                  } catch (err) {
                    _didIteratorError38 = true;
                    _iteratorError38 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion38 && _iterator38.return) {
                        _iterator38.return();
                      }
                    } finally {
                      if (_didIteratorError38) {
                        throw _iteratorError38;
                      }
                    }
                  }

                  var tempConsumedNodeIds = this.consumePathsUntilNodeId(pathsToConsume, tempNodeId);

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
    }
  }, {
    key: 'getFirstNodeIdInPathAtIndex',


    /**
     * Get the path at the given index and get the first node id in
     * the path
     * @param paths an array of paths. each path is an array of node ids
     * @param index the index of the path we want
     * @return the first node in the given path
     */
    value: function getFirstNodeIdInPathAtIndex(paths, index) {
      var nodeId = null;
      if (paths != null && index != null) {
        var path = paths[index];
        if (path != null && path.length > 0) {
          nodeId = path[0];
        }
      }
      return nodeId;
    }
  }, {
    key: 'removeNodeIdFromPaths',


    /**
     * Remove the node ifrom the paths
     * @param nodeId the node id to remove
     * @param paths an array of paths. each path is an array of node ids
     */
    value: function removeNodeIdFromPaths(nodeId, paths) {
      if (nodeId != null && paths != null) {
        var _iteratorNormalCompletion39 = true;
        var _didIteratorError39 = false;
        var _iteratorError39 = undefined;

        try {
          for (var _iterator39 = paths[Symbol.iterator](), _step39; !(_iteratorNormalCompletion39 = (_step39 = _iterator39.next()).done); _iteratorNormalCompletion39 = true) {
            var path = _step39.value;

            for (var x = 0; x < path.length; x++) {
              var tempNodeId = path[x];

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
        } catch (err) {
          _didIteratorError39 = true;
          _iteratorError39 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion39 && _iterator39.return) {
              _iterator39.return();
            }
          } finally {
            if (_didIteratorError39) {
              throw _iteratorError39;
            }
          }
        }
      }
    }
  }, {
    key: 'removeNodeIdFromPath',


    /**
     * Remove the node id from the path
     * @param nodeId the node id to remove
     * @param paths an array of paths. each path is an array of node ids
     * @param pathIndex the path to remove from
     */
    value: function removeNodeIdFromPath(nodeId, paths, pathIndex) {
      if (nodeId != null && paths != null && pathIndex != null) {
        var path = paths[pathIndex];
        if (path != null) {
          for (var x = 0; x < path.length; x++) {
            var tempNodeId = path[x];

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
    }
  }, {
    key: 'areFirstNodeIdsInPathsTheSame',


    /**
     * Check if the first node ids in the paths are the same
     * @param paths an array of paths. each path is an array of node ids
     * @return whether all the paths have the same first node id
     */
    value: function areFirstNodeIdsInPathsTheSame(paths) {
      var result = true;
      var nodeId = null;
      if (paths != null) {
        var _iteratorNormalCompletion40 = true;
        var _didIteratorError40 = false;
        var _iteratorError40 = undefined;

        try {
          for (var _iterator40 = paths[Symbol.iterator](), _step40; !(_iteratorNormalCompletion40 = (_step40 = _iterator40.next()).done); _iteratorNormalCompletion40 = true) {
            var path = _step40.value;

            var tempNodeId = path[0];
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
        } catch (err) {
          _didIteratorError40 = true;
          _iteratorError40 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion40 && _iterator40.return) {
              _iterator40.return();
            }
          } finally {
            if (_didIteratorError40) {
              throw _iteratorError40;
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'arePathsEmpty',


    /**
     * Check if all the paths are empty
     * @param paths an array of paths. each path is an array of node ids
     * @return whether all the paths are empty
     */
    value: function arePathsEmpty(paths) {
      if (paths != null) {
        var _iteratorNormalCompletion41 = true;
        var _didIteratorError41 = false;
        var _iteratorError41 = undefined;

        try {
          for (var _iterator41 = paths[Symbol.iterator](), _step41; !(_iteratorNormalCompletion41 = (_step41 = _iterator41.next()).done); _iteratorNormalCompletion41 = true) {
            var path = _step41.value;

            if (path != null) {
              if (path.length !== 0) {
                return false;
              }
            }
          }
        } catch (err) {
          _didIteratorError41 = true;
          _iteratorError41 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion41 && _iterator41.return) {
              _iterator41.return();
            }
          } finally {
            if (_didIteratorError41) {
              throw _iteratorError41;
            }
          }
        }
      }
      return true;
    }
  }, {
    key: 'getPathsThatContainNodeId',


    /**
     * Get the paths that contain the node id
     * @param nodeId the node id we are looking for
     * @param paths an array of paths. each path is an array of node ids
     * @return an array of paths that contain the given node id
     */
    value: function getPathsThatContainNodeId(nodeId, paths) {
      var pathsThatContainNodeId = [];
      if (nodeId != null && paths != null) {
        var _iteratorNormalCompletion42 = true;
        var _didIteratorError42 = false;
        var _iteratorError42 = undefined;

        try {
          for (var _iterator42 = paths[Symbol.iterator](), _step42; !(_iteratorNormalCompletion42 = (_step42 = _iterator42.next()).done); _iteratorNormalCompletion42 = true) {
            var path = _step42.value;

            // check if the path contains the node id
            if (path.indexOf(nodeId) != -1) {
              /*
               * add the path to the array of paths that contain
               * the node id
               */
              pathsThatContainNodeId.push(path);
            }
          }
        } catch (err) {
          _didIteratorError42 = true;
          _iteratorError42 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion42 && _iterator42.return) {
              _iterator42.return();
            }
          } finally {
            if (_didIteratorError42) {
              throw _iteratorError42;
            }
          }
        }
      }
      return pathsThatContainNodeId;
    }
  }, {
    key: 'getNonEmptyPathIndex',


    /**
     * Get a non empty path index. It will loop through the paths and
     * return the index of the first non empty path.
     * @param paths an array of paths. each path is an array of node ids
     * @return the index of the path that is not empty
     */
    value: function getNonEmptyPathIndex(paths) {
      if (paths != null) {
        for (var p = 0; p < paths.length; p++) {
          var path = paths[p];
          if (path.length !== 0) {
            return p;
          }
        }
      }
      return null;
    }
  }, {
    key: 'setBranchesCache',


    /**
     * Remember the branches.
     * @param branches An array of arrays of node ids.
     */
    value: function setBranchesCache(branches) {
      this.branchesCache = branches;
    }

    /**
     * Get the branches that were previously calculated.
     * @returns An array of arrays of node ids.
     */

  }, {
    key: 'getBranchesCache',
    value: function getBranchesCache() {
      return this.branchesCache;
    }

    /**
     * Remove the branches cache.
     */

  }, {
    key: 'clearBranchesCache',
    value: function clearBranchesCache() {
      this.branchesCache = null;
    }

    /**
     * Get the branches in the project
     */

  }, {
    key: 'getBranches',
    value: function getBranches() {
      /*
       * Do not use the branches cache in the authoring tool because the branches
       * may change when the author changes the project. In all other modes the
       * branches can't change so we can use the cache.
       */
      if (this.ConfigService.getMode() != 'author') {
        var branchesCache = this.getBranchesCache();
        if (branchesCache != null) {
          return branchesCache;
        }
      }

      var startNodeId = this.getStartNodeId();

      /*
       * an array to keep track of the node ids in the path that
       * we are currently on as we traverse the nodes in the project
       * depth first
       */
      var pathsSoFar = [];

      var allPaths = this.getAllPaths(pathsSoFar, startNodeId);
      var branches = this.findBranches(allPaths);
      if (this.ConfigService.getMode() != 'author') {
        this.setBranchesCache(branches);
      }
      return branches;
    }
  }, {
    key: 'findBranches',


    /**
     * Find the branches in the project
     * @param paths all the possible paths through the project
     * @return an array of branch objects. each branch object contains
     * the branch start point, the branch paths, and the branch
     * end point
     */
    value: function findBranches(paths) {
      var branches = [];
      var previousNodeId = null;

      /*
       * continue until all the paths are empty. we will remove
       * node ids from the paths as we traverse the paths to find
       * the branches
       */
      while (!this.arePathsEmpty(paths)) {
        var nodeId = this.getFirstNodeIdInPathAtIndex(paths, 0);

        if (this.areFirstNodeIdsInPathsTheSame(paths)) {
          // the first node ids in all the paths are the same

          this.removeNodeIdFromPaths(nodeId, paths);
          previousNodeId = nodeId;
        } else {
          // not all the top node ids are the same which means we have branched

          var branchMetaObject = this.createBranchMetaObject(previousNodeId);
          branchMetaObject.branchStartPoint = previousNodeId;

          var nextCommonNodeId = this.findNextCommonNodeId(paths);
          branchMetaObject.branchEndPoint = nextCommonNodeId;

          var branchPaths = this.extractPathsUpToNodeId(paths, nextCommonNodeId);
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
    }
  }, {
    key: 'createBranchMetaObject',


    /**
     * Create a branch meta object that will contain the branch start
     * point, branch paths, and branch end point
     * @return an object that contains a branch start point, branch paths,
     * and a branch end point
     */
    value: function createBranchMetaObject() {
      var branchMetaObject = {};
      branchMetaObject.branchStartPoint = null;
      branchMetaObject.branchPaths = [];
      branchMetaObject.branchEndPoint = null;
      return branchMetaObject;
    }
  }, {
    key: 'findNextCommonNodeId',


    /**
     * Find the next common node id in all the paths
     * @param paths the paths to find the common node id in
     * @return a node id that is in all the paths or null
     * if there is no node id that is in all the paths
     */
    value: function findNextCommonNodeId(paths) {
      var nextCommonNodeId = null;
      if (paths != null) {
        if (paths.length > 0) {
          var path = paths[0];

          var _iteratorNormalCompletion43 = true;
          var _didIteratorError43 = false;
          var _iteratorError43 = undefined;

          try {
            for (var _iterator43 = path[Symbol.iterator](), _step43; !(_iteratorNormalCompletion43 = (_step43 = _iterator43.next()).done); _iteratorNormalCompletion43 = true) {
              var tempNodeId = _step43.value;

              if (this.allPathsContainNodeId(paths, tempNodeId)) {
                /*
                 * the node id is in all the paths so we have found
                 * what we were looking for
                 */
                nextCommonNodeId = tempNodeId;
                break;
              }
            }
          } catch (err) {
            _didIteratorError43 = true;
            _iteratorError43 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion43 && _iterator43.return) {
                _iterator43.return();
              }
            } finally {
              if (_didIteratorError43) {
                throw _iteratorError43;
              }
            }
          }
        }
      }
      return nextCommonNodeId;
    }
  }, {
    key: 'allPathsContainNodeId',


    /**
     * Check if all the paths contain the node id
     * @param paths an array of paths. each path contains an array of node ids
     * @param nodeId the node id that we will check is in all the paths
     * @return whether the node id is in all the paths
     */
    value: function allPathsContainNodeId(paths, nodeId) {
      var result = false;
      if (paths != null) {
        var _iteratorNormalCompletion44 = true;
        var _didIteratorError44 = false;
        var _iteratorError44 = undefined;

        try {
          for (var _iterator44 = paths[Symbol.iterator](), _step44; !(_iteratorNormalCompletion44 = (_step44 = _iterator44.next()).done); _iteratorNormalCompletion44 = true) {
            var path = _step44.value;

            var index = path.indexOf(nodeId);
            if (index == -1) {
              result = false;
              break;
            } else {
              result = true;
            }
          }
        } catch (err) {
          _didIteratorError44 = true;
          _iteratorError44 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion44 && _iterator44.return) {
              _iterator44.return();
            }
          } finally {
            if (_didIteratorError44) {
              throw _iteratorError44;
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'trimPathsUpToNodeId',


    /**
     * Trim the paths up to the given node id so that the paths will contain
     * the given node id and all the node ids after it. This function will
     * modify the paths.
     * @param paths the paths to trim
     * @param nodeId the node id to trim up to
     */
    value: function trimPathsUpToNodeId(paths, nodeId) {
      if (paths != null) {
        var _iteratorNormalCompletion45 = true;
        var _didIteratorError45 = false;
        var _iteratorError45 = undefined;

        try {
          for (var _iterator45 = paths[Symbol.iterator](), _step45; !(_iteratorNormalCompletion45 = (_step45 = _iterator45.next()).done); _iteratorNormalCompletion45 = true) {
            var path = _step45.value;

            if (path != null) {
              var index = path.indexOf(nodeId);

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
        } catch (err) {
          _didIteratorError45 = true;
          _iteratorError45 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion45 && _iterator45.return) {
              _iterator45.return();
            }
          } finally {
            if (_didIteratorError45) {
              throw _iteratorError45;
            }
          }
        }
      }
    }
  }, {
    key: 'extractPathsUpToNodeId',


    /**
     * Extract the paths up to a given node id. This will be used to
     * obtain branch paths.
     * @param paths the paths to extract from
     * @param nodeId the node id to extract up to
     * @return paths that go up to but do not include the node id
     */
    value: function extractPathsUpToNodeId(paths, nodeId) {
      var extractedPaths = [];
      if (paths != null) {
        var _iteratorNormalCompletion46 = true;
        var _didIteratorError46 = false;
        var _iteratorError46 = undefined;

        try {
          for (var _iterator46 = paths[Symbol.iterator](), _step46; !(_iteratorNormalCompletion46 = (_step46 = _iterator46.next()).done); _iteratorNormalCompletion46 = true) {
            var path = _step46.value;

            if (path != null) {
              var index = path.indexOf(nodeId);

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
              var extractedPath = path.slice(0, index);

              extractedPaths.push(extractedPath);
            }
          }
        } catch (err) {
          _didIteratorError46 = true;
          _iteratorError46 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion46 && _iterator46.return) {
              _iterator46.return();
            }
          } finally {
            if (_didIteratorError46) {
              throw _iteratorError46;
            }
          }
        }
      }
      return extractedPaths;
    }
  }, {
    key: 'removeDuplicatePaths',


    /**
     * Removes duplicate paths
     * @param paths an array of paths. each path contains an array of node ids
     * @return an array of unique paths
     */
    value: function removeDuplicatePaths(paths) {
      var uniquePaths = [];
      if (paths != null) {
        var _iteratorNormalCompletion47 = true;
        var _didIteratorError47 = false;
        var _iteratorError47 = undefined;

        try {
          for (var _iterator47 = paths[Symbol.iterator](), _step47; !(_iteratorNormalCompletion47 = (_step47 = _iterator47.next()).done); _iteratorNormalCompletion47 = true) {
            var path = _step47.value;

            var isPathInUniquePaths = false;
            var _iteratorNormalCompletion48 = true;
            var _didIteratorError48 = false;
            var _iteratorError48 = undefined;

            try {
              for (var _iterator48 = uniquePaths[Symbol.iterator](), _step48; !(_iteratorNormalCompletion48 = (_step48 = _iterator48.next()).done); _iteratorNormalCompletion48 = true) {
                var uniquePath = _step48.value;

                if (this.pathsEqual(path, uniquePath)) {
                  isPathInUniquePaths = true;
                }
              }
            } catch (err) {
              _didIteratorError48 = true;
              _iteratorError48 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion48 && _iterator48.return) {
                  _iterator48.return();
                }
              } finally {
                if (_didIteratorError48) {
                  throw _iteratorError48;
                }
              }
            }

            if (!isPathInUniquePaths) {
              // the path is not equal to any paths in the unique
              // paths array so we will add it to the unique paths array
              uniquePaths.push(path);
            }
          }
        } catch (err) {
          _didIteratorError47 = true;
          _iteratorError47 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion47 && _iterator47.return) {
              _iterator47.return();
            }
          } finally {
            if (_didIteratorError47) {
              throw _iteratorError47;
            }
          }
        }
      }
      return uniquePaths;
    }
  }, {
    key: 'pathsEqual',


    /**
     * Check if two paths are equal
     * @param path1 an array of node ids
     * @param path2 an array of node ids
     * @return whether the two paths contain the same node ids
     * in the same order
     */
    value: function pathsEqual(path1, path2) {
      var result = false;
      if (path1 != null && path2 != null) {
        if (path1.length === path2.length) {
          result = true;

          for (var x = 0; x < path1.length; x++) {
            var path1NodeId = path1[x];
            var path2NodeId = path2[x];
            if (path1NodeId !== path2NodeId) {
              result = false;
              break;
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'isNodeIdInABranch',


    /**
     * Check if a node id is in any branch
     * @param branches an array of branch objects
     * @param nodeId the node id to check
     * @return whether the node id is in any branch
     */
    value: function isNodeIdInABranch(branches, nodeId) {
      if (branches != null && nodeId != null) {
        var _iteratorNormalCompletion49 = true;
        var _didIteratorError49 = false;
        var _iteratorError49 = undefined;

        try {
          for (var _iterator49 = branches[Symbol.iterator](), _step49; !(_iteratorNormalCompletion49 = (_step49 = _iterator49.next()).done); _iteratorNormalCompletion49 = true) {
            var branch = _step49.value;

            if (branch != null) {
              var branchPaths = branch.branchPaths;
              if (branchPaths != null) {
                var _iteratorNormalCompletion50 = true;
                var _didIteratorError50 = false;
                var _iteratorError50 = undefined;

                try {
                  for (var _iterator50 = branchPaths[Symbol.iterator](), _step50; !(_iteratorNormalCompletion50 = (_step50 = _iterator50.next()).done); _iteratorNormalCompletion50 = true) {
                    var branchPath = _step50.value;

                    if (branchPath != null) {
                      var index = branchPath.indexOf(nodeId);
                      if (index != -1) {
                        return true;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError50 = true;
                  _iteratorError50 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion50 && _iterator50.return) {
                      _iterator50.return();
                    }
                  } finally {
                    if (_didIteratorError50) {
                      throw _iteratorError50;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError49 = true;
          _iteratorError49 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion49 && _iterator49.return) {
              _iterator49.return();
            }
          } finally {
            if (_didIteratorError49) {
              throw _iteratorError49;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'getBranchPathsByNodeId',


    /**
     * Get the branch paths that a node id is in
     * @param branches an array of branch objects
     * @param nodeId the node id to check
     * @return an array of the branch paths that the node id is in
     */
    value: function getBranchPathsByNodeId(branches, nodeId) {
      var branchPathsIn = [];
      if (branches != null && nodeId != null) {
        var _iteratorNormalCompletion51 = true;
        var _didIteratorError51 = false;
        var _iteratorError51 = undefined;

        try {
          for (var _iterator51 = branches[Symbol.iterator](), _step51; !(_iteratorNormalCompletion51 = (_step51 = _iterator51.next()).done); _iteratorNormalCompletion51 = true) {
            var branch = _step51.value;

            if (branch != null) {
              var branchPaths = branch.branchPaths;
              if (branchPaths != null) {
                var _iteratorNormalCompletion52 = true;
                var _didIteratorError52 = false;
                var _iteratorError52 = undefined;

                try {
                  for (var _iterator52 = branchPaths[Symbol.iterator](), _step52; !(_iteratorNormalCompletion52 = (_step52 = _iterator52.next()).done); _iteratorNormalCompletion52 = true) {
                    var branchPath = _step52.value;

                    if (branchPath != null) {
                      var index = branchPath.indexOf(nodeId);
                      if (index != -1) {
                        /*
                         * the node is in this branch path so we will
                         * add the branch path to our array
                         */
                        branchPathsIn.push(branchPath);
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError52 = true;
                  _iteratorError52 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion52 && _iterator52.return) {
                      _iterator52.return();
                    }
                  } finally {
                    if (_didIteratorError52) {
                      throw _iteratorError52;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError51 = true;
          _iteratorError51 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion51 && _iterator51.return) {
              _iterator51.return();
            }
          } finally {
            if (_didIteratorError51) {
              throw _iteratorError51;
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

  }, {
    key: 'getComponentByNodeIdAndComponentId',
    value: function getComponentByNodeIdAndComponentId(nodeId, componentId) {
      if (nodeId != null && componentId != null) {
        var components = this.getComponentsByNodeId(nodeId);
        var _iteratorNormalCompletion53 = true;
        var _didIteratorError53 = false;
        var _iteratorError53 = undefined;

        try {
          for (var _iterator53 = components[Symbol.iterator](), _step53; !(_iteratorNormalCompletion53 = (_step53 = _iterator53.next()).done); _iteratorNormalCompletion53 = true) {
            var tempComponent = _step53.value;

            if (tempComponent != null) {
              var tempComponentId = tempComponent.id;
              if (componentId === tempComponentId) {
                return tempComponent;
              }
            }
          }
        } catch (err) {
          _didIteratorError53 = true;
          _iteratorError53 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion53 && _iterator53.return) {
              _iterator53.return();
            }
          } finally {
            if (_didIteratorError53) {
              throw _iteratorError53;
            }
          }
        }
      }
      return null;
    }
  }, {
    key: 'getComponentPositionByNodeIdAndComponentId',


    /**
     * Returns the position of the component in the node by node id and
     * component id, 0-indexed.
     * @param nodeId the node id
     * @param componentId the component id
     * @returns the component's position or -1 if nodeId or componentId are null
     * or doesn't exist in the project.
     */
    value: function getComponentPositionByNodeIdAndComponentId(nodeId, componentId) {
      if (nodeId != null && componentId != null) {
        var components = this.getComponentsByNodeId(nodeId);
        for (var c = 0; c < components.length; c++) {
          var tempComponent = components[c];
          if (tempComponent != null) {
            var tempComponentId = tempComponent.id;
            if (componentId === tempComponentId) {
              return c;
            }
          }
        }
      }
      return -1;
    }
  }, {
    key: 'getComponentsByNodeId',


    /**
     * Get the components in a node
     * @param nodeId the node id
     * @returns an array of components or empty array if nodeId is null or
     * doesn't exist in the project.
     * if the node exists but doesn't have any components, returns an empty array.
     */
    value: function getComponentsByNodeId(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          if (node.components != null) {
            return node.components;
          }
        }
      }
      return [];
    }
  }, {
    key: 'getNodeContentByNodeId',


    // TODO: how is this different from straight-up calling getNodeById?
    value: function getNodeContentByNodeId(nodeId) {
      var nodeContent = null;
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          nodeContent = node;
        }
      }
      return nodeContent;
    }
  }, {
    key: 'insertNodeAfterInGroups',


    /**
     * Insert the node after the given node id in the group's
     * array of children ids
     * @param nodeIdToInsert the node id we want to insert
     * @param nodeIdToInsertAfter the node id we want to insert after
     */
    value: function insertNodeAfterInGroups(nodeIdToInsert, nodeIdToInsertAfter) {
      var groupNodes = this.getGroupNodes();
      if (groupNodes != null) {
        var _iteratorNormalCompletion54 = true;
        var _didIteratorError54 = false;
        var _iteratorError54 = undefined;

        try {
          for (var _iterator54 = groupNodes[Symbol.iterator](), _step54; !(_iteratorNormalCompletion54 = (_step54 = _iterator54.next()).done); _iteratorNormalCompletion54 = true) {
            var group = _step54.value;

            if (group != null) {
              this.insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter);
            }
          }
        } catch (err) {
          _didIteratorError54 = true;
          _iteratorError54 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion54 && _iterator54.return) {
              _iterator54.return();
            }
          } finally {
            if (_didIteratorError54) {
              throw _iteratorError54;
            }
          }
        }
      }
      var inactiveGroupNodes = this.getInactiveGroupNodes();
      if (inactiveGroupNodes != null) {
        var _iteratorNormalCompletion55 = true;
        var _didIteratorError55 = false;
        var _iteratorError55 = undefined;

        try {
          for (var _iterator55 = inactiveGroupNodes[Symbol.iterator](), _step55; !(_iteratorNormalCompletion55 = (_step55 = _iterator55.next()).done); _iteratorNormalCompletion55 = true) {
            var inactiveGroup = _step55.value;

            if (inactiveGroup != null) {
              this.insertNodeAfterInGroup(inactiveGroup, nodeIdToInsert, nodeIdToInsertAfter);
            }
          }
        } catch (err) {
          _didIteratorError55 = true;
          _iteratorError55 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion55 && _iterator55.return) {
              _iterator55.return();
            }
          } finally {
            if (_didIteratorError55) {
              throw _iteratorError55;
            }
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

  }, {
    key: 'insertNodeAfterInGroup',
    value: function insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter) {
      var ids = group.ids;
      if (ids != null) {
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
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

  }, {
    key: 'insertNodeAfterInTransitions',
    value: function insertNodeAfterInTransitions(node, nodeId) {
      var previousNode = this.getNodeById(nodeId);

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

        var previousNodeTransitionLogic = previousNode.transitionLogic;

        if (previousNodeTransitionLogic != null) {
          var transitions = previousNodeTransitionLogic.transitions;

          if (transitions != null) {
            var transitionsJSONString = angular.toJson(transitions);
            var transitionsCopy = angular.fromJson(transitionsJSONString);

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

          var parentGroupId = this.getParentGroupId(nodeId);

          if (parentGroupId != null && parentGroupId != '' && parentGroupId != 'group0') {
            var parentTransitions = this.getTransitionsByFromNodeId(parentGroupId);

            if (parentTransitions != null) {
              var _iteratorNormalCompletion56 = true;
              var _didIteratorError56 = false;
              var _iteratorError56 = undefined;

              try {
                for (var _iterator56 = parentTransitions[Symbol.iterator](), _step56; !(_iteratorNormalCompletion56 = (_step56 = _iterator56.next()).done); _iteratorNormalCompletion56 = true) {
                  var parentTransition = _step56.value;

                  var newTransition = {};
                  if (parentTransition != null) {
                    var toNodeId = parentTransition.to;
                    if (this.isGroupNode(toNodeId)) {
                      var startId = this.getGroupStartId(toNodeId);
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
              } catch (err) {
                _didIteratorError56 = true;
                _iteratorError56 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion56 && _iterator56.return) {
                    _iterator56.return();
                  }
                } finally {
                  if (_didIteratorError56) {
                    throw _iteratorError56;
                  }
                }
              }
            }
          }
        }

        var newNodeId = node.id;

        // TODO handle branching case

        previousNode.transitionLogic.transitions = [];

        var transitionObject = {};
        transitionObject.to = newNodeId;
        previousNode.transitionLogic.transitions.push(transitionObject);
        this.removeBranchPathTakenNodeConstraints(node.id);
        var branchPathTakenConstraints = this.getBranchPathTakenConstraintsByNodeId(nodeId);

        /*
         * if the previous node was in a branch path, we will also put the
         * inserted node into the branch path
         */
        if (branchPathTakenConstraints != null && branchPathTakenConstraints.length > 0) {
          if (node.constraints == null) {
            node.constraints = [];
          }

          var _iteratorNormalCompletion57 = true;
          var _didIteratorError57 = false;
          var _iteratorError57 = undefined;

          try {
            for (var _iterator57 = branchPathTakenConstraints[Symbol.iterator](), _step57; !(_iteratorNormalCompletion57 = (_step57 = _iterator57.next()).done); _iteratorNormalCompletion57 = true) {
              var branchPathTakenConstraint = _step57.value;

              if (branchPathTakenConstraint != null) {
                // create a new constraint with the same branch path taken parameters
                var newConstraint = {};
                newConstraint.id = this.getNextAvailableConstraintIdForNodeId(node.id);
                newConstraint.action = branchPathTakenConstraint.action;
                newConstraint.targetId = node.id;
                newConstraint.removalCriteria = this.UtilService.makeCopyOfJSONObject(branchPathTakenConstraint.removalCriteria);
                node.constraints.push(newConstraint);
              }
            }
          } catch (err) {
            _didIteratorError57 = true;
            _iteratorError57 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion57 && _iterator57.return) {
                _iterator57.return();
              }
            } finally {
              if (_didIteratorError57) {
                throw _iteratorError57;
              }
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

  }, {
    key: 'insertNodeInsideInGroups',
    value: function insertNodeInsideInGroups(nodeIdToInsert, nodeIdToInsertInside) {
      var group = this.getNodeById(nodeIdToInsertInside);
      if (group != null) {
        var ids = group.ids;
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

  }, {
    key: 'insertNodeInsideInTransitions',
    value: function insertNodeInsideInTransitions(nodeIdToInsert, nodeIdToInsertInside) {
      var nodeToInsert = this.getNodeById(nodeIdToInsert);

      if (nodeToInsert != null && nodeToInsert.transitionLogic != null && nodeToInsert.transitionLogic.transitions != null) {
        nodeToInsert.transitionLogic.transitions = [];

        /*
         * remove the branch path taken constraints from the node we are
         * inserting
         */
        this.removeBranchPathTakenNodeConstraints(nodeIdToInsert);
      }

      var group = this.getNodeById(nodeIdToInsertInside);
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
        var startId = group.startId;
        var previousNodes = this.getNodesByToNodeId(startId);

        if (previousNodes == null || previousNodes.length == 0) {
          var previousGroups = this.getGroupNodesByToNodeId(nodeIdToInsertInside);
          var _iteratorNormalCompletion58 = true;
          var _didIteratorError58 = false;
          var _iteratorError58 = undefined;

          try {
            for (var _iterator58 = previousGroups[Symbol.iterator](), _step58; !(_iteratorNormalCompletion58 = (_step58 = _iterator58.next()).done); _iteratorNormalCompletion58 = true) {
              var previousGroup = _step58.value;

              if (previousGroup != null) {
                // get the nodes that do not have a transition in the previous group
                var lastNodesInGroup = this.getLastNodesInGroup(previousGroup.id);

                var _iteratorNormalCompletion59 = true;
                var _didIteratorError59 = false;
                var _iteratorError59 = undefined;

                try {
                  for (var _iterator59 = lastNodesInGroup[Symbol.iterator](), _step59; !(_iteratorNormalCompletion59 = (_step59 = _iterator59.next()).done); _iteratorNormalCompletion59 = true) {
                    var node = _step59.value;

                    // add a transition from the node to the node we are inserting
                    this.addToTransition(node, nodeIdToInsert);
                  }
                } catch (err) {
                  _didIteratorError59 = true;
                  _iteratorError59 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion59 && _iterator59.return) {
                      _iterator59.return();
                    }
                  } finally {
                    if (_didIteratorError59) {
                      throw _iteratorError59;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError58 = true;
            _iteratorError58 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion58 && _iterator58.return) {
                _iterator58.return();
              }
            } finally {
              if (_didIteratorError58) {
                throw _iteratorError58;
              }
            }
          }
        } else {
          var _iteratorNormalCompletion60 = true;
          var _didIteratorError60 = false;
          var _iteratorError60 = undefined;

          try {
            for (var _iterator60 = previousNodes[Symbol.iterator](), _step60; !(_iteratorNormalCompletion60 = (_step60 = _iterator60.next()).done); _iteratorNormalCompletion60 = true) {
              var previousNode = _step60.value;

              if (previousNode != null && previousNode.id != 'group0') {
                // change the transition to point to the node we are inserting
                this.updateToTransition(previousNode, startId, nodeIdToInsert);
              }
            }
          } catch (err) {
            _didIteratorError60 = true;
            _iteratorError60 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion60 && _iterator60.return) {
                _iterator60.return();
              }
            } finally {
              if (_didIteratorError60) {
                throw _iteratorError60;
              }
            }
          }
        }

        /*
         * update all the transitions that point to the group and change
         * them to point to the new start id
         */
        var nodesThatTransitionToGroup = this.getNodesByToNodeId(nodeIdToInsertInside);

        if (nodesThatTransitionToGroup != null) {
          var _iteratorNormalCompletion61 = true;
          var _didIteratorError61 = false;
          var _iteratorError61 = undefined;

          try {
            for (var _iterator61 = nodesThatTransitionToGroup[Symbol.iterator](), _step61; !(_iteratorNormalCompletion61 = (_step61 = _iterator61.next()).done); _iteratorNormalCompletion61 = true) {
              var nodeThatTransitionsToGroup = _step61.value;

              if (!this.isGroupNode(nodeThatTransitionsToGroup.id)) {
                this.updateToTransition(nodeThatTransitionsToGroup, nodeIdToInsertInside, nodeIdToInsert);
              }
            }
          } catch (err) {
            _didIteratorError61 = true;
            _iteratorError61 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion61 && _iterator61.return) {
                _iterator61.return();
              }
            } finally {
              if (_didIteratorError61) {
                throw _iteratorError61;
              }
            }
          }
        }

        /*
         * create a transition from the node we are inserting to the node that
         * was previously the start node
         */
        if (startId != null && startId != '') {
          var startNode = this.getNodeById(startId);

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
            var transitionObject = {};
            transitionObject.to = startId;
            nodeToInsert.transitionLogic.transitions.push(transitionObject);
          }
        }

        // check if the node we inserted has any transitions now
        var transitions = this.getTransitionsByFromNodeId(nodeIdToInsert);

        if (transitions == null || transitions.length == 0) {
          /*
           * the node doesn't have any transitions so we will see if
           * the parent group transitions to anything and use that
           * transition
           */

          var parentTransitions = this.getTransitionsByFromNodeId(nodeIdToInsertInside);

          if (parentTransitions != null) {
            var _iteratorNormalCompletion62 = true;
            var _didIteratorError62 = false;
            var _iteratorError62 = undefined;

            try {
              for (var _iterator62 = parentTransitions[Symbol.iterator](), _step62; !(_iteratorNormalCompletion62 = (_step62 = _iterator62.next()).done); _iteratorNormalCompletion62 = true) {
                var parentTransition = _step62.value;

                if (parentTransition != null) {
                  var toNodeId = parentTransition.to;
                  if (this.isGroupNode(toNodeId)) {
                    var nextGroup = this.getNodeById(toNodeId);

                    if (nextGroup != null) {
                      var _startId = nextGroup.startId;

                      if (_startId == null || _startId == '') {
                        // there is no start id so we will just transition to the group
                        this.addToTransition(nodeToInsert, toNodeId);
                      } else {
                        // there is a start id so we will transition to that
                        this.addToTransition(nodeToInsert, _startId);
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
            } catch (err) {
              _didIteratorError62 = true;
              _iteratorError62 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion62 && _iterator62.return) {
                  _iterator62.return();
                }
              } finally {
                if (_didIteratorError62) {
                  throw _iteratorError62;
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

  }, {
    key: 'addToTransition',
    value: function addToTransition(node, toNodeId, criteria) {
      if (node != null) {
        if (node.transitionLogic == null) {
          node.transitionLogic = {};
        }
        if (node.transitionLogic.transitions == null) {
          node.transitionLogic.transitions = [];
        }
        var transition = {};
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

  }, {
    key: 'updateToTransition',
    value: function updateToTransition(node, oldToNodeId, newToNodeId) {
      if (node != null) {
        if (node.transitionLogic == null) {
          node.transitionLogic = {};
        }

        if (node.transitionLogic.transitions == null) {
          node.transitionLogic.transitions = [];
        }

        var transitions = node.transitionLogic.transitions;
        var _iteratorNormalCompletion63 = true;
        var _didIteratorError63 = false;
        var _iteratorError63 = undefined;

        try {
          for (var _iterator63 = transitions[Symbol.iterator](), _step63; !(_iteratorNormalCompletion63 = (_step63 = _iterator63.next()).done); _iteratorNormalCompletion63 = true) {
            var transition = _step63.value;

            if (transition != null) {
              var toNodeId = transition.to;
              if (oldToNodeId === toNodeId) {
                transition.to = newToNodeId;
              }
            }
          }
        } catch (err) {
          _didIteratorError63 = true;
          _iteratorError63 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion63 && _iterator63.return) {
              _iterator63.return();
            }
          } finally {
            if (_didIteratorError63) {
              throw _iteratorError63;
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

  }, {
    key: 'getLastNodesInGroup',
    value: function getLastNodesInGroup(groupId) {
      var lastNodes = [];
      if (groupId != null) {
        var group = this.getNodeById(groupId);
        if (group != null) {
          var childIds = group.ids;
          if (childIds != null) {
            var _iteratorNormalCompletion64 = true;
            var _didIteratorError64 = false;
            var _iteratorError64 = undefined;

            try {
              for (var _iterator64 = childIds[Symbol.iterator](), _step64; !(_iteratorNormalCompletion64 = (_step64 = _iterator64.next()).done); _iteratorNormalCompletion64 = true) {
                var childId = _step64.value;

                if (childId != null) {
                  var child = this.getNodeById(childId);
                  if (child != null) {
                    var transitionLogic = child.transitionLogic;
                    if (transitionLogic != null) {
                      var transitions = transitionLogic.transitions;
                      if (transitions == null || transitions.length == 0) {
                        lastNodes.push(child);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError64 = true;
              _iteratorError64 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion64 && _iterator64.return) {
                  _iterator64.return();
                }
              } finally {
                if (_didIteratorError64) {
                  throw _iteratorError64;
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

  }, {
    key: 'getNextAvailableGroupId',
    value: function getNextAvailableGroupId() {
      var groupIds = this.getGroupIds();
      var largestGroupIdNumber = null;
      var _iteratorNormalCompletion65 = true;
      var _didIteratorError65 = false;
      var _iteratorError65 = undefined;

      try {
        for (var _iterator65 = groupIds[Symbol.iterator](), _step65; !(_iteratorNormalCompletion65 = (_step65 = _iterator65.next()).done); _iteratorNormalCompletion65 = true) {
          var groupId = _step65.value;

          // get the number from the group id e.g. the number of 'group2' would be 2
          var groupIdNumber = groupId.replace('group', '');

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
      } catch (err) {
        _didIteratorError65 = true;
        _iteratorError65 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion65 && _iterator65.return) {
            _iterator65.return();
          }
        } finally {
          if (_didIteratorError65) {
            throw _iteratorError65;
          }
        }
      }

      var nextAvailableGroupId = 'group' + (largestGroupIdNumber + 1);
      return nextAvailableGroupId;
    }

    /**
     * Get all the group ids
     * @returns an array with all the group ids
     */

  }, {
    key: 'getGroupIds',
    value: function getGroupIds() {
      var groupIds = [];

      var groupNodes = this.groupNodes;
      var _iteratorNormalCompletion66 = true;
      var _didIteratorError66 = false;
      var _iteratorError66 = undefined;

      try {
        for (var _iterator66 = groupNodes[Symbol.iterator](), _step66; !(_iteratorNormalCompletion66 = (_step66 = _iterator66.next()).done); _iteratorNormalCompletion66 = true) {
          var group = _step66.value;

          if (group != null) {
            var groupId = group.id;
            if (groupId != null) {
              groupIds.push(groupId);
            }
          }
        }
      } catch (err) {
        _didIteratorError66 = true;
        _iteratorError66 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion66 && _iterator66.return) {
            _iterator66.return();
          }
        } finally {
          if (_didIteratorError66) {
            throw _iteratorError66;
          }
        }
      }

      var inactiveGroupNodes = this.getInactiveGroupNodes();
      var _iteratorNormalCompletion67 = true;
      var _didIteratorError67 = false;
      var _iteratorError67 = undefined;

      try {
        for (var _iterator67 = inactiveGroupNodes[Symbol.iterator](), _step67; !(_iteratorNormalCompletion67 = (_step67 = _iterator67.next()).done); _iteratorNormalCompletion67 = true) {
          var inactiveGroup = _step67.value;

          if (inactiveGroup != null) {
            var inactiveGroupId = inactiveGroup.id;
            if (inactiveGroupId != null) {
              groupIds.push(inactiveGroupId);
            }
          }
        }
      } catch (err) {
        _didIteratorError67 = true;
        _iteratorError67 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion67 && _iterator67.return) {
            _iterator67.return();
          }
        } finally {
          if (_didIteratorError67) {
            throw _iteratorError67;
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

  }, {
    key: 'getNextAvailableNodeId',
    value: function getNextAvailableNodeId(nodeIdsToSkip) {
      var nodeIds = this.getNodeIds();
      var largestNodeIdNumber = null;

      var _iteratorNormalCompletion68 = true;
      var _didIteratorError68 = false;
      var _iteratorError68 = undefined;

      try {
        for (var _iterator68 = nodeIds[Symbol.iterator](), _step68; !(_iteratorNormalCompletion68 = (_step68 = _iterator68.next()).done); _iteratorNormalCompletion68 = true) {
          var nodeId = _step68.value;

          // get the number from the node id e.g. the number of 'node2' would be 2
          var _nodeIdNumber = nodeId.replace('node', '');

          // make sure the number is an actual number
          if (!isNaN(_nodeIdNumber)) {
            _nodeIdNumber = parseInt(_nodeIdNumber);

            // update the largest node id number if necessary
            if (largestNodeIdNumber == null) {
              largestNodeIdNumber = _nodeIdNumber;
            } else if (_nodeIdNumber > largestNodeIdNumber) {
              largestNodeIdNumber = _nodeIdNumber;
            }
          }
        }
      } catch (err) {
        _didIteratorError68 = true;
        _iteratorError68 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion68 && _iterator68.return) {
            _iterator68.return();
          }
        } finally {
          if (_didIteratorError68) {
            throw _iteratorError68;
          }
        }
      }

      var inactiveNodeIds = this.getInactiveNodeIds();
      var _iteratorNormalCompletion69 = true;
      var _didIteratorError69 = false;
      var _iteratorError69 = undefined;

      try {
        for (var _iterator69 = inactiveNodeIds[Symbol.iterator](), _step69; !(_iteratorNormalCompletion69 = (_step69 = _iterator69.next()).done); _iteratorNormalCompletion69 = true) {
          var inactiveNodeId = _step69.value;

          // get the number from the node id e.g. the number of 'node2' would be 2
          var _nodeIdNumber2 = inactiveNodeId.replace('node', '');

          // make sure the number is an actual number
          if (!isNaN(_nodeIdNumber2)) {
            _nodeIdNumber2 = parseInt(_nodeIdNumber2);

            // update the largest node id number if necessary
            if (largestNodeIdNumber == null) {
              largestNodeIdNumber = _nodeIdNumber2;
            } else if (_nodeIdNumber2 > largestNodeIdNumber) {
              largestNodeIdNumber = _nodeIdNumber2;
            }
          }
        }
      } catch (err) {
        _didIteratorError69 = true;
        _iteratorError69 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion69 && _iterator69.return) {
            _iterator69.return();
          }
        } finally {
          if (_didIteratorError69) {
            throw _iteratorError69;
          }
        }
      }

      if (nodeIdsToSkip != null) {
        // there are node ids to skip

        var _iteratorNormalCompletion70 = true;
        var _didIteratorError70 = false;
        var _iteratorError70 = undefined;

        try {
          for (var _iterator70 = nodeIdsToSkip[Symbol.iterator](), _step70; !(_iteratorNormalCompletion70 = (_step70 = _iterator70.next()).done); _iteratorNormalCompletion70 = true) {
            var nodeIdToSkip = _step70.value;

            // get the number from the node id e.g. the number of 'node2' would be 2
            var nodeIdNumber = nodeIdToSkip.replace('node', '');

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
        } catch (err) {
          _didIteratorError70 = true;
          _iteratorError70 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion70 && _iterator70.return) {
              _iterator70.return();
            }
          } finally {
            if (_didIteratorError70) {
              throw _iteratorError70;
            }
          }
        }
      }

      var nextAvailableNodeId = 'node' + (largestNodeIdNumber + 1);
      return nextAvailableNodeId;
    }

    /**
     * Get all the node ids from steps (not groups)
     * @returns an array with all the node ids
     */

  }, {
    key: 'getNodeIds',
    value: function getNodeIds() {
      var nodeIds = [];
      var _iteratorNormalCompletion71 = true;
      var _didIteratorError71 = false;
      var _iteratorError71 = undefined;

      try {
        for (var _iterator71 = this.applicationNodes[Symbol.iterator](), _step71; !(_iteratorNormalCompletion71 = (_step71 = _iterator71.next()).done); _iteratorNormalCompletion71 = true) {
          var node = _step71.value;

          if (node != null) {
            var nodeId = node.id;
            if (nodeId != null) {
              nodeIds.push(nodeId);
            }
          }
        }
      } catch (err) {
        _didIteratorError71 = true;
        _iteratorError71 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion71 && _iterator71.return) {
            _iterator71.return();
          }
        } finally {
          if (_didIteratorError71) {
            throw _iteratorError71;
          }
        }
      }

      return nodeIds;
    }

    /**
     * Get all the node ids from inactive steps
     * @returns an array with all the inactive node ids
     */

  }, {
    key: 'getInactiveNodeIds',
    value: function getInactiveNodeIds() {
      var nodeIds = [];
      var inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        var _iteratorNormalCompletion72 = true;
        var _didIteratorError72 = false;
        var _iteratorError72 = undefined;

        try {
          for (var _iterator72 = inactiveNodes[Symbol.iterator](), _step72; !(_iteratorNormalCompletion72 = (_step72 = _iterator72.next()).done); _iteratorNormalCompletion72 = true) {
            var inactiveNode = _step72.value;

            if (inactiveNode != null) {
              var nodeId = inactiveNode.id;
              if (nodeId != null) {
                nodeIds.push(nodeId);
              }
            }
          }
        } catch (err) {
          _didIteratorError72 = true;
          _iteratorError72 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion72 && _iterator72.return) {
              _iterator72.return();
            }
          } finally {
            if (_didIteratorError72) {
              throw _iteratorError72;
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

  }, {
    key: 'moveNodesInside',
    value: function moveNodesInside(nodeIds, nodeId) {
      var movedNodes = [];

      for (var n = 0; n < nodeIds.length; n++) {
        var tempNodeId = nodeIds[n];
        var tempNode = this.getNodeById(tempNodeId);
        movedNodes.push(tempNode);

        var movingNodeIsActive = this.isActive(tempNodeId);
        var stationaryNodeIsActive = this.isActive(nodeId);

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

  }, {
    key: 'moveNodesAfter',
    value: function moveNodesAfter(nodeIds, nodeId) {
      var movedNodes = [];

      var _iteratorNormalCompletion73 = true;
      var _didIteratorError73 = false;
      var _iteratorError73 = undefined;

      try {
        for (var _iterator73 = nodeIds[Symbol.iterator](), _step73; !(_iteratorNormalCompletion73 = (_step73 = _iterator73.next()).done); _iteratorNormalCompletion73 = true) {
          var tempNodeId = _step73.value;

          var node = this.getNodeById(tempNodeId);
          movedNodes.push(node);

          var movingNodeIsActive = this.isActive(tempNodeId);
          var stationaryNodeIsActive = this.isActive(nodeId);

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
      } catch (err) {
        _didIteratorError73 = true;
        _iteratorError73 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion73 && _iterator73.return) {
            _iterator73.return();
          }
        } finally {
          if (_didIteratorError73) {
            throw _iteratorError73;
          }
        }
      }

      return movedNodes;
    }

    /**
     * Copy the node with the specified nodeId
     * @param nodeId the node id to copy
     * @return copied node
     */

  }, {
    key: 'copyNode',
    value: function copyNode(nodeId) {
      var node = this.getNodeById(nodeId);
      var nodeCopy = this.UtilService.makeCopyOfJSONObject(node);
      nodeCopy.id = this.getNextAvailableNodeId();
      nodeCopy.transitionLogic = {}; // clear transition logic
      nodeCopy.constraints = []; // clear constraints

      var newComponentIds = [];
      var _iteratorNormalCompletion74 = true;
      var _didIteratorError74 = false;
      var _iteratorError74 = undefined;

      try {
        for (var _iterator74 = nodeCopy.components[Symbol.iterator](), _step74; !(_iteratorNormalCompletion74 = (_step74 = _iterator74.next()).done); _iteratorNormalCompletion74 = true) {
          var component = _step74.value;

          var newComponentId = this.getUnusedComponentId(newComponentIds);
          newComponentIds.push(newComponentId);
          component.id = newComponentId;
        }
      } catch (err) {
        _didIteratorError74 = true;
        _iteratorError74 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion74 && _iterator74.return) {
            _iterator74.return();
          }
        } finally {
          if (_didIteratorError74) {
            throw _iteratorError74;
          }
        }
      }

      return nodeCopy;
    }

    /**
     * Delete a node
     * @param nodeId the node id
     */

  }, {
    key: 'deleteNode',
    value: function deleteNode(nodeId) {
      /*
       * flag for whether we are deleting the project start node id.
       * if we are deleting the project start node id, we will need
       * to change it to the next logical node id that will be used
       * as the project start.
       */
      var removingProjectStartNodeId = false;

      if (this.isGroupNode(nodeId)) {
        // the node is a group node so we will also remove all of its children
        var group = this.getNodeById(nodeId);

        // TODO check if the child is in another group, if so do not remove

        if (group != null) {
          var ids = group.ids;
          for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
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

      var parentGroup = this.getParentGroup(nodeId);

      // check if we need to update the start id of the parent group
      if (parentGroup != null) {

        /*
         * the node is the start node of the parent group so we need
         * to update the start id of the parent group to point to
         * the next node
         */
        if (nodeId === parentGroup.startId) {
          var hasSetNewStartId = false;

          var node = this.getNodeById(nodeId);
          if (node != null) {
            var transitionLogic = node.transitionLogic;
            if (transitionLogic != null) {
              var transitions = transitionLogic.transitions;
              if (transitions != null && transitions.length > 0) {
                var transition = transitions[0];
                if (transition != null) {
                  var toNodeId = transition.to;
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
          var _transitions2 = this.getTransitionsByFromNodeId(nodeId);

          if (_transitions2 == null || _transitions2.length == 0) {
            /*
             * the group doesn't have any transitions so we will set
             * the startNodeId to 'group0'
             */
            this.setStartNodeId('group0');
          } else {
            // the group has transitions

            var nextNodeId = null;

            if (_transitions2[0] != null && _transitions2[0].to != null) {
              nextNodeId = _transitions2[0].to;
            }

            if (nextNodeId != null) {
              if (this.isGroupNode(nextNodeId)) {
                var nextGroupNode = this.getNodeById(nextNodeId);

                if (nextGroupNode != null) {
                  var nextGroupStartId = nextGroupNode.startId;

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
          var _transitions3 = this.getTransitionsByFromNodeId(nodeId);
          var parentGroupId = this.getParentGroupId(nodeId);
          if (_transitions3 == null || _transitions3.length == 0) {
            this.setStartNodeId(parentGroupId);
          } else {
            if (_transitions3[0] != null && _transitions3[0].to != null) {
              var _toNodeId3 = _transitions3[0].to;
              if (this.isNodeInGroup(_toNodeId3, parentGroupId)) {
                this.setStartNodeId(_toNodeId3);
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

  }, {
    key: 'removeNodeIdFromTransitions',
    value: function removeNodeIdFromTransitions(nodeId) {
      var nodeToRemove = this.getNodeById(nodeId);
      var nodesByToNodeId = this.getNodesByToNodeId(nodeId);

      var nodeToRemoveTransitionLogic = nodeToRemove.transitionLogic;
      var nodeToRemoveTransitions = [];

      if (nodeToRemoveTransitionLogic != null && nodeToRemoveTransitionLogic.transitions != null) {
        nodeToRemoveTransitions = nodeToRemoveTransitionLogic.transitions;
      }

      var parentIdOfNodeToRemove = this.getParentGroupId(nodeId);
      var parentGroup = this.getNodeById(parentIdOfNodeToRemove);

      // update the start id if we are removing the start node of a group
      if (parentGroup != null) {
        var parentGroupStartId = parentGroup.startId;
        if (parentGroupStartId != null) {
          if (parentGroupStartId === nodeId) {
            // the node we are removing is the start node

            if (nodeToRemoveTransitions != null && nodeToRemoveTransitions.length > 0) {
              var _iteratorNormalCompletion75 = true;
              var _didIteratorError75 = false;
              var _iteratorError75 = undefined;

              try {
                for (var _iterator75 = nodeToRemoveTransitions[Symbol.iterator](), _step75; !(_iteratorNormalCompletion75 = (_step75 = _iterator75.next()).done); _iteratorNormalCompletion75 = true) {
                  var nodeToRemoveTransition = _step75.value;

                  if (nodeToRemoveTransition != null) {
                    var toNodeId = nodeToRemoveTransition.to;
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
              } catch (err) {
                _didIteratorError75 = true;
                _iteratorError75 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion75 && _iterator75.return) {
                    _iterator75.return();
                  }
                } finally {
                  if (_didIteratorError75) {
                    throw _iteratorError75;
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

      for (var n = 0; n < nodesByToNodeId.length; n++) {
        var node = nodesByToNodeId[n];

        if (node != null) {
          var parentIdOfFromNode = this.getParentGroupId(node.id);
          var transitionLogic = node.transitionLogic;

          if (transitionLogic != null) {
            var transitions = transitionLogic.transitions;
            for (var t = 0; t < transitions.length; t++) {
              var transition = transitions[t];
              if (nodeId === transition.to) {
                // we have found the transition to the node we are removing

                // copy the transitions from the node we are removing
                var transitionsCopy = angular.toJson(nodeToRemoveTransitions);
                transitionsCopy = angular.fromJson(transitionsCopy);

                /*
                 * if the parent from group is different than the parent removing group
                 * remove transitions that are to a node in a different group than
                 * the parent removing group
                 */

                if (parentIdOfFromNode != parentIdOfNodeToRemove) {
                  for (var tc = 0; tc < transitionsCopy.length; tc++) {
                    var tempTransition = transitionsCopy[tc];
                    if (tempTransition != null) {
                      var tempToNodeId = tempTransition.to;
                      if (tempToNodeId != null) {
                        var parentIdOfToNode = this.getParentGroupId(tempToNodeId);
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
                  var nodeIdsInBranch = this.getNodeIdsInBranch(node.id, nodeId);

                  if (nodeIdsInBranch != null) {
                    var _iteratorNormalCompletion76 = true;
                    var _didIteratorError76 = false;
                    var _iteratorError76 = undefined;

                    try {
                      for (var _iterator76 = nodeIdsInBranch[Symbol.iterator](), _step76; !(_iteratorNormalCompletion76 = (_step76 = _iterator76.next()).done); _iteratorNormalCompletion76 = true) {
                        var nodeIdInBranch = _step76.value;

                        var nodeInBranch = this.getNodeById(nodeIdInBranch);
                        var _iteratorNormalCompletion77 = true;
                        var _didIteratorError77 = false;
                        var _iteratorError77 = undefined;

                        try {
                          for (var _iterator77 = transitionsCopy[Symbol.iterator](), _step77; !(_iteratorNormalCompletion77 = (_step77 = _iterator77.next()).done); _iteratorNormalCompletion77 = true) {
                            var transitionCopy = _step77.value;

                            if (transitionCopy != null) {
                              var currentFromNodeId = node.id;
                              var currentToNodeId = nodeId;
                              var newFromNodeId = node.id;
                              var newToNodeId = transitionCopy.to;

                              /*
                               * change the branch path taken constraint by changing
                               * the toNodeId
                               */
                              this.updateBranchPathTakenConstraint(nodeInBranch, currentFromNodeId, currentToNodeId, newFromNodeId, newToNodeId);
                            }
                          }
                        } catch (err) {
                          _didIteratorError77 = true;
                          _iteratorError77 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion77 && _iterator77.return) {
                              _iterator77.return();
                            }
                          } finally {
                            if (_didIteratorError77) {
                              throw _iteratorError77;
                            }
                          }
                        }
                      }
                    } catch (err) {
                      _didIteratorError76 = true;
                      _iteratorError76 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion76 && _iterator76.return) {
                          _iterator76.return();
                        }
                      } finally {
                        if (_didIteratorError76) {
                          throw _iteratorError76;
                        }
                      }
                    }
                  }
                } else if (this.isBranchPoint(nodeId)) {
                  /*
                   * get all the branches that have the node we
                   * are removing as the start point
                   */
                  var branches = this.getBranchesByBranchStartPointNodeId(nodeId);

                  var _iteratorNormalCompletion78 = true;
                  var _didIteratorError78 = false;
                  var _iteratorError78 = undefined;

                  try {
                    for (var _iterator78 = branches[Symbol.iterator](), _step78; !(_iteratorNormalCompletion78 = (_step78 = _iterator78.next()).done); _iteratorNormalCompletion78 = true) {
                      var branch = _step78.value;

                      if (branch != null) {
                        /*
                         * get the branch paths. these paths do not
                         * contain the start point or merge point.
                         */
                        var branchPaths = branch.branchPaths;

                        if (branchPaths != null) {
                          var _iteratorNormalCompletion79 = true;
                          var _didIteratorError79 = false;
                          var _iteratorError79 = undefined;

                          try {
                            for (var _iterator79 = branchPaths[Symbol.iterator](), _step79; !(_iteratorNormalCompletion79 = (_step79 = _iterator79.next()).done); _iteratorNormalCompletion79 = true) {
                              var branchPath = _step79.value;

                              if (branchPath != null) {
                                var _currentFromNodeId = nodeId;
                                var _currentToNodeId = branchPath[0];
                                var _newFromNodeId = node.id;
                                var _newToNodeId = branchPath[0];
                                var _iteratorNormalCompletion80 = true;
                                var _didIteratorError80 = false;
                                var _iteratorError80 = undefined;

                                try {
                                  for (var _iterator80 = branchPath[Symbol.iterator](), _step80; !(_iteratorNormalCompletion80 = (_step80 = _iterator80.next()).done); _iteratorNormalCompletion80 = true) {
                                    var branchPathNodeId = _step80.value;

                                    var branchPathNode = this.getNodeById(branchPathNodeId);
                                    this.updateBranchPathTakenConstraint(branchPathNode, _currentFromNodeId, _currentToNodeId, _newFromNodeId, _newToNodeId);
                                  }
                                } catch (err) {
                                  _didIteratorError80 = true;
                                  _iteratorError80 = err;
                                } finally {
                                  try {
                                    if (!_iteratorNormalCompletion80 && _iterator80.return) {
                                      _iterator80.return();
                                    }
                                  } finally {
                                    if (_didIteratorError80) {
                                      throw _iteratorError80;
                                    }
                                  }
                                }
                              }
                            }
                          } catch (err) {
                            _didIteratorError79 = true;
                            _iteratorError79 = err;
                          } finally {
                            try {
                              if (!_iteratorNormalCompletion79 && _iterator79.return) {
                                _iterator79.return();
                              }
                            } finally {
                              if (_didIteratorError79) {
                                throw _iteratorError79;
                              }
                            }
                          }
                        }
                      }
                    }
                  } catch (err) {
                    _didIteratorError78 = true;
                    _iteratorError78 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion78 && _iterator78.return) {
                        _iterator78.return();
                      }
                    } finally {
                      if (_didIteratorError78) {
                        throw _iteratorError78;
                      }
                    }
                  }
                }

                // remove the transition to the node we are removing
                transitions.splice(t, 1);

                if (transitionsCopy != null) {
                  var insertIndex = t;

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
                  var _iteratorNormalCompletion81 = true;
                  var _didIteratorError81 = false;
                  var _iteratorError81 = undefined;

                  try {
                    for (var _iterator81 = transitionsCopy[Symbol.iterator](), _step81; !(_iteratorNormalCompletion81 = (_step81 = _iterator81.next()).done); _iteratorNormalCompletion81 = true) {
                      var _transitionCopy = _step81.value;

                      // insert a transition from the node we are removing
                      transitions.splice(insertIndex, 0, _transitionCopy);
                      insertIndex++;
                    }
                  } catch (err) {
                    _didIteratorError81 = true;
                    _iteratorError81 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion81 && _iterator81.return) {
                        _iterator81.return();
                      }
                    } finally {
                      if (_didIteratorError81) {
                        throw _iteratorError81;
                      }
                    }
                  }
                }

                // check if the node we are moving is a group
                if (this.isGroupNode(nodeId)) {
                  /*
                   * we are moving a group so we need to update transitions that
                   * go into the group
                   */
                  var groupIdWeAreMoving = nodeId;
                  var groupThatTransitionsToGroupWeAreMoving = node;
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
    }
  }, {
    key: 'removeNodeIdFromGroups',


    /**
     * Remove the node id from a group
     * @param nodeId the node id to remove
     */
    value: function removeNodeIdFromGroups(nodeId) {
      var groups = this.getGroupNodes();
      var _iteratorNormalCompletion82 = true;
      var _didIteratorError82 = false;
      var _iteratorError82 = undefined;

      try {
        for (var _iterator82 = groups[Symbol.iterator](), _step82; !(_iteratorNormalCompletion82 = (_step82 = _iterator82.next()).done); _iteratorNormalCompletion82 = true) {
          var group = _step82.value;

          this.removeNodeIdFromGroup(group, nodeId);
        }
      } catch (err) {
        _didIteratorError82 = true;
        _iteratorError82 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion82 && _iterator82.return) {
            _iterator82.return();
          }
        } finally {
          if (_didIteratorError82) {
            throw _iteratorError82;
          }
        }
      }

      var inactiveGroups = this.getInactiveGroupNodes();
      var _iteratorNormalCompletion83 = true;
      var _didIteratorError83 = false;
      var _iteratorError83 = undefined;

      try {
        for (var _iterator83 = inactiveGroups[Symbol.iterator](), _step83; !(_iteratorNormalCompletion83 = (_step83 = _iterator83.next()).done); _iteratorNormalCompletion83 = true) {
          var inactiveGroup = _step83.value;

          this.removeNodeIdFromGroup(inactiveGroup, nodeId);
        }
      } catch (err) {
        _didIteratorError83 = true;
        _iteratorError83 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion83 && _iterator83.return) {
            _iterator83.return();
          }
        } finally {
          if (_didIteratorError83) {
            throw _iteratorError83;
          }
        }
      }
    }

    /**
     * Remove a node id from a group.
     * @param group The group to remove from.
     * @param nodeId The node id to remove.
     */

  }, {
    key: 'removeNodeIdFromGroup',
    value: function removeNodeIdFromGroup(group, nodeId) {
      var startId = group.startId;
      var ids = group.ids;
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (nodeId === id) {
          ids.splice(i, 1);

          if (nodeId === startId) {
            /*
             * the node id is also the start id so we will get the
             * next node id and set it as the new start id
             */

            var hasSetNewStartId = false;

            var node = this.getNodeById(id);

            if (node != null) {
              var transitionLogic = node.transitionLogic;
              if (transitionLogic != null) {
                var transitions = transitionLogic.transitions;
                if (transitions != null && transitions.length > 0) {
                  // get the first transition
                  // TODO handle the case when the node we are removing is a branch point
                  var transition = transitions[0];

                  if (transition != null) {
                    var to = transition.to;

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

  }, {
    key: 'removeNodeIdFromNodes',
    value: function removeNodeIdFromNodes(nodeId) {
      var nodes = this.project.nodes;
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        if (node != null) {
          if (nodeId === node.id) {
            nodes.splice(n, 1);
          }
        }
      }

      var inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        for (var i = 0; i < inactiveNodes.length; i++) {
          var inactiveNode = inactiveNodes[i];
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

  }, {
    key: 'removeNodeIdFromInactiveNodes',
    value: function removeNodeIdFromInactiveNodes(nodeId) {
      var inactiveNodes = this.project.inactiveNodes;

      if (inactiveNodes != null) {
        for (var i = 0; i < inactiveNodes.length; i++) {
          var inactiveNode = inactiveNodes[i];
          if (inactiveNode != null) {
            var inactiveNodeId = inactiveNode.id;
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

  }, {
    key: 'createComponent',
    value: function createComponent(nodeId, componentType, insertAfterComponentId) {
      var component = null;
      if (nodeId != null && componentType != null) {
        // get the node we will create the component in
        var node = this.getNodeById(nodeId);

        // get the service for the component type
        var service = this.$injector.get(componentType + 'Service');

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

  }, {
    key: 'doesAnyComponentHaveWork',
    value: function doesAnyComponentHaveWork(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion84 = true;
          var _didIteratorError84 = false;
          var _iteratorError84 = undefined;

          try {
            for (var _iterator84 = components[Symbol.iterator](), _step84; !(_iteratorNormalCompletion84 = (_step84 = _iterator84.next()).done); _iteratorNormalCompletion84 = true) {
              var component = _step84.value;

              if (component != null) {
                var componentType = component.type;
                var service = this.$injector.get(componentType + 'Service');
                if (service != null) {
                  if (service.componentHasWork()) {
                    return true;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError84 = true;
            _iteratorError84 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion84 && _iterator84.return) {
                _iterator84.return();
              }
            } finally {
              if (_didIteratorError84) {
                throw _iteratorError84;
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

  }, {
    key: 'doesAnyComponentShowSaveButton',
    value: function doesAnyComponentShowSaveButton(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion85 = true;
          var _didIteratorError85 = false;
          var _iteratorError85 = undefined;

          try {
            for (var _iterator85 = components[Symbol.iterator](), _step85; !(_iteratorNormalCompletion85 = (_step85 = _iterator85.next()).done); _iteratorNormalCompletion85 = true) {
              var component = _step85.value;

              if (component != null) {
                if (component.showSaveButton == true) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError85 = true;
            _iteratorError85 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion85 && _iterator85.return) {
                _iterator85.return();
              }
            } finally {
              if (_didIteratorError85) {
                throw _iteratorError85;
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

  }, {
    key: 'doesAnyComponentShowSubmitButton',
    value: function doesAnyComponentShowSubmitButton(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion86 = true;
          var _didIteratorError86 = false;
          var _iteratorError86 = undefined;

          try {
            for (var _iterator86 = components[Symbol.iterator](), _step86; !(_iteratorNormalCompletion86 = (_step86 = _iterator86.next()).done); _iteratorNormalCompletion86 = true) {
              var component = _step86.value;

              if (component != null) {
                if (component.showSubmitButton == true) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError86 = true;
            _iteratorError86 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion86 && _iterator86.return) {
                _iterator86.return();
              }
            } finally {
              if (_didIteratorError86) {
                throw _iteratorError86;
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

  }, {
    key: 'turnOnSaveButtonInComponents',
    value: function turnOnSaveButtonInComponents(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion87 = true;
          var _didIteratorError87 = false;
          var _iteratorError87 = undefined;

          try {
            for (var _iterator87 = components[Symbol.iterator](), _step87; !(_iteratorNormalCompletion87 = (_step87 = _iterator87.next()).done); _iteratorNormalCompletion87 = true) {
              var component = _step87.value;

              if (component != null) {
                var componentType = component.type;
                if (componentType != null) {
                  var service = this.$injector.get(componentType + 'Service');
                  if (service != null) {
                    if (service.componentUsesSaveButton()) {
                      component.showSaveButton = true;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError87 = true;
            _iteratorError87 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion87 && _iterator87.return) {
                _iterator87.return();
              }
            } finally {
              if (_didIteratorError87) {
                throw _iteratorError87;
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

  }, {
    key: 'turnOffSaveButtonInComponents',
    value: function turnOffSaveButtonInComponents(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion88 = true;
          var _didIteratorError88 = false;
          var _iteratorError88 = undefined;

          try {
            for (var _iterator88 = components[Symbol.iterator](), _step88; !(_iteratorNormalCompletion88 = (_step88 = _iterator88.next()).done); _iteratorNormalCompletion88 = true) {
              var component = _step88.value;

              if (component != null) {
                var componentType = component.type;
                if (componentType != null) {
                  var service = this.$injector.get(componentType + 'Service');
                  if (service != null) {
                    if (service.componentUsesSaveButton()) {
                      component.showSaveButton = false;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError88 = true;
            _iteratorError88 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion88 && _iterator88.return) {
                _iterator88.return();
              }
            } finally {
              if (_didIteratorError88) {
                throw _iteratorError88;
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

  }, {
    key: 'addComponentToNode',
    value: function addComponentToNode(node, component, insertAfterComponentId) {
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
          var added = false;

          var components = node.components;
          for (var c = 0; c < components.length; c++) {
            var tempComponent = components[c];
            if (tempComponent != null && tempComponent.id != null && tempComponent.id == insertAfterComponentId) {
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

  }, {
    key: 'moveComponent',
    value: function moveComponent(nodeId, componentIds, insertAfterComponentId) {
      // get the node for which we are moving components
      var node = this.getNodeById(nodeId);

      var components = node.components;
      var componentsToMove = [];

      // remove the component(s)
      for (var a = components.length - 1; a >= 0; a--) {
        var tempComponent = components[a];
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

        for (var c = 0; c < componentsToMove.length; c++) {
          // insert a component
          components.splice(c, 0, componentsToMove[c]);
        }
      } else {
        // insert the component(s) after the given insertAfterComponentId

        for (var b = 0; b < components.length; b++) {
          var _tempComponent = components[b];
          if (_tempComponent != null && _tempComponent.id == insertAfterComponentId) {
            // we have found the component we want to add after

            for (var _c = 0; _c < componentsToMove.length; _c++) {
              // insert a component
              components.splice(b + 1 + _c, 0, componentsToMove[_c]);
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

  }, {
    key: 'deleteComponent',
    value: function deleteComponent(nodeId, componentId) {
      if (nodeId != null && componentId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          var components = node.components;
          if (components != null) {
            for (var c = 0; c < components.length; c++) {
              var component = components[c];
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

  }, {
    key: 'getMaxScore',
    value: function getMaxScore() {
      var maxScore = null;
      var startNodeId = this.getStartNodeId();

      // get all the paths in the project
      var allPaths = this.getAllPaths([], startNodeId);

      if (allPaths != null && allPaths.length > 0) {
        var firstPath = allPaths[0];
        var _iteratorNormalCompletion89 = true;
        var _didIteratorError89 = false;
        var _iteratorError89 = undefined;

        try {
          for (var _iterator89 = firstPath[Symbol.iterator](), _step89; !(_iteratorNormalCompletion89 = (_step89 = _iterator89.next()).done); _iteratorNormalCompletion89 = true) {
            var nodeId = _step89.value;

            var nodeMaxScore = this.getMaxScoreForNode(nodeId);
            if (nodeMaxScore != null) {
              if (maxScore == null) {
                maxScore = nodeMaxScore;
              } else {
                maxScore += nodeMaxScore;
              }
            }
          }
        } catch (err) {
          _didIteratorError89 = true;
          _iteratorError89 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion89 && _iterator89.return) {
              _iterator89.return();
            }
          } finally {
            if (_didIteratorError89) {
              throw _iteratorError89;
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

  }, {
    key: 'getMaxScoreForNode',
    value: function getMaxScoreForNode(nodeId) {
      var maxScore = null;
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var components = node.components;
        if (components != null) {
          var _iteratorNormalCompletion90 = true;
          var _didIteratorError90 = false;
          var _iteratorError90 = undefined;

          try {
            for (var _iterator90 = components[Symbol.iterator](), _step90; !(_iteratorNormalCompletion90 = (_step90 = _iterator90.next()).done); _iteratorNormalCompletion90 = true) {
              var component = _step90.value;

              if (component != null) {
                var componentMaxScore = component.maxScore;

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
          } catch (err) {
            _didIteratorError90 = true;
            _iteratorError90 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion90 && _iterator90.return) {
                _iterator90.return();
              }
            } finally {
              if (_didIteratorError90) {
                throw _iteratorError90;
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

  }, {
    key: 'getMaxScoreForComponent',
    value: function getMaxScoreForComponent(nodeId, componentId) {
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

  }, {
    key: 'setMaxScoreForComponent',
    value: function setMaxScoreForComponent(nodeId, componentId, maxScore) {
      if (nodeId != null && componentId != null && maxScore != null && typeof maxScore === 'number') {
        var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

  }, {
    key: 'isNodeInGroup',
    value: function isNodeInGroup(nodeId, groupId) {
      var group = this.getNodeById(groupId);
      var childIds = group.ids;
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

  }, {
    key: 'getFirstLeafNodeId',
    value: function getFirstLeafNodeId() {
      var firstLeafNodeId = null;
      var startGroupId = this.project.startGroupId;
      var node = this.getNodeById(startGroupId);
      var done = false;

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

  }, {
    key: 'replaceNode',
    value: function replaceNode(nodeId, node) {
      if (nodeId != null && node != null) {
        this.setIdToNode(nodeId, node);
        this.setIdToElement(nodeId, node);
        var nodes = this.getNodes();
        if (nodes != null) {
          for (var n = 0; n < nodes.length; n++) {
            var tempNode = nodes[n];
            if (tempNode != null) {
              var tempNodeId = tempNode.id;
              if (nodeId === tempNodeId) {
                nodes.splice(n, 1, node);
                break;
              }
            }
          }
        }

        var applicationNodes = this.applicationNodes;
        if (applicationNodes != null) {
          for (var a = 0; a < applicationNodes.length; a++) {
            var tempApplicationNode = applicationNodes[a];
            if (tempApplicationNode != null) {
              var tempApplicationNodeId = tempApplicationNode.id;
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

  }, {
    key: 'isPlanning',
    value: function isPlanning(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
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

  }, {
    key: 'isPlanningInstance',
    value: function isPlanningInstance(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
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

  }, {
    key: 'getAvailablePlanningNodeIds',
    value: function getAvailablePlanningNodeIds(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
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

  }, {
    key: 'getAvailablePlanningNodes',
    value: function getAvailablePlanningNodes(nodeId) {
      var availablePlanningNodesSoFar = [];
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null && node.availablePlanningNodes != null) {
          var availablePlanningNodes = node.availablePlanningNodes;
          var _iteratorNormalCompletion91 = true;
          var _didIteratorError91 = false;
          var _iteratorError91 = undefined;

          try {
            for (var _iterator91 = availablePlanningNodes[Symbol.iterator](), _step91; !(_iteratorNormalCompletion91 = (_step91 = _iterator91.next()).done); _iteratorNormalCompletion91 = true) {
              var availablePlanningNode = _step91.value;

              if (availablePlanningNode != null) {
                var availablePlanningNodeActual = this.getNodeById(availablePlanningNode.nodeId);
                if (availablePlanningNodeActual != null) {
                  if (availablePlanningNode.max != null) {
                    availablePlanningNodeActual.max = availablePlanningNode.max;
                  }
                  availablePlanningNodesSoFar.push(availablePlanningNodeActual);
                }
              }
            }
          } catch (err) {
            _didIteratorError91 = true;
            _iteratorError91 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion91 && _iterator91.return) {
                _iterator91.return();
              }
            } finally {
              if (_didIteratorError91) {
                throw _iteratorError91;
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

  }, {
    key: 'createPlanningNodeInstance',
    value: function createPlanningNodeInstance(groupId, nodeId, nextAvailablePlanningNodeId) {
      var planningNodeInstance = null;
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

  }, {
    key: 'addPlanningNodeInstanceInside',
    value: function addPlanningNodeInstanceInside(nodeIdToInsertInside, planningNodeInstance) {
      var planningNodeInstanceNodeId = planningNodeInstance.id;

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

  }, {
    key: 'addPlanningNodeInstanceAfter',
    value: function addPlanningNodeInstanceAfter(nodeIdToInsertAfter, planningNodeInstance) {
      var planningNodeInstanceNodeId = planningNodeInstance.id;

      // add an entry in our mapping data structures of node id to object
      this.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
      this.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);

      // add the node to the nodes array in the project
      this.addNode(planningNodeInstance);

      // update the transitions
      this.insertNodeAfterInTransitions(planningNodeInstance, nodeIdToInsertAfter);

      // update the child ids of the group
      this.insertNodeAfterInGroups(planningNodeInstanceNodeId, nodeIdToInsertAfter);

      var parentGroup = this.getParentGroup(nodeIdToInsertAfter);

      if (parentGroup != null) {
        var parentGroupId = parentGroup.id;

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

  }, {
    key: 'movePlanningNodeInstanceInside',
    value: function movePlanningNodeInstanceInside(nodeIdToMove, nodeIdToInsertInside) {
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

  }, {
    key: 'movePlanningNodeInstanceAfter',
    value: function movePlanningNodeInstanceAfter(nodeIdToMove, nodeIdToInsertAfter) {
      this.moveNodesAfter([nodeIdToMove], nodeIdToInsertAfter);
      var parentGroup = this.getParentGroup(nodeIdToInsertAfter);

      if (parentGroup != null) {
        var parentGroupId = parentGroup.id;
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

  }, {
    key: 'recalculatePositionsInGroup',
    value: function recalculatePositionsInGroup(groupId) {
      if (groupId != null) {
        var childIds = this.getChildNodeIdsById(groupId);
        var _iteratorNormalCompletion92 = true;
        var _didIteratorError92 = false;
        var _iteratorError92 = undefined;

        try {
          for (var _iterator92 = childIds[Symbol.iterator](), _step92; !(_iteratorNormalCompletion92 = (_step92 = _iterator92.next()).done); _iteratorNormalCompletion92 = true) {
            var childId = _step92.value;

            var pos = this.getPositionById(childId);
            this.setIdToPosition(childId, pos);
          }
        } catch (err) {
          _didIteratorError92 = true;
          _iteratorError92 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion92 && _iterator92.return) {
              _iterator92.return();
            }
          } finally {
            if (_didIteratorError92) {
              throw _iteratorError92;
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

  }, {
    key: 'getConstraintMessage',
    value: function getConstraintMessage(nodeId, constraint) {
      var message = '';

      if (nodeId != null && constraint != null) {
        // get the node title the student is trying to go to
        var nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);

        var removalConditional = constraint.removalConditional;
        var removalCriteria = constraint.removalCriteria;

        if (removalCriteria != null) {
          var criteriaMessages = '';
          var _iteratorNormalCompletion93 = true;
          var _didIteratorError93 = false;
          var _iteratorError93 = undefined;

          try {
            for (var _iterator93 = removalCriteria[Symbol.iterator](), _step93; !(_iteratorNormalCompletion93 = (_step93 = _iterator93.next()).done); _iteratorNormalCompletion93 = true) {
              var tempRemovalCriteria = _step93.value;

              if (tempRemovalCriteria != null) {
                // get the message that describes the criteria that needs to be satisfied
                var criteriaMessage = this.getCriteriaMessage(tempRemovalCriteria);

                if (criteriaMessage != null && criteriaMessage != '') {
                  // separate criteria messages with a line break
                  if (criteriaMessages != '') {
                    criteriaMessages += '<br/>';
                  }
                  criteriaMessages += criteriaMessage;
                }
              }
            }
          } catch (err) {
            _didIteratorError93 = true;
            _iteratorError93 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion93 && _iterator93.return) {
                _iterator93.return();
              }
            } finally {
              if (_didIteratorError93) {
                throw _iteratorError93;
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

  }, {
    key: 'getConstraintDescription',
    value: function getConstraintDescription(constraint) {
      var message = '';
      var action = constraint.action;
      var actionMessage = this.getActionMessage(action);
      var _iteratorNormalCompletion94 = true;
      var _didIteratorError94 = false;
      var _iteratorError94 = undefined;

      try {
        for (var _iterator94 = constraint.removalCriteria[Symbol.iterator](), _step94; !(_iteratorNormalCompletion94 = (_step94 = _iterator94.next()).done); _iteratorNormalCompletion94 = true) {
          var singleRemovalCriteria = _step94.value;

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
      } catch (err) {
        _didIteratorError94 = true;
        _iteratorError94 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion94 && _iterator94.return) {
            _iterator94.return();
          }
        } finally {
          if (_didIteratorError94) {
            throw _iteratorError94;
          }
        }
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

  }, {
    key: 'getActionMessage',
    value: function getActionMessage(action) {
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

  }, {
    key: 'getCriteriaMessage',
    value: function getCriteriaMessage(criteria) {
      var message = '';

      if (criteria != null) {
        var name = criteria.name;
        var params = criteria.params;

        if (name === 'isCompleted') {
          var nodeId = params.nodeId;
          if (nodeId != null) {
            var nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
            message += this.$translate('completeNodeTitle', { nodeTitle: nodeTitle });
          }
        } else if (name === 'isVisited') {
          var _nodeId = params.nodeId;
          if (_nodeId != null) {
            var _nodeTitle = this.getNodePositionAndTitleByNodeId(_nodeId);
            message += this.$translate('visitNodeTitle', { nodeTitle: _nodeTitle });
          }
        } else if (name === 'isCorrect') {
          var _nodeId2 = params.nodeId;
          if (_nodeId2 != null) {
            var _nodeTitle2 = this.getNodePositionAndTitleByNodeId(_nodeId2);
            message += this.$translate('correctlyAnswerNodeTitle', { nodeTitle: _nodeTitle2 });
          }
        } else if (name === 'score') {
          var _nodeId3 = params.nodeId;
          var _nodeTitle3 = '';
          var scoresString = '';

          if (_nodeId3 != null) {
            _nodeTitle3 = this.getNodePositionAndTitleByNodeId(_nodeId3);
          }

          var scores = params.scores;
          if (scores != null) {
            // get the required score
            scoresString = scores.join(', ');
          }

          // generate the message
          message += this.$translate('obtainAScoreOfXOnNodeTitle', { score: scoresString, nodeTitle: _nodeTitle3 });
        } else if (name === 'choiceChosen') {
          var _nodeId4 = params.nodeId;
          var componentId = params.componentId;
          var choiceIds = params.choiceIds;
          var _nodeTitle4 = this.getNodePositionAndTitleByNodeId(_nodeId4);
          var choices = this.getChoiceTextByNodeIdAndComponentId(_nodeId4, componentId, choiceIds);
          var choiceText = choices.join(', ');
          message += this.$translate('chooseChoiceOnNodeTitle', { choiceText: choiceText, nodeTitle: _nodeTitle4 });
        } else if (name === 'usedXSubmits') {
          var _nodeId5 = params.nodeId;
          var _nodeTitle5 = '';

          // get the number of times the student must submit
          var requiredSubmitCount = params.requiredSubmitCount;

          if (_nodeId5 != null) {
            // get the step number and title
            _nodeTitle5 = this.getNodePositionAndTitleByNodeId(_nodeId5);
          }

          // generate the message
          if (requiredSubmitCount == 1) {
            message += this.$translate('submitXTimeOnNodeTitle', { requiredSubmitCount: requiredSubmitCount, nodeTitle: _nodeTitle5 });
          } else {
            message += this.$translate('submitXTimesOnNodeTitle', { requiredSubmitCount: requiredSubmitCount, nodeTitle: _nodeTitle5 });
          }
        } else if (name === 'branchPathTaken') {
          var fromNodeId = params.fromNodeId;
          var fromNodeTitle = this.getNodePositionAndTitleByNodeId(fromNodeId);
          var toNodeId = params.toNodeId;
          var toNodeTitle = this.getNodePositionAndTitleByNodeId(toNodeId);
          message += this.$translate('branchPathTakenFromTo', { fromNodeTitle: fromNodeTitle, toNodeTitle: toNodeTitle });
        } else if (name === 'isPlanningActivityCompleted') {
          var _nodeId6 = params.nodeId;
          if (_nodeId6 != null) {
            var _nodeTitle6 = this.getNodePositionAndTitleByNodeId(_nodeId6);
            message += this.$translate('completeNodeTitle', { nodeTitle: _nodeTitle6 });
          }
        } else if (name === 'wroteXNumberOfWords') {
          var _nodeId7 = params.nodeId;
          if (_nodeId7 != null) {
            var requiredNumberOfWords = params.requiredNumberOfWords;
            var _nodeTitle7 = this.getNodePositionAndTitleByNodeId(_nodeId7);
            message += this.$translate('writeXNumberOfWordsOnNodeTitle', { requiredNumberOfWords: requiredNumberOfWords, nodeTitle: _nodeTitle7 });
          }
        } else if (name === 'isVisible') {
          var _nodeId8 = params.nodeId;
          if (_nodeId8 != null) {
            var _nodeTitle8 = this.getNodePositionAndTitleByNodeId(_nodeId8);
            message += this.$translate('nodeTitleIsVisible', { nodeTitle: _nodeTitle8 });
          }
        } else if (name === 'isVisitable') {
          var _nodeId9 = params.nodeId;
          if (_nodeId9 != null) {
            var _nodeTitle9 = this.getNodePositionAndTitleByNodeId(_nodeId9);
            message += this.$translate('nodeTitleIsVisitable', { nodeTitle: _nodeTitle9 });
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

  }, {
    key: 'getChoicesByNodeIdAndComponentId',
    value: function getChoicesByNodeIdAndComponentId(nodeId, componentId) {
      var choices = [];
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
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

  }, {
    key: 'getChoiceTextByNodeIdAndComponentId',
    value: function getChoiceTextByNodeIdAndComponentId(nodeId, componentId, choiceIds) {
      var choices = this.getChoicesByNodeIdAndComponentId(nodeId, componentId);
      var choicesText = [];
      var _iteratorNormalCompletion95 = true;
      var _didIteratorError95 = false;
      var _iteratorError95 = undefined;

      try {
        for (var _iterator95 = choices[Symbol.iterator](), _step95; !(_iteratorNormalCompletion95 = (_step95 = _iterator95.next()).done); _iteratorNormalCompletion95 = true) {
          var choice = _step95.value;

          if (choiceIds.indexOf(choice.id) != -1) {
            choicesText.push(choice.text);
          }
        }
      } catch (err) {
        _didIteratorError95 = true;
        _iteratorError95 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion95 && _iterator95.return) {
            _iterator95.return();
          }
        } finally {
          if (_didIteratorError95) {
            throw _iteratorError95;
          }
        }
      }

      return choicesText;
    }

    /**
     * Get the start id of a group
     * @param nodeId get the start id of this group
     * @returns the start id of the group
     */

  }, {
    key: 'getGroupStartId',
    value: function getGroupStartId(nodeId) {
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);

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

  }, {
    key: 'getParentGroupStartId',
    value: function getParentGroupStartId(nodeId) {
      if (nodeId != null) {
        var parentGroup = this.getParentGroup(nodeId);
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

  }, {
    key: 'updateTransitionsForExtractingGroup',
    value: function updateTransitionsForExtractingGroup(fromGroupId, oldToGroupId, newToGroupId) {
      /*
       * make the transitions
       * fromGroup -> newToGroup
       */
      if (fromGroupId != null && oldToGroupId != null) {
        var fromGroup = this.getNodeById(fromGroupId);
        var oldToGroup = this.getNodeById(oldToGroupId);
        var newToGroup = null;
        var newToGroupStartId = null;

        if (newToGroupId != null) {
          newToGroup = this.getNodeById(newToGroupId);
        }

        if (newToGroup != null) {
          newToGroupStartId = newToGroup.startId;
        }

        if (fromGroup != null && oldToGroup != null) {
          var childIds = fromGroup.ids;

          // update the children of the from group to point to the new to group
          if (childIds != null) {
            var _iteratorNormalCompletion96 = true;
            var _didIteratorError96 = false;
            var _iteratorError96 = undefined;

            try {
              for (var _iterator96 = childIds[Symbol.iterator](), _step96; !(_iteratorNormalCompletion96 = (_step96 = _iterator96.next()).done); _iteratorNormalCompletion96 = true) {
                var childId = _step96.value;

                var child = this.getNodeById(childId);
                var transitions = this.getTransitionsByFromNodeId(childId);

                if (transitions != null) {
                  for (var t = 0; t < transitions.length; t++) {
                    var transition = transitions[t];
                    if (transition != null) {
                      var toNodeId = transition.to;
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
            } catch (err) {
              _didIteratorError96 = true;
              _iteratorError96 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion96 && _iterator96.return) {
                  _iterator96.return();
                }
              } finally {
                if (_didIteratorError96) {
                  throw _iteratorError96;
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
        var _oldToGroup = this.getNodeById(oldToGroupId);
        if (_oldToGroup != null) {
          var _childIds = _oldToGroup.ids;

          // remove the transitions from the old to group that point to the new to group
          if (_childIds != null) {
            var _iteratorNormalCompletion97 = true;
            var _didIteratorError97 = false;
            var _iteratorError97 = undefined;

            try {
              for (var _iterator97 = _childIds[Symbol.iterator](), _step97; !(_iteratorNormalCompletion97 = (_step97 = _iterator97.next()).done); _iteratorNormalCompletion97 = true) {
                var _childId = _step97.value;

                var _child2 = this.getNodeById(_childId);
                var _transitions4 = this.getTransitionsByFromNodeId(_childId);
                if (_transitions4 != null) {
                  for (var _t = 0; _t < _transitions4.length; _t++) {
                    var _transition2 = _transitions4[_t];
                    if (_transition2 != null) {
                      var _toNodeId4 = _transition2.to;
                      if (_toNodeId4 === newToGroupId) {
                        // the transition is to the group so we will remove it
                        _transitions4.splice(_t, 1);
                        _t--;
                      } else if (this.isNodeInGroup(_toNodeId4, newToGroupId)) {
                        // the transition is to a node in the group so we will remove it
                        _transitions4.splice(_t, 1);
                        _t--;
                      }
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError97 = true;
              _iteratorError97 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion97 && _iterator97.return) {
                  _iterator97.return();
                }
              } finally {
                if (_didIteratorError97) {
                  throw _iteratorError97;
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

  }, {
    key: 'updateTransitionsForInsertingGroup',
    value: function updateTransitionsForInsertingGroup(fromGroupId, oldToGroupIds, newToGroupId) {
      var fromGroup = null;
      var newToGroup = null;
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
        var childIds = fromGroup.ids;
        var newToGroupStartId = newToGroup.startId;
        if (childIds != null) {
          var _iteratorNormalCompletion98 = true;
          var _didIteratorError98 = false;
          var _iteratorError98 = undefined;

          try {
            for (var _iterator98 = childIds[Symbol.iterator](), _step98; !(_iteratorNormalCompletion98 = (_step98 = _iterator98.next()).done); _iteratorNormalCompletion98 = true) {
              var childId = _step98.value;

              var child = this.getNodeById(childId);

              // get the transitions from the child
              var transitions = this.getTransitionsByFromNodeId(childId);

              if (transitions == null || transitions.length == 0) {
                /*
                 * the child does not have any transitions so we will make it
                 * point to the new group
                 */
                if (newToGroupStartId == null || newToGroupStartId == '') {
                  this.addToTransition(child, newToGroupId);
                } else {
                  this.addToTransition(child, newToGroupStartId);
                }
              } else if (transitions != null) {
                var _iteratorNormalCompletion99 = true;
                var _didIteratorError99 = false;
                var _iteratorError99 = undefined;

                try {
                  for (var _iterator99 = transitions[Symbol.iterator](), _step99; !(_iteratorNormalCompletion99 = (_step99 = _iterator99.next()).done); _iteratorNormalCompletion99 = true) {
                    var transition = _step99.value;

                    if (transition != null) {
                      var toNodeId = transition.to;
                      if (oldToGroupIds != null) {
                        var _iteratorNormalCompletion100 = true;
                        var _didIteratorError100 = false;
                        var _iteratorError100 = undefined;

                        try {
                          for (var _iterator100 = oldToGroupIds[Symbol.iterator](), _step100; !(_iteratorNormalCompletion100 = (_step100 = _iterator100.next()).done); _iteratorNormalCompletion100 = true) {
                            var oldToGroupId = _step100.value;

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
                        } catch (err) {
                          _didIteratorError100 = true;
                          _iteratorError100 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion100 && _iterator100.return) {
                              _iterator100.return();
                            }
                          } finally {
                            if (_didIteratorError100) {
                              throw _iteratorError100;
                            }
                          }
                        }
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError99 = true;
                  _iteratorError99 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion99 && _iterator99.return) {
                      _iterator99.return();
                    }
                  } finally {
                    if (_didIteratorError99) {
                      throw _iteratorError99;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError98 = true;
            _iteratorError98 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion98 && _iterator98.return) {
                _iterator98.return();
              }
            } finally {
              if (_didIteratorError98) {
                throw _iteratorError98;
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
        var _childIds2 = newToGroup.ids;
        if (_childIds2 != null) {
          var _iteratorNormalCompletion101 = true;
          var _didIteratorError101 = false;
          var _iteratorError101 = undefined;

          try {
            for (var _iterator101 = _childIds2[Symbol.iterator](), _step101; !(_iteratorNormalCompletion101 = (_step101 = _iterator101.next()).done); _iteratorNormalCompletion101 = true) {
              var _childId2 = _step101.value;

              var _child3 = this.getNodeById(_childId2);
              var _transitions5 = this.getTransitionsByFromNodeId(_childId2);

              if (_transitions5 == null || _transitions5.length == 0) {
                if (oldToGroupIds != null) {
                  var _iteratorNormalCompletion102 = true;
                  var _didIteratorError102 = false;
                  var _iteratorError102 = undefined;

                  try {
                    for (var _iterator102 = oldToGroupIds[Symbol.iterator](), _step102; !(_iteratorNormalCompletion102 = (_step102 = _iterator102.next()).done); _iteratorNormalCompletion102 = true) {
                      var _oldToGroupId = _step102.value;

                      var oldToGroup = this.getNodeById(_oldToGroupId);
                      if (oldToGroup != null) {
                        var oldToGroupStartId = oldToGroup.startId;
                        var _transition3 = {};
                        var _toNodeId5 = '';
                        if (oldToGroupStartId == null) {
                          // there is no start node id so we will just point to the group
                          _toNodeId5 = oldToGroup;
                        } else {
                          // there is a start node id so we will point to it
                          _toNodeId5 = oldToGroupStartId;
                        }

                        // create the transition from the child to the old group
                        this.addToTransition(_child3, _toNodeId5);
                      }
                    }
                  } catch (err) {
                    _didIteratorError102 = true;
                    _iteratorError102 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion102 && _iterator102.return) {
                        _iterator102.return();
                      }
                    } finally {
                      if (_didIteratorError102) {
                        throw _iteratorError102;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError101 = true;
            _iteratorError101 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion101 && _iterator101.return) {
                _iterator101.return();
              }
            } finally {
              if (_didIteratorError101) {
                throw _iteratorError101;
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

  }, {
    key: 'updateChildrenTransitionsForMovingGroup',
    value: function updateChildrenTransitionsForMovingGroup(node, nodeId) {
      var transitionsBefore = null;

      // get the group nodes that point to the group we are moving
      var previousGroupNodes = this.getGroupNodesByToNodeId(node.id);

      // get all the transitions from the group we are moving
      var transitionsAfter = this.getTransitionsByFromNodeId(node.id);

      var extracted = false;

      /*
       * extract the group we are moving by updating the transitions of the
       * from group and the new to group. also remove the transitions from the
       * group we are moving.
       */

      var _iteratorNormalCompletion103 = true;
      var _didIteratorError103 = false;
      var _iteratorError103 = undefined;

      try {
        for (var _iterator103 = previousGroupNodes[Symbol.iterator](), _step103; !(_iteratorNormalCompletion103 = (_step103 = _iterator103.next()).done); _iteratorNormalCompletion103 = true) {
          var previousGroupNode = _step103.value;

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
            var _iteratorNormalCompletion106 = true;
            var _didIteratorError106 = false;
            var _iteratorError106 = undefined;

            try {
              for (var _iterator106 = transitionsAfter[Symbol.iterator](), _step106; !(_iteratorNormalCompletion106 = (_step106 = _iterator106.next()).done); _iteratorNormalCompletion106 = true) {
                var _transitionAfter2 = _step106.value;

                if (_transitionAfter2 != null) {
                  var _toNodeId7 = _transitionAfter2.to;

                  /*
                   * remove the transitions to the group we are moving and make
                   * new transitions from the from group to the new to group
                   */
                  this.updateTransitionsForExtractingGroup(previousGroupNode.id, node.id, _toNodeId7);
                  extracted = true;
                }
              }
            } catch (err) {
              _didIteratorError106 = true;
              _iteratorError106 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion106 && _iterator106.return) {
                  _iterator106.return();
                }
              } finally {
                if (_didIteratorError106) {
                  throw _iteratorError106;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError103 = true;
        _iteratorError103 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion103 && _iterator103.return) {
            _iterator103.return();
          }
        } finally {
          if (_didIteratorError103) {
            throw _iteratorError103;
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
          var _iteratorNormalCompletion104 = true;
          var _didIteratorError104 = false;
          var _iteratorError104 = undefined;

          try {
            for (var _iterator104 = transitionsAfter[Symbol.iterator](), _step104; !(_iteratorNormalCompletion104 = (_step104 = _iterator104.next()).done); _iteratorNormalCompletion104 = true) {
              var transitionAfter = _step104.value;

              if (transitionAfter != null) {
                var toNodeId = transitionAfter.to;

                // remove the transitions to the group we are moving
                this.updateTransitionsForExtractingGroup(null, node.id, toNodeId);
                extracted = true;
              }
            }
          } catch (err) {
            _didIteratorError104 = true;
            _iteratorError104 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion104 && _iterator104.return) {
                _iterator104.return();
              }
            } finally {
              if (_didIteratorError104) {
                throw _iteratorError104;
              }
            }
          }
        }
      }

      var inserted = false;

      /*
       * create the transitions from the from group to the group we are moving
       * and the transitions from the group we are moving to the old to group
       */
      if (nodeId != null) {
        // get the transitions from the previous group to the next group
        var _transitionsAfter = this.getTransitionsByFromNodeId(nodeId);

        var _iteratorNormalCompletion105 = true;
        var _didIteratorError105 = false;
        var _iteratorError105 = undefined;

        try {
          for (var _iterator105 = _transitionsAfter[Symbol.iterator](), _step105; !(_iteratorNormalCompletion105 = (_step105 = _iterator105.next()).done); _iteratorNormalCompletion105 = true) {
            var _transitionAfter = _step105.value;

            if (_transitionAfter != null) {
              var _toNodeId6 = _transitionAfter.to;

              /*
               * create the transitions that traverse from the from group
               * to the group we are moving. also create the transitions
               * that traverse from the group we are moving to the old
               * to group.
               */
              this.updateTransitionsForInsertingGroup(nodeId, [_toNodeId6], node.id);
              inserted = true;
            }
          }
        } catch (err) {
          _didIteratorError105 = true;
          _iteratorError105 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion105 && _iterator105.return) {
              _iterator105.return();
            }
          } finally {
            if (_didIteratorError105) {
              throw _iteratorError105;
            }
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

          var startGroupId = this.getStartGroupId();

          if (startGroupId != null) {
            // get the start group for the whole project (group0)
            var startGroup = this.getNodeById(startGroupId);

            if (startGroup != null) {
              // get the first activity
              var firstGroupId = startGroup.startId;

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
     * Get the active nodes.
     * @return An array of the active node objects.
     */

  }, {
    key: 'getActiveNodes',
    value: function getActiveNodes() {
      return this.project.nodes;
    }

    /**
     * Get the inactive nodes
     * @returns the inactive nodes
     */

  }, {
    key: 'getInactiveNodes',
    value: function getInactiveNodes() {
      var inactiveNodes = [];
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

  }, {
    key: 'removeNodeFromActiveNodes',
    value: function removeNodeFromActiveNodes(nodeId) {
      var node = null;
      if (nodeId != null) {
        var activeNodes = this.project.nodes;
        if (activeNodes != null) {
          for (var a = 0; a < activeNodes.length; a++) {
            var activeNode = activeNodes[a];
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

  }, {
    key: 'removeChildNodesFromActiveNodes',
    value: function removeChildNodesFromActiveNodes(node) {
      if (node != null) {
        var childIds = node.ids;
        var _iteratorNormalCompletion107 = true;
        var _didIteratorError107 = false;
        var _iteratorError107 = undefined;

        try {
          for (var _iterator107 = childIds[Symbol.iterator](), _step107; !(_iteratorNormalCompletion107 = (_step107 = _iterator107.next()).done); _iteratorNormalCompletion107 = true) {
            var childId = _step107.value;

            this.removeNodeFromActiveNodes(childId);
          }
        } catch (err) {
          _didIteratorError107 = true;
          _iteratorError107 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion107 && _iterator107.return) {
              _iterator107.return();
            }
          } finally {
            if (_didIteratorError107) {
              throw _iteratorError107;
            }
          }
        }
      }
    }

    /**
     * Remove the node from the inactive nodes array
     * @param nodeId the node to remove
     * @returns the node that was removed
     */

  }, {
    key: 'removeNodeFromInactiveNodes',
    value: function removeNodeFromInactiveNodes(nodeId) {
      var node = null;
      if (nodeId != null) {
        var parentGroup = this.getParentGroup(nodeId);
        if (parentGroup != null) {
          // The node has a parent so we will remove it from the parent.
          this.removeChildFromParent(nodeId);
        }

        var inactiveNodes = this.project.inactiveNodes;
        if (inactiveNodes != null) {
          for (var i = 0; i < inactiveNodes.length; i++) {
            var inactiveNode = inactiveNodes[i];
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

  }, {
    key: 'removeChildFromParent',
    value: function removeChildFromParent(nodeId) {
      var parentGroup = this.getParentGroup(nodeId);
      if (parentGroup != null) {
        // Remove the child from the parent
        for (var i = 0; i < parentGroup.ids.length; i++) {
          var childId = parentGroup.ids[i];
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
          var startIdUpdated = false;
          var transitions = this.getTransitionsByFromNodeId(nodeId);
          if (transitions != null && transitions.length > 0 && transitions[0] != null && transitions[0].to != null) {
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

  }, {
    key: 'removeNodeFromInactiveStepNodes',
    value: function removeNodeFromInactiveStepNodes(nodeId) {
      for (var i = 0; i < this.inactiveStepNodes.length; i++) {
        var inactiveStepNode = this.inactiveStepNodes[i];
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

  }, {
    key: 'removeNodeFromInactiveGroupNodes',
    value: function removeNodeFromInactiveGroupNodes(nodeId) {
      for (var i = 0; i < this.inactiveGroupNodes.length; i++) {
        var inactiveGroupNode = this.inactiveGroupNodes[i];
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

  }, {
    key: 'loadInactiveNodes',
    value: function loadInactiveNodes(nodes) {
      if (nodes != null) {
        var _iteratorNormalCompletion108 = true;
        var _didIteratorError108 = false;
        var _iteratorError108 = undefined;

        try {
          for (var _iterator108 = nodes[Symbol.iterator](), _step108; !(_iteratorNormalCompletion108 = (_step108 = _iterator108.next()).done); _iteratorNormalCompletion108 = true) {
            var node = _step108.value;

            if (node != null) {
              var nodeId = node.id;

              this.setIdToNode(nodeId, node);
              this.setIdToElement(nodeId, node);
              if (node.type == 'group') {
                this.inactiveGroupNodes.push(node);
              } else {
                this.inactiveStepNodes.push(node);
              }
            }
          }
        } catch (err) {
          _didIteratorError108 = true;
          _iteratorError108 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion108 && _iterator108.return) {
              _iterator108.return();
            }
          } finally {
            if (_didIteratorError108) {
              throw _iteratorError108;
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

  }, {
    key: 'isActive',
    value: function isActive(nodeId, componentId) {
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

          var activeNodes = this.project.nodes;
          if (activeNodes != null) {
            var _iteratorNormalCompletion109 = true;
            var _didIteratorError109 = false;
            var _iteratorError109 = undefined;

            try {
              for (var _iterator109 = activeNodes[Symbol.iterator](), _step109; !(_iteratorNormalCompletion109 = (_step109 = _iterator109.next()).done); _iteratorNormalCompletion109 = true) {
                var activeNode = _step109.value;

                if (activeNode != null) {
                  var activeNodeId = activeNode.id;
                  if (nodeId == activeNodeId) {
                    // we have found the node id we are looking for

                    if (componentId != null) {
                      // we need to find the node id and component id

                      var activeComponents = activeNode.components;

                      if (activeComponents != null) {
                        var _iteratorNormalCompletion110 = true;
                        var _didIteratorError110 = false;
                        var _iteratorError110 = undefined;

                        try {
                          for (var _iterator110 = activeComponents[Symbol.iterator](), _step110; !(_iteratorNormalCompletion110 = (_step110 = _iterator110.next()).done); _iteratorNormalCompletion110 = true) {
                            var activeComponent = _step110.value;

                            if (activeComponent != null) {
                              var activeComponentId = activeComponent.id;
                              if (componentId == activeComponentId) {
                                /*
                                 * we have found the component id we are
                                 * looking for so we are done
                                 */
                                return true;
                              }
                            }
                          }
                        } catch (err) {
                          _didIteratorError110 = true;
                          _iteratorError110 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion110 && _iterator110.return) {
                              _iterator110.return();
                            }
                          } finally {
                            if (_didIteratorError110) {
                              throw _iteratorError110;
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
            } catch (err) {
              _didIteratorError109 = true;
              _iteratorError109 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion109 && _iterator109.return) {
                  _iterator109.return();
                }
              } finally {
                if (_didIteratorError109) {
                  throw _iteratorError109;
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

  }, {
    key: 'isGroupActive',
    value: function isGroupActive(nodeId) {
      var _iteratorNormalCompletion111 = true;
      var _didIteratorError111 = false;
      var _iteratorError111 = undefined;

      try {
        for (var _iterator111 = this.project.nodes[Symbol.iterator](), _step111; !(_iteratorNormalCompletion111 = (_step111 = _iterator111.next()).done); _iteratorNormalCompletion111 = true) {
          var activeNode = _step111.value;

          if (nodeId == activeNode.id) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError111 = true;
        _iteratorError111 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion111 && _iterator111.return) {
            _iterator111.return();
          }
        } finally {
          if (_didIteratorError111) {
            throw _iteratorError111;
          }
        }
      }

      return false;
    }

    /**
     * Move the node to the active nodes array
     */

  }, {
    key: 'moveToActive',
    value: function moveToActive(node) {
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
            var childIds = node.ids;
            var _iteratorNormalCompletion112 = true;
            var _didIteratorError112 = false;
            var _iteratorError112 = undefined;

            try {
              for (var _iterator112 = childIds[Symbol.iterator](), _step112; !(_iteratorNormalCompletion112 = (_step112 = _iterator112.next()).done); _iteratorNormalCompletion112 = true) {
                var childId = _step112.value;

                var childNode = this.removeNodeFromInactiveNodes(childId);
                this.addNode(childNode);
              }
            } catch (err) {
              _didIteratorError112 = true;
              _iteratorError112 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion112 && _iterator112.return) {
                  _iterator112.return();
                }
              } finally {
                if (_didIteratorError112) {
                  throw _iteratorError112;
                }
              }
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

  }, {
    key: 'moveToInactive',
    value: function moveToInactive(node, nodeIdToInsertAfter) {
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

  }, {
    key: 'moveFromActiveToInactiveInsertInside',
    value: function moveFromActiveToInactiveInsertInside(node, nodeIdToInsertInside) {
      this.removeNodeFromActiveNodes(node.id);

      // add the node to the inactive array
      this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
    }

    /**
     * Move the node from inactive to inside an inactive group
     * @param node the node to move
     * @param nodeIdToInsertInside place the node inside this
     */

  }, {
    key: 'moveFromInactiveToInactiveInsertInside',
    value: function moveFromInactiveToInactiveInsertInside(node, nodeIdToInsertInside) {
      this.removeNodeFromInactiveNodes(node.id);

      if (this.isGroupNode(node.id)) {
        /*
         * remove the group's child nodes from our data structures so that we can
         * add them back in later
         */
        var childIds = node.ids;
        var _iteratorNormalCompletion113 = true;
        var _didIteratorError113 = false;
        var _iteratorError113 = undefined;

        try {
          for (var _iterator113 = childIds[Symbol.iterator](), _step113; !(_iteratorNormalCompletion113 = (_step113 = _iterator113.next()).done); _iteratorNormalCompletion113 = true) {
            var childId = _step113.value;

            var childNode = this.getNodeById(childId);
            var inactiveNodesIndex = this.project.inactiveNodes.indexOf(childNode);
            if (inactiveNodesIndex != -1) {
              this.project.inactiveNodes.splice(inactiveNodesIndex, 1);
            }
            var inactiveStepNodesIndex = this.inactiveStepNodes.indexOf(childNode);
            if (inactiveStepNodesIndex != -1) {
              this.inactiveStepNodes.splice(inactiveStepNodesIndex, 1);
            }
          }
        } catch (err) {
          _didIteratorError113 = true;
          _iteratorError113 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion113 && _iterator113.return) {
              _iterator113.return();
            }
          } finally {
            if (_didIteratorError113) {
              throw _iteratorError113;
            }
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

  }, {
    key: 'addInactiveNode',
    value: function addInactiveNode(node, nodeIdToInsertAfter) {
      if (node != null) {
        var inactiveNodes = this.project.inactiveNodes;

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

            var added = false;
            for (var i = 0; i < inactiveNodes.length; i++) {
              var inactiveNode = inactiveNodes[i];
              if (inactiveNode != null) {
                if (nodeIdToInsertAfter === inactiveNode.id) {
                  var parentGroup = this.getParentGroup(nodeIdToInsertAfter);
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

  }, {
    key: 'addInactiveNodeInsertInside',
    value: function addInactiveNodeInsertInside(node, nodeIdToInsertInside) {
      if (node != null) {
        var inactiveNodes = this.project.inactiveNodes;
        var inactiveGroups = this.getInactiveGroupNodes();

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

            var added = false;
            var _iteratorNormalCompletion114 = true;
            var _didIteratorError114 = false;
            var _iteratorError114 = undefined;

            try {
              for (var _iterator114 = inactiveGroups[Symbol.iterator](), _step114; !(_iteratorNormalCompletion114 = (_step114 = _iterator114.next()).done); _iteratorNormalCompletion114 = true) {
                var inactiveGroup = _step114.value;

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
                  for (var i = 0; i < inactiveNodes.length; i++) {
                    var inactiveNode = inactiveNodes[i];
                    if (nodeIdToInsertInside == inactiveNode.id) {
                      inactiveNodes.splice(i + 1, 0, node);
                      added = true;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError114 = true;
              _iteratorError114 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion114 && _iterator114.return) {
                  _iterator114.return();
                }
              } finally {
                if (_didIteratorError114) {
                  throw _iteratorError114;
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

  }, {
    key: 'addGroupChildNodesToInactive',
    value: function addGroupChildNodesToInactive(node) {
      if (node != null) {
        var childIds = node.ids;
        var _iteratorNormalCompletion115 = true;
        var _didIteratorError115 = false;
        var _iteratorError115 = undefined;

        try {
          for (var _iterator115 = childIds[Symbol.iterator](), _step115; !(_iteratorNormalCompletion115 = (_step115 = _iterator115.next()).done); _iteratorNormalCompletion115 = true) {
            var childId = _step115.value;

            var childNode = this.getNodeById(childId);
            this.project.inactiveNodes.push(childNode);
            this.inactiveStepNodes.push(childNode);
          }
        } catch (err) {
          _didIteratorError115 = true;
          _iteratorError115 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion115 && _iterator115.return) {
              _iterator115.return();
            }
          } finally {
            if (_didIteratorError115) {
              throw _iteratorError115;
            }
          }
        }
      }
    }

    /**
     * Move an inactive node within the inactive nodes array
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */

  }, {
    key: 'moveInactiveNode',
    value: function moveInactiveNode(node, nodeIdToInsertAfter) {
      if (node != null) {
        var inactiveNodes = this.project.inactiveNodes;
        if (inactiveNodes != null) {
          // remove the node from inactive nodes

          for (var i = 0; i < inactiveNodes.length; i++) {
            var inactiveNode = inactiveNodes[i];
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

            var added = false;
            for (var _i = 0; _i < inactiveNodes.length; _i++) {
              var _inactiveNode = inactiveNodes[_i];
              if (_inactiveNode != null) {
                if (nodeIdToInsertAfter === _inactiveNode.id) {
                  // we have found the position to place the node
                  var parentGroup = this.getParentGroup(nodeIdToInsertAfter);
                  if (parentGroup != null) {
                    this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
                    this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
                  }
                  inactiveNodes.splice(_i + 1, 0, node);
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
     * Remove transitions that go out of the group
     * @param nodeId the group id
     */

  }, {
    key: 'removeTransitionsOutOfGroup',
    value: function removeTransitionsOutOfGroup(nodeId) {
      if (nodeId != null) {
        var group = this.getNodeById(nodeId);
        if (group != null) {
          var childIds = group.ids;
          if (childIds != null) {
            var _iteratorNormalCompletion116 = true;
            var _didIteratorError116 = false;
            var _iteratorError116 = undefined;

            try {
              for (var _iterator116 = childIds[Symbol.iterator](), _step116; !(_iteratorNormalCompletion116 = (_step116 = _iterator116.next()).done); _iteratorNormalCompletion116 = true) {
                var childId = _step116.value;

                if (childId != null) {
                  var transitions = this.getTransitionsByFromNodeId(childId);
                  if (transitions != null) {
                    for (var t = 0; t < transitions.length; t++) {
                      var transition = transitions[t];
                      if (transition != null) {
                        var toNodeId = transition.to;
                        if (toNodeId != null) {
                          var toNodeIdParentGroupId = this.getParentGroupId(toNodeId);
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
            } catch (err) {
              _didIteratorError116 = true;
              _iteratorError116 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion116 && _iterator116.return) {
                  _iterator116.return();
                }
              } finally {
                if (_didIteratorError116) {
                  throw _iteratorError116;
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

  }, {
    key: 'updateChildrenTransitionsIntoGroupWeAreMoving',
    value: function updateChildrenTransitionsIntoGroupWeAreMoving(groupThatTransitionsToGroupWeAreMoving, groupIdWeAreMoving) {
      if (groupThatTransitionsToGroupWeAreMoving != null && groupIdWeAreMoving != null) {
        var group = this.getNodeById(groupIdWeAreMoving);
        if (group != null) {
          // get all the nodes that have a transition to the node we are removing
          var nodesByToNodeId = this.getNodesByToNodeId(groupIdWeAreMoving);

          // get the transitions of the node we are removing
          var nodeToRemoveTransitionLogic = group.transitionLogic;
          var nodeToRemoveTransitions = [];

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
            var childIds = groupThatTransitionsToGroupWeAreMoving.ids;

            if (childIds != null) {
              var _iteratorNormalCompletion117 = true;
              var _didIteratorError117 = false;
              var _iteratorError117 = undefined;

              try {
                for (var _iterator117 = childIds[Symbol.iterator](), _step117; !(_iteratorNormalCompletion117 = (_step117 = _iterator117.next()).done); _iteratorNormalCompletion117 = true) {
                  var childId = _step117.value;

                  var transitionsFromChild = this.getTransitionsByFromNodeId(childId);
                  if (transitionsFromChild != null) {
                    for (var tfc = 0; tfc < transitionsFromChild.length; tfc++) {
                      var transitionFromChild = transitionsFromChild[tfc];
                      if (transitionFromChild != null) {
                        var toNodeId = transitionFromChild.to;

                        // get the parent group id of the toNodeId
                        var toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

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
              } catch (err) {
                _didIteratorError117 = true;
                _iteratorError117 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion117 && _iterator117.return) {
                    _iterator117.return();
                  }
                } finally {
                  if (_didIteratorError117) {
                    throw _iteratorError117;
                  }
                }
              }
            }
          } else if (nodeToRemoveTransitions.length > 0) {
            // get the first group that comes after the group we are removing
            var firstNodeToRemoveTransition = nodeToRemoveTransitions[0];
            var firstNodeToRemoveTransitionToNodeId = firstNodeToRemoveTransition.to;

            if (this.isGroupNode(firstNodeToRemoveTransitionToNodeId)) {
              // get the group that comes after the group we are moving
              var groupNode = this.getNodeById(firstNodeToRemoveTransitionToNodeId);

              // get child ids of the group that comes before the group we are moving
              var _childIds3 = groupThatTransitionsToGroupWeAreMoving.ids;

              if (_childIds3 != null) {
                var _iteratorNormalCompletion118 = true;
                var _didIteratorError118 = false;
                var _iteratorError118 = undefined;

                try {
                  for (var _iterator118 = _childIds3[Symbol.iterator](), _step118; !(_iteratorNormalCompletion118 = (_step118 = _iterator118.next()).done); _iteratorNormalCompletion118 = true) {
                    var _childId3 = _step118.value;

                    var _transitionsFromChild = this.getTransitionsByFromNodeId(_childId3);
                    if (_transitionsFromChild != null) {
                      var _iteratorNormalCompletion119 = true;
                      var _didIteratorError119 = false;
                      var _iteratorError119 = undefined;

                      try {
                        for (var _iterator119 = _transitionsFromChild[Symbol.iterator](), _step119; !(_iteratorNormalCompletion119 = (_step119 = _iterator119.next()).done); _iteratorNormalCompletion119 = true) {
                          var _transitionFromChild = _step119.value;

                          if (_transitionFromChild != null) {
                            var _toNodeId8 = _transitionFromChild.to;

                            // get the parent group id of the toNodeId
                            var _toNodeIdParentGroupId = this.getParentGroupId(_toNodeId8);

                            if (groupIdWeAreMoving === _toNodeIdParentGroupId) {
                              // the transition is to a child in the group we are moving

                              if (groupNode.startId == null) {
                                // change the transition to point to the after group
                                _transitionFromChild.to = firstNodeToRemoveTransitionToNodeId;
                              } else {
                                // change the transition to point to the start id of the after group
                                _transitionFromChild.to = groupNode.startId;
                              }
                            }
                          }
                        }
                      } catch (err) {
                        _didIteratorError119 = true;
                        _iteratorError119 = err;
                      } finally {
                        try {
                          if (!_iteratorNormalCompletion119 && _iterator119.return) {
                            _iterator119.return();
                          }
                        } finally {
                          if (_didIteratorError119) {
                            throw _iteratorError119;
                          }
                        }
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError118 = true;
                  _iteratorError118 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion118 && _iterator118.return) {
                      _iterator118.return();
                    }
                  } finally {
                    if (_didIteratorError118) {
                      throw _iteratorError118;
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

  }, {
    key: 'nodeHasWork',
    value: function nodeHasWork(nodeId) {
      if (nodeId != null) {
        var nodeContent = this.getNodeContentByNodeId(nodeId);
        if (nodeContent != null) {
          var components = nodeContent.components;
          if (components != null) {
            var _iteratorNormalCompletion120 = true;
            var _didIteratorError120 = false;
            var _iteratorError120 = undefined;

            try {
              for (var _iterator120 = components[Symbol.iterator](), _step120; !(_iteratorNormalCompletion120 = (_step120 = _iterator120.next()).done); _iteratorNormalCompletion120 = true) {
                var component = _step120.value;

                if (component != null) {
                  var componentHasWork = this.componentHasWork(component);
                  if (componentHasWork) {
                    return true;
                  }
                }
              }
            } catch (err) {
              _didIteratorError120 = true;
              _iteratorError120 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion120 && _iterator120.return) {
                  _iterator120.return();
                }
              } finally {
                if (_didIteratorError120) {
                  throw _iteratorError120;
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

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      if (component != null) {
        var componentType = component.type;
        var componentService = this.getComponentService(componentType);
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

  }, {
    key: 'getComponentService',
    value: function getComponentService(componentType) {
      var componentService = null;
      if (componentType != null) {
        var componentServiceName = componentType + 'Service';

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

  }, {
    key: 'getUnusedComponentId',
    value: function getUnusedComponentId(componentIdsToSkip) {
      // we want to make an id with 10 characters
      var idLength = 10;

      var newComponentId = this.UtilService.generateKey(idLength);

      // check if the component id is already used in the project
      if (this.isComponentIdUsed(newComponentId)) {
        /*
         * the component id is already used in the project so we need to
         * try generating another one
         */
        var alreadyUsed = true;

        /*
         * keep trying to generate a new component id until we have found
         * one that isn't already being used
         */
        while (!alreadyUsed) {
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

  }, {
    key: 'isComponentIdUsed',
    value: function isComponentIdUsed(componentId) {
      var _iteratorNormalCompletion121 = true;
      var _didIteratorError121 = false;
      var _iteratorError121 = undefined;

      try {
        for (var _iterator121 = this.project.nodes[Symbol.iterator](), _step121; !(_iteratorNormalCompletion121 = (_step121 = _iterator121.next()).done); _iteratorNormalCompletion121 = true) {
          var node = _step121.value;

          if (node != null) {
            var components = node.components;
            if (components != null) {
              var _iteratorNormalCompletion123 = true;
              var _didIteratorError123 = false;
              var _iteratorError123 = undefined;

              try {
                for (var _iterator123 = components[Symbol.iterator](), _step123; !(_iteratorNormalCompletion123 = (_step123 = _iterator123.next()).done); _iteratorNormalCompletion123 = true) {
                  var component = _step123.value;

                  if (component != null) {
                    if (componentId === component.id) {
                      return true;
                    }
                  }
                }
              } catch (err) {
                _didIteratorError123 = true;
                _iteratorError123 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion123 && _iterator123.return) {
                    _iterator123.return();
                  }
                } finally {
                  if (_didIteratorError123) {
                    throw _iteratorError123;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError121 = true;
        _iteratorError121 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion121 && _iterator121.return) {
            _iterator121.return();
          }
        } finally {
          if (_didIteratorError121) {
            throw _iteratorError121;
          }
        }
      }

      var _iteratorNormalCompletion122 = true;
      var _didIteratorError122 = false;
      var _iteratorError122 = undefined;

      try {
        for (var _iterator122 = this.project.inactiveNodes[Symbol.iterator](), _step122; !(_iteratorNormalCompletion122 = (_step122 = _iterator122.next()).done); _iteratorNormalCompletion122 = true) {
          var _node = _step122.value;

          if (_node != null) {
            var _components = _node.components;
            if (_components != null) {
              var _iteratorNormalCompletion124 = true;
              var _didIteratorError124 = false;
              var _iteratorError124 = undefined;

              try {
                for (var _iterator124 = _components[Symbol.iterator](), _step124; !(_iteratorNormalCompletion124 = (_step124 = _iterator124.next()).done); _iteratorNormalCompletion124 = true) {
                  var _component = _step124.value;

                  if (_component != null) {
                    if (componentId === _component.id) {
                      return true;
                    }
                  }
                }
              } catch (err) {
                _didIteratorError124 = true;
                _iteratorError124 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion124 && _iterator124.return) {
                    _iterator124.return();
                  }
                } finally {
                  if (_didIteratorError124) {
                    throw _iteratorError124;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError122 = true;
        _iteratorError122 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion122 && _iterator122.return) {
            _iterator122.return();
          }
        } finally {
          if (_didIteratorError122) {
            throw _iteratorError122;
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

  }, {
    key: 'getNextAvailableConstraintIdForNodeId',
    value: function getNextAvailableConstraintIdForNodeId(nodeId) {
      var nextAvailableConstraintId = null;
      if (nodeId != null) {
        // an array to hold the constraint ids that are already being used
        var usedConstraintIds = [];
        var node = this.getNodeById(nodeId);

        if (node != null) {
          var constraints = node.constraints;
          if (constraints != null) {
            var _iteratorNormalCompletion125 = true;
            var _didIteratorError125 = false;
            var _iteratorError125 = undefined;

            try {
              for (var _iterator125 = constraints[Symbol.iterator](), _step125; !(_iteratorNormalCompletion125 = (_step125 = _iterator125.next()).done); _iteratorNormalCompletion125 = true) {
                var constraint = _step125.value;

                if (constraint != null) {
                  var constraintId = constraint.id;

                  // add the constraint id to the array of used constraint ids
                  usedConstraintIds.push(constraintId);
                }
              }
            } catch (err) {
              _didIteratorError125 = true;
              _iteratorError125 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion125 && _iterator125.return) {
                  _iterator125.return();
                }
              } finally {
                if (_didIteratorError125) {
                  throw _iteratorError125;
                }
              }
            }
          }
        }

        var foundNextAvailableConstraintId = false;
        var counter = 1;

        while (!foundNextAvailableConstraintId) {
          var potentialConstraintId = nodeId + 'Constraint' + counter;
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
     * Get the node ids in the branch by looking for nodes that have branch
     * path taken constraints with the given fromNodeId and toNodeId
     * @param fromNodeId the from node id
     * @param toNodeId the to node id
     * @return an array of nodes that are in the branch path
     */

  }, {
    key: 'getNodeIdsInBranch',
    value: function getNodeIdsInBranch(fromNodeId, toNodeId) {
      var nodeIdsInBranch = [];
      var nodes = this.getNodes();
      if (nodes != null) {
        var _iteratorNormalCompletion126 = true;
        var _didIteratorError126 = false;
        var _iteratorError126 = undefined;

        try {
          for (var _iterator126 = nodes[Symbol.iterator](), _step126; !(_iteratorNormalCompletion126 = (_step126 = _iterator126.next()).done); _iteratorNormalCompletion126 = true) {
            var node = _step126.value;

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
        } catch (err) {
          _didIteratorError126 = true;
          _iteratorError126 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion126 && _iterator126.return) {
              _iterator126.return();
            }
          } finally {
            if (_didIteratorError126) {
              throw _iteratorError126;
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

  }, {
    key: 'orderNodeIds',
    value: function orderNodeIds(nodeIds) {
      var orderedNodeIds = this.getFlattenedProjectAsNodeIds();
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

  }, {
    key: 'nodeIdsComparatorGenerator',
    value: function nodeIdsComparatorGenerator(orderedNodeIds) {
      return function (nodeIdA, nodeIdB) {
        var nodeIdAIndex = orderedNodeIds.indexOf(nodeIdA);
        var nodeIdBIndex = orderedNodeIds.indexOf(nodeIdB);
        if (nodeIdAIndex < nodeIdBIndex) {
          return -1;
        } else if (nodeIdAIndex > nodeIdBIndex) {
          return 1;
        }
        return 0;
      };
    }

    /**
     * Check if a node has a branch path taken constraint
     * @param node the node to check
     * @param fromNodeId the from node id of the branch path taken
     * @param toNodeId the to node id of the branch path taken
     * @return whether the node has a branch path taken constraint with the
     * given from node id and to node id
     */

  }, {
    key: 'hasBranchPathTakenConstraint',
    value: function hasBranchPathTakenConstraint(node, fromNodeId, toNodeId) {
      if (node != null) {
        var constraints = node.constraints;
        if (constraints != null) {
          var _iteratorNormalCompletion127 = true;
          var _didIteratorError127 = false;
          var _iteratorError127 = undefined;

          try {
            for (var _iterator127 = constraints[Symbol.iterator](), _step127; !(_iteratorNormalCompletion127 = (_step127 = _iterator127.next()).done); _iteratorNormalCompletion127 = true) {
              var constraint = _step127.value;

              if (constraint != null) {
                var removalCriteria = constraint.removalCriteria;
                if (removalCriteria != null) {
                  var _iteratorNormalCompletion128 = true;
                  var _didIteratorError128 = false;
                  var _iteratorError128 = undefined;

                  try {
                    for (var _iterator128 = removalCriteria[Symbol.iterator](), _step128; !(_iteratorNormalCompletion128 = (_step128 = _iterator128.next()).done); _iteratorNormalCompletion128 = true) {
                      var removalCriterion = _step128.value;

                      if (removalCriterion != null) {
                        var name = removalCriterion.name;
                        if (name == 'branchPathTaken') {
                          var params = removalCriterion.params;
                          if (params != null) {
                            if (fromNodeId == params.fromNodeId && toNodeId == params.toNodeId) {
                              return true;
                            }
                          }
                        }
                      }
                    }
                  } catch (err) {
                    _didIteratorError128 = true;
                    _iteratorError128 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion128 && _iterator128.return) {
                        _iterator128.return();
                      }
                    } finally {
                      if (_didIteratorError128) {
                        throw _iteratorError128;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError127 = true;
            _iteratorError127 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion127 && _iterator127.return) {
                _iterator127.return();
              }
            } finally {
              if (_didIteratorError127) {
                throw _iteratorError127;
              }
            }
          }
        }
      }
      return false;
    }

    /**
     * Remove the branch path taken constraints from a node
     * @param nodeId remove the constraints from this node
     */

  }, {
    key: 'removeBranchPathTakenNodeConstraints',
    value: function removeBranchPathTakenNodeConstraints(nodeId) {
      var node = this.getNodeById(nodeId);
      if (node != null) {
        var constraints = node.constraints;
        if (constraints != null) {
          for (var c = 0; c < constraints.length; c++) {
            var constraint = constraints[c];
            if (constraint != null) {
              var removalCriteria = constraint.removalCriteria;

              if (removalCriteria != null) {
                var _iteratorNormalCompletion129 = true;
                var _didIteratorError129 = false;
                var _iteratorError129 = undefined;

                try {
                  for (var _iterator129 = removalCriteria[Symbol.iterator](), _step129; !(_iteratorNormalCompletion129 = (_step129 = _iterator129.next()).done); _iteratorNormalCompletion129 = true) {
                    var removalCriterion = _step129.value;

                    if (removalCriterion != null) {
                      if (removalCriterion.name == 'branchPathTaken') {
                        var params = removalCriterion.params;
                        constraints.splice(c, 1);
                        // move the counter back one because we just removed a constraint
                        c--;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError129 = true;
                  _iteratorError129 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion129 && _iterator129.return) {
                      _iterator129.return();
                    }
                  } finally {
                    if (_didIteratorError129) {
                      throw _iteratorError129;
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

  }, {
    key: 'getBranchPathTakenConstraintsByNodeId',
    value: function getBranchPathTakenConstraintsByNodeId(nodeId) {
      var branchPathTakenConstraints = [];
      if (nodeId != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          var constraints = node.constraints;
          if (constraints != null) {
            var _iteratorNormalCompletion130 = true;
            var _didIteratorError130 = false;
            var _iteratorError130 = undefined;

            try {
              for (var _iterator130 = constraints[Symbol.iterator](), _step130; !(_iteratorNormalCompletion130 = (_step130 = _iterator130.next()).done); _iteratorNormalCompletion130 = true) {
                var constraint = _step130.value;

                if (constraint != null) {
                  var removalCriteria = constraint.removalCriteria;
                  if (removalCriteria != null) {
                    var _iteratorNormalCompletion131 = true;
                    var _didIteratorError131 = false;
                    var _iteratorError131 = undefined;

                    try {
                      for (var _iterator131 = removalCriteria[Symbol.iterator](), _step131; !(_iteratorNormalCompletion131 = (_step131 = _iterator131.next()).done); _iteratorNormalCompletion131 = true) {
                        var removalCriterion = _step131.value;

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
                    } catch (err) {
                      _didIteratorError131 = true;
                      _iteratorError131 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion131 && _iterator131.return) {
                          _iterator131.return();
                        }
                      } finally {
                        if (_didIteratorError131) {
                          throw _iteratorError131;
                        }
                      }
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError130 = true;
              _iteratorError130 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion130 && _iterator130.return) {
                  _iterator130.return();
                }
              } finally {
                if (_didIteratorError130) {
                  throw _iteratorError130;
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

  }, {
    key: 'updateBranchPathTakenConstraint',
    value: function updateBranchPathTakenConstraint(node, currentFromNodeId, currentToNodeId, newFromNodeId, newToNodeId) {
      if (node != null) {
        var constraints = node.constraints;
        if (constraints != null) {
          var _iteratorNormalCompletion132 = true;
          var _didIteratorError132 = false;
          var _iteratorError132 = undefined;

          try {
            for (var _iterator132 = constraints[Symbol.iterator](), _step132; !(_iteratorNormalCompletion132 = (_step132 = _iterator132.next()).done); _iteratorNormalCompletion132 = true) {
              var constraint = _step132.value;

              if (constraint != null) {
                var removalCriteria = constraint.removalCriteria;
                if (removalCriteria != null) {
                  var _iteratorNormalCompletion133 = true;
                  var _didIteratorError133 = false;
                  var _iteratorError133 = undefined;

                  try {
                    for (var _iterator133 = removalCriteria[Symbol.iterator](), _step133; !(_iteratorNormalCompletion133 = (_step133 = _iterator133.next()).done); _iteratorNormalCompletion133 = true) {
                      var removalCriterion = _step133.value;

                      if (removalCriterion != null) {
                        if (removalCriterion.name === 'branchPathTaken') {
                          var params = removalCriterion.params;
                          if (params != null) {
                            if (params.fromNodeId === currentFromNodeId && params.toNodeId === currentToNodeId) {
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
                  } catch (err) {
                    _didIteratorError133 = true;
                    _iteratorError133 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion133 && _iterator133.return) {
                        _iterator133.return();
                      }
                    } finally {
                      if (_didIteratorError133) {
                        throw _iteratorError133;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError132 = true;
            _iteratorError132 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion132 && _iterator132.return) {
                _iterator132.return();
              }
            } finally {
              if (_didIteratorError132) {
                throw _iteratorError132;
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

  }, {
    key: 'getProjectRubric',
    value: function getProjectRubric() {
      return this.project.rubric;
    }

    /**
     * Check if a node is a branch point
     * @param nodeId the node id
     * @return whether the node is a branch point
     */

  }, {
    key: 'isBranchPoint',
    value: function isBranchPoint(nodeId) {
      var transitions = this.getTransitionsByFromNodeId(nodeId);
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
     * Check if a node is the first node in a branch path
     * @param nodeId the node id
     * @return whether the node is the first node in a branch path
     */

  }, {
    key: 'isFirstNodeInBranchPath',
    value: function isFirstNodeInBranchPath(nodeId) {
      var nodes = this.getNodes();
      if (nodes != null) {
        var _iteratorNormalCompletion134 = true;
        var _didIteratorError134 = false;
        var _iteratorError134 = undefined;

        try {
          for (var _iterator134 = nodes[Symbol.iterator](), _step134; !(_iteratorNormalCompletion134 = (_step134 = _iterator134.next()).done); _iteratorNormalCompletion134 = true) {
            var node = _step134.value;

            if (node != null && node.transitionLogic != null && node.transitionLogic.transitions != null) {
              var transitions = node.transitionLogic.transitions;

              if (transitions.length > 1) {
                /*
                 * there is more than one transition from this node
                 * which means it is a branch point
                 */
                var _iteratorNormalCompletion135 = true;
                var _didIteratorError135 = false;
                var _iteratorError135 = undefined;

                try {
                  for (var _iterator135 = transitions[Symbol.iterator](), _step135; !(_iteratorNormalCompletion135 = (_step135 = _iterator135.next()).done); _iteratorNormalCompletion135 = true) {
                    var transition = _step135.value;

                    if (transition != null) {
                      var transitionTo = transition.to;
                      if (transitionTo === nodeId) {
                        return true;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError135 = true;
                  _iteratorError135 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion135 && _iterator135.return) {
                      _iterator135.return();
                    }
                  } finally {
                    if (_didIteratorError135) {
                      throw _iteratorError135;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError134 = true;
          _iteratorError134 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion134 && _iterator134.return) {
              _iterator134.return();
            }
          } finally {
            if (_didIteratorError134) {
              throw _iteratorError134;
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

  }, {
    key: 'isNodeInAnyBranchPath',
    value: function isNodeInAnyBranchPath(nodeId) {
      var result = false;
      if (this.nodeIdToIsInBranchPath[nodeId] == null) {
        /*
         * we have not calculated whether the node id is in a branch path
         * before so we will now
         */

        var branches = this.getBranches();
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

  }, {
    key: 'isBranchStartPoint',
    value: function isBranchStartPoint(nodeId) {
      /*
       * Get all the branches. Each branch is represented as an object that
       * contains the branchStartPoint, branchEndPoint, and branchPaths.
       */
      var branches = this.getBranches();

      if (branches != null) {
        var _iteratorNormalCompletion136 = true;
        var _didIteratorError136 = false;
        var _iteratorError136 = undefined;

        try {
          for (var _iterator136 = branches[Symbol.iterator](), _step136; !(_iteratorNormalCompletion136 = (_step136 = _iterator136.next()).done); _iteratorNormalCompletion136 = true) {
            var branch = _step136.value;

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
        } catch (err) {
          _didIteratorError136 = true;
          _iteratorError136 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion136 && _iterator136.return) {
              _iterator136.return();
            }
          } finally {
            if (_didIteratorError136) {
              throw _iteratorError136;
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

  }, {
    key: 'isBranchMergePoint',
    value: function isBranchMergePoint(nodeId) {
      /*
       * Get all the branches. Each branch is represented as an object that
       * contains the branchStartPoint, branchEndPoint, and branchPaths.
       */
      var branches = this.getBranches();

      if (branches != null) {
        var _iteratorNormalCompletion137 = true;
        var _didIteratorError137 = false;
        var _iteratorError137 = undefined;

        try {
          for (var _iterator137 = branches[Symbol.iterator](), _step137; !(_iteratorNormalCompletion137 = (_step137 = _iterator137.next()).done); _iteratorNormalCompletion137 = true) {
            var branch = _step137.value;

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
        } catch (err) {
          _didIteratorError137 = true;
          _iteratorError137 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion137 && _iterator137.return) {
              _iterator137.return();
            }
          } finally {
            if (_didIteratorError137) {
              throw _iteratorError137;
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

  }, {
    key: 'getBranchesByBranchStartPointNodeId',
    value: function getBranchesByBranchStartPointNodeId(nodeId) {
      var branches = [];
      var allBranches = this.getBranches();

      if (allBranches != null) {
        var _iteratorNormalCompletion138 = true;
        var _didIteratorError138 = false;
        var _iteratorError138 = undefined;

        try {
          for (var _iterator138 = allBranches[Symbol.iterator](), _step138; !(_iteratorNormalCompletion138 = (_step138 = _iterator138.next()).done); _iteratorNormalCompletion138 = true) {
            var branch = _step138.value;

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
        } catch (err) {
          _didIteratorError138 = true;
          _iteratorError138 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion138 && _iterator138.return) {
              _iterator138.return();
            }
          } finally {
            if (_didIteratorError138) {
              throw _iteratorError138;
            }
          }
        }
      }
      return branches;
    }

    /**
     * Calculate the node numbers and set them into the nodeIdToNumber map
     */

  }, {
    key: 'calculateNodeNumbers',
    value: function calculateNodeNumbers() {
      this.nodeIdToNumber = {};
      this.nodeIdToBranchPathLetter = {};
      var startNodeId = this.getStartNodeId();

      var currentActivityNumber = 0;
      var currentStepNumber = 0;

      // recursively calculate the node numbers by traversing the project tree
      this.calculateNodeNumbersHelper(startNodeId, currentActivityNumber, currentStepNumber);
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

  }, {
    key: 'calculateNodeNumbersHelper',
    value: function calculateNodeNumbersHelper(nodeId, currentActivityNumber, currentStepNumber, branchLetterCode) {
      if (nodeId != null) {
        if (this.isApplicationNode(nodeId)) {
          var node = this.getNodeById(nodeId);
          if (node != null) {
            var parentGroup = this.getParentGroup(nodeId);
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
              var branchesByBranchStartPointNodeId = this.getBranchesByBranchStartPointNodeId(nodeId);
              var branchesObject = branchesByBranchStartPointNodeId[0];

              /*
               * been used in the branch paths so that we know what
               * step number to give the merge end point
               * this is used to obtain the max step number that has
               */
              var maxCurrentStepNumber = 0;

              // set the step number for the branch start point
              this.nodeIdToNumber[nodeId] = currentActivityNumber + '.' + currentStepNumber;

              currentStepNumber++;
              var branchPaths = branchesObject.branchPaths;

              for (var bp = 0; bp < branchPaths.length; bp++) {
                var branchPath = branchPaths[bp];
                var branchCurrentStepNumber = currentStepNumber;

                // get the letter code e.g. 1=A, 2=B, etc.
                var _branchLetterCode = bp;

                for (var bpn = 0; bpn < branchPath.length; bpn++) {
                  if (bpn == 0) {
                    /*
                     * Recursively call calculateNodeNumbersHelper on the
                     * first step in this branch path. This will recursively
                     * calculate the numbers for all the nodes in this
                     * branch path.
                     */
                    var branchPathNodeId = branchPath[bpn];
                    this.calculateNodeNumbersHelper(branchPathNodeId, currentActivityNumber, branchCurrentStepNumber, _branchLetterCode);
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

              var branchEndPointNodeId = branchesObject.branchEndPoint;

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

                var number = null;

                if (branchLetterCode == null) {
                  // we do not need to add a branch letter

                  // get the node number e.g. 1.5
                  number = currentActivityNumber + '.' + currentStepNumber;
                } else {
                  // we need to add a branch letter

                  // get the branch letter
                  var branchLetter = String.fromCharCode(65 + branchLetterCode);

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

              var transitions = [];

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
                var _iteratorNormalCompletion139 = true;
                var _didIteratorError139 = false;
                var _iteratorError139 = undefined;

                try {
                  for (var _iterator139 = transitions[Symbol.iterator](), _step139; !(_iteratorNormalCompletion139 = (_step139 = _iterator139.next()).done); _iteratorNormalCompletion139 = true) {
                    var transition = _step139.value;

                    if (transition != null) {
                      if (this.isBranchMergePoint(transition.to)) {} else {
                        this.calculateNodeNumbersHelper(transition.to, currentActivityNumber, currentStepNumber, branchLetterCode);
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError139 = true;
                  _iteratorError139 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion139 && _iterator139.return) {
                      _iterator139.return();
                    }
                  } finally {
                    if (_didIteratorError139) {
                      throw _iteratorError139;
                    }
                  }
                }
              } else {
                // if there are no transitions, check if the parent group has a transition

                if (parentGroup != null && parentGroup.transitionLogic != null && parentGroup.transitionLogic.transitions != null && parentGroup.transitionLogic.transitions.length > 0) {
                  var _iteratorNormalCompletion140 = true;
                  var _didIteratorError140 = false;
                  var _iteratorError140 = undefined;

                  try {
                    for (var _iterator140 = parentGroup.transitionLogic.transitions[Symbol.iterator](), _step140; !(_iteratorNormalCompletion140 = (_step140 = _iterator140.next()).done); _iteratorNormalCompletion140 = true) {
                      var _transition4 = _step140.value;

                      if (_transition4 != null) {
                        this.calculateNodeNumbersHelper(_transition4.to, currentActivityNumber, currentStepNumber, branchLetterCode);
                      }
                    }
                  } catch (err) {
                    _didIteratorError140 = true;
                    _iteratorError140 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion140 && _iterator140.return) {
                        _iterator140.return();
                      }
                    } finally {
                      if (_didIteratorError140) {
                        throw _iteratorError140;
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          // the node is a group node

          var _node2 = this.getNodeById(nodeId);
          if (_node2 != null) {
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

            if (_node2.startId != null && _node2.startId != '') {
              /*
               * calculate the node number for the first step in this
               * activity and any steps after it
               */
              this.calculateNodeNumbersHelper(_node2.startId, currentActivityNumber, currentStepNumber, branchLetterCode);
            } else {
              /*
               * this activity doesn't have a start step so we will
               * look for a transition
               */

              if (_node2 != null && _node2.transitionLogic != null && _node2.transitionLogic.transitions != null && _node2.transitionLogic.transitions.length > 0) {
                var _iteratorNormalCompletion141 = true;
                var _didIteratorError141 = false;
                var _iteratorError141 = undefined;

                try {
                  for (var _iterator141 = _node2.transitionLogic.transitions[Symbol.iterator](), _step141; !(_iteratorNormalCompletion141 = (_step141 = _iterator141.next()).done); _iteratorNormalCompletion141 = true) {
                    var _transition5 = _step141.value;

                    if (_transition5 != null) {
                      /*
                       * calculate the node number for the next group
                       * and all its children steps
                       */
                      this.calculateNodeNumbersHelper(_transition5.to, currentActivityNumber, currentStepNumber, branchLetterCode);
                    }
                  }
                } catch (err) {
                  _didIteratorError141 = true;
                  _iteratorError141 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion141 && _iterator141.return) {
                      _iterator141.return();
                    }
                  } finally {
                    if (_didIteratorError141) {
                      throw _iteratorError141;
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
     * Get script for this project
     */

  }, {
    key: 'getProjectScript',
    value: function getProjectScript() {
      return this.project.script;
    }

    /**
     * Get the next node
     * @param nodeId get the node id that comes after this one
     * @return the node id that comes after
     */

  }, {
    key: 'getNextNodeId',
    value: function getNextNodeId(nodeId) {
      var flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
      if (flattenedNodeIds != null) {
        var indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
        if (indexOfNodeId != -1) {
          var indexOfNextNodeId = indexOfNodeId + 1;
          return flattenedNodeIds[indexOfNextNodeId];
        }
      }
      return null;
    }

    /**
     * Get all the achievements object in the project. The achievements object
     * contains the isEnabled field and an array of items.
     * @return the achievement object
     */

  }, {
    key: 'getAchievements',
    value: function getAchievements() {
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

  }, {
    key: 'getAchievementItems',
    value: function getAchievementItems() {
      var achievements = this.getAchievements();
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

  }, {
    key: 'getAchievementByAchievementId',
    value: function getAchievementByAchievementId(achievementId) {
      if (achievementId != null) {
        var achievements = this.getAchievements();
        if (achievements != null) {
          var achievementItems = achievements.items;
          if (achievementItems != null) {
            var _iteratorNormalCompletion142 = true;
            var _didIteratorError142 = false;
            var _iteratorError142 = undefined;

            try {
              for (var _iterator142 = achievementItems[Symbol.iterator](), _step142; !(_iteratorNormalCompletion142 = (_step142 = _iterator142.next()).done); _iteratorNormalCompletion142 = true) {
                var achievement = _step142.value;

                if (achievement != null && achievement.id == achievementId) {
                  return achievement;
                }
              }
            } catch (err) {
              _didIteratorError142 = true;
              _iteratorError142 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion142 && _iterator142.return) {
                  _iterator142.return();
                }
              } finally {
                if (_didIteratorError142) {
                  throw _iteratorError142;
                }
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

  }, {
    key: 'getNumberOfRubricsByNodeId',
    value: function getNumberOfRubricsByNodeId(nodeId) {
      var n = 0;
      var nodeContent = this.getNodeContentByNodeId(nodeId);
      if (nodeContent) {
        var nodeRubric = nodeContent.rubric;
        if (nodeRubric != null && nodeRubric != '') {
          n++;
        }

        var components = nodeContent.components;
        if (components && components.length) {
          var _iteratorNormalCompletion143 = true;
          var _didIteratorError143 = false;
          var _iteratorError143 = undefined;

          try {
            for (var _iterator143 = components[Symbol.iterator](), _step143; !(_iteratorNormalCompletion143 = (_step143 = _iterator143.next()).done); _iteratorNormalCompletion143 = true) {
              var component = _step143.value;

              if (component) {
                var componentRubric = component.rubric;
                if (componentRubric != null && componentRubric != '') {
                  n++;
                }
              }
            }
          } catch (err) {
            _didIteratorError143 = true;
            _iteratorError143 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion143 && _iterator143.return) {
                _iterator143.return();
              }
            } finally {
              if (_didIteratorError143) {
                throw _iteratorError143;
              }
            }
          }
        }
      }
      return n;
    }

    /**
     * Remember the result for whether the node is affected by the constraint
     * @param nodeId the node id
     * @param constraintId the constraint id
     * @param whether the node is affected by the constraint
     */

  }, {
    key: 'setIsNodeAffectedByConstraintResult',
    value: function setIsNodeAffectedByConstraintResult(nodeId, constraintId, result) {
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

  }, {
    key: 'getIsNodeAffectedByConstraintResult',
    value: function getIsNodeAffectedByConstraintResult(nodeId, constraintId) {
      return this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId];
    }

    /**
     * Get the id to node mappings.
     * @return An object the keys as node ids and the values as nodes.
     */

  }, {
    key: 'getIdToNode',
    value: function getIdToNode() {
      return this.idToNode;
    }

    /**
     * Check if a node has rubrics.
     * @param nodeId The node id of the node.
     * @return Whether the node has rubrics authored on it.
     */

  }, {
    key: 'nodeHasRubric',
    value: function nodeHasRubric(nodeId) {
      var numberOfRubrics = this.getNumberOfRubricsByNodeId(nodeId);
      if (numberOfRubrics > 0) {
        return true;
      }
      return false;
    }
  }, {
    key: 'getSpaces',
    value: function getSpaces() {
      if (this.project.spaces != null) {
        return this.project.spaces;
      } else {
        return [];
      }
    }
  }, {
    key: 'addSpace',
    value: function addSpace(space) {
      if (this.project.spaces == null) {
        this.project.spaces = [];
      }
      if (!this.isSpaceExists(space.id)) {
        this.project.spaces.push(space);
        this.saveProject();
      }
    }
  }, {
    key: 'isSpaceExists',
    value: function isSpaceExists(id) {
      var spaces = this.getSpaces();
      var _iteratorNormalCompletion144 = true;
      var _didIteratorError144 = false;
      var _iteratorError144 = undefined;

      try {
        for (var _iterator144 = spaces[Symbol.iterator](), _step144; !(_iteratorNormalCompletion144 = (_step144 = _iterator144.next()).done); _iteratorNormalCompletion144 = true) {
          var space = _step144.value;

          if (space.id === id) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError144 = true;
        _iteratorError144 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion144 && _iterator144.return) {
            _iterator144.return();
          }
        } finally {
          if (_didIteratorError144) {
            throw _iteratorError144;
          }
        }
      }

      return false;
    }
  }, {
    key: 'removeSpace',
    value: function removeSpace(id) {
      var spaces = this.getSpaces();
      for (var s = 0; s < spaces.length; s++) {
        if (spaces[s].id == id) {
          spaces.splice(s, 1);
          this.saveProject();
          return;
        }
      }
    }
  }]);

  return ProjectService;
}();

ProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = ProjectService;
//# sourceMappingURL=projectService.js.map
