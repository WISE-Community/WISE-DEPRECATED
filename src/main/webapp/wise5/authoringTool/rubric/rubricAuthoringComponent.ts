import { ConfigService } from '../../services/configService';
import { UtilService } from '../../services/utilService';
import { TeacherProjectService } from '../../services/teacherProjectService';

class RubricAuthoringController {
  rubric: string = '';
  static $inject = [ '$state', 'ConfigService', 'ProjectService', 'UtilService' ];

  constructor(private $state: any, private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService, private UtilService: UtilService) {
  }

  $onInit(): void {
    this.rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());
  }

  rubricChanged(): void {
    const html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.rubric)
    );
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  goBack(): void {
    this.$state.go('root.at.project');
  }
}

export const RubricAuthoringComponent = {
  templateUrl: '/wise5/authoringTool/rubric/rubricAuthoring.html',
  controller: RubricAuthoringController
};
