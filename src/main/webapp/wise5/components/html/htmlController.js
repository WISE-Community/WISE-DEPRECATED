'use strict';

import ComponentController from '../componentController';

class HTMLController extends ComponentController {
  constructor($rootScope,
      $scope,
      $state,
      $stateParams,
      $sce,
      $filter,
      $mdDialog,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$sce = $sce;

    if (this.mode === 'authoring') {

    } else if (this.mode === 'grading') {

    } else if (this.mode === 'student') {
      if (this.componentContent != null) {
        this.html = this.componentContent.html;
      }
    }

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    this.$scope.$on('requestImage', (event, args) => {
      // get the node id and component id from the args
      let nodeId = args.nodeId;
      let componentId = args.componentId;

      // check if the image is being requested from this component
      if (this.nodeId === nodeId && this.componentId === componentId) {

        // obtain the image objects
        let imageObjects = this.getImageObjects();

        if (imageObjects != null) {
          let args = {};
          args.nodeId = nodeId;
          args.componentId = componentId;
          args.imageObjects = imageObjects;

          // fire an event that contains the image objects
          this.$scope.$emit('requestImageCallback', args);
        }
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObjects() {
    let imageObjects = [];

    // get the image elements in the scope
    let componentId = this.componentId;
    let imageElements = angular.element(document.querySelector('#' + componentId + ' img'));

    if (imageElements != null) {

      // loop through all the image elements
      for (let i = 0; i < imageElements.length; i++) {
        let imageElement = imageElements[i];

        if (imageElement != null) {

          // create an image object
          let imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
          imageObjects.push(imageObject);
        }
      }
    }

    return imageObjects;
  }
}

HTMLController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  '$sce',
  '$filter',
  '$mdDialog',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default HTMLController;
