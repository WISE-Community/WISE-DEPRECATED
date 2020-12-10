import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditOpenResponseAdvancedController extends EditAdvancedComponentAngularJSController {
}

export const EditOpenResponseAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditOpenResponseAdvancedController,
  templateUrl: 'wise5/components/openResponse/edit-open-response-advanced/edit-open-response-advanced.component.html'
}
