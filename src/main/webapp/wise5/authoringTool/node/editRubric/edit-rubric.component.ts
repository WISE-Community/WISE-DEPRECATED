import { ProjectAssetService } from "../../../../site/src/app/services/projectAssetService";
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

  static $inject = ['$filter', '$mdDialog', '$scope', '$state', 'ConfigService',
      'ProjectAssetService', 'ProjectService', 'TeacherDataService', 'UtilService'];

  constructor(private $filter: any, private $mdDialog: any, private $scope: any,
      private $state: any, private ConfigService: ConfigService,
      private ProjectAssetService: ProjectAssetService, private ProjectService: ProjectService,
      private TeacherDataService: TeacherDataService, private UtilService: UtilService) {
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
          'rubric', this.$filter('translate')('INSERT_ASSET'),
          this.createOpenAssetChooserFunction())
      },
      dialogsInBody: true
    };
    this.summernoteRubricHTML = this.ProjectService.replaceAssetPaths(this.node.rubric);
  }

  /**
   * Creates and returns a function so that within the function the 'this' object will be this
   * authorNotebookController.
   */
  createOpenAssetChooserFunction() {
    return (params: any) => {
      this.ProjectAssetService.openAssetChooser(params).then(
        (data: any) => { this.assetSelected(data) }
      );
    }
  }

  assetSelected({ assetItem, target }) {
    if (target === 'rubric') {
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}`,
        `${this.ConfigService.getProjectAssetsDirectoryPath()}/${assetItem.fileName}`,
        assetItem.fileName
      );
    }
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
