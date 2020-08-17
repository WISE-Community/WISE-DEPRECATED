import { VLEProjectService } from '../vleProjectService';

class NavigationController {
  rootNode: any;
  static $inject = ['ProjectService'];

  constructor(private ProjectService: VLEProjectService) {
    this.rootNode = this.ProjectService.rootNode;
  }
}

export default NavigationController;
