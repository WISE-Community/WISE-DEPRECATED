import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditDrawAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes: any[] = [
    { type: 'ConceptMap' },
    { type: 'Draw' },
    { type: 'Embedded' },
    { type: 'Graph' },
    { type: 'Label' },
    { type: 'Table' }
  ];
}

export const EditDrawAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditDrawAdvancedController,
  templateUrl: 'wise5/components/draw/edit-draw-advanced/edit-draw-advanced.component.html'
}