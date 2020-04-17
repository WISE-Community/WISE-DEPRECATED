import VLEProjectService from '../vleProjectService';
import StudentDataService from '../../services/studentDataService';

class NavigationController {
  rootNode: any;
  static $inject = ['$transitions', 'ProjectService', 'StudentDataService'];

  constructor(
    $transitions,
    private ProjectService: VLEProjectService,
    private StudentDataService: StudentDataService
  ) {
    this.rootNode = this.ProjectService.rootNode;
    $transitions.onSuccess({}, $transition => {
      const toNodeId = $transition.params('to').nodeId;
      const fromNodeId = $transition.params('from').nodeId;
      if (toNodeId && fromNodeId && toNodeId !== fromNodeId) {
        this.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(toNodeId);
      }
      if ($transition.name === 'root.vle' && this.ProjectService.isApplicationNode(toNodeId)) {
        document.getElementById('content').scrollTop = 0;
      }
    });
  }
}

export default NavigationController;
