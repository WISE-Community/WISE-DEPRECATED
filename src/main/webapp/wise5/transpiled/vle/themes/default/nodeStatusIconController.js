'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeStatusIconCtrl = function () {
    function NodeStatusIconCtrl($scope, ProjectService, StudentDataService) {
        _classCallCheck(this, NodeStatusIconCtrl);

        this.$scope = $scope;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.nodeStatuses = this.StudentDataService.nodeStatuses;
        this.nodeStatus = this.nodeStatuses[this.nodeId];
    }

    _createClass(NodeStatusIconCtrl, [{
        key: 'getTemplateUrl',
        value: function getTemplateUrl() {
            return this.ProjectService.getThemePath() + '/templates/nodeStatusIcon.html';
        }
    }]);

    return NodeStatusIconCtrl;
}();

NodeStatusIconCtrl.$inject = ['$scope', 'ProjectService', 'StudentDataService'];

exports.default = NodeStatusIconCtrl;