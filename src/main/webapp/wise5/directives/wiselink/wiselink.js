'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WiselinkController = function () {
    function WiselinkController($scope, StudentDataService, $timeout) {
        _classCallCheck(this, WiselinkController);

        this.$scope = $scope;
        this.StudentDataService = StudentDataService;
        this.$timeout = $timeout;
    }

    _createClass(WiselinkController, [{
        key: "scrollAndHighlightComponent",
        value: function scrollAndHighlightComponent() {
            var _this = this;

            this.$timeout(function () {
                var componentElement = $("#" + _this.componentId);
                var originalBg = componentElement.css("backgroundColor"); // save the original background image
                componentElement.css("background-color", "#FFFF9C"); // highlight the background briefly to draw attention to it

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
                _this.$timeout(function () {
                    componentElement.css("transition", "");
                }, 4000);
            }, 500);
        }
    }, {
        key: "follow",
        value: function follow() {
            var _this2 = this;

            var currentNode = this.StudentDataService.getCurrentNode();
            if (currentNode != null && currentNode.id === this.nodeId && this.componentId != null) {
                // this is a link to the component in this current step
                this.scrollAndHighlightComponent();
            } else {
                this.$scope.$on('currentNodeChanged', function (event, args) {
                    var currentNode = _this2.StudentDataService.getCurrentNode();

                    // if componentId is also specified in this wiselink, scroll to it
                    if (_this2.componentId != null && currentNode != null && currentNode.id === _this2.nodeId) {
                        _this2.scrollAndHighlightComponent();
                    }
                });
                this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
            }
        }
    }]);

    return WiselinkController;
}();

WiselinkController.$inject = ['$scope', 'StudentDataService', '$timeout'];

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */
var Wiselink = {
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

exports.default = Wiselink;
//# sourceMappingURL=wiselink.js.map