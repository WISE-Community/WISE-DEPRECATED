import { VLEProjectService } from '../vleProjectService';

class NavigationController {
  rootNode: any;
  static $inject = ['$transitions', 'ProjectService'];

  constructor(
    $transitions,
    private ProjectService: VLEProjectService
  ) {
    this.rootNode = this.ProjectService.rootNode;
    $transitions.onSuccess({}, $transition => {
      const toNodeId = $transition.params('to').nodeId;
      if ($transition.name === 'root.vle' && this.ProjectService.isApplicationNode(toNodeId)) {
        document.getElementById('content').scrollTop = 0;
      }
    });
  }
}

export default NavigationController;
