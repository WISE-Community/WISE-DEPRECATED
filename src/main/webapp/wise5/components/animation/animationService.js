import ComponentService from '../componentService';

class AnimationService extends ComponentService {
  constructor($filter, StudentDataService, UtilService) {
    super($filter, StudentDataService, UtilService);
  }

  getComponentTypeLabel() {
    return this.$translate('animation.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Animation';
    component.widthInPixels = 600;
    component.widthInUnits = 60;
    component.heightInPixels = 200;
    component.heightInUnits = 20;
    component.dataXOriginInPixels = 0;
    component.dataYOriginInPixels = 80;
    component.coordinateSystem = 'screen';
    component.objects = [];
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    return componentStates.length > 0;
  };

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      return componentState.studentData != null;
    }
    return false;
  }
}

AnimationService.$inject = [
  '$filter',
  'StudentDataService',
  'UtilService'
];

export default AnimationService;
