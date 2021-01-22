import { EditAdvancedComponentAngularJSController } from '../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController';

class EditAudioOscillatorAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedComponentTypes = ['AudioOscillator'];
}

export const EditAudioOscillatorAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditAudioOscillatorAdvancedController,
  templateUrl:
    'wise5/components/audioOscillator/edit-audio-oscillator-advanced/edit-audio-oscillator-advanced.component.html'
};
