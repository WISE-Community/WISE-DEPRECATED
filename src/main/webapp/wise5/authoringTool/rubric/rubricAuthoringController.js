class RubricAuthoringController {
  constructor(
    $filter,
    $mdDialog,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    ConfigService,
    ProjectService,
    UtilService
  ) {
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$translate = $filter('translate');
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.UtilService = UtilService;
    this.projectId = $stateParams.projectId;
    this.summernoteRubricId = `summernoteRubric_${this.projectId}`;
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: this.UtilService.createInsertAssetButton(
          this, null, this.nodeId, null, 'rubric', this.$translate('INSERT_ASSET'))
      }
    };
    this.summernoteRubricHTML =
      this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());
  }

  $onInit() {
    this.$scope.$on('assetSelected', (event, {assetItem, target}) => {
      if (target === 'rubric') {
        const fileName = assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        this.UtilService.insertFileInSummernoteEditor(this.summernoteRubricId, fullFilePath,
          fileName);
          this.$mdDialog.hide();
        }
    });
  }

  summernoteRubricHTMLChanged() {
    const html = this.UtilService.insertWISELinks(
        this.ConfigService.removeAbsoluteAssetPaths(this.summernoteRubricHTML));
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  goBack() {
    this.$state.go('root.project');
  }
}

RubricAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  'ConfigService',
  'ProjectService',
  'UtilService'
];

export default RubricAuthoringController;
