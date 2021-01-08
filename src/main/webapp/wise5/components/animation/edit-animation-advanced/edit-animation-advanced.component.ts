import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditAnimationAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['Animation', 'Graph'];
}

export const EditAnimationAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditAnimationAdvancedController,
  templateUrl:
    'wise5/components/animation/edit-animation-advanced/edit-animation-advanced.component.html'
};
