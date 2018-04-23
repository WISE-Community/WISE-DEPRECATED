'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _projectService = require('../services/projectService');

var _projectService2 = _interopRequireDefault(_projectService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AuthoringToolProjectService = function (_ProjectService) {
  _inherits(AuthoringToolProjectService, _ProjectService);

  function AuthoringToolProjectService($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    _classCallCheck(this, AuthoringToolProjectService);

    return _possibleConstructorReturn(this, (AuthoringToolProjectService.__proto__ || Object.getPrototypeOf(AuthoringToolProjectService)).call(this, $filter, $http, $injector, $q, $rootScope, ConfigService, UtilService));
  }

  /**
   * Notifies others that the specified project is being authored
   * @param projectId id of the project
   */


  _createClass(AuthoringToolProjectService, [{
    key: 'notifyAuthorProjectBegin',
    value: function notifyAuthorProjectBegin() {
      var projectId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (projectId == null) {
        if (this.project != null) {
          projectId = this.project.id;
        } else {
          return;
        }
      }
      var notifyProjectBeginURL = this.ConfigService.getConfigParam('notifyProjectBeginURL') + projectId;
      var httpParams = {
        method: "POST",
        url: notifyProjectBeginURL
      };

      return this.$http(httpParams).then(function (result) {
        var otherAuthors = result.data;
        return otherAuthors;
      });
    }

    /**
     * Notifies others that the specified project is being authored
     * @param projectId id of the project
     */

  }, {
    key: 'notifyAuthorProjectEnd',
    value: function notifyAuthorProjectEnd() {
      var _this2 = this;

      var projectId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      return this.$q(function (resolve, reject) {
        if (projectId == null) {
          if (_this2.project != null) {
            projectId = _this2.ConfigService.getProjectId();
          } else {
            resolve();
          }
        }
        var notifyProjectEndURL = _this2.ConfigService.getConfigParam('notifyProjectEndURL') + projectId;
        var httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = notifyProjectEndURL;

        _this2.$http(httpParams).then(function () {
          resolve();
        });
      });
    }

    /**
     * Returns all possible transition criteria for the specified node and component.
     */

  }, {
    key: 'getPossibleTransitionCriteria',
    value: function getPossibleTransitionCriteria(nodeId, componentId) {
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        var componentType = component.type;
        var componentService = this.$injector.get(componentType + 'Service');
        if (componentService.getPossibleTransitionCriteria) {
          return componentService.getPossibleTransitionCriteria(nodeId, componentId, component);
        } else {
          return [];
        }
      } else {
        return [];
      }
    }
  }, {
    key: 'copyProject',


    /**
     * Copies the project with the specified id and returns a new project id if the project is
     * successfully copied
     */
    value: function copyProject(projectId) {
      var copyProjectURL = this.ConfigService.getConfigParam('copyProjectURL');
      if (copyProjectURL == null) {
        return null;
      }

      var httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = copyProjectURL + "/" + projectId;
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      var params = {};
      httpParams.data = $.param(params);

      return this.$http(httpParams).then(function (result) {
        var projectId = result.data;
        return projectId;
      });
    }
  }, {
    key: 'registerNewProject',


    /**
     * Registers a new project having the projectJSON content with the server.
     * Returns a new project Id if the project is successfully registered.
     * Returns null if Config.registerNewProjectURL is undefined.
     * Throws an error if projectJSONString is invalid JSON string
     */
    value: function registerNewProject(projectJSONString, commitMessage) {
      var registerNewProjectURL = this.ConfigService.getConfigParam('registerNewProjectURL');
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

      var httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = registerNewProjectURL;
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      var params = {};
      params.commitMessage = commitMessage;
      params.projectJSONString = projectJSONString;
      httpParams.data = $.param(params);

      return this.$http(httpParams).then(function (result) {
        var projectId = result.data;
        return projectId;
      });
    }
  }, {
    key: 'getCommitHistory',


    /**
     * Retrieves and returns the project's commit history.
     */
    value: function getCommitHistory() {
      var commitProjectURL = this.ConfigService.getConfigParam('commitProjectURL');
      return this.$http({
        url: commitProjectURL,
        method: 'GET'
      }).then(function (result) {
        return result.data;
      });
    }
  }, {
    key: 'replaceComponent',


    /**
     * Replace a component
     * @param nodeId the node id
     * @param componentId the component id
     * @param component the new component
     */
    value: function replaceComponent(nodeId, componentId, component) {
      if (nodeId != null && componentId != null && component != null) {
        var components = this.getComponentsByNodeId(nodeId);
        if (components != null) {
          for (var c = 0; c < components.length; c++) {
            var tempComponent = components[c];
            if (tempComponent != null) {
              if (tempComponent.id === componentId) {
                components[c] = component;
                break;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'createGroup',


    /**
     * Create a new group
     * @param title the title of the group
     * @returns the group object
     */
    value: function createGroup(title) {
      var newGroupId = this.getNextAvailableGroupId();
      var newGroup = {};
      newGroup.id = newGroupId;
      newGroup.type = 'group';
      newGroup.title = title;
      newGroup.startId = '';
      newGroup.ids = [];
      return newGroup;
    }
  }, {
    key: 'createNode',


    /**
     * Create a new node
     * @param title the title of the node
     * @returns the node object
     */
    value: function createNode(title) {
      var newNodeId = this.getNextAvailableNodeId();
      var newNode = {};
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
    }
  }, {
    key: 'copyNodesInside',


    /**
     * Copy nodes and put them after a certain node id
     * @param nodeIds the node ids to copy
     * @param nodeId the node id we will put the copied nodes after
     */
    value: function copyNodesInside(nodeIds, nodeId) {
      var newNodes = [];
      for (var n = 0; n < nodeIds.length; n++) {
        var nodeIdToCopy = nodeIds[n];
        var newNode = this.copyNode(nodeIdToCopy);
        var newNodeId = newNode.id;

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
        this.parseProject(); // refresh project and update references because a new node have been added.

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

  }, {
    key: 'copyNodes',
    value: function copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter) {
      var _this3 = this;

      var importStepsURL = this.ConfigService.getConfigParam('importStepsURL');

      var httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = importStepsURL;
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

      var params = {};
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
      return this.$http(httpParams).then(function (result) {
        selectedNodes = result.data;

        var inactiveNodes = _this3.getInactiveNodes();
        var newNodes = [];
        var newNodeIds = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = selectedNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var selectedNode = _step.value;

            if (selectedNode != null) {
              // make a copy of the node so that we don't modify the source
              var tempNode = _this3.UtilService.makeCopyOfJSONObject(selectedNode);

              // check if the node id is already being used in the current project
              if (_this3.isNodeIdUsed(tempNode.id)) {
                // the node id is already being used in the current project

                // get the next available node id
                var nextAvailableNodeId = _this3.getNextAvailableNodeId(newNodeIds);

                // change the node id of the node we are importing
                tempNode.id = nextAvailableNodeId;
              }

              // get the components in the node
              var tempComponents = tempNode.components;

              if (tempComponents != null) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = tempComponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var tempComponent = _step3.value;

                    if (tempComponent != null) {
                      if (_this3.isComponentIdUsed(tempComponent.id)) {
                        // we are already using the component id so we will need to change it

                        var newComponentId = _this3.getUnusedComponentId();
                        tempComponent.id = newComponentId;
                      }
                    }
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

              // clear the constraints
              tempNode.constraints = [];

              // add the new node and new node id to our arrays
              newNodes.push(tempNode);
              newNodeIds.push(tempNode.id);
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

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = newNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var newNode = _step2.value;

            if (_this3.isGroupNode(nodeIdToInsertInsideOrAfter)) {
              // we want to make the new step the first step in the given activity
              _this3.createNodeInside(newNode, nodeIdToInsertInsideOrAfter);
            } else {
              // we want to place the new step after the given step
              _this3.createNodeAfter(newNode, nodeIdToInsertInsideOrAfter);
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

        return newNodes;
      });
    }

    /**
     * Create a node inside the group
     * @param node the new node
     * @param nodeId the node id of the group to create the node in
     */

  }, {
    key: 'createNodeInside',
    value: function createNodeInside(node, nodeId) {
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

  }, {
    key: 'createNodeAfter',
    value: function createNodeAfter(node, nodeId) {
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

        var transitionsFromGroup = this.getTransitionsByFromNodeId(nodeId);
        if (transitionsFromGroup != null) {
          /*
           * loop through all the transitions that come out of the previous group
           * and get the node ids that the group transitions to
           */
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = transitionsFromGroup[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var transitionFromGroup = _step4.value;

              if (transitionFromGroup != null) {
                var toNodeId = transitionFromGroup.to;
                if (toNodeId != null) {
                  oldToGroupIds.push(toNodeId);
                }
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

        var fromGroupId = nodeId;
        // TODO geoffreykwan oldToGroupIds is declared here and above. Refactor
        var oldToGroupIds = oldToGroupIds;
        var newToGroupId = node.id;

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

  }, {
    key: 'copyNodesAfter',
    value: function copyNodesAfter(nodeIds, nodeId) {
      var newNodes = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = nodeIds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var nodeIdToCopy = _step5.value;

          var newNode = this.copyNode(nodeIdToCopy);
          var newNodeId = newNode.id;
          this.createNodeAfter(newNode, nodeId);

          // remember the node id so we can put the next node (if any) after this one
          nodeId = newNodeId;
          this.parseProject(); // refresh project and update references because a new node have been added.

          newNodes.push(newNode);
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

      return newNodes;
    }
  }]);

  return AuthoringToolProjectService;
}(_projectService2.default);

AuthoringToolProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = AuthoringToolProjectService;
//# sourceMappingURL=authoringToolProjectService.js.map
