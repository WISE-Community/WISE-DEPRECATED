import ConfigureStructureController from "../configureStructureController";
import { AuthoringToolProjectService } from "../../authoringToolProjectService";

export default class AutomatedAssessmentChooseItemController extends ConfigureStructureController {

  automatedAssessmentProjectId: number;
  items = [];
  project: any;
  node: string;
  projectIdToOrder: any;
  projectItems: any;

  static $inject = ['$filter', '$http', '$rootScope', '$state', '$stateParams', '$scope',
      'UtilService', 'ProjectService'];

  constructor($filter, $http, $rootScope, $state, $stateParams, $scope, UtilService,
      private ProjectService: AuthoringToolProjectService) {
    super($filter, $http, $rootScope, $state, $stateParams, $scope, UtilService);
  }

  $onInit() {
    this.automatedAssessmentProjectId = this.ProjectService.getAutomatedAssessmentProjectId();
    this.showAutomatedAssessmentProject();
  }

  showAutomatedAssessmentProject() {
    this.ProjectService.retrieveProjectById(this.automatedAssessmentProjectId).then(projectJSON => {
      this.project = projectJSON;
      const nodeOrderOfProject = this.ProjectService.getNodeOrderOfProject(this.project);
      this.projectIdToOrder = nodeOrderOfProject.idToOrder;
      this.projectItems = nodeOrderOfProject.nodes;
    });
  }

  previewNode(node) {
    window.open(`${this.project.previewProjectURL}/${node.id}`);
  }

  next() {
    this.$state.go('root.at.project.structure.automated-assessment.configure', {
      importFromProjectId: this.automatedAssessmentProjectId,
      node: this.node
    });
  }
}
