'use strict';

class WiselinkController {
    constructor($scope,
                StudentDataService,
                $timeout) {
        this.$scope = $scope;
        this.StudentDataService = StudentDataService;
        this.$timeout = $timeout;
    }

    follow() {
        this.$scope.$on('currentNodeChanged', (event, args) => {
            let currentNode = this.StudentDataService.getCurrentNode();

            // if componentId is also specified in this wiselink, scroll to it
            if (this.componentId != null && currentNode != null && currentNode.id === this.nodeId) {
                this.$timeout(() => {
                    let componentElement = $("#" + this.componentId);
                    let originalBg = componentElement.css("backgroundColor");
                    componentElement.css("background-color", "#FFFF9C");  // also highlight the background briefly to draw attention to it
                    $('#content').animate({
                        scrollTop: componentElement.prop("offsetTop")
                    }, 1000);
                    // slowly fade back to original background color
                    componentElement.css({
                        transition: 'background-color 3s ease-in-out',
                        "background-color": originalBg
                    });
                }, 500);
            }
        });
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
    }
}

WiselinkController.$inject = ['$scope', 'StudentDataService', '$timeout'];

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */
const Wiselink = {
    bindings: {
        nodeId: '@',
        componentId: '@',
        linkText: '@',
        tooltip: '@',
        linkClass: '@',
        type: '@'
    },
    templateUrl: 'wise5/directives/wiselink/wiselink.html',
    controller: WiselinkController,
    controllerAs: 'wiselinkCtrl'
};

export default Wiselink;
