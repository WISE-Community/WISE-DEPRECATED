import { ConfigService } from '../../services/configService';
import { UtilService } from '../../services/utilService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';

class RubricAuthoringController {
  translate: any;
  nodeId: string;
  projectId: number;
  rubric: string;
  static $inject = [
    '$filter',
    '$state',
    '$stateParams',
    'ConfigService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter: any,
    private $state: any,
    $stateParams: any,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private UtilService: UtilService
  ) {
    this.translate = $filter('translate');
    this.projectId = $stateParams.projectId;
    this.rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());
  }

  rubricChanged() {
    const html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.rubric)
    );
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  goBack() {
    this.$state.go('root.at.project');
  }
}

export default RubricAuthoringController;
