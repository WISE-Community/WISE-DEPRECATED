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

    if (this.componentContent != null) {
      // set the url
      this.setURL(this.componentContent.url);
    }

    this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);

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

  setWidthAndHeight(width, height) {
    this.width = width ? width + 'px' : 'none';
    this.height = height ? height + 'px' : '600px';
  }

  setURL(url) {
    if (url == null || url === '') {
      this.url = ' ';
    } else {
      this.url = this.$sce.trustAsResourceUrl(url);
    }
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
