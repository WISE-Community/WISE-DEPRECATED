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
   * Returns a project template for new projects
   */


  _createClass(AuthoringToolProjectService, [{
    key: 'getNewProjectTemplate',
    value: function getNewProjectTemplate() {
      return {
        "nodes": [{
          "id": "group0",
          "type": "group",
          "title": "Master",
          "startId": "group1",
          "ids": ["group1"]
        }, {
          "id": "group1",
          "type": "group",
          "title": this.$translate('FIRST_ACTIVITY'),
          "startId": "",
          "ids": [],
          "icons": {
            "default": {
              "color": "#2196F3",
              "type": "font",
              "fontSet": "material-icons",
              "fontName": "info"
            }
          }
        }],
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
              "notes": [{
                "reportId": "finalReport",
                "title": this.$translate('FINAL_REPORT'),
                "description": this.$translate('REPORT_DESCRIPTION'),
                "prompt": this.$translate('REPORT_PROMPT'),
                "content": this.$translate('REPORT_CONTENT')
              }]
            }
          }
        },
        "inactiveNodes": []
      };
    }

    /**
     * Notifies others that the specified project is being authored
     * @param projectId id of the project
     */

  }, {
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

      var httpParams = {
        method: "POST",
        url: this.ConfigService.getConfigParam('notifyProjectBeginURL') + projectId
      };

      return this.$http(httpParams).then(function (result) {
        var otherAuthors = result.data;
        return otherAuthors;
      });
    }

    /**
     * Notifies others that the specified project is no longer being authored
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
        var httpParams = {
          method: 'POST',
          url: _this2.ConfigService.getConfigParam('notifyProjectEndURL') + projectId
        };
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
     * Copies the project with the specified id and returns
     * a new project id if the project is successfully copied
     */
    value: function copyProject(projectId) {
      var copyProjectURL = this.ConfigService.getConfigParam('copyProjectURL');
      if (copyProjectURL == null) {
        return null;
      }

      var httpParams = {
        method: 'POST',
        url: copyProjectURL + "/" + projectId,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: $.param({})
      };

      return this.$http(httpParams).then(function (result) {
        return result.data; // project Id
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
    value: function registerNewProject(projectJSONString) {
      var commitMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      var registerNewProjectURL = this.ConfigService.getConfigParam('registerNewProjectURL');
      if (registerNewProjectURL == null) {
        return null;
      }

      try {
        JSON.parse(projectJSONString);
      } catch (e) {
        throw new Error("Invalid projectJSONString.");
      }

      var httpParams = {
        method: 'POST',
        url: registerNewProjectURL,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: $.param({
          commitMessage: commitMessage,
          projectJSONString: projectJSONString
        })
      };

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
      };
    }
  }, {
    key: 'createNode',


    /**
     * Create a new node
     * @param title the title of the node
     * @returns the node object
     */
    value: function createNode(title) {
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
      };
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

      var httpParams = {
        method: 'POST',
        url: this.ConfigService.getConfigParam('importStepsURL'),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

  }, {
    key: 'createNodeAfter',
    value: function createNodeAfter(node, nodeId) {
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

    /**
     * Check if a node is inactive. At the moment only step nodes can be
     * inactive.
     * @param nodeId the node id of the step
     */

  }, {
    key: 'isInactive',
    value: function isInactive(nodeId) {
      if (nodeId != null && this.project.inactiveNodes != null) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.project.inactiveNodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var inactiveNode = _step6.value;

            if (inactiveNode != null) {
              if (nodeId === inactiveNode.id) {
                return true;
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
      return false;
    }

    /**
     * Check if a node id is already being used in the project
     * @param nodeId check if this node id is already being used in the project
     * @return whether the node id is already being used in the project
     */

  }, {
    key: 'isNodeIdUsed',
    value: function isNodeIdUsed(nodeId) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.project.nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var node = _step7.value;

          if (node != null) {
            if (nodeId === node.id) {
              return true;
            }
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

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.project.inactiveNodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _node = _step8.value;

          if (_node != null) {
            if (nodeId === _node.id) {
              return true;
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

      return false;
    }

    /**
     * Set a field in the transition logic of a node
     */

  }, {
    key: 'setTransitionLogicField',
    value: function setTransitionLogicField(nodeId, field, value) {
      if (nodeId != null && field != null) {
        var node = this.getNodeById(nodeId);
        if (node != null) {
          var transitionLogic = node.transitionLogic;
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

  }, {
    key: 'setTransition',
    value: function setTransition(fromNodeId, toNodeId) {
      var node = this.getNodeById(fromNodeId);
      if (node != null) {
        var transitionLogic = node.transitionLogic;
        if (transitionLogic != null) {
          var transitions = transitionLogic.transitions;
          if (transitions == null || transitions.length == 0) {
            transitionLogic.transitions = [];
            var transition = {};
            transitionLogic.transitions.push(transition);
            transitions = transitionLogic.transitions;
          }

          if (transitions != null && transitions.length > 0) {
            // get the first transition. we will assume there is only one transition.
            var _transition = transitions[0];
            if (_transition != null) {
              _transition.to = toNodeId;
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

  }, {
    key: 'getNodeIdAfter',
    value: function getNodeIdAfter(nodeId) {
      var nodeIdAfter = null;

      // get an array of ordered items. each item represents a node
      var orderedItems = this.$filter('orderBy')(this.$filter('toArray')(this.idToOrder), 'order');

      if (orderedItems != null) {
        var foundNodeId = false;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = orderedItems[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var item = _step9.value;

            if (item != null) {
              var tempNodeId = item.$key;

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
      return nodeIdAfter;
    }

    /**
     * Add branch path taken constraints to the node
     * @param targetNodeId the node to add the constraints to
     * @param fromNodeId the from node id of the branch path taken constraint
     * @param toNodeId the to node id of the branch path taken constraint
     */

  }, {
    key: 'addBranchPathTakenConstraints',
    value: function addBranchPathTakenConstraints(targetNodeId, fromNodeId, toNodeId) {
      if (targetNodeId != null) {
        var node = this.getNodeById(targetNodeId);
        if (node != null) {
          /*
           * create the constraint that makes the node not visible until
           * the given branch path is taken
           */
          var makeThisNodeNotVisibleConstraint = {
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
          var makeThisNodeNotVisitableConstraint = {
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

  }, {
    key: 'setProjectRubric',
    value: function setProjectRubric(html) {
      this.project.rubric = html;
    }

    /**
     * Get the number of branch paths. This is assuming the node is a branch point.
     * @param nodeId The node id of the branch point node.
     * @return The number of branch paths for this branch point.
     */

  }, {
    key: 'getNumberOfBranchPaths',
    value: function getNumberOfBranchPaths(nodeId) {
      var transitions = this.getTransitionsByFromNodeId(nodeId);
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

  }, {
    key: 'getBranchCriteriaDescription',
    value: function getBranchCriteriaDescription(nodeId) {
      var transitionLogic = this.getTransitionLogicByFromNodeId(nodeId);
      var transitions = transitionLogic.transitions;

      // Loop through the transitions to try to find a transition criteria
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = transitions[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var transition = _step10.value;

          if (transition.criteria != null && transition.criteria.length > 0) {
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
              for (var _iterator11 = transition.criteria[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                var singleCriteria = _step11.value;

                if (singleCriteria.name == 'choiceChosen') {
                  return 'multiple choice';
                } else if (singleCriteria.name == 'score') {
                  return 'score';
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
        }

        /*
         * None of the transitions had a specific criteria so the branching is just
         * based on the howToChooseAmongAvailablePaths field.
         */
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

  }, {
    key: 'getPreviousNodeId',
    value: function getPreviousNodeId(nodeId) {
      var flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
      if (flattenedNodeIds != null) {
        var indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
        if (indexOfNodeId != -1) {
          var indexOfPreviousNodeId = indexOfNodeId - 1;
          return flattenedNodeIds[indexOfPreviousNodeId];
        }
      }
      return null;
    }

    /**
     * Set the project script filename
     * @param script the script filename
     */

  }, {
    key: 'setProjectScriptFilename',
    value: function setProjectScriptFilename(scriptFilename) {
      this.project.script = scriptFilename;
    }

    /**
     * Get the project script filename
     */

  }, {
    key: 'getProjectScriptFilename',
    value: function getProjectScriptFilename() {
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

  }, {
    key: 'nodeHasRubric',
    value: function nodeHasRubric(nodeId) {
      var numberOfRubrics = this.getNumberOfRubricsByNodeId(nodeId);
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

  }, {
    key: 'copyComponentAndInsert',
    value: function copyComponentAndInsert(nodeId, componentIds, insertAfterComponentId) {
      var node = this.getNodeById(nodeId);
      var newComponents = [];
      var newComponentIds = [];
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = componentIds[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var componentId = _step12.value;

          var _newComponent = this.copyComponent(nodeId, componentId, newComponentIds);
          newComponents.push(_newComponent);
          newComponentIds.push(_newComponent.id);
        }
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

      var components = node.components;
      if (components != null) {
        var insertPosition = 0;
        if (insertAfterComponentId == null) {
          // place the new components at the beginning
          insertPosition = 0;
        } else {
          // place the new components after the specified component id
          insertPosition = this.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
        }

        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = newComponents[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var newComponent = _step13.value;

            components.splice(insertPosition, 0, newComponent);

            /*
             * increment the insert position for cases when we have multiple
             * new components
             */
            insertPosition += 1;
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

  }, {
    key: 'copyComponent',
    value: function copyComponent(nodeId, componentId, componentIdsToSkip) {
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      var newComponent = this.UtilService.makeCopyOfJSONObject(component);
      var newComponentId = this.getUnusedComponentId(componentIdsToSkip);
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

  }, {
    key: 'importComponents',
    value: function importComponents(components, importProjectId, nodeId, insertAfterComponentId) {
      var _this4 = this;

      var newComponents = [];
      var newComponentIds = [];

      /*
       * loop through all the components and make sure their ids are not
       * already used in the project
       */
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = components[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var component = _step14.value;

          if (component != null) {
            var newComponent = this.UtilService.makeCopyOfJSONObject(component);
            var newComponentId = newComponent.id;

            if (this.isComponentIdUsed(newComponentId)) {
              // component id is already used so we will find a new component id
              newComponentId = this.getUnusedComponentId(newComponentIds);
              newComponent.id = newComponentId;
            }

            newComponents.push(newComponent);
            newComponentIds.push(newComponentId);
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

      var httpParams = {
        method: 'POST',
        url: this.ConfigService.getConfigParam('importStepsURL'),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: $.param({
          steps: angular.toJson(newComponents),
          fromProjectId: importProjectId,
          toProjectId: this.ConfigService.getConfigParam('projectId')
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
      return this.$http(httpParams).then(function (result) {
        newComponents = result.data;
        var node = _this4.getNodeById(nodeId);
        var currentComponents = node.components;
        var insertPosition = 0;

        if (insertAfterComponentId == null) {
          // place the new components at the beginning
          insertPosition = 0;
        } else {
          // place the new components after the specified component id
          insertPosition = _this4.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
        }

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = newComponents[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var newComponent = _step15.value;

            // insert the new component
            currentComponents.splice(insertPosition, 0, newComponent);

            /*
             * increment the insert position for cases when we have multiple
             * new components
             */
            insertPosition += 1;
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

        return newComponents;
      });
    }

    /**
     * Get the branch path letter
     * @param nodeId get the branch path letter for this node if it is in a
     * branch
     * @return the branch path letter for the node if it is in a branch
     */

  }, {
    key: 'getBranchPathLetter',
    value: function getBranchPathLetter(nodeId) {
      return this.nodeIdToBranchPathLetter[nodeId];
    }

    /**
     * Set the node into the project by replacing the existing node with the
     * given node id
     * @param nodeId the node id of the node
     * @param node the node object
     */

  }, {
    key: 'setNode',
    value: function setNode(nodeId, node) {
      if (nodeId != null && node != null) {
        for (var n = 0; n < this.project.nodes.length; n++) {
          var tempNode = this.project.nodes[n];
          if (tempNode != null && tempNode.id == nodeId) {
            this.project.nodes[n] = node;
          }
        }

        for (var i = 0; i < this.project.inactiveNodes.length; i++) {
          var _tempNode = this.project.inactiveNodes[i];
          if (_tempNode != null && _tempNode.id == nodeId) {
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

  }, {
    key: 'getIdToNode',
    value: function getIdToNode() {
      return this.idToNode;
    }

    /**
     * Turn on the save button in all the components in the step
     * @param node the node
     */

  }, {
    key: 'turnOnSaveButtonForAllComponents',
    value: function turnOnSaveButtonForAllComponents(node) {
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = node.components[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var component = _step16.value;

          var service = this.$injector.get(component.type + 'Service');
          if (service.componentUsesSaveButton()) {
            component.showSaveButton = true;
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
    }

    /**
     * Turn off the submit button in all the components in the step
     * @param node the node
     */

  }, {
    key: 'turnOffSaveButtonForAllComponents',
    value: function turnOffSaveButtonForAllComponents(node) {
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = node.components[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var component = _step17.value;

          var service = this.$injector.get(component.type + 'Service');
          if (service.componentUsesSaveButton()) {
            component.showSaveButton = false;
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

    /**
     * Remove the node from the active nodes.
     * If the node is a group node, also remove its children.
     * @param nodeId the node to remove
     * @returns the node that was removed
     */

  }, {
    key: 'removeNodeFromActiveNodes',
    value: function removeNodeFromActiveNodes(nodeId) {
      var nodeRemoved = null;
      var activeNodes = this.project.nodes;
      for (var a = 0; a < activeNodes.length; a++) {
        var activeNode = activeNodes[a];
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

  }, {
    key: 'removeChildNodesFromActiveNodes',
    value: function removeChildNodesFromActiveNodes(node) {
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = node.ids[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var childId = _step18.value;

          this.removeNodeFromActiveNodes(childId);
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

    /**
     * Move an active node to the inactive nodes array.
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */

  }, {
    key: 'moveToInactive',
    value: function moveToInactive(node, nodeIdToInsertAfter) {
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

  }, {
    key: 'addInactiveNodeInsertAfter',
    value: function addInactiveNodeInsertAfter(node, nodeIdToInsertAfter) {
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
  }, {
    key: 'clearTransitionsFromNode',
    value: function clearTransitionsFromNode(node) {
      if (node.transitionLogic != null) {
        node.transitionLogic.transitions = [];
      }
    }
  }, {
    key: 'insertNodeAtBeginningOfInactiveNodes',
    value: function insertNodeAtBeginningOfInactiveNodes(node) {
      this.project.inactiveNodes.splice(0, 0, node);
    }
  }, {
    key: 'insertNodeAfterInactiveNode',
    value: function insertNodeAfterInactiveNode(node, nodeIdToInsertAfter) {
      var inactiveNodes = this.getInactiveNodes();
      for (var i = 0; i < inactiveNodes.length; i++) {
        if (inactiveNodes[i].id === nodeIdToInsertAfter) {
          var parentGroup = this.getParentGroup(nodeIdToInsertAfter);
          if (parentGroup != null) {
            this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
            this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
          }
          inactiveNodes.splice(i + 1, 0, node);
        }
      }
    }
  }, {
    key: 'isNodeIdToInsertTargetNotSpecified',
    value: function isNodeIdToInsertTargetNotSpecified(nodeIdToInsertTarget) {
      return nodeIdToInsertTarget == null || nodeIdToInsertTarget === 'inactiveNodes' || nodeIdToInsertTarget === 'inactiveSteps' || nodeIdToInsertTarget === 'inactiveGroups';
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
        var _iteratorNormalCompletion19 = true;
        var _didIteratorError19 = false;
        var _iteratorError19 = undefined;

        try {
          for (var _iterator19 = childIds[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var childId = _step19.value;

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

      // add the node to the inactive array
      this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
    }

    /**
     * Add the node to the inactive nodes array.
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */

  }, {
    key: 'addInactiveNodeInsertInside',
    value: function addInactiveNodeInsertInside(node, nodeIdToInsertInside) {
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
  }, {
    key: 'insertNodeInsideInactiveNode',
    value: function insertNodeInsideInactiveNode(node, nodeIdToInsertInside) {
      var inactiveNodes = this.getInactiveNodes();
      var inactiveGroupNodes = this.getInactiveGroupNodes();
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = inactiveGroupNodes[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var inactiveGroup = _step20.value;

          if (nodeIdToInsertInside == inactiveGroup.id) {
            this.insertNodeInsideOnlyUpdateTransitions(node.id, nodeIdToInsertInside);
            this.insertNodeInsideInGroups(node.id, nodeIdToInsertInside);
            for (var i = 0; i < inactiveNodes.length; i++) {
              if (inactiveNodes[i].id == nodeIdToInsertInside) {
                inactiveNodes.splice(i + 1, 0, node);
              }
            }
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
    }

    /**
      * Move an inactive node within the inactive nodes array.
      * @param node The node to move.
      * @param nodeIdToInsertAfter Place the node after this.
      */

  }, {
    key: 'moveInactiveNodeToInactiveSection',
    value: function moveInactiveNodeToInactiveSection(node, nodeIdToInsertAfter) {
      this.removeNodeFromInactiveNodes(node.id);
      this.addInactiveNodeInsertAfter(node, nodeIdToInsertAfter);
    }

    /**
     * Update a node's branchPathTaken constraint's fromNodeId and toNodeId
     * @param node update the branch path taken constraints in this node
     * @param currentFromNodeId the current from node id
     * @param currentToNodeId the current to node id
     * @param newFromNodeId the new from node id
     * @param newToNodeId the new to node id
     */

  }, {
    key: 'updateBranchPathTakenConstraint',
    value: function updateBranchPathTakenConstraint(node, currentFromNodeId, currentToNodeId, newFromNodeId, newToNodeId) {
      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = node.constraints[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var constraint = _step21.value;
          var _iteratorNormalCompletion22 = true;
          var _didIteratorError22 = false;
          var _iteratorError22 = undefined;

          try {
            for (var _iterator22 = constraint.removalCriteria[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
              var removalCriterion = _step22.value;

              if (removalCriterion.name === 'branchPathTaken') {
                var params = removalCriterion.params;
                if (params.fromNodeId === currentFromNodeId && params.toNodeId === currentToNodeId) {
                  params.fromNodeId = newFromNodeId;
                  params.toNodeId = newToNodeId;
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
  }]);

  return AuthoringToolProjectService;
}(_projectService2.default);

AuthoringToolProjectService.$inject = ['$filter', '$http', '$injector', '$q', '$rootScope', 'ConfigService', 'UtilService'];

exports.default = AuthoringToolProjectService;
//# sourceMappingURL=authoringToolProjectService.js.map
