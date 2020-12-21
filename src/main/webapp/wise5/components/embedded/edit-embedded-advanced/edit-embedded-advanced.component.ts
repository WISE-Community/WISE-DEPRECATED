import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";

class EditEmbeddedAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes: any[] = [
    { type: 'Animation' },
    { type: 'AudioOscillator' },
    { type: 'ConceptMap' },
    { type: 'Discussion' },
    { type: 'Draw' },
    { type: 'Embedded' },
    { type: 'Graph' },
    { type: 'Label' },
    { type: 'Match' },
    { type: 'MultipleChoice' },
    { type: 'OpenResponse' },
    { type: 'Table' }
  ];
}

export const EditEmbeddedAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditEmbeddedAdvancedController,
  templateUrl: 'wise5/components/embedded/edit-embedded-advanced/edit-embedded-advanced.component.html'
}