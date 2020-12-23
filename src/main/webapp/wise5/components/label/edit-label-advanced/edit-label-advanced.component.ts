import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditLabelAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['ConceptMap', 'Draw', 'Embedded', 'Graph', 'Label',
      'OpenResponse', 'Table'];
}

export const EditLabelAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditLabelAdvancedController,
  templateUrl: 'wise5/components/label/edit-label-advanced/edit-label-advanced.component.html'
}
