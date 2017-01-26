'use strict';

class WISELinkAuthoringController {

    constructor($rootScope,
                $stateParams,
                $mdDialog,
                ProjectService) {

        this.$rootScope = $rootScope;
        this.$stateParams = $stateParams;
        this.$mdDialog = $mdDialog;
        this.ProjectService = ProjectService;

        /*
         * get the node id and component id of the component that has opened
         * the WISE link authoring popup
         */
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
        this.wiseLinkType = 'link';
        this.wiseLinkText = '';
        this.wiseLinkClass = '';
    }

    /**
     * The node id changed
     */
    wiseLinkNodeIdChanged() {

        if (this.wiseLinkNodeId != null && this.wiseLinkNodeId != '') {

            // get the position of the step
            var position = this.getNodePositionById(this.wiseLinkNodeId);

            // get the title of the step
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
    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    };

    /**
     * Get the node title for a node
     * @param nodeId the node id
     * @returns the node title
     */
    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    };

    /**
     * Check if a node id is for a group
     * @param nodeId
     * @returns whether the node is a group node
     */
    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    };

    /**
     * Fire an event to create the WISE Link. Listeners will be the ones that
     * actually create the WISE Link. The event that is fired will provide
     * the parameters for the WISE Link.
     */
    createWISELink() {

        if (this.wiseLinkNodeId == null || this.wiseLinkNodeId == '') {
            // a step was not chosen yet
            alert('You must select a step.');
        } else if (this.wiseLinkText == null || this.wiseLinkText == '') {
            // link text is empty and must be provided
            alert('You must enter text.');
        } else {
            // fire the event to notify listeners that a WISE Link should be created
            var params = {
                nodeId: this.nodeId,
                componentId: this.componentId,
                target: this.target,
                wiseLinkNodeId: this.wiseLinkNodeId,
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
    cancelWISELink() {
        // hide the dialog popup
        this.$mdDialog.hide();
    }
}

WISELinkAuthoringController.$inject = [
    '$rootScope',
    '$stateParams',
    '$mdDialog',
    'ProjectService'
]

export default WISELinkAuthoringController;
