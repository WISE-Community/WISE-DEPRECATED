import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditMultipleChoiceAdvancedController extends EditAdvancedComponentAngularJSController {
}

export const EditMultipleChoiceAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditMultipleChoiceAdvancedController,
  templateUrl: 'wise5/components/multipleChoice/edit-multiple-choice-advanced/edit-multiple-choice-advanced.component.html'
}
