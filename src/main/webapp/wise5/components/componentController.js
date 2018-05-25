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

  this.nodeId = this.$scope.nodeId;
  this.componentContent = this.$scope.componentContent;
  this.componentId = this.componentContent.id;
  this.idToOrder = this.ProjectService.idToOrder;
  this.mode = this.$scope.mode;
  this.authoringComponentContent = this.$scope.authoringComponentContent;
  this.isShowPreviousWork = false;
  this.showAdvancedAuthoring = false;
  this.showJSONAuthoring = false;
  this.isDisabled = false;
  this.isDirty = false;

  // whether the student work has changed since last submit
  this.isSubmitDirty = false;

  // whether the student work is for a submit
  this.isSubmit = false;

  this.saveMessage = {
    text: '',
    time: ''
  };

  // whether students can attach files to their work
  this.isStudentAttachmentEnabled = false;

  this.isPromptVisible = true;
  this.isSaveButtonVisible = false;
  this.isSubmitButtonVisible = false;
  this.isSubmitButtonDisabled = false;
  this.submitCounter = 0;

  this.isSnipButtonVisible = true;

  this.workgroupId = this.$scope.workgroupId;
  this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;
};

ComponentController.$inject = [];

exports.default = ComponentController;
//# sourceMappingURL=componentController.js.map
