import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';
import { NodeService } from '../../../services/nodeService';
import { NotebookService } from '../../../services/notebookService';
import { TeacherProjectService } from '../../../services/teacherProjectService';

class EditMatchAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['Match'];

  static $inject = ['NodeService', 'NotebookService', 'ProjectService'];

  constructor(
    protected NodeService: NodeService,
    protected NotebookService: NotebookService,
    protected ProjectService: TeacherProjectService
  ) {
    super(NodeService, ProjectService);
  }

  isNotebookEnabled(): boolean {
    return this.NotebookService.isNotebookEnabled();
  }
}

export const EditMatchAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditMatchAdvancedController,
  templateUrl: 'wise5/components/label/edit-label-advanced/edit-label-advanced.component.html'
};
