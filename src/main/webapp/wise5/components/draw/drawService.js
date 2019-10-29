import ComponentService from '../componentService';

class DrawService extends ComponentService {
  constructor($filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('draw.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Draw';
    component.stamps = {};
    component.stamps.Stamps = [];
    component.tools = {};
    component.tools.select = true;
    component.tools.line = true;
    component.tools.shape = true;
    component.tools.freeHand = true;
    component.tools.text = true;
    component.tools.stamp = true;
    component.tools.strokeColor = true;
    component.tools.fillColor = true;
    component.tools.clone = true;
    component.tools.strokeWidth = true;
    component.tools.sendBack = true;
    component.tools.sendForward = true;
    component.tools.undo = true;
    component.tools.redo = true;
    component.tools.delete = true;
    return component;
  }

  getStudentWorkJPEG(componentState) {
    const studentData = componentState.studentData;
    const drawData = JSON.parse(studentData.drawData);
    if (drawData != null && drawData.jpeg != null && drawData.jpeg != '') {
      return drawData.jpeg;
    }
    return null;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    if (componentStates && componentStates.length) {
      const submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);
      if (submitRequired) {
        for (let componentState of componentStates) {
          if (componentState.isSubmit) {
            return true;
          }
        }
      } else {
        const componentState = componentStates[componentStates.length - 1];
        if (componentState.studentData.drawData) {
          // there is draw data so the component is completed
          // TODO: check for empty drawing or drawing same as initial state
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Remove the background object from the draw data in the component state
   * @param componentState the component state
   * @returns the componentState
   */
  removeBackgroundFromComponentState(componentState) {
    const drawData = componentState.studentData.drawData;
    const drawDataObject = angular.fromJson(drawData);
    const canvas = drawDataObject.canvas;
    delete canvas.backgroundImage;
    const drawDataJSONString = angular.toJson(drawDataObject);
    componentState.studentData.drawData = drawDataJSONString;
    return componentState;
  }

  /**
   * @param componentState
   * @param componentContent (optional)
   */
  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      const drawDataString = componentState.studentData.drawData;
      const drawData = angular.fromJson(drawDataString);
      if (componentContent == null) {
        if (this.isDrawDataContainsObjects(drawData)) {
          return true;
        }
      } else {
        if (this.isStarterDrawDataExists(componentContent)) {
          const starterDrawData = componentContent.starterDrawData;
          if (this.isStudentDrawDataDifferentFromStarterData(drawDataString, starterDrawData)) {
            return true;
          }
        } else {
          if (this.isDrawDataContainsObjects(drawData)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isDrawDataContainsObjects(drawData) {
    return drawData.canvas != null && drawData.canvas.objects != null &&
        drawData.canvas.objects.length > 0;
  }

  isStarterDrawDataExists(componentContent) {
    return componentContent.starterDrawData != null && componentContent.starterDrawData !== '';
  }

  isStudentDrawDataDifferentFromStarterData(drawDataString, starterDrawData) {
    return drawDataString != null && drawDataString !== '' && drawDataString !== starterDrawData;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    const deferred = this.$q.defer();
    let canvas = angular.element(document.querySelector('#drawingtool_' + componentState.nodeId + '_' + componentState.componentId + ' canvas'));
    if (canvas != null && canvas.length > 0) {
      canvas = canvas[0];
      const canvasBase64String = canvas.toDataURL('image/png');
      const imageObject = this.UtilService.getImageObjectFromBase64String(canvasBase64String);
      this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
        deferred.resolve(asset);
      });
    }
    return deferred.promise;
  }
}

DrawService.$inject = [
  '$filter',
  '$q',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default DrawService;
