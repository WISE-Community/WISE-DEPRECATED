'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PlanningService = function () {
  function PlanningService(ProjectService) {
    _classCallCheck(this, PlanningService);

    this.ProjectService = ProjectService;
  }

  _createClass(PlanningService, [{
    key: 'getPlanningNodes',
    value: function getPlanningNodes() {
      return this.ProjectService.project.planningNodes;
    }
  }, {
    key: 'isPlanning',


    /**
     * Check if a node is a planning node
     * @param nodeId the node id
     * @returns whether the node is a planning node
     */
    value: function isPlanning(nodeId) {
      var node = this.ProjectService.getNodeById(nodeId);
      return node != null && node.planning;
    }

    /**
     * Check if a node is a planning node instance
     * @param nodeId the node id
     * @returns whether the node is a planning node instance
     */

  }, {
    key: 'isPlanningInstance',
    value: function isPlanningInstance(nodeId) {
      var node = this.ProjectService.getNodeById(nodeId);
      return node != null && node.planningNodeTemplateId;
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
      var node = this.ProjectService.getNodeById(nodeId);
      if (node != null && node.availablePlanningNodes != null) {
        var availablePlanningNodes = node.availablePlanningNodes;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = availablePlanningNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var availablePlanningNode = _step.value;

            var availablePlanningNodeActual = this.ProjectService.getNodeById(availablePlanningNode.nodeId);
            if (availablePlanningNodeActual != null) {
              if (availablePlanningNode.max != null) {
                availablePlanningNodeActual.max = availablePlanningNode.max;
              }
              availablePlanningNodesSoFar.push(availablePlanningNodeActual);
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
      return availablePlanningNodesSoFar;
    }

    /**
     * Create a planning node instance and add it to the project
     * @param nodeId the node id of the planning node template
     * @param nextAvailablePlanningNodeId the node id of the planning node instance
     */

  }, {
    key: 'createPlanningNodeInstance',
    value: function createPlanningNodeInstance(nodeId, nextAvailablePlanningNodeId) {
      var planningNodeInstance = this.ProjectService.copyNode(nodeId);
      planningNodeInstance.planningNodeTemplateId = nodeId;
      planningNodeInstance.id = nextAvailablePlanningNodeId;
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
      this.ProjectService.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
      this.ProjectService.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);
      this.ProjectService.addNode(planningNodeInstance);
      this.ProjectService.insertNodeInsideInTransitions(planningNodeInstanceNodeId, nodeIdToInsertInside);
      this.ProjectService.insertNodeInsideInGroups(planningNodeInstanceNodeId, nodeIdToInsertInside);
      this.ProjectService.recalculatePositionsInGroup(nodeIdToInsertInside);
      this.ProjectService.calculateNodeOrderOfProject();
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
      this.ProjectService.setIdToNode(planningNodeInstanceNodeId, planningNodeInstance);
      this.ProjectService.setIdToElement(planningNodeInstanceNodeId, planningNodeInstance);
      this.ProjectService.addNode(planningNodeInstance);
      this.ProjectService.insertNodeAfterInTransitions(planningNodeInstance, nodeIdToInsertAfter);
      this.ProjectService.insertNodeAfterInGroups(planningNodeInstanceNodeId, nodeIdToInsertAfter);
      var parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);
      this.ProjectService.recalculatePositionsInGroup(parentGroup.id);
      this.ProjectService.calculateNodeOrderOfProject();
    }

    /**
     * Move a planning node instance inside a group
     * @param nodeIdToMove the node to move
     * @param nodeIdToInsertInside the group to move the node into
     */

  }, {
    key: 'movePlanningNodeInstanceInside',
    value: function movePlanningNodeInstanceInside(nodeIdToMove, nodeIdToInsertInside) {
      this.ProjectService.moveNodesInside([nodeIdToMove], nodeIdToInsertInside);
      this.ProjectService.recalculatePositionsInGroup(nodeIdToInsertInside);
      this.ProjectService.calculateNodeOrderOfProject();
    }

    /**
     * Move a planning node instance after a node
     * @param nodeIdToMove the node to move
     * @param nodeIdToInsertAfter the other node to move the node after
     */

  }, {
    key: 'movePlanningNodeInstanceAfter',
    value: function movePlanningNodeInstanceAfter(nodeIdToMove, nodeIdToInsertAfter) {
      this.ProjectService.moveNodesAfter([nodeIdToMove], nodeIdToInsertAfter);
      var parentGroup = this.ProjectService.getParentGroup(nodeIdToInsertAfter);
      this.ProjectService.recalculatePositionsInGroup(parentGroup.id);
      this.ProjectService.calculateNodeOrderOfProject();
    }
  }]);

  return PlanningService;
}();

PlanningService.$inject = ['ProjectService'];

exports.default = PlanningService;
//# sourceMappingURL=planningService.js.map
