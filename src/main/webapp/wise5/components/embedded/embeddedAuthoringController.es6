'use strict';

import EmbeddedController from "./embeddedController";
import html2canvas from 'html2canvas';
import iframeResizer from 'iframe-resizer';

class EmbeddedAuthoringController extends EmbeddedController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $sce,
              $timeout,
              $window,
              AnnotationService,
              ConfigService,
              EmbeddedService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $sce,
      $timeout,
      $window,
      AnnotationService,
      ConfigService,
      EmbeddedService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'AudioOscillator' },
      { type: 'ConceptMap' },
      { type: 'Discussion' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Match' },
      { type: 'MultipleChoice' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.width = this.componentContent.width ? this.componentContent.width : '100%';
      this.height = this.componentContent.height ? this.componentContent.height : '100%';
      this.setURL(this.componentContent.url);
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null) {
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              // get the assets directory path, e.g. /wise/curriculum/3/
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;
              var summernoteId = '';

              if (args.target == 'prompt') {
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      this.$mdDialog.hide();
    });

    /* TODO geoffreykwan we're listening to assetSelected twice?
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null) {
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              if (args.target == 'modelFile') {
                this.authoringComponentContent.url = fileName;
                this.authoringViewComponentChanged();
              }
            }
          }
        }
      }
      this.$mdDialog.hide();
    });
  }

  /**
   * Show the asset popup to allow the author to choose the model file
   */
  chooseModelFile() {
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'modelFile';
    this.$rootScope.$broadcast('openAssetChooser', params);
  }
}

EmbeddedAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$sce',
  '$timeout',
  '$window',
  'AnnotationService',
  'ConfigService',
  'EmbeddedService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default EmbeddedAuthoringController;
