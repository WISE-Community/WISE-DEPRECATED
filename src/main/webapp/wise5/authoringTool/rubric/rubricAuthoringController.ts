import ConfigService from '../../services/configService';
import { UtilService } from '../../services/utilService';
import AuthoringToolProjectService from '../authoringToolProjectService';

class RubricAuthoringController {
  translate: any;
  nodeId: string;
  projectId: number;
  summernoteRubricHTML: string;
  summernoteRubricId: string;
  summernoteRubricOptions: any;
  static $inject = [
    '$filter',
    '$mdDialog',
    '$scope',
    '$state',
    '$stateParams',
    'ConfigService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter: any,
    private $mdDialog: any,
    private $scope: any,
    private $state: any,
    $stateParams: any,
    private ConfigService: ConfigService,
    private ProjectService: AuthoringToolProjectService,
    private UtilService: UtilService
  ) {
    this.translate = $filter('translate');
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
          null,
          this.nodeId,
          null,
          'rubric',
          this.translate('INSERT_ASSET')
        )
      },
      dialogsInBody: true
    };
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(
      this.ProjectService.getProjectRubric()
    );
  }

  $onInit() {
    this.$scope.$on('assetSelected', (event, { assetItem, target }) => {
      if (target === 'rubric') {
        const fileName = assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        this.UtilService.insertFileInSummernoteEditor(
          this.summernoteRubricId,
          fullFilePath,
          fileName
        );
        this.$mdDialog.hide();
      }
    });
  }

  summernoteRubricHTMLChanged() {
    const html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.summernoteRubricHTML)
    );
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  goBack() {
    this.$state.go('root.at.project');
  }
}

export default RubricAuthoringController;
