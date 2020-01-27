'use strict';

import OutsideURLController from "./outsideURLController";

class OutsideURLAuthoringController extends OutsideURLController {
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
    super($filter,
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
      UtilService);
    this.isShowOERs = this.componentContent.url === '';

    $scope.$watch(() => {
      return this.authoringComponentContent;
    }, (newValue, oldValue) => {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.setURL(this.authoringComponentContent.url);
      this.setInfo(this.authoringComponentContent.info);
      this.setWidthAndHeight(
          this.authoringComponentContent.width, this.authoringComponentContent.height);
    }, true);

    this.OutsideURLService.getOpenEducationalResources().then((openEducationalResources) => {
      this.openEducationalResources = openEducationalResources;
    });

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // add the image html
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }
      this.$mdDialog.hide();
    });
  }

  urlInputChanged() {
    this.authoringComponentContent.info = null;
    this.authoringViewComponentChanged();
  }

  populateOpenEducationalResourceURL(openEducationalResource) {
    this.authoringComponentContent.url = openEducationalResource.url;
    this.authoringComponentContent.info = openEducationalResource.info;
    this.authoringViewComponentChanged();
  }

  isResourceSelected(resourceUrl) {
    return resourceUrl === this.authoringComponentContent.url;
  }

  reloadResource() {
    const iframe = document.getElementById(this.outsideURLIFrameId);
    iframe.src = '';
    iframe.src = this.authoringComponentContent.url;
  }
}

  OutsideURLAuthoringController.$inject = [
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

export default OutsideURLAuthoringController;
