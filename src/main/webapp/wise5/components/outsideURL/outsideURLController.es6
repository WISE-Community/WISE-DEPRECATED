'use strict';

import ComponentController from "../componentController";

class OutsideURLController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $sce,
      $scope,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      OutsideURLService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$q = $q;
    this.$sce = $sce;
    this.OutsideURLService = OutsideURLService;

    // the url to the web page to display
    this.url = null;

    // the max width of the iframe
    this.maxWidth = null;

    // the max height of the iframe
    this.maxHeight = null;

    if (this.componentContent != null) {
      // set the url
      this.setURL(this.componentContent.url);
    }

    // get the max width
    this.maxWidth = this.componentContent.maxWidth ? this.componentContent.maxWidth : 'none';

    // get the max height
    this.maxHeight = this.componentContent.maxHeight ? this.componentContent.maxHeight : 'none';

    if (this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function() {
      var deferred = this.$q.defer();

      /*
       * the student does not have any unsaved changes in this component
       * so we don't need to save a component state for this component.
       * we will immediately resolve the promise here.
       */
      deferred.resolve();

      return deferred.promise;
    }.bind(this);

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  /**
   * Set the url
   * @param url the url
   */
  setURL(url) {
    if (url != null) {
      var trustedURL = this.$sce.trustAsResourceUrl(url);
      this.url = trustedURL;
    }
  };

  /**
   * Register the the listener that will listen for the exit event
   * so that we can perform saving before exiting.
   */
  registerExitListener() {

    /*
     * Listen for the 'exit' event which is fired when the student exits
     * the VLE. This will perform saving before the VLE exits.
     */
    this.exitListener = this.$scope.$on('exit', (event, args) => {

    });
  };
}

OutsideURLController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$sce',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'OutsideURLService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default OutsideURLController;
