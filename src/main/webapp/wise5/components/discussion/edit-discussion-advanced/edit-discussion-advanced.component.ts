import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditDiscussionAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes: any[] = [{ type: 'Discussion' }];
}

export const EditDiscussionAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditDiscussionAdvancedController,
  templateUrl: 'wise5/components/discussion/edit-discussion-advanced/edit-discussion-advanced.component.html'
}