import { ConfigService } from "../../../services/configService";
import { ProjectService } from "../../../services/projectService";
import { TeacherDataService } from "../../../services/teacherDataService";
import { UtilService } from "../../../services/utilService";

class EditRubricComponentController {

  node: any;
  nodeId: string;
  summernoteRubricHTML: string;
  summernoteRubricId: string;
  summernoteRubricOptions: any;

  static $inject = ['$filter', '$mdDialog', '$scope', '$state', 'ConfigService', 'ProjectService',
      'TeacherDataService', 'UtilService'];

  constructor(private $filter: any, private $mdDialog: any, private $scope: any,
      private $state: any, private ConfigService: ConfigService,
      private ProjectService: ProjectService, private TeacherDataService: TeacherDataService,
      private UtilService: UtilService) {
  }

  $onInit() {
    this.nodeId = this.TeacherDataService.getCurrentNodeId();
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.summernoteRubricId = `summernoteRubric_${this.nodeId}`;
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
        insertAssetButton: this.UtilService.createInsertAssetButton(null, this.nodeId, null,
          'rubric', this.$filter('translate')('INSERT_ASSET'))
      },
      dialogsInBody: true
    };
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.node.rubric);
    this.$scope.$on('assetSelected', (event, { assetItem, target }) => {
      if (target === 'rubric') {
        this.UtilService.insertFileInSummernoteEditor(
          `summernoteRubric_${this.nodeId}`,
          `${this.ConfigService.getProjectAssetsDirectoryPath()}/${assetItem.fileName}`,
          assetItem.fileName
        );
      }
      this.$mdDialog.hide();
    });
  }

  summernoteRubricHTMLChanged() {
    let html = this.ConfigService.removeAbsoluteAssetPaths(this.summernoteRubricHTML);
    html = this.UtilService.insertWISELinks(html);
    this.node.rubric = html;
    this.ProjectService.saveProject();
  }

  goBack() {
    this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.nodeId });
  }
}

export const EditRubricComponent = {
  templateUrl: `/wise5/authoringTool/node/editRubric/edit-rubric.component.html`,
  controller: EditRubricComponentController
}
