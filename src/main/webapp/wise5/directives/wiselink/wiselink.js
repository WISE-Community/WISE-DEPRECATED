'use strict';

class WiselinkController {
    constructor($scope,
                StudentDataService,
                $timeout) {
        this.$scope = $scope;
        this.StudentDataService = StudentDataService;
        this.$timeout = $timeout;
    }

    scrollAndHighlightComponent() {
        this.$timeout(() => {
            let componentElement = $("#" + this.componentId);
            let originalBg = componentElement.css("backgroundColor");  // save the original background image
            componentElement.css("background-color", "#FFFF9C");  // highlight the background briefly to draw attention to it

            // scroll to the component
            $('#content').animate({
                scrollTop: componentElement.prop("offsetTop")
            }, 1000);

            // slowly fade back to original background color
            componentElement.css({
                transition: 'background-color 3s ease-in-out',
                "background-color": originalBg
            });

            // we need this to remove the transition animation so the highlight works again next time
            this.$timeout(() => {
               componentElement.css("transition", "");
            }, 4000);
        }, 500);
    }

    follow() {
        let currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null && currentNode.id === this.nodeId && this.componentId != null) {
            // this is a link to the component in this current step
            this.scrollAndHighlightComponent();
        } else {
            this.$scope.$on('currentNodeChanged', (event, args) => {
                let currentNode = this.StudentDataService.getCurrentNode();

                // if componentId is also specified in this wiselink, scroll to it
                if (this.componentId != null && currentNode != null && currentNode.id === this.nodeId) {
                    this.scrollAndHighlightComponent();
                }
            });
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
        }
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
