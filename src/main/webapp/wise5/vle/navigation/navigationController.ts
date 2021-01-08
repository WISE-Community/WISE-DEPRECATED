import { VLEProjectService } from '../vleProjectService';
import { StudentDataService } from '../../services/studentDataService';
import { Subscription } from 'rxjs';

class NavigationController {
  navItemIsExpanded: any = {};
  navItemIsExpandedSubscription: Subscription;
  rootNode: any;
  static $inject = ['ProjectService', 'StudentDataService'];

  constructor(
    private ProjectService: VLEProjectService,
    private StudentDataService: StudentDataService
  ) {
    this.rootNode = this.ProjectService.rootNode;
  }

  $onInit() {
    this.navItemIsExpandedSubscription = this.StudentDataService.navItemIsExpanded$.subscribe(
      ({ nodeId, isExpanded }) => {
        this.navItemIsExpanded[nodeId] = isExpanded;
      }
    );
  }

  $onDestroy() {
    this.navItemIsExpandedSubscription.unsubscribe();
  }
}

export default NavigationController;
