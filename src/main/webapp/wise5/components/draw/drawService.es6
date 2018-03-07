import NodeService from '../../services/nodeService';

class DrawService extends NodeService {
  constructor($filter,
      $q,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super();
    this.$filter = $filter;
    this.$q = $q;
    this.StudentAssetService = StudentAssetService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;

    this.$translate = this.$filter('translate');
  }

  /**
   * Get the component type label
   * example
   * "Draw"
   */
  getComponentTypeLabel() {
    return this.$translate('draw.componentTypeLabel');
  }

  /**
   * Create a Draw component object
   * @returns a new Draw component object
   */
  createComponent() {
    var component = {};
    component.id = this.UtilService.generateKey();
    component.type = 'Draw';
    component.prompt = '';
    component.showSaveButton = false;
    component.showSubmitButton = false;
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

  /**
   * Copies an existing Draw component object
   * @returns a copied Draw component object
   */
  copyComponent(componentToCopy) {
    var component = this.createComponent();
    component.prompt = componentToCopy.prompt;
    component.showSaveButton = componentToCopy.showSaveButton;
    component.showSubmitButton = componentToCopy.showSubmitButton;
    component.stamps = componentToCopy.stamps;
    component.stamps.Stamps = componentToCopy.stamps.Stamps;
    return component;
  }

  getStudentWorkJPEG(componentState) {
    if (componentState != null) {
      var studentData = componentState.studentData;

      if (studentData != null && studentData.drawData != null) {
        var drawData = JSON.parse(studentData.drawData);
        if (drawData != null && drawData.jpeg != null && drawData.jpeg != '') {
          return drawData.jpeg;
        }
      }
    }
    return null;
  };

  /**
   * Populate a component state with the data from another component state
   * @param componentStateFromOtherComponent the component state to obtain the data from
   * @return a new component state that contains the student data from the other
   * component state
   */
  populateComponentState(componentStateFromOtherComponent) {
    var componentState = null;

    if (componentStateFromOtherComponent != null) {

      // create an empty component state
      componentState = this.StudentDataService.createComponentState();

      // get the component type of the other component state
      var otherComponentType = componentStateFromOtherComponent.componentType;

      if (otherComponentType === 'Draw') {
        // the other component is an Draw component

        // get the student data from the other component state
        var studentData = componentStateFromOtherComponent.studentData;

        // create a copy of the student data
        var studentDataCopy = this.UtilService.makeCopyOfJSONObject(studentData);

        // set the student data into the new component state
        componentState.studentData = studentDataCopy;
      }
    }

    return componentState;
  };

  /**
   * Check if the component was completed
   * @param component the component object
   * @param componentStates the component states for the specific component
   * @param componentEvents the events for the specific component
   * @param nodeEvents the events for the parent node of the component
   * @param node parent node of the component
   * @returns whether the component was completed
   */
  isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
    let result = false;

    if (componentStates && componentStates.length) {
      let submitRequired = node.showSubmitButton || (component.showSubmitButton && !node.showSaveButton);

      if (submitRequired) {
        // completion requires a submission, so check for isSubmit in any component states
        for (let i = 0, l = componentStates.length; i < l; i++) {
          let state = componentStates[i];
          if (state.isSubmit && state.studentData) {
            // component state is a submission
            if (state.studentData.drawData) {
              // there is draw data so the component is completed
              // TODO: check for empty drawing or drawing same as initial state
              result = true;
              break;
            }
          }
        }
      } else {
        // get the last component state
        let l = componentStates.length - 1;
        let componentState = componentStates[l];

        let studentData = componentState.studentData;

        if (studentData) {
          if (studentData.drawData) {
            // there is draw data so the component is completed
            // TODO: check for empty drawing or drawing same as initial state
            result = true;
          }
        }
      }
    }

    return result;
  };

  /**
   * Remove the background object from the draw data in the component state
   * @param componentState the component state
   * @returns the componentState
   */
  removeBackgroundFromComponentState(componentState) {

    if (componentState != null) {
      var studentData = componentState.studentData;

      if (studentData != null) {

        // get the draw data string
        var drawData = studentData.drawData;

        if (drawData != null) {

          // convert the draw data string to an object
          var drawDataObject = angular.fromJson(drawData);

          if (drawDataObject != null) {

            // get the canvas value
            var canvas = drawDataObject.canvas;

            if (canvas != null) {

              // remove the background image from the canvas
              delete canvas.backgroundImage;

              // convert the object back to a JSON string
              var drawDataJSONString = angular.toJson(drawDataObject);

              if (drawDataJSONString != null) {
                // set the draw data JSON string back into the student data
                studentData.drawData = drawDataJSONString;
              }
            }
          }
        }
      }
    };

    return componentState;
  }

  /**
   * Whether this component generates student work
   * @param component (optional) the component object. if the component object
   * is not provided, we will use the default value of whether the
   * component type usually has work.
   * @return whether this component generates student work
   */
  componentHasWork(component) {
    return true;
  }

  /**
   * Whether this component uses a save button
   * @return whether this component uses a save button
   */
  componentUsesSaveButton() {
    return true;
  }

  /**
   * Whether this component uses a submit button
   * @return whether this component uses a submit button
   */
  componentUsesSubmitButton() {
    return true;
  }

  /**
   * Check if the component state has student work. Sometimes a component
   * state may be created if the student visits a component but doesn't
   * actually perform any work. This is where we will check if the student
   * actually performed any work.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has any work
   */
  componentStateHasStudentWork(componentState, componentContent) {

    if (componentState != null) {

      let studentData = componentState.studentData;

      if (studentData != null) {

        // get the student draw data
        let drawData = studentData.drawData;

        // get the draw data as a JSON object
        let drawDataJSON = angular.fromJson(drawData);

        if (componentContent == null) {
          // the component content was not provided

          if (drawDataJSON != null &&
            drawDataJSON.canvas != null &&
            drawDataJSON.canvas.objects != null &&
            drawDataJSON.canvas.objects.length > 0) {

            return true;
          }
        } else {
          // the component content was provided

          let starterDrawData = componentContent.starterDrawData;

          if (starterDrawData == null || starterDrawData == '') {
            // there is no starter draw data

            if (drawDataJSON != null &&
              drawDataJSON.canvas != null &&
              drawDataJSON.canvas.objects != null &&
              drawDataJSON.canvas.objects.length > 0) {

              return true;
            }
          } else {
            /*
             * there is starter draw data so we will compare it with
             * the student draw data
             */

            if (drawData != null &&
              drawData != '' &&
              drawData !== starterDrawData) {
              /*
               * the student draw data is different than the
               * starter draw data
               */
              return true;
            }
          }
        }
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
    var canvas = angular.element('#drawingtool_' + componentState.nodeId + '_' + componentState.componentId + ' canvas');
    if (canvas != null && canvas.length > 0) {
      // get the top canvas
      canvas = canvas[0];

      // get the canvas as a base64 string
      var img_b64 = canvas.toDataURL('image/png');

      // get the image object
      var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

      // add the image to the student assets
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
