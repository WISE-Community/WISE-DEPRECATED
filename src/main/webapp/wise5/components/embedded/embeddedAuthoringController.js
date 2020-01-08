'use strict';

import EmbeddedController from "./embeddedController";

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
      this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);
      this.setURL(this.componentContent.url);
    }.bind(this), true);
  }

  assetSelected(event, args) {
    if (this.isEventTargetThisComponent(args)) {
      const fileName = args.assetItem.fileName;
      if (args.target === 'rubric') {
        const summernoteId = this.getSummernoteId(args);
        this.restoreSummernoteCursorPosition(summernoteId);
        const fullAssetPath = this.getFullAssetPath(fileName);
        if (this.UtilService.isImage(fileName)) {
          this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      } else if (args.target === 'modelFile') {
        this.authoringComponentContent.url = fileName;
        this.authoringViewComponentChanged();
      }
    }
    this.$mdDialog.hide();
  }

  showModelFileChooserPopup() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'modelFile'
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  reloadModel() {
    const iframe = document.getElementById(this.embeddedApplicationIFrameId);
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
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
