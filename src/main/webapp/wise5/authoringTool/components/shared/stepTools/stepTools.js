"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StepToolsController = function () {
  function StepToolsController($scope, $state, ConfigService, NodeService, ProjectService, TeacherDataService, $mdSidenav) {
    var _this = this;

    _classCallCheck(this, StepToolsController);

    this.$scope = $scope;
    this.$state = $state;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.ProjectService = ProjectService;
    this.TeacherDataService = TeacherDataService;
    this.projectId = this.ConfigService.getProjectId();

    // set the current node to be selected in the drop down
    this.nodeId = this.TeacherDataService.getCurrentNodeId();

    // service objects and utility functions
    this.idToOrder = this.ProjectService.idToOrder;

    // update the current node id, previous node id, and next node id
    this.updateModel();

    this.$scope.$on('currentNodeChanged', function (event, args) {
      /*
       * the current node has changed so we will update the
       * current node id, previous node id, and next node id
       */
      _this.updateModel();
    });

    this.$scope.$on('projectChanged', function (event, args) {
      /*
       * the project has changed most likely because the author has
       * added, deleted, or moved a step
       */

      // update the idToOrder mappings
      _this.idToOrder = _this.ProjectService.idToOrder;

      // update the current node id, previous node id, and next node id
      _this.updateModel();
    });
  }

  /**
   * The user has selected a new node
   */


  _createClass(StepToolsController, [{
    key: 'nodeIdChanged',
    value: function nodeIdChanged() {
      // remember the new current node
      this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);

      // go to the authoring view for the node
      this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
    }

    /**
     * update the current node id, previous node id, and next node id
     */

  }, {
    key: 'updateModel',
    value: function updateModel() {
      var _this2 = this;

      var currentNodeId = this.TeacherDataService.getCurrentNodeId();

      // set the current node to be selected in the drop down
      this.nodeId = currentNodeId;

      if (currentNodeId == null) {
        // the node id is null which means we are at the project level

        // set the previous and next node ids to null
        this.prevId = null;
        this.nextId = null;
      } else {
        /*
         * the node id is not null which means the current node is a group
         * or node
         */
        if (!this.ProjectService.isGroupNode(currentNodeId)) {
          // the node is a step

          // set the previous node id
          this.prevId = this.NodeService.getPrevNodeId(this.nodeId);

          // set the next node id
          this.nextId = null;
          this.NodeService.getNextNodeId(this.nodeId).then(function (currentNodeId) {
            _this2.nextId = currentNodeId;
          });
        }
      }
    }

    /*
     * Get the text for the selected node
     */

  }, {
    key: 'getSelectedText',
    value: function getSelectedText() {
      // default to show this text if this.nodeId is null
      var text = 'Select a step';
      if (this.nodeId != null) {
        // get the step number and title
        text = this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId);
      }
      return text;
    }

    /**
     * Get the step number and title
     * @param nodeId the node id
     * @return the step number and title
     * example
     * "1.4: Explore photosynthesis"
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }

    /**
     * Check if a node is a group node
     * @param nodeId the node id
     * @return whether a node is a group node
     */

  }, {
    key: 'isGroupNode',
    value: function isGroupNode(nodeId) {
      return this.ProjectService.isGroupNode(nodeId);
    }

    /**
     * Go to the previous node
     */

  }, {
    key: 'goToPrevNode',
    value: function goToPrevNode() {
      /*
       * Tell the NodeService to go to the previous node. This will set
       * the new current node id into the TeacherDataService.
       */
      this.NodeService.goToPrevNode();

      // set the current node to be selected in the drop down
      this.nodeId = this.TeacherDataService.getCurrentNodeId();

      // go to the authoring view for the node
      this.$state.go('root.project.node', { projectId: this.projectId, nodeId: this.nodeId });
    }

    /**
     * Go to the next node
     */

  }, {
    key: 'goToNextNode',
    value: function goToNextNode() {
      var _this3 = this;

      /*
       * Tell the NodeService to get the next node. This will return a promise
       * that will return the next node id.
       */
      this.NodeService.goToNextNode().then(function (nodeId) {
        // set the current node to be selected in the drop down
        _this3.nodeId = nodeId;

        // go to the authoring view for the node
        _this3.$state.go('root.project.node', { projectId: _this3.projectId, nodeId: _this3.nodeId });
      });
    }
  }]);

  return StepToolsController;
}();

StepToolsController.$inject = ['$scope', '$state', 'ConfigService', 'NodeService', 'ProjectService', 'TeacherDataService', '$mdSidenav'];

var StepTools = {
  bindings: {
    showPosition: '<'
  },
  template: '<div layout="row" layout-align="center center">\n      <node-icon node-id="$ctrl.nodeId" size="18"></node-icon>\n      <md-select id="stepSelectMenu" md-theme="default" class="node-select md-subhead"\n             aria-label="{{ \'selectAStep\' | translate }}"\n             ng-model="$ctrl.nodeId"\n             ng-change="$ctrl.nodeIdChanged()"\n             md-selected-text="$ctrl.getSelectedText()">\n        <md-option ng-repeat="item in $ctrl.idToOrder | toArray | orderBy : \'order\'"\n               ng-if="item.order !== 0"\n               value="{{ item.$key }}"\n               ng-class="{\'node-select-option--node\': !$ctrl.isGroupNode(item.$key)}">\n          <div layout="row" layout-align="start center">\n            <node-icon node-id="item.$key" size="18" custom-class="\'node-select__icon\'"></node-icon>\n            <span class="node-select__text">{{ $ctrl.getNodePositionAndTitleByNodeId(item.$key) }}</span>\n          </div>\n        </md-option>\n      </md-select>\n      <span flex></span>\n      <md-button aria-label="{{\'previousStep\' | translate }}" class="md-icon-button node-nav"\n             ng-disabled="!$ctrl.prevId" ng-click="$ctrl.goToPrevNode()">\n        <md-icon> arrow_back </md-icon>\n      </md-button>\n      <md-button aria-label="{{ \'nextStep\' | translate }}" class="md-icon-button node-nav"\n             ng-disabled="!$ctrl.nextId" ng-click="$ctrl.goToNextNode()" style="margin-right: 15px">\n        <md-icon> arrow_forward </md-icon>\n      </md-button>\n    </div>',
  controller: StepToolsController
};

exports.default = StepTools;
//# sourceMappingURL=stepTools.js.map
