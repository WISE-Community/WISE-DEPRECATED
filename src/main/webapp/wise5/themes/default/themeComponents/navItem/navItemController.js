"use strict";

class NavItemController {
    constructor($filter,
                $rootScope,
                $scope,
                $element,
                dragulaService,
                NodeService,
                ProjectService,
                StudentDataService,
                $mdDialog) {
        this.$filter = $filter;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$element = $element;
        this.dragulaService = dragulaService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.$mdDialog = $mdDialog;
        this.$translate = this.$filter('translate');
        this.autoScroll = require('dom-autoscroller');
        this.expanded = false;
    }

    $onInit() {
        this.item = this.ProjectService.idToNode[this.nodeId];
        this.isGroup = this.ProjectService.isGroupNode(this.nodeId);
        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];

        this.nodeTitle = this.showPosition ? (this.ProjectService.nodeIdToNumber[this.nodeId] + ': ' + this.item.title) : this.item.title;
        this.currentNode = this.StudentDataService.currentNode;
        this.previousNode = null;
        this.isCurrentNode = (this.currentNode.id === this.nodeId);
        this.node = this.ProjectService.getNodeById(this.nodeId);
        this.parentGroupId = null;
        var parentGroup = this.ProjectService.getParentGroup(this.nodeId);

        if (parentGroup != null) {
            this.parentGroupId = parentGroup.id;
        }

        this.$scope.$watch(
            () => { return this.StudentDataService.currentNode; },
            (newNode, oldNode) => {
                this.currentNode = newNode;
                this.previousNode = oldNode;
                this.isCurrentNode = (this.nodeId === newNode.id);
                let isPrev = false;

                if (this.ProjectService.isApplicationNode(newNode.id)) {
                    return;
                }

                if (oldNode) {
                    isPrev = (this.nodeId === oldNode.id);

                    if (this.StudentDataService.previousStep) {
                        this.$scope.$parent.isPrevStep = (this.nodeId === this.StudentDataService.previousStep.id);
                    }
                }

                if (this.isGroup) {
                    let prevNodeisGroup = (!oldNode || this.ProjectService.isGroupNode(oldNode.id));
                    let prevNodeIsDescendant = this.ProjectService.isNodeDescendentOfGroup(oldNode, this.item);
                    if (this.isCurrentNode) {
                        this.expanded = true;
                        if (prevNodeisGroup || !prevNodeIsDescendant) {
                            this.zoomToElement();
                        }
                    } else {
                        if (!prevNodeisGroup) {
                            if (prevNodeIsDescendant) {
                                this.expanded = true;
                            } else {
                                this.expanded = false;
                            }
                        }
                    }
                } else {
                    if (isPrev && this.ProjectService.isNodeDescendentOfGroup(this.item, newNode)) {
                        this.zoomToElement();
                    }
                }
            }
        );

        this.$scope.$watch(
            () => { return this.expanded; },
            (value) => {
                this.$scope.$parent.itemExpanded = value;
            }
        );
    }

    getTemplateUrl(){
        return this.ProjectService.getThemePath() + '/themeComponents/navItem/navItem.html';
    };

    zoomToElement() {
        setTimeout(()=> {
            // smooth scroll to expanded group's page location
            let top = this.$element[0].offsetTop;
            let location = this.isGroup ? top - 32 : top - 80;
            let delay = 350;
            $('#content').animate({
                scrollTop: location
            }, delay, 'linear');
        }, 500);
    };

    itemClicked(event) {
        if (this.isGroup) {
            this.expanded = !this.expanded;
            if (this.expanded) {
                if (this.isCurrentNode) {
                    this.zoomToElement();
                } else {
                    this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
                }
            }
        } else {
          this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
        }
    };

    /**
     * Get the node title
     * @param nodeId get the title for this node
     * @returns the title for the node
     */
    getNodeTitle(nodeId) {
        var node = this.ProjectService.idToNode[nodeId];
        var title = null;
        if (node != null) {
            title = node.title;
        }
        return title;
    }

    /**
     * Get the node description
     * @param nodeId get the description for this node
     * @returns the description for the node
     */
    getNodeDescription(nodeId) {
        var node = this.ProjectService.idToNode[nodeId];
        var description = null;

        if (node != null) {
            description = node.description;
        }

        return description;
    }
}

NavItemController.$inject = [
    '$filter',
    '$rootScope',
    '$scope',
    '$element',
    'dragulaService',
    'NodeService',
    'ProjectService',
    'StudentDataService',
    '$mdDialog'
];

export default NavItemController;
