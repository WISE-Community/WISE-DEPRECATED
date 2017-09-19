'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WISELinkAuthoringController = function () {
  function WISELinkAuthoringController($rootScope, $stateParams, $mdDialog, ProjectService) {
    _classCallCheck(this, WISELinkAuthoringController);

    this.$rootScope = $rootScope;
    this.$stateParams = $stateParams;
    this.$mdDialog = $mdDialog;
    this.ProjectService = ProjectService;

    /*
     * get the node id and component id of the component that has opened
     * the WISE link authoring popup
     */
    this.projectId = $stateParams.projectId;
    this.nodeId = $stateParams.nodeId;
    this.componentId = $stateParams.componentId;
    this.target = $stateParams.target;

    /*
     * get the mapping of node id to order which is used to display
     * the steps in the drop down
     */
    this.items = this.ProjectService.idToOrder;

    // the model fields for the WISE link authoring
    this.wiseLinkNodeId = '';
    this.wiseLinkComponentId = '';
    this.wiseLinkType = 'link';
    this.wiseLinkText = '';
    this.wiseLinkClass = '';
  }

  /**
   * The node id changed
   */


  _createClass(WISELinkAuthoringController, [{
    key: 'wiseLinkNodeIdChanged',
    value: function wiseLinkNodeIdChanged() {
      if (this.wiseLinkNodeId != null && this.wiseLinkNodeId != '') {
        // reset wiseLinkComonponentId
        this.wiseLinkComponentId = '';
        var position = this.getNodePositionById(this.wiseLinkNodeId);
        var title = this.getNodeTitleByNodeId(this.wiseLinkNodeId);

        // set the link text to display the position and title
        this.wiseLinkText = position + ': ' + title;
      }
    }

    /**
     * Get the node position for a node
     * @param nodeId the node id
     * @returns the node position
     */

  }, {
    key: 'getNodePositionById',
    value: function getNodePositionById(nodeId) {
      return this.ProjectService.getNodePositionById(nodeId);
    }

    /**
     * Get the node title for a node
     * @param nodeId the node id
     * @returns the node title
     */

  }, {
    key: 'getNodeTitleByNodeId',
    value: function getNodeTitleByNodeId(nodeId) {
      return this.ProjectService.getNodeTitleByNodeId(nodeId);
    }

    /**
     * Check if a node id is for a group
     * @param nodeId
     * @returns whether the node is a group node
     */

  }, {
    key: 'isGroupNode',
    value: function isGroupNode(nodeId) {
      return this.ProjectService.isGroupNode(nodeId);
    }

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */

  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      return this.ProjectService.getComponentsByNodeId(nodeId);
    }

    /**
     * Fire an event to create the WISE Link. Listeners will be the ones that
     * actually create the WISE Link. The event that is fired will provide
     * the parameters for the WISE Link.
     */

  }, {
    key: 'createWISELink',
    value: function createWISELink() {
      if (this.wiseLinkNodeId == null || this.wiseLinkNodeId == '') {
        // a step was not chosen yet
        alert('You must select a step.');
      } else if (this.wiseLinkText == null || this.wiseLinkText == '') {
        // link text is empty and must be provided
        alert('You must enter text.');
      } else {
        // fire the event to notify listeners that a WISE Link should be created
        var params = {
          projectId: this.projectId,
          nodeId: this.nodeId,
          componentId: this.componentId,
          target: this.target,
          wiseLinkNodeId: this.wiseLinkNodeId,
          wiseLinkComponentId: this.wiseLinkComponentId,
          wiseLinkType: this.wiseLinkType,
          wiseLinkText: this.wiseLinkText,
          wiseLinkClass: this.wiseLinkClass
        };
        this.$rootScope.$broadcast('createWISELink', params);
      }
    }

    /**
     * Cancel the WISE Link authoring
     */

  }, {
    key: 'cancelWISELink',
    value: function cancelWISELink() {
      this.$mdDialog.hide();
    }
  }]);

  return WISELinkAuthoringController;
}();

WISELinkAuthoringController.$inject = ['$rootScope', '$stateParams', '$mdDialog', 'ProjectService'];

exports.default = WISELinkAuthoringController;
//# sourceMappingURL=wiseLinkAuthoringController.js.map
