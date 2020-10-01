"use strict";

class StepToolsCtrl {
    constructor($scope,
                NodeService,
                ProjectService,
                StudentDataService,
                $mdSidenav) {

        this.$scope = $scope;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.is_rtl = ($('html').attr('dir') == 'rtl');
        this.icons = { prev: 'chevron_left', next: 'chevron_right' };
        if (this.is_rtl) {
          this.icons = { prev: 'chevron_right', next: 'chevron_left' };
        }
        //this.$mdSidenav = $mdSidenav;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;

        // service objects and utility functions
        this.idToOrder = this.ProjectService.idToOrder;

        this.updateModel();

        this.currentNodeChangedSubscription = this.StudentDataService.currentNodeChanged$
                .subscribe(() => {
            this.updateModel();
        });

        this.nodeStatusesChangedSubscription = 
                this.StudentDataService.nodeStatusesChanged$.subscribe(() => {
            this.updateModel();
        });

        this.$scope.$on('$destroy', () => {
            this.ngOnDestroy();
        });
    }

    ngOnDestroy() {
        this.unsubscribeAll();
    }

    unsubscribeAll() {
        this.currentNodeChangedSubscription.unsubscribe();
        this.currentNodeChangedSubscription.unsubscribe();
    }

    /*toggleStepNav() {
        this.$mdSidenav('stepNav').toggle();
    }*/

    toNodeIdChanged() {
      if (!this.ProjectService.isGroupNode(this.toNodeId)) {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.toNodeId);
      }
    }

    updateModel() {
        var nodeId = this.StudentDataService.getCurrentNodeId();
        if (!this.ProjectService.isGroupNode(nodeId)) {
            this.nodeId = nodeId;
            this.nodeStatus = this.nodeStatuses[this.nodeId];

            this.prevId = this.NodeService.getPrevNodeId();
            this.nextId = null;
            this.NodeService.getNextNodeId().then((nodeId) => {
                this.nextId = nodeId;
            });

            // model variable for selected node id
            this.toNodeId = this.nodeId;
        }
    }

    getSelectedText() {
        return (this.showPosition ? this.getNodePositionById(this.nodeId) + ': ' : '') + this.getNodeTitleByNodeId(this.nodeId);
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/stepTools/stepTools.html';
    }

    getNodeTitleByNodeId(nodeId) {
        return this.ProjectService.getNodeTitleByNodeId(nodeId);
    }

    getNodePositionById(nodeId) {
        return this.ProjectService.getNodePositionById(nodeId);
    }

    isGroupNode(nodeId) {
        return this.ProjectService.isGroupNode(nodeId);
    }

    goToPrevNode() {
        this.NodeService.goToPrevNode();
    }

    goToNextNode() {
        this.NodeService.goToNextNode();
    }

    closeNode() {
        this.NodeService.closeNode();
    }
}

StepToolsCtrl.$inject = [
    '$scope',
    'NodeService',
    'ProjectService',
    'StudentDataService',
    '$mdSidenav'
];

export default StepToolsCtrl;
