'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WiselinkController = function () {
    function WiselinkController($scope, $element, StudentDataService) {
        _classCallCheck(this, WiselinkController);

        this.StudentDataService = StudentDataService;
    }

    _createClass(WiselinkController, [{
        key: 'follow',
        value: function follow() {
            this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(this.nodeId);
        }
    }]);

    return WiselinkController;
}();

WiselinkController.$inject = ['$scope', '$element', 'StudentDataService'];

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */
var Wiselink = {
    bindings: {
        nodeId: '@',
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