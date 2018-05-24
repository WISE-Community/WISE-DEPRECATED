'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentController = function ComponentController($filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
  _classCallCheck(this, ComponentController);

  this.$filter = $filter;
  this.$mdDialog = $mdDialog;
  this.$rootScope = $rootScope;
  this.$scope = $scope;
  this.AnnotationService = AnnotationService;
  this.ConfigService = ConfigService;
  this.NodeService = NodeService;
  this.NotebookService = NotebookService;
  this.ProjectService = ProjectService;
  this.StudentAssetService = StudentAssetService;
  this.StudentDataService = StudentDataService;
  this.UtilService = UtilService;
  this.$translate = this.$filter('translate');
};

ComponentController.$inject = [];

exports.default = ComponentController;
//# sourceMappingURL=componentController.js.map
