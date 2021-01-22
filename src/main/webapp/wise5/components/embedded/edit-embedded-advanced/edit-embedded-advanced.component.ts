import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditEmbeddedAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = [
    'Animation',
    'AudioOscillator',
    'ConceptMap',
    'Discussion',
    'Draw',
    'Embedded',
    'Graph',
    'Label',
    'Match',
    'MultipleChoice',
    'OpenResponse',
    'Table'
  ];
}

export const EditEmbeddedAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditEmbeddedAdvancedController,
  templateUrl:
    'wise5/components/embedded/edit-embedded-advanced/edit-embedded-advanced.component.html'
};
