'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavigationController = function NavigationController($rootScope, $filter, ConfigService, ProjectService, StudentDataService) {
  _classCallCheck(this, NavigationController);

  this.$rootScope = $rootScope;
  this.$filter = $filter;
  this.ConfigService = ConfigService;
  this.ProjectService = ProjectService;
  this.StudentDataService = StudentDataService;
  this.rootNode = this.ProjectService.rootNode;

  this.$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    var toNodeId = toParams.nodeId;
    var fromNodeId = fromParams.nodeId;
    if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
      this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
    }

    if (toState.name === 'root.vle') {
      var nodeId = toParams.nodeId;
      if (this.ProjectService.isApplicationNode(nodeId)) {
        // scroll to top when viewing a new step
        document.getElementById('content').scrollTop = 0;
      }
    }
  }.bind(this));
};

NavigationController.$inject = ['$rootScope', '$filter', 'ConfigService', 'ProjectService', 'StudentDataService'];

exports.default = NavigationController;
//# sourceMappingURL=navigationController.js.map
