'use strict';

class WiselinkController {
  constructor($scope,
              StudentDataService,
              $timeout) {
    this.$scope = $scope;
    this.StudentDataService = StudentDataService;
    this.$timeout = $timeout;
    this.template;
    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    if (this.currentNodeChangedSubscription != null) {
      this.currentNodeChangedSubscription.unsubscribe();
    }
  }

  $onInit() {
    if (this.type === 'button') {
      this.template = 'button';
    } else {
      if (this.disable) {
        this.template = 'text';
      } else {
        this.template = 'link';
      }
    }
  }

  scrollAndHighlightComponent() {
    this.$timeout(() => {
      const componentElement = $("#" + this.componentId);
      const originalBg = componentElement.css("backgroundColor");  // save the original background image
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
    const currentNode = this.StudentDataService.getCurrentNode();
    if (this.isLinkToComponentInStep(currentNode)) {
      this.scrollAndHighlightComponent();
    } else {
      this.goToNode(currentNode);
    }
  }

  isLinkToComponentInStep(currentNode) {
    return currentNode != null && currentNode.id === this.nodeId && this.componentId != null;
  }

  goToNode(currentNode) {
    this.currentNodeChangedSubscription = this.StudentDataService.currentNodeChanged$
        .subscribe(() => {
      if (this.componentId != null && currentNode != null && currentNode.id === this.nodeId) {
        this.scrollAndHighlightComponent();
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
    disable: '<',
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
