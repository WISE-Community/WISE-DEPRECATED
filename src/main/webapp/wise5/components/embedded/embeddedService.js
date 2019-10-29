import ComponentService from '../componentService';
import html2canvas from 'html2canvas';

class EmbeddedService extends ComponentService {
  constructor(
      $filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.$translate('embedded.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Embedded';
    component.url = '';
    component.height = 600;
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    let isCompletedFieldInComponentState = false;
    if (componentStates != null) {
      for (let componentState of componentStates) {
        const studentData = componentState.studentData;
        if (studentData != null && studentData.isCompleted != null) {
          if (studentData.isCompleted === true) {
            return true;
          }
          isCompletedFieldInComponentState = true;
        }
      }
    }

    if (isCompletedFieldInComponentState === false) {
      /*
       * the isCompleted field was not set into the component state so
       * we will look for events to determine isCompleted
       */
      if (nodeEvents != null) {
        for (let event of nodeEvents) {
          if (event.event === 'nodeEntered') {
            return true;
          }
        }
      }
    }
    return false;
  }

  componentHasWork(component) {
    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    return componentState.studentData != null;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    const deferred = this.$q.defer();
    const iframe = $('#componentApp_' + componentState.componentId);
    if (iframe != null && iframe.length > 0) {
      let modelElement = iframe.contents().find('html');
      if (modelElement != null && modelElement.length > 0) {
        modelElement = modelElement[0];
        html2canvas(modelElement).then((canvas) => {
          const base64Image = canvas.toDataURL('image/png');
          const imageObject = this.UtilService.getImageObjectFromBase64String(base64Image);
          this.StudentAssetService.uploadAsset(imageObject).then((asset) => {
            deferred.resolve(asset);
          });
        });
      }
    }
    return deferred.promise;
  }
}

EmbeddedService.$inject = [
  '$filter',
  '$q',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default EmbeddedService;
