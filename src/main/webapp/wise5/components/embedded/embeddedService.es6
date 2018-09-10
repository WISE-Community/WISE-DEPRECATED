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
    return component;
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    var result = false;
    var isCompletedFieldInComponentState = false;
    if (componentStates != null) {
      for (var componentState of componentStates) {
        if (componentState != null) {
          var studentData = componentState.studentData;
          if (studentData != null) {
            if (studentData.isCompleted != null) {
              /*
               * the model has set the isCompleted field in the
               * student data
               */
              isCompletedFieldInComponentState = true;

              if (studentData.isCompleted === true) {
                /*
                 * the model has set the isCompleted field to true
                 * which means the student has completed the component
                 */
                return true;
              }
            }
          }
        }
      }
    }

    if (isCompletedFieldInComponentState == false) {
      /*
       * the isCompleted field was not set into the component state so
       * we will look for events to determine isCompleted
       */

      if (nodeEvents != null) {
        for (var event of nodeEvents) {
          if (event != null && event.event === 'nodeEntered') {
            result = true;
            break;
          }
        }
      }
    }
    return result;
  };

  componentHasWork(component) {
    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (componentState != null) {
      let studentData = componentState.studentData;
      if (studentData != null) {
        return true;
      }
    }
    return false;
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState) {
    let deferred = this.$q.defer();
    let iframe = $('#componentApp_' + componentState.componentId);
    if (iframe != null && iframe.length > 0) {
      let modelElement = iframe.contents().find('html');
      if (modelElement != null && modelElement.length > 0) {
        modelElement = modelElement[0];
        // convert the model element to a canvas element
        html2canvas(modelElement).then((canvas) => {
          let img_b64 = canvas.toDataURL('image/png');
          let imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);
          // add the image to the student assets
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
